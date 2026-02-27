const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const jwt = require('jsonwebtoken');
const Image = require('../models/Image');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer + Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'image_store',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Auth middleware
function auth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ msg: 'No token' });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ msg: 'Invalid token' });
    }
}

// POST /api/images/upload
router.post('/upload', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

        const image = new Image({
            url: req.file.path,
            publicId: req.file.filename,
            title: req.body.title || '',
            uploadedBy: req.user.id,
            uploaderName: req.user.name || req.user.email || '',
        });

        await image.save();
        res.json(image);
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ msg: 'Upload failed', error: err.message });
    }
});

// GET /api/images — fetch all images (newest first)
router.get('/', auth, async (req, res) => {
    try {
        const images = await Image.find().sort({ createdAt: -1 });
        res.json(images);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to fetch images' });
    }
});

// DELETE /api/images/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        if (!image) return res.status(404).json({ msg: 'Image not found' });

        // Only admin or uploader can delete
        if (req.user.role !== 'admin' && String(image.uploadedBy) !== String(req.user.id)) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        await cloudinary.uploader.destroy(image.publicId);
        await image.deleteOne();
        res.json({ msg: 'Image deleted' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ msg: 'Delete failed', error: err.message });
    }
});

module.exports = router;
