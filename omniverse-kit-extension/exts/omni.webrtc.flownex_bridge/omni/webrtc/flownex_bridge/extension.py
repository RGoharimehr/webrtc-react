# omni/webrtc/flownex_bridge/extension.py
#
# Omniverse Kit extension — Flownex WebRTC Bridge
# ────────────────────────────────────────────────
# Bridges the web dashboard and the USD stage.
#
# Supported message protocol (JSON over the Omniverse streaming channel):
#
# Browser → Kit
# ─────────────
#   {
#     "type":      "get_prim_property",
#     "prim_path": "/World/MyPrim",   ← optional: empty/absent → Kit picks at (pick.x, pick.y)
#     "property":  "flownex:componentName",
#     "pick":      { "x": 0.42, "y": 0.61 }   ← normalised 0-1 coords (used when prim_path is empty)
#   }
#
# Kit → Browser
# ─────────────
#   {
#     "type":      "prim_property_result",
#     "prim_path": "/World/MyPrim",
#     "property":  "flownex:componentName",
#     "value":     "Pump_01"          ← null when prim / attribute not found
#   }
from __future__ import annotations

import json
import logging

import carb
import omni.ext
import omni.kit.app
import omni.usd

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Messaging API shim
# ---------------------------------------------------------------------------
# The actual API to send messages back to the browser differs between Kit
# versions.  We try the most common paths and fall back gracefully.

def _get_streaming_manager():
    """Return the streaming-manager singleton or None."""
    try:
        import omni.services.streaming.manager as sm
        return sm.get_instance()
    except Exception:
        pass
    try:
        from omni.kit.livestream.messaging import send_message_to_clients
        return None  # handled separately
    except Exception:
        pass
    return None


def _send_message_to_web(payload: dict) -> None:
    """Serialise *payload* and send it to all connected web clients."""
    raw = json.dumps(payload)

    # Try omni.services.streaming.manager (Kit 105+)
    try:
        import omni.services.streaming.manager as sm
        sm.get_instance().send_message(raw)
        return
    except Exception:
        pass

    # Try omni.kit.livestream.messaging (older Kit)
    try:
        from omni.kit.livestream.messaging import send_message_to_clients
        send_message_to_clients(raw)
        return
    except Exception:
        pass

    # Try direct AppStreamer message bus
    try:
        import omni.kit.app as kit_app
        msg_bus = kit_app.get_app().get_message_bus_event_stream()
        event = carb.events.type_from_string("omni.kit.app.messaging.OUT")
        msg_bus.push(event, payload={"data": raw})
        return
    except Exception:
        pass

    log.warning("FlownexBridge: no messaging API found — response not sent: %s", raw)


# ---------------------------------------------------------------------------
# USD helpers
# ---------------------------------------------------------------------------

def _read_attribute(prim_path: str, attr_name: str) -> object:
    """
    Return the value of *attr_name* on the prim at *prim_path*, or None.
    Handles string, int, float, bool, and Gf/Vt types by converting to
    plain Python objects that are JSON-serialisable.
    """
    ctx = omni.usd.get_context()
    stage = ctx.get_stage() if ctx else None
    if stage is None:
        log.warning("FlownexBridge: no USD stage open")
        return None

    prim = stage.GetPrimAtPath(prim_path)
    if not prim or not prim.IsValid():
        log.debug("FlownexBridge: prim not found: %s", prim_path)
        return None

    attr = prim.GetAttribute(attr_name)
    if not attr or not attr.IsValid():
        log.debug("FlownexBridge: attribute '%s' not found on %s", attr_name, prim_path)
        return None

    raw = attr.Get()
    if raw is None:
        return None

    # Convert common USD types to plain Python so json.dumps doesn't fail
    type_name = type(raw).__name__

    # Strings
    if isinstance(raw, str):
        return raw

    # Numeric primitives
    if isinstance(raw, (int, float, bool)):
        return raw

    # GfVec / GfMatrix — convert to list
    if hasattr(raw, "__iter__") and not isinstance(raw, (str, bytes)):
        try:
            return list(raw)
        except Exception:
            pass

    return str(raw)


def _pick_prim_at_ndc(norm_x: float, norm_y: float) -> str | None:
    """
    Perform a viewport pick at normalised device coordinates (0-1) and return
    the USD prim path string, or None when nothing is hit.

    This uses the omni.usd picking API when available.  On older Kit versions
    the async variant is preferred; here we fall back to a synchronous query.
    """
    try:
        from omni.usd.utils import get_world_transform_matrix  # noqa – side effect import OK
        import omni.kit.viewport.utility as vp_util
        viewport_api = vp_util.get_active_viewport()
        if viewport_api is None:
            return None

        # Convert normalised coords to pixel coords
        w, h = viewport_api.resolution
        px = int(norm_x * w)
        py = int(norm_y * h)

        # Kit 105 API
        result = viewport_api.pick(px, py)
        if result:
            prim_path = str(result.path) if hasattr(result, "path") else str(result)
            return prim_path if prim_path not in ("", "/") else None
    except Exception as exc:
        log.debug("FlownexBridge: viewport pick failed (%s) — falling back", exc)

    # Fallback: omni.usd picking (older Kit / no viewport utility)
    try:
        import omni.usd as ousd
        ctx = ousd.get_context()
        if ctx:
            selected = ctx.get_selection().get_selected_prim_paths()
            if selected:
                return selected[0]
    except Exception:
        pass

    return None


# ---------------------------------------------------------------------------
# Extension class
# ---------------------------------------------------------------------------

class FlownexBridgeExtension(omni.ext.IExt):
    """
    Registers a message handler on the Omniverse streaming channel and
    processes *get_prim_property* requests from the web dashboard.
    """

    def on_startup(self, ext_id: str) -> None:
        log.info("FlownexBridge: startup (ext_id=%s)", ext_id)
        self._subscription = None
        self._register_message_handler()

    def on_shutdown(self) -> None:
        log.info("FlownexBridge: shutdown")
        if self._subscription is not None:
            try:
                self._subscription.unsubscribe()
            except Exception:
                pass
            self._subscription = None

    # ------------------------------------------------------------------
    # Handler registration
    # ------------------------------------------------------------------

    def _register_message_handler(self) -> None:
        """
        Subscribe to incoming messages from the web client.

        Kit 105+ exposes omni.services.streaming.manager; older versions
        use omni.kit.livestream.messaging.  We try both.
        """

        # ── Kit 105+ ──────────────────────────────────────────────────
        try:
            import omni.services.streaming.manager as sm
            mgr = sm.get_instance()
            mgr.register_message_handler(self._on_web_message)
            self._subscription = _UnsubscribeProxy(mgr, self._on_web_message)
            log.info("FlownexBridge: registered via omni.services.streaming.manager")
            return
        except Exception as exc:
            log.debug("FlownexBridge: streaming.manager not available (%s)", exc)

        # ── Older Kit ────────────────────────────────────────────────
        try:
            from omni.kit.livestream.messaging import (
                register_message_handler,
                unregister_message_handler,
            )
            register_message_handler("get_prim_property", self._on_web_message)
            self._subscription = _CallbackUnsubscribe(
                unregister_message_handler,
                "get_prim_property",
                self._on_web_message,
            )
            log.info("FlownexBridge: registered via omni.kit.livestream.messaging")
            return
        except Exception as exc:
            log.debug("FlownexBridge: livestream.messaging not available (%s)", exc)

        log.warning(
            "FlownexBridge: no messaging API found — "
            "get_prim_property queries will not be processed"
        )

    # ------------------------------------------------------------------
    # Message handler
    # ------------------------------------------------------------------

    def _on_web_message(self, raw: str | dict) -> None:
        """
        Called by the Kit messaging layer whenever the web client sends a
        message over the streaming channel.

        *raw* may be a JSON string or an already-decoded dict depending on
        which API version is installed.
        """
        if isinstance(raw, (str, bytes)):
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                return
        elif isinstance(raw, dict):
            msg = raw
        else:
            return

        if msg.get("type") != "get_prim_property":
            return

        prim_path: str = msg.get("prim_path") or ""
        attr_name: str = msg.get("property") or ""
        pick_coords: dict = msg.get("pick") or {}

        # Validate required field
        if not attr_name:
            log.warning("FlownexBridge: 'property' field missing in get_prim_property message")
            return

        # Resolve prim_path via viewport pick when it was not supplied
        if not prim_path:
            norm_x = float(pick_coords.get("x", 0.5))
            norm_y = float(pick_coords.get("y", 0.5))
            prim_path = _pick_prim_at_ndc(norm_x, norm_y) or ""

        if not prim_path:
            log.debug("FlownexBridge: could not resolve prim path — sending null result")
            _send_message_to_web({
                "type":      "prim_property_result",
                "prim_path": "",
                "property":  attr_name,
                "value":     None,
            })
            return

        value = _read_attribute(prim_path, attr_name)

        log.debug(
            "FlownexBridge: %s.%s = %r",
            prim_path, attr_name, value,
        )

        _send_message_to_web({
            "type":      "prim_property_result",
            "prim_path": prim_path,
            "property":  attr_name,
            "value":     value,
        })


# ---------------------------------------------------------------------------
# Helpers for clean subscription teardown
# ---------------------------------------------------------------------------

class _UnsubscribeProxy:
    """Wraps a streaming-manager handler so on_shutdown can deregister it."""

    def __init__(self, mgr, handler):
        self._mgr = mgr
        self._handler = handler

    def unsubscribe(self):
        try:
            self._mgr.unregister_message_handler(self._handler)
        except Exception:
            pass


class _CallbackUnsubscribe:
    """Wraps a (unregister_fn, *args) call for clean teardown."""

    def __init__(self, fn, *args):
        self._fn = fn
        self._args = args

    def unsubscribe(self):
        try:
            self._fn(*self._args)
        except Exception:
            pass
