const mongoose = require('mongoose');

const MasterPromptSchema = new mongoose.Schema({
    basePrompt: { type: String, required: true },
    baseImagePrompt: { type: String, required: true },
    personaNotes: { type: Map, of: String, default: {} },
    personaImageNotes: { type: Map, of: String, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('MasterPrompt', MasterPromptSchema);
