import React, { useEffect, useState } from 'react';

const ResultsMapping = ({ bridge }) => {
  const [targetPath, setTargetPath] = useState('/World');
  const [logs, setLogs] = useState('Results mapping ready.\n');

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => {
      const lines = prev.split('\n');
      if (lines.length >= 200) lines.splice(0, lines.length - 199);
      return lines.join('\n') + `[${timestamp}] ${message}\n`;
    });
  };

  // Log bridge connection changes
  useEffect(() => {
    if (bridge?.connected) {
      addLog('Bridge connected.');
    } else if (bridge?.connected === false) {
      addLog('Bridge disconnected.');
    }
  }, [bridge?.connected]);

  // Show bridge errors in logs
  useEffect(() => {
    const errs = bridge?.errors;
    if (!errs?.length) return;
    addLog(`Bridge error: ${errs[errs.length - 1]}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bridge?.errors?.length]);

  const startPropertyOverride = () => {
    addLog(`Sending prim property override request for path: ${targetPath}…`);
    bridge?.sendCustom?.('prim_property_override', { primPath: targetPath });
  };

  const generateMappingConfig = () => {
    addLog('Requesting mapping configuration generation…');
    bridge?.sendCustom?.('generate_mapping_config', {});
  };

  return (
    <div>

      <div className="section">
        <div style={{
          borderBottom: '2px solid var(--accent-green)',
          paddingBottom: '8px',
          marginBottom: '16px'
        }}>
          <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>1.</span>
          <span style={{ marginLeft: '8px', fontSize: '18px', fontWeight: 600 }}>
            Add Flownex Component Name to Prims
          </span>
        </div>
        <div className="input-row">
          <label className="input-label">Target Prim Path:</label>
          <input
            type="text"
            value={targetPath}
            onChange={(e) => setTargetPath(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
        <button className="primary" onClick={startPropertyOverride} style={{ marginTop: '12px' }}>
          Start Prim Property Override
        </button>
      </div>

      <div className="section">
        <div style={{
          borderBottom: '2px solid var(--accent-green)',
          paddingBottom: '8px',
          marginBottom: '16px'
        }}>
          <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>2.</span>
          <span style={{ marginLeft: '8px', fontSize: '18px', fontWeight: 600 }}>
            Generate Mapping Config File
          </span>
        </div>
        <button className="success" onClick={generateMappingConfig}>
          Generate
        </button>
      </div>

      <div className="logs-container">
        <div className="logs-title">
          Mapping Logs
          <span style={{ float: 'right', fontSize: 11, fontWeight: 400, color: bridge?.connected ? 'var(--success-green)' : 'var(--error-red)' }}>
            {bridge?.connected ? '● Connected' : '● Disconnected'}
          </span>
        </div>
        <textarea
          className="logs-textarea"
          value={logs}
          readOnly
        />
      </div>
    </div>
  );
};

export default ResultsMapping;
