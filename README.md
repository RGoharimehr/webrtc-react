# Omniverse WebRTC Monitor — Comprehensive Guide

A dark-themed React dashboard that overlays an engineering control panel on top of a live **WebRTC video stream** (NVIDIA Omniverse *or* screen-share). A Python bridge server connects the UI to simulation backends — **Flownex**, **Ansys**, **NVIDIA Omniverse Kit**, or any custom solver — using a simple JSON-over-WebSocket messaging protocol.

---

## Table of Contents

1. [What This Project Does](#1-what-this-project-does)
2. [Architecture — The Big Picture](#2-architecture--the-big-picture)
3. [Quick Start](#3-quick-start)
4. [Prerequisites](#4-prerequisites)
5. [Installation](#5-installation)
6. [Project Structure](#6-project-structure)
7. [Running the Application](#7-running-the-application)
8. [UI Walkthrough](#8-ui-walkthrough)
9. [The Messaging Protocol](#9-the-messaging-protocol)
   - [9.1 Transport](#91-transport)
   - [9.2 Message envelope](#92-message-envelope)
   - [9.3 Messages sent by the front-end (browser → server)](#93-messages-sent-by-the-front-end-browser--server)
   - [9.4 Messages sent by the server (server → browser)](#94-messages-sent-by-the-server-server--browser)
   - [9.5 Omniverse custom events](#95-omniverse-custom-events)
10. [Simulation Backend Adapters](#10-simulation-backend-adapters)
11. [CSV Schema Format (Inputs.csv / Outputs.csv)](#11-csv-schema-format-inputscsv--outputscsv)
12. [Custom Extensions (loading .js / .css)](#12-custom-extensions-loading-js--css)
13. [Configuration Files](#13-configuration-files)
14. [Connecting a Real Backend](#14-connecting-a-real-backend)
15. [WebRTC Streaming Setup](#15-webrtc-streaming-setup)
16. [Troubleshooting](#16-troubleshooting)
17. [License](#17-license)

---

## 1. What This Project Does

The application provides a full-screen "mission control" interface for engineering simulation. It has two independent subsystems running simultaneously:

| Subsystem | Technology | Purpose |
|---|---|---|
| **Video stream** | WebRTC (NVIDIA Omniverse or screen-share) | Displays a 3-D simulation or desktop view as a live video background |
| **Simulation bridge** | WebSocket (Python FastAPI) | Controls a simulation solver (Flownex, Ansys, Omniverse, …) and streams live results back to the UI |

The two subsystems are **completely decoupled**. You can use the dashboard controls without any stream, and you can watch the stream without the bridge running.

---

## 2. Architecture — The Big Picture

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser  (React, port 3000)                                    │
│                                                                 │
│  ┌─────────────────────────────┐   ┌─────────────────────────┐ │
│  │  Dashboard Control Panel   │   │  Live Metrics Panel     │ │
│  │  (right, draggable)        │   │  (left, draggable)      │ │
│  │  Modes: SIMULATE / AI /    │   │  GraphsPanel            │ │
│  │         BUILD              │   │  Sparklines + trends    │ │
│  └──────────┬──────────────┬──┘   └────────────┬────────────┘ │
│             │ useBridge()  │                    │             │
│             │ WebSocket    │  reads bridge.state│             │
│             ▼              ▼                    ▼             │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │               Legend + Stream Background                │  │
│  │  Omniverse WebRTC  OR  Screen Share  OR  "No stream"   │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ JSON messages over WebSocket
                         │ ws://127.0.0.1:8001/ws
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Python Bridge Server  (FastAPI + uvicorn, port 8001)           │
│  flownex-bridge/server.py                                       │
│                                                                 │
│  BridgeState ──── schema (inputs / outputs)                     │
│                ── runtime values                                │
│                ── status (idle / running / error)               │
│                                                                 │
│  BaseAdapter ──► FlownexDirectAdapter  (pythonnet / .NET)       │
│             └──► AnsysStubAdapter      (PyFluent / pythonnet)   │
│             └──► OmniverseStubAdapter  (Omniverse Kit Python)   │
│             └──► (your own adapter)                             │
└──────────────────────┬──────────────────────────────────────────┘
                       │ vendor SDK / COM / REST / CLI
                       ▼
          Flownex SE  /  Ansys Fluent  /  Omniverse Kit  /  …
```

**Key design decisions:**

- **One WebSocket connection** per browser tab, reconnecting automatically with exponential back-off.
- **Python WebRTC server**: the default stream source (`"python_webrtc"`) uses [aiortc](https://github.com/aiortc/aiortc) running inside the same Python process as the bridge. The browser sends a standard SDP offer to `POST /webrtc/offer` and receives an SDP answer — no Node.js runtime is needed and no marshalling is required to share values between the stream and the simulation backend.
- **Adapter pattern**: every backend implements the same `BaseAdapter` abstract class. Switching backends is one dropdown selection in the UI; no browser restart required.
- **CSV-driven schema**: the list of controllable inputs and readable outputs is defined in two CSV files that you create alongside your simulation project, not hard-coded in the UI.
- **`window.__bridgeAPI`**: the bridge API is always available in the browser global scope, so user-loaded JavaScript extensions can send and receive messages without modifying the source code.

---

## 3. Quick Start

```bash
# 1. Clone
git clone https://github.com/RGoharimehr/webrtc-react.git
cd webrtc-react

# 2. Install Node dependencies
npm install

# 3. Install Python dependencies (virtual environment recommended)
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r flownex-bridge/requirements.txt

# 4. Start everything (React + bridge server together)
npm start
```

Open **http://localhost:3000** — the dashboard appears immediately.

The Python bridge (`flownex-bridge/server.py`) starts automatically on port **8001**. It serves both the simulation WebSocket (`ws://127.0.0.1:8001/ws`) and the WebRTC signalling endpoint (`http://127.0.0.1:8001/webrtc/offer`) used by the built-in Python WebRTC server ([aiortc](https://github.com/aiortc/aiortc)).

Without a running simulation backend the bridge will show "NO BRIDGE" and the metrics panel will display simulated random data.

---

## 4. Prerequisites

| Tool | Minimum version | Notes |
|---|---|---|
| Node.js | 14 or higher | https://nodejs.org/ |
| npm | bundled with Node.js | |
| Python | 3.9 or higher | https://python.org/ |
| pip | bundled with Python | |
| aiortc | ≥ 1.9 | Installed via `pip install -r requirements.txt` — powers the built-in Python WebRTC server |
| av (PyAV) | ≥ 12.0 | Installed via `pip install -r requirements.txt` — video frame encoding for aiortc |
| numpy | ≥ 1.24 | Installed via `pip install -r requirements.txt` — used by the stub video track |
| (optional) pythonnet | latest | Required only for real Flownex integration |
| (optional) NVIDIA Omniverse Kit | latest | Required for live 3-D stream from an Omniverse scene |
| (optional) Ansys installation | any | Required for real Ansys integration |

---

## 5. Installation

### Node.js front-end

```bash
npm install
```

Expected output: `added ~1300 packages, and audited ~1300 packages`

### Python bridge server

```bash
# (recommended) create a virtual environment first
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

pip install -r flownex-bridge/requirements.txt
```

`requirements.txt` contains:
```
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
aiortc>=1.9.0
av>=12.0.0
numpy>=1.24.0
```

---

## 6. Project Structure

```
webrtc-react/
├── public/                    # Static assets (favicon, index.html)
├── src/
│   ├── App.js                 # Root component — layout, modes, tabs, streaming
│   ├── App.css                # Global dark theme
│   ├── simulationEnv.js       # Legend variable definitions and colour presets
│   ├── bridge/
│   │   └── useBridge.js       # React hook — manages WebSocket connection,
│   │                          #   parses all incoming messages, exposes bridge API
│   ├── components/
│   │   ├── AppStream.js       # WebRTC streaming component
│   │   │                      #   python_webrtc source → native RTCPeerConnection
│   │   │                      #   local source         → NVIDIA Omniverse library
│   │   ├── DraggableResizable.js  # Draggable/resizable floating panel
│   │   └── GraphsPanel.js     # Live metrics sparklines (reads bridge.state.outputs)
│   └── tabs/
│       ├── OperatingConditions.js  # SIMULATE: dynamic input sliders from CSV schema
│       ├── GeometricalDesign.js    # SIMULATE: static geometry sliders
│       ├── ResultsVisualization.js # SIMULATE: colour-map selector + Apply to Omniverse
│       ├── Plotting.js             # SIMULATE: variable checkboxes + XLSX recorder
│       ├── CFDAnalysis.js          # SIMULATE: ANSYS Fluent / SimAI placeholders
│       ├── Configuration.js        # BUILD: backend selector + custom extensions
│       └── ResultsMapping.js       # BUILD: USD prim mapping workflow
├── flownex-bridge/
│   ├── server.py              # FastAPI app — WebSocket endpoint, WebRTC signalling,
│   │                          #   message dispatcher
│   ├── webrtc_server.py       # Python WebRTC server (aiortc) — peer connection
│   │                          #   manager, stub video track, data-channel relay
│   ├── state.py               # BridgeState class + InputDef / OutputDef dataclasses
│   ├── requirements.txt
│   └── adapters/
│       ├── base.py            # BaseAdapter (abstract) — the contract every backend must fulfil
│       ├── flownex_direct.py  # Flownex via pythonnet (.NET COM)
│       ├── ansys_stub.py      # Ansys stub (ready for PyFluent / pythonnet wiring)
│       └── omniverse_stub.py  # Omniverse Kit stub (ready for Kit Python API wiring)
├── stream.config.json         # WebRTC connection settings (source, server, port)
├── package.json
├── .env                       # GENERATE_SOURCEMAP=false (suppresses NVIDIA lib warnings)
├── verify-setup.js            # `npm run verify` — checks the installation
└── check-stub-mode.js         # `npm run check-stub` — reports stub vs real library
```

---

## 7. Running the Application

### Start everything at once (recommended)

```bash
npm start
```

This runs `concurrently`:
- **React dev server** → http://localhost:3000
- **Python bridge server** → ws://127.0.0.1:8001/ws

### Start services individually

```bash
# Terminal 1 — React
npx react-scripts start

# Terminal 2 — Bridge
cd flownex-bridge
python -m uvicorn server:app --host 127.0.0.1 --port 8001
```

### Other scripts

| Script | Command | Description |
|---|---|---|
| Build | `npm run build` | Production build into `build/` |
| Test | `npm test` | Jest test runner |
| Verify setup | `npm run verify` | Checks Node, npm, dependencies |
| Check stub mode | `npm run check-stub` | Reports whether real NVIDIA library is loaded |

---

## 8. UI Walkthrough

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ ‹ │       Full-screen video stream background        │ › │
│   │   (Omniverse WebRTC  /  Screen Share  /  Idle)    │   │
├───┘                                                    └───┤
│ Left panel                               Right panel       │
│ ─────────                               ─────────────      │
│ Live Metrics                            Dashboard Control  │
│ (draggable &                            (draggable &       │
│  resizable)                              resizable)        │
│                                                            │
│ Legend colour bar                                          │
│ (bottom left)                                              │
├────────────────────────────────────────────────────────────┤
│          PUE: 1.42  │  Tmax: 68.5°C  │  Pcond: N/A        │  ← bottom strip
└────────────────────────────────────────────────────────────┘
```

### Right panel — Dashboard Control

**Mode buttons** (top row):

| Mode | Tabs available |
|---|---|
| **SIMULATE** | Operating Conditions, Geometrical Design, Results Visualization, Plotting, CFD Analysis |
| **AI** | Placeholder — surrogate models, optimisation, AI agents |
| **BUILD** | Configuration, Results Mapping |

**Header badges:**
- `BRIDGE` / `NO BRIDGE` — live WebSocket connection status
- `START` / `STREAMING` / `SCREEN` — stream control (click to start/stop)

### Tabs

| Tab | What it does |
|---|---|
| **Operating Conditions** | Displays slider controls for every `editType=slider` row in `Inputs.csv`. Moving a slider fires a `set_input` message to the bridge. |
| **Geometrical Design** | Hard-coded geometry sliders sent to the bridge as `static` inputs. |
| **Results Visualization** | Choose a simulation property and colour map, then click "Apply to Omniverse" to send a colour-mapping message to the stream. |
| **Plotting** | Check which variables to record, then Start/Stop to export live data as an Excel `.xlsx` file. |
| **CFD Analysis** | ANSYS Fluent and SimAI parameter panels (placeholder settings). |
| **Configuration** | Select simulation backend, set project file / IO directory, apply configuration, and load custom JS/CSS extensions. |
| **Results Mapping** | Three-step workflow to tag USD prims with Flownex component names and generate a mapping config. |

### Left panel — Live Metrics

Shows sparkline graphs for Temperature, Power, Pressure, Velocity, and Humidity. Data source:

- **Bridge connected** → reads `bridge.state.outputs` (values pushed by the backend after each solve)
- **Bridge disconnected** → animated random simulation at 2 Hz

---

## 9. The Messaging Protocol

### 9.1 Transport

The bridge communicates over a **WebSocket** connection:

```
ws://127.0.0.1:8001/ws
```

The React hook `useBridge` (in `src/bridge/useBridge.js`) opens this connection when the app mounts. It reconnects automatically using exponential back-off (up to 10 attempts, max 30 s delay).

### 9.2 Message envelope

Every message in both directions uses the same JSON envelope:

```json
{
  "type": "<message_type>",
  "id":   "<uuid-v4>",
  "payload": { ... }
}
```

| Field | Direction | Description |
|---|---|---|
| `type` | both | Identifies the message kind (see tables below) |
| `id` | browser→server | UUID v4 generated by `crypto.randomUUID()`. Currently for correlation/tracing only. |
| `payload` | both | Type-specific fields (see below) |

---

### 9.3 Messages sent by the front-end (browser → server)

#### `configure` — set project path and backend

Tell the bridge which simulation project to load and which backend to use. This also loads the CSV schema files.

```json
{
  "type": "configure",
  "id": "...",
  "payload": {
    "projectPath": "D:\\Simulation\\project.proj",
    "ioDir":       "D:\\Simulation\\IOFiles",
    "backend":     "flownex"
  }
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `projectPath` | string | `""` | Full path to the simulation project file |
| `ioDir` | string | `""` | Directory containing `Inputs.csv` and `Outputs.csv` |
| `backend` | string | `"flownex"` | One of `"flownex"`, `"ansys"`, `"omniverse"`, `"generic"` |

**Server response:** `schema` + `state` + `status` messages.

---

#### `open_project` — open the project in the backend application

```json
{
  "type": "open_project",
  "id": "...",
  "payload": {}
}
```

Must call `configure` first. The server calls `adapter.open_project(projectPath)`.

**Server response:** `status` (running → idle) + `state`.

---

#### `close_project` — close the current project

```json
{
  "type": "close_project",
  "id": "...",
  "payload": {}
}
```

**Server response:** `status` + `state`.

---

#### `close_app` (also accepted as `close_flownex`) — quit the application

```json
{
  "type": "close_app",
  "id": "...",
  "payload": {}
}
```

**Server response:** `status` + `state`.

---

#### `set_input` — set a simulation input value

```json
{
  "type": "set_input",
  "id": "...",
  "payload": {
    "scope": "dynamic",
    "key":   "Fan_Speed",
    "value": 1200
  }
}
```

| Field | Type | Description |
|---|---|---|
| `scope` | `"dynamic"` \| `"static"` | `dynamic` = changeable while running; `static` = geometric/layout inputs |
| `key` | string | Must match a `Key` from `Inputs.csv` (spaces replaced with `_`) |
| `value` | number | New value |

**Server response:** `inputs_delta` (immediate echo) + `status`.

---

#### `run` — run a steady-state solve

```json
{
  "type": "run",
  "id": "...",
  "payload": { "mode": "steady" }
}
```

Currently only `"steady"` is supported. The server calls `adapter.solve_steady()`, then `adapter.read_outputs()` and broadcasts the results.

**Server response:** `status` (running → idle) + `state` (with updated outputs).

---

#### `get_state` — request a full state snapshot

```json
{
  "type": "get_state",
  "id": "...",
  "payload": {}
}
```

**Server response:** `state` + `schema`.

---

#### `custom_msg` — send an arbitrary backend-specific command

```json
{
  "type": "custom_msg",
  "id": "...",
  "payload": {
    "msgType": "your_command_name",
    "payload": { "anyField": "anyValue" }
  }
}
```

The server routes this to `adapter.send_custom(msgType, payload)`. Each adapter can handle specific commands here (e.g. Omniverse camera commands, Ansys mesh queries).

**Server response:** `custom_response`.

---

### 9.4 Messages sent by the server (server → browser)

#### `state` — full state snapshot

Sent on connect, after every configure/open/close/run, and on `get_state` request.

```json
{
  "type": "state",
  "payload": {
    "connected_project": "D:\\Simulation\\project.proj",
    "backend": "flownex",
    "inputs": {
      "dynamic": { "Fan_Speed": 1200, "Rack_Power": 8500 },
      "static":  { "serverHeight": 2.0 }
    },
    "outputs": {
      "Outlet_Temperature": 38.5,
      "Pressure_Drop": 1.12
    },
    "status": {
      "state": "idle",
      "message": "Solve complete",
      "progress": 1.0
    },
    "uptime_s": 42.7
  }
}
```

---

#### `schema` — input/output definitions

Sent on connect and after a successful `configure`.

```json
{
  "type": "schema",
  "payload": {
    "inputs": [
      {
        "key": "Fan_Speed",
        "rawKey": "Fan Speed",
        "description": "Fan Speed",
        "componentIdentifier": "Fan1",
        "propertyIdentifier": "Speed",
        "editType": "slider",
        "min": 0,
        "max": 3000,
        "step": 50,
        "unit": "RPM",
        "defaultValue": 1000
      }
    ],
    "outputs": [
      {
        "key": "Outlet_Temperature",
        "rawKey": "Outlet Temperature",
        "description": "Outlet Temperature",
        "componentIdentifier": "Outlet1",
        "propertyIdentifier": "Temperature",
        "category": "thermal",
        "unit": "°C"
      }
    ]
  }
}
```

---

#### `status` — backend operation status

Sent during and after every operation.

```json
{
  "type": "status",
  "payload": {
    "state":    "running",
    "message":  "Running steady solve...",
    "progress": 0.1
  }
}
```

| `state` | Meaning |
|---|---|
| `"idle"` | Ready for next command |
| `"running"` | Operation in progress |
| `"error"` | Something went wrong; `message` has details |

---

#### `inputs_delta` — incremental input update

Sent immediately after a successful `set_input`, so the UI can update optimistically.

```json
{
  "type": "inputs_delta",
  "payload": {
    "scope": "dynamic",
    "key":   "Fan_Speed",
    "value": 1200
  }
}
```

---

#### `outputs_delta` — incremental output update

Sent when a single output value changes (reserved for future streaming use).

```json
{
  "type": "outputs_delta",
  "payload": {
    "key":   "Outlet_Temperature",
    "value": 38.5
  }
}
```

---

#### `custom_response` — response to a `custom_msg`

```json
{
  "type": "custom_response",
  "payload": {
    "ok":      true,
    "backend": "flownex",
    "echo":    { "type": "your_command_name", "payload": { ... } }
  }
}
```

---

### 9.5 Omniverse custom events

The `Results Visualization` tab sends messages **directly to the Omniverse Kit extension** (not through the Python bridge) via `AppStream.sendMessage(json)`. This uses the Omniverse WebRTC `sendMessage` channel.

Format used by this app:

```json
{
  "event_type": "colorize",
  "payload": {
    "property": "temperature",
    "colormap":  "turbo",
    "min":       20,
    "max":       90
  }
}
```

Your Omniverse Kit extension receives this in its `on_message` callback. You can define your own `event_type` values and handle them there.

---

## 10. Simulation Backend Adapters

All adapters live in `flownex-bridge/adapters/` and inherit from `BaseAdapter`.

### BaseAdapter contract

```python
class BaseAdapter(ABC):
    def open_project(self, project_path: str) -> None: ...
    def close_project(self) -> None: ...
    def close_app(self) -> None: ...
    def set_property(self, component_identifier, property_identifier, value) -> None: ...
    def solve_steady(self) -> None: ...
    def read_outputs(self, outputs_def: Dict) -> Dict: ...
    def send_custom(self, msg_type: str, payload: Dict) -> Dict: ...
```

### Available adapters

| Class | File | Real integration |
|---|---|---|
| `FlownexDirectAdapter` | `flownex_direct.py` | pythonnet + Flownex .NET COM API |
| `AnsysStubAdapter` | `ansys_stub.py` | PyFluent / Ansys pythonnet |
| `OmniverseStubAdapter` | `omniverse_stub.py` | Omniverse Kit Python extension API |

The `Flownex`, `Ansys`, and `Omniverse` adapters run in **stub mode** when the real vendor library is not installed — all operations succeed silently. This lets you develop and test the UI on any machine.

### Adding a new backend

1. Create `flownex-bridge/adapters/my_backend.py`:

```python
from .base import BaseAdapter

class MyBackendAdapter(BaseAdapter):
    def open_project(self, project_path): ...
    def close_project(self): ...
    def close_app(self): ...
    def set_property(self, component_id, property_id, value): ...
    def solve_steady(self): ...
    def read_outputs(self, outputs_def): return {k: 0.0 for k in outputs_def}
```

2. Register it in `server.py`:

```python
from adapters.my_backend import MyBackendAdapter

def _make_adapter(backend: str):
    if backend == "my_backend":
        return MyBackendAdapter()
    ...
```

3. Add it to the dropdown in `src/tabs/Configuration.js`:

```js
const BACKENDS = [
  ...
  { id: "my_backend", label: "My Backend" },
];
```

---

## 11. CSV Schema Format (Inputs.csv / Outputs.csv)

The bridge learns what inputs and outputs exist from two CSV files you create next to your simulation project.

### Inputs.csv

```csv
Key,Description,ComponentIdentifier,PropertyIdentifier,EditType,Min,Max,Step,Unit,DefaultValue
Fan Speed,Fan Speed,Fan1,Speed,slider,0,3000,50,RPM,1000
Rack Power,IT Load,Rack1,PowerLoad,slider,0,20000,100,W,8000
```

| Column | Required | Description |
|---|---|---|
| `Key` | ✓ | Variable name (spaces become `_` internally) |
| `Description` | ✓ | Label shown in the UI |
| `ComponentIdentifier` | ✓ | Backend component name/ID |
| `PropertyIdentifier` | ✓ | Backend property name/ID |
| `EditType` | ✓ | `slider` = slider shown in Operating Conditions tab |
| `Min` | | Slider minimum |
| `Max` | | Slider maximum |
| `Step` | | Slider step |
| `Unit` | | Unit label displayed next to value |
| `DefaultValue` | | Initial value pre-loaded on connect |

### Outputs.csv

```csv
Key,Description,ComponentIdentifier,PropertyIdentifier,Category,Unit
Outlet Temperature,Outlet Temperature,Outlet1,Temperature,thermal,°C
Pressure Drop,System Pressure Drop,System1,PressureDrop,hydraulic,Pa
```

| Column | Required | Description |
|---|---|---|
| `Key` | ✓ | Variable name |
| `Description` | ✓ | Human-readable label |
| `ComponentIdentifier` | ✓ | Backend component |
| `PropertyIdentifier` | ✓ | Backend property |
| `Category` | | Grouping label |
| `Unit` | | Unit label |

> **Tip:** Place both files in the same directory and enter that path as "IO Definition Directory" in the Configuration tab.

---

## 12. Custom Extensions (loading .js / .css)

The **Configuration → Custom Extensions** section lets you inject custom JavaScript and CSS files at runtime without touching the source code. This is the primary extension point for users who want to:

- Add custom UI panels or buttons
- Send backend-specific commands
- Override styles
- Integrate third-party widgets

### How it works

1. Host your `.js` / `.css` files on any local or remote server (e.g. `http://localhost:9000/my-ext.js`)
2. Paste the URLs (one per line) in the JS/CSS URL text areas in the Configuration tab
3. Click **Load Extensions** — the files are injected as `<script>` / `<link>` tags
4. Your scripts have access to **`window.__bridgeAPI`**

### `window.__bridgeAPI` reference

The bridge API is always available as `window.__bridgeAPI`. It is a plain object that is kept up-to-date on every React render, so you always call the latest version of every function.

```js
const api = window.__bridgeAPI;
```

| Property / Method | Type | Description |
|---|---|---|
| `api.connected` | `boolean` | `true` when WebSocket is open |
| `api.state` | `object \| null` | Latest server state (see `state` message above) |
| `api.schema` | `object` | Latest schema (inputs + outputs definitions) |
| `api.send(msg)` | `function` | Send a raw message object (low-level) |
| `api.configure(path, ioDir, backend)` | `function` | Send a `configure` message |
| `api.openProject()` | `function` | Send an `open_project` message |
| `api.closeProject()` | `function` | Send a `close_project` message |
| `api.closeFlownex()` | `function` | Send a `close_app` message |
| `api.setInput(scope, key, value)` | `function` | Send a `set_input` message |
| `api.runSteady()` | `function` | Send a `run` message |
| `api.getState()` | `function` | Send a `get_state` message |
| `api.sendCustom(msgType, payload)` | `function` | Send a `custom_msg` message |

### Example extension script

```js
// my-extension.js  (hosted at http://localhost:9000/my-extension.js)

const api = window.__bridgeAPI;

// Increase fan speed every 5 seconds
setInterval(() => {
  if (api.connected) {
    const current = api.state?.inputs?.dynamic?.Fan_Speed ?? 1000;
    api.setInput("dynamic", "Fan_Speed", Math.min(current + 100, 3000));
    console.log("Fan speed bumped to", current + 100);
  }
}, 5000);

// Send a backend-specific command
api.sendCustom("start_transient", { duration: 60, dt: 0.1 });
```

> ⚠️ **Security:** Only load scripts from sources you trust. Custom scripts run with full page access and can call any bridge function, including `closeFlownex()`.

---

## 13. Configuration Files

### `stream.config.json` — WebRTC stream settings

```json
{
  "source": "python_webrtc",
  "python_webrtc": {
    "server": "127.0.0.1",
    "port": 8001
  },
  "local": {
    "server": "127.0.0.1",
    "signalingPort": 49100,
    "mediaPort": null
  }
}
```

| Key | Values | Description |
|---|---|---|
| `source` | `"python_webrtc"` \| `"local"` \| `"stream"` \| `"gfn"` | Active stream source |
| `python_webrtc.server` | IP address | Host running the Python bridge server |
| `python_webrtc.port` | number | Port the bridge server listens on (default `8001`) |
| `local.server` | IP address | Host running NVIDIA Omniverse Kit (legacy path) |
| `local.signalingPort` | number | WebRTC signaling port used by Omniverse Kit (default `49100`) |
| `local.mediaPort` | number \| `null` | Media port (`null` = auto) |

**`"python_webrtc"` is the default source.** The browser connects to the Python aiortc server via `POST http://{server}:{port}/webrtc/offer`. No Node.js WebRTC library is loaded; data exchange between the stream and the simulation backend happens inside the same Python process with no marshalling overhead.

Set `"source": "local"` to fall back to the legacy NVIDIA Omniverse NVST library path.

### `.env`

```
GENERATE_SOURCEMAP=false
```

Suppresses source map warnings from the NVIDIA library.

---

## 14. Connecting a Real Backend

### Flownex

1. Install pythonnet and the Flownex SDK on the machine running the bridge.
2. Open `flownex-bridge/adapters/flownex_direct.py`.
3. Replace the `TODO: REAL IMPLEMENTATION` blocks:

```python
def open_project(self, project_path: str) -> None:
    import clr
    clr.AddReference("Flownex.Automation")
    from Flownex.Automation import FlownexApplication
    self._api = FlownexApplication()
    self._api.OpenProject(project_path)
    self._opened = True

def set_property(self, component_identifier, property_identifier, value):
    self._api.SetValue(component_identifier, property_identifier, value)

def solve_steady(self):
    self._api.Solve()

def read_outputs(self, outputs_def):
    return {
        k: self._api.GetValue(v.componentIdentifier, v.propertyIdentifier)
        for k, v in outputs_def.items()
    }
```

4. In the UI Configuration tab, select **Flownex** backend, enter your project file and IO directory, and click **Apply Configure** → **Open Project**.

### Ansys

Wire up `flownex-bridge/adapters/ansys_stub.py` using [PyFluent](https://fluent.docs.pyansys.com/) or the Ansys pythonnet API in the same `TODO` blocks.

### NVIDIA Omniverse Kit

Wire up `flownex-bridge/adapters/omniverse_stub.py` using the [Omniverse Kit Python extension API](https://docs.omniverse.nvidia.com/kit/docs/kit-sdk-manual/latest/). The adapter runs inside a Python process that has access to the Omniverse Kit runtime.

---

## 15. WebRTC Streaming Setup

The app can display a live video feed as the background. Two sources are supported.

---

### 15.1 Python WebRTC server (default — recommended)

The built-in Python WebRTC server (`flownex-bridge/webrtc_server.py`) is powered by [aiortc](https://github.com/aiortc/aiortc) and runs **inside the same Python process as the simulation bridge**, eliminating the marshalling overhead that arises when a separate Node.js runtime is used.

#### How it works

```
Browser (RTCPeerConnection)          Python bridge (port 8001)
──────────────────────────           ─────────────────────────
addTransceiver("video", recvonly)
createDataChannel("bridge")
createOffer()
                ──── POST /webrtc/offer ────►
                                             setRemoteDescription
                                             addTrack(_OmniverseVideoTrack)
                                             createAnswer
                                             wait for ICE gathering
                ◄─── { sdp, type } ─────────
setRemoteDescription
[video frames arrive via ontrack]
[messages via RTCDataChannel "bridge"]
```

#### Video track

`_OmniverseVideoTrack` in `webrtc_server.py` is currently a **placeholder** that streams an animated colour-cycling test pattern. Replace it with an `aiortc.contrib.media.MediaPlayer` that consumes an RTSP/RTP feed from Omniverse Kit (or any other video source) to show real content:

```python
# flownex-bridge/webrtc_server.py — swap the stub track for a real relay

from aiortc.contrib.media import MediaPlayer

class _OmniverseVideoTrack(MediaStreamTrack):
    kind = "video"

    def __init__(self) -> None:
        super().__init__()
        self._player = MediaPlayer("rtsp://127.0.0.1:8554/live")
        self._track = self._player.video

    async def recv(self):
        return await self._track.recv()
```

#### Data channel

The browser's `RTCDataChannel` labelled `"bridge"` mirrors the WebSocket messaging protocol described in Section 9. Custom events sent from the Omniverse Kit extension are delivered here.

#### Sending messages to the stream

`AppStream.sendMessage(jsonString)` routes through the data channel when `source` is `"python_webrtc"`:

```js
AppStream.sendMessage(JSON.stringify({
    event_type: "colorize",
    payload: { property: "temperature", colormap: "turbo", min: 20, max: 90 }
}));
```

---

### 15.2 Legacy NVIDIA Omniverse NVST path (`source: "local"`)

> **Use this path only if you need to connect to an Omniverse Kit NVST streaming server directly** (e.g., for multi-user sessions managed by Omniverse Nucleus).

1. **Edit `stream.config.json`**, set `"source": "local"` and fill in the Omniverse Kit IP and signaling port (default `49100`).

2. **Start Omniverse Kit** with the WebRTC streaming extension (`omni.kit.livestream.webrtc`) enabled.

3. **Start the React app** (`npm start`).

4. Click **▶ Connect Omniverse Stream** in the dashboard header.

The app ships with a local stub (`src/lib/omniverse-webrtc-stub.js`). To use the **real** NVIDIA library:

1. Obtain access to the NVIDIA npm registry (`edge.urm.nvidia.com`).
2. Remove the local `file:` dependency in `package.json` and install the real package.
3. `AppStream.js` already imports from `@nvidia/omniverse-webrtc-streaming-library` so no import changes are needed.

Run `npm run check-stub` to confirm which library is active.

---

## 16. Troubleshooting

### `NO BRIDGE` status / bridge not connecting

- Make sure `npm start` launched the Python bridge (check the `BRIDGE` terminal column).
- Check http://127.0.0.1:8001/health in your browser — it should return `{"ok":true}`.
- Ensure Python dependencies are installed: `pip install -r flownex-bridge/requirements.txt`.
- Check that port 8001 is not in use by another process.

### "No inputs received yet" in Operating Conditions

- The bridge loads input/output schema from CSV files.
- In the **Configuration** tab, enter the full path to the directory containing `Inputs.csv` and `Outputs.csv`, then click **Apply Configure**.
- If you have no project yet, create the CSV files manually — see [Section 11](#11-csv-schema-format-inputscsv--outputscsv).

### Omniverse stream fails / NVST_R_BUSY

- This error only applies to the legacy `"source": "local"` (NVIDIA NVST) path.
- The app waits 2 seconds after `stop()` before reconnecting to avoid race conditions on the Omniverse server.
- Verify Omniverse Kit is running and the WebRTC extension is enabled.
- Check `stream.config.json` for correct IP/port.
- If streaming from another machine, open ports 49100 (signaling) and the media port in the firewall.

### Python WebRTC stream not connecting

The default stream source (`"python_webrtc"`) uses the Python aiortc server that is bundled with the bridge.

- Confirm the bridge is running: open http://127.0.0.1:8001/health — it should return `{"ok":true}`.
- Confirm the signalling endpoint exists: `curl -X POST http://127.0.0.1:8001/webrtc/offer` should return an HTTP 422 (missing body), not a 404.
- Ensure aiortc and its dependencies are installed: `pip install -r flownex-bridge/requirements.txt`.
- Open the browser DevTools console and look for `[Python WebRTC]` log lines. A successful connection prints:
  ```
  [Python WebRTC] data channel open
  [Python WebRTC] peer connection established
  ```
- If you see `Signalling server returned HTTP 500`, check the bridge terminal for Python stack traces.
- If CORS blocks the POST request, ensure the React dev-server port (3000 or 3001) is listed in the `allow_origins` list in `flownex-bridge/server.py`.

### `react-scripts: not found`

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### "Configure failed: Inputs.csv not found"

The path entered in the Configuration tab must be the **directory** containing both `Inputs.csv` and `Outputs.csv`. Paths with spaces must be entered as-is (the bridge handles them correctly).

### Port 8001 already in use

```bash
# macOS / Linux — find the PID
lsof -i :8001
kill <PID>

# Windows
netstat -ano | findstr :8001
taskkill /PID <PID> /F
```

### Custom extension script not running

- Open the browser DevTools console — load errors are shown there.
- Check that the server hosting the JS/CSS file has CORS enabled, or serve from the same origin.
- Verify the URL is reachable: paste it directly into a new browser tab.
- Reload the page and re-click **Load Extensions** — scripts are not cached between page loads.

### Verify your installation

```bash
npm run verify
```

---

## 17. License

MIT

