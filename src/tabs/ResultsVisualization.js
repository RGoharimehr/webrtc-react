import React, { useEffect, useMemo, useState } from "react";

export default function ResultsVisualization({ bridge, state }) {
  const outputs = state?.schema?.outputs || [];
  const currentOutputs = state?.outputs || {};
  const [selectedProperty, setSelectedProperty] = useState("");

  const outputOptions = useMemo(() => {
    return outputs.map((o) => ({
      key: o.key || o.propertyIdentifier || o.label,
      label: o.label || o.key || o.propertyIdentifier || "Unnamed Output",
    }));
  }, [outputs]);

  useEffect(() => {
    if (!bridge || !selectedProperty) return;

    const handler = (msg) => {
      if (msg.type === "state_update") {
        bridge.visualize?.(selectedProperty);
      }
    };

    bridge.onMessage = handler;

    return () => {
      bridge.onMessage = null;
    };
  }, [selectedProperty, bridge]);

  const handleVisualize = () => {
    if (!selectedProperty) {
      alert("Select a property first");
      return;
    }

    bridge?.visualize?.(selectedProperty);
  };

  return (
    <div style={{ padding: "16px" }}>
      <h2>Results Visualization</h2>

      <div style={{ marginBottom: "20px" }}>
        <label>Select Property:</label>
        <br />
        <select
          value={selectedProperty}
          onChange={(e) => setSelectedProperty(e.target.value)}
          style={{ width: "280px", marginTop: "8px" }}
        >
          <option value="">-- Select --</option>
          {outputOptions.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "24px" }}>
        <button onClick={handleVisualize}>Apply Colormap</button>
      </div>

      <div>
        <h3>Current Results</h3>
        {outputOptions.length ? (
          outputOptions.map((o) => (
            <div key={o.key} style={{ marginBottom: "8px" }}>
              <strong>{o.label}:</strong>{" "}
              {currentOutputs[o.key] !== undefined ? String(currentOutputs[o.key]) : "—"}
            </div>
          ))
        ) : (
          <div style={{ opacity: 0.75 }}>No output schema available yet.</div>
        )}
      </div>
    </div>
  );
}