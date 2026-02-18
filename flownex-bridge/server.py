# flownex-bridge/server.py
from __future__ import annotations

import os
import asyncio
from typing import Any, Dict, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from state import BridgeState
from adapters.flownex_direct import FlownexDirectAdapter

app = FastAPI()

# allow local CRA dev server(s)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

state = BridgeState()
adapter = FlownexDirectAdapter()


def _set_status(s: str, msg: str, progress: float = 0.0) -> None:
    state.status = {"state": s, "message": msg, "progress": float(progress)}


async def _safe_send(ws: WebSocket, msg: Dict[str, Any]) -> None:
    try:
        await ws.send_json(msg)
    except Exception:
        # ignore send failure
        pass


@app.get("/health")
def health():
    return {"ok": True}


@app.websocket("/ws")
async def ws_endpoint(ws: WebSocket):
    await ws.accept()

    # send initial state (even if empty)
    await _safe_send(ws, {"type": "state", "payload": state.state_dict()})
    await _safe_send(ws, {"type": "schema", "payload": state.schema_dict()})

    try:
        while True:
            msg = await ws.receive_json()
            mtype = msg.get("type")
            payload = msg.get("payload") or {}
            mid = msg.get("id")

            # -----------------------------
            # CONFIGURE: projectPath + ioDir
            # -----------------------------
            if mtype == "configure":
                project_path = payload.get("projectPath") or ""
                io_dir = payload.get("ioDir") or ""

                # build inputs/outputs schema paths from io_dir
                inputs_csv = os.path.join(io_dir, "Inputs.csv")
                outputs_csv = os.path.join(io_dir, "Outputs.csv")

                # store connected_project even before open
                state.connected_project = project_path

                try:
                    if not os.path.isfile(inputs_csv):
                        raise FileNotFoundError(f"Inputs.csv not found: {inputs_csv}")
                    if not os.path.isfile(outputs_csv):
                        raise FileNotFoundError(f"Outputs.csv not found: {outputs_csv}")

                    state.load_schema_from_csv(inputs_csv, outputs_csv)

                    _set_status("idle", "Configured (schema loaded)", 1.0)

                    await _safe_send(ws, {"type": "schema", "payload": state.schema_dict()})
                    await _safe_send(ws, {"type": "state", "payload": state.state_dict()})
                    await _safe_send(ws, {"type": "status", "payload": state.status_dict()})

                except Exception as e:
                    _set_status("error", f"Configure failed: {e}", 0.0)
                    await _safe_send(ws, {"type": "status", "payload": state.status_dict()})

                continue

            # -----------------------------
            # OPEN PROJECT
            # -----------------------------
            if mtype == "open_project":
                try:
                    if not state.connected_project:
                        raise RuntimeError("No project configured. Call configure() first.")

                    _set_status("running", "Opening Flownex project...", 0.2)
                    await _safe_send(ws, {"type": "status", "payload": state.status_dict()})

                    adapter.open_project(state.connected_project)

                    _set_status("idle", "Project opened", 1.0)
                    await _safe_send(ws, {"type": "status", "payload": state.status_dict()})
                    await _safe_send(ws, {"type": "state", "payload": state.state_dict()})

                except Exception as e:
                    _set_status("error", f"Open project failed: {e}", 0.0)
                    await _safe_send(ws, {"type": "status", "payload": state.status_dict()})
                continue

            # -----------------------------
            # CLOSE PROJECT
            # -----------------------------
            if mtype == "close_project":
                try:
                    _set_status("running", "Closing project...", 0.2)
                    await _safe_send(ws, {"type": "status", "payload": state.status_dict()})

                    adapter.close_project()

                    _set_status("idle", "Project closed", 1.0)
                    await _safe_send(ws, {"type": "status", "payload": state.status_dict()})
                    await _safe_send(ws, {"type": "state", "payload": state.state_dict()})

                except Exception as e:
                    _set_status("error", f"Close project failed: {e}", 0.0)
                    await _safe_send(ws, {"type": "status", "payload": state.status_dict()})
                continue

            # -----------------------------
            # CLOSE FLOWNEX APP
            # -----------------------------
            if mtype == "close_flownex":
                try:
                    _set_status("running", "Closing Flownex...", 0.2)
                    await _safe_send(ws, {"type": "status", "payload": state.status_dict()})

                    adapter.close_flownex()

                    _set_status("idle", "Flownex closed", 1.0)
                    await _safe_send(ws, {"type": "status", "payload": state.status_dict()})
                    await _safe_send(ws, {"type": "state", "payload": state.state_dict()})

                except Exception as e:
                    _set_status("error", f"Close Flownex failed: {e}", 0.0)
                    await _safe_send(ws, {"type": "status", "payload": state.status_dict()})
                continue

            # -----------------------------
            # SET INPUT
            # -----------------------------
            if mtype == "set_input":
                try:
                    scope = payload.get("scope", "dynamic")
                    key = payload.get("key", "")
                    value = payload.get("value")

                    # update local state
                    scope2, k2, v2 = state.set_input(scope, key, value)

                    # echo delta to client immediately
                    await _safe_send(ws, {"type": "inputs_delta", "payload": {"scope": scope2, "key": k2, "value": v2}})

                    # push to flownex ONLY if adapter is ready
                    # (you can restrict to "dynamic" if you want)
                    idef = state.inputs_def.get(k2)
                    if idef is None:
                        raise KeyError(f"Unknown input key: {k2}")

                    adapter.set_property(
                        component_identifier=idef.componentIdentifier,
                        property_identifier=idef.propertyIdentifier,
                        value=v2,
                    )

                    # optional: solve-on-change can be handled here later
                    _set_status("idle", "Input set", 1.0)
                    await _safe_send(ws, {"type": "status", "payload": state.status_dict()})

                except Exception as e:
                    _set_status("error", f"Set input failed: {e}", 0.0)
                    await _safe_send(ws, {"type": "status", "payload": state.status_dict()})
                continue

            # -----------------------------
            # RUN (steady)
            # -----------------------------
            if mtype == "run":
                mode = payload.get("mode", "steady")

                if mode != "steady":
                    _set_status("error", f"Unsupported run mode: {mode}", 0.0)
                    await _safe_send(ws, {"type": "status", "payload": state.status_dict()})
                    continue

                try:
                    _set_status("running", "Running steady solve...", 0.1)
                    await _safe_send(ws, {"type": "status", "payload": state.status_dict()})

                    adapter.solve_steady()

                    # read outputs back and publish
                    out_map = adapter.read_outputs(state.outputs_def)
                    for ok, ov in out_map.items():
                        state.set_output(ok, ov)

                    _set_status("idle", "Solve complete", 1.0)
                    await _safe_send(ws, {"type": "state", "payload": state.state_dict()})
                    await _safe_send(ws, {"type": "status", "payload": state.status_dict()})

                except Exception as e:
                    _set_status("error", f"Run failed: {e}", 0.0)
                    await _safe_send(ws, {"type": "status", "payload": state.status_dict()})

                continue

            # -----------------------------
            # GET STATE
            # -----------------------------
            if mtype == "get_state":
                await _safe_send(ws, {"type": "state", "payload": state.state_dict()})
                await _safe_send(ws, {"type": "schema", "payload": state.schema_dict()})
                continue

            # Unknown message type
            await _safe_send(ws, {"type": "status", "payload": {"state": "error", "message": f"Unknown message type: {mtype}", "progress": 0.0}})

    except WebSocketDisconnect:
        return
