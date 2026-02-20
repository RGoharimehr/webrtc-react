# flownex-bridge/adapters/base.py
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Dict


class BaseAdapter(ABC):
    """
    Abstract base class for all simulation backend adapters.
    Concrete implementations target Flownex, Ansys, Omniverse, etc.
    """

    @abstractmethod
    def open_project(self, project_path: str) -> None:
        """Open a simulation project at the given path."""

    @abstractmethod
    def close_project(self) -> None:
        """Close the currently open project."""

    @abstractmethod
    def close_app(self) -> None:
        """Close / quit the simulation application."""

    @abstractmethod
    def set_property(
        self,
        component_identifier: str,
        property_identifier: str,
        value: Any,
    ) -> None:
        """Set a property value on a component."""

    @abstractmethod
    def solve_steady(self) -> None:
        """Run a steady-state (or equivalent) solve."""

    @abstractmethod
    def read_outputs(self, outputs_def: Dict[str, Any]) -> Dict[str, Any]:
        """
        Read output values.
        Returns a dict of { key: value } for every entry in *outputs_def*.
        """

    def send_custom(self, msg_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle an arbitrary custom message from the front-end.
        Override in concrete adapters to support backend-specific commands.
        Returns a response dict (at minimum ``{"ok": True}``).
        """
        return {"ok": True, "echo": {"type": msg_type, "payload": payload}}
