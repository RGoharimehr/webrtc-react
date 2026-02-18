# Summary: Removed Stub Mode for Omniverse Streaming

## What Changed

The application **NO LONGER uses stub mode** for Omniverse streaming. It now uses the **REAL NVIDIA Omniverse WebRTC Streaming Library**.

## Files Modified

### 1. `src/components/AppStream.js`
**Before:**
```javascript
import { AppStreamer } from '../lib/omniverse-webrtc-stub';
// Used stub with placeholder graphics
```

**After:**
```javascript
import { AppStreamer, StreamType } from '@nvidia/omniverse-webrtc-streaming-library';
// Uses real NVIDIA library with actual video streaming
```

**Changes:**
- Import from real library instead of stub
- Use `StreamType.DIRECT` enum
- Removed stub placeholder content (gradient background, emoji)
- Removed "Using stub library" message
- Real video element will now show Omniverse Kit feed

### 2. `package.json`
**Before:**
```json
"optionalDependencies": {
  "@nvidia/omniverse-webrtc-streaming-library": "5.6.0"
}
```

**After:**
```json
"dependencies": {
  "@nvidia/omniverse-webrtc-streaming-library": "file:./exapmle/omniverse-webrtc-streaming-library",
  ...
}
```

**Changes:**
- Moved from optional to required dependency
- Uses local file reference to library in example folder

### 3. Documentation
- **Added:** `OMNIVERSE_REAL_LIBRARY.md` - Complete setup guide
- **Updated:** `README.md` - Removed stub mode section, added real streaming instructions

## Important Clarification

### Omniverse Streaming (Frontend)
- **Status:** ✅ **REAL library** (NOT stub)
- **What:** WebRTC video streaming from Omniverse Kit to browser
- **Technology:** JavaScript/React + NVIDIA WebRTC library
- **Location:** Frontend only

### Flownex Bridge (Backend)
- **Status:** Independent (can be stub or real)
- **What:** Python API bridge to Flownex software
- **Technology:** Python + FastAPI + pythonnet
- **Location:** Backend only (`flownex-bridge/`)

**These are COMPLETELY SEPARATE systems!**

## What Users Will See

### Old Behavior (Stub Mode):
1. Click "Connect Omniverse Stream"
2. See placeholder with gradient background
3. Message: "Omniverse Stream Connected (Stub Mode)"
4. Emoji 🎥 and "Stream Active" badge
5. No actual video

### New Behavior (Real Library):
1. Click "Connect Omniverse Stream"
2. See connecting spinner
3. Real video feed from Omniverse Kit appears
4. Full WebRTC streaming with mouse/keyboard interaction
5. Actual 3D viewport from Omniverse

## Setup Requirements

To use the real Omniverse streaming:

1. **Library must be built/installed**
   - Pre-built version in `node_modules/@nvidia/omniverse-webrtc-streaming-library/dist/`
   - Or copy from working example
   - Or build from source (requires NVIDIA registry access)

2. **Omniverse Kit must be running**
   - With WebRTC streaming extension enabled
   - Default: http://127.0.0.1:49100

3. **Configuration in `stream.config.json`**
   - Set server IP address
   - Set signaling port
   - Source should be "local"

## Testing

### Verify Real Library is Used:

1. **Check import:**
   ```bash
   grep "@nvidia/omniverse-webrtc-streaming-library" src/components/AppStream.js
   # Should find: import { AppStreamer, StreamType } from '@nvidia/...'
   ```

2. **Check no stub references:**
   ```bash
   grep "stub" src/components/AppStream.js
   # Should find nothing or only comments
   ```

3. **Run application:**
   ```bash
   npm start
   # Open browser console
   # Should NOT see: "Using stub for NVIDIA Omniverse WebRTC Streaming Library"
   ```

4. **Click Connect button:**
   - Should see spinner
   - Should NOT see gradient background with emoji
   - Should attempt real WebRTC connection

## Troubleshooting

### "Module not found: @nvidia/omniverse-webrtc-streaming-library"

**Cause:** Library not installed

**Solution:**
```bash
# Option 1: Copy from example (if example works)
cp -r exapmle/omniverse-webrtc-streaming-library/dist node_modules/@nvidia/omniverse-webrtc-streaming-library/

# Option 2: Get pre-built package from NVIDIA
# Place in node_modules/@nvidia/omniverse-webrtc-streaming-library/
```

### "Cannot read property 'connect' of undefined"

**Cause:** Library installed but not built (no dist/ folder)

**Solution:** Ensure `node_modules/@nvidia/omniverse-webrtc-streaming-library/dist/` exists with:
- `omniverse-webrtc-streaming-library.js`
- `omniverse-webrtc-streaming-library.umd.cjs`

### No video appears after connecting

**Causes:**
1. Omniverse Kit not running
2. Wrong IP/port in config
3. Firewall blocking connection

**Solution:**
- Start Omniverse Kit with streaming
- Check `stream.config.json` settings
- Test connection: `curl http://127.0.0.1:49100`

## Migration Path

If you had stub mode working and want real streaming:

1. ✅ Code already updated (this PR)
2. ✅ Imports changed to real library
3. ⏳ User needs to: Install built library
4. ⏳ User needs to: Start Omniverse Kit
5. ⏳ User needs to: Configure stream.config.json
6. ✅ Then it works!

## Benefits

### With Real Library:
- ✅ Actual Omniverse 3D viewport streaming
- ✅ Real-time video/audio
- ✅ Mouse and keyboard interaction
- ✅ Low latency WebRTC
- ✅ Production-ready

### Old Stub Mode:
- ❌ Fake placeholder graphics
- ❌ No real streaming
- ❌ Only for UI development
- ❌ Not production-ready

## Conclusion

The application is now configured to use **REAL Omniverse streaming**. Stub mode has been removed for the Omniverse streaming functionality.

**Omniverse = Real streaming** (frontend)
**Flownex = Separate system** (backend, can be stub or real independently)

No more confusion between the two systems!
