// utils/streaming.js - Streaming utility functions
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

// Base directories
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const STREAMS_DIR = path.join(__dirname, '..', 'streams');

// Ensure directories exist
function ensureDirectories() {
    if (!fs.existsSync(UPLOADS_DIR)) {
        fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    if (!fs.existsSync(STREAMS_DIR)) {
        fs.mkdirSync(STREAMS_DIR, { recursive: true });
    }
}

// Create HLS segments for streaming
function createHLSStream(filePath, mediaId) {
    return new Promise((resolve, reject) => {
        const outputDir = path.join(STREAMS_DIR, mediaId);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        ffmpeg(filePath)
            .outputOptions([
                '-profile:v baseline',
                '-level 3.0',
                '-start_number 0',
                '-hls_time 10',
                '-hls_list_size 0',
                '-f hls'
            ])
            .output(path.join(outputDir, 'playlist.m3u8'))
            .on('end', () => {
                console.log(`HLS stream created for media ID: ${mediaId}`);
                resolve({
                    streamPath: path.join(outputDir, 'playlist.m3u8'),
                    streamUrl: `/streams/${mediaId}/playlist.m3u8`
                });
            })
            .on('error', (err) => {
                console.error('Error creating HLS stream:', err);
                reject(err);
            })
            .run();
    });
}

// Get media duration using ffmpeg
function getMediaDuration(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                return reject(err);
            }

            const durationInSeconds = metadata.format.duration;
            const durationInMinutes = Math.round(durationInSeconds / 60);

            resolve(durationInMinutes);
        });
    });
}

// Generate thumbnail for media preview
function generateThumbnail(filePath, mediaId) {
    return new Promise((resolve, reject) => {
        const outputDir = path.join(STREAMS_DIR, mediaId);
        const thumbnailPath = path.join(outputDir, 'thumbnail.jpg');

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        ffmpeg(filePath)
            .screenshots({
                count: 1,
                folder: outputDir,
                filename: 'thumbnail.jpg',
                size: '320x180'
            })
            .on('end', () => {
                console.log(`Thumbnail created for media ID: ${mediaId}`);
                resolve(`/streams/${mediaId}/thumbnail.jpg`);
            })
            .on('error', (err) => {
                console.error('Error creating thumbnail:', err);
                reject(err);
            });
    });
}

// Cleanup media files
function cleanupMedia(mediaInfo) {
    // Remove stream files
    const streamDir = path.join(STREAMS_DIR, mediaInfo.id);
    if (fs.existsSync(streamDir)) {
        fs.rmdirSync(streamDir, { recursive: true });
    }

    // Remove original file
    if (fs.existsSync(mediaInfo.originalPath)) {
        fs.unlinkSync(mediaInfo.originalPath);
    }

    console.log(`Cleaned up files for media ID: ${mediaInfo.id}`);
}

module.exports = {
    ensureDirectories,
    createHLSStream,
    getMediaDuration,
    generateThumbnail,
    cleanupMedia,
    UPLOADS_DIR
};