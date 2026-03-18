# flownex-bridge/webrtc_server.py
"""Python WebRTC server built on aiortc.

This module replaces the Node.js ``@nvidia/omniverse-webrtc-streaming-library``
runtime with a pure-Python implementation using aiortc, eliminating the
marshalling overhead that arises when sharing data between a Node.js WebRTC
runtime and the Omniverse/simulation backend (which runs in Python/C++).

Signalling flow
───────────────
1. Browser creates an RTCPeerConnection and a data-channel labelled "bridge".
2. Browser sends ``POST /webrtc/offer`` with body ``{"sdp": …, "type": "offer"}``.
3. ``handle_offer()`` creates a matching aiortc RTCPeerConnection, attaches a
   stub video track and a data-channel listener, then returns the SDP answer.
4. Both sides complete ICE negotiation and begin exchanging frames/messages.

Video track
───────────
``_OmniverseVideoTrack`` is a placeholder that streams a simple animated test
pattern.  Replace it with an aiortc ``MediaPlayer`` pointing at a real
Omniverse RTSP/RTP endpoint once that integration is in place.  Because the
relay runs inside the same Python process as the simulation backend, no
cross-runtime marshalling is needed.
"""
from __future__ import annotations

import asyncio
import logging
import re
import uuid
from typing import Any, Callable, Dict, Optional, Set

import av
import numpy as np
from aiortc import (
    MediaStreamTrack,
    RTCPeerConnection,
    RTCSessionDescription,
)

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────
# Constants
# ─────────────────────────────────────────────────────

# Maximum seconds to wait for ICE gathering to complete before sending the
# (possibly partial) SDP answer back to the browser.
ICE_GATHERING_TIMEOUT_SECONDS = 5.0

# Regex that matches an SDP video media-line at the start of a line
# (e.g. "m=video 9 UDP/TLS/RTP/SAVPF …").  Simple substring matching on
# "m=video" would falsely trigger if the text appeared inside an attribute value.
_SDP_VIDEO_RE = re.compile(r"^m=video\s", re.MULTILINE)

# ─────────────────────────────────────────────────────
# Module-level state
# ─────────────────────────────────────────────────────

# Active peer connections keyed by a random UUID generated per connection.
_pcs: Dict[str, RTCPeerConnection] = {}

# Broadcast callbacks registered when a data channel opens.
# server.py may call broadcast() to push messages to all connected browsers.
_broadcast_callbacks: Set[Callable[[str], None]] = set()


# ─────────────────────────────────────────────────────
# Stub video track (replace with a real Omniverse relay)
# ─────────────────────────────────────────────────────

class _OmniverseVideoTrack(MediaStreamTrack):
    """Placeholder video track that renders an animated colour-cycling pattern.

    Swap this out for an ``aiortc.contrib.media.MediaPlayer`` consuming an
    RTSP/RTP feed from Omniverse Kit when real streaming is required.
    """

    kind = "video"

    _WIDTH = 1280
    _HEIGHT = 720

    def __init__(self) -> None:
        super().__init__()
        self._frame_index: int = 0

    async def recv(self) -> av.VideoFrame:  # type: ignore[override]
        # The base class declares `recv()` returning `Frame`, but aiortc's
        # concrete video tracks return `av.VideoFrame` specifically.  The
        # ignore suppresses the type-checker complaint about the narrower
        # return type while keeping the signature readable for callers.
        pts, time_base = await self.next_timestamp()
        self._frame_index += 1

        shift = self._frame_index % 256
        img = np.zeros((self._HEIGHT, self._WIDTH, 3), dtype=np.uint8)
        img[:, :, 0] = shift               # blue channel  (BGR)
        img[:, :, 1] = 255 - shift         # green channel
        img[:, :, 2] = (shift * 2) % 256  # red channel

        frame = av.VideoFrame.from_ndarray(img, format="bgr24")
        frame.pts = pts
        frame.time_base = time_base
        return frame


# ─────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────

async def handle_offer(
    sdp: str,
    offer_type: str,
    on_message: Optional[Callable[[str, str], None]] = None,
) -> Dict[str, str]:
    """Process a WebRTC offer from the browser and return an SDP answer.

    Parameters
    ----------
    sdp:
        SDP string produced by the browser's ``RTCPeerConnection.createOffer()``.
    offer_type:
        Must be ``"offer"``.
    on_message:
        Optional callback ``(pc_id, message)`` invoked when the browser sends
        a message through the data channel.  Can be used to hook into the
        bridge state from ``server.py``.

    Returns
    -------
    ``{"sdp": <answer SDP>, "type": "answer"}``
    """
    pc_id = str(uuid.uuid4())
    pc = RTCPeerConnection()
    _pcs[pc_id] = pc

    # ── Lifecycle handlers ────────────────────────────────────────────────────

    @pc.on("iceconnectionstatechange")
    async def _on_ice_state() -> None:
        logger.info("[%s] ICE state → %s", pc_id, pc.iceConnectionState)
        if pc.iceConnectionState in ("failed", "closed"):
            await pc.close()
            _pcs.pop(pc_id, None)

    @pc.on("connectionstatechange")
    async def _on_conn_state() -> None:
        logger.info("[%s] connection state → %s", pc_id, pc.connectionState)
        if pc.connectionState in ("failed", "closed"):
            _pcs.pop(pc_id, None)

    # ── Data channel (created by the browser) ────────────────────────────────

    @pc.on("datachannel")
    def _on_datachannel(channel: Any) -> None:
        logger.info("[%s] data channel '%s' opened", pc_id, channel.label)

        # Capture a reference so the broadcast closure can reach it.
        def _send(msg: str) -> None:
            if channel.readyState == "open":
                channel.send(msg)

        _broadcast_callbacks.add(_send)

        @channel.on("close")
        def _on_close() -> None:
            _broadcast_callbacks.discard(_send)

        @channel.on("message")
        def _on_msg(message: str) -> None:
            logger.debug("[%s] ← %s", pc_id, message)
            if on_message is not None:
                on_message(pc_id, message)

    # ── Media track ──────────────────────────────────────────────────────────
    # Only add the video track when the offer actually contains a video m-section.
    # If the browser adds a recvonly video transceiver the offer will include
    # "m=video …", and aiortc can respond with a sendonly track in the answer.

    if _SDP_VIDEO_RE.search(sdp):
        pc.addTrack(_OmniverseVideoTrack())

    # ── Signalling ───────────────────────────────────────────────────────────

    await pc.setRemoteDescription(RTCSessionDescription(sdp=sdp, type=offer_type))
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    # Wait for ICE gathering to complete so the SDP contains all candidates.
    loop = asyncio.get_running_loop()
    deadline = loop.time() + ICE_GATHERING_TIMEOUT_SECONDS
    while pc.iceGatheringState != "complete":
        if loop.time() >= deadline:
            logger.warning("[%s] ICE gathering timeout – returning partial SDP", pc_id)
            break
        await asyncio.sleep(0.05)

    return {
        "sdp": pc.localDescription.sdp,
        "type": pc.localDescription.type,
    }


def broadcast(message: str) -> None:
    """Send *message* to all connected browser data channels."""
    for cb in list(_broadcast_callbacks):
        try:
            cb(message)
        except Exception:
            logger.exception("broadcast error")


async def close_all() -> None:
    """Close every active peer connection.  Call on server shutdown."""
    coros = [pc.close() for pc in list(_pcs.values())]
    await asyncio.gather(*coros, return_exceptions=True)
    _pcs.clear()
    _broadcast_callbacks.clear()
