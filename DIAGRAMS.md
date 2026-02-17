# Repository Structure Diagrams

This document provides visual representations of how this webapp integrates with the kit-cae repository.

## Current State

```
┌─────────────────────────────────────────────────────────────┐
│  RGoharimehr/webrtc-react (THIS REPOSITORY)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React Web Application                                 │ │
│  │  - WebSocket Client (kitClient.js)                    │ │
│  │  - React UI Components                                │ │
│  │  - WebRTC Video Client                                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓ 
                    Should be integrated into
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  NVIDIA-Omniverse/kit-cae                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Omniverse Kit Extension                               │ │
│  │  - WebSocket Server (to be implemented)               │ │
│  │  - Simulation Engine (Flownex)                        │ │
│  │  - WebRTC Streaming                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Target Integration Structure

### Option 1: Subdirectory (Recommended)

```
NVIDIA-Omniverse/kit-cae/
├── .github/
│   └── workflows/
│       ├── ci.yml              # Updated to build webapp
│       └── deploy.yml
├── docs/
│   ├── extension.md
│   ├── webapp.md               # NEW: Webapp documentation
│   └── api.md                  # NEW: API documentation
├── exts/
│   └── omni.cdu.physics/       # Kit extension
│       ├── omni/
│       │   └── cdu/
│       │       └── physics/
│       │           ├── extension.py
│       │           ├── ws_server.py      # NEW: WebSocket server
│       │           ├── api_handlers.py   # NEW: API handlers
│       │           └── flownex_main.py
│       ├── config/
│       │   └── extension.toml  # Updated with WS settings
│       └── data/
├── webapp/                      # NEW: This web application
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/
│   │   │   └── kitClient.js    # WebSocket client
│   │   ├── components/
│   │   │   ├── GraphsPanel.js
│   │   │   └── DraggableResizable.js
│   │   ├── tabs/
│   │   │   ├── OperatingConditions.js
│   │   │   ├── ResultsVisualization.js
│   │   │   ├── Plotting.js
│   │   │   ├── ResultsMapping.js
│   │   │   └── Configuration.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── .env
│   ├── package.json
│   ├── README.md
│   ├── INTEGRATION.md
│   ├── QUICKSTART.md
│   ├── KIT_CAE_BACKEND_API.md
│   └── FOR_KIT_CAE_MAINTAINERS.md
├── README.md                    # Updated with webapp section
├── CONTRIBUTING.md              # Updated with webapp guidelines
└── LICENSE
```

### Option 2: Git Submodule

```
NVIDIA-Omniverse/kit-cae/
├── .gitmodules                  # Submodule configuration
├── exts/
│   └── omni.cdu.physics/
├── webapp/                      # Git submodule → RGoharimehr/webrtc-react
│   └── (all webapp files)
└── README.md
```

## Communication Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User's Browser                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              React Web Application (Port 3000)                │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │  │
│  │  │ UI Components│  │  kitClient   │  │  WebRTC Client   │  │  │
│  │  │  (React)     │  │ (WebSocket)  │  │   (Video)        │  │  │
│  │  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │  │
│  └─────────┼──────────────────┼────────────────────┼────────────┘  │
└────────────┼──────────────────┼────────────────────┼───────────────┘
             │                  │                    │
             │                  │ WebSocket          │ WebRTC
             │                  │ (port 49080)       │ (port 49100)
             │                  ↓                    ↓
┌────────────┼──────────────────────────────────────────────────────┐
│            │         Omniverse Kit Extension                       │
│            │                                                        │
│  ┌─────────┼──────────────────────────────────────────────────┐  │
│  │         ↓                                                    │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │  │
│  │  │ Extension UI │  │  WS Server   │  │  WebRTC Server   │  │  │
│  │  │  (Optional)  │  │  (Port 49080)│  │  (Port 49100)    │  │  │
│  │  └──────────────┘  └──────┬───────┘  └────────┬─────────┘  │  │
│  │                           │                    │             │  │
│  │                    ┌──────┴────────┐          │             │  │
│  │                    │ API Handlers  │          │             │  │
│  │                    └──────┬────────┘          │             │  │
│  │                           │                    │             │  │
│  │                    ┌──────┴────────────────────┴─────┐      │  │
│  │                    │   FlownexMain / Simulation     │      │  │
│  │                    │   - Run solver                  │      │  │
│  │                    │   - Manage data                 │      │  │
│  │                    │   - Update visualization        │      │  │
│  │                    └────────────────────────────────┘      │  │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────┐
│   Browser    │
│  (React UI)  │
└──────┬───────┘
       │
       │ 1. User clicks "Start Simulation"
       ↓
┌──────────────────────────────────┐
│  kitClient.startTransient()     │
│  WebSocket Message:              │
│  {                               │
│    type: "sim.startTransient",  │
│    requestId: "req_123"         │
│  }                               │
└──────┬───────────────────────────┘
       │
       │ 2. Send via WebSocket
       ↓
┌──────────────────────────────────┐
│  Kit Extension WS Server         │
│  - Receive message               │
│  - Route to handler              │
└──────┬───────────────────────────┘
       │
       │ 3. Call simulation method
       ↓
┌──────────────────────────────────┐
│  FlownexMain                     │
│  - Start simulation timer        │
│  - Begin solver iterations       │
└──────┬───────────────────────────┘
       │
       │ 4. Send response
       ↓
┌──────────────────────────────────┐
│  WebSocket Response:             │
│  {                               │
│    type: "sim.startTransient...",│
│    requestId: "req_123",        │
│    ok: true,                    │
│    payload: {status: "started"} │
│  }                               │
└──────┬───────────────────────────┘
       │
       │ 5. Receive response
       ↓
┌──────────────────────────────────┐
│  Browser                         │
│  - Update UI (show "Running")    │
│  - Enable stop button            │
└──────────────────────────────────┘
       ↑
       │ 6. Push updates (periodic)
       │
┌──────────────────────────────────┐
│  FlownexMain                     │
│  - Calculate outputs every 500ms │
│  - Push to all connected clients │
│  Message: {                      │
│    type: "push.outputs",        │
│    payload: {                   │
│      temperature: 68.5,         │
│      pressure: 1.35,            │
│      time: 21.0                 │
│    }                            │
│  }                              │
└──────────────────────────────────┘
```

## Deployment Diagram

### Development Environment

```
┌─────────────────────────────────────────────────────────────┐
│  Developer Machine                                           │
│                                                               │
│  ┌────────────────────┐      ┌─────────────────────────┐   │
│  │  Terminal 1        │      │  Terminal 2             │   │
│  │                    │      │                         │   │
│  │  $ ./omni.sh      │      │  $ cd webapp            │   │
│  │    --enable        │      │  $ npm start            │   │
│  │    omni.cdu...     │      │                         │   │
│  │                    │      │  Serving on             │   │
│  │  Kit Extension     │      │  localhost:3000         │   │
│  │  Port 49080 ✓      │      │                         │   │
│  │  Port 49100 ✓      │      │                         │   │
│  └────────────────────┘      └─────────────────────────┘   │
│           ↕                            ↕                     │
│           └────────── localhost ───────┘                     │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Browser: http://localhost:3000                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Production Environment

```
┌─────────────────────────────────────────────────────────────┐
│  Production Server (e.g., 192.168.1.100)                    │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Omniverse Kit                                        │  │
│  │  - Extension with WebSocket server                   │  │
│  │  - Port 49080 (API)                                  │  │
│  │  - Port 49100 (WebRTC)                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↕                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Nginx Web Server (Port 80/443)                      │  │
│  │  - Serves webapp/build/ static files                │  │
│  │  - Proxies /ws → localhost:49080                     │  │
│  │  - Proxies /webrtc → localhost:49100                 │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────┘
                                │
                                │ Internet
                                ↓
                    ┌───────────────────────┐
                    │  User's Browser       │
                    │  https://your-app.com │
                    └───────────────────────┘
```

## File Organization Comparison

### Before Integration
```
Two separate repositories:

RGoharimehr/webrtc-react          NVIDIA-Omniverse/kit-cae
├── src/                          ├── exts/
├── public/                       │   └── omni.cdu.physics/
├── package.json                  ├── docs/
└── README.md                     └── README.md

❌ Disconnected
❌ Separate maintenance
❌ Complex deployment
```

### After Integration
```
Single unified repository:

NVIDIA-Omniverse/kit-cae
├── exts/
│   └── omni.cdu.physics/        # Backend
│       └── ws_server.py         # NEW
├── webapp/                       # Frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── docs/
│   └── webapp.md                # NEW
└── README.md                     # Updated

✅ Unified codebase
✅ Single repository
✅ Simplified deployment
✅ Better version control
```

## Next Steps

1. **Choose Integration Method**: Subdirectory, submodule, or subtree
2. **Follow Guide**: See FOR_KIT_CAE_MAINTAINERS.md
3. **Implement Backend**: See KIT_CAE_BACKEND_API.md
4. **Test Integration**: Follow QUICKSTART.md
5. **Deploy**: See INTEGRATION.md deployment section
