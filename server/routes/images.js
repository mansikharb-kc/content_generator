const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Image = require('../models/Image');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const ideaId = req.body.ideaId || 'general';
        const uploadDir = path.join(__dirname, '..', 'uploads', ideaId);
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}${ext}`);
    }
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
        if (!req.user || req.user.isPublic) {
            return res.status(401).json({ msg: 'Authentication required to upload' });
        }

        const ideaId = req.body.ideaId || null;
        const relativePath = path.relative(path.join(__dirname, '..'), req.file.path);
        const imageUrl = `/uploads/${ideaId || 'general'}/${req.file.filename}`;
        const image = new Image({
            url: imageUrl,
            localPath: relativePath,
            ideaId,
            title: req.body.title || '',
            uploadedBy: req.user.id,
            uploaderName: req.user.name || req.user.email || '',
            storageProvider: 'local'
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
