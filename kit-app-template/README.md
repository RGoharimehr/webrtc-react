# Omniverse WebRTC Monitor — Kit-CAE Integration

This directory contains Kit extensions and `.kit` app files that integrate the
**Omniverse WebRTC Monitor** React dashboard into the
[`RGoharimehr/kit-cae`](https://github.com/RGoharimehr/kit-cae) project.

## How it works

Kit-CAE is the **main project**. The webrtc-react repository is placed as a
**subfolder inside kit-cae**. When you launch the combined Kit-CAE streaming
app, it automatically starts the React frontend and Python bridge — no
separate terminal needed.

```
kit-cae/                          ← main project (./repo.sh build / launch)
├── webrtc-react/                 ← this repo, cloned here
│   ├── package.json              ← React + bridge startup (npm start)
│   ├── src/                      ← React source
│   ├── flownex-bridge/           ← Python FastAPI bridge
│   └── kit-app-template/
│       └── source/               ← copy these into kit-cae/source/
│           ├── apps/
│           │   ├── omni.webrtc_monitor.kit
│           │   ├── omni.webrtc_monitor.streaming.kit
│           │   └── omni.webrtc_monitor.cae_streaming.kit  ← combined app
│           └── extensions/
│               ├── omni.webrtc.flownex_bridge/   ← USD prim messaging
│               └── omni.webrtc_monitor.startup/  ← auto-starts npm start
├── source/
│   ├── apps/                     ← kit-cae's own .kit files + ours (copied here)
│   └── extensions/               ← kit-cae's own extensions + ours (copied here)
├── premake5.lua
└── repo.sh / repo.bat
```

---

## Prerequisites

| Requirement | Notes |
|---|---|
| NVIDIA RTX GPU (RTX 3070 or better recommended) | Required for RTX rendering |
| Driver ≥ 550.54.15 (Linux) or ≥ 551.78 (Windows) | Minimum for the Kit SDK |
| Git + Git LFS | `git lfs install` before cloning |
| Node.js ≥ 14 + npm | `npm start` is called automatically on Kit launch |
| Python ≥ 3.9 | For the FastAPI bridge |
| Visual Studio 2019 or 2022 (Windows, C++ required) | Required by Kit-CAE C++ extensions |

---

## Setup

### Step 1 — Clone webrtc-react inside kit-cae

```bash
# Starting from the kit-cae directory
git clone https://github.com/RGoharimehr/webrtc-react webrtc-react
```

### Step 2 — Install webrtc-react Node.js dependencies

```bash
cd webrtc-react
npm install
cd ..
```

### Step 3 — Copy Kit extension and app files into kit-cae source tree

```bash
# Linux / macOS
cp -r webrtc-react/kit-app-template/source/apps/*.kit   source/apps/
cp -r webrtc-react/kit-app-template/source/extensions/* source/extensions/
```

```bat
:: Windows
xcopy /E /I webrtc-react\kit-app-template\source\apps\*.kit   source\apps\
xcopy /E /I webrtc-react\kit-app-template\source\extensions\* source\extensions\
```

### Step 4 — Build kit-cae

```bash
# Linux
./repo.sh build -r

# Windows (Visual Studio 2022)
repo.bat --set-token vs_version:vs2022 build -r
```

### Step 5 — Launch (single command starts everything)

```bash
# Linux
./repo.sh launch -n omni.webrtc_monitor.cae_streaming.kit

# Windows
repo.bat launch -n omni.webrtc_monitor.cae_streaming.kit
```

This single launch command:
1. Starts the Omniverse Kit app with the full Kit-CAE environment (CAE data importers,
   algorithms, IndeX/Flow rendering, USD schemas)
2. Enables the WebRTC streaming endpoint on port **49100**
3. **Automatically runs `npm start`** in the `webrtc-react/` directory, which starts:
   - React dev server → **http://localhost:3000**
   - Python bridge → **ws://127.0.0.1:8001/ws**

### Step 6 — Open the dashboard

Open **http://localhost:3000** in your browser and click **▶ Connect Omniverse Stream**.

---

## Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│  Browser  (http://localhost:3000)                                  │
│  ─────────────────────────────────                                 │
│  AppStream.js  ←── WebRTC video ──►  Kit-CAE Viewport             │
│                ←── sendMessage() ──►  omni.webrtc.flownex_bridge  │
│  useBridge.js  ←── WebSocket ──────►  Python bridge (port 8001)   │
└──────────────────────────────────────────────────────────────────┬─┘
                                                                   │ auto-started by
                                                                   │ omni.webrtc_monitor.startup
┌──────────────────────────────────────────────────────────────────▼─┐
│  Omniverse Kit App  (omni.webrtc_monitor.cae_streaming.kit)        │
│  ─────────────────────────────────────────────────────────────     │
│  omni.cae.*              ← CAE importers, algorithms, rendering    │
│  omni.kit.livestream.app ← WebRTC endpoint (port 49100)           │
│  omni.webrtc.flownex_bridge ← prim property messaging             │
│  omni.webrtc_monitor.startup ← runs npm start on Kit startup      │
└────────────────────────────────────────────────────────────────────┘
```

---

## Extensions

### `omni.webrtc_monitor.startup`

**Path:** `source/extensions/omni.webrtc_monitor.startup/`

Automatically starts `npm start` in the webrtc-react directory when the Kit
application launches, and cleanly terminates it when Kit exits.

**Path discovery:** The extension walks up from its installed location searching
for a `package.json` with `"name": "webrtc-react"`. When webrtc-react is placed
at `kit-cae/webrtc-react/`, this discovery is automatic — no configuration needed.

**Manual override** (if auto-discovery does not work):

```toml
# In your .kit file:
[settings.exts."omni.webrtc_monitor.startup"]
webrtcRoot = "/absolute/path/to/webrtc-react"
```

**Kit log output:** React and bridge output is forwarded to the Kit log, prefixed
with `[webrtc-react]`.

### `omni.webrtc.flownex_bridge`

**Path:** `source/extensions/omni.webrtc.flownex_bridge/`

Handles `get_prim_property` / `prim_property_result` JSON messages between the
React dashboard and the USD stage (see protocol details in the main README).

---

## App files

| File | What it launches |
|---|---|
| `omni.webrtc_monitor.kit` | WebRTC viewport app (no CAE, no auto-start) |
| `omni.webrtc_monitor.streaming.kit` | WebRTC viewport + auto-start (no CAE) |
| `omni.webrtc_monitor.cae_streaming.kit` | **Kit-CAE + WebRTC streaming + auto-start** |

---

## WebRTC connection settings

`stream.config.json` (in the webrtc-react directory) controls how the React app
connects to the Kit streaming endpoint:

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

The `.kit` files set the same port (`49100`). Change both if you need a different port.

---

## VTK-based algorithms (optional)

```bash
# Download pip archives once — Linux
./repo.sh pip_download --dest /tmp/pip_archives -r tools/deps/requirements.txt

# Launch — Linux ([ ] around path are required)
./repo.sh launch -n omni.webrtc_monitor.cae_streaming.kit -- \
    --/exts/omni.kit.pipapi/archiveDirs=[/tmp/pip_archives]
```

```bat
:: Download pip archives once — Windows
repo.bat pip_download --dest C:\temp\pip_archives -r tools\deps\requirements.txt

:: Launch — Windows
repo.bat launch -n omni.webrtc_monitor.cae_streaming.kit -- ^
    --/exts/omni.kit.pipapi/archiveDirs=[C:/temp/pip_archives]
```

---

## Debugging

Enable verbose logging in your `.kit` file:

```toml
[settings.log]
level = "DEBUG"
channel."omni.webrtc_monitor.startup"    = "DEBUG"
channel."omni.webrtc.flownex_bridge"     = "DEBUG"
```

Or at runtime in the Kit Script Editor:

```python
import logging
logging.getLogger("omni.webrtc_monitor.startup").setLevel(logging.DEBUG)
logging.getLogger("omni.webrtc.flownex_bridge").setLevel(logging.DEBUG)
```

---

## Troubleshooting

### React app does not start automatically

1. Check the Kit log for `WebRTCMonitorStartup:` messages.
2. Ensure `npm` is on your `PATH` (run `npm --version` in a terminal).
3. If the webrtc-react directory is not at `kit-cae/webrtc-react/`, set the path explicitly:

   ```toml
   [settings.exts."omni.webrtc_monitor.startup"]
   webrtcRoot = "/path/to/webrtc-react"
   ```

### WebRTC stream not connecting

- Verify Kit is running and the `omni.webrtc_monitor.cae_streaming.kit` app loaded.
- Check `stream.config.json` → `local.signalingPort` matches the `.kit` file (default 49100).

### `NO BRIDGE` in the dashboard

- The Python bridge (`flownex-bridge/server.py`) should be started by `npm start`.
- Check http://127.0.0.1:8001/health in your browser — should return `{"ok":true}`.
- Ensure Python dependencies: `pip install -r webrtc-react/flownex-bridge/requirements.txt`.
