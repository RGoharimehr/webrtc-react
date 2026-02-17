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

  // Colormap definitions
  const colormaps = {
    jet: 'linear-gradient(to right, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000)',
    rainbow: 'linear-gradient(to right, #9400d3, #4b0082, #0000ff, #00ff00, #ffff00, #ff7f00, #ff0000)',
    hot: 'linear-gradient(to right, #000000, #ff0000, #ffff00, #ffffff)',
    cool: 'linear-gradient(to right, #00ffff, #ff00ff)',
    viridis: 'linear-gradient(to right, #440154, #31688e, #35b779, #fde724)'
  };

  const applyVisualization = () => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => {
      const lines = prev.split('\n');
      // Keep only the last 199 lines, then add the new one (total: 200)
      if (lines.length >= 200) {
        lines.splice(0, lines.length - 199);
      }
      return lines.join('\n') + `\n[${timestamp}] Applied visualization: ${vizSettings.property} with ${vizSettings.colormap} colormap`;
    });
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
          height: '40px',
          background: colormaps[vizSettings.colormap],
          borderRadius: '4px',
          border: 'none',
          position: 'relative',
          marginBottom: '12px',
          transition: 'all 0.5s ease'
        }}>
          <div style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.7)',
            padding: '3px 6px',
            borderRadius: '3px',
            fontSize: '10px'
          }}>
            {vizSettings.manualBounds ? vizSettings.minBound : 'Min'}
          </div>
          <div style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.7)',
            padding: '3px 6px',
            borderRadius: '3px',
            fontSize: '10px'
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
