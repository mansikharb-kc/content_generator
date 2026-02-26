const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Idea = require('../models/Idea');
const DeletedIdea = require('../models/DeletedIdea');
const IdeaPlatformContent = require('../models/IdeaPlatformContent');
const { getAssistantResponse } = require('../utils/ai_assistant');
const { extractJson } = require('../utils/json_helper');
const checkRole = require('../middleware/role');


// ─────────────────────────────────────────────────────────────────────────────
// STATIC / NAMED ROUTES  (must be ABOVE any /:id wildcards)
// ─────────────────────────────────────────────────────────────────────────────

// GET all ideas for logged-in user
router.get('/', auth, async (req, res) => {
    try {
        console.log(`Fetching ideas for User ID: ${req.user.id}`);
        const ideas = await Idea.find({ userId: req.user.id }).sort({ createdAt: -1 });
        console.log(`Found ${ideas.length} ideas for user ${req.user.id}`);
        res.json(ideas);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// EXPORT Ideas + Social Media Prompts as CSV
router.get('/export-csv', auth, async (req, res) => {
    try {
        const ideas = await Idea.find({ userId: req.user.id }).sort({ createdAt: -1 });
        const platformContents = await IdeaPlatformContent.find({ userId: req.user.id });

        // Build a map: ideaId -> platformContent
        const pcMap = {};
        platformContents.forEach(pc => { pcMap[pc.ideaId.toString()] = pc; });

        const csvRows = [];
        csvRows.push([
            'ID', 'Idea Content',
            'Instagram Post', 'Instagram Image',
            'Facebook Post', 'Facebook Image',
            'Pinterest Post', 'Pinterest Image',
            'YouTube Post', 'YouTube Image',
            'LinkedIn Post', 'LinkedIn Image',
            'WhatsApp Post', 'WhatsApp Image',
            'Locked'
        ].join(','));

        const esc = (v) => `"${(v || '').toString().replace(/"/g, '""')}"`;

        ideas.forEach(idea => {
            const pc = pcMap[idea._id.toString()] || {};
            const row = [
                idea._id.toString(),
                esc(idea.content),
                esc(pc.instagram),
                esc(pc.instagram_image),
                esc(pc.facebook),
                esc(pc.facebook_image),
                esc(pc.pinterest),
                esc(pc.pinterest_image),
                esc(pc.youtube),
                esc(pc.youtube_image),
                esc(pc.linkedin),
                esc(pc.linkedin_image),
                esc(pc.whatsapp_community),
                esc(pc.whatsapp_image),
                idea.isLocked ? esc(`LOCKED: ${idea.lockedData || ''}`) : '""'
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=marketing_ideas_export.csv');
        res.status(200).send(csvString);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// GET Deleted Ideas
router.get('/deleted', auth, async (req, res) => {
    try {
        const deleted = await DeletedIdea.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(deleted);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Bulk Permanent Delete (ABOVE /permanent/:id)
router.delete('/permanent-all', auth, checkRole(['admin', 'marketing']), async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ msg: 'Invalid IDs provided' });
        }
        await DeletedIdea.deleteMany({ _id: { $in: ids }, userId: req.user.id });
        res.json({ msg: 'Selected ideas permanently removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Permanent Delete Single
router.delete('/permanent/:id', auth, async (req, res) => {
    try {
        const deletedIdea = await DeletedIdea.findById(req.params.id);
        if (!deletedIdea || deletedIdea.userId.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Idea not found' });
        }
        await deletedIdea.deleteOne();
        res.json({ msg: 'Idea permanently removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Restore Deleted Idea
router.post('/restore/:id', auth, async (req, res) => {
    try {
        const deletedIdea = await DeletedIdea.findById(req.params.id);
        if (!deletedIdea || deletedIdea.userId.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Idea not found' });
        }
        await Idea.create({ content: deletedIdea.content, userId: req.user.id });
        await deletedIdea.deleteOne();
        res.json({ msg: 'Idea restored' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

const IdeaBatch = require('../models/IdeaBatch');

// Generate Bulk Ideas
router.post('/generate', auth, async (req, res) => {
    try {
        const { count, personas, topic, feedback } = req.body;
        const generateCount = count || 10;
        const targetPersonas = (personas && personas.length > 0) ? personas : ['General Audience'];
        const personaStr = targetPersonas.join(', ');
        const mainIdea = topic ? topic.trim() : '';

        console.log(`[Generate] count=${generateCount} | personas=${personaStr} | topic="${mainIdea}" | user=${req.user.id}`);

        // Build the exact prompt as specified
        let prompt = `Create a series of ${generateCount} ideas on social media targeting these ${personaStr}. 
        Main topic is: ${mainIdea}.

        In addition to the specific ideas, provide a deep overview of the topic and strategic advice on how to execute this marketing campaign effectively.`;

        if (feedback) {
            prompt += `\n\nUSER FEEDBACK/REFINEMENT: The user has provided additional requirements: "${feedback}". Please adjust the ideas, overview, and strategy to align with this feedback while still following the original topic and personas.`;
        }

        prompt += `\n\nRules:
        - Return exactly ${generateCount} unique, creative and catchy social media post idea titles.
        - Each idea should be 1-2 sentences.
        - Respond ONLY with a valid JSON object in this exact format:
        {
          "topic_overview": "A detailed 3-4 sentence overview of the importance and potential of this topic for the target personas.",
          "strategic_advice": "3 specific, actionable tips for executing this campaign (e.g., best platforms, posting times, visual style).",
          "marketing_ideas": ["Idea 1", "Idea 2", ..., "Idea ${generateCount}"]
        }`;

        console.log(`[Generate] Prompt sent to OpenAI for batch generation`);

        const aiResponseText = await getAssistantResponse(prompt);
        const data = extractJson(aiResponseText);

        let generatedTexts = [];
        if (data && data.marketing_ideas && Array.isArray(data.marketing_ideas)) {
            generatedTexts = data.marketing_ideas;
        } else if (Array.isArray(data)) {
            generatedTexts = data;
        }

        if (generatedTexts.length === 0) {
            generatedTexts = [aiResponseText];
        }

        // 1. Save individual ideas
        const ideaIds = [];
        const newIdeas = [];
        for (const text of generatedTexts) {
            const idea = await Idea.create({ userId: req.user.id, content: text });
            ideaIds.push(idea._id);
            newIdeas.push(idea);
        }

        // 2. Save the batch grouping
        const advice = Array.isArray(data.strategic_advice)
            ? data.strategic_advice.join('\n\n')
            : (data.strategic_advice || '');

        const overview = Array.isArray(data.topic_overview)
            ? data.topic_overview.join('\n\n')
            : (data.topic_overview || '');

        const batch = await IdeaBatch.create({
            userId: req.user.id,
            topic: mainIdea,
            personas: targetPersonas,
            overview: overview,
            strategicAdvice: advice,
            feedback: feedback || '',
            ideas: ideaIds
        });

        // 3. Return the populated batch
        const populatedBatch = await IdeaBatch.findById(batch._id).populate('ideas');
        res.json(populatedBatch);
    } catch (err) {
        console.error('[Generate] ERROR:', err.message);
        res.status(500).json({ msg: err.message || 'Idea Generation Failed' });
    }
});


// Save Prompt (column-based)
router.post('/save-prompt', auth, async (req, res) => {
    const { ideaId, ideaContent, platform, promptText, postPrompt, captionPrompt, imagePrompt, uploadedImage } = req.body;
    const finalPost = promptText || postPrompt;
    const finalCaption = captionPrompt || '';
    const finalImage = imagePrompt || '';
    const finalUploadedImage = uploadedImage || '';

    const platformMap = {
        'Instagram': 'instagram',
        'Facebook': 'facebook',
        'Pinterest': 'pinterest',
        'YouTube': 'youtube',
        'LinkedIn': 'linkedin',
        'WhatsApp Community': 'whatsapp_community'
    };

    const fieldName = platformMap[platform];
    const captionFieldName = fieldName ? `${fieldName}_caption` : null;
    const imageFieldName = fieldName ? `${fieldName}_image` : null;
    const uploadFieldName = fieldName ? `${fieldName}_uploaded_image` : null;

    if (!fieldName) return res.status(400).json({ msg: 'Invalid platform' });

    try {
        let content = await IdeaPlatformContent.findOne({ ideaId });
        if (content) {
            content[fieldName] = finalPost;
            if (captionFieldName) content[captionFieldName] = finalCaption;
            if (imageFieldName) content[imageFieldName] = finalImage;
            if (uploadFieldName) content[uploadFieldName] = finalUploadedImage;
            await content.save();
        } else {
            content = await IdeaPlatformContent.create({
                ideaId,
                ideaContent,
                userId: req.user.id,
                [fieldName]: finalPost,
                [captionFieldName]: finalCaption,
                [imageFieldName]: finalImage,
                [uploadFieldName]: finalUploadedImage
            });
        }
        res.json({ msg: `${platform} strategy saved`, content });
    } catch (err) {
        console.error('Save Prompt Error:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});


// Persona-based Analysis
router.post('/analyze', auth, checkRole(['admin', 'marketing']), async (req, res) => {
    const { personas } = req.body;
    if (!personas || !Array.isArray(personas) || personas.length === 0) {
        return res.status(400).json({ msg: 'At least one persona is required' });
    }
    try {
        const timestamp = new Date().toLocaleTimeString();
        const prompt = `Analyze an architectural catalogue platform for the following target personas: "${personas.join(', ')}".

        Modification Rules for Persona:
        1. Brand → marketing tone, promotional, engaging, professional.
        2. Student → simple language, easy to understand, beginner friendly.
        3. Architect → technical, structured, professional design explanation.
        4. Interior Designer → creative, aesthetic, stylish, visual description.

        Return ONLY a JSON object with these exact keys:
        {
          "overview": { "industry": "string", "category": "string", "positioning": "string", "strength": "string" },
          "mindset": "string",
          "analysis": "string",
          "benefits": ["string"],
          "useCases": ["string"],
          "whatsappContent": "string",
          "posts": ["string"],
          "strategy": "string"
        }`;

        const aiResponseText = await getAssistantResponse(prompt);
        const aiResult = extractJson(aiResponseText);

        const result = { ...aiResult, personas, generatedAt: timestamp };

        const idea = await Idea.create({
            userId: req.user.id,
            content: `PLATFORM ANALYSIS: For ${personas.join(', ')} - ${JSON.stringify(result)}`
        });

        res.json({ ...result, id: idea._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Intelligence Analysis Failed', error: err.message });
    }
});

// Generate Platform-Specific Prompts
router.post('/generate-prompts', auth, async (req, res) => {
    const { platform, concept, targetField, feedback } = req.body;
    if (!platform || !concept) {
        return res.status(400).json({ msg: 'Platform and concept are required' });
    }
    try {
        let fieldSelectionPrompt = `Split your response into:
        1. postText: The primary content of the post (e.g., the text on a graphic or the main body).
        2. captionText: A compelling social media caption including relevant hashtags.
        3. imageText: A direct descriptive prompt for an AI image generator (Midjourney/DALL-E).`;

        if (targetField) {
            fieldSelectionPrompt = `The user wants to REGENERATE ONLY the "${targetField}". 
            Please provide a fresh, creative, and different version of the "${targetField}" than what might have been generated before.
            You must still return the full JSON object with all three keys, but you can leave the other two fields as empty strings or provide consistent versions of them.
            Focus your creative energy on making the "${targetField}" exceptional.`;
        }

        let feedbackPrompt = '';
        if (feedback) {
            feedbackPrompt = `\n\nUSER FEEDBACK / REFINEMENT: The user has requested these specific adjustments: "${feedback}". Please ensure the generated content strictly follows this feedback while maintaining the overall concept.`;
        }

        const prompt = `Based on the following concept: "${concept}", generate a high-engagement post for ${platform}.${feedbackPrompt}
        
        ${fieldSelectionPrompt}

        Rules:
        - postText: The main creative message.
        - captionText: Engaging caption with 3-5 hashtags.
        - imageText: Provide ONLY the direct descriptive prompt. Do NOT include any prefixes like "Image prompt:".

        Return ONLY a JSON object in this format:
        {
          "postText": "string",
          "captionText": "string",
          "imageText": "string"
        }`;

        const aiResponseText = await getAssistantResponse(prompt);
        const aiResult = extractJson(aiResponseText);
        res.json(aiResult);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Prompt Generation Failed', error: err.message });
    }
});

// GET single batch by ID
router.get('/batch/:id', auth, async (req, res) => {
    try {
        const batch = await IdeaBatch.findById(req.params.id).populate('ideas');
        if (!batch || batch.userId.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Batch not found' });
        }
        res.json(batch);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// GET all batches for user
router.get('/batches', auth, async (req, res) => {
    try {
        const batches = await IdeaBatch.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(batches);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// DELETE batch by ID
router.delete('/batch/:id', auth, async (req, res) => {
    try {
        const batch = await IdeaBatch.findById(req.params.id);
        if (!batch || batch.userId.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Batch not found' });
        }
        await batch.deleteOne();
        res.json({ msg: 'Batch removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// GET all locked ideas for user
router.get('/locked', auth, async (req, res) => {
    try {
        const ideas = await Idea.find({ userId: req.user.id, isLocked: true }).sort({ createdAt: -1 });
        res.json(ideas);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// WILDCARD ROUTES  (must be LAST)
// ─────────────────────────────────────────────────────────────────────────────

// GET single idea by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const idea = await Idea.findById(req.params.id);
        if (!idea || idea.userId.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Idea not found' });
        }
        res.json(idea);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Toggle Lock
router.put('/:id/lock', auth, async (req, res) => {
    try {
        const { isLocked, lockedData } = req.body;
        console.log(`[Lock] Attempting to ${isLocked ? 'lock' : 'unlock'} idea ${req.params.id} for user ${req.user.id}`);

        const idea = await Idea.findById(req.params.id);
        if (!idea) {
            console.log(`[Lock] Idea ${req.params.id} not found`);
            return res.status(404).json({ msg: 'Idea not found' });
        }

        console.log(`[Lock] Idea owner: ${idea.userId}, Requester: ${req.user.id}`);

        const isOwner = idea.userId.toString() === req.user.id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            console.log(`[Lock] Unauthorized: Owner mismatch. Idea owner: ${idea.userId}, Requester: ${req.user.id}`);
            return res.status(401).json({ msg: 'Not authorized to lock this idea' });
        }

        idea.isLocked = isLocked;
        idea.lockedData = isLocked ? JSON.stringify(lockedData) : null;
        await idea.save();

        console.log(`[Lock] Success for ${req.params.id}`);
        res.json(idea);
    } catch (err) {
        console.error('[Lock] ERROR:', err);
        res.status(500).send('Server Error');
    }
});

// Archive Delete (move to Recycle Bin)
router.delete('/:id', auth, async (req, res) => {
    try {
        const idea = await Idea.findById(req.params.id);
        if (!idea) return res.status(404).json({ msg: 'Idea not found' });
        if (idea.userId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        await DeletedIdea.create({
            originalId: idea._id.toString(),
            content: idea.content,
            userId: req.user.id
        });
        await idea.deleteOne();
        res.json({ msg: 'Idea moved to recycle bin' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
