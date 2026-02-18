// src/bridge/useBridge.js
import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = "ws://127.0.0.1:8001/ws";

export function useBridge() {
  const wsRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [state, setState] = useState(null);
  const [schema, setSchema] = useState({ inputs: [], outputs: [] });

  const send = useCallback((msg) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }, []);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);

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

    return () => {
      try {
        ws.close();
      } catch {}
    };
  }, []);

  // ---------- NEW: build/config commands ----------
  const configure = (projectPath, ioDir) =>
    send({
      type: "configure",
      id: crypto.randomUUID(),
      payload: { projectPath, ioDir },
    });

  const openProject = () =>
    send({ type: "open_project", id: crypto.randomUUID(), payload: {} });

  const closeProject = () =>
    send({ type: "close_project", id: crypto.randomUUID(), payload: {} });

  const closeFlownex = () =>
    send({ type: "close_flownex", id: crypto.randomUUID(), payload: {} });

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

  return {
    connected,
    state,
    schema,

    // new build API
    configure,
    openProject,
    closeProject,
    closeFlownex,

    // old API
    connectProject,
    setInput,
    runSteady,
    getState,
  };
}
