// routes/media.js - Media routes
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import utilities
const {
    addMedia,
    getMediaDatabase,
    getMediaById,
    updateMedia,
    deleteMedia
} = require('../utils/database');

const {
    ensureDirectories,
    createHLSStream,
    getMediaDuration,
    generateThumbnail,
    cleanupMedia,
    UPLOADS_DIR
} = require('../utils/streaming');

// Ensure upload directory exists
ensureDirectories();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 500 }, // 500MB limit
    fileFilter: (req, file, cb) => {
        // Accept video files
        const fileTypes = /mp4|avi|mkv|mov|wmv|flv|webm/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (extname || mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only video files are allowed'));
        }
    }
});

// Get all media
router.get('/', (req, res) => {
    try {
        const db = getMediaDatabase();
        res.json(db.media);
    } catch (error) {
        console.error('Error getting media:', error);
        res.status(500).json({ error: 'Failed to retrieve media' });
    }
});

// Get media by ID
router.get('/:id', (req, res) => {
    try {
        const media = getMediaById(req.params.id);

        if (!media) {
            return res.status(404).json({ error: 'Media not found' });
        }

        res.json(media);
    } catch (error) {
        console.error('Error getting media by ID:', error);
        res.status(500).json({ error: 'Failed to retrieve media' });
    }
});

// Upload new media
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { title, description, year, genre } = req.body;
        const mediaId = Date.now().toString();

        // Get file duration if not provided
        let duration = req.body.duration;
        if (!duration) {
            try {
                duration = await getMediaDuration(req.file.path);
            } catch (err) {
                console.error('Error getting duration:', err);
                duration = 0;
            }
        }

        // Create HLS stream
        const streamInfo = await createHLSStream(req.file.path, mediaId);

        // Generate thumbnail
        let thumbnailUrl;
        try {
            thumbnailUrl = await generateThumbnail(req.file.path, mediaId);
        } catch (err) {
            console.error('Error generating thumbnail:', err);
            thumbnailUrl = null;
        }

        // Create media object
        const newMedia = {
            id: mediaId,
            title: title || 'Untitled',
            description: description || '',
            fileName: req.file.filename,
            originalPath: req.file.path,
            streamPath: streamInfo.streamPath,
            streamUrl: streamInfo.streamUrl,
            thumbnailUrl: thumbnailUrl,
            uploadDate: new Date().toISOString(),
            metadata: {
                year: year || '',
                genre: genre || '',
                duration: duration || 0
            }
        };

        // Save to database
        addMedia(newMedia);

        res.status(201).json(newMedia);
    } catch (error) {
        console.error('Error uploading media:', error);
        res.status(500).json({ error: 'Failed to upload media' });
    }
});

// Update media
router.put('/:id', (req, res) => {
    try {
        const { title, description, metadata } = req.body;

        const updatedMedia = updateMedia(req.params.id, {
            title: title,
            description: description,
            metadata: metadata
        });

        if (!updatedMedia) {
            return res.status(404).json({ error: 'Media not found' });
        }

        res.json(updatedMedia);
    } catch (error) {
        console.error('Error updating media:', error);
        res.status(500).json({ error: 'Failed to update media' });
    }
});

// Delete media
router.delete('/:id', (req, res) => {
    try {
        const media = getMediaById(req.params.id);

        if (!media) {
            return res.status(404).json({ error: 'Media not found' });
        }

        // Remove media files
        cleanupMedia(media);

        // Remove from database
        deleteMedia(req.params.id);

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting media:', error);
        res.status(500).json({ error: 'Failed to delete media' });
    }
});

module.exports = router;