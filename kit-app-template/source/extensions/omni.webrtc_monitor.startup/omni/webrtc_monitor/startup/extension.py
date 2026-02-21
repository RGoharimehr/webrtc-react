# omni/webrtc_monitor/startup/extension.py
#
# Omniverse Kit Extension — WebRTC Monitor Startup
# ─────────────────────────────────────────────────
# Launched as a Kit extension dependency.  On startup it locates the
# webrtc-react project root and runs `npm start`, which (via the
# `concurrently` script in package.json) starts both:
#   • React dev server   → http://localhost:3000
#   • Python bridge      → ws://127.0.0.1:8001/ws
#
# On Kit shutdown the child process group is terminated cleanly.
#
# Path discovery order:
#   1. carb setting  /exts/omni.webrtc_monitor.startup/webrtcRoot
#   2. Walk up from the extension's installed directory, checking each
#      ancestor directory and its immediate children named "webrtc-react",
#      "webrtc_react", or "webrtc" for a package.json whose "name" field
#      equals "webrtc-react".
#
# Typical directory layouts that are discovered automatically:
#
#   Layout A — webrtc-react is a subfolder of kit-cae (recommended):
#     kit-cae/
#     └── webrtc-react/      ← discovered via walk-up from build tree
#         └── package.json
#
#   Layout B — loading from source tree during development:
#     kit-cae/
#     └── webrtc-react/
#         └── kit-app-template/
#             └── source/
#                 └── extensions/
#                     └── omni.webrtc_monitor.startup/  ← 4 levels up = webrtc-react/
from __future__ import annotations

import json
import logging
import os
import shutil
import signal
import subprocess
import sys
import threading

import carb
import omni.ext
import omni.kit.app

log = logging.getLogger(__name__)

# Candidate subdirectory names to search for the webrtc-react root
_CANDIDATE_NAMES = ("webrtc-react", "webrtc_react", "webrtc")

# Maximum directory levels to walk upward when searching
_MAX_WALK_LEVELS = 8


class WebRTCMonitorStartupExtension(omni.ext.IExt):
    """
    Kit extension that auto-starts the webrtc-react frontend when the
    Kit application launches.
    """

    def on_startup(self, ext_id: str) -> None:
        log.info("WebRTCMonitorStartup: on_startup (ext_id=%s)", ext_id)
        self._process: subprocess.Popen | None = None
        self._log_thread: threading.Thread | None = None

        webrtc_root = self._resolve_webrtc_root(ext_id)
        if webrtc_root is None:
            log.warning(
                "WebRTCMonitorStartup: could not locate the webrtc-react project root — "
                "the React frontend will NOT be started automatically. "
                "Set /exts/omni.webrtc_monitor.startup/webrtcRoot in your .kit file to "
                "specify the path explicitly."
            )
            return

        log.info("WebRTCMonitorStartup: found webrtc-react root at %s", webrtc_root)
        self._launch(webrtc_root)

    def on_shutdown(self) -> None:
        log.info("WebRTCMonitorStartup: on_shutdown — stopping webrtc-react")
        self._stop()

    # ------------------------------------------------------------------
    # Path discovery
    # ------------------------------------------------------------------

    def _resolve_webrtc_root(self, ext_id: str) -> str | None:
        """Return the absolute path to the webrtc-react project root, or None."""

        # 1. Explicit carb setting (highest priority)
        settings = carb.settings.get_settings()
        configured: str | None = settings.get("/exts/omni.webrtc_monitor.startup/webrtcRoot")
        if configured:
            expanded = os.path.normpath(os.path.expandvars(configured))
            if self._is_webrtc_root(expanded):
                log.info("WebRTCMonitorStartup: using configured webrtcRoot=%s", expanded)
                return expanded
            log.warning(
                "WebRTCMonitorStartup: configured webrtcRoot=%r does not contain a valid "
                "webrtc-react package.json — falling back to auto-discovery",
                expanded,
            )

        # 2. Walk up from the extension's installed directory
        try:
            ext_manager = omni.kit.app.get_app().get_extension_manager()
            ext_path = ext_manager.get_extension_path(ext_id)
            if ext_path:
                found = self._discover_from_path(ext_path)
                if found:
                    return found
        except Exception as exc:
            log.debug("WebRTCMonitorStartup: auto-discovery failed: %s", exc)

        return None

    def _discover_from_path(self, start: str) -> str | None:
        """
        Walk upward from *start*, checking each directory and its named children
        until the webrtc-react root is found or we run out of levels.
        """
        path = os.path.abspath(start)
        for _ in range(_MAX_WALK_LEVELS):
            # The directory itself might BE the webrtc-react root (source-tree case:
            # 4 levels up from source/extensions/omni.webrtc_monitor.startup/ is
            # the webrtc-react/ directory)
            if self._is_webrtc_root(path):
                return path

            # Check named children (build-tree case: kit-cae root contains webrtc-react/)
            for name in _CANDIDATE_NAMES:
                candidate = os.path.join(path, name)
                if self._is_webrtc_root(candidate):
                    return candidate

            parent = os.path.dirname(path)
            if parent == path:
                break  # reached filesystem root
            path = parent

        return None

    @staticmethod
    def _is_webrtc_root(path: str) -> bool:
        """Return True if *path* is the webrtc-react project root."""
        pkg = os.path.join(path, "package.json")
        if not os.path.isfile(pkg):
            return False
        try:
            with open(pkg, encoding="utf-8") as fh:
                data = json.load(fh)
            return data.get("name") == "webrtc-react"
        except Exception:
            return False

    # ------------------------------------------------------------------
    # Process management
    # ------------------------------------------------------------------

    def _launch(self, webrtc_root: str) -> None:
        """Start `npm start` in the webrtc-react directory."""
        npm = shutil.which("npm")
        if npm is None:
            log.error(
                "WebRTCMonitorStartup: `npm` not found on PATH — "
                "cannot auto-start the webrtc-react frontend. "
                "Install Node.js and ensure npm is on PATH."
            )
            return

        log.info("WebRTCMonitorStartup: running '%s start' in %s", npm, webrtc_root)
        try:
            # Use a new process group so we can kill the whole tree (React + bridge)
            kwargs: dict = {
                "cwd": webrtc_root,
                "stdout": subprocess.PIPE,
                "stderr": subprocess.STDOUT,
                "text": True,
            }
            if sys.platform == "win32":
                kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
            else:
                kwargs["start_new_session"] = True

            self._process = subprocess.Popen([npm, "start"], **kwargs)
            log.info(
                "WebRTCMonitorStartup: webrtc-react started (PID %d). "
                "React  → http://localhost:3000 "
                "Bridge → ws://127.0.0.1:8001/ws",
                self._process.pid,
            )

            # Stream npm output to the Kit log in a background thread
            self._log_thread = threading.Thread(
                target=self._stream_output, daemon=True, name="webrtc-react-log"
            )
            self._log_thread.start()

        except Exception as exc:
            log.error("WebRTCMonitorStartup: failed to start webrtc-react: %s", exc)

    def _stream_output(self) -> None:
        """Read lines from the subprocess stdout and forward them to the Kit log."""
        if self._process is None or self._process.stdout is None:
            return
        try:
            for line in self._process.stdout:
                log.info("[webrtc-react] %s", line.rstrip())
        except Exception:
            pass

    def _stop(self) -> None:
        """Terminate the npm subprocess and wait for it to exit."""
        proc = self._process
        if proc is None:
            return
        self._process = None

        log.info("WebRTCMonitorStartup: terminating webrtc-react (PID %d)", proc.pid)
        try:
            if sys.platform == "win32":
                # Send CTRL_BREAK_EVENT to the process group
                proc.send_signal(signal.CTRL_BREAK_EVENT)
            else:
                # Kill the entire process group (catches React child processes too)
                os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
        except Exception as exc:
            log.debug("WebRTCMonitorStartup: graceful stop failed (%s) — force-killing", exc)
            try:
                proc.kill()
            except Exception:
                pass

        try:
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            log.warning("WebRTCMonitorStartup: process did not exit within 10 s — killing")
            try:
                proc.kill()
                proc.wait(timeout=5)
            except Exception:
                pass

        if self._log_thread is not None:
            self._log_thread.join(timeout=2)
            self._log_thread = None

        log.info("WebRTCMonitorStartup: webrtc-react stopped")
