# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Web Browser                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              React Application (this repo)                 │ │
│  │                                                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │ │
│  │  │   Control    │  │   WebRTC     │  │   Command    │   │ │
│  │  │   Panel      │  │   Stream     │  │   Panel      │   │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │ │
│  │                                                            │ │
│  │  ┌────────────────────────────────────────────────────┐   │ │
│  │  │           Status Dashboard                         │   │ │
│  │  └────────────────────────────────────────────────────┘   │ │
│  │                          │                                 │ │
│  │                          │ WebRTC API                      │ │
│  └──────────────────────────┼─────────────────────────────────┘ │
└────────────────────────────┼───────────────────────────────────┘
                             │
                    WebRTC Connection
                    (Video + Data Channel)
                             │
┌────────────────────────────┼───────────────────────────────────┐
│                            │                                   │
│  ┌─────────────────────────▼────────────────────────────────┐  │
│  │              WebRTC Signaling Server                     │  │
│  │           (WebSocket or HTTP Server)                     │  │
│  └─────────────────────────┬────────────────────────────────┘  │
│                            │                                   │
│  ┌─────────────────────────▼────────────────────────────────┐  │
│  │           NVIDIA Omniverse Kit Application               │  │
│  │                                                          │  │
│  │  - Kit App Streaming                                     │  │
│  │  - WebRTC Video Encoder                                  │  │
│  │  - Command Handler                                       │  │
│  │  - Scene Manager                                         │  │
│  │  - Simulation Engine                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│                    Omniverse Server                            │
└────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
App.tsx (Root Component)
│
├── WebRTCStream (Video & Connection)
│   ├── Video Element
│   ├── Connection Controls
│   └── WebRTC Peer Connection
│       ├── Video Track Handler
│       └── Data Channel Handler
│
├── ControlPanel (Parameter Controls)
│   ├── Model Selection
│   ├── Speed Slider
│   ├── Ride Height Slider
│   ├── Camera View Selector
│   └── Action Buttons
│
├── CommandPanel (Command Interface)
│   ├── Command Grid
│   ├── Command Details
│   └── Command History
│
└── StatusDashboard (Metrics Display)
    ├── Connection Status
    ├── Stream Stats (FPS, Bitrate, Latency)
    └── System Information
```

## Data Flow

### 1. Connection Establishment

```
User clicks "Connect"
    ↓
WebRTCStream creates RTCPeerConnection
    ↓
ICE Candidate gathering
    ↓
Exchange SDP offer/answer with server
    ↓
WebRTC connection established
    ↓
Video stream received via ontrack event
    ↓
Video displayed in video element
```

### 2. Sending Parameters

```
User adjusts slider in Control Panel
    ↓
onChange event fires
    ↓
onParameterChange callback to App
    ↓
handleParameterChange in App
    ↓
Send via WebRTC data channel
    ↓
Omniverse receives parameter
    ↓
Simulation updated
```

### 3. Sending Commands

```
User clicks command button
    ↓
handleSendCommand in CommandPanel
    ↓
Add to command history
    ↓
Send to App via onSendCommand callback
    ↓
App sends via WebRTC data channel
    ↓
Omniverse processes command
    ↓
Response sent back (optional)
    ↓
Update UI with result
```

## WebRTC Communication Protocol

### Message Format

All messages sent via data channel use JSON format:

#### Command Messages
```json
{
  "type": "command",
  "command": "startSimulation",
  "params": {
    "speed": 100,
    "rideHeight": 150
  },
  "timestamp": 1234567890123
}
```

#### Parameter Messages
```json
{
  "type": "parameter",
  "name": "speed",
  "value": 75,
  "timestamp": 1234567890123
}
```

#### Response Messages (from Omniverse)
```json
{
  "type": "response",
  "commandId": "abc123",
  "status": "success",
  "data": {
    "message": "Simulation started"
  },
  "timestamp": 1234567890124
}
```

## State Management

### App-Level State

```typescript
interface AppState {
  connectionState: string;          // WebRTC connection state
  streamStats: StreamStats;         // FPS, bitrate, latency
  dataChannel?: RTCDataChannel;     // WebRTC data channel
}
```

### Component-Level State

**ControlPanel:**
```typescript
{
  speed: number;
  rideHeight: number;
  selectedModel: string;
  selectedCamera: string;
}
```

**CommandPanel:**
```typescript
{
  selectedCommand: string;
  commandParams: Record<string, string>;
  commandHistory: CommandHistoryItem[];
}
```

**StatusDashboard:**
```typescript
{
  uptime: number;
  startTime: number;
}
```

**WebRTCStream:**
```typescript
{
  connectionState: string;
  peerConnection: RTCPeerConnection | null;
}
```

## Responsive Design

The UI adapts to different screen sizes:

### Desktop (>1200px)
- Three-column layout
- Control Panel (left sidebar, 350px)
- Main Content (center, flex 1)
- Command Panel (right sidebar, 350px)

### Tablet (768px - 1200px)
- Single column layout
- Main Content (top)
- Control Panel (middle)
- Command Panel (bottom)

### Mobile (<768px)
- Stacked layout
- Smaller padding and margins
- Simplified header

## Performance Considerations

### Video Streaming
- Hardware-accelerated video decoding
- Adaptive bitrate based on network conditions
- Automatic resolution scaling

### React Rendering
- Functional components with hooks
- Minimal re-renders using proper state management
- CSS-based animations (GPU-accelerated)

### Network Optimization
- Efficient WebRTC configuration
- STUN/TURN server setup for NAT traversal
- Connection quality monitoring

## Security Considerations

### WebRTC Security
- Encrypted media streams (DTLS-SRTP)
- Secure data channel (SCTP over DTLS)
- ICE candidate validation

### Authentication
- Server-side authentication required
- Token-based access control (to be implemented)
- Session management

### Input Validation
- Parameter bounds checking
- Command validation
- Sanitized user inputs

## Extensibility Points

### Adding New Components
1. Create component in `src/components/`
2. Import and use in `App.tsx`
3. Pass necessary callbacks and state

### Adding New Commands
1. Edit `CommandPanel.tsx`
2. Add to `availableCommands` array
3. Implement handler in Omniverse backend

### Custom Styling
1. Edit component CSS files
2. Modify theme colors in root CSS variables
3. Update responsive breakpoints as needed

### Backend Integration
1. Implement WebRTC signaling server
2. Create Omniverse Kit extension
3. Handle commands in extension
4. Send responses back to UI

## Technology Stack

### Frontend
- React 18
- TypeScript 4.9+
- Create React App (build tooling)
- WebRTC APIs (native browser)

### Styling
- CSS3
- Flexbox & Grid layouts
- Custom CSS per component

### Development Tools
- npm (package management)
- React Scripts (dev server & build)
- TypeScript compiler

## Deployment

### Static Hosting
Can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any static file server

### Build Output
```
build/
├── static/
│   ├── js/       # JavaScript bundles
│   ├── css/      # Stylesheets
│   └── media/    # Images, fonts
├── index.html    # Entry point
└── asset-manifest.json
```

### Environment Configuration
- Use environment variables for server URLs
- Create `.env` files for different environments
- Configure via `process.env` in React

## Future Enhancements

Potential improvements:
- [ ] Add authentication and authorization
- [ ] Implement WebRTC stats collection
- [ ] Add recording functionality
- [ ] Create preset management system
- [ ] Add multi-user collaboration
- [ ] Implement undo/redo for commands
- [ ] Add keyboard shortcuts
- [ ] Create mobile app version
- [ ] Add accessibility features (ARIA labels, keyboard navigation)
- [ ] Implement internationalization (i18n)
