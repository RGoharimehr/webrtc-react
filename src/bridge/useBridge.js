// src/bridge/useBridge.js
//
// Lightweight frontend client for the Omniverse extension backend.
//
// Message protocol
// ─────────────────
// Requests  (frontend → backend):
//   { id, command: "flownex.<name>", payload: { … } }
//
// Responses (backend → frontend):
//   { id, command: "flownex.<name>", status: "ok"|"error", payload: { … } }
//
// Events pushed by the backend:
//   { event: "flownex.<event_name>", payload: { … } }
//
// Legacy protocol (old Python bridge) is still handled for backward compat.

import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL =
  process.env.REACT_APP_BACKEND_WS || "ws://127.0.0.1:8011/ws";
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
  const [config, setConfig] = useState(null);
  const [dynamicInputDefs, setDynamicInputDefs] = useState([]);
  const [staticInputDefs, setStaticInputDefs] = useState([]);
  const [outputDefs, setOutputDefs] = useState([]);
  const [inputValues, setInputValues] = useState({ dynamic: {}, static: {} });
  const [outputValues, setOutputValues] = useState({});
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
    // ── New protocol: command responses ─────────────────────────────────────
    if (m.command) {
      if (m.status !== "ok") {
        const err = m.error || m.message || `Command ${m.command} failed`;
        setErrors((prev) => [...prev.slice(-49), err]);
        return;
      }
      const payload = m.payload || {};
      switch (m.command) {
        case "flownex.get_status":
          setFlownexStatus(payload);
          break;
        case "flownex.get_config":
        case "flownex.set_config":
          setConfig(payload);
          break;
        case "flownex.load_inputs":
          setDynamicInputDefs(payload.inputs || []);
          if (payload.values) {
            setInputValues((prev) => ({ ...prev, dynamic: payload.values }));
          }
          break;
        case "flownex.load_static_inputs":
          setStaticInputDefs(payload.inputs || []);
          if (payload.values) {
            setInputValues((prev) => ({ ...prev, static: payload.values }));
          }
          break;
        case "flownex.load_outputs":
          setOutputDefs(payload.outputs || []);
          if (payload.values) {
            setOutputValues(payload.values);
          }
          break;
        case "flownex.get_results":
          if (payload.outputs) setOutputValues(payload.outputs);
          break;
        default:
          break;
      }
      return;
    }

    // ── New protocol: backend-pushed events ──────────────────────────────────
    if (m.event) {
      const payload = m.payload || {};
      switch (m.event) {
        case "flownex.status_changed":
          setFlownexStatus(payload);
          break;
        case "flownex.output_update":
          setOutputValues((prev) => ({ ...prev, [payload.key]: payload.value }));
          break;
        case "flownex.input_update":
          setInputValues((prev) => ({
            ...prev,
            dynamic: { ...prev.dynamic, [payload.key]: payload.value },
          }));
          break;
        case "flownex.config_changed":
          setConfig(payload);
          break;
        default:
          break;
      }
      return;
    }

    // ── Legacy protocol: backward compat with old Python bridge ──────────────
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
      // Populate shared config with project/backend info so tabs can read it
      setConfig((prev) => ({
        ...(prev || {}),
        ...(s.connected_project != null ? { project_file: s.connected_project } : {}),
        ...(s.io_directory     != null ? { io_directory: s.io_directory }        : {}),
        ...(s.backend          != null ? { backend: s.backend }                  : {}),
      }));
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

    if (m.type === "status") {
      setFlownexStatus(m.payload);
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

  // ── Omniverse extension backend commands ───────────────────────────────────
  const getStatus = () =>
    send({ id: crypto.randomUUID(), command: "flownex.get_status", payload: {} });

  const getConfig = () =>
    send({ id: crypto.randomUUID(), command: "flownex.get_config", payload: {} });

  const setConfigRemote = (cfg) =>
    send({ id: crypto.randomUUID(), command: "flownex.set_config", payload: cfg || {} });

  const loadInputs = () =>
    send({ id: crypto.randomUUID(), command: "flownex.load_inputs", payload: {} });

  const loadStaticInputs = () =>
    send({ id: crypto.randomUUID(), command: "flownex.load_static_inputs", payload: {} });

  const loadOutputs = () =>
    send({ id: crypto.randomUUID(), command: "flownex.load_outputs", payload: {} });

  const setInputValue = (key, value, scope = "dynamic") =>
    send({
      id: crypto.randomUUID(),
      command: "flownex.set_input_value",
      payload: { key, value, scope },
    });

  const runSteady = () =>
    send({ id: crypto.randomUUID(), command: "flownex.run_steady", payload: {} });

  const loadDefaultsAndRunSteady = () =>
    send({
      id: crypto.randomUUID(),
      command: "flownex.load_defaults_and_run_steady",
      payload: {},
    });

  const startTransient = () =>
    send({ id: crypto.randomUUID(), command: "flownex.start_transient", payload: {} });

  const stopTransient = () =>
    send({ id: crypto.randomUUID(), command: "flownex.stop_transient", payload: {} });

  const getResults = () =>
    send({ id: crypto.randomUUID(), command: "flownex.get_results", payload: {} });

  // Custom message (for user-loaded scripts via window.__bridgeAPI)
  const sendCustom = (msgType, payload) =>
    send({
      id: crypto.randomUUID(),
      command: "custom",
      payload: { msgType, payload: payload || {} },
    });

  // ── Legacy-protocol commands (matching current server.py message types) ────
  // These use { type, payload } which the Python backend understands directly.

  const configure = (projectPath, ioDir, backend) =>
    send({
      id: crypto.randomUUID(),
      type: "configure",
      payload: {
        projectPath: projectPath || "",
        ioDir: ioDir || "",
        backend: backend || "flownex",
      },
    });

  const openFlownex = () =>
    send({ id: crypto.randomUUID(), type: "open_flownex", payload: {} });

  const openProject = () =>
    send({ id: crypto.randomUUID(), type: "open_project", payload: {} });

  const closeFlownex = () =>
    send({ id: crypto.randomUUID(), type: "close_flownex", payload: {} });

  const closeProject = () =>
    send({ id: crypto.randomUUID(), type: "close_project", payload: {} });

  // ── Backward-compat aliases (keeps existing tabs working unchanged) ─────────
  const setInput = (scope, key, value) => setInputValue(key, value, scope);

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
    config,
    dynamicInputDefs,
    staticInputDefs,
    outputDefs,
    inputValues,
    outputValues,
    errors,
    send,
    getStatus,
    getConfig,
    setConfigRemote,
    loadInputs,
    loadStaticInputs,
    loadOutputs,
    setInputValue,
    setInput,
    runSteady,
    loadDefaultsAndRunSteady,
    startTransient,
    stopTransient,
    getResults,
    sendCustom,
    configure,
    openFlownex,
    openProject,
    closeFlownex,
    closeProject,
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
    config,
    dynamicInputDefs,
    staticInputDefs,
    outputDefs,
    inputValues,
    outputValues,
    errors,

    // Backward-compat shapes (used by existing tab components)
    state,
    schema,

    // Commands — first slice
    getStatus,
    getConfig,
    setConfigRemote,
    loadInputs,
    loadStaticInputs,
    loadOutputs,

    // Commands — later slices (wired but not yet UI-exposed)
    setInputValue,
    runSteady,
    loadDefaultsAndRunSteady,
    startTransient,
    stopTransient,
    getResults,
    sendCustom,
    send,

    // Legacy-protocol commands (matching server.py message types)
    configure,
    openFlownex,
    openProject,
    closeFlownex,
    closeProject,

    // Backward-compat
    setInput,
  };
}
