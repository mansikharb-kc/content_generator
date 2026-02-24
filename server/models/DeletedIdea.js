const mongoose = require('mongoose');

const DeletedIdeaSchema = new mongoose.Schema({
    originalId: { type: String },
    content: { type: String, required: true },
    userId: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('DeletedIdea', DeletedIdeaSchema);
