import React from "react";

export default function GeometricalDesign({ bridge, state }) {

  const staticInputs = state?.schema?.staticInputs || [];

  const handleChange = (key, value) => {
    bridge?.send?.({
      type: "set_input",
      payload: {
        scope: "static",
        key,
        value: Number(value)
      }
    });
  };

  if (!staticInputs.length) {
    return <div style={{ padding: "16px" }}>No geometrical inputs available.</div>;
  }

  return (
    <div style={{ padding: "16px" }}>
      <h2>Geometrical Design</h2>

      {staticInputs.map((input) => (
        <div key={input.key} style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px" }}>
            {input.label || input.key}
          </label>

          <input
            type="number"
            value={state?.inputs?.static?.[input.key] ?? input.default ?? 0}
            onChange={(e) => handleChange(input.key, e.target.value)}
            style={{ width: "150px" }}
          />
        </div>
      ))}
    </div>
  );
}