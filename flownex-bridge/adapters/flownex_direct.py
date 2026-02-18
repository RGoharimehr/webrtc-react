# flownex-bridge/adapters/flownex_direct.py
from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Dict, Optional


class FlownexNotAvailable(RuntimeError):
    pass


@dataclass
class FlownexDirectAdapter:
    """
    Direct adapter to Flownex via pythonnet (.NET).
    This file is SAFE to import even when pythonnet/Flownex is not installed.
    Actual .NET imports happen only inside connect().
    """
    connected: bool = False
    last_error: Optional[str] = None

    # you can store .NET handles here later
    _fnx: Any = None

    def connect(self, *args, **kwargs) -> None:
        """
        Attempt to load pythonnet (clr) and connect to Flownex.
        Raises FlownexNotAvailable if pythonnet isn't available.
        """
        try:
            import clr  # noqa: F401  (pythonnet)
        except Exception as e:
            self.connected = False
            self.last_error = f"pythonnet (clr) not available: {e}"
            raise FlownexNotAvailable(self.last_error)

        # TODO: later: load Flownex assemblies, open project, bind I/O
        self.connected = True
        self.last_error = None

    def set_input(self, scope: str, key: str, value: Any) -> None:
        if not self.connected:
            raise FlownexNotAvailable(self.last_error or "Flownex not connected")

        # TODO: write mapped value to Flownex input
        # self._fnx.SetValue(...)
        return

    def run_steady(self) -> Dict[str, Any]:
        if not self.connected:
            raise FlownexNotAvailable(self.last_error or "Flownex not connected")

        # TODO: run Flownex steady solve and return outputs
        return {"ok": True, "message": "Steady solve placeholder"}

    def disconnect(self) -> None:
        self.connected = False
        self._fnx = None
