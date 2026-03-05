const mongoose = require('mongoose');

const IdeaSchema = new mongoose.Schema({
    content: { type: String, required: true },
    analysis: { type: String, default: '' },
    userId: { type: String, required: true },
    isLocked: { type: Boolean, default: false },
    lockedData: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Idea', IdeaSchema);
