import React, { useState } from 'react';

const ResultsMapping = () => {
  const [targetPath, setTargetPath] = useState('/World');
  const [logs, setLogs] = useState('Results mapping ready.\n');

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => `${prev}[${timestamp}] ${message}\n`);
  };

  const startPropertyOverride = () => {
    addLog(`Starting prim property override for path: ${targetPath}`);
  };

  const generateMappingConfig = () => {
    addLog('Generating mapping configuration file...');
    setTimeout(() => {
      addLog('Mapping config file generated successfully');
    }, 500);
  };

  const importProject = () => {
    addLog('Opening import dialog...');
  };

  const exportProject = () => {
    addLog('Opening export dialog...');
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

      <div className="section">
        <div style={{
          borderBottom: '2px solid var(--accent-green)',
          paddingBottom: '8px',
          marginBottom: '16px'
        }}>
          <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>3.</span>
          <span style={{ marginLeft: '8px', fontSize: '18px', fontWeight: 600 }}>
            Project Import / Export
          </span>
        </div>
        <div className="button-group">
          <button onClick={importProject}>Import Project...</button>
          <button onClick={exportProject}>Export Project...</button>
        </div>
      </div>

      <div className="logs-container">
        <div className="logs-title">Mapping Logs</div>
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
