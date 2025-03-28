// utils/database.js - Database utility functions
const fs = require('fs');
const path = require('path');

// Define database file paths
const DB_PATH = path.join(__dirname, '..', 'db');
const DB_FILE = path.join(DB_PATH, 'database.json');
const CHANNELS_FILE = path.join(DB_PATH, 'channels.json');
const SCHEDULE_FILE = path.join(DB_PATH, 'schedule.json');

// Initialize database files
function initializeDatabase() {
    // Create database directory if it doesn't exist
    if (!fs.existsSync(DB_PATH)) {
        fs.mkdirSync(DB_PATH, { recursive: true });
        console.log('Created database directory');
    }

    try {
        // Handle media database file
        let mediaDbNeedsInit = false;

        if (!fs.existsSync(DB_FILE)) {
            mediaDbNeedsInit = true;
        } else {
            // File exists, check if it has valid content
            try {
                const content = fs.readFileSync(DB_FILE, 'utf8');
                if (content.trim() === '') {
                    mediaDbNeedsInit = true;
                } else {
                    // Validate JSON
                    JSON.parse(content);
                }
            } catch (e) {
                console.log('Media database file has invalid content, will reset');
                mediaDbNeedsInit = true;
            }
        }

        if (mediaDbNeedsInit) {
            fs.writeFileSync(DB_FILE, JSON.stringify({ media: [] }, null, 2));
            console.log('Initialized media database file');
        }

        // Handle channels file
        let channelsNeedsInit = false;

        if (!fs.existsSync(CHANNELS_FILE)) {
            channelsNeedsInit = true;
        } else {
            // File exists, check if it has valid content
            try {
                const content = fs.readFileSync(CHANNELS_FILE, 'utf8');
                if (content.trim() === '') {
                    channelsNeedsInit = true;
                } else {
                    // Validate JSON
                    JSON.parse(content);
                }
            } catch (e) {
                console.log('Channels file has invalid content, will reset');
                channelsNeedsInit = true;
            }
        }

        if (channelsNeedsInit) {
            fs.writeFileSync(CHANNELS_FILE, JSON.stringify({
                channels: Array(8).fill().map((_, i) => ({
                    id: i + 1,
                    name: `Channel ${i + 1}`,
                    isActive: false,
                    currentMedia: null
                }))
            }, null, 2));
            console.log('Initialized channels file');
        }

        // Handle schedule file
        let scheduleNeedsInit = false;

        if (!fs.existsSync(SCHEDULE_FILE)) {
            scheduleNeedsInit = true;
        } else {
            // File exists, check if it has valid content
            try {
                const content = fs.readFileSync(SCHEDULE_FILE, 'utf8');
                if (content.trim() === '') {
                    scheduleNeedsInit = true;
                } else {
                    // Validate JSON
                    JSON.parse(content);
                }
            } catch (e) {
                console.log('Schedule file has invalid content, will reset');
                scheduleNeedsInit = true;
            }
        }

        if (scheduleNeedsInit) {
            fs.writeFileSync(SCHEDULE_FILE, JSON.stringify({ schedules: [] }, null, 2));
            console.log('Initialized schedule file');
        }

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error during database initialization:', error);
    }
}

// Media database operations
function getMediaDatabase() {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading media database:', error);
        // Return empty structure as fallback
        return { media: [] };
    }
}

function saveMediaDatabase(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving media database:', error);
    }
}

function addMedia(media) {
    const db = getMediaDatabase();
    db.media.push(media);
    saveMediaDatabase(db);
    return media;
}

function getMediaById(id) {
    const db = getMediaDatabase();
    return db.media.find(m => m.id === id);
}

function updateMedia(id, updates) {
    const db = getMediaDatabase();
    const index = db.media.findIndex(m => m.id === id);

    if (index === -1) {
        return null;
    }

    db.media[index] = { ...db.media[index], ...updates };
    saveMediaDatabase(db);
    return db.media[index];
}

function deleteMedia(id) {
    const db = getMediaDatabase();
    const index = db.media.findIndex(m => m.id === id);

    if (index === -1) {
        return false;
    }

    db.media.splice(index, 1);
    saveMediaDatabase(db);
    return true;
}

// Channel operations
function getChannels() {
    try {
        const data = fs.readFileSync(CHANNELS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading channels data:', error);
        // Return default structure as fallback
        return {
            channels: Array(8).fill().map((_, i) => ({
                id: i + 1,
                name: `Channel ${i + 1}`,
                isActive: false,
                currentMedia: null
            }))
        };
    }
}

function saveChannels(data) {
    try {
        fs.writeFileSync(CHANNELS_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving channels data:', error);
    }
}

function getChannelById(id) {
    const channelsData = getChannels();
    return channelsData.channels.find(c => c.id === id);
}

function updateChannel(id, updates) {
    const channelsData = getChannels();
    const index = channelsData.channels.findIndex(c => c.id === id);

    if (index === -1) {
        return null;
    }

    channelsData.channels[index] = { ...channelsData.channels[index], ...updates };
    saveChannels(channelsData);
    return channelsData.channels[index];
}

// Schedule operations
function getSchedule() {
    try {
        const data = fs.readFileSync(SCHEDULE_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading schedule data:', error);
        // Return empty structure as fallback
        return { schedules: [] };
    }
}

function saveSchedule(data) {
    try {
        fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving schedule data:', error);
    }
}

function addScheduleItem(item) {
    const scheduleData = getSchedule();
    scheduleData.schedules.push(item);
    saveSchedule(scheduleData);
    return item;
}

function deleteScheduleItem(id) {
    const scheduleData = getSchedule();
    const index = scheduleData.schedules.findIndex(s => s.id === id);

    if (index === -1) {
        return false;
    }

    scheduleData.schedules.splice(index, 1);
    saveSchedule(scheduleData);
    return true;
}

// Export functions
module.exports = {
    initializeDatabase,
    getMediaDatabase,
    saveMediaDatabase,
    addMedia,
    getMediaById,
    updateMedia,
    deleteMedia,
    getChannels,
    saveChannels,
    getChannelById,
    updateChannel,
    getSchedule,
    saveSchedule,
    addScheduleItem,
    deleteScheduleItem
};