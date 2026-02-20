# flownex-bridge/adapters/flownex_direct.py
from __future__ import annotations
from typing import Any, Dict

from .base import BaseAdapter

# If pythonnet isn't installed yet, we run in stub mode
try:
    import clr  # noqa
    PYTHONNET_OK = True
except Exception:
    PYTHONNET_OK = False


class FlownexDirectAdapter(BaseAdapter):
    """
    Direct adapter to Flownex via pythonnet (.NET).
    This file is SAFE to import even when pythonnet/Flownex is not installed.
    In stub mode (when pythonnet is not available), it simulates the API.
    """

    def __init__(self):
        self._opened = False
        self._project_path = None
        # Put your real API object here when you wire it
        self._api = None

    def open_project(self, project_path: str) -> None:
        """Open a Flownex project"""
        if not project_path:
            raise ValueError("project_path is empty")

        self._project_path = project_path

        if not PYTHONNET_OK:
            # STUB: behave as if it opened
            self._opened = True
            return

        # TODO: REAL IMPLEMENTATION
        # Example: create Flownex application instance, open project, etc.
        # self._api = YourFlownexApi(...)
        # self._api.open_project(project_path)
        self._opened = True

    def close_project(self) -> None:
        """Close the current project"""
        if not self._opened:
            return

        if PYTHONNET_OK and self._api is not None:
            # TODO: REAL IMPLEMENTATION
            # self._api.close_project()
            pass

        self._opened = False

    def close_flownex(self) -> None:
        """Close the Flownex application"""
        self.close_app()

    def close_app(self) -> None:
        """Close the Flownex application (BaseAdapter interface)."""
        # In real mode, quit the Flownex application.
        if PYTHONNET_OK and self._api is not None:
            # TODO: REAL IMPLEMENTATION
            # self._api.quit()
            pass

        self._api = None
        self._opened = False
        self._project_path = None

    def send_custom(self, msg_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Handle Flownex-specific custom commands."""
        return {"ok": True, "backend": "flownex", "echo": {"type": msg_type, "payload": payload}}

    def set_property(self, component_identifier: str, property_identifier: str, value: Any) -> None:
        """Set a property value in Flownex"""
        # In stub mode, always accept without error
        if not PYTHONNET_OK:
            return

        # In real mode, require project to be opened
        if not self._opened:
            raise RuntimeError("Project not opened yet")

        # TODO: REAL IMPLEMENTATION
        # self._api.set_value(component_identifier, property_identifier, value)
        return

    def solve_steady(self) -> None:
        """Run a steady-state solve"""
        # In stub mode, always succeed
        if not PYTHONNET_OK:
            return

        # In real mode, require project to be opened
        if not self._opened:
            raise RuntimeError("Project not opened yet")

        # TODO: REAL IMPLEMENTATION
        # self._api.solve()
        return

    def read_outputs(self, outputs_def: Dict[str, Any]) -> Dict[str, Any]:
        """
        Read output values from Flownex.
        outputs_def is a dict of key -> OutputDef objects
        Returns: dict of key -> value
        """
        # In stub mode, return dummy values
        if not PYTHONNET_OK:
            return {k: 0.0 for k in outputs_def.keys()}

        # In real mode, require project to be opened
        if not self._opened:
            raise RuntimeError("Project not opened yet")

        # TODO: REAL IMPLEMENTATION
        # out = {}
        # for k, odef in outputs_def.items():
        #     out[k] = self._api.get_value(odef.componentIdentifier, odef.propertyIdentifier)
        # return out
        return {k: 0.0 for k in outputs_def.keys()}
