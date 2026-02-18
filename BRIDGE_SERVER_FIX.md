# Bridge Server Startup Fix

## Problem

When running `npm start`, the application failed with the following error:

```
[BRIDGE] Traceback (most recent call last):
[BRIDGE]   File "
[BRIDGE] ImportError: cannot import name 'BridgeState' from 'state'
```

The bridge server (Python FastAPI application) was crashing immediately on startup.

## Root Cause

The `flownex-bridge/state.py` file contained incorrect code. Instead of containing the `BridgeState` class that `server.py` was trying to import, it contained the `FlownexDirectAdapter` class code (which should be in `adapters/flownex_direct.py`).

## Solution

Completely rewrote `flownex-bridge/state.py` with the proper `BridgeState` class implementation that includes:

### BridgeState Class

The main state management class with:

**Initialization:**
- `connected_project` - Currently connected project path
- `inputs_def` / `outputs_def` - Schema definitions loaded from CSV
- `inputs` / `outputs` - Runtime values (dynamic/static)
- `status` - Current status (state, message, progress)
- `_boot_ts` - Timestamp for uptime tracking

**Methods:**
1. `load_schema_from_csv(inputs_csv, outputs_csv)` - Load I/O definitions from CSV files
2. `schema_dict()` - Serialize schema for client
3. `state_dict()` - Serialize full state for client
4. `status_dict()` - Serialize status for client
5. `set_input(scope, key, value)` - Update input value
6. `set_output(key, value)` - Update output value
7. `_load_inputs(path)` - Internal: Parse inputs CSV
8. `_load_outputs(path)` - Internal: Parse outputs CSV

### Data Classes

**InputDef** - Defines an input parameter:
- key, rawKey, description
- componentIdentifier, propertyIdentifier
- editType (slider, text, etc.)
- min, max, step, defaultValue
- unit

**OutputDef** - Defines an output parameter:
- key, rawKey, description
- componentIdentifier, propertyIdentifier
- category
- unit

### Helper Functions

- `sanitize_key(key)` - Normalize keys by replacing spaces with underscores
- `_to_float(x, default)` - Safe float conversion with fallback
- `_to_int(x, default)` - Safe int conversion with fallback

## How It Works

1. **Server starts**: `server.py` imports `BridgeState` from `state`
2. **State initialized**: `state = BridgeState()` creates empty state
3. **WebSocket connection**: Client connects via `/ws`
4. **Configuration**: Client sends project path and I/O directory
5. **Schema loading**: `state.load_schema_from_csv()` reads CSV files
6. **Runtime operations**:
   - Input updates: `state.set_input()` 
   - Solve runs: Read outputs with `state.set_output()`
   - Status updates: `state.status` modified directly

## Verification

### Test 1: Import Check
```bash
cd flownex-bridge
python -c "from state import BridgeState"
# Result: Success (no error)
```

### Test 2: Server Startup
```bash
cd flownex-bridge
python -m uvicorn server:app --host 127.0.0.1 --port 8001
# Result: 
# INFO: Started server process
# INFO: Application startup complete
# INFO: Uvicorn running on http://127.0.0.1:8001
```

### Test 3: Full Application
```bash
npm start
# Result:
# [BRIDGE] INFO: Uvicorn running on http://127.0.0.1:8001
# [REACT] Compiled successfully!
# [REACT] You can now view webrtc-react in the browser.
# [REACT]   Local: http://localhost:3001
```

✅ **Both services start successfully!**

## Files Modified

- `flownex-bridge/state.py` - Complete rewrite (206 lines)
  - Removed: Incorrect FlownexDirectAdapter code
  - Added: Proper BridgeState class with all required functionality

## Impact

- ✅ Bridge server now starts without errors
- ✅ `npm start` works end-to-end
- ✅ WebSocket API functional for client-server communication
- ✅ Ready for integration with Flownex API when available

## Related Files

The following files work together:

```
flownex-bridge/
├── server.py              # FastAPI server, WebSocket endpoints
├── state.py              # BridgeState class (FIXED)
├── requirements.txt      # Python dependencies
└── adapters/
    ├── __init__.py
    └── flownex_direct.py # Flownex API adapter (stub mode)
```

## Future Work

The current implementation includes:
- ✅ Full state management
- ✅ CSV schema loading
- ✅ WebSocket communication
- ✅ Stub mode (works without Flownex installed)

When integrating with actual Flownex:
- Update `adapters/flownex_direct.py` with real API calls
- Provide actual `Inputs.csv` and `Outputs.csv` files
- Configure project path in client UI

The bridge server is now fully functional and ready for use!
