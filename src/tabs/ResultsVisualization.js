import React, { useState, useEffect } from 'react';
import kitClient from '../api/kitClient';

const ResultsVisualization = () => {
  const [vizSettings, setVizSettings] = useState({
    property: 'temperature',
    colormap: 'jet',
    manualBounds: false,
    minBound: 20,
    maxBound: 80
  });

  const [logs, setLogs] = useState('');
  const [useBackend, setUseBackend] = useState(false);

  // Check backend connection
  useEffect(() => {
    setUseBackend(kitClient.isConnected);

    const onConnected = () => {
      setUseBackend(true);
      addLog('Backend connected');
      fetchVizOptions();
    };

    const onDisconnected = () => {
      setUseBackend(false);
      addLog('Backend disconnected - using local mode');
    };

    kitClient.on('connected', onConnected);
    kitClient.on('disconnected', onDisconnected);

    if (kitClient.isConnected) {
      fetchVizOptions();
    }

    return () => {
      kitClient.off('connected', onConnected);
      kitClient.off('disconnected', onDisconnected);
    };
  }, []);

  const fetchVizOptions = async () => {
    try {
      const options = await kitClient.getVizOptions();
      if (options) {
        addLog('✅ Visualization options loaded from backend');
        // Could update available properties/colormaps here if backend provides them
      }
    } catch (err) {
      addLog(`❌ Failed to fetch viz options: ${err.message}`);
      console.error('Failed to fetch viz options:', err);
    }
  };

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => {
      const lines = prev.split('\n');
      if (lines.length >= 200) {
        lines.splice(0, lines.length - 199);
      }
      return lines.join('\n') + `\n[${timestamp}] ${message}`;
    });
  };

  // Colormap definitions
  const colormaps = {
    jet: 'linear-gradient(to right, #0000ff, #00ffff, #00ff00, #ffff00, #ff0000)',
    rainbow: 'linear-gradient(to right, #9400d3, #4b0082, #0000ff, #00ff00, #ffff00, #ff7f00, #ff0000)',
    hot: 'linear-gradient(to right, #000000, #ff0000, #ffff00, #ffffff)',
    cool: 'linear-gradient(to right, #00ffff, #ff00ff)',
    viridis: 'linear-gradient(to right, #440154, #31688e, #35b779, #fde724)'
  };

  const handlePropertyChange = async (property) => {
    setVizSettings(prev => ({ ...prev, property }));
    
    if (useBackend) {
      try {
        await kitClient.setVizProperty(property);
        addLog(`✅ Property set to ${property} on backend`);
      } catch (err) {
        addLog(`❌ Failed to set property: ${err.message}`);
        console.error('Failed to set viz property:', err);
      }
    }
  };

  const handleColormapChange = async (colormap) => {
    setVizSettings(prev => ({ ...prev, colormap }));
    
    if (useBackend) {
      // Apply colormap with current bounds
      await applyColormapToBackend(colormap, vizSettings.manualBounds, vizSettings.minBound, vizSettings.maxBound);
    }
  };

  const handleBoundsChange = (field, value) => {
    setVizSettings(prev => ({ ...prev, [field]: value }));
  };

  const applyColormapToBackend = async (colormap, useBounds, minBound, maxBound) => {
    try {
      const min = useBounds ? minBound : undefined;
      const max = useBounds ? maxBound : undefined;
      await kitClient.setVizColormap(colormap, min, max);
      addLog(`✅ Colormap ${colormap} applied on backend`);
    } catch (err) {
      addLog(`❌ Failed to set colormap: ${err.message}`);
      console.error('Failed to set viz colormap:', err);
    }
  };

  const applyVisualization = async () => {
    const timestamp = new Date().toLocaleTimeString();
    const message = `Applied visualization: ${vizSettings.property} with ${vizSettings.colormap} colormap`;
    setLogs(prev => {
      const lines = prev.split('\n');
      // Keep only the last 199 lines, then add the new one (total: 200)
      if (lines.length >= 200) {
        lines.splice(0, lines.length - 199);
      }
      return lines.join('\n') + `\n[${timestamp}] ${message}`;
    });

    if (useBackend) {
      try {
        // Set property and colormap
        await kitClient.setVizProperty(vizSettings.property);
        await applyColormapToBackend(
          vizSettings.colormap,
          vizSettings.manualBounds,
          vizSettings.minBound,
          vizSettings.maxBound
        );
        // Refresh visualization
        await kitClient.refreshViz();
        addLog('✅ Visualization refreshed on backend');
      } catch (err) {
        addLog(`❌ Failed to apply visualization: ${err.message}`);
        console.error('Failed to apply visualization:', err);
      }
    }
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
            onChange={(e) => handlePropertyChange(e.target.value)}
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
            onChange={(e) => handleColormapChange(e.target.value)}
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
              onChange={(e) => handleBoundsChange('manualBounds', e.target.checked)}
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
                onChange={(e) => handleBoundsChange('minBound', parseFloat(e.target.value))}
                style={{ width: '150px' }}
              />
            </div>
            <div className="input-row">
              <label className="input-label">Maximum Bound:</label>
              <input
                type="number"
                value={vizSettings.maxBound}
                onChange={(e) => handleBoundsChange('maxBound', parseFloat(e.target.value))}
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
