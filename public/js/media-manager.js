// public/js/media-manager.js - Media library management functionality

import { api, showToast, formatDate, formatDuration } from './utils.js';

// Media library management
const mediaManager = {
    media: [],

    // Load media from API
    async loadMedia() {
        try {
            this.media = await api.media.getAll();
            this.renderMedia();
            this.populateMediaSelect();
        } catch (error) {
            console.error('Error loading media:', error);
        }
    },

    // Render media in the UI
    renderMedia() {
        const mediaContainer = document.getElementById('mediaContainer');
        if (!mediaContainer) return;

        mediaContainer.innerHTML = '';

        if (this.media.length === 0) {
            mediaContainer.innerHTML = `
        <div class="col-12 text-center py-5">
          <h5 class="text-muted">No media available</h5>
          <p>Upload media files to get started</p>
        </div>
      `;
            return;
        }

        this.media.forEach(item => {
            const card = document.createElement('div');
            card.className = 'col-md-6 col-lg-4 mb-4';

            card.innerHTML = `
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">${item.title}</h5>
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="fas fa-ellipsis-v"></i>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><button class="dropdown-item preview-media" data-media-id="${item.id}">Preview</button></li>
                <li><button class="dropdown-item edit-media" data-media-id="${item.id}">Edit</button></li>
                <li><hr class="dropdown-divider"></li>
                <li><button class="dropdown-item text-danger delete-media" data-media-id="${item.id}">Delete</button></li>
              </ul>
            </div>
          </div>
          <div class="card-body">
            <div class="d-flex mb-3">
              <div class="preview-thumbnail me-3" style="background-image: url('${item.thumbnailUrl || ''}')">
                ${!item.thumbnailUrl ? '<i class="fas fa-film"></i>' : ''}
              </div>
              <div>
                <p class="card-text">${item.description || 'No description'}</p>
              </div>
            </div>
            <div class="mb-2">
              ${item.metadata.year ? `<span class="badge bg-secondary metadata-badge">Year: ${item.metadata.year}</span>` : ''}
              ${item.metadata.genre ? `<span class="badge bg-secondary metadata-badge">Genre: ${item.metadata.genre}</span>` : ''}
              ${item.metadata.duration ? `<span class="badge bg-secondary metadata-badge">Duration: ${formatDuration(item.metadata.duration)}</span>` : ''}
            </div>
          </div>
          <div class="card-footer text-muted">
            Uploaded: ${formatDate(item.uploadDate)}
          </div>
        </div>
      `;

            mediaContainer.appendChild(card);
        });

        // Add event listeners
        this.addMediaEventListeners();
    },

    // Populate media select dropdown
    populateMediaSelect() {
        const scheduleMedia = document.getElementById('scheduleMedia');
        if (!scheduleMedia) return;

        scheduleMedia.innerHTML = '';

        this.media.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.title;
            scheduleMedia.appendChild(option);
        });
    },

    // Add event listeners to media elements
    addMediaEventListeners() {
        // Preview buttons
        const previewButtons = document.querySelectorAll('.preview-media');
        previewButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const mediaId = e.currentTarget.dataset.mediaId;
                this.showPreviewDialog(mediaId);
            });
        });

        // Edit buttons
        const editButtons = document.querySelectorAll('.edit-media');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const mediaId = e.currentTarget.dataset.mediaId;
                this.showEditMediaDialog(mediaId);
            });
        });

        // Delete buttons
        const deleteButtons = document.querySelectorAll('.delete-media');
        deleteButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const mediaId = e.currentTarget.dataset.mediaId;

                if (confirm('Are you sure you want to delete this media? This cannot be undone.')) {
                    try {
                        await api.media.delete(mediaId);
                        showToast('Media deleted successfully');
                        this.loadMedia(); // Refresh
                    } catch (error) {
                        console.error('Error deleting media:', error);
                    }
                }
            });
        });
    },

    // Show media preview dialog
    async showPreviewDialog(mediaId) {
        try {
            const media = await api.media.getById(mediaId);
            const modalBody = document.querySelector('#previewModal .modal-body');
            const modalTitle = document.querySelector('#previewModal .modal-title');

            modalTitle.textContent = media.title;
            modalBody.innerHTML = `
        <div class="player-container">
          <video id="previewPlayer" controls>
            <source src="${media.streamUrl}" type="application/x-mpegURL">
            Your browser does not support HTML5 video.
          </video>
        </div>
        
        <div class="mt-3">
          <h6>Description</h6>
          <p>${media.description || 'No description'}</p>
          
          <h6>Metadata</h6>
          <div>
            ${media.metadata.year ? `<span class="badge bg-secondary metadata-badge">Year: ${media.metadata.year}</span>` : ''}
            ${media.metadata.genre ? `<span class="badge bg-secondary metadata-badge">Genre: ${media.metadata.genre}</span>` : ''}
            ${media.metadata.duration ? `<span class="badge bg-secondary metadata-badge">Duration: ${formatDuration(media.metadata.duration)}</span>` : ''}
          </div>
        </div>
      `;

            const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
            previewModal.show();

            // Load HLS.js if available
            if (window.Hls && Hls.isSupported()) {
                const video = document.getElementById('previewPlayer');
                const hls = new Hls();
                hls.loadSource(media.streamUrl);
                hls.attachMedia(video);
            }
        } catch (error) {
            console.error('Error showing preview:', error);
        }
    },

    // Show edit media dialog
    async showEditMediaDialog(mediaId) {
        try {
            const media = await api.media.getById(mediaId);

            // Create and show dialog
            const dialog = document.createElement('div');
            dialog.className = 'modal fade';
            dialog.id = 'editMediaDialog';
            dialog.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Edit Media</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="editMediaForm">
                <div class="mb-3">
                  <label class="form-label">Title</label>
                  <input type="text" class="form-control" id="mediaTitle" value="${media.title}">
                </div>
                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea class="form-control" id="mediaDescription" rows="3">${media.description || ''}</textarea>
                </div>
                <div class="row">
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Year</label>
                      <input type="number" class="form-control" id="mediaYear" value="${media.metadata.year || ''}" min="1900" max="2099">
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Genre</label>
                      <input type="text" class="form-control" id="mediaGenre" value="${media.metadata.genre || ''}">
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="form-label">Duration (min)</label>
                      <input type="number" class="form-control" id="mediaDuration" value="${media.metadata.duration || ''}">
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" id="confirmEditMedia">Save</button>
            </div>
          </div>
        </div>
      `;

            document.body.appendChild(dialog);
            const modalElement = document.getElementById('editMediaDialog');
            const modal = new bootstrap.Modal(modalElement);
            modal.show();

            // Handle confirmation
            document.getElementById('confirmEditMedia').addEventListener('click', async () => {
                const title = document.getElementById('mediaTitle').value;
                const description = document.getElementById('mediaDescription').value;
                const year = document.getElementById('mediaYear').value;
                const genre = document.getElementById('mediaGenre').value;
                const duration = document.getElementById('mediaDuration').value;

                try {
                    await api.media.update(mediaId, {
                        title,
                        description,
                        metadata: {
                            year,
                            genre,
                            duration: duration ? parseInt(duration) : null
                        }
                    });

                    showToast('Media updated successfully');
                    this.loadMedia(); // Refresh
                    modal.hide();
                } catch (error) {
                    console.error('Error updating media:', error);
                }
            });

            // Clean up when closed
            modalElement.addEventListener('hidden.bs.modal', () => {
                modalElement.remove();
            });
        } catch (error) {
            console.error('Error showing edit dialog:', error);
        }
    }
};

export { mediaManager };