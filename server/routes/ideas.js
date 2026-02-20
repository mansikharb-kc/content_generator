const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Idea = require('../models/Idea');
const DeletedIdea = require('../models/DeletedIdea');
const IdeaPlatformContent = require('../models/IdeaPlatformContent');
const { getAssistantResponse } = require('../utils/ai_assistant');


// ─────────────────────────────────────────────────────────────────────────────
// STATIC / NAMED ROUTES  (must be ABOVE any /:id wildcards)
// ─────────────────────────────────────────────────────────────────────────────

// GET all ideas for logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const ideas = await Idea.find({ userId: req.user.id }).sort({ createdAt: -1 });
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
            'Instagram', 'Facebook', 'Pinterest',
            'YouTube', 'LinkedIn', 'WhatsApp',
            'Locked'
        ].join(','));

        const esc = (v) => `"${(v || '').replace(/"/g, '""')}"`;

        ideas.forEach(idea => {
            const pc = pcMap[idea._id.toString()] || {};
            const row = [
                idea._id.toString(),
                esc(idea.content),
                esc(pc.instagram),
                esc(pc.facebook),
                esc(pc.pinterest),
                esc(pc.youtube),
                esc(pc.linkedin),
                esc(pc.whatsapp_community),
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
router.delete('/permanent-all', auth, async (req, res) => {
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

// Generate Bulk Ideas
router.post('/generate', auth, async (req, res) => {
    try {
        const { count } = req.body;
        const generateCount = count || 5;

        const prompt = `Generate ${generateCount} unique and creative marketing ideas for an architectural catalogue platform.
        Focus on luxury, sustainability, and innovation.
        Return ONLY a JSON array of strings. Example: ["Idea 1", "Idea 2"]`;

        const aiResponseText = await getAssistantResponse(prompt);

        let generatedTexts;
        try {
            const cleanJson = aiResponseText.replace(/```json|```/g, '').trim();
            generatedTexts = JSON.parse(cleanJson);
            if (!Array.isArray(generatedTexts)) generatedTexts = [aiResponseText];
        } catch {
            generatedTexts = aiResponseText.split('\n').filter(l => l.trim()).slice(0, generateCount);
        }

        const newIdeas = [];
        for (const text of generatedTexts) {
            const idea = await Idea.create({ userId: req.user.id, content: text });
            newIdeas.push(idea);
        }
        res.json(newIdeas);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Idea Generation Failed', error: err.message });
    }
});

// Save Prompt (column-based)
router.post('/save-prompt', auth, async (req, res) => {
    const { ideaId, ideaContent, platform, promptText, postPrompt } = req.body;
    const finalPrompt = promptText || postPrompt;

    const platformMap = {
        'Instagram': 'instagram',
        'Facebook': 'facebook',
        'Pinterest': 'pinterest',
        'YouTube': 'youtube',
        'LinkedIn': 'linkedin',
        'WhatsApp Community': 'whatsapp_community'
    };

    const fieldName = platformMap[platform];
    if (!fieldName) return res.status(400).json({ msg: 'Invalid platform' });

    try {
        let content = await IdeaPlatformContent.findOne({ ideaId });
        if (content) {
            content[fieldName] = finalPrompt;
            await content.save();
        } else {
            content = await IdeaPlatformContent.create({
                ideaId,
                ideaContent,
                userId: req.user.id,
                [fieldName]: finalPrompt
            });
        }
        res.json({ msg: `${platform} strategy saved`, content });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Persona-based Analysis
router.post('/analyze', auth, async (req, res) => {
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
        const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : aiResponseText.trim();
        const aiResult = JSON.parse(cleanJson);

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
    const { platform, concept } = req.body;
    if (!platform || !concept) {
        return res.status(400).json({ msg: 'Platform and concept are required' });
    }
    try {
        const prompt = `Based on the following concept: "${concept}", generate a high-engagement post for ${platform} and a corresponding AI image prompt.
        Return ONLY a JSON object:
        {
          "postText": "string",
          "imageText": "string"
        }`;

        const aiResponseText = await getAssistantResponse(prompt);
        const cleanJson = aiResponseText.replace(/```json|```/g, '').trim();
        const aiResult = JSON.parse(cleanJson);
        res.json(aiResult);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Prompt Generation Failed', error: err.message });
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
        const idea = await Idea.findById(req.params.id);
        if (!idea || idea.userId.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Idea not found' });
        }
        idea.isLocked = isLocked;
        idea.lockedData = isLocked ? JSON.stringify(lockedData) : null;
        await idea.save();
        res.json(idea);
    } catch (err) {
        console.error(err);
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
