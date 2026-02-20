# flownex-bridge/adapters/ansys_stub.py
from __future__ import annotations

from typing import Any, Dict

from .base import BaseAdapter


class AnsysStubAdapter(BaseAdapter):
    """
    Stub adapter for Ansys (Mechanical / Fluent / CFX / Twin Builder …).
    Real integration requires Ansys Python libraries (ansys-pythonnet, PyFluent, …).
    In stub mode every operation succeeds silently.
    """

    def __init__(self):
        self._opened = False
        self._project_path = None
        self._api = None

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    def open_project(self, project_path: str) -> None:
        if not project_path:
            raise ValueError("project_path is empty")
        self._project_path = project_path
        self._opened = True
        # TODO: launch Ansys and open the .wbpj / .cas / .agdb file

    def close_project(self) -> None:
        if not self._opened:
            return
        # TODO: close the Ansys project
        self._opened = False

    def close_app(self) -> None:
        # TODO: quit the Ansys application
        self._api = None
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
        # TODO: set named parameter / boundary condition in Ansys

    def solve_steady(self) -> None:
        if not self._opened:
            return  # stub
        # TODO: submit steady-state solve to Ansys

    def read_outputs(self, outputs_def: Dict[str, Any]) -> Dict[str, Any]:
        # stub: return zeros
        return {k: 0.0 for k in outputs_def.keys()}

    # ------------------------------------------------------------------
    # Custom messages
    # ------------------------------------------------------------------

    def send_custom(self, msg_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle Ansys-specific custom commands (e.g. mesh, post-process).
        Extend this method once real Ansys integration is in place.
        """
        return {"ok": True, "backend": "ansys", "echo": {"type": msg_type, "payload": payload}}
