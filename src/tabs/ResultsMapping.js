import React from "react";

export default function ResultsMapping({ bridge }) {

  const generateMapping = () => {
    bridge?.send?.({
      type: "generate_mapping_config",
      payload: {}
    });
  };

  const addAttribute = () => {
    const primPath = prompt("Enter USD Prim Path:");

    if (!primPath) return;

    bridge?.send?.({
      type: "prim_property_override",
      payload: { primPath }
    });
  };

  return (
    <div style={{ padding: "16px" }}>
      <h2>Results Mapping</h2>

      <div style={{ marginTop: "20px" }}>
        <button onClick={generateMapping}>
          Generate Mapping Config
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={addAttribute}>
          Add Flownex Attribute to Prim
        </button>
      </div>
    </div>
  );
}