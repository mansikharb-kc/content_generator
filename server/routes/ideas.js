const express = require('express');
const Idea = require('../models/Idea');
const User = require('../models/User');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAssistantResponse } = require('../utils/ai_assistant');
const DeletedIdea = require('../models/DeletedIdea');
const IdeaPlatformContent = require('../models/IdeaPlatformContent');


// ─────────────────────────────────────────────────────────────────────────────
// STATIC / NAMED ROUTES  (must be ABOVE any /:id wildcards)
// ─────────────────────────────────────────────────────────────────────────────

// GET all ideas
router.get('/', auth, async (req, res) => {
    try {
        const ideas = await Idea.findAll({
            where: { UserId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(ideas);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// EXPORT Ideas + Social Media Prompts as CSV
router.get('/export-csv', auth, async (req, res) => {
    try {
        const ideas = await Idea.findAll({
            where: { UserId: req.user.id },
            include: [{ model: IdeaPlatformContent }]
        });

        const csvRows = [];
        csvRows.push([
            'ID', 'Idea Content',
            'Instagram', 'Facebook', 'Pinterest',
            'YouTube', 'LinkedIn', 'WhatsApp',
            'Locked'
        ].join(','));

        ideas.forEach(idea => {
            const pc = idea.IdeaPlatformContent || {};
            const esc = (v) => `"${(v || '').replace(/"/g, '""')}"`;
            const row = [
                idea.id,
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
        const deleted = await DeletedIdea.findAll({
            where: { UserId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
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
        await DeletedIdea.destroy({
            where: { id: ids, UserId: req.user.id }
        });
        res.json({ msg: 'Selected ideas permanently removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Permanent Delete Single
router.delete('/permanent/:id', auth, async (req, res) => {
    try {
        const deletedIdea = await DeletedIdea.findByPk(req.params.id);
        if (!deletedIdea || deletedIdea.UserId !== req.user.id) {
            return res.status(404).json({ msg: 'Idea not found' });
        }
        await deletedIdea.destroy();
        res.json({ msg: 'Idea permanently removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Restore Deleted Idea
router.post('/restore/:id', auth, async (req, res) => {
    try {
        const deletedIdea = await DeletedIdea.findByPk(req.params.id);
        if (!deletedIdea || deletedIdea.UserId !== req.user.id) {
            return res.status(404).json({ msg: 'Idea not found' });
        }
        await Idea.create({ content: deletedIdea.content, UserId: req.user.id });
        await deletedIdea.destroy();
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
            if (!Array.isArray(generatedTexts)) {
                generatedTexts = [aiResponseText];
            }
        } catch (parseError) {
            console.error("Failed to parse AI response for bulk ideas:", aiResponseText);
            generatedTexts = aiResponseText.split('\n').filter(line => line.trim().length > 0).slice(0, generateCount);
        }

        const newIdeas = [];
        for (const text of generatedTexts) {
            const idea = await Idea.create({ UserId: req.user.id, content: text });
            newIdeas.push(idea);
        }

        res.json(newIdeas);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Idea Generation Failed', error: err.message });
    }
});

// Save Prompt (Column-based)
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

    const columnName = platformMap[platform];
    if (!columnName) return res.status(400).json({ msg: 'Invalid platform' });

    try {
        let content = await IdeaPlatformContent.findOne({ where: { idea_id: ideaId } });
        if (content) {
            content[columnName] = finalPrompt;
            await content.save();
        } else {
            content = await IdeaPlatformContent.create({
                idea_id: ideaId,
                ideaContent,
                [columnName]: finalPrompt,
                UserId: req.user.id
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

        Return ONLY a JSON object with the following exact keys:
        {
          "overview": {
            "industry": "string",
            "category": "string",
            "positioning": "string",
            "strength": "string"
          },
          "mindset": "string (a deep description following the persona rules)",
          "analysis": "string (how the brand fits the persona)",
          "benefits": ["string (3-4 points)"],
          "useCases": ["string (3-4 business scenarios)"],
          "whatsappContent": "string (a concise message following rules)",
          "posts": ["string (3 creative social media post ideas following rules)"],
          "strategy": "string (a strategic recommendation following rules)"
        }`;

        const aiResponseText = await getAssistantResponse(prompt);
        console.log("Raw AI Response:", aiResponseText);

        let aiResult;
        try {
            const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
            const cleanJson = jsonMatch ? jsonMatch[0] : aiResponseText.trim();
            aiResult = JSON.parse(cleanJson);
        } catch (parseError) {
            console.error("Failed to parse AI response. Raw text:", aiResponseText);
            throw new Error("AI Assistant response format error. Please try again.");
        }

        const result = { ...aiResult, personas, generatedAt: timestamp };

        const idea = await Idea.create({
            UserId: req.user.id,
            content: `PLATFORM ANALYSIS: For ${personas.join(', ')} - ${JSON.stringify(result)}`
        });

        res.json({ ...result, id: idea.id });
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
          "postText": "string (the actual social media post)",
          "imageText": "string (a descriptive prompt for an AI image generator like Midjourney)"
        }`;

        const aiResponseText = await getAssistantResponse(prompt);

        let aiResult;
        try {
            const cleanJson = aiResponseText.replace(/```json|```/g, '').trim();
            aiResult = JSON.parse(cleanJson);
        } catch (parseError) {
            console.error("Failed to parse AI response:", aiResponseText);
            throw new Error("AI Assistant returned invalid format for prompts");
        }

        res.json(aiResult);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Prompt Generation Failed', error: err.message });
    }
});


// ─────────────────────────────────────────────────────────────────────────────
// WILDCARD ROUTES  (must be LAST)
// ─────────────────────────────────────────────────────────────────────────────

// Get Single Idea by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const idea = await Idea.findByPk(req.params.id);
        if (!idea || idea.UserId !== req.user.id) {
            return res.status(404).json({ msg: 'Idea not found' });
        }
        res.json(idea);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Toggle Lock Idea
router.put('/:id/lock', auth, async (req, res) => {
    try {
        const { isLocked, lockedData } = req.body;
        const idea = await Idea.findByPk(req.params.id);

        if (!idea || idea.UserId !== req.user.id) {
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

// Archive Delete — move to Recycle Bin
router.delete('/:id', auth, async (req, res) => {
    try {
        const idea = await Idea.findByPk(req.params.id);
        if (!idea) return res.status(404).json({ msg: 'Idea not found' });

        if (idea.UserId !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await DeletedIdea.create({
            originalId: idea.id,
            content: idea.content,
            UserId: req.user.id
        });

        await idea.destroy();
        res.json({ msg: 'Idea moved to recycle bin' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
