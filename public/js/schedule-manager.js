// public/js/schedule-manager.js - Schedule management functionality

import { api, showToast, formatDate } from './utils.js';

// Schedule management
const scheduleManager = {
    schedules: [],

    // Load schedule from API
    async loadSchedule() {
        try {
            this.schedules = await api.schedule.getAll();
            this.renderScheduleTable();
            this.renderTimeline();
        } catch (error) {
            console.error('Error loading schedule:', error);
        }
    },

    // Render schedule in table format
    async renderScheduleTable() {
        const scheduleTable = document.querySelector('#scheduleTable tbody');
        if (!scheduleTable) return;

        scheduleTable.innerHTML = '';

        if (this.schedules.length === 0) {
            scheduleTable.innerHTML = `
        <tr>
          <td colspan="4" class="text-center py-3">No scheduled broadcasts</td>
        </tr>
      `;
            return;
        }

        // Get channel and media info for display
        const channels = await api.channels.getAll();
        const media = await api.media.getAll();

        // Sort by start time
        const sortedSchedule = [...this.schedules].sort(
            (a, b) => new Date(a.startTime) - new Date(b.startTime)
        );

        sortedSchedule.forEach(item => {
            const channel = channels.find(c => c.id === item.channelId) || { name: `Channel ${item.channelId}` };
            const mediaItem = media.find(m => m.id === item.mediaId) || { title: 'Unknown media' };

            const row = document.createElement('tr');
            row.innerHTML = `
        <td>${channel.name}</td>
        <td>${mediaItem.title}</td>
        <td>${formatDate(item.startTime)}</td>
        <td>
          <button class="btn btn-sm btn-danger delete-schedule" data-schedule-id="${item.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;

            scheduleTable.appendChild(row);
        });

        // Add event listeners
        const deleteButtons = document.querySelectorAll('.delete-schedule');
        deleteButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const scheduleId = e.currentTarget.dataset.scheduleId;

                if (confirm('Are you sure you want to delete this scheduled broadcast?')) {
                    try {
                        await api.schedule.delete(scheduleId);
                        showToast('Schedule item deleted');
                        this.loadSchedule(); // Refresh
                    } catch (error) {
                        console.error('Error deleting schedule:', error);
                    }
                }
            });
        });
    },

    // Render schedule timeline
    async renderTimeline(viewType = 'today') {
        const scheduleTimeline = document.getElementById('scheduleTimeline');
        if (!scheduleTimeline) return;

        // Clear timeline
        scheduleTimeline.innerHTML = '';

        // Get current date/time and range based on view type
        const now = new Date();
        let startDate = new Date(now);
        let endDate = new Date(now);
        let startHour = 0;
        let hoursToShow = 24;

        switch (viewType) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'tomorrow':
                startDate.setDate(startDate.getDate() + 1);
                startDate.setHours(0, 0, 0, 0);
                endDate.setDate(endDate.getDate() + 1);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'week':
                startDate.setHours(0, 0, 0, 0);
                endDate.setDate(endDate.getDate() + 6);
                endDate.setHours(23, 59, 59, 999);
                break;
        }

        // Create timeline hours
        for (let i = 0; i < hoursToShow; i++) {
            const hour = (startHour + i) % 24;
            const timeDiv = document.createElement('div');
            timeDiv.className = 'timeline-hour';
            timeDiv.dataset.hour = hour;

            timeDiv.innerHTML = `
        <span>${hour}:00</span>
      `;

            scheduleTimeline.appendChild(timeDiv);
        }

        // Get channel and media info for display
        const channels = await api.channels.getAll();
        const media = await api.media.getAll();

        // Add schedule items to timeline
        this.schedules.forEach(item => {
            const startTime = new Date(item.startTime);

            // Only show items within date range
            if (startTime < startDate || startTime > endDate) {
                return;
            }

            const channel = channels.find(c => c.id === item.channelId) || { name: `Channel ${item.channelId}` };
            const mediaItem = media.find(m => m.id === item.mediaId) || { title: 'Unknown media' };

            // Calculate position
            const hour = startTime.getHours();
            const minute = startTime.getMinutes();
            const minutePercent = minute / 60;

            const hourElement = document.querySelector(`.timeline-hour[data-hour="${hour}"]`);
            if (!hourElement) return;

            // Create schedule item
            const scheduleItem = document.createElement('div');
            scheduleItem.className = 'schedule-item';
            scheduleItem.style.left = `${minutePercent * 100}%`;
            scheduleItem.style.width = '120px';

            // Set background color by channel (simple hash function for color)
            const channelColorIndex = item.channelId % 8;
            const colors = [
                '#4285F4', '#EA4335', '#FBBC05', '#34A853',
                '#673AB7', '#3F51B5', '#2196F3', '#00BCD4'
            ];
            scheduleItem.style.backgroundColor = colors[channelColorIndex];

            scheduleItem.innerHTML = `
        <div>${mediaItem.title}</div>
        <small>${channel.name}</small>
      `;

            hourElement.appendChild(scheduleItem);

            // Add tooltip
            scheduleItem.setAttribute('title', `${mediaItem.title} (${formatDate(item.startTime)})`);
            scheduleItem.setAttribute('data-bs-toggle', 'tooltip');
            new bootstrap.Tooltip(scheduleItem);
        });
    },

    // Initialize timeline view buttons
    initTimelineButtons() {
        const viewToday = document.getElementById('viewToday');
        const viewTomorrow = document.getElementById('viewTomorrow');
        const viewWeek = document.getElementById('viewWeek');

        if (!viewToday || !viewTomorrow || !viewWeek) return;

        viewToday.addEventListener('click', () => {
            this.renderTimeline('today');
        });

        viewTomorrow.addEventListener('click', () => {
            this.renderTimeline('tomorrow');
        });

        viewWeek.addEventListener('click', () => {
            this.renderTimeline('week');
        });
    }
};

export { scheduleManager };