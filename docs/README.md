# WebRTC-based Omniverse Interactive UI

A modern, interactive web interface for controlling NVIDIA Omniverse using WebRTC streaming technology. This React-TypeScript application provides a comprehensive control panel for sending commands to Omniverse digital twins.

## Features

### 🎥 WebRTC Video Streaming
- Real-time video stream from Omniverse
- WebRTC peer connection management
- Connection state monitoring
- Auto-reconnection support

### 🎮 Interactive Control Panel
- Model selection (Sedan, SUV, Truck, Custom)
- Real-time parameter adjustment
  - Speed control (0-200 km/h)
  - Ride height adjustment (50-150 mm)
- Multiple camera views (Perspective, Top, Side, Front, Rear)
- Apply parameters in real-time

### 📡 Command Panel
- Pre-configured commands for Omniverse:
  - Start/Stop Simulation
  - Reset Scene
  - Capture Frame
  - Set Quality
  - Toggle Grid
  - Set Lighting
- Command history tracking
- Parameter input for advanced commands
- Success/Error status indicators

### 📊 Status Dashboard
- Real-time connection monitoring
- Stream statistics:
  - FPS (Frames Per Second)
  - Bitrate (Mbps)
  - Latency (ms)
  - Uptime tracking
- System information display
- WebRTC protocol support verification

## Architecture

This project is inspired by the [NVIDIA Omniverse Blueprint for Digital Twins](https://github.com/NVIDIA-Omniverse-Blueprints/digital-twins-for-fluid-simulation) and follows a similar architecture:

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   React Web UI  │ ←──────→│  WebRTC Bridge   │ ←──────→│   Omniverse     │
│   (This Repo)   │  WebRTC │                  │  WebRTC │   Kit Server    │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

### Components Structure

```
src/
├── components/
│   ├── WebRTCStream.tsx      # Video streaming component
│   ├── ControlPanel.tsx      # Parameter controls
│   ├── CommandPanel.tsx      # Command interface
│   └── StatusDashboard.tsx   # Metrics and status
├── App.tsx                   # Main application layout
└── index.tsx                 # Application entry point
```

## Installation

### Prerequisites
- Node.js 14+ and npm
- Modern web browser with WebRTC support

### Setup

1. Clone the repository:
```bash
git clone https://github.com/RGoharimehr/webrtc-react.git
cd webrtc-react
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

## Usage

### Connecting to Omniverse

1. **Configure WebRTC Server**: Update the `serverUrl` prop in `App.tsx` to point to your Omniverse WebRTC streaming server:
```typescript
<WebRTCStream 
  serverUrl="ws://your-omniverse-server:8080"
  onConnectionStateChange={handleConnectionStateChange}
/>
```

2. **Click Connect**: Use the Connect button in the WebRTC Stream panel to establish connection

3. **Configure Parameters**: Adjust parameters in the Control Panel (model, speed, ride height)

4. **Send Commands**: Use the Command Panel to send specific commands to Omniverse

### WebRTC Integration

This UI is designed to work with Omniverse Kit App Streaming. To set up the backend:

1. Set up [Omniverse Kit with WebRTC streaming](https://docs.omniverse.nvidia.com/ovas/latest/index.html)
2. Configure the WebRTC signaling server
3. Ensure the following ports are open:
   - Web: `80/tcp`, `1024/udp`
   - Kit: `47995-48012/tcp`, `47995-48012/udp`, `49000-49007/tcp`, `49100/tcp`

## Development

### Available Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

### Customization

#### Adding New Commands

Edit `src/components/CommandPanel.tsx` and add to the `availableCommands` array:

```typescript
{
  name: 'myCustomCommand',
  label: 'My Command',
  description: 'Description of what this does',
  params: ['param1', 'param2']  // Optional
}
```

#### Modifying Control Parameters

Edit `src/components/ControlPanel.tsx` to add new sliders, dropdowns, or inputs:

```typescript
const [myParameter, setMyParameter] = useState(defaultValue);
```

#### Styling

Each component has its own CSS file for easy customization:
- `WebRTCStream.css` - Video player styling
- `ControlPanel.css` - Control panel styling  
- `CommandPanel.css` - Command interface styling
- `StatusDashboard.css` - Dashboard styling
- `App.css` - Overall layout and theme

The color scheme uses NVIDIA green (`#76b900`) as the primary accent color.

## WebRTC Communication Protocol

### Sending Commands

Commands are sent through WebRTC data channels. Implement the actual sending logic in `App.tsx`:

```typescript
const handleSendCommand = (command: string, params?: any) => {
  if (dataChannel && dataChannel.readyState === 'open') {
    const message = JSON.stringify({ command, params });
    dataChannel.send(message);
  }
};
```

### Receiving Stream

The video stream is received through WebRTC's `ontrack` event in `WebRTCStream.tsx`.

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

All modern browsers with WebRTC support.

## Performance Optimization

- Hardware-accelerated video decoding
- Efficient React rendering with hooks
- CSS animations using GPU
- Responsive layout for various screen sizes

## Troubleshooting

### Connection Issues
- Verify WebRTC server is running and accessible
- Check firewall settings for required ports
- Ensure STUN/TURN servers are configured if behind NAT

### Video Not Displaying
- Check browser console for errors
- Verify WebRTC track is being received
- Check video element source object is set

### High Latency
- Check network bandwidth
- Reduce video quality settings
- Verify server processing capacity

## References

- [NVIDIA Omniverse Blueprints - Digital Twins for Fluid Simulation](https://github.com/NVIDIA-Omniverse-Blueprints/digital-twins-for-fluid-simulation)
- [Omniverse Kit App Streaming](https://docs.omniverse.nvidia.com/ovas/latest/index.html)
- [WebRTC API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/RGoharimehr/webrtc-react/issues)
- NVIDIA Omniverse Forums: [Omniverse Forums](https://forums.developer.nvidia.com/c/omniverse/300)

---

Built with ❤️ using React, TypeScript, and WebRTC
