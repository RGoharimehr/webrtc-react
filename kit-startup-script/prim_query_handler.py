# prim_query_handler.py
# ──────────────────────────────────────────────────────────────────────────
# Paste this entire file into Omniverse Kit's Script Editor and press Run.
#
#   Window → Script Editor  (in USD Composer / Code / any Kit-based app)
#
# That's it.  No extension installation, no file copying, no Extension
# Manager.  The handler stays registered for the entire Kit session.
#
# What it does
# ────────────
# The web dashboard sends a JSON message asking for a USD attribute on a
# given prim (or at a clicked screen position).  This script listens for
# that message inside Kit, reads the USD stage, and sends the value back
# to the browser over the same WebRTC channel.
#
# Why this script must run inside Kit (and not in the browser)
# ────────────────────────────────────────────────────────────
#  • The browser is JavaScript — it has no USD library and no access to
#    the Omniverse process.
#  • The WebRTC streaming library is a relay: it can pass JSON messages
#    between browser and Kit, but it does not know what USD is.
#  • USD attributes live in Kit's in-memory stage (C++/Python, server side).
#    The only way to read them is to call stage.GetPrimAtPath() from Python
#    code running *inside* Kit.
#  • This script IS that Python code.  Paste it once, run it once — the
#    handler is registered and will answer every query for the session.
#
# Protocol recap
# ──────────────
# Browser → Kit (you send this from the web app):
#   { "event_type": "get_prim_property",
#     "type":       "get_prim_property",
#     "prim_path":  "",
#     "property":   "flownex:componentName",
#     "pick":       { "x": 0.42, "y": 0.61 } }
#
# Kit → Browser (you receive this in onCustomEvent):
#   { "event_type": "prim_property_result",
#     "type":       "prim_property_result",
#     "prim_path":  "/World/DataCenter/Rack/Pump_01",
#     "property":   "flownex:componentName",
#     "value":      "Pump_01" }
# ──────────────────────────────────────────────────────────────────────────

import json
import logging

log = logging.getLogger("flownex_prim_handler")

# ── Helpers ────────────────────────────────────────────────────────────────

def _read_attribute(prim_path, attr_name):
    """Read attr_name from prim_path in the current stage.  Returns None on failure."""
    import omni.usd
    ctx   = omni.usd.get_context()
    stage = ctx.get_stage() if ctx else None
    if stage is None:
        log.warning("prim_handler: no USD stage is open")
        return None

    prim = stage.GetPrimAtPath(prim_path)
    if not prim or not prim.IsValid():
        log.info("prim_handler: prim not found: %s", prim_path)
        return None

    attr = prim.GetAttribute(attr_name)
    if not attr or not attr.IsValid():
        log.info("prim_handler: attribute '%s' not found on %s", attr_name, prim_path)
        return None

    raw = attr.Get()
    if raw is None:
        return None
    if isinstance(raw, (str, int, float, bool)):
        return raw
    if hasattr(raw, "__iter__") and not isinstance(raw, (str, bytes)):
        try:
            return list(raw)
        except Exception:
            pass
    return str(raw)


def _pick_prim_at_ndc(norm_x, norm_y):
    """Hit-test the viewport at normalised coords (0-1). Returns prim path or None."""
    try:
        import omni.kit.viewport.utility as vp_util
        vp = vp_util.get_active_viewport()
        if vp is None:
            return None
        w, h   = vp.resolution
        result = vp.pick(int(norm_x * w), int(norm_y * h))
        if result:
            path = str(result.path) if hasattr(result, "path") else str(result)
            return path if path not in ("", "/") else None
    except Exception as exc:
        log.info("prim_handler: viewport pick failed (%s) — trying selection fallback", exc)

    # Fallback: use whatever is currently selected in the stage
    try:
        import omni.usd
        sel = omni.usd.get_context().get_selection().get_selected_prim_paths()
        if sel:
            return sel[0]
    except Exception:
        pass
    return None


def _send_to_web(payload):
    """Send payload dict back to the browser over the WebRTC channel."""
    raw = json.dumps(payload)
    # Kit 105+
    try:
        import omni.services.streaming.manager as sm
        sm.get_instance().send_message(raw)
        return
    except Exception:
        pass
    # Older Kit
    try:
        from omni.kit.livestream.messaging import send_message_to_clients
        send_message_to_clients(raw)
        return
    except Exception:
        pass
    log.warning("prim_handler: could not send response — no send API found")


# ── Message handler ────────────────────────────────────────────────────────

def _on_message(raw):
    """Called by Kit for every custom message arriving from the browser."""
    # Decode if needed
    if isinstance(raw, (str, bytes)):
        try:
            msg = json.loads(raw)
        except Exception:
            return
    elif isinstance(raw, dict):
        msg = raw
    else:
        return

    # Only handle our message type
    msg_type = msg.get("event_type") or msg.get("type")
    if msg_type != "get_prim_property":
        return

    prim_path  = msg.get("prim_path") or ""
    attr_name  = msg.get("property")  or ""
    pick       = msg.get("pick")      or {}

    log.info("prim_handler: get_prim_property  prim_path=%r  property=%r  pick=%r",
             prim_path, attr_name, pick)

    if not attr_name:
        log.warning("prim_handler: 'property' field missing — ignoring")
        return

    # If no prim_path, pick from the viewport at the given screen coordinates
    if not prim_path:
        prim_path = _pick_prim_at_ndc(
            float(pick.get("x", 0.5)),
            float(pick.get("y", 0.5))
        ) or ""
        log.info("prim_handler: viewport pick → %r", prim_path)

    value = _read_attribute(prim_path, attr_name) if prim_path else None
    log.info("prim_handler: value = %r", value)

    _send_to_web({
        "event_type": "prim_property_result",
        "type":       "prim_property_result",
        "prim_path":  prim_path,
        "property":   attr_name,
        "value":      value,
    })


# ── Registration ───────────────────────────────────────────────────────────
# Try Kit 105+ streaming manager first, then fall back to older messaging API.

_registered = False

try:
    import omni.services.streaming.manager as sm
    sm.get_instance().register_message_handler(_on_message)
    log.info("prim_handler: registered via omni.services.streaming.manager ✓")
    _registered = True
except Exception as _e1:
    log.debug("prim_handler: streaming.manager not available (%s)", _e1)

if not _registered:
    try:
        from omni.kit.livestream.messaging import register_message_handler
        register_message_handler("get_prim_property", _on_message)
        log.info("prim_handler: registered via omni.kit.livestream.messaging ✓")
        _registered = True
    except Exception as _e2:
        log.debug("prim_handler: livestream.messaging not available (%s)", _e2)

if _registered:
    print("✅  prim_query_handler registered — hold I + click on the stream to query USD attributes")
else:
    print("❌  prim_query_handler: no messaging API found — check your Kit version")
    print("    Tried: omni.services.streaming.manager, omni.kit.livestream.messaging")
