// API VERSION (Diagnostic)
const API_VERSION = 'v1.1.1-LOCK-SYSTEM';
console.log(`[STARTUP] Content Generator API ${API_VERSION}`);

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/database');
const Idea = require('./models/Idea');
const IdeaBatch = require('./models/IdeaBatch');
const MasterPrompt = require('./models/MasterPrompt');
const Image = require('./models/Image');
const IdeaPlatformContent = require('./models/IdeaPlatformContent');
const { getAssistantResponse } = require('./utils/ai_assistant');
const { extractJson } = require('./utils/json_helper');
const { buildPersonaPrompt, mapPersonaNotes } = require('./utils/prompt_builder');
const auth = require('./middleware/auth');

const app = express();

// Health check with version
app.get('/api/health', (req, res) => res.json({
    status: 'online',
    version: API_VERSION,
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
}));

// Middleware
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174',
            'http://localhost:5175',
            'http://127.0.0.1:5175',
            'http://localhost:3000',
            process.env.CORS_ORIGIN
        ].filter(Boolean);

        // Allow requests with no origin (like mobile apps or curl)
        // Or any localhost/127.0.0.1 for development ease
        if (!origin ||
            allowedOrigins.includes(origin) ||
            origin.startsWith('http://localhost') ||
            origin.startsWith('http://127.0.0.1') ||
            origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health check
app.get('/', (req, res) => res.json({
    status: 'API running',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
}));

// EMERGENCY OVERRIDE
app.post('/api/ideas/refine-title/:id', (req, res) => {
    console.log(`[EMERGENCY ROUTE] Caught refine-title for: ${req.params.id}`);
    res.json({ msg: 'EMERGENCY_OVERRIDE_ACTIVE', id: req.params.id });
});

// V2 EMERGENCY BYPASS (REAL LOGIC)
app.post('/api/v2-refine/:id', auth, async (req, res) => {
    try {
        console.log(`[V2 BYPASS] Refine request for: ${req.params.id}`);
        const { note, targetPersona, companyContext, contentGoal } = req.body;
        const idea = await Idea.findById(req.params.id);

        if (!idea) return res.status(404).json({ msg: 'Idea not found' });
        if (idea.userId.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });

        // LOCK CHECK
        if (idea.isLocked) {
            return res.status(400).json({ msg: 'Idea is locked and cannot be refined.' });
        }

        const batch = await IdeaBatch.findOne({ ideas: idea._id });
        const persona = targetPersona || batch?.personas?.[0] || 'General Audience';
        const context = companyContext || batch?.topic || 'Knowledge Center';
        const goal = contentGoal || note || 'Optimize for maximum engagement';

        const globalEx = await Image.find({ ideaId: null }).sort({ createdAt: -1 }).limit(5);
        const exampleLine = globalEx.length > 0
            ? `\nKNOWLEDGE CENTER REFERENCE EXAMPLES (Model the refined idea after these styles):\n${globalEx.map(ex => `- ${ex.title}`).join('\n')}\n`
            : '';

        const prompt = `You are a world-class AI Content Strategist. Your mission is to transform a basic marketing idea into a high-impact, future-focused "Core Idea" and a deep Strategic Analysis.
        
        CRITICAL SHIFT: 
        - DO NOT focus on "problems," "pain points," or "goals."
        - INSTEAD, focus on "potential," "growth," "value," and "transformation."
        - Highlight what is possible, not what is wrong.

        ${exampleLine}

        INPUT DATA:
        - MAIN TOPIC / PRIMARY IDEA: "${context}"
        - TARGET PERSONA: ${persona}
        - SELECTED IDEA: "${idea.content}"
        - USER FEEDBACK: "${note || 'None'}"

        ANALYSIS FACTORS (Examine these 6 factors specifically):
        1. Topic Context – Deep industry and thematic context.
        2. Audience Identity – Their professional mindset and aspirations.
        3. Future Outcomes – The specific success they want to achieve.
        4. Portfolio or Results Value – Credibility and the value of high-end outcomes.
        5. Opportunities and Growth – New possibilities and professional expansion.
        6. Transformation – How they evolve or level up through this idea.

        INSTRUCTIONS:
        1. STRONGLY ALIGN with the "MAIN TOPIC" provided above.
        2. Use the 6 Analysis Factors to evolve the Selected Idea.
        3. Generate a refined "Core Idea" that is aspirational and authoritative.
        4. Provide a "Strategic Analysis" explaining the psychological and growth value of this idea.
        
        REQUIRED OUTPUT FORMAT (JSON):
        {
          "core_idea": "The refined title here",
          "strategic_analysis": "The strategic analysis here"
        }`;

        console.log(`[V2 BYPASS] Sending prompt to AI for idea: ${idea._id}`);
        const aiResponseText = await getAssistantResponse(prompt);
        console.log(`[V2 BYPASS] AI Response received`);

        const data = extractJson(aiResponseText);

        let refinedTitle = data.core_idea || data.refined_title || data.content || "Refined Core Idea";
        let analysis = data.strategic_analysis || data.analysis || "Strategic transformation focused on growth.";

        // Ensure they are strings (sometimes AI outputs objects for nested analysis)
        if (typeof refinedTitle !== 'string') refinedTitle = JSON.stringify(refinedTitle);
        if (typeof analysis !== 'string') analysis = JSON.stringify(analysis);

        // Update BOTH content and refinedContent so the UI reflects the change immediately
        idea.refinedContent = refinedTitle.trim().replace(/^"|"$/g, '');
        idea.content = idea.refinedContent;
        idea.analysis = analysis.trim();

        await idea.save();

        res.json(idea);
    } catch (err) {
        console.error('[V2 BYPASS] CRITICAL Error:', err);
        require('fs').appendFileSync(require('path').join(__dirname, 'error_log.txt'), `${new Date().toISOString()} - V2-REFINE ERROR: ${err.message}\nStack: ${err.stack}\n`);
        res.status(500).json({ msg: 'Refine failed', error: err.message });
    }
});

// V2 CONTENT GENERATION BYPASS
app.post('/api/v2-content/:id', auth, async (req, res) => {
    try {
        console.log(`[V2 CONTENT] Generation for: ${req.params.id}`);
        const idea = await Idea.findById(req.params.id);
        if (!idea) return res.status(404).json({ msg: 'Idea not found' });

        // GLOBAL LOCK CHECK
        if (idea.isLocked) {
            console.log(`[V2 CONTENT] BLOCKED - Global Strategy is locked.`);
            return res.status(400).json({ msg: 'This strategy is locked. Please unlock it to regenerate content.' });
        }

        const platform = req.body.platform || 'Instagram';

        // LOCK CHECK
        const existingContent = await IdeaPlatformContent.findOne({ ideaId: req.params.id });
        if (existingContent && existingContent.lockedPlatforms && existingContent.lockedPlatforms.includes(platform)) {
            console.log(`[V2 CONTENT] BLOCKED - Platform ${platform} is locked.`);
            return res.status(400).json({ msg: `This platform (${platform}) is locked and cannot be regenerated.` });
        }

        const batch = await IdeaBatch.findOne({ ideas: idea._id, userId: req.user.id });
        const persona = req.body.persona || batch?.personas?.[0] || 'General Audience';

        const uploadedImages = await Image.find({ ideaId: idea._id });
        const imageUrls = uploadedImages.map(img => img.url);

        const globalEx = await Image.find({ ideaId: null }).sort({ createdAt: -1 }).limit(5);
        const exampleIdeas = globalEx.map(img => ({ title: img.title, url: img.url }));

        let promptDoc = await MasterPrompt.findOne();
        const prompt = buildPersonaPrompt({
            persona,
            topic: idea.refinedContent || idea.content,
            analysis: idea.analysis || '',
            refinement: req.body.note || '',
            basePromptText: promptDoc?.basePrompt || '',
            personaNotes: promptDoc?.personaNotes ? Object.fromEntries(promptDoc.personaNotes) : {},
            platform,
            previousContent: req.body.previousContent || null,
            imageUrls,
            exampleIdeas
        });

        const aiResponseText = await getAssistantResponse(prompt);
        const aiData = extractJson(aiResponseText);
        res.json({ persona, ...aiData });
    } catch (err) {
        console.error('[V2 CONTENT] Error:', err);
        res.status(500).json({ msg: 'Content failed', error: err.message });
    }
});

// V2 SAVE BYPASS
app.post('/api/v2-save', auth, async (req, res) => {
    try {
        const { ideaId, platform, promptText, captionPrompt, imagePrompt } = req.body;
        const platformMap = {
            'Instagram': 'instagram', 'Facebook': 'facebook', 'Pinterest': 'pinterest',
            'YouTube': 'youtube', 'LinkedIn': 'linkedin', 'WhatsApp Community': 'whatsapp_community',
            'WhatsApp': 'whatsapp_community'
        };
        const field = platformMap[platform];
        if (!field) return res.status(400).json({ msg: 'Invalid platform' });

        let content = await IdeaPlatformContent.findOne({ ideaId });

        // LOCK CHECK
        if (content && content.lockedPlatforms && content.lockedPlatforms.includes(platform)) {
            return res.status(400).json({ msg: `This platform (${platform}) is locked and cannot be edited.` });
        }

        if (content) {
            content[field] = promptText;
            content[`${field}_caption`] = captionPrompt;
            content[`${field}_image`] = imagePrompt;
            await content.save();
        } else {
            await IdeaPlatformContent.create({
                ideaId, userId: req.user.id,
                [field]: promptText,
                [`${field}_caption`]: captionPrompt,
                [`${field}_image`]: imagePrompt
            });
        }
        res.json({ msg: 'Saved' });
    } catch (err) {
        res.status(500).json({ msg: 'Save failed', error: err.message });
    }
});

// V2 UNLOCK ALL - Master unlock for both idea and all platforms
app.post('/api/v2-unlock-all/:id', auth, async (req, res) => {
    try {
        const ideaId = req.params.id;

        // 1. Unlock global strategy
        const idea = await Idea.findById(ideaId);
        if (idea) {
            idea.isLocked = false;
            await idea.save();
        }

        // 2. Unlock all platforms for this idea
        const content = await IdeaPlatformContent.findOne({ ideaId });
        if (content) {
            content.lockedPlatforms = [];
            await content.save();
        }

        res.json({ msg: 'All locks cleared for this idea' });
    } catch (err) {
        console.error('[V2 UNLOCK ALL] ERROR:', err);
        res.status(500).json({ msg: 'Unlock all failed', error: err.message });
    }
});

// V2 TOGGLE LOCK BYPASS
app.post('/api/v2-toggle-lock', auth, async (req, res) => {
    try {
        const { ideaId, platform } = req.body;
        // Normalize platform names if needed
        const plat = platform === 'WhatsApp Community' ? 'WhatsApp' : platform;

        let content = await IdeaPlatformContent.findOne({ ideaId });
        if (!content) {
            content = await IdeaPlatformContent.create({
                ideaId,
                userId: req.user.id,
                lockedPlatforms: [plat]
            });
            return res.json({ lockedPlatforms: content.lockedPlatforms });
        }

        if (!content.lockedPlatforms) content.lockedPlatforms = [];
        const index = content.lockedPlatforms.indexOf(plat);
        if (index > -1) {
            content.lockedPlatforms.splice(index, 1);
        } else {
            content.lockedPlatforms.push(plat);
        }
        await content.save();
        res.json({ lockedPlatforms: content.lockedPlatforms });
    } catch (err) {
        res.status(500).json({ msg: 'Lock toggle failed', error: err.message });
    }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ideas', require('./routes/ideas'));
app.use('/api/images', require('./routes/images'));
app.use('/api/config', require('./routes/config')); // Added admin settings route

// Root diagnostic
app.get('/api/router-health', (req, res) => res.json({
    msg: 'Server Router Health OK',
    timestamp: new Date().toISOString()
}));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route Inspector (Diagnostic)
const listRoutes = (app) => {
    try {
        const routes = [];
        if (!app._router || !app._router.stack) {
            console.log('--- ROUTE INSPECTOR: _router not available yet ---');
            return;
        }
        app._router.stack.forEach((middleware) => {
            if (middleware.route) {
                routes.push(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
            } else if (middleware.name === 'router' && middleware.handle.stack) {
                middleware.handle.stack.forEach((handler) => {
                    if (handler.route) {
                        const path = middleware.regexp.source.replace('\\/?(?=\\/|$)', '').replace('^', '').replace('\\', '') + handler.route.path;
                        routes.push(`${Object.keys(handler.route.methods).join(',').toUpperCase()} ${path}`);
                    }
                });
            }
        });
        console.log('--- REGISTERED ROUTES ---');
        routes.sort().forEach(r => console.log(r));
        console.log('-------------------------');
    } catch (e) {
        console.log('--- ROUTE INSPECTOR FAILED ---', e.message);
    }
};
setTimeout(() => listRoutes(app), 5000);


// MongoDB connection
connectDB().catch(err => {
    console.error('Initial MongoDB Connection Failed. Server will keep running but DB requests will fail.');
});

// Start server
const PORT = process.env.PORT || 8080;
// In serverless (Vercel), app.listen is ignored, but we MUST call it for Render/Docker.
// We skip it only if we're specifically being run as a Vercel function.
if (!process.env.VERCEL) {
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Server running on port ${PORT}`);
    });

    // Increase timeouts for long-running AI requests
    server.keepAliveTimeout = 120 * 1000;
    server.headersTimeout = 125 * 1000;
}

// Export for serverless compatibility
module.exports = app;
