# Omniverse WebRTC Streaming Integration

This webapp has been updated to support proper Omniverse WebRTC streaming using NVIDIA's official `@nvidia/omniverse-webrtc-streaming-library`.

## Setup

### Prerequisites

1. Access to NVIDIA's npm registry at `edge.urm.nvidia.com`
2. Node.js 18+ and npm 10+
3. Running Omniverse Kit application with streaming enabled

### Installation

The `.npmrc` file is already configured to use NVIDIA's registry. To install dependencies:

```bash
npm install
```

If you encounter network errors about `edge.urm.nvidia.com`, you need proper NVIDIA registry access.

## Configuration

The streaming configuration is in `stream.config.json`:

```json
{
    "source": "local",
    "local": {
        "server": "127.0.0.1",
        "signalingPort": 49100,
        "mediaPort": null
    }
}
```

### Configuration Options

- **source**: Can be `"local"`, `"stream"`, or `"gfn"`
- **local.server**: IP address of the Omniverse Kit application
- **local.signalingPort**: WebRTC signaling port (default: 49100)
- **local.mediaPort**: Optional media port (null uses default)

## Usage

1. Start your Omniverse Kit application with streaming enabled
2. Start the webapp: `npm start`
3. Click "Connect Omniverse Stream" button
4. The AppStream component will handle the connection automatically

## Architecture

### AppStream Component

The `src/components/AppStream.js` component wraps the NVIDIA streaming library:

- Handles WebRTC connection lifecycle
- Manages video/audio elements
- Provides callbacks for stream events
- Supports custom messaging with Kit application

### Integration Points

The main App component (`src/App.js`) has been updated to:

1. Import and use AppStream for Omniverse connections
2. Maintain separate modes for "omniverse" vs "screen" streaming
3. Properly clean up connections on unmount
4. Provide UI feedback during connection

## Comparison with Example

This integration is based on the `exapmle/` folder which contains NVIDIA's official web viewer sample. Key differences:

| Feature | Example | This Webapp |
|---------|---------|-------------|
| Framework | Vite + TypeScript | Create React App + JavaScript |
| Streaming Library | @nvidia/omniverse-webrtc-streaming-library 5.6.0 | Same |
| Configuration | stream.config.json | Same |
| Component | AppStream.tsx (class) | AppStream.js (class) |
| UI | Bootstrap forms | Custom dashboard UI |

## Troubleshooting

### Cannot install @nvidia/omniverse-webrtc-streaming-library

This package requires access to NVIDIA's private npm registry. Contact NVIDIA for access credentials.

### Stream not connecting

1. Verify Omniverse Kit is running with streaming enabled
2. Check `stream.config.json` server address matches Kit's IP
3. Verify port 49100 is open and accessible
4. Check browser console for WebRTC errors

### Black screen after connection

1. Wait a few seconds for stream to initialize
2. Check Kit application is rendering
3. Verify video codec support in browser (use Chrome/Chromium)

## Development

To modify streaming behavior:

1. Edit `stream.config.json` for connection parameters
2. Edit `src/components/AppStream.js` for streaming logic
3. Edit `src/App.js` for UI integration

## References

- [NVIDIA Omniverse Web Viewer Documentation](https://docs.omniverse.nvidia.com/web-viewer.html)
- [Omniverse Kit Application Streaming](https://docs.omniverse.nvidia.com/ovas/latest/index.html)
- Example implementation: `exapmle/` folder in this repository
