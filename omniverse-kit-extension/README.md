# Omniverse Kit Extension — `omni.webrtc.flownex_bridge`

This Kit extension bridges the **web dashboard** and the **USD stage** using the Omniverse streaming custom-messaging channel.

## What it does

When the user holds the pointer on the Omniverse stream for 1 second, the web app sends a `get_prim_property` message.  This extension:

1. Receives the message.
2. If no `prim_path` is provided, performs a viewport pick at the given normalised coordinates to resolve the prim.
3. Reads the requested USD attribute from the prim.
4. Sends a `prim_property_result` response back to the browser.

---

## Protocol

### Browser → Kit

```json
{
  "type":      "get_prim_property",
  "prim_path": "",
  "property":  "flownex:componentName",
  "pick":      { "x": 0.42, "y": 0.61 }
}
```

| Field | Type | Description |
|---|---|---|
| `type` | string | Always `"get_prim_property"` |
| `prim_path` | string | USD prim path.  **Leave empty** and set `pick` for coordinate-based lookup. |
| `property` | string | USD attribute name (e.g. `"flownex:componentName"`) |
| `pick` | object | Normalised viewport coordinates (0–1) used when `prim_path` is empty |

### Kit → Browser

```json
{
  "type":      "prim_property_result",
  "prim_path": "/World/DataCenter/Rack_A/Pump_01",
  "property":  "flownex:componentName",
  "value":     "Pump_01"
}
```

| Field | Type | Description |
|---|---|---|
| `type` | string | Always `"prim_property_result"` |
| `prim_path` | string | Resolved USD prim path |
| `property` | string | The attribute that was queried |
| `value` | any | Attribute value (`null` when not found) |

---

## Installation

### Method 1 — Kit extension search path (recommended)

1. Copy (or symlink) the `exts/omni.webrtc.flownex_bridge` directory into a folder that is on your Kit extension search path, for example:

   ```
   %USERPROFILE%\Documents\kit\shared\exts\    (Windows)
   ~/Documents/kit/shared/exts/                (Linux / macOS)
   ```

2. In **Omniverse Launcher → Settings → Extension Search Paths**, ensure the path above is listed.

3. Open **Window → Extensions**, search for "Flownex WebRTC Bridge", and enable it.

### Method 2 — Local extension folder in Kit config

Add the `exts/` directory to your Kit application's `[settings]` in `<app>.kit`:

```toml
[settings]
exts."omni.kit.registry.nucleus".registries = []

[[ext_folders]]
path = "${app}/../../../omniverse-kit-extension/exts"
```

### Method 3 — Development mode (Omniverse Code / USD Composer)

1. Open **Window → Extensions → ☰ (hamburger) → Settings**.
2. Add `<repo-root>/omniverse-kit-extension/exts` to the **Extension Search Paths**.
3. Search for "flownex" and enable the extension.

---

## Requirements

| Requirement | Notes |
|---|---|
| Omniverse Kit ≥ 104 | Tested on Kit 104–106 |
| `omni.services.streaming.manager` **or** `omni.kit.livestream.messaging` | One of these must be present for messaging to work.  Kit 105+ ships the former; older versions ship the latter. |
| USD stage open | The extension reads attributes from the currently open USD stage. |

---

## Development / debugging

Enable verbose logging for this extension:

```toml
# In your app .kit file
[settings.log]
level = "DEBUG"
channel."omni.webrtc.flownex_bridge" = "DEBUG"
```

Or at runtime in the Script Editor:

```python
import logging
logging.getLogger("omni.webrtc.flownex_bridge").setLevel(logging.DEBUG)
```

---

## File structure

```
omniverse-kit-extension/
└── exts/
    └── omni.webrtc.flownex_bridge/
        ├── config/
        │   └── extension.toml          ← Kit manifest
        └── omni/webrtc/flownex_bridge/
            ├── __init__.py
            └── extension.py            ← all logic lives here
```
