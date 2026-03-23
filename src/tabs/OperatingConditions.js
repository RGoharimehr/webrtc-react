import React from "react";

export default function OperatingConditions({ bridge, state }) {

  const dynamicInputs = state?.schema?.dynamicInputs || [];

  const handleChange = (key, value) => {
    bridge?.send?.({
      type: "set_input",
      payload: {
        scope: "dynamic",
        key,
        value: Number(value)
      }
    });
  };

  if (!dynamicInputs.length) {
    return <div style={{ padding: "16px" }}>No dynamic inputs available.</div>;
  }

  return (
    <div style={{ padding: "16px" }}>
      <h2>Operating Conditions</h2>

      {dynamicInputs.map((input) => (
        <div key={input.key} style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            {input.label || input.key}
          </label>

          <input
            type="number"
            value={state?.inputs?.dynamic?.[input.key] ?? input.default ?? 0}
            onChange={(e) => handleChange(input.key, e.target.value)}
            style={{ width: "150px" }}
          />
        </div>
      ))}
    </div>
  );
}