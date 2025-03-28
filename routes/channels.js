// routes/channels.js - Channel routes
const express = require('express');
const router = express.Router();

// Import utilities
const {
    getChannels,
    getChannelById,
    updateChannel
} = require('../utils/database');

// Get all channels
router.get('/', (req, res) => {
    try {
        const channelsData = getChannels();
        res.json(channelsData.channels);
    } catch (error) {
        console.error('Error getting channels:', error);
        res.status(500).json({ error: 'Failed to retrieve channels' });
    }
});

// Get channel by ID
router.get('/:id', (req, res) => {
    try {
        const channelId = parseInt(req.params.id);
        const channel = getChannelById(channelId);

        if (!channel) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        res.json(channel);
    } catch (error) {
        console.error('Error getting channel by ID:', error);
        res.status(500).json({ error: 'Failed to retrieve channel' });
    }
});

// Update channel
router.put('/:id', (req, res) => {
    try {
        const channelId = parseInt(req.params.id);
        const { name, isActive, currentMedia } = req.body;

        // Update channel properties
        const updatedChannel = updateChannel(channelId, {
            name: name,
            isActive: isActive,
            currentMedia: currentMedia
        });

        if (!updatedChannel) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        res.json(updatedChannel);
    } catch (error) {
        console.error('Error updating channel:', error);
        res.status(500).json({ error: 'Failed to update channel' });
    }
});

// Start streaming on a channel
router.post('/:id/start', (req, res) => {
    try {
        const channelId = parseInt(req.params.id);
        const { mediaId } = req.body;

        if (!mediaId) {
            return res.status(400).json({ error: 'Media ID is required' });
        }

        // Update channel to start streaming
        const updatedChannel = updateChannel(channelId, {
            isActive: true,
            currentMedia: mediaId
        });

        if (!updatedChannel) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        res.json({
            success: true,
            message: `Channel ${channelId} is now streaming media ${mediaId}`,
            channel: updatedChannel
        });
    } catch (error) {
        console.error('Error starting stream:', error);
        res.status(500).json({ error: 'Failed to start streaming' });
    }
});

// Stop streaming on a channel
router.post('/:id/stop', (req, res) => {
    try {
        const channelId = parseInt(req.params.id);

        // Update channel to stop streaming
        const updatedChannel = updateChannel(channelId, {
            isActive: false,
            currentMedia: null
        });

        if (!updatedChannel) {
            return res.status(404).json({ error: 'Channel not found' });
        }

        res.json({
            success: true,
            message: `Channel ${channelId} has stopped streaming`,
            channel: updatedChannel
        });
    } catch (error) {
        console.error('Error stopping stream:', error);
        res.status(500).json({ error: 'Failed to stop streaming' });
    }
});

module.exports = router;