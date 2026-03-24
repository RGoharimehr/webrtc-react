import React, { useEffect, useMemo, useState } from "react";
import GraphsPanel from "../components/GraphsPanel";

export default function Plotting({ bridge, state }) {
  const outputs = state?.schema?.outputs || [];
  const history = state?.history || [];
  const [selectedVars, setSelectedVars] = useState([]);

  const outputOptions = useMemo(() => {
    return outputs.map((out) => ({
      key: out.key || out.propertyIdentifier || out.label,
      label: out.label || out.key || out.propertyIdentifier || "Unnamed Output",
    }));
  }, [outputs]);

  useEffect(() => {
    if (!bridge?.connected) return;

    const interval = setInterval(() => {
      bridge.readOutputs?.();
    }, 1000);

    return () => clearInterval(interval);
  }, [bridge?.connected]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleVar = (key) => {
    setSelectedVars((prev) =>
      prev.includes(key) ? prev.filter((v) => v !== key) : [...prev, key]
    );
  };

  return (
    <div style={{ padding: "16px" }}>
      <h2>Plotting</h2>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => bridge?.readOutputs?.()}
          style={{ marginRight: "10px" }}
        >
          Read Outputs
        </button>
        <button
          onClick={() => bridge?.runSteady?.()}
          style={{ marginRight: "10px" }}
        >
          Run Steady
        </button>
        <button
          onClick={() => bridge?.startTransient?.()}
          style={{ marginRight: "10px" }}
        >
          Start Transient
        </button>
        <button onClick={() => bridge?.stopTransient?.()}>Stop Transient</button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <strong>Select Variables:</strong>
        <div style={{ marginTop: "10px" }}>
          {outputOptions.length ? (
            outputOptions.map((out) => (
              <div key={out.key} style={{ marginBottom: "6px" }}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedVars.includes(out.key)}
                    onChange={() => toggleVar(out.key)}
                    style={{ marginRight: "8px" }}
                  />
                  {out.label}
                </label>
              </div>
            ))
          ) : (
            <div style={{ opacity: 0.75 }}>No output schema available yet.</div>
          )}
        </div>
      </div>

      <GraphsPanel history={history} variables={selectedVars} />
    </div>
  );
}