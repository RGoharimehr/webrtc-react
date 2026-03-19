Use the backend folder I provided as the source of truth.

Important backend routing:
- The React web app must talk to the WebSocket protocol implemented in backend/bridge_ws_handlers.py
- Do NOT use backend/ws_handlers.py for the React app
- backend/ws_handlers.py is for the direct USD/request-response socket, not the web app bridge

The web app should treat the Omniverse extension backend as the owner of:
- configuration
- project lifecycle
- Flownex status
- input definitions
- output definitions
- current input values
- current output values
- runtime status
- transient history/state

Required frontend-supported commands
------------------------------------
The frontend should support these outgoing commands:

1. configure
{
  "type": "configure",
  "id": "<uuid>",
  "payload": {
    "projectPath": "<string>",
    "ioDir": "<string>",
    "backend": "flownex",
    "solveOnChange": <bool optional>,
    "resultPollingInterval": <float optional>
  }
}

2. open_flownex
{
  "type": "open_flownex",
  "id": "<uuid>",
  "payload": {}
}

3. open_project
{
  "type": "open_project",
  "id": "<uuid>",
  "payload": {}
}

4. close_project
{
  "type": "close_project",
  "id": "<uuid>",
  "payload": {}
}

5. close_app
{
  "type": "close_app",
  "id": "<uuid>",
  "payload": {}
}

6. get_state
{
  "type": "get_state",
  "id": "<uuid>",
  "payload": {}
}

7. set_input
{
  "type": "set_input",
  "id": "<uuid>",
  "payload": {
    "scope": "dynamic" | "static",
    "key": "<string>",
    "value": <number or bool>
  }
}

8. run
{
  "type": "run",
  "id": "<uuid>",
  "payload": { "mode": "steady" }
}

9. load_defaults_and_run_steady
{
  "type": "load_defaults_and_run_steady",
  "id": "<uuid>",
  "payload": {}
}

10. start_transient
{
  "type": "start_transient",
  "id": "<uuid>",
  "payload": {}
}

11. stop_transient
{
  "type": "stop_transient",
  "id": "<uuid>",
  "payload": {}
}

Incoming backend push messages to support
-----------------------------------------
The frontend must handle these incoming pushed messages:

1. schema
{
  "type": "schema",
  "payload": {
    "inputs": [...],
    "outputs": [...]
  }
}

2. state
{
  "type": "state",
  "payload": {
    "status": {
      "state": "idle" | "running" | "error",
      "message": "<string>",
      "progress": <number>
    },
    "connected_project": "<string>",
    "io_directory": "<string>",
    "inputs": {
      "dynamic": {...},
      "static": {...}
    },
    "outputs": {...},
    "history": [...],
    "transientRunning": <bool>
  }
}

3. status
{
  "type": "status",
  "payload": {
    "state": "idle" | "running" | "error",
    "message": "<string>",
    "progress": <number>
  }
}

4. inputs_delta
{
  "type": "inputs_delta",
  "payload": {
    "scope": "dynamic" | "static",
    "key": "<string>",
    "value": <value>
  }
}

5. outputs_delta
{
  "type": "outputs_delta",
  "payload": {
    "key": "<string>",
    "value": <value>
  }
}

Frontend requirements
---------------------
1. Preserve the current UI as much as possible.
2. Keep tab state persistent when switching tabs.
3. Store important backend-driven state in shared frontend state:
   - projectPath
   - ioDir
   - backend
   - schema.inputs
   - schema.outputs
   - input values
   - output values
   - status
   - history
   - transientRunning
4. Configuration tab must include buttons for:
   - Open Flownex
   - Open Project
   - Close Project
   - Close Flownex
   - Apply Configure
5. Operating Conditions tab must render dynamic inputs from backend schema.
6. Geometrical Design tab must render static inputs from backend schema.
7. Results / metrics panels must use backend outputs when available.
8. Do not assume the browser can provide a true native file path.
   - projectPath and ioDir must still support manual full-path text entry
   - do not replace the path field with only a filename

Important note
--------------
The backend now follows the original Omniverse extension logic more closely:
- server-side cached inputs/outputs
- solve-on-change support
- load defaults + steady solve
- transient start/stop
- polling during transient using resultPollingInterval

Refactor the web app to match this backend contract.
Do not invent a new protocol.
Do not use the old standalone bridge assumptions if they conflict with these files.