# Using Real Omniverse Streaming (NO STUB MODE)

## Important Clarification

**Omniverse Streaming** and **Flownex Bridge** are **COMPLETELY SEPARATE**:

### Omniverse Streaming (Frontend)
- **What:** WebRTC video streaming from Omniverse Kit
- **Technology:** JavaScript/React with NVIDIA WebRTC library
- **Purpose:** Stream 3D viewport from Omniverse to browser
- **Status:** ✅ NOW USING REAL LIBRARY (not stub)

### Flownex Bridge (Backend)
- **What:** Python API bridge to Flownex software
- **Technology:** Python + FastAPI + pythonnet (.NET interop)
- **Purpose:** Control Flownex simulations from web app
- **Status:** Independent - can be stub or real, doesn't affect Omniverse

## What Changed

The application **NO LONGER** uses stub mode for Omniverse streaming.

### Before (Stub Mode):
```javascript
// Using stub
import { AppStreamer } from '../lib/omniverse-webrtc-stub';
// Showed placeholder graphics instead of real video
```

### After (Real Library):
```javascript
// Using real NVIDIA library
import { AppStreamer, StreamType } from '@nvidia/omniverse-webrtc-streaming-library';
// Connects to actual Omniverse Kit streaming
```

## Setup Instructions

### Step 1: Get the Built Library

The library needs to be in: `node_modules/@nvidia/omniverse-webrtc-streaming-library/`

**Option A: From Your Working Example**
```bash
# If you have the example working, copy the built library
cp -r exapmle/omniverse-webrtc-streaming-library/dist node_modules/@nvidia/omniverse-webrtc-streaming-library/
```

**Option B: From NVIDIA Registry (if you have access)**
```bash
# With proper NVIDIA credentials configured in .npmrc
npm install
```

**Option C: Pre-built Package**
- Get the pre-built library package from NVIDIA
- Extract to `node_modules/@nvidia/omniverse-webrtc-streaming-library/`
- Ensure `dist/` folder exists with these files:
  - `omniverse-webrtc-streaming-library.js`
  - `omniverse-webrtc-streaming-library.umd.cjs`
  - `omniverse-webrtc-streaming-library.d.ts`

### Step 2: Verify Library Installation

```bash
# Check if library is present
ls node_modules/@nvidia/omniverse-webrtc-streaming-library/dist/

# Should show:
# omniverse-webrtc-streaming-library.js
# omniverse-webrtc-streaming-library.umd.cjs
# (and other files)
```

### Step 3: Configure Streaming

Update `stream.config.json`:

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

- **server**: IP address of machine running Omniverse Kit
- **signalingPort**: WebRTC signaling port (default: 49100)
- **mediaPort**: Media streaming port (null = use default)

### Step 4: Start Omniverse Kit with Streaming

1. Launch Omniverse Kit
2. Enable the WebRTC streaming extension
3. Note the IP address and port
4. Update `stream.config.json` if different from defaults

### Step 5: Run the Application

```bash
npm start
```

Then:
1. Click "Connect Omniverse Stream" button
2. Should show "Connecting to Omniverse stream..."
3. When connected, real video stream appears
4. No stub messages or placeholder graphics

## Troubleshooting

### Library Not Found Error

```
Module not found: Can't resolve '@nvidia/omniverse-webrtc-streaming-library'
```

**Solution:** Library not installed. See Step 1 above.

### No Video Appears

**Possible causes:**
1. Omniverse Kit not running
2. Wrong IP address or port in config
3. Firewall blocking connection
4. WebRTC signaling issues

**Check:**
```bash
# Test if Omniverse Kit is listening
curl http://127.0.0.1:49100
# Should get a response (not connection refused)
```

### Build Errors

```
TypeError: Cannot read property 'connect' of undefined
```

**Solution:** Library dist folder missing or incomplete. Ensure:
- `dist/omniverse-webrtc-streaming-library.js` exists
- File is not empty
- Proper module format (ESM/UMD)

## Verification

### Check Current Status

```bash
# Open browser console when app loads
# Should see:
# "AppStreamer connected:" (not "Using stub...")
```

### Visual Indicators

**Stub Mode (OLD - removed):**
- Gradient background with 🎥 emoji
- "Omniverse Stream Connected (Stub Mode)" message
- No real video feed

**Real Mode (NOW):**
- Black background while connecting
- Spinner animation
- Real video feed from Omniverse Kit when connected
- No stub messages

## Example Folder Reference

The `exapmle/` folder contains a working reference implementation:
- Uses the same library
- Shows proper imports and configuration
- Example of real Omniverse streaming

Study `exapmle/src/AppStream.tsx` to see:
- How library is imported
- Configuration structure
- Callback handling

## Common Questions

### Q: Do I need NVIDIA registry access?
**A:** Ideally yes, but if you have the pre-built library from the example or other source, you can use it directly.

### Q: Can I develop without Omniverse Kit running?
**A:** No, not with real library. The app will try to connect and fail. For development without Omniverse, you'd need to temporarily switch back to stub or run a mock WebRTC server.

### Q: What about Flownex Bridge?
**A:** Completely separate! Flownex is backend-only and not related to Omniverse streaming. It can be stub or real independently.

### Q: Will this work with GFN (GeForce NOW)?
**A:** Yes, the library supports both DIRECT (local) and GFN streaming. Update `stream.config.json` source to "gfn" and provide GFN credentials.

## Summary

- ✅ **Omniverse Streaming:** Using REAL library (not stub)
- ✅ **Code Updated:** Imports and usage match NVIDIA example
- ✅ **Separation:** Omniverse and Flownex are independent systems
- ✅ **Ready:** Will connect to actual Omniverse Kit when configured

No more stub mode for Omniverse streaming!
