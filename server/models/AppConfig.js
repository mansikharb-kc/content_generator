const mongoose = require('mongoose');

const appConfigSchema = new mongoose.Schema({
    openAiKey: { type: String, default: '' },
    openAiAssistantId: { type: String, default: '' },
    openAiModel: { type: String, default: 'gpt-4o-mini' },
    cloudinaryCloudName: { type: String, default: '' },
    cloudinaryApiKey: { type: String, default: '' },
    cloudinaryApiSecret: { type: String, default: '' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('AppConfig', appConfigSchema);
