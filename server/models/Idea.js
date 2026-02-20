const mongoose = require('mongoose');

const IdeaSchema = new mongoose.Schema({
    content: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isLocked: { type: Boolean, default: false },
    lockedData: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Idea', IdeaSchema);
