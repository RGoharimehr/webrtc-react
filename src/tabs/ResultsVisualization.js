import React, { useState } from 'react';

const ResultsVisualization = () => {
  const [vizSettings, setVizSettings] = useState({
    property: 'temperature',
    colormap: 'jet',
    manualBounds: false,
    minBound: 20,
    maxBound: 80
  });

  const [logs, setLogs] = useState('');

  const applyVisualization = () => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => `${prev}\n[${timestamp}] Applied visualization: ${vizSettings.property} with ${vizSettings.colormap} colormap`);
  };

  return (
    <div>
      <div className="section">
        <h2 className="section-title">Visualization Settings</h2>
        
        <div className="input-row">
          <label className="input-label">Property to Visualize:</label>
          <select 
            style={{ flex: 1 }}
            value={vizSettings.property}
            onChange={(e) => setVizSettings({...vizSettings, property: e.target.value})}
          >
            <option value="temperature">Temperature</option>
            <option value="pressure">Pressure</option>
            <option value="velocity">Velocity</option>
            <option value="humidity">Humidity</option>
          </select>
        </div>

        <div className="input-row">
          <label className="input-label">Colormap:</label>
          <select 
            style={{ flex: 1 }}
            value={vizSettings.colormap}
            onChange={(e) => setVizSettings({...vizSettings, colormap: e.target.value})}
          >
            <option value="jet">Jet</option>
            <option value="rainbow">Rainbow</option>
            <option value="hot">Hot</option>
            <option value="cool">Cool</option>
            <option value="viridis">Viridis</option>
          </select>
        </div>

        <div className="input-row">
          <label className="input-label">
            <input
              type="checkbox"
              checked={vizSettings.manualBounds}
              onChange={(e) => setVizSettings({...vizSettings, manualBounds: e.target.checked})}
            />
            Set Manual Bounds
          </label>
        </div>

        {vizSettings.manualBounds && (
          <>
            <div className="input-row">
              <label className="input-label">Minimum Bound:</label>
              <input
                type="number"
                value={vizSettings.minBound}
                onChange={(e) => setVizSettings({...vizSettings, minBound: parseFloat(e.target.value)})}
                style={{ width: '150px' }}
              />
            </div>
            <div className="input-row">
              <label className="input-label">Maximum Bound:</label>
              <input
                type="number"
                value={vizSettings.maxBound}
                onChange={(e) => setVizSettings({...vizSettings, maxBound: parseFloat(e.target.value)})}
                style={{ width: '150px' }}
              />
            </div>
          </>
        )}
      </div>

      <div className="section">
        <h2 className="section-title">Color Legend</h2>
        <div style={{
          height: '130px',
          background: 'linear-gradient(to right, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          position: 'relative',
          marginBottom: '12px'
        }}>
          <div style={{
            position: 'absolute',
            left: '10px',
            bottom: '10px',
            background: 'rgba(0,0,0,0.7)',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            {vizSettings.manualBounds ? vizSettings.minBound : 'Min'}
          </div>
          <div style={{
            position: 'absolute',
            right: '10px',
            bottom: '10px',
            background: 'rgba(0,0,0,0.7)',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            {vizSettings.manualBounds ? vizSettings.maxBound : 'Max'}
          </div>
        </div>
        
        <button className="success" onClick={applyVisualization} style={{ width: '100%' }}>
          Apply / Refresh Visualization
        </button>
      </div>

      <div className="logs-container">
        <div className="logs-title">Visualization Logs</div>
        <textarea
          className="logs-textarea"
          value={logs}
          readOnly
        />
      </div>
    </div>
  );
};

export default ResultsVisualization;
