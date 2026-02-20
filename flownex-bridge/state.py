# flownex-bridge/state.py
from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any, Dict, Optional, Tuple
import csv
import os
import re
import time


# ======================
# helpers
# ======================

def _to_float(x, default=None):
    try:
        return float(x)
    except (ValueError, TypeError):
        return default


def _to_int(x, default=None):
    try:
        return int(float(x))
    except (ValueError, TypeError):
        return default


def sanitize_key(key: str) -> str:
    """
    Normalize keys so JS + Python dictionaries are safe.
    Example:
      "Fan Speed" -> "Fan_Speed"
    """
    key = (key or "").strip()
    key = re.sub(r"\s+", "_", key)
    return key


# ======================
# schema definitions
# ======================

@dataclass
class InputDef:
    key: str
    rawKey: str
    description: str
    componentIdentifier: str
    propertyIdentifier: str
    editType: str
    min: Optional[float]
    max: Optional[float]
    step: Optional[float]
    unit: str
    defaultValue: Optional[float]


@dataclass
class OutputDef:
    key: str
    rawKey: str
    description: str
    componentIdentifier: str
    propertyIdentifier: str
    category: str
    unit: str


# ======================
# main bridge state
# ======================

class BridgeState:
    def __init__(self):
        # Project
        self.connected_project: Optional[str] = None

        # Active simulation backend
        self.backend: str = "flownex"

        # Schema
        self.inputs_def: Dict[str, InputDef] = {}
        self.outputs_def: Dict[str, OutputDef] = {}

        # Runtime values
        self.inputs: Dict[str, Dict[str, Any]] = {
            "dynamic": {},
            "static": {},
        }
        self.outputs: Dict[str, Any] = {}

        # Status
        self.status: Dict[str, Any] = {
            "state": "idle",
            "message": "ready",
            "progress": 0.0,
        }

        self._boot_ts = time.time()

    # ======================
    # schema loading
    # ======================

    def load_schema_from_csv(self, inputs_csv: str, outputs_csv: str) -> None:
        if not os.path.isfile(inputs_csv):
            raise FileNotFoundError(inputs_csv)

        if not os.path.isfile(outputs_csv):
            raise FileNotFoundError(outputs_csv)

        self.inputs_def = self._load_inputs(inputs_csv)
        self.outputs_def = self._load_outputs(outputs_csv)

        # preload defaults into dynamic inputs
        self.inputs["dynamic"].clear()
        for k, idef in self.inputs_def.items():
            if idef.defaultValue is not None:
                self.inputs["dynamic"][k] = idef.defaultValue

    def schema_dict(self) -> Dict[str, Any]:
        return {
            "inputs": [asdict(v) for v in self.inputs_def.values()],
            "outputs": [asdict(v) for v in self.outputs_def.values()],
        }

    # ======================
    # state serialization
    # ======================

    def status_dict(self) -> Dict[str, Any]:
        return dict(self.status)

    def state_dict(self) -> Dict[str, Any]:
        return {
            "connected_project": self.connected_project,
            "backend": self.backend,
            "inputs": self.inputs,
            "outputs": self.outputs,
            "status": self.status_dict(),
            "uptime_s": round(time.time() - self._boot_ts, 2),
        }

    # ======================
    # runtime updates
    # ======================

    def set_input(self, scope: str, key: str, value: Any) -> Tuple[str, str, Any]:
        if scope not in ("dynamic", "static"):
            raise ValueError(f"Invalid scope: {scope}. Must be 'dynamic' or 'static'")
        
        k = sanitize_key(key)

        if k not in self.inputs_def:
            raise KeyError(f"Unknown input key: '{key}' (sanitized: '{k}')")

        self.inputs[scope][k] = value
        return scope, k, value

    def set_output(self, key: str, value: Any) -> Tuple[str, Any]:
        k = sanitize_key(key)
        self.outputs[k] = value
        return k, value

    # ======================
    # CSV loaders
    # ======================

    def _load_inputs(self, path: str) -> Dict[str, InputDef]:
        out: Dict[str, InputDef] = {}

        with open(path, "r", encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)

            for row in reader:
                raw_key = (row.get("Key") or "").strip()
                key = sanitize_key(raw_key)

                out[key] = InputDef(
                    key=key,
                    rawKey=raw_key,
                    description=(row.get("Description") or "").strip(),
                    componentIdentifier=(row.get("ComponentIdentifier") or "").strip(),
                    propertyIdentifier=(row.get("PropertyIdentifier") or "").strip(),
                    editType=(row.get("EditType") or "").strip().lower(),
                    min=_to_float(row.get("Min")),
                    max=_to_float(row.get("Max")),
                    step=_to_float(row.get("Step")),
                    unit=(row.get("Unit") or "").strip(),
                    defaultValue=_to_float(row.get("DefaultValue")),
                )

        return out

    def _load_outputs(self, path: str) -> Dict[str, OutputDef]:
        out: Dict[str, OutputDef] = {}

        with open(path, "r", encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)

            for row in reader:
                raw_key = (row.get("Key") or "").strip()
                key = sanitize_key(raw_key)

                out[key] = OutputDef(
                    key=key,
                    rawKey=raw_key,
                    description=(row.get("Description") or "").strip(),
                    componentIdentifier=(row.get("ComponentIdentifier") or "").strip(),
                    propertyIdentifier=(row.get("PropertyIdentifier") or "").strip(),
                    category=(row.get("Category") or "").strip(),
                    unit=(row.get("Unit") or "").strip(),
                )

        return out
