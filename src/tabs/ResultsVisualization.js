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
}) => {
  const outputs = bridge?.state?.outputs || {};

  const selectedVarObj = legendVariables.find((v) => v.id === legendVar) || legendVariables[0];
  const selectedPresetObj = legendPresets.find((p) => p.id === legendPreset) || legendPresets[0];

  const handleVariableClick = (varId) => {
    setLegendVar(varId);
  };

  const applyVisualization = () => {
    const msg = JSON.stringify({
      event_type: "colorize",
      payload: {
        property: selectedVarObj.id,
        colormap: legendPreset,
        min: selectedVarObj.min,
        max: selectedVarObj.max,
      },
    });
    AppStream.sendMessage(msg);
  };

  return (
    <div>
      <div className="section">
        <h2 className="section-title">Visualization Property</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {legendVariables.map((v) => {
            const rawVal = outputs[v.id];
            const isSelected = v.id === legendVar;
            const numVal = typeof rawVal === 'number' ? rawVal : parseFloat(rawVal);
            const displayVal = rawVal != null
              ? `${Number.isFinite(numVal) ? numVal.toFixed(2) : rawVal} ${v.units}`
              : `${v.min}–${v.max} ${v.units}`;

            return (
              <button
                key={v.id}
                onClick={() => handleVariableClick(v.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(0,80,224,0.85)' : 'rgba(255,255,255,0.06)',
                  border: isSelected ? '1px solid rgba(0,80,224,0.9)' : '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '13px' }}>{v.label}</span>
                <span style={{ fontSize: '12px', opacity: 0.75 }}>{displayVal}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Color Map</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
          {legendPresets.map((p) => (
            <button
              key={p.id}
              onClick={() => setLegendPreset(p.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '10px',
                background: legendPreset === p.id ? 'rgba(0,80,224,0.85)' : 'rgba(255,255,255,0.06)',
                border: legendPreset === p.id ? '1px solid rgba(0,80,224,0.9)' : '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <div style={{
                width: '60px',
                height: '14px',
                borderRadius: '4px',
                background: p.gradient,
                flexShrink: 0,
              }} />
              <span style={{ fontSize: '12px', fontWeight: 700 }}>{p.name}</span>
            </button>
          ))}
        </div>

        <div style={{
          height: '36px',
          background: selectedPresetObj.gradient,
          backgroundSize: '100% 100%',
          borderRadius: '8px',
          position: 'relative',
          marginBottom: '8px',
        }}>
          <span style={{
            position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '11px', background: 'rgba(0,0,0,0.65)', padding: '2px 5px', borderRadius: '4px',
          }}>
            {selectedVarObj.min} {selectedVarObj.units}
          </span>
          <span style={{
            position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '11px', background: 'rgba(0,0,0,0.65)', padding: '2px 5px', borderRadius: '4px',
          }}>
            {selectedVarObj.max} {selectedVarObj.units}
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
