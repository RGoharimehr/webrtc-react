# WebRTC React - Omniverse Interactive UI

A modern, interactive web interface for controlling NVIDIA Omniverse using WebRTC streaming technology. Built with React and TypeScript.

## Overview

This application provides a comprehensive control panel for sending commands to Omniverse digital twins through WebRTC. It features real-time video streaming, interactive controls, command management, and status monitoring.

![UI Preview](https://github.com/user-attachments/assets/2e4f1b64-1b26-45aa-9a80-dfd085bdf584)

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

## Features

- 🎥 Real-time WebRTC video streaming
- 🎮 Interactive parameter controls (speed, ride height, camera views)
- 📡 Command panel with history tracking
- 📊 Live status dashboard with metrics
- 🎨 Modern, responsive UI design
- 🔧 Easy customization and extension

## Components

### WebRTC Stream
Real-time video streaming from Omniverse with connection management and status indicators.

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

For detailed documentation, see [docs/README.md](docs/README.md)

## Architecture

Inspired by [NVIDIA Omniverse Blueprint for Digital Twins](https://github.com/NVIDIA-Omniverse-Blueprints/digital-twins-for-fluid-simulation)

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

All modern browsers with WebRTC support.

## License

MIT License
