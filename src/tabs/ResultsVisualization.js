import React from 'react';
import AppStream from '../components/AppStream';

const ResultsVisualization = ({
  bridge,
  legendVar,
  setLegendVar,
  legendPreset,
  setLegendPreset,
  legendVariables,
  legendPresets,
  effectiveMin,
  effectiveMax,
}) => {
  const outputs = bridge?.state?.outputs || {};

  const selectedVarObj = legendVariables.find((v) => v.id === legendVar) || legendVariables[0];
  const selectedPresetObj = legendPresets.find((p) => p.id === legendPreset) || legendPresets[0];

  const applyVisualization = () => {
    const msg = JSON.stringify({
      event_type: "colorize",
      payload: {
        property: selectedVarObj.id,
        colormap: legendPreset,
        min: effectiveMin,
        max: effectiveMax,
      },
    });
    AppStream.sendMessage(msg);
  };

  // The gradient presets are stored as vertical (180deg) for the sidebar legend bar.
  // The preview bar here is horizontal, so we rotate the direction to 90deg.
  const horizontalGradient = selectedPresetObj.gradient.replaceAll('180deg', '90deg');

  return (
    <div>
      <div className="section">
        <h2 className="section-title">Visualization Property</h2>
        <div className="input-row">
          <label className="input-label">Property:</label>
          <select
            style={{ flex: 1 }}
            value={legendVar}
            onChange={(e) => setLegendVar(e.target.value)}
          >
            {legendVariables.map((v) => {
              const rawVal = outputs[v.id];
              const numVal = typeof rawVal === 'number' ? rawVal : parseFloat(rawVal);
              const suffix = rawVal != null && Number.isFinite(numVal)
                ? ` — ${numVal.toFixed(2)} ${v.units}`
                : ` (${v.min}–${v.max} ${v.units})`;
              return (
                <option key={v.id} value={v.id}>{v.label}{suffix}</option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Color Map</h2>
        <div className="input-row">
          <label className="input-label">Colormap:</label>
          <select
            style={{ flex: 1 }}
            value={legendPreset}
            onChange={(e) => setLegendPreset(e.target.value)}
          >
            {legendPresets.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div style={{
          height: '36px',
          background: horizontalGradient,
          backgroundSize: '100% 100%',
          borderRadius: '8px',
          position: 'relative',
          marginTop: '8px',
          marginBottom: '8px',
        }}>
          <span style={{
            position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '11px', background: 'rgba(0,0,0,0.65)', padding: '2px 5px', borderRadius: '4px',
          }}>
            {effectiveMin} {selectedVarObj.units}
          </span>
          <span style={{
            position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '11px', background: 'rgba(0,0,0,0.65)', padding: '2px 5px', borderRadius: '4px',
          }}>
            {effectiveMax} {selectedVarObj.units}
          </span>
        </div>
      </div>

      <button className="success" onClick={applyVisualization} style={{ width: '100%' }}>
        Apply to Omniverse
      </button>
    </div>
  );
};

export default ResultsVisualization;
