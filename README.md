# Vintage Streaming CDN

A lightweight, self-hosted streaming CDN for vintage shows and movies with support for multiple live channels, metadata management, and scheduling capabilities.

## Features

- **Media Upload & Management**: Upload movie and show files with metadata support
- **HLS Streaming**: Automatically converts videos to HLS format for reliable streaming
- **Multiple Channels**: Support for up to 8 concurrent streaming channels
- **Live Broadcast**: Simulate TV-like channels with scheduled content
- **Scheduler**: Plan broadcasts with an easy-to-use scheduling interface
- **Simple UI**: Clean management interface for all operations
- **RESTful API**: Well-documented endpoints for integration with other services

## Screenshots

*[Screenshots would be added here showing the UI and functionality]*

## Requirements

- Node.js (v14+ recommended)
- FFmpeg installed on your system
- Modern web browser that supports HLS playback

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/vintage-streaming-cdn.git
   cd vintage-streaming-cdn
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create required directories:
   ```bash
   mkdir -p db uploads streams public/js
   ```

4. Copy the frontend files to the public directory:
   ```bash
   # Create index.html in public/
   # Create main.js in public/js/
   ```

5. Start the server:
   ```bash
   node server.js
   ```

6. Access the application at `http://localhost:3000`

## Project Structure

```
vintage-streaming-cdn/
├── db/                   # JSON database files
├── public/               # Static frontend files
├── routes/               # API route handlers
├── streams/              # Generated HLS streams
├── uploads/              # Original uploaded media files
├── utils/                # Utility functions
├── package.json          # Project dependencies
├── server.js             # Main application entry point
└── README.md             # Project documentation
```

## API Documentation

### Media Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/media` | Get all media |
| GET | `/api/media/:id` | Get media by ID |
| POST | `/api/media/upload` | Upload new media |
| PUT | `/api/media/:id` | Update media metadata |
| DELETE | `/api/media/:id` | Delete media |

### Channel Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/channels` | Get all channels |
| GET | `/api/channels/:id` | Get channel by ID |
| PUT | `/api/channels/:id` | Update channel |
| POST | `/api/channels/:id/start` | Start streaming on channel |
| POST | `/api/channels/:id/stop` | Stop streaming on channel |

### Schedule Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/schedule` | Get all schedule items |
| POST | `/api/schedule` | Create schedule item |
| DELETE | `/api/schedule/:id` | Delete schedule item |
| GET | `/api/schedule/channel/:channelId` | Get channel schedule |
| GET | `/api/schedule/upcoming` | Get upcoming schedule |

## Client Integration

### Embedding a Stream in Your Application

```html
<video id="player" controls></video>
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<script>
  const video = document.getElementById('player');
  const streamUrl = 'http://your-server.com/streams/1234567890/playlist.m3u8';
  
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(streamUrl);
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    // Native HLS support (Safari)
    video.src = streamUrl;
  }
</script>
```

### Fetching Media Metadata

```javascript
fetch('http://your-server.com/api/media/1234567890')
  .then(response => response.json())
  .then(media => {
    console.log('Title:', media.title);
    console.log('Genre:', media.metadata.genre);
    console.log('Year:', media.metadata.year);
  });
```

## Configuration Options

The application can be configured by modifying environment variables:

- `PORT`: The port number to run the server on (default: 3000)
- `UPLOAD_LIMIT`: Maximum upload size in megabytes (default: 500)
- `HLS_SEGMENT_TIME`: Duration of HLS segments in seconds (default: 10)

## Performance Considerations

- **Storage**: Media files and HLS segments require significant disk space
- **Memory**: Processing large video files may require additional memory
- **CPU**: Transcoding videos is CPU-intensive. Consider server specifications

## Deployment

### Basic Deployment

For a basic deployment on a VPS or dedicated server:

1. Install Node.js and FFmpeg
2. Clone the repository
3. Set up a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name vintage-cdn
   ```

4. Set up a reverse proxy with Nginx:
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     
     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

### Docker Deployment

A Dockerfile is included for containerized deployments.

```bash
# Build the image
docker build -t vintage-streaming-cdn .

# Run the container
docker run -p 3000:3000 -v /path/to/data:/app/data vintage-streaming-cdn
```

## Future Improvements

- User authentication and multi-user support
- Advanced scheduling with series support
- Adaptive bitrate streaming
- Viewer analytics
- Cloud storage integration
- Mobile app support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
