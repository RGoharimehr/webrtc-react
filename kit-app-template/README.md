# Omniverse Kit App Template — WebRTC Monitor

This directory contains everything needed to integrate the **Omniverse WebRTC Monitor** React dashboard into the [NVIDIA Omniverse Kit App Template](https://github.com/NVIDIA-Omniverse/kit-app-template).

---

## What is included

| Path | Purpose |
|---|---|
| `source/apps/omni.webrtc_monitor.kit` | Main Kit application configuration |
| `source/apps/omni.webrtc_monitor.streaming.kit` | Streaming layer — enables WebRTC so the React front-end can connect |
| `source/extensions/omni.webrtc.flownex_bridge/` | Kit Python extension that bridges USD prim queries to the web dashboard |
| `premake5.lua` | Build script (delegates to Kit SDK toolchain) |
| `repo.toml` | Repository tool configuration |
| `repo.sh` / `repo.bat` | Linux / Windows launch scripts |

---

## Prerequisites

| Requirement | Notes |
|---|---|
| NVIDIA RTX GPU (RTX 3070 or better recommended) | Required for RTX rendering |
| Driver ≥ 550.54.15 (Linux) or ≥ 551.78 (Windows) | Minimum for the Kit SDK version used |
| Git + Git LFS | `git lfs install` before cloning |
| Internet access | Required to download the Kit SDK and extensions via Packman |
| Node.js ≥ 14 | For the React front-end (`npm start`) |
| Python ≥ 3.9 | For the FastAPI bridge (`flownex-bridge/`) |

---

## Integration steps

### Option A — Merge into an existing kit-app-template clone (recommended)

1. **Clone the official kit-app-template:**

   ```bash
   git clone https://github.com/NVIDIA-Omniverse/kit-app-template.git
   cd kit-app-template
   ```

2. **Copy the integration files from this directory into the clone root:**

   ```bash
   # From the webrtc-react repo root:
   cp -r kit-app-template/source            /path/to/kit-app-template/
   cp    kit-app-template/premake5.lua      /path/to/kit-app-template/premake5.lua
   # repo.toml, repo.sh, repo.bat are already provided by the upstream template —
   # only copy them if you are creating a standalone directory (Option B).
   ```

   > **Note:** The upstream `premake5.lua` already has the correct boilerplate. You only need to
   > replace it if you want to use the one provided here (they are functionally identical).

3. **Build:**

   ```bash
   # Linux
   ./repo.sh build

   # Windows
   .\repo.bat build
   ```

4. **Launch the streaming app:**

   ```bash
   # Linux
   ./repo.sh launch --app apps/omni.webrtc_monitor.streaming.kit

   # Windows
   .\repo.bat launch --app apps\omni.webrtc_monitor.streaming.kit
   ```

5. **Start the React front-end** (separate terminal, from the webrtc-react repo root):

   ```bash
   npm start
   ```

6. **Connect the stream:** Click **▶ Connect Omniverse Stream** in the React dashboard header.
   The default configuration (`stream.config.json`) uses `127.0.0.1:49100`.

---

### Option B — Standalone setup (this directory as the root)

This directory is already structured like a `kit-app-template` clone. To use it as a
standalone project you need NVIDIA's toolchain (`tools/packman/`). The easiest way to
get it is:

```bash
# 1. Clone the upstream template to get the toolchain
git clone https://github.com/NVIDIA-Omniverse/kit-app-template.git /tmp/kat

# 2. Copy the toolchain into this kit-app-template/ directory
cp -r /tmp/kat/tools  /path/to/webrtc-react/kit-app-template/
cp    /tmp/kat/.packman.json  /path/to/webrtc-react/kit-app-template/ 2>/dev/null || true

# 3. Build and launch from this directory
cd /path/to/webrtc-react/kit-app-template
./repo.sh build
./repo.sh launch --app apps/omni.webrtc_monitor.streaming.kit
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser  (React, http://localhost:3000)                        │
│                                                                 │
│  Dashboard + Live Metrics panels                                │
│  ────────────────────────────────                               │
│  AppStream.js  ←──WebRTC video stream──►  Omniverse Viewport   │
│                ←──sendMessage()────────►  FlownexBridge ext.   │
│                                                                 │
│  useBridge.js  ←──WebSocket (port 8001)─►  FastAPI bridge      │
└──────────┬───────────────────────┬───────────────────────────────┘
           │ JSON / WebRTC         │ JSON / WebSocket
           ▼                       ▼
┌────────────────────┐   ┌──────────────────────────────────────┐
│  omni.webrtc.      │   │  flownex-bridge/server.py            │
│  flownex_bridge    │   │  (FastAPI + uvicorn, port 8001)       │
│  (Kit extension)   │   │  FlownexAdapter / AnsysAdapter / …   │
└────────────────────┘   └──────────────────────────────────────┘
         ▲
         │  USD stage queries
         ▼
┌────────────────────┐
│  Omniverse Kit App │
│  (RTX renderer,    │
│   USD stage)       │
└────────────────────┘
```

---

## Extension: `omni.webrtc.flownex_bridge`

This Kit extension (`source/extensions/omni.webrtc.flownex_bridge/`) receives JSON messages
from the React front-end over the WebRTC custom-messaging channel and serves USD attribute
queries back.

### Supported messages (Browser → Kit)

```json
{
  "type":      "get_prim_property",
  "prim_path": "/World/Rack_A/Pump_01",
  "property":  "flownex:componentName",
  "pick":      { "x": 0.42, "y": 0.61 }
}
```

If `prim_path` is empty, the extension resolves the prim by performing a viewport
pick at the normalised `pick` coordinates.

### Response (Kit → Browser)

```json
{
  "type":      "prim_property_result",
  "prim_path": "/World/Rack_A/Pump_01",
  "property":  "flownex:componentName",
  "value":     "Pump_01"
}
```

The extension automatically selects the messaging backend available in the running
Kit version:

| Kit version | Messaging API used |
|---|---|
| Kit ≥ 105 | `omni.services.streaming.manager` |
| Kit ≤ 104 | `omni.kit.livestream.messaging` |

---

## WebRTC connection settings

The React front-end reads `stream.config.json` in the repo root. The default
configuration connects to a locally running Kit app:

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

The streaming `.kit` file sets the same port:

```toml
[settings.exts."omni.services.streaming.manager"]
signalingPort = 49100
```

If you change the port in one place, change it in both.

---

## Debugging

Enable verbose logging for the extension in your `.kit` file or at runtime:

```toml
# In your .kit file
[settings.log]
level = "DEBUG"
channel."omni.webrtc.flownex_bridge" = "DEBUG"
```

```python
# At runtime in the Kit Script Editor
import logging
logging.getLogger("omni.webrtc.flownex_bridge").setLevel(logging.DEBUG)
```

---

## File structure

```
kit-app-template/
├── source/
│   ├── apps/
│   │   ├── omni.webrtc_monitor.kit             ← base app
│   │   └── omni.webrtc_monitor.streaming.kit   ← WebRTC streaming layer
│   └── extensions/
│       └── omni.webrtc.flownex_bridge/
│           ├── config/
│           │   └── extension.toml
│           └── omni/webrtc/flownex_bridge/
│               ├── __init__.py
│               └── extension.py
├── premake5.lua
├── repo.toml
├── repo.sh    (Linux)
├── repo.bat   (Windows)
└── README.md  ← this file
```
