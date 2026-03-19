// src/bridge/useBridge.js
//
// Lightweight frontend client for the Omniverse extension backend.
//
// Message protocol (bridge_ws_handlers.py)
// ─────────────────────────────────────────
// Outgoing (frontend → backend):
//   { type: "<command>", id: "<uuid>", payload: { … } }
//
// Incoming push messages (backend → frontend):
//   { type: "schema",        payload: { inputs: [...], outputs: [...] } }
//   { type: "state",         payload: { status, connected_project, io_directory, inputs, outputs, history, transientRunning } }
//   { type: "status",        payload: { state, message, progress } }
//   { type: "inputs_delta",  payload: { scope, key, value } }
//   { type: "outputs_delta", payload: { key, value } }

import { useEffect, useRef, useState, useCallback } from "react";

// Default: ws://127.0.0.1:8001  (Omniverse extension bridge WS port)
const WS_URL =
  process.env.REACT_APP_BACKEND_WS || "ws://127.0.0.1:8001";
const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30000;

export function useBridge() {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const isManualCloseRef = useRef(false);
  const messageQueueRef = useRef([]);

  // ── State ──────────────────────────────────────────────────────────────────
  const [connected, setConnected] = useState(false);

  // Omniverse extension backend data
  const [flownexStatus, setFlownexStatus] = useState(null);
  const [dynamicInputDefs, setDynamicInputDefs] = useState([]);
  const [staticInputDefs, setStaticInputDefs] = useState([]);
  const [outputDefs, setOutputDefs] = useState([]);
  const [inputValues, setInputValues] = useState({ dynamic: {}, static: {} });
  const [outputValues, setOutputValues] = useState({});
  const [history, setHistory] = useState([]);
  const [transientRunning, setTransientRunning] = useState(false);
  const [connectedProject, setConnectedProject] = useState("");
  const [ioDirectory, setIoDirectory] = useState("");
  const [errors, setErrors] = useState([]);

  // ── Low-level send ─────────────────────────────────────────────────────────
  const send = useCallback((msg) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    } else {
      messageQueueRef.current.push(msg);
    }
  }, []);

  // ── Message dispatcher ─────────────────────────────────────────────────────
  const handleMessage = useCallback((m) => {
    if (m.type === "schema") {
      const incoming = m.payload || { inputs: [], outputs: [] };
      const allInputs = incoming.inputs || [];
      const sta = allInputs.filter((i) => i.scope === "static");
      const dyn = allInputs.filter((i) => i.scope !== "static");
      setDynamicInputDefs(dyn.length ? dyn : allInputs);
      setStaticInputDefs(sta);
      setOutputDefs(incoming.outputs || []);
      return;
    }

    if (m.type === "state") {
      const s = m.payload || {};
      if (s.inputs?.dynamic)
        setInputValues((prev) => ({ ...prev, dynamic: s.inputs.dynamic }));
      if (s.inputs?.static)
        setInputValues((prev) => ({ ...prev, static: s.inputs.static }));
      if (s.outputs) setOutputValues(s.outputs);
      if (s.status) setFlownexStatus(s.status);
      if (Array.isArray(s.history)) setHistory(s.history);
      if (s.transientRunning !== undefined) setTransientRunning(Boolean(s.transientRunning));
      if (s.connected_project !== undefined) setConnectedProject(s.connected_project || "");
      if (s.io_directory !== undefined) setIoDirectory(s.io_directory || "");
      return;
    }

    if (m.type === "status") {
      setFlownexStatus(m.payload);
      if (m.payload?.state === "error") {
        const msg = m.payload?.message || "Backend error";
        setErrors((prev) => [...prev.slice(-49), msg]);
      }
      return;
    }

    if (m.type === "inputs_delta") {
      const { scope, key, value } = m.payload || {};
      if (scope && key !== undefined)
        setInputValues((prev) => ({
          ...prev,
          [scope]: { ...(prev[scope] || {}), [key]: value },
        }));
      return;
    }

    if (m.type === "outputs_delta") {
      const { key, value } = m.payload || {};
      if (key !== undefined) setOutputValues((prev) => ({ ...prev, [key]: value }));
      return;
    }
  }, []); // state setters are stable

  // ── WebSocket connection with exponential back-off ─────────────────────────
  useEffect(() => {
    isManualCloseRef.current = false;

    function connect() {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (wsRef.current !== ws) return;
        reconnectAttemptsRef.current = 0;
        setConnected(true);
        const queue = messageQueueRef.current.splice(0);
        for (const msg of queue) {
          try {
            ws.send(JSON.stringify(msg));
          } catch (err) {
            console.warn("Failed to send queued message", msg, err);
          }
        }
      };

      ws.onclose = () => {
        if (wsRef.current !== ws) return;
        setConnected(false);
        if (isManualCloseRef.current) return;
        const attempts = reconnectAttemptsRef.current;
        if (attempts >= MAX_RECONNECT_ATTEMPTS) {
          console.error("WebSocket: max reconnection attempts reached.");
          return;
        }
        const delay = Math.min(
          BASE_RECONNECT_DELAY_MS * Math.pow(2, attempts),
          MAX_RECONNECT_DELAY_MS
        );
        reconnectAttemptsRef.current = attempts + 1;
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };

      ws.onmessage = (ev) => {
        let m;
        try {
          m = JSON.parse(ev.data);
        } catch {
          return;
        }
        handleMessage(m);
      };
    }

    connect();

    return () => {
      isManualCloseRef.current = true;
      clearTimeout(reconnectTimeoutRef.current);
      const ws = wsRef.current;
      wsRef.current = null;
      if (ws) {
        ws.onopen = null;
        ws.onclose = null;
        ws.onmessage = null;
        try {
          ws.close();
        } catch {}
      }
    };
  }, [handleMessage]);

  // ── On (re)connect: request current state ─────────────────────────────────
  // The backend already pushes schema + state on connect (handle_bridge_connect),
  // so this is just a safety net for cases where the initial push is missed.
  useEffect(() => {
    if (!connected) return;
    send({ type: "get_state", id: crypto.randomUUID(), payload: {} });
  }, [connected, send]);

  // ── Commands (type-based protocol matching bridge_ws_handlers.py) ──────────

  const getState = () =>
    send({ type: "get_state", id: crypto.randomUUID(), payload: {} });

  const configure = (projectPath, ioDir, backend, opts = {}) =>
    send({
      type: "configure",
      id: crypto.randomUUID(),
      payload: {
        projectPath: projectPath || "",
        ioDir: ioDir || "",
        backend: backend || "flownex",
        ...opts,
      },
    });

  const openFlownex = () =>
    send({ type: "open_flownex", id: crypto.randomUUID(), payload: {} });

  const openProject = () =>
    send({ type: "open_project", id: crypto.randomUUID(), payload: {} });

  const closeProject = () =>
    send({ type: "close_project", id: crypto.randomUUID(), payload: {} });

  const closeApp = () =>
    send({ type: "close_app", id: crypto.randomUUID(), payload: {} });

  // Alias so existing tabs calling bridge.closeFlownex() still work
  const closeFlownex = closeApp;

  const setInput = (scope, key, value) =>
    send({
      type: "set_input",
      id: crypto.randomUUID(),
      payload: { scope, key, value },
    });

  const runSteady = () =>
    send({ type: "run", id: crypto.randomUUID(), payload: { mode: "steady" } });

  const loadDefaultsAndRunSteady = () =>
    send({ type: "load_defaults_and_run_steady", id: crypto.randomUUID(), payload: {} });

  const startTransient = () =>
    send({ type: "start_transient", id: crypto.randomUUID(), payload: {} });

  const stopTransient = () =>
    send({ type: "stop_transient", id: crypto.randomUUID(), payload: {} });

  // Backward-compat alias used by CFDAnalysis (setInputValue(key, value, scope))
  const setInputValue = (key, value, scope = "dynamic") =>
    setInput(scope, key, value);

  // Custom message (for user-loaded scripts via window.__bridgeAPI)
  const sendCustom = (msgType, payload) =>
    send({
      type: "custom",
      id: crypto.randomUUID(),
      payload: { msgType, payload: payload || {} },
    });

  // ── Backward-compat state / schema shapes for existing tab components ──────
  const state = {
    inputs: inputValues,
    outputs: outputValues,
    status: flownexStatus,
  };

  const schema = {
    inputs: [...dynamicInputDefs, ...staticInputDefs],
    outputs: outputDefs,
  };

  // ── Expose bridge API on window for user-loaded custom scripts ─────────────
  const bridgeAPIRef = useRef({});
  bridgeAPIRef.current = {
    connected,
    state,
    schema,
    flownexStatus,
    dynamicInputDefs,
    staticInputDefs,
    outputDefs,
    inputValues,
    outputValues,
    history,
    transientRunning,
    connectedProject,
    ioDirectory,
    errors,
    send,
    getState,
    configure,
    openFlownex,
    openProject,
    closeProject,
    closeApp,
    closeFlownex,
    setInput,
    setInputValue,
    runSteady,
    loadDefaultsAndRunSteady,
    startTransient,
    stopTransient,
    sendCustom,
  };
  if (!window.__bridgeAPI) {
    window.__bridgeAPI = bridgeAPIRef.current;
  } else {
    Object.assign(window.__bridgeAPI, bridgeAPIRef.current);
  }

  return {
    // Connection
    connected,

    // Omniverse extension backend state
    flownexStatus,
    dynamicInputDefs,
    staticInputDefs,
    outputDefs,
    inputValues,
    outputValues,
    history,
    transientRunning,
    connectedProject,
    ioDirectory,
    errors,

    // Backward-compat shapes (used by existing tab components)
    state,
    schema,

    // Commands
    send,
    getState,
    configure,
    openFlownex,
    openProject,
    closeProject,
    closeApp,
    closeFlownex,
    setInput,
    setInputValue,
    runSteady,
    loadDefaultsAndRunSteady,
    startTransient,
    stopTransient,
    sendCustom,
  };
}
