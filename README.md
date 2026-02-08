# WebRTC React - Camera Interface

A modern, interactive web interface featuring WebRTC camera streaming. Built with React and TypeScript.

## Overview

This application provides a camera streaming interface with interactive controls, command management, and status monitoring. The main feature displays your webcam feed using the MediaDevices API.

![Camera UI - Inactive](https://github.com/user-attachments/assets/51b9c253-cb56-427a-bfca-93346425dccf)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

**👀 Want to see how the UI looks?** Check out the [Viewing Guide](docs/VIEWING_GUIDE.md) for different ways to preview and test the interface!

**📹 Need help with the camera?** See the [Camera Guide](docs/CAMERA_GUIDE.md) for detailed instructions on using the camera feature.

## Features

- 📹 **Local Camera Streaming** - Display your webcam feed in real-time
- 🎮 Interactive parameter controls (speed, ride height, camera views)
- 📡 Command panel with history tracking
- 📊 Live status dashboard with metrics
- 🎨 Modern, responsive GitHub-inspired UI design
- 🔧 Easy customization and extension
- 🔒 Privacy-focused - camera access only when requested

## Components

### Camera Stream
Display your local webcam feed with:
- HD video quality (720p preferred)
- Permission request handling
- Comprehensive error states
- Start/Stop camera controls
- Status indicators (active, requesting, denied, etc.)

### Control Panel
Interactive controls for:
- Model selection (Sedan, SUV, Truck, Custom)
- Speed adjustment (0-200 km/h)
- Ride height control (50-150 mm)
- Camera view selection

### Command Panel
Send commands to Omniverse:
- Start/Stop Simulation
- Reset Scene
- Capture Frame
- Set Quality
- Toggle Grid
- Set Lighting

### Status Dashboard
Monitor real-time metrics:
- Connection status
- FPS and bitrate
- Latency
- System information

## Documentation

- 📖 [Full Documentation](docs/README.md) - Complete technical guide
- 📹 [Camera Guide](docs/CAMERA_GUIDE.md) - How to use the camera feature
- 👀 [Viewing Guide](docs/VIEWING_GUIDE.md) - How to view and test the UI
- 💻 [Usage Examples](docs/USAGE.md) - Integration and code examples
- 🏗️ [Architecture](docs/ARCHITECTURE.md) - System design and structure
- 🎨 [UI Redesign](docs/UI_REDESIGN.md) - GitHub theme documentation

## Camera Usage

1. Click **"Start Camera"** button
2. Allow camera permissions in your browser
3. Your webcam feed will display
4. Click **"Stop Camera"** to turn off

**Troubleshooting**: See [Camera Guide](docs/CAMERA_GUIDE.md) for help with permissions and errors.

## Architecture

Built with modern web technologies and inspired by [NVIDIA Omniverse Blueprint for Digital Twins](https://github.com/NVIDIA-Omniverse-Blueprints/digital-twins-for-fluid-simulation)

## Browser Support

- Chrome 53+ (recommended)
- Firefox 36+
- Safari 11+
- Edge 79+

Requires modern browser with MediaDevices API and camera support.

## Privacy & Security

- 🔒 Camera access only when you click "Start Camera"
- 📹 No video recording or server transmission
- 🛡️ All processing happens locally in your browser
- 🔐 Revoke permissions anytime in browser settings

## License

MIT License
