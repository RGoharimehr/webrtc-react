# kit-cae Backend API Requirements

This document specifies the WebSocket API that must be implemented in the NVIDIA Omniverse kit-cae extension to work with this webapp.

## Overview

The kit-cae extension must provide:
1. **WebSocket Server** on port 49080 (configurable) for control/data API
2. **WebRTC Signaling Server** on port 49100 for video streaming

## WebSocket Server Implementation

### Server Setup

The extension should start a WebSocket server on startup:

```python
# In your kit-cae extension (Python)
import asyncio
import websockets
import json

class KitCAEWebSocketServer:
    def __init__(self, host="0.0.0.0", port=49080):
        self.host = host
        self.port = port
        self.clients = set()
        
    async def handler(self, websocket, path):
        # Register client
        self.clients.add(websocket)
        try:
            async for message in websocket:
                await self.handle_message(websocket, message)
        finally:
            self.clients.remove(websocket)
    
    async def handle_message(self, websocket, message):
        try:
            data = json.loads(message)
            response = await self.route_message(data)
            await websocket.send(json.dumps(response))
        except Exception as e:
            error_response = {
                "type": f"{data.get('type', 'unknown')}.result",
                "requestId": data.get("requestId"),
                "ok": False,
                "error": {
                    "code": "SERVER_ERROR",
                    "message": str(e)
                }
            }
            await websocket.send(json.dumps(error_response))
```

### Message Protocol

All messages are JSON objects.

#### Request Format
```json
{
  "type": "inputs.set",
  "requestId": "req_1_1234567890",
  "payload": {
    "ambientTemp": 25,
    "fanRPM": 500
  }
}
```

#### Success Response Format
```json
{
  "type": "inputs.set.result",
  "requestId": "req_1_1234567890",
  "ok": true,
  "payload": {}
}
```

#### Error Response Format
```json
{
  "type": "inputs.set.result",
  "requestId": "req_1_1234567890",
  "ok": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Temperature out of range",
    "details": {
      "field": "ambientTemp",
      "value": 150,
      "range": [10, 40]
    }
  }
}
```

#### Push Update Format (No Response Expected)
```json
{
  "type": "push.outputs",
  "payload": {
    "temperature": 68.5,
    "pressure": 1.35,
    "power": 125.8,
    "iteration": 42,
    "time": 21.0
  }
}
```

## Required API Endpoints

### 1. Connection & Health

#### `ping`
Health check endpoint.

**Request:**
```json
{
  "type": "ping",
  "requestId": "req_1"
}
```

**Response:**
```json
{
  "type": "ping.result",
  "requestId": "req_1",
  "ok": true,
  "payload": {
    "serverTime": "2026-02-17T16:00:00Z",
    "appName": "kit-cae",
    "version": "1.0.0"
  }
}
```

#### `status.get`
Get current server status.

**Response payload:**
```json
{
  "state": "running",  // or "idle", "error"
  "currentCase": "datacenter_cooling",
  "mode": "transient",
  "errors": []
}
```

### 2. Inputs & Configuration

#### `inputs.get`
Get current input parameters.

**Response payload:**
```json
{
  "ambientTemp": 25,
  "deltaTemp": 15,
  "fanRPM": 500,
  "heatLoad": 125,
  "humidity": 50
}
```

#### `inputs.set`
Set one or more input parameters.

**Request payload:**
```json
{
  "ambientTemp": 27,
  "fanRPM": 600
}
```

#### `config.get`
Get configuration settings.

**Response payload:**
```json
{
  "projectFile": "/path/to/project.fnx",
  "ioDirectory": "/path/to/io_defs",
  "solveOnChange": true,
  "dataInterval": 0.5,
  "pollInterval": 500
}
```

#### `config.set`
Set configuration settings.

**Request payload:**
```json
{
  "solveOnChange": false,
  "dataInterval": 1.0
}
```

### 3. Simulation Control

#### `sim.startTransient`
Start transient simulation.

**Response payload:**
```json
{
  "status": "started",
  "timestamp": "2026-02-17T16:00:00Z"
}
```

#### `sim.stopTransient`
Stop transient simulation.

**Response payload:**
```json
{
  "status": "stopped",
  "samplesCollected": 150
}
```

#### `sim.loadSteadyState`
Load steady-state solution (optional).

**Response payload:**
```json
{
  "status": "loaded",
  "convergence": 0.001
}
```

### 4. Outputs & History

#### `outputs.get`
Get latest output values.

**Response payload:**
```json
{
  "temperature": 68.5,
  "pressure": 1.35,
  "velocity": 2.4,
  "power": 125.8,
  "humidity": 52,
  "iteration": 42,
  "time": 21.0
}
```

#### `history.get`
Get historical data.

**Request payload:**
```json
{
  "variables": ["temperature", "pressure"],
  "xAxis": "time",
  "sinceIndex": 0
}
```

**Response payload:**
```json
{
  "data": [
    {"time": 0.0, "temperature": 65.0, "pressure": 1.30},
    {"time": 0.5, "temperature": 66.2, "pressure": 1.32},
    {"time": 1.0, "temperature": 67.1, "pressure": 1.34}
  ],
  "count": 3
}
```

#### `history.clear`
Clear history buffer.

### 5. Visualization

#### `viz.setProperty`
Set which property to visualize.

**Request payload:**
```json
{
  "property": "temperature"
}
```

#### `viz.setColormap`
Set colormap for visualization.

**Request payload:**
```json
{
  "colormap": "viridis",
  "minBound": 20,
  "maxBound": 80
}
```

#### `viz.refresh`
Force refresh visualization.

#### `viz.getOptions`
Get available visualization options.

**Response payload:**
```json
{
  "properties": ["temperature", "pressure", "velocity", "humidity"],
  "colormaps": ["jet", "viridis", "inferno", "plasma", "turbo"]
}
```

### 6. Recording & Export

#### `record.start`
Start recording session.

**Request payload:**
```json
{
  "xAxis": "time",
  "variables": ["temperature", "pressure", "power"]
}
```

#### `record.stop`
Stop recording and export.

**Response payload (file path option):**
```json
{
  "filePath": "C:/Users/user/Documents/OmniCoolExports/recording_2026-02-17_16-00-00.xlsx",
  "sampleCount": 150
}
```

**Response payload (base64 option):**
```json
{
  "base64": "UEsDBBQABgAIAAAAIQ...",
  "filename": "OmniCool_Record_2026-02-17_16-00-00.xlsx",
  "sampleCount": 150
}
```

#### `record.export`
Export on demand.

### 7. Mapping

#### `mapping.apply`
Apply output mapping to Omniverse prims.

#### `mapping.exportZip`
Export project as ZIP.

**Response payload:**
```json
{
  "filePath": "/path/to/project_export_2026-02-17.zip"
}
```

#### `mapping.importZip`
Import project from ZIP.

**Request payload:**
```json
{
  "path": "/path/to/project.zip"
}
```

## Push Updates

The server should send push updates periodically during simulation:

### `push.outputs`
Send current output values (every 500ms during simulation).

```json
{
  "type": "push.outputs",
  "payload": {
    "temperature": 68.5,
    "pressure": 1.35,
    "power": 125.8,
    "iteration": 42,
    "time": 21.0
  }
}
```

## WebRTC Signaling Server

Implement a separate WebRTC signaling server on port 49100 for video streaming.

### Signaling Protocol

The server should:
1. Send SDP offer when client connects
2. Receive SDP answer from client
3. Exchange ICE candidates
4. Stream Omniverse viewport to client

**Example signaling message (offer):**
```json
{
  "sdp": {
    "type": "offer",
    "sdp": "v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\n..."
  }
}
```

## Configuration Settings

Add settings to kit-cae extension configuration:

```toml
[settings]
exts."omni.cdu.physics".wsApiPort = 49080
exts."omni.cdu.physics".wsApiHost = "0.0.0.0"
exts."omni.cdu.physics".webrtcSignalPort = 49100
exts."omni.cdu.physics".webrtcStreamPort = 47999
```

## Error Codes

Standard error codes to use:

- `INVALID_INPUT` - Input parameter validation failed
- `NOT_FOUND` - Requested resource not found
- `NOT_READY` - Service not ready (e.g., simulation not started)
- `TIMEOUT` - Operation timed out
- `SERVER_ERROR` - Internal server error
- `NOT_IMPLEMENTED` - Feature not yet implemented

## Implementation Checklist

- [ ] WebSocket server running on configurable port
- [ ] Message routing for all required endpoints
- [ ] Request/response with requestId tracking
- [ ] Push updates during simulation
- [ ] Error handling with standard error format
- [ ] WebRTC signaling server
- [ ] Video streaming from Omniverse viewport
- [ ] Configuration settings in extension
- [ ] Connection management (handle multiple clients)
- [ ] Graceful shutdown and cleanup

## Testing

Test the implementation with the webapp:

1. Start kit-cae extension with WebSocket server
2. Start webapp development server
3. Connect from webapp
4. Test each tab:
   - Operating Conditions: inputs.get, inputs.set, sim.start/stop
   - GraphsPanel: outputs.get, push.outputs subscription
   - Results Visualization: viz.* endpoints
   - Plotting: record.start/stop/export
   - Results Mapping: mapping.* endpoints
   - Configuration: config.get/set, status.get

## Performance Considerations

- Push updates: Send every 500ms (configurable)
- History buffer: Keep last 10,000 samples
- WebSocket: Handle 5+ concurrent clients
- Response time: < 100ms for most endpoints
- Large data: Use compression for history.get responses

## Security

- Validate all input parameters
- Sanitize file paths
- Rate limiting for API requests
- Authentication (optional, for production)
- CORS configuration for web access

## References

- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
- [WebRTC](https://webrtc.org/)
- [Omniverse Kit Extensions](https://docs.omniverse.nvidia.com/kit/docs/kit-manual/latest/guide/extensions.html)
