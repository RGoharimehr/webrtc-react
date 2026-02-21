# Omniverse Kit App Template — WebRTC Monitor

This directory contains everything needed to integrate the **Omniverse WebRTC Monitor** React dashboard into the [NVIDIA Omniverse Kit App Template](https://github.com/NVIDIA-Omniverse/kit-app-template), and optionally combine it with the **Kit-CAE** fork ([`RGoharimehr/kit-cae`](https://github.com/RGoharimehr/kit-cae)) for full CAE data import, processing, and visualisation.

---

## What is included

| Path | Purpose |
|---|---|
| `source/apps/omni.webrtc_monitor.kit` | Main Kit application (viewport + FlownexBridge) |
| `source/apps/omni.webrtc_monitor.streaming.kit` | Streaming layer — WebRTC only, no CAE |
| `source/apps/omni.webrtc_monitor.cae_streaming.kit` | **Combined** Kit-CAE + WebRTC streaming app |
| `source/extensions/omni.webrtc.flownex_bridge/` | Kit Python extension for USD prim messaging |
| `vendor/kit-cae/` | Expected clone location for the kit-cae source |
| `premake5.lua` | Build script (includes kit-cae prebuild_link) |
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
| Visual Studio 2019 or 2022 (Windows only, C++ needed) | Required by Kit-CAE C++ extensions |

---

## Option 1 — WebRTC only (no Kit-CAE)

Use this when you only want to stream an arbitrary USD scene to the React dashboard.

### Setup steps

1. **Clone the official kit-app-template:**

   ```bash
   git clone https://github.com/NVIDIA-Omniverse/kit-app-template.git
   cd kit-app-template
   ```

2. **Copy the integration files from this directory into the clone root:**

   ```bash
   # From the webrtc-react repo root:
   cp -r kit-app-template/source       /path/to/kit-app-template/
   cp    kit-app-template/premake5.lua /path/to/kit-app-template/premake5.lua
   ```

3. **Build:**

   ```bash
   # Linux
   ./repo.sh build

   # Windows
   .\repo.bat build
   ```

4. **Launch:**

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

6. Click **▶ Connect Omniverse Stream** in the React dashboard. Default: `127.0.0.1:49100`.

---

## Option 2 — WebRTC + Kit-CAE (full CAE simulation)

Use this when you want the full Kit-CAE environment (CGNS, VTK, EnSight importers; IndeX/Flow
rendering; USD CAE schemas) streamed to the React dashboard.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  Browser  (React, http://localhost:3000)                            │
│                                                                     │
│  Dashboard + Live Metrics panels                                    │
│  AppStream.js  ←──WebRTC video stream──►  Omniverse Viewport       │
│                ←──sendMessage()────────►  FlownexBridge ext.       │
│  useBridge.js  ←──WebSocket (port 8001)─►  FastAPI bridge          │
└──────────┬───────────────────────────────────────────────────────────┘
           │ JSON / WebRTC / WebSocket
           ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Omniverse Kit App  (omni.webrtc_monitor.cae_streaming.kit)         │
│                                                                     │
│  omni.cae.*         ← Kit-CAE extensions (from vendor/kit-cae)     │
│    data, file_format.cgns, algorithms.core, index, flow, …         │
│                                                                     │
│  omni.webrtc.flownex_bridge  ← prim property queries → React UI    │
│  omni.kit.livestream.app     ← WebRTC stream → React front-end     │
└─────────────────────────────────────────────────────────────────────┘
```

### Setup steps

1. **Clone the official kit-app-template** (provides the build toolchain):

   ```bash
   git clone https://github.com/NVIDIA-Omniverse/kit-app-template.git
   cd kit-app-template
   ```

2. **Copy the integration files from this directory into the clone root:**

   ```bash
   cp -r kit-app-template/source       /path/to/kit-app-template/
   cp    kit-app-template/premake5.lua /path/to/kit-app-template/premake5.lua
   cp -r kit-app-template/vendor       /path/to/kit-app-template/
   ```

3. **Clone Kit-CAE into `vendor/kit-cae`:**

   ```bash
   # From inside the kit-app-template directory:
   git clone https://github.com/RGoharimehr/kit-cae vendor/kit-cae
   ```

4. **Build Kit-CAE first:**

   ```bash
   # Linux
   cd vendor/kit-cae
   ./repo.sh build -r
   cd ../..

   # Windows (Visual Studio 2022)
   cd vendor\kit-cae
   repo.bat --set-token vs_version:vs2022 build -r
   cd ..\..
   ```

5. **Build this project:**

   ```bash
   # Linux
   ./repo.sh build

   # Windows
   .\repo.bat build
   ```

6. **Launch the combined streaming app:**

   ```bash
   # Linux
   ./repo.sh launch --app apps/omni.webrtc_monitor.cae_streaming.kit

   # Windows
   .\repo.bat launch --app apps\omni.webrtc_monitor.cae_streaming.kit
   ```

7. **Start the React front-end** (from the webrtc-react repo root):

   ```bash
   npm start
   ```

8. Click **▶ Connect Omniverse Stream** in the browser dashboard.

### What the combined app provides

Once running, you can:

- **Import CAE datasets** via `File → Import`: CGNS (`.cgns`), NumPy (`.npy`/`.npz`),
  EnSight Gold (`.case`), VTK (`.vtk`/`.vti`/`.vtu`)
- **Run CAE algorithms** (bounding box, streamlines, slice planes, etc.) from the Stage context
  menu — streamed live to the React front-end
- **Query prim properties** by hovering over the stream in the browser (triggers
  `get_prim_property` via the FlownexBridge extension)
- **Control simulation parameters** via the React dashboard's Operating Conditions sliders
- **Export results** as `.xlsx` from the Plotting tab

### VTK-based algorithms (optional)

To use VTK-accelerated algorithms, download the VTK pip archives and launch the VTK variant:

```bash
# Download (once) — Linux
./repo.sh pip_download --dest /tmp/pip_archives -r vendor/kit-cae/tools/deps/requirements.txt

# Launch with VTK — Linux
# NOTE: the [ ] around the path are required
./repo.sh launch --app apps/omni.webrtc_monitor.cae_streaming.kit -- \
    --/exts/omni.kit.pipapi/archiveDirs=[/tmp/pip_archives]
```

```bat
:: Download (once) — Windows
repo.bat pip_download --dest C:\temp\pip_archives -r vendor\kit-cae\tools\deps\requirements.txt

:: Launch with VTK — Windows
:: NOTE: the [ ] around the path are required
repo.bat launch --app apps\omni.webrtc_monitor.cae_streaming.kit -- ^
    --/exts/omni.kit.pipapi/archiveDirs=[C:/temp/pip_archives]
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

---

## WebRTC connection settings

The React front-end reads `stream.config.json` in the repo root:

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

The streaming `.kit` files set the same port (`49100`). Change both if you need a different port.

---

## Debugging

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
│   │   ├── omni.webrtc_monitor.kit               ← base app (viewport + bridge)
│   │   ├── omni.webrtc_monitor.streaming.kit     ← WebRTC only streaming layer
│   │   └── omni.webrtc_monitor.cae_streaming.kit ← Kit-CAE + WebRTC combined
│   └── extensions/
│       └── omni.webrtc.flownex_bridge/
│           ├── config/extension.toml
│           └── omni/webrtc/flownex_bridge/
│               ├── __init__.py
│               └── extension.py
├── vendor/
│   └── kit-cae/       ← clone https://github.com/RGoharimehr/kit-cae here
│       ├── README.md  ← instructions (included in this repo)
│       └── .gitignore ← excludes cloned source from this repo
├── premake5.lua
├── repo.toml
├── repo.sh    (Linux)
├── repo.bat   (Windows)
└── README.md  ← this file
```


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
