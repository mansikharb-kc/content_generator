const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    url: { type: String, required: true },
    publicId: { type: String },
    localPath: { type: String },
    ideaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea', default: null },
    title: { type: String, default: '' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploaderName: { type: String, default: '' },
    storageProvider: { type: String, enum: ['local', 'cloudinary'], default: 'local' },
}, { timestamps: true });

module.exports = mongoose.model('Image', imageSchema);
