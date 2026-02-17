import React, { useState, useRef, useEffect } from 'react';
import kitClient from '../api/kitClient';

const ResultsMapping = () => {
  const [targetPath, setTargetPath] = useState('/World');
  const [logs, setLogs] = useState('Results mapping ready.\n');
  const [useBackend, setUseBackend] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    setUseBackend(kitClient.isConnected);

    const onConnected = () => setUseBackend(true);
    const onDisconnected = () => setUseBackend(false);

    kitClient.on('connected', onConnected);
    kitClient.on('disconnected', onDisconnected);

    return () => {
      kitClient.off('connected', onConnected);
      kitClient.off('disconnected', onDisconnected);
    };
  }, []);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => {
      const lines = prev.split('\n');
      // Keep only the last 199 lines, then add the new one (total: 200)
      if (lines.length >= 200) {
        lines.splice(0, lines.length - 199);
      }
      return lines.join('\n') + `[${timestamp}] ${message}\n`;
    });
  };

  const startPropertyOverride = async () => {
    addLog(`Starting prim property override for path: ${targetPath}`);

    if (useBackend) {
      try {
        await kitClient.applyMapping();
        addLog('✅ Mapping applied on backend');
      } catch (err) {
        addLog(`❌ Failed to apply mapping: ${err.message}`);
        console.error('Failed to apply mapping:', err);
      }
    }
  };

  const generateMappingConfig = async () => {
    addLog('Generating mapping configuration file...');
    
    if (useBackend) {
      try {
        await kitClient.applyMapping();
        addLog('✅ Mapping config generated on backend');
      } catch (err) {
        addLog(`❌ Failed to generate mapping config: ${err.message}`);
        console.error('Failed to generate mapping config:', err);
      }
    } else {
      timerRef.current = setTimeout(() => {
        addLog('Mapping config file generated successfully (local mode)');
      }, 500);
    }
  };

  const importProject = async () => {
    addLog('Opening import dialog...');
    
    if (useBackend) {
      // In a real scenario, this would show a file picker and send the path
      const filePath = prompt('Enter project ZIP file path:');
      if (filePath) {
        try {
          await kitClient.importZip(filePath);
          addLog(`✅ Project imported from ${filePath}`);
        } catch (err) {
          addLog(`❌ Failed to import project: ${err.message}`);
          console.error('Failed to import project:', err);
        }
      }
    }
  };

  const exportProject = async () => {
    addLog('Opening export dialog...');
    
    if (useBackend) {
      try {
        const result = await kitClient.exportZip();
        if (result.filePath) {
          addLog(`✅ Project exported to ${result.filePath}`);
          alert(`Project exported to:\n${result.filePath}`);
        }
      } catch (err) {
        addLog(`❌ Failed to export project: ${err.message}`);
        console.error('Failed to export project:', err);
      }
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

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
