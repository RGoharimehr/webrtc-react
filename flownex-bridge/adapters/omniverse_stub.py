# flownex-bridge/adapters/omniverse_stub.py
from __future__ import annotations

from typing import Any, Dict

from .base import BaseAdapter


class OmniverseStubAdapter(BaseAdapter):
    """
    Stub adapter for NVIDIA Omniverse (Isaac Sim, USD Composer, …).
    Real integration requires the Omniverse Kit Python API.
    In stub mode every operation succeeds silently.
    """

    def __init__(self):
        self._opened = False
        self._project_path = None

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    def open_project(self, project_path: str) -> None:
        if not project_path:
            raise ValueError("project_path is empty")
        self._project_path = project_path
        self._opened = True
        # TODO: connect to a running Omniverse Kit instance and open the USD stage

    def close_project(self) -> None:
        if not self._opened:
            return
        # TODO: close the USD stage
        self._opened = False

    def close_app(self) -> None:
        # TODO: shut down the Omniverse Kit instance
        self._opened = False
        self._project_path = None

    # ------------------------------------------------------------------
    # Runtime
    # ------------------------------------------------------------------

    def set_property(
        self,
        component_identifier: str,
        property_identifier: str,
        value: Any,
    ) -> None:
        if not self._opened:
            return  # stub: silently ignore when not connected
        # TODO: set a USD prim attribute via Omniverse Kit extension API

    def solve_steady(self) -> None:
        if not self._opened:
            return  # stub
        # TODO: trigger a physics / rendering step in Omniverse

    def read_outputs(self, outputs_def: Dict[str, Any]) -> Dict[str, Any]:
        # stub: return zeros
        return {k: 0.0 for k in outputs_def.keys()}

    # ------------------------------------------------------------------
    # Custom messages
    # ------------------------------------------------------------------

    def send_custom(self, msg_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle Omniverse-specific custom commands (e.g. camera commands, USD edits).
        Extend this method once real Omniverse integration is in place.
        """
        return {"ok": True, "backend": "omniverse", "echo": {"type": msg_type, "payload": payload}}
