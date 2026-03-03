const mongoose = require('mongoose');

const IdeaPlatformContentSchema = new mongoose.Schema({
    ideaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea', required: true, unique: true },
    userId: { type: String, required: true },
    ideaContent: { type: String },
    instagram: { type: String, default: '' },
    instagram_caption: { type: String, default: '' },
    instagram_image: { type: String, default: '' },
    instagram_uploaded_image: { type: String, default: '' },
    facebook: { type: String, default: '' },
    facebook_caption: { type: String, default: '' },
    facebook_image: { type: String, default: '' },
    facebook_uploaded_image: { type: String, default: '' },
    pinterest: { type: String, default: '' },
    pinterest_caption: { type: String, default: '' },
    pinterest_image: { type: String, default: '' },
    pinterest_uploaded_image: { type: String, default: '' },
    youtube: { type: String, default: '' },
    youtube_caption: { type: String, default: '' },
    youtube_image: { type: String, default: '' },
    youtube_uploaded_image: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    linkedin_caption: { type: String, default: '' },
    linkedin_image: { type: String, default: '' },
    linkedin_uploaded_image: { type: String, default: '' },
    whatsapp_community: { type: String, default: '' },
    whatsapp_caption: { type: String, default: '' },
    whatsapp_image: { type: String, default: '' },
    whatsapp_uploaded_image: { type: String, default: '' },
    lockedPlatforms: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('IdeaPlatformContent', IdeaPlatformContentSchema);
