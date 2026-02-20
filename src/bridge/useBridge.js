// src/bridge/useBridge.js
import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = "ws://127.0.0.1:8001/ws";
const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30000;

export function useBridge() {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const isManualCloseRef = useRef(false);
  const messageQueueRef = useRef([]);

  const [connected, setConnected] = useState(false);
  const [state, setState] = useState(null);
  const [schema, setSchema] = useState({ inputs: [], outputs: [] });

  const send = useCallback((msg) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    } else {
      messageQueueRef.current.push(msg);
    }
  }, []);

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

        if (m.type === "schema") {
          setSchema(m.payload || { inputs: [], outputs: [] });
          return;
        }

        if (m.type === "state") {
          setState(m.payload);
          return;
        }

        if (m.type === "inputs_delta") {
          const { scope, key, value } = m.payload || {};
          setState((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              inputs: {
                ...(prev.inputs || {}),
                [scope]: { ...(prev.inputs?.[scope] || {}), [key]: value },
              },
            };
          });
          return;
        }

        if (m.type === "outputs_delta") {
          const { key, value } = m.payload || {};
          setState((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              outputs: { ...(prev.outputs || {}), [key]: value },
            };
          });
          return;
        }

        if (m.type === "status") {
          setState((prev) => (prev ? { ...prev, status: m.payload } : prev));
          return;
        }
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
  }, []);

  // ---------- NEW: build/config commands ----------
  const configure = (projectPath, ioDir, backend) =>
    send({
      type: "configure",
      id: crypto.randomUUID(),
      payload: { projectPath, ioDir, backend: backend || "flownex" },
    });

  const openProject = () =>
    send({ type: "open_project", id: crypto.randomUUID(), payload: {} });

  const closeProject = () =>
    send({ type: "close_project", id: crypto.randomUUID(), payload: {} });

  const closeFlownex = () =>
    send({ type: "close_app", id: crypto.randomUUID(), payload: {} });

  // ---------- Custom message (for user-loaded scripts) ----------
  const sendCustom = (msgType, payload) =>
    send({
      type: "custom_msg",
      id: crypto.randomUUID(),
      payload: { msgType, payload: payload || {} },
    });

  // ---------- Existing commands ----------
  const connectProject = (projectPath) =>
    send({ type: "connect", id: crypto.randomUUID(), payload: { projectPath } });

  const setInput = (scope, key, value) =>
    send({
      type: "set_input",
      id: crypto.randomUUID(),
      payload: { scope, key, value },
    });

  const runSteady = () =>
    send({ type: "run", id: crypto.randomUUID(), payload: { mode: "steady" } });

  const getState = () =>
    send({ type: "get_state", id: crypto.randomUUID(), payload: {} });

  // Expose bridge API globally so user-loaded custom scripts can call it.
  // We use a stable ref object so window.__bridgeAPI always holds the latest
  // values without triggering stale-closure issues in custom scripts.
  // Custom scripts can use: window.__bridgeAPI.sendCustom("myCmd", {...})
  const bridgeAPIRef = useRef({});
  bridgeAPIRef.current = {
    connected,
    state,
    schema,
    send,
    configure,
    openProject,
    closeProject,
    closeFlownex,
    sendCustom,
    setInput,
    runSteady,
    getState,
  };
  if (!window.__bridgeAPI) {
    window.__bridgeAPI = bridgeAPIRef.current;
  } else {
    Object.assign(window.__bridgeAPI, bridgeAPIRef.current);
  }

  return {
    connected,
    state,
    schema,

    // new build API
    configure,
    openProject,
    closeProject,
    closeFlownex,
    sendCustom,

    // old API
    connectProject,
    setInput,
    runSteady,
    getState,
  };
}
