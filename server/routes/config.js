const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/role');
const AppConfig = require('../models/AppConfig');

// Utility to find or create the singleton config record
const ensureConfig = async () => {
    let config = await AppConfig.findOne();
    if (!config) {
        config = await AppConfig.create({
            openAiKey: process.env.OPENAI_API_KEY || '',
            openAiAssistantId: process.env.OPENAI_ASSISTANT_ID || '',
            openAiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
            cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
            cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || ''
        });
    }
    return config;
};

// GET /api/config - Only Admin
router.get('/', auth, checkRole(['admin']), async (req, res) => {
    try {
        const config = await ensureConfig();
        res.json(config);
    } catch (err) {
        console.error('Config fetch failed:', err);
        res.status(500).json({ msg: 'Failed to fetch config' });
    }
});

// PUT /api/config - Only Admin
router.put('/', auth, checkRole(['admin']), async (req, res) => {
    try {
        const { openAiKey, openAiAssistantId, openAiModel, cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret } = req.body;
        let config = await ensureConfig();

        if (openAiKey !== undefined) config.openAiKey = openAiKey;
        if (openAiAssistantId !== undefined) config.openAiAssistantId = openAiAssistantId;
        if (openAiModel !== undefined) config.openAiModel = openAiModel;
        if (cloudinaryCloudName !== undefined) config.cloudinaryCloudName = cloudinaryCloudName;
        if (cloudinaryApiKey !== undefined) config.cloudinaryApiKey = cloudinaryApiKey;
        if (cloudinaryApiSecret !== undefined) config.cloudinaryApiSecret = cloudinaryApiSecret;

        config.updatedBy = req.user.id;
        await config.save();

        res.json({ msg: 'Configuration updated successfully', config });
    } catch (err) {
        console.error('Config update failed:', err);
        res.status(500).json({ msg: 'Failed to update config' });
    }
});

module.exports = router;
