// public/js/main.js - Main entry point for frontend JavaScript

// Import modules
import { api, showToast, formatDate, formatDuration } from './utils.js';
import { channelManager } from './channel-manager.js';
import { mediaManager } from './media-manager.js';
import { scheduleManager } from './schedule-manager.js';

// Initialize handlers
const uploadHandler = {
    // Initialize upload form
    init() {
        const uploadForm = document.getElementById('uploadForm');
        if (!uploadForm) return;

        uploadForm.addEventListener('submit', this.handleUpload.bind(this));
    },

    // Handle form submission
    async handleUpload(e) {
        e.preventDefault();

        const form = e.target;
        const fileInput = form.querySelector('#mediaFile');
        const uploadProgress = document.getElementById('uploadProgress');

        if (!fileInput.files || fileInput.files.length === 0) {
            showToast('Please select a file to upload', 'error');
            return;
        }

        // Prepare form data
        const formData = new FormData(form);

        // Show progress
        uploadProgress.classList.remove('d-none');
        uploadProgress.querySelector('.progress-bar').style.width = '0%';

        try {
            // Upload file
            await api.media.upload(formData, (percent) => {
                uploadProgress.querySelector('.progress-bar').style.width = `${percent}%`;
            });

            // Success
            showToast('Media uploaded successfully');

            // Reset form
            form.reset();
            uploadProgress.classList.add('d-none');

            // Refresh media list
            mediaManager.loadMedia();

        } catch (error) {
            showToast(error.error || 'Upload failed', 'error');
            uploadProgress.classList.add('d-none');
        }
    }
};

// Schedule form handling
const scheduleFormHandler = {
    // Initialize schedule form
    init() {
        const scheduleForm = document.getElementById('scheduleForm');
        if (!scheduleForm) return;

        scheduleForm.addEventListener('submit', this.handleScheduleSubmit.bind(this));
    },

    // Handle form submission
    async handleScheduleSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const channelId = form.querySelector('#scheduleChannel').value;
        const mediaId = form.querySelector('#scheduleMedia').value;
        const startTime = form.querySelector('#scheduleTime').value;

        if (!channelId || !mediaId || !startTime) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            // Create schedule
            await api.schedule.create({
                channelId,
                mediaId,
                startTime: new Date(startTime).toISOString()
            });

            // Success
            showToast('Broadcast scheduled successfully');

            // Reset form
            form.reset();

            // Refresh schedule
            scheduleManager.loadSchedule();

        } catch (error) {
            showToast(error.error || 'Failed to schedule broadcast', 'error');
        }
    }
};

// Media search functionality
const searchHandler = {
    // Initialize search
    init() {
        const mediaSearch = document.getElementById('mediaSearch');
        if (!mediaSearch) return;

        mediaSearch.addEventListener('input', this.handleSearch.bind(this));
    },

    // Handle search input
    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase().trim();

        // If empty, show all media
        if (!searchTerm) {
            mediaManager.renderMedia();
            return;
        }

        // Filter media items
        const filteredMedia = mediaManager.media.filter(item => {
            return (
                item.title.toLowerCase().includes(searchTerm) ||
                (item.description && item.description.toLowerCase().includes(searchTerm)) ||
                (item.metadata.genre && item.metadata.genre.toLowerCase().includes(searchTerm)) ||
                (item.metadata.year && item.metadata.year.toString().includes(searchTerm))
            );
        });

        // Create a temporary copy of the media array
        const originalMedia = [...mediaManager.media];
        mediaManager.media = filteredMedia;

        // Render filtered results
        mediaManager.renderMedia();

        // Restore original array
        mediaManager.media = originalMedia;
    }
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Load data
    channelManager.loadChannels();
    mediaManager.loadMedia();
    scheduleManager.loadSchedule();

    // Initialize handlers
    uploadHandler.init();
    scheduleFormHandler.init();
    searchHandler.init();
    scheduleManager.initTimelineButtons();

    // Enable tooltips everywhere
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
        new bootstrap.Tooltip(el);
    });
});