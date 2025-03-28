// public/js/utils.js - Utility functions and API client

// API utilities for making requests
const api = {
    // Base API URL
    baseUrl: '/api',

    // Generic request method
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const response = await fetch(url, options);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            showToast(error.message || 'Error connecting to server', 'error');
            throw error;
        }
    },

    // Media endpoints
    media: {
        getAll: () => api.request('/media'),
        getById: (id) => api.request(`/media/${id}`),
        update: (id, data) => api.request(`/media/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }),
        delete: (id) => api.request(`/media/${id}`, { method: 'DELETE' }),
        upload: async (formData, onProgress) => {
            try {
                const xhr = new XMLHttpRequest();

                // Set up progress tracking
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable && onProgress) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        onProgress(percentComplete);
                    }
                });

                // Return a promise for the upload
                return new Promise((resolve, reject) => {
                    xhr.open('POST', `${api.baseUrl}/media/upload`);

                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve(JSON.parse(xhr.response));
                        } else {
                            try {
                                reject(JSON.parse(xhr.response));
                            } catch (e) {
                                reject({ error: 'Upload failed' });
                            }
                        }
                    };

                    xhr.onerror = () => reject({ error: 'Network error during upload' });
                    xhr.send(formData);
                });
            } catch (error) {
                console.error('Upload Error:', error);
                showToast(error.message || 'Error uploading file', 'error');
                throw error;
            }
        }
    },

    // Channel endpoints
    channels: {
        getAll: () => api.request('/channels'),
        getById: (id) => api.request(`/channels/${id}`),
        update: (id, data) => api.request(`/channels/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }),
        startStream: (id, mediaId) => api.request(`/channels/${id}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mediaId })
        }),
        stopStream: (id) => api.request(`/channels/${id}/stop`, {
            method: 'POST'
        })
    },

    // Schedule endpoints
    schedule: {
        getAll: () => api.request('/schedule'),
        create: (data) => api.request('/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }),
        delete: (id) => api.request(`/schedule/${id}`, { method: 'DELETE' }),
        getUpcoming: () => api.request('/schedule/upcoming'),
        getByChannel: (channelId) => api.request(`/schedule/channel/${channelId}`)
    }
};

// Show toast notification
function showToast(message, type = 'info') {
    // Create toast element
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : 'success'} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

    toastContainer.appendChild(toast);

    // Show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    // Remove after shown
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Create toast container if it doesn't exist
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'position-fixed top-0 end-0 p-3';
    container.style.zIndex = 1050;
    document.body.appendChild(container);
    return container;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Format duration for display
function formatDuration(minutes) {
    if (!minutes) return 'Unknown';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
        return `${hours}h ${mins}m`;
    } else {
        return `${mins}m`;
    }
}

export { api, showToast, formatDate, formatDuration };