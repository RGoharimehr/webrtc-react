import React, { useMemo, useState, useEffect } from "react";

const OperatingConditions = ({ bridge }) => {
  const dynamicValues = bridge?.state?.inputs?.dynamic || {};

  // Only show the Heat Rejection / Rack Power Script sliders in this tab (you can change filter)
  const shown = useMemo(() => {
    const inputs = bridge?.schema?.inputs || [];
    return inputs.filter((i) => i.editType === "slider");
  }, [bridge?.schema?.inputs]);

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
          No inputs received yet. Check bridge connection and that Inputs.csv is inside flownex-bridge/.
        </div>
      )}

      {shown.map((i) => {
        const v = dynamicValues[i.key] ?? local[i.key] ?? i.defaultValue ?? 0;
        const min = i.min ?? 0;
        const max = i.max ?? 100;
        const step = i.step ?? 1;

        return (
          <div key={i.key} className="input-row">
            <label className="input-label">
              {i.description} [{i.unit || "-"}]
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
