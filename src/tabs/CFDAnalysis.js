import React, { useEffect, useState } from 'react';
import AppStream from '../components/AppStream';

const CFDAnalysis = ({ bridge }) => {
  const [fluentExpanded, setFluentExpanded] = useState(true);
  const [simaiExpanded, setSimaiExpanded] = useState(true);

  const [fluentSettings, setFluentSettings] = useState({
    ambientTemp: '25',
    deltaTemp: '15',
    fanRPM: '500'
  });

  const [simaiSettings, setSimaiSettings] = useState({
    prediction: 'latest',
    ambientTemp: 30,
    deltaTemp: 20,
    fanVelocity: 500,
    heatLoad: 125
  });

  const [logs, setLogs] = useState('CFD Analysis ready.\n');

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

  // Map UI keys to bridge input key names (should match Flownex CSV schema keys)
  const FLUENT_KEY_MAP = {
    ambientTemp: 'ambient_temperature',
    deltaTemp:   'delta_temperature',
    fanRPM:      'fan_rpm',
  };

  const SIMAI_KEY_MAP = {
    ambientTemp: 'ambient_temperature',
    deltaTemp:   'delta_temperature',
    fanVelocity: 'fan_velocity',
    heatLoad:    'heat_load',
  };

  const handleFluentChange = (key, value) => {
    setFluentSettings((prev) => ({ ...prev, [key]: value }));
    const bridgeKey = FLUENT_KEY_MAP[key] || key;
    bridge?.setInputValue?.(bridgeKey, Number(value), 'dynamic');
  };

  const handleSimaiSlider = (key, value) => {
    setSimaiSettings((prev) => ({ ...prev, [key]: Number(value) }));
    const bridgeKey = SIMAI_KEY_MAP[key] || key;
    bridge?.setInputValue?.(bridgeKey, Number(value), 'dynamic');
  };

  const handleSimaiSelect = (key, value) => {
    setSimaiSettings((prev) => ({ ...prev, [key]: value }));
  };

  const visualizePrediction = () => {
    addLog(`Visualizing prediction "${simaiSettings.prediction}" in Omniverse viewport…`);
    const msg = JSON.stringify({
      event_type: 'visualize_prediction',
      payload: { prediction: simaiSettings.prediction },
    });
    try {
      AppStream.sendMessage(msg);
    } catch (e) {
      addLog(`Visualize error: ${e.message}`);
    }
  };

  const generatePrediction = () => {
    addLog('Sending prediction request (run steady)…');
    bridge?.runSteady?.();
  };

  return (
    <div>
      {/* ── ANSYS FLUENT ── */}
      <div className="collapsible">
        <div className="collapsible-header" onClick={() => setFluentExpanded(!fluentExpanded)}>
          <span className="collapsible-title">ANSYS FLUENT</span>
          <span className={`collapsible-icon ${fluentExpanded ? 'expanded' : ''}`}>▼</span>
        </div>
        {fluentExpanded && (
          <div className="collapsible-content">
            <div className="input-row">
              <label className="input-label">Ambient Temperature:</label>
              <select
                value={fluentSettings.ambientTemp}
                onChange={(e) => handleFluentChange('ambientTemp', e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="20">20°C</option>
                <option value="25">25°C</option>
                <option value="30">30°C</option>
                <option value="35">35°C</option>
              </select>
            </div>

            <div className="input-row">
              <label className="input-label">Delta Temperature:</label>
              <select
                value={fluentSettings.deltaTemp}
                onChange={(e) => handleFluentChange('deltaTemp', e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="10">10°C</option>
                <option value="15">15°C</option>
                <option value="20">20°C</option>
                <option value="25">25°C</option>
              </select>
            </div>

            <div className="input-row">
              <label className="input-label">Fan RPM:</label>
              <select
                value={fluentSettings.fanRPM}
                onChange={(e) => handleFluentChange('fanRPM', e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="300">300 RPM</option>
                <option value="500">500 RPM</option>
                <option value="700">700 RPM</option>
                <option value="1000">1000 RPM</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── ANSYS SIMAI ── */}
      <div className="collapsible">
        <div className="collapsible-header" onClick={() => setSimaiExpanded(!simaiExpanded)}>
          <span className="collapsible-title">ANSYS SIMAI</span>
          <span className={`collapsible-icon ${simaiExpanded ? 'expanded' : ''}`}>▼</span>
        </div>
        {simaiExpanded && (
          <div className="collapsible-content">
            <div className="input-row">
              <label className="input-label">Predictions:</label>
              <select
                value={simaiSettings.prediction}
                onChange={(e) => handleSimaiSelect('prediction', e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="latest">Latest Prediction</option>
                <option value="pred_001">Prediction 001</option>
                <option value="pred_002">Prediction 002</option>
                <option value="pred_003">Prediction 003</option>
              </select>
            </div>

            <button className="primary" style={{ marginTop: '12px', marginBottom: '24px' }} onClick={visualizePrediction}>
              Visualize Prediction
            </button>

            <div className="input-row">
              <label className="input-label">Ambient Temp. (10-60):</label>
              <div className="input-control">
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={simaiSettings.ambientTemp}
                  onChange={(e) => handleSimaiSlider('ambientTemp', e.target.value)}
                />
                <span className="value-display">{simaiSettings.ambientTemp}</span>
              </div>
            </div>

            <div className="input-row">
              <label className="input-label">Delta Temp. (10-60):</label>
              <div className="input-control">
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={simaiSettings.deltaTemp}
                  onChange={(e) => handleSimaiSlider('deltaTemp', e.target.value)}
                />
                <span className="value-display">{simaiSettings.deltaTemp}</span>
              </div>
            </div>

            <div className="input-row">
              <label className="input-label">Fan velocity RPM (100-1000):</label>
              <div className="input-control">
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="10"
                  value={simaiSettings.fanVelocity}
                  onChange={(e) => handleSimaiSlider('fanVelocity', e.target.value)}
                />
                <span className="value-display">{simaiSettings.fanVelocity}</span>
              </div>
            </div>

            <div className="input-row">
              <label className="input-label">Heat load kW (0-250):</label>
              <div className="input-control">
                <input
                  type="range"
                  min="0"
                  max="250"
                  step="5"
                  value={simaiSettings.heatLoad}
                  onChange={(e) => handleSimaiSlider('heatLoad', e.target.value)}
                />
                <span className="value-display">{simaiSettings.heatLoad}</span>
              </div>
            </div>

            <button className="success" style={{ marginTop: '24px', width: '100%' }} onClick={generatePrediction}>
              Generate Prediction
            </button>
          </div>
        )}
      </div>

      {/* ── Logs ── */}
      <div className="logs-container">
        <div className="logs-title">
          CFD Logs
          <span style={{ float: 'right', fontSize: 11, fontWeight: 400, color: bridge?.connected ? 'var(--success-green)' : 'var(--error-red)' }}>
            {bridge?.connected ? '● Connected' : '● Disconnected'}
          </span>
        </div>
        <textarea className="logs-textarea" style={{ height: '100px' }} value={logs} readOnly />
      </div>
    </div>
  );
};

export default CFDAnalysis;
