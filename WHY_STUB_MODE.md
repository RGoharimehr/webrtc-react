# Why Does the Application Use Stub Mode?

## Overview

Your application currently operates in **stub mode** in two separate areas:

1. **Frontend**: Omniverse WebRTC Streaming (JavaScript/React)
2. **Backend**: Flownex Bridge Integration (Python)

This document explains why each is in stub mode and how to enable real functionality.

---

## 1. Frontend Stub Mode (Omniverse WebRTC)

### Current Status: ❌ STUB MODE ACTIVE

### Why It's in Stub Mode

The NVIDIA Omniverse WebRTC Streaming Library is **not installed**.

**Evidence:**
```bash
npm list @nvidia/omniverse-webrtc-streaming-library
# Output: (empty) - Library not found
```

**Code Location:**
- File: `src/components/AppStream.js`
- Line 5: `import { AppStreamer } from '../lib/omniverse-webrtc-stub';`

This imports the **stub implementation** instead of the real library.

### What Stub Mode Provides

The stub (`src/lib/omniverse-webrtc-stub.js`) simulates:
- ✅ Connection sequence with realistic timing
- ✅ Callback system (onStart, onUpdate, onCustomEvent)
- ✅ Visual feedback (connecting → connected states)
- ✅ UI development without real streaming

**Console Output in Stub Mode:**
```
Using stub for NVIDIA Omniverse WebRTC Streaming Library
To use real Omniverse streaming, install: npm install
AppStreamer.connect called with: {streamConfig, streamSource}
Simulating connection to Omniverse stream...
```

### What's Missing in Stub Mode

- ❌ No real video stream from Omniverse Kit
- ❌ No actual WebRTC connection
- ❌ No interactive 3D viewport
- ❌ Just placeholder graphics

### How to Exit Frontend Stub Mode

#### Prerequisites:
1. **NVIDIA Registry Access** - The library is hosted on a private NVIDIA registry
2. **Running Omniverse Kit Application** - With streaming enabled

#### Step 1: Verify Registry Access

The `.npmrc` file is already configured:
```
registry=https://registry.npmjs.org
@nvidia:registry=https://edge.urm.nvidia.com:443/artifactory/api/npm/omniverse-client-npm/
```

#### Step 2: Install the Library

```bash
npm install
```

If you get an error like `ENOTFOUND edge.urm.nvidia.com`, you need NVIDIA registry credentials.

#### Step 3: Update AppStream.js

**Current (Stub):**
```javascript
import { AppStreamer } from '../lib/omniverse-webrtc-stub';
```

**Change to (Real):**
```javascript
import { AppStreamer } from '@nvidia/omniverse-webrtc-streaming-library';
```

#### Step 4: Configure Streaming

Update `stream.config.json`:
```json
{
    "source": "local",
    "local": {
        "server": "127.0.0.1",      // Your Omniverse Kit IP
        "signalingPort": 49100,      // WebRTC signaling port
        "mediaPort": null
    }
}
```

#### Step 5: Start Omniverse Kit

1. Launch Omniverse Kit application
2. Enable streaming extension
3. Note the IP address and port

#### Step 6: Test

```bash
npm start
# Click "Connect Omniverse Stream"
# Should show real video from Omniverse Kit
```

---

## 2. Backend Stub Mode (Flownex Bridge)

### Current Status: ❌ STUB MODE ACTIVE

### Why It's in Stub Mode

The `pythonnet` library (which provides .NET interop via `clr`) is **not installed**.

**Evidence:**
```bash
cd flownex-bridge
python -c "import clr"
# Output: ModuleNotFoundError: No module named 'clr'
```

**Code Location:**
- File: `flownex-bridge/adapters/flownex_direct.py`
- Lines 6-10:
```python
try:
    import clr  # noqa
    PYTHONNET_OK = True
except Exception:
    PYTHONNET_OK = False  # ← Currently False (stub mode)
```

### What Stub Mode Provides

When `PYTHONNET_OK = False`, the FlownexDirectAdapter:
- ✅ Accepts all commands without error
- ✅ Returns dummy data (0.0 for all outputs)
- ✅ Allows UI/workflow development
- ✅ Enables testing without Flownex installed

**Example Stub Behavior:**
```python
def open_project(self, project_path: str) -> None:
    if not PYTHONNET_OK:
        # STUB: Just mark as opened
        self._opened = True
        return
    # Real implementation would open actual Flownex project
```

### What's Missing in Stub Mode

- ❌ No real Flownex project loading
- ❌ No actual simulations
- ❌ No real input/output data
- ❌ All outputs return 0.0

### How to Exit Backend Stub Mode

#### Prerequisites:
1. **Flownex Software** - Installed on Windows (typically)
2. **pythonnet Library** - For .NET interop
3. **Flownex API Access** - Documentation and assemblies

#### Step 1: Install pythonnet

```bash
pip install pythonnet
```

**Note:** pythonnet works best on Windows. On Linux/Mac, you may need special configuration.

#### Step 2: Verify Installation

```bash
python -c "import clr; print('pythonnet OK')"
# Should output: pythonnet OK
```

#### Step 3: Configure Flownex API

Update `flownex-bridge/adapters/flownex_direct.py`:

**Current (Stub):**
```python
def open_project(self, project_path: str) -> None:
    self._project_path = project_path
    
    if not PYTHONNET_OK:
        self._opened = True  # Stub mode
        return
    
    # TODO: REAL IMPLEMENTATION
    self._opened = True
```

**Change to (Real):**
```python
def open_project(self, project_path: str) -> None:
    self._project_path = project_path
    
    if not PYTHONNET_OK:
        self._opened = True
        return
    
    # REAL IMPLEMENTATION
    import clr
    clr.AddReference('FlownexAPI')  # Add Flownex DLL
    from Flownex import Application  # Import Flownex types
    
    self._api = Application()
    self._api.Open(project_path)
    self._opened = True
```

#### Step 4: Implement Other Methods

You'll need to implement:
- `close_project()` - Close Flownex project
- `set_property()` - Set component values
- `solve_steady()` - Run simulation
- `read_outputs()` - Get results

#### Step 5: Test

```bash
cd flownex-bridge
python -c "from adapters.flownex_direct import FlownexDirectAdapter; print('PYTHONNET_OK:', __import__('adapters.flownex_direct').flownex_direct.PYTHONNET_OK)"
# Should output: PYTHONNET_OK: True
```

---

## Quick Diagnosis

### Check Current Status

Run this command to see your current stub mode status:

```bash
# Frontend check
npm list @nvidia/omniverse-webrtc-streaming-library

# Backend check
cd flownex-bridge && python -c "
try:
    import clr
    print('✅ pythonnet installed - Can use real Flownex')
except:
    print('❌ pythonnet NOT installed - Using stub mode')
"
```

### Summary Table

| Component | Library Needed | Currently Installed? | Stub Mode? |
|-----------|---------------|---------------------|------------|
| Frontend (Omniverse) | `@nvidia/omniverse-webrtc-streaming-library` | ❌ No | ✅ Yes |
| Backend (Flownex) | `pythonnet` (clr) | ❌ No | ✅ Yes |

---

## Benefits of Stub Mode

Stub mode is **intentional** and **useful**:

1. **Development Without Dependencies** - Work on UI without external services
2. **Testing** - Verify workflows and data flow
3. **Portable** - Runs on any platform (Linux, Mac, Windows)
4. **Safe** - No risk of affecting real projects or services
5. **Fast** - No external service startup time

Many developers prefer working in stub mode initially, then integrating real services later.

---

## When to Use Real Mode

Use real mode when you need to:
- ✅ Stream actual Omniverse Kit 3D viewport
- ✅ Run real Flownex simulations
- ✅ Get accurate output data
- ✅ Test production workflows
- ✅ Demo to stakeholders

---

## Troubleshooting

### "Can't Install NVIDIA Library"

**Problem:** `npm install` fails with registry errors

**Solutions:**
1. Check if you have NVIDIA registry access
2. Contact NVIDIA for credentials
3. Continue using stub mode for development
4. Use VPN if behind corporate firewall

### "pythonnet Won't Install"

**Problem:** `pip install pythonnet` fails

**Solutions:**
1. Use Windows (pythonnet works best there)
2. Check Python version compatibility
3. Install .NET Framework (Windows) or Mono (Linux/Mac)
4. Continue using stub mode if only testing UI

### "Real Mode Not Working"

**Problem:** Installed libraries but still seeing stub behavior

**Solutions:**
1. Check import statements in code
2. Verify library actually installed: `npm list <package>`
3. Restart development server
4. Check console for error messages
5. Verify configuration files

---

## Next Steps

### For Development (Keep Stub Mode)

If you're just developing the UI or testing workflows:
- ✅ **Current setup is perfect**
- No changes needed
- Focus on UI/UX development

### For Production (Exit Stub Mode)

If you need real functionality:
1. **Frontend**: Get NVIDIA registry access → Install library → Update imports
2. **Backend**: Install pythonnet → Implement Flownex API calls
3. **Test**: Verify real connections work
4. **Deploy**: Configure production servers

---

## Additional Resources

- **NVIDIA Omniverse Documentation**: https://docs.omniverse.nvidia.com/
- **pythonnet Documentation**: https://pythonnet.github.io/
- **Flownex API Documentation**: Contact Flownex support
- **This Repository**: See `OMNIVERSE_STREAMING.md` for Omniverse setup details

---

## Contact

If you have questions about:
- **NVIDIA Library**: Contact NVIDIA Omniverse support
- **Flownex API**: Contact M-Tech Industrial (Pty) Ltd
- **This Application**: Check repository issues or documentation
