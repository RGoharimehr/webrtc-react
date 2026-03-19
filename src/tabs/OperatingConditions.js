import React, { useState, useEffect } from "react";

const OperatingConditions = ({ bridge }) => {
  const dynamicValues = bridge?.state?.inputs?.dynamic || {};

  // Show all dynamic inputs from backend schema (sliders and checkboxes)
  const shown = bridge?.dynamicInputDefs || [];

  // Local UI fallback for when bridge isn't ready yet
  const [local, setLocal] = useState({});

  useEffect(() => {
    // initialize local values from defaults
    const init = {};
    shown.forEach((i) => {
      init[i.key] = (dynamicValues[i.key] ?? i.defaultValue ?? 0);
    });
    setLocal(init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown.length]);

  const setOne = (key, value) => {
    setLocal((p) => ({ ...p, [key]: value }));
    bridge?.setInput?.("dynamic", key, value);
  };

  return (
    <div className="section">
      <h2 className="section-title">Operating Conditions (Flownex Inputs)</h2>

      {shown.length === 0 && (
        <div style={{ color: "var(--text-secondary)" }}>
          No dynamic inputs received yet. Connect to the backend and open a project.
        </div>
      )}

      {shown.map((i) => {
        const rawVal = dynamicValues[i.key] ?? local[i.key] ?? i.defaultValue ?? 0;
        const editType = (i.editType || "slider").toLowerCase();

        if (editType === "checkbox") {
          const checked = Boolean(rawVal);
          return (
            <div key={i.key} className="input-row">
              <label className="input-label">
                {i.description} {i.unit ? `[${i.unit}]` : ""}
              </label>
              <div className="input-control">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setOne(i.key, e.target.checked)}
                />
                <span className="value-display">{checked ? "On" : "Off"}</span>
              </div>
              <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 4 }}>
                <div><b>Key:</b> {i.key}</div>
                <div><b>Component:</b> {i.componentIdentifier}</div>
              </div>
            </div>
          );
        }

        // Default: slider
        const v = typeof rawVal === "number" ? rawVal : parseFloat(rawVal) || 0;
        const min = i.min ?? 0;
        const max = i.max ?? 100;
        const step = i.step ?? 1;

        return (
          <div key={i.key} className="input-row">
            <label className="input-label">
              {i.description} {i.unit ? `[${i.unit}]` : ""}
            </label>

            <div className="input-control">
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={v}
                onChange={(e) => setOne(i.key, Number(e.target.value))}
              />
              <span className="value-display">
                {v} {i.unit}
              </span>
            </div>

            <div style={{ color: "var(--text-secondary)", fontSize: 12, marginTop: 4 }}>
              <div><b>Key:</b> {i.key} {i.rawKey !== i.key ? `(raw: "${i.rawKey}")` : ""}</div>
              <div><b>Component:</b> {i.componentIdentifier}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OperatingConditions;
