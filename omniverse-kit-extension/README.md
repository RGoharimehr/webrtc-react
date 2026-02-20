# Omniverse Kit — USD Property Query Handler

This folder gives you **two ways** to make the "Thermofluidic Info" HUD work in the web dashboard.  Start with Method 0 — it takes 30 seconds and requires nothing to install.

---

## Why does anything need to run in Kit at all?

> "WebRTC is already sending messages to Omniverse — why can't it just pass USD attributes?"

Here is the boundary:

```
Browser (JavaScript)                    Omniverse Kit (Python / C++)
────────────────────                    ────────────────────────────
React dashboard                         USD stage (live, in memory)
                                        prim attributes, scene graph
         ◄──── WebRTC video stream ────►
         ◄──── custom JSON messages ───►
```

* The **WebRTC streaming library** is only a relay — it moves video and JSON messages between the browser and Kit.  It has no USD awareness.
* **USD attributes live inside Kit's C++/Python process**.  The only way to read them is to call `stage.GetPrimAtPath(...)` from Python code running *inside* Kit.
* This is not extra complexity — it is a hard process boundary.  Omniverse intentionally exposes a custom-message channel so you can write exactly this kind of integration without needing any special SDK.

The good news: **you don't need to install anything**.  Kit ships with a Script Editor.  Paste ~30 lines of Python, press Run.  Done.

---

## Method 0 — Kit Script Editor (no installation, recommended for first use)

1. Open **Window → Script Editor** in your Kit application (USD Composer / Code / Isaac Sim / any Kit app).

2. Open [`kit-startup-script/prim_query_handler.py`](../kit-startup-script/prim_query_handler.py) from this repo and copy its entire contents.

3. Paste into the Script Editor and click **Run** (▶).

4. You should see this in the Script Editor output:
   ```
   ✅  prim_query_handler registered — hold I + click on the stream to query USD attributes
   ```

5. Go to the web dashboard, hold **I**, click-hold on a USD object for 1 second → the Thermofluidic Info HUD appears.

> **Session lifetime:** the handler stays registered until Kit is closed or you restart the Script Editor environment.  Re-run the script after each Kit restart, or use Method 1 to make it permanent.

---

## Method 1 — Kit extension (persistent, auto-loads on startup)

Use this when you want the handler to load automatically every time Kit starts.

### Quick setup

1. Copy (or symlink) the `exts/omni.webrtc.flownex_bridge` directory to your Kit shared extensions folder:

   ```
   Windows:  %USERPROFILE%\Documents\kit\shared\exts\
   Linux:    ~/Documents/kit/shared/exts/
   ```

2. Open **Window → Extensions**, search for **"Flownex WebRTC Bridge"**, and click **Enable**.

3. Confirm in the Kit log:
   ```
   [INFO] FlownexBridge: startup (ext_id=omni.webrtc.flownex_bridge-1.0.0)
   [INFO] FlownexBridge: registered via omni.services.streaming.manager ✓
   ```

### Alternative: add search path to your `.kit` file

```toml
[[ext_folders]]
path = "${app}/../../../omniverse-kit-extension/exts"
```

---

## Protocol reference

### Browser → Kit

```json
{
  "event_type": "get_prim_property",
  "payload": {
    "prim_path": "",
    "property":  "flownex:componentName",
    "pick":      { "x": 0.42, "y": 0.61 }
  }
}
```

| Field | Type | Description |
|---|---|---|
| `event_type` | string | Omniverse routing key — **required**, must be `"get_prim_property"` |
| `payload.prim_path` | string | USD prim path. **Leave empty** and set `pick` for coordinate-based lookup |
| `payload.property` | string | USD attribute name (e.g. `"flownex:componentName"`) |
| `payload.pick` | object | Normalised viewport coordinates (0–1) used when `prim_path` is empty |

### Kit → Browser

```json
{
  "event_type": "prim_property_result",
  "payload": {
    "prim_path": "/World/DataCenter/Rack_A/Pump_01",
    "property":  "flownex:componentName",
    "value":     "Pump_01"
  }
}
```

| Field | Type | Description |
|---|---|---|
| `event_type` | string | `"prim_property_result"` |
| `payload.prim_path` | string | Resolved USD prim path |
| `payload.property` | string | The attribute that was queried |
| `payload.value` | any | Attribute value (`null` when not found) |

---

## Debugging

Enable verbose output for the Script Editor handler:

```python
import logging
logging.getLogger("flownex_prim_handler").setLevel(logging.INFO)
```

Enable verbose output for the packaged extension:

```python
import logging
logging.getLogger("omni.webrtc.flownex_bridge").setLevel(logging.DEBUG)
```

---

## File structure

```
kit-startup-script/
└── prim_query_handler.py       ← paste into Script Editor (Method 0)

omniverse-kit-extension/
└── exts/
    └── omni.webrtc.flownex_bridge/
        ├── config/
        │   └── extension.toml  ← Kit manifest (Method 1)
        └── omni/webrtc/flownex_bridge/
            ├── __init__.py
            └── extension.py    ← same logic, packaged as an extension
```

