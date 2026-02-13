import React, { useState, useRef, useEffect } from 'react';

const OperatingConditions = () => {
  const [params, setParams] = useState({
    ambientTemp: 25,
    deltaTemp: 15,
    fanRPM: 500,
    heatLoad: 125,
    humidity: 50
  });

  const [logs, setLogs] = useState('Ready to start simulation...\n');
  const [isSimulating, setIsSimulating] = useState(false);
  const timerRef = useRef(null);

  const handleParamChange = (param, value) => {
    setParams(prev => ({ ...prev, [param]: value }));
    addLog(`${param} set to ${value}`);
  };

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

  const startSimulation = () => {
    setIsSimulating(true);
    addLog('Starting transient simulation...');
    timerRef.current = setTimeout(() => {
      addLog('Simulation running...');
    }, 1000);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    addLog('Simulation stopped.');
  };

  const loadDefaults = () => {
    setParams({
      ambientTemp: 25,
      deltaTemp: 15,
      fanRPM: 500,
      heatLoad: 125,
      humidity: 50
    });
    addLog('Loaded default values.');
  };

  const solveSteadyState = () => {
    addLog('Solving steady state...');
    timerRef.current = setTimeout(() => {
      addLog('Steady state solution completed.');
    }, 2000);
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
      {/* Dynamic Input Controls */}
      <div className="section">
        <h2 className="section-title">Dynamic Input Parameters</h2>

        <div className="input-row">
          <label className="input-label">Ambient Temperature [°C]:</label>
          <div className="input-control">
            <input
              type="range"
              min="10"
              max="40"
              step="0.5"
              value={params.ambientTemp}
              onChange={(e) => handleParamChange('ambientTemp', parseFloat(e.target.value))}
            />
            <span className="value-display">{params.ambientTemp} °C</span>
          </div>
        </div>

        <div className="input-row">
          <label className="input-label">Delta Temperature [°C]:</label>
          <div className="input-control">
            <input
              type="range"
              min="5"
              max="30"
              step="0.5"
              value={params.deltaTemp}
              onChange={(e) => handleParamChange('deltaTemp', parseFloat(e.target.value))}
            />
            <span className="value-display">{params.deltaTemp} °C</span>
          </div>
        </div>

        <div className="input-row">
          <label className="input-label">Fan RPM [rpm]:</label>
          <div className="input-control">
            <input
              type="range"
              min="100"
              max="1000"
              step="10"
              value={params.fanRPM}
              onChange={(e) => handleParamChange('fanRPM', parseInt(e.target.value))}
            />
            <span className="value-display">{params.fanRPM} rpm</span>
          </div>
        </div>

        <div className="input-row">
          <label className="input-label">Heat Load [kW]:</label>
          <div className="input-control">
            <input
              type="range"
              min="0"
              max="250"
              step="5"
              value={params.heatLoad}
              onChange={(e) => handleParamChange('heatLoad', parseInt(e.target.value))}
            />
            <span className="value-display">{params.heatLoad} kW</span>
          </div>
        </div>

        <div className="input-row">
          <label className="input-label">Humidity [%]:</label>
          <div className="input-control">
            <input
              type="range"
              min="20"
              max="80"
              step="1"
              value={params.humidity}
              onChange={(e) => handleParamChange('humidity', parseInt(e.target.value))}
            />
            <span className="value-display">{params.humidity} %</span>
          </div>
        </div>
      </div>

      {/* Simulation Control Buttons */}
      <div className="section">
        <h2 className="section-title">Simulation Control</h2>
        <div className="button-group">
          {!isSimulating ? (
            <button className="primary" onClick={startSimulation}>
              Start Transient Simulation
            </button>
          ) : (
            <button className="warning" onClick={stopSimulation}>
              Stop Transient Simulation
            </button>
          )}
          <button onClick={loadDefaults}>Load Defaults</button>
          <button className="success" onClick={solveSteadyState}>
            Solve Steady State
          </button>
          <button onClick={() => addLog('ANSYS SimAI Prediction requested')}>
            ANSYS SimAI Prediction
          </button>
        </div>

        <div style={{ marginTop: '20px' }}>
          <label className="input-label">Results Category:</label>
          <select style={{ width: '300px', marginLeft: '16px' }}>
            <option>Temperature Distribution</option>
            <option>Pressure Field</option>
            <option>Velocity Vectors</option>
            <option>Energy Consumption</option>
          </select>
        </div>
      </div>

      {/* Logs */}
      <div className="logs-container">
        <div className="logs-title">Simulation Logs</div>
        <textarea className="logs-textarea" value={logs} readOnly />
      </div>
    </div>
  );
};

export default OperatingConditions;
