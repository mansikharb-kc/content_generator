const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Image = require('../models/Image');
const Idea = require('../models/Idea');
const AppConfig = require('../models/AppConfig');

// Use memory storage to allow dynamic Cloudinary config
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const auth = require('../middleware/auth');

// POST /api/images/upload
router.post('/upload', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
        if (!req.user || req.user.isPublic) {
            console.warn('[Upload] Denied - Public user or no auth header');
            return res.status(401).json({
                msg: 'Authentication required to upload',
                debug: { hasUser: !!req.user, isPublic: req.user?.isPublic }
            });
        }

        const ideaId = req.body.ideaId || null;
        if (ideaId) {
            const idea = await Idea.findById(ideaId);
            if (idea && idea.isLocked) {
                return res.status(400).json({ msg: 'Strategy is locked. Cannot upload new reference images.' });
            }
        }

        // Fetch dynamic cloud config
        const dbConfig = await AppConfig.findOne();
        const cloudName = dbConfig?.cloudinaryCloudName || process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = dbConfig?.cloudinaryApiKey || process.env.CLOUDINARY_API_KEY;
        const apiSecret = dbConfig?.cloudinaryApiSecret || process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            return res.status(500).json({ msg: 'Cloudinary configuration missing' });
        }

        // Re-configure cloudinary for this request
        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret
        });

        // Convert buffer to stream for Cloudinary
        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'content_generator',
                        transformation: [{ width: 1600, crop: 'limit', quality: 'auto' }]
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
        };

        const result = await uploadToCloudinary();

        const image = new Image({
            url: result.secure_url,
            publicId: result.public_id,
            ideaId,
            title: req.body.title || '',
            uploadedBy: req.user.id,
            uploaderName: req.user.name || '',
            storageProvider: 'cloudinary'
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
        const { ideaId } = req.query;
        const query = ideaId ? { ideaId } : {};
        const images = await Image.find(query).sort({ createdAt: -1 });
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

        // Only admin, marketing, or uploader can delete
        const isAdminOrMarketing = req.user.role === 'admin' || req.user.role === 'marketing';
        if (!isAdminOrMarketing && String(image.uploadedBy) !== String(req.user.id)) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        // Lock check
        if (image.ideaId) {
            const idea = await Idea.findById(image.ideaId);
            if (idea && idea.isLocked) {
                return res.status(400).json({ msg: 'Strategy is locked. Cannot delete reference images.' });
            }
        }

        // Fetch dynamic cloud config for deletion
        const dbConfig = await AppConfig.findOne();
        const cloudName = dbConfig?.cloudinaryCloudName || process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = dbConfig?.cloudinaryApiKey || process.env.CLOUDINARY_API_KEY;
        const apiSecret = dbConfig?.cloudinaryApiSecret || process.env.CLOUDINARY_API_SECRET;

        // Delete from Cloudinary if we have a publicId
        if (image.publicId && cloudName && apiKey && apiSecret) {
            try {
                cloudinary.config({
                    cloud_name: cloudName,
                    api_key: apiKey,
                    api_secret: apiSecret
                });
                await cloudinary.uploader.destroy(image.publicId);
            } catch (cloudErr) {
                console.warn('Cloudinary delete warning:', cloudErr.message);
            }
        }

        await image.deleteOne();
        res.json({ msg: 'Image deleted' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ msg: 'Delete failed', error: err.message });
    }
});

module.exports = router;
