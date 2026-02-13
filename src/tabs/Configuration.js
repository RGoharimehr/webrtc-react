import React, { useState, useRef, useEffect } from 'react';

const Configuration = () => {
  const [config, setConfig] = useState({
    projectFile: '',
    ioDirectory: '',
    solveOnChange: true,
    dataInterval: 0.5,
    status: 'Not Connected'
  });

  const [logs, setLogs] = useState('Configuration panel ready.\n');
  const [isExpanded, setIsExpanded] = useState(true);
  const timerRef = useRef(null);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => {
      const lines = prev.split('\n');
      // Cap at 200 lines to prevent unbounded growth
      if (lines.length > 200) {
        lines.splice(0, lines.length - 200);
      }
      return lines.join('\n') + `[${timestamp}] ${message}\n`;
    });
  };

  const browseFile = () => {
    addLog('File browser opened');
  };

  const browseFolder = () => {
    addLog('Folder browser opened');
  };

  const openProject = () => {
    addLog('Attempting to open project...');
    timerRef.current = setTimeout(() => {
      setConfig(prev => ({ ...prev, status: 'Connected' }));
      addLog('Project opened successfully');
    }, 1000);
  };

  const closeProject = () => {
    addLog('Closing project...');
    setConfig(prev => ({ ...prev, status: 'Not Connected' }));
  };

  const closeFlownex = () => {
    addLog('Closing Flownex application...');
    setConfig(prev => ({ ...prev, status: 'Not Connected' }));
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
      <div className="collapsible">
        <div className="collapsible-header" onClick={() => setIsExpanded(!isExpanded)}>
          <span className="collapsible-title">Flownex Configuration</span>
          <span className={`collapsible-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
        </div>
        {isExpanded && (
          <div className="collapsible-content">
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontWeight: 600 }}>Status: </span>
              <span style={{
                color: config.status === 'Connected' ? 'var(--success-green)' : 'var(--error-red)'
              }}>
                <span 
                  className={`status-indicator ${config.status === 'Connected' ? 'active' : 'inactive'}`}
                />
                {config.status}
              </span>
            </div>

            <div className="input-row">
              <label className="input-label">Flownex Project File:</label>
              <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={config.projectFile}
                  onChange={(e) => setConfig({...config, projectFile: e.target.value})}
                  placeholder="Select project file..."
                  style={{ flex: 1 }}
                />
                <button onClick={browseFile}>...</button>
              </div>
            </div>

            <div className="input-row">
              <label className="input-label">IO Definition Directory:</label>
              <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={config.ioDirectory}
                  onChange={(e) => setConfig({...config, ioDirectory: e.target.value})}
                  placeholder="Select directory..."
                  style={{ flex: 1 }}
                />
                <button onClick={browseFolder}>...</button>
              </div>
            </div>

            <div className="input-row">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={config.solveOnChange}
                  onChange={(e) => setConfig({...config, solveOnChange: e.target.checked})}
                />
                <span>Solve on Input Change</span>
              </label>
            </div>

            <div className="input-row">
              <label className="input-label">Flownex Data Interval [s]:</label>
              <div className="input-control">
                <input
                  type="range"
                  min="0.25"
                  max="1.5"
                  step="0.25"
                  value={config.dataInterval}
                  onChange={(e) => setConfig({...config, dataInterval: parseFloat(e.target.value)})}
                />
                <span className="value-display">{config.dataInterval} s</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="section">
        <h2 className="section-title">API Testing</h2>
        <div className="button-group">
          <button onClick={openProject}>Open Project</button>
          <button onClick={closeProject}>Close Project</button>
          <button className="warning" onClick={closeFlownex}>Close Flownex</button>
        </div>
      </div>

      <div className="logs-container">
        <div className="logs-title">Configuration Logs</div>
        <textarea
          className="logs-textarea"
          style={{ height: '100px' }}
          value={logs}
          readOnly
        />
      </div>
    </div>
  );
};

export default Configuration;
