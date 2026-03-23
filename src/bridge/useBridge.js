import { useEffect, useRef, useState } from "react";

const WS_URL = "ws://127.0.0.1:8001";

export function useBridge(url = WS_URL) {
  const wsRef = useRef(null);
  const onMessageRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [state, setState] = useState({
    schema: {
      dynamicInputs: [],
      staticInputs: [],
      outputs: [],
    },
    inputs: {
      dynamic: {},
      static: {},
    },
    outputs: {},
    history: [],
    transient: {
      running: false,
    },
    config: {},
  });

  useEffect(() => {
    let ws = null;

    try {
      ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[bridge] connected:", url);
        setConnected(true);

        send({ type: "get_state", payload: {} });
        send({ type: "get_schema", payload: {} });
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.log("[bridge] message:", msg);

          if (msg.type === "state" && msg.payload) {
            setState((prev) => {
              const nextOutputs = msg.payload.outputs || {};
              const hasOutputs = Object.keys(nextOutputs).length > 0;

              let history = prev.history || [];

              if (hasOutputs) {
                const entry = {
                  t: Date.now(),
                  ...nextOutputs,
                };

                history = [...history, entry];
                if (history.length > 500) {
                  history = history.slice(-500);
                }
              }

              return {
                ...prev,
                ...msg.payload,
                history,
              };
            });
          }

          if (msg.type === "response" && msg.payload) {
            if (msg.payload.schema) {
              setState((prev) => ({
                ...prev,
                schema: msg.payload.schema,
              }));
            }

            if (msg.payload.outputs) {
              setState((prev) => ({
                ...prev,
                outputs: msg.payload.outputs,
              }));
            }

            if (msg.payload.inputs) {
              setState((prev) => ({
                ...prev,
                inputs: {
                  ...prev.inputs,
                  ...msg.payload.inputs,
                },
              }));
            }

            if (msg.payload.config) {
              setState((prev) => ({
                ...prev,
                config: msg.payload.config,
              }));
            }
          }

          if (onMessageRef.current) {
            onMessageRef.current(msg);
          }
        } catch (err) {
          console.error("[bridge] parse error:", err, event.data);
        }
      };

      ws.onerror = (err) => {
        console.error("[bridge] websocket error:", err);
      };

      ws.onclose = () => {
        console.warn("[bridge] disconnected");
        setConnected(false);
      };
    } catch (err) {
      console.error("[bridge] failed to create websocket:", err);
    }

    return () => {
      try {
        ws?.close();
      } catch (e) {
        console.warn("[bridge] close warning:", e);
      }
      wsRef.current = null;
    };
  }, [url]);

  const send = (message) => {
    try {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.warn("[bridge] send skipped, socket not open:", message);
        return;
      }
      wsRef.current.send(JSON.stringify(message));
    } catch (err) {
      console.error("[bridge] send failed:", err);
    }
  };

  return {
    connected,
    state,
    send,

    configure(projectFile, ioDirectory, resultPollingInterval = 1.0) {
      send({
        type: "configure",
        payload: {
          projectFile,
          ioDirectory,
          resultPollingInterval,
        },
      });
    },

    openFlownex() {
      send({ type: "open_flownex", payload: {} });
    },

    closeFlownex() {
      send({ type: "close_flownex", payload: {} });
    },

    openProject() {
      send({ type: "open_project", payload: {} });
    },

    connectFlownex() {
      send({ type: "connect", payload: {} });
    },

    runSteady() {
      send({ type: "run", payload: {} });
    },

    loadDefaults() {
      send({ type: "load_defaults", payload: {} });
    },

    loadDefaultsAndRun() {
      send({ type: "load_defaults_and_run", payload: {} });
    },

    startTransient() {
      send({ type: "start_transient", payload: {} });
    },

    stopTransient() {
      send({ type: "stop_transient", payload: {} });
    },

    readOutputs() {
      send({ type: "read_outputs", payload: {} });
    },

    getSchema() {
      send({ type: "get_schema", payload: {} });
    },

    getStateSnapshot() {
      send({ type: "get_state", payload: {} });
    },

    setInput(scope, key, value) {
      send({
        type: "set_input",
        payload: { scope, key, value },
      });
    },

    visualize(property) {
      send({
        type: "visualize_property",
        payload: { property },
      });
    },

    browseFile(mode = "file", filters = []) {
      send({
        type: "browse_file",
        payload: { mode, filters },
      });
    },

    set onMessage(fn) {
      onMessageRef.current = fn;
    },

    get onMessage() {
      return onMessageRef.current;
    },
  };
}