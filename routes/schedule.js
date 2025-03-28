// routes/schedule.js - Schedule routes
const express = require('express');
const router = express.Router();

// Import utilities
const {
    getSchedule,
    addScheduleItem,
    deleteScheduleItem
} = require('../utils/database');

// Get all schedule items
router.get('/', (req, res) => {
    try {
        const scheduleData = getSchedule();
        res.json(scheduleData.schedules);
    } catch (error) {
        console.error('Error getting schedule:', error);
        res.status(500).json({ error: 'Failed to retrieve schedule' });
    }
});

// Create a new schedule item
router.post('/', (req, res) => {
    try {
        const { channelId, mediaId, startTime, endTime } = req.body;

        // Validate required fields
        if (!channelId || !mediaId || !startTime) {
            return res.status(400).json({ error: 'Missing required fields (channelId, mediaId, startTime)' });
        }

        // Create schedule item
        const newSchedule = {
            id: Date.now().toString(),
            channelId: parseInt(channelId),
            mediaId,
            startTime,
            endTime: endTime || null,
            createdAt: new Date().toISOString()
        };

        // Add to database
        addScheduleItem(newSchedule);

        res.status(201).json(newSchedule);
    } catch (error) {
        console.error('Error creating schedule item:', error);
        res.status(500).json({ error: 'Failed to create schedule item' });
    }
});

// Delete schedule item
router.delete('/:id', (req, res) => {
    try {
        const success = deleteScheduleItem(req.params.id);

        if (!success) {
            return res.status(404).json({ error: 'Schedule item not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting schedule item:', error);
        res.status(500).json({ error: 'Failed to delete schedule item' });
    }
});

// Get schedule for a specific channel
router.get('/channel/:channelId', (req, res) => {
    try {
        const channelId = parseInt(req.params.channelId);
        const scheduleData = getSchedule();

        // Filter schedule items for the specified channel
        const channelSchedule = scheduleData.schedules.filter(
            item => item.channelId === channelId
        );

        res.json(channelSchedule);
    } catch (error) {
        console.error('Error getting channel schedule:', error);
        res.status(500).json({ error: 'Failed to retrieve channel schedule' });
    }
});

// Get upcoming schedule (items with startTime in the future)
router.get('/upcoming', (req, res) => {
    try {
        const scheduleData = getSchedule();
        const now = new Date().toISOString();

        // Filter schedule items that haven't started yet
        const upcomingSchedule = scheduleData.schedules.filter(
            item => item.startTime > now
        ).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        res.json(upcomingSchedule);
    } catch (error) {
        console.error('Error getting upcoming schedule:', error);
        res.status(500).json({ error: 'Failed to retrieve upcoming schedule' });
    }
});

module.exports = router;