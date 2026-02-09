# WebRTC React - Camera Interface

A modern, interactive web interface featuring WebRTC camera streaming. Built with React and TypeScript.

## Overview

This application provides a camera streaming interface with interactive controls, command management, and status monitoring. The main feature displays your webcam feed using the MediaDevices API.

![Camera UI - Inactive](https://github.com/user-attachments/assets/51b9c253-cb56-427a-bfca-93346425dccf)

## Prerequisites

Before you can run this application, you need:

- **Node.js** (version 14.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- A modern web browser with camera support
- A webcam (built-in or USB)

### First Time Setup?

If you see an error like `npm is not recognized` or don't have Node.js installed:

👉 **Follow our [Setup Guide](docs/SETUP_GUIDE.md)** for detailed installation instructions for Windows, macOS, and Linux.

### Quick Verification

Check if you have Node.js and npm installed:

```bash
node --version  # Should show v14.0.0 or higher
npm --version   # Should show 6.0.0 or higher
```

If these commands don't work, you need to install Node.js first. See the [Setup Guide](docs/SETUP_GUIDE.md).

## Quick Start

**After installing Node.js and npm:**

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

- 🚀 [Setup Guide](docs/SETUP_GUIDE.md) - **Start here!** Installation and prerequisites
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

## Troubleshooting

### "npm is not recognized" Error

If you see this error on Windows, macOS, or Linux, it means Node.js is not installed or not in your PATH.

**Solution:**
1. Install Node.js from [nodejs.org](https://nodejs.org/)
2. Restart your terminal/PowerShell
3. Try again

See our [Setup Guide](docs/SETUP_GUIDE.md) for detailed instructions.

### Other Common Issues

- **Port 3000 already in use**: Another application is using port 3000. Close it or use `PORT=3001 npm start`
- **Module not found errors**: Run `npm install` to install dependencies
- **Camera permission denied**: Allow camera access in your browser settings
- **Browser compatibility**: Use Chrome 53+, Firefox 36+, Safari 11+, or Edge 79+

For more help, see the [Setup Guide](docs/SETUP_GUIDE.md#common-issues-and-solutions).

## License

MIT License
