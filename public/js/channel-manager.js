// public/js/channel-manager.js - Channel management functionality

import { api, showToast } from './utils.js';

// Channel management
const channelManager = {
    channels: [],

    // Load channels from API
    async loadChannels() {
        try {
            this.channels = await api.channels.getAll();
            this.renderChannels();
            this.populateChannelSelect();
        } catch (error) {
            console.error('Error loading channels:', error);
        }
    },

    // Render channels in the UI
    renderChannels() {
        const channelsContainer = document.getElementById('channelsContainer');
        if (!channelsContainer) return;

        channelsContainer.innerHTML = '';

        this.channels.forEach(channel => {
            const isActive = channel.isActive;
            const card = document.createElement('div');
            card.className = 'col-md-6 col-lg-3';

            card.innerHTML = `
        <div class="card channel-card ${isActive ? 'channel-active' : ''}">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">${channel.name}</h5>
            <span class="badge ${isActive ? 'bg-success' : 'bg-secondary'}">
              ${isActive ? 'LIVE' : 'OFF AIR'}
            </span>
          </div>
          <div class="card-body">
            ${channel.currentMedia ? `
              <div class="d-flex mb-3">
                <div class="preview-thumbnail me-3">
                  <i class="fas fa-film"></i>
                </div>
                <div>
                  <h6 class="current-media-title">Loading...</h6>
                </div>
              </div>
            ` : `
              <p class="text-muted mb-3">No media currently streaming</p>
            `}
            
            <div class="d-flex">
              ${isActive ? `
                <button class="btn btn-sm btn-danger stop-stream" data-channel-id="${channel.id}">
                  <i class="fas fa-stop me-1"></i>Stop
                </button>
              ` : `
                <button class="btn btn-sm btn-primary start-stream" data-channel-id="${channel.id}">
                  <i class="fas fa-play me-1"></i>Start
                </button>
              `}
              <button class="btn btn-sm btn-secondary ms-2 edit-channel" data-channel-id="${channel.id}">
                <i class="fas fa-edit me-1"></i>Edit
              </button>
            </div>
          </div>
        </div>
      `;

            channelsContainer.appendChild(card);

            // If channel has current media, load the media title
            if (channel.currentMedia) {
                this.loadMediaTitle(channel.id, channel.currentMedia);
            }
        });

        // Add event listeners
        this.addChannelEventListeners();
    },

    // Load media title for a channel
    async loadMediaTitle(channelId, mediaId) {
        try {
            const media = await api.media.getById(mediaId);
            const channelCard = document.querySelector(`[data-channel-id="${channelId}"]`).closest('.card');
            const titleElement = channelCard.querySelector('.current-media-title');

            if (titleElement) {
                titleElement.textContent = media.title;
            }
        } catch (error) {
            console.error('Error loading media title:', error);
        }
    },

    // Populate channel select dropdown
    populateChannelSelect() {
        const scheduleChannel = document.getElementById('scheduleChannel');
        if (!scheduleChannel) return;

        scheduleChannel.innerHTML = '';

        this.channels.forEach(channel => {
            const option = document.createElement('option');
            option.value = channel.id;
            option.textContent = channel.name;
            scheduleChannel.appendChild(option);
        });
    },

    // Add event listeners to channel elements
    addChannelEventListeners() {
        // Start stream buttons
        const startButtons = document.querySelectorAll('.start-stream');
        startButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const channelId = e.currentTarget.dataset.channelId;
                this.showStartStreamDialog(channelId);
            });
        });

        // Stop stream buttons
        const stopButtons = document.querySelectorAll('.stop-stream');
        stopButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const channelId = e.currentTarget.dataset.channelId;

                if (confirm('Are you sure you want to stop this stream?')) {
                    try {
                        await api.channels.stopStream(channelId);
                        showToast('Stream stopped successfully');
                        this.loadChannels(); // Refresh
                    } catch (error) {
                        console.error('Error stopping stream:', error);
                    }
                }
            });
        });

        // Edit channel buttons
        const editButtons = document.querySelectorAll('.edit-channel');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const channelId = e.currentTarget.dataset.channelId;
                this.showEditChannelDialog(channelId);
            });
        });
    },

    // Show dialog to start streaming
    async showStartStreamDialog(channelId) {
        try {
            const media = await api.media.getAll();

            if (media.length === 0) {
                showToast('No media available to stream', 'error');
                return;
            }

            const mediaSelect = document.createElement('select');
            mediaSelect.className = 'form-select';
            mediaSelect.id = 'startStreamMedia';

            media.forEach(item => {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = item.title;
                mediaSelect.appendChild(option);
            });

            // Create and show dialog
            const dialog = document.createElement('div');
            dialog.className = 'modal fade';
            dialog.id = 'startStreamDialog';
            dialog.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Start Streaming</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="startStreamForm">
                <div class="mb-3">
                  <label class="form-label">Select Media</label>
                  ${mediaSelect.outerHTML}
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" id="confirmStartStream">Start</button>
            </div>
          </div>
        </div>
      `;

            document.body.appendChild(dialog);
            const modalElement = document.getElementById('startStreamDialog');
            const modal = new bootstrap.Modal(modalElement);
            modal.show();

            // Handle confirmation
            document.getElementById('confirmStartStream').addEventListener('click', async () => {
                const mediaId = document.getElementById('startStreamMedia').value;

                try {
                    await api.channels.startStream(channelId, mediaId);
                    showToast('Stream started successfully');
                    this.loadChannels(); // Refresh
                    modal.hide();
                } catch (error) {
                    console.error('Error starting stream:', error);
                }
            });

            // Clean up when closed
            modalElement.addEventListener('hidden.bs.modal', () => {
                modalElement.remove();
            });
        } catch (error) {
            console.error('Error showing start stream dialog:', error);
        }
    },

    // Show dialog to edit channel
    showEditChannelDialog(channelId) {
        const channel = this.channels.find(c => c.id === parseInt(channelId));

        if (!channel) {
            showToast('Channel not found', 'error');
            return;
        }

        // Create and show dialog
        const dialog = document.createElement('div');
        dialog.className = 'modal fade';
        dialog.id = 'editChannelDialog';
        dialog.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Channel</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="editChannelForm">
              <div class="mb-3">
                <label class="form-label">Channel Name</label>
                <input type="text" class="form-control" id="channelName" value="${channel.name}">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="confirmEditChannel">Save</button>
          </div>
        </div>
      </div>
    `;

        document.body.appendChild(dialog);
        const modalElement = document.getElementById('editChannelDialog');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        // Handle confirmation
        document.getElementById('confirmEditChannel').addEventListener('click', async () => {
            const name = document.getElementById('channelName').value;

            try {
                await api.channels.update(channelId, { name });
                showToast('Channel updated successfully');
                this.loadChannels(); // Refresh
                modal.hide();
            } catch (error) {
                console.error('Error updating channel:', error);
            }
        });

        // Clean up when closed
        modalElement.addEventListener('hidden.bs.modal', () => {
            modalElement.remove();
        });
    }
};

export { channelManager };