const mongoose = require('mongoose');

const IdeaBatchSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    topic: { type: String, required: true },
    personas: [{ type: String }],
    overview: { type: String },
    strategicAdvice: { type: String },
    feedback: { type: String },
    ideas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Idea' }]
}, { timestamps: true });

module.exports = mongoose.model('IdeaBatch', IdeaBatchSchema);
