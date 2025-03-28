// server.js - Main server file
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('fs');
// Import route handlers
const mediaRoutes = require('./routes/media');
const channelRoutes = require('./routes/channels');
const scheduleRoutes = require('./routes/schedule');

// Import database utilities
const { initializeDatabase } = require('./utils/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize database
initializeDatabase();

// Routes
app.use('/api/media', mediaRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/schedule', scheduleRoutes);

// Serve static files
app.use('/streams', express.static('streams'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});