# AppStream Implementation Guide

## Overview

The `AppStream` component is aligned with NVIDIA's official example implementation and supports all three streaming deployment modes.

## Copyright & License

```
SPDX-FileCopyrightText: Copyright (c) 2024 NVIDIA CORPORATION & AFFILIATES
SPDX-License-Identifier: LicenseRef-NvidiaProprietary
```

This component includes NVIDIA proprietary code. Usage requires agreement with NVIDIA's license terms.

## Three Streaming Modes

### 1. Local Mode (DIRECT)

**Use Case:** Development and testing with Kit running on your local machine.

**Configuration (`stream.config.json`):**
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

**How It Works:**
- Connects directly to Kit application on localhost
- Uses WebRTC DIRECT streaming
- No authentication by default (set `authenticate: true` for auth)
- Ideal for development

**Video Element:** `#remote-video` (component manages)

**Props Used:**
- None (reads from config)

---

### 2. Stream Mode (OKAS - Omniverse Kit Application Streaming)

**Use Case:** Production deployment with on-demand cloud streaming.

**Configuration (`stream.config.json`):**
```json
{
  "source": "stream",
  "stream": {
    "appServer": "https://your-app-server.com",
    "streamServer": "https://your-stream-server.com"
  }
}
```

**How It Works:**
- Connects to OKAS API
- Creates streaming session on demand
- Uses session ID and backend URL
- Automatic launch with `autoLaunch: true`

**Video Element:** `#remote-video` (component manages)

**Props Required:**
```javascript
<AppStream
  sessionId="your-session-id"
  backendUrl="https://your-backend.com"
  signalingserver="stream-server.com"
  signalingport={8080}
  mediaserver="media-server.com"
  mediaport={8081}
  onStarted={() => {}}
  onStreamFailed={() => {}}
  onLoggedIn={(userId) => {}}
  handleCustomEvent={(event) => {}}
/>
```

**Special Features:**
- Error alerts shown to user
- Session management
- Backend integration
- No authentication (managed by OKAS)

---

### 3. GFN Mode (Graphics Delivery Network)

**Use Case:** Enterprise deployments using NVIDIA's GFN service.

**Configuration (`stream.config.json`):**
```json
{
  "source": "gfn",
  "gfn": {
    "catalogClientId": "your-catalog-client-id",
    "clientId": "your-client-id",
    "cmsId": 12345
  }
}
```

**How It Works:**
- Connects to GFN infrastructure
- Uses GFN SDK (global `GFN` object)
- Library handles all UI rendering
- Component provides container div only

**Video Element:** None (GFN library handles rendering)

**Props Used:**
- None (reads from config, GFN handles everything)

**Render Output:**
```html
<div id="view" style="...">
  <!-- GFN library injects content here -->
</div>
```

---

## Component Props

### Required Props

```javascript
AppStream.propTypes = {
  // OKAS/Stream mode props
  sessionId: PropTypes.string,
  backendUrl: PropTypes.string,
  signalingserver: PropTypes.string,
  signalingport: PropTypes.number,
  mediaserver: PropTypes.string,
  mediaport: PropTypes.number,
  accessToken: PropTypes.string,
  
  // Common props
  style: PropTypes.object,
  onStarted: PropTypes.func,
  onStreamFailed: PropTypes.func,
  onLoggedIn: PropTypes.func,
  handleCustomEvent: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func
};
```

### Callbacks

**onStarted()**
- Called when stream successfully starts
- `message.action === 'start' && message.status === 'success'`

**onStreamFailed()**
- Called on any error
- In OKAS mode, also shows alert to user

**onLoggedIn(userId)**
- Called after successful authentication
- `message.action === 'authUser' && message.status === 'success'`
- Receives user ID string

**handleCustomEvent(event)**
- Called for custom events from Kit application
- Bidirectional messaging

**onFocus() / onBlur()**
- For managing keyboard/mouse focus
- Useful for multi-window applications

---

## Stream Configuration Details

### Local Mode Config

```javascript
{
  videoElementId: 'remote-video',
  audioElementId: 'remote-audio',
  authenticate: true,
  maxReconnects: 20,
  signalingServer: '127.0.0.1',
  signalingPort: 49100,
  mediaServer: '127.0.0.1',
  mediaPort: null,  // optional
  nativeTouchEvents: true,
  width: 1920,
  height: 1080,
  fps: 60,
  onUpdate: (message) => {},
  onStart: (message) => {},
  onCustomEvent: (message) => {},
  onStop: (message) => {},
  onTerminate: (message) => {}
}
```

### OKAS/Stream Mode Config

```javascript
{
  signalingServer: props.signalingserver,
  signalingPort: props.signalingport,
  mediaServer: props.mediaserver,
  mediaPort: props.mediaport,
  backendUrl: props.backendUrl,
  sessionId: props.sessionId,
  autoLaunch: true,  // Auto-start session
  cursor: 'free',    // Cursor mode
  mic: false,        // Microphone support
  videoElementId: 'remote-video',
  audioElementId: 'remote-audio',
  authenticate: false,  // OKAS handles auth
  maxReconnects: 20,
  nativeTouchEvents: true,
  width: 1920,
  height: 1080,
  fps: 60,
  // ... callbacks
}
```

### GFN Mode Config

```javascript
{
  GFN: window.GFN,  // Global GFN SDK object
  catalogClientId: config.gfn.catalogClientId,
  clientId: config.gfn.clientId,
  cmsId: config.gfn.cmsId,
  onUpdate: (message) => {},
  onStart: (message) => {},
  onCustomEvent: (message) => {}
}
```

---

## Usage Examples

### Local Development

```javascript
// stream.config.json
{
  "source": "local",
  "local": {
    "server": "127.0.0.1",
    "signalingPort": 49100,
    "mediaPort": null
  }
}

// App.js
<AppStream
  style={{ width: '100%', height: '600px' }}
  onStarted={() => console.log('Stream started!')}
  onStreamFailed={() => console.error('Stream failed')}
/>
```

### OKAS Production

```javascript
// stream.config.json
{
  "source": "stream",
  "stream": {
    "appServer": "https://your-okas-api.com",
    "streamServer": "https://your-stream.com"
  }
}

// App.js
const [sessionData, setSessionData] = useState(null);

// First, create session via OKAS API
const createSession = async () => {
  const response = await fetch('https://your-okas-api.com/sessions', {
    method: 'POST',
    body: JSON.stringify({ app: 'my-kit-app' })
  });
  const data = await response.json();
  setSessionData(data);
};

// Then render AppStream with session data
{sessionData && (
  <AppStream
    sessionId={sessionData.sessionId}
    backendUrl={sessionData.backendUrl}
    signalingserver={sessionData.signalingServer}
    signalingport={sessionData.signalingPort}
    mediaserver={sessionData.mediaServer}
    mediaport={sessionData.mediaPort}
    onStarted={() => console.log('OKAS stream started')}
    onStreamFailed={() => setSessionData(null)}
  />
)}
```

### GFN Deployment

```javascript
// stream.config.json
{
  "source": "gfn",
  "gfn": {
    "catalogClientId": "your-catalog-id",
    "clientId": "your-client-id",
    "cmsId": 123456
  }
}

// index.html - Include GFN SDK
<script src="https://gfn-sdk-url/gfn.js"></script>

// App.js
<AppStream
  style={{ width: '100%', height: '100vh' }}
  onStarted={() => console.log('GFN stream started')}
  handleCustomEvent={(event) => {
    console.log('GFN event:', event);
  }}
/>
```

---

## Messaging

### Send Message to Kit

```javascript
AppStream.sendMessage({
  event_type: 'openFile',
  payload: {
    path: '/path/to/file.usd'
  }
});
```

### Receive Messages from Kit

```javascript
<AppStream
  handleCustomEvent={(message) => {
    console.log('Received:', message);
    
    if (message.event_type === 'fileOpened') {
      console.log('File opened:', message.payload);
    }
  }}
/>
```

---

## Stopping the Stream

```javascript
// From anywhere in your app
AppStream.stop();

// Component will call:
// - AppStreamer.stop()
// - Clean up resources
// - componentWillUnmount handles this automatically
```

---

## Troubleshooting

### Local Mode

**Issue:** Can't connect to localhost
- Check Kit application is running
- Verify port 49100 is open
- Check firewall settings

### OKAS Mode

**Issue:** Session creation fails
- Verify OKAS credentials
- Check backend URL is correct
- Ensure session ID is valid

**Issue:** Alert shown with error
- This is intentional in OKAS mode
- Check console for detailed error
- Verify all required props are provided

### GFN Mode

**Issue:** `GFN is not defined`
- Ensure GFN SDK script is loaded in `<head>`
- Check `window.GFN` exists before mounting component
- Verify GFN credentials

**Issue:** Nothing renders
- GFN library handles rendering
- Check browser console for GFN errors
- Verify div with id="view" exists

---

## Advanced Features

### Custom Reconnection

Adjust `maxReconnects` in config:
```javascript
maxReconnects: 50  // Allow more reconnection attempts
```

### Resolution & FPS

```javascript
width: 2560,
height: 1440,
fps: 120
```

### Touch Events

```javascript
nativeTouchEvents: true  // Enable for mobile/tablet
```

### Cursor Modes (OKAS)

```javascript
cursor: 'free'     // Free cursor
cursor: 'locked'   // Locked cursor (FPS games)
cursor: 'hidden'   // Hidden cursor
```

---

## Differences from NVIDIA TypeScript Example

1. **Language:** JavaScript instead of TypeScript
2. **Prop Validation:** PropTypes instead of interfaces
3. **Class Fields:** Still use static class properties
4. **Structure:** Otherwise identical to official example

The component is functionally equivalent to NVIDIA's TypeScript implementation.

---

## Summary

The AppStream component now:
- ✅ Matches NVIDIA's official implementation
- ✅ Supports all three deployment modes
- ✅ Includes proper copyright attribution
- ✅ Uses same APIs and callbacks
- ✅ Provides professional production-ready code

Choose the mode that fits your deployment:
- **Local:** Development
- **OKAS:** Managed cloud streaming
- **GFN:** Enterprise GeForce NOW
