const mongoose = require('mongoose');

const IdeaPlatformContentSchema = new mongoose.Schema({
    ideaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea', required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ideaContent: { type: String },
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    pinterest: { type: String, default: '' },
    youtube: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    whatsapp_community: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('IdeaPlatformContent', IdeaPlatformContentSchema);
