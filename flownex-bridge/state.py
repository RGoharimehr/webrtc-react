# flownex-bridge/adapters/flownex_direct.py
from __future__ import annotations
from typing import Any, Dict

# If pythonnet isn't installed yet, we run in stub mode
try:
    import clr  # noqa
    PYTHONNET_OK = True
except Exception:
    PYTHONNET_OK = False


class FlownexDirectAdapter:
    """
    Replace internals with your real Flownex API wiring (from your Omniverse extension),
    but keep this interface stable for the web app.
    """

    def __init__(self):
        self._opened = False
        self._project_path = None

        # Put your real API object here when you wire it
        self._api = None

    def open_project(self, project_path: str) -> None:
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
        if not self._opened:
            return

        if PYTHONNET_OK and self._api is not None:
            # TODO: REAL IMPLEMENTATION
            # self._api.close_project()
            pass

        self._opened = False

    def close_flownex(self) -> None:
        # In real mode, quit the Flownex application.
        if PYTHONNET_OK and self._api is not None:
            # TODO: REAL IMPLEMENTATION
            # self._api.quit()
            pass

        self._api = None
        self._opened = False
        self._project_path = None

    def set_property(self, component_identifier: str, property_identifier: str, value: Any) -> None:
        if not self._opened:
            # you can choose to silently ignore, but better to raise
            raise RuntimeError("Project not opened yet")

        if not PYTHONNET_OK:
            # STUB: accept
            return

        # TODO: REAL IMPLEMENTATION
        # self._api.set_value(component_identifier, property_identifier, value)
        return

    def solve_steady(self) -> None:
        if not self._opened:
            raise RuntimeError("Project not opened yet")

        if not PYTHONNET_OK:
            # STUB: do nothing
            return

        # TODO: REAL IMPLEMENTATION
        # self._api.solve()
        return

    def read_outputs(self, outputs_def: Dict[str, Any]) -> Dict[str, Any]:
        """
        outputs_def is state.outputs_def: key -> OutputDef
        return: dict(key -> value)
        """
        if not self._opened:
            raise RuntimeError("Project not opened yet")

        if not PYTHONNET_OK:
            # STUB: return dummy values so graphs/plots can work
            out = {}
            for k in outputs_def.keys():
                out[k] = 0.0
            return out

        # TODO: REAL IMPLEMENTATION
        # out = {}
        # for k, odef in outputs_def.items():
        #     out[k] = self._api.get_value(odef.componentIdentifier, odef.propertyIdentifier)
        # return out
        return {k: 0.0 for k in outputs_def.keys()}
