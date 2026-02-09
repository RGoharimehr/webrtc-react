import React, { useState } from 'react';

const Plotting = ({ plottingVariables, setPlottingVariables }) => {
  const [xAxis, setXAxis] = useState('time');
  const [hasData, setHasData] = useState(false);

  const toggleVariable = (variable) => {
    setPlottingVariables(prev => ({ ...prev, [variable]: !prev[variable] }));
  };

  const addPlot = () => {
    setHasData(true);
  };

  const clearPlots = () => {
    setHasData(false);
    setPlottingVariables({
      temperature: false,
      pressure: false,
      velocity: false,
      power: false,
      humidity: false
    });
  };

  return (
    <div>
      <div className="collapsible">
        <div className="collapsible-header">
          <span className="collapsible-title">Y-Axis Variables</span>
          <span className="collapsible-icon expanded">▼</span>
        </div>
        <div className="collapsible-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={plottingVariables.temperature}
                onChange={() => toggleVariable('temperature')}
              />
              <span>Temperature [°C]</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={plottingVariables.pressure}
                onChange={() => toggleVariable('pressure')}
              />
              <span>Pressure [Pa]</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={plottingVariables.velocity}
                onChange={() => toggleVariable('velocity')}
              />
              <span>Velocity [m/s]</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={plottingVariables.power}
                onChange={() => toggleVariable('power')}
              />
              <span>Power Consumption [kW]</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={plottingVariables.humidity}
                onChange={() => toggleVariable('humidity')}
              />
              <span>Humidity [%]</span>
            </label>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">X-Axis Selection</h2>
        <div className="input-row">
          <label className="input-label">X-Axis Variable:</label>
          <select 
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value)}
            style={{ flex: 1 }}
          >
            <option value="time">Time [s]</option>
            <option value="iteration">Iteration Number</option>
            <option value="distance">Distance [m]</option>
          </select>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Plot Actions</h2>
        <div className="button-group">
          <button className="success" onClick={addPlot}>
            Add Plot
          </button>
          <button className="warning" onClick={clearPlots}>
            Clear All Plots
          </button>
        </div>
      </div>

      {!hasData && (
        <div className="warning-message">
          ⚠️ No simulation data recorded. Run a simulation to generate plot data.
        </div>
      )}

      {hasData && (
        <div className="section">
          <h2 className="section-title">Plot Window</h2>
          <div style={{
            background: '#E6E6E6',
            borderRadius: '8px',
            padding: '20px',
            minHeight: '400px'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '4px',
              padding: '16px',
              marginBottom: '16px',
              border: '1px solid #ccc'
            }}>
              <div style={{ color: '#333', fontWeight: 600, marginBottom: '8px' }}>
                Temperature vs Time
              </div>
              <div style={{
                height: '200px',
                background: 'linear-gradient(to right, rgba(0,122,255,0.1), rgba(0,122,255,0.3))',
                borderRadius: '4px',
                position: 'relative',
                border: '1px solid #ddd'
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '50px',
                  background: 'rgba(0,0,0,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  fontSize: '12px'
                }}>
                  °C
                </div>
                <svg style={{ width: '100%', height: '100%' }}>
                  <line x1="50" y1="20" x2="90%" y2="180" stroke="#0050E0" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {plottingVariables.power && (
              <div style={{
                background: 'white',
                borderRadius: '4px',
                padding: '16px',
                border: '1px solid #ccc'
              }}>
                <div style={{ color: '#333', fontWeight: 600, marginBottom: '8px' }}>
                  Power Consumption vs Time
                </div>
                <div style={{
                  height: '200px',
                  background: 'linear-gradient(to right, rgba(134,239,71,0.1), rgba(134,239,71,0.3))',
                  borderRadius: '4px',
                  position: 'relative',
                  border: '1px solid #ddd'
                }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '50px',
                    background: 'rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666',
                    fontSize: '12px'
                  }}>
                    kW
                  </div>
                  <svg style={{ width: '100%', height: '100%' }}>
                    <line x1="50" y1="100" x2="90%" y2="80" stroke="#86ef47" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Plotting;
