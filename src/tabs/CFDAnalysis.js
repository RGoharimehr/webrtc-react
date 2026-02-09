import React, { useState } from 'react';

const CFDAnalysis = () => {
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

  return (
    <div>
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
                onChange={(e) => setFluentSettings({...fluentSettings, ambientTemp: e.target.value})}
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
                onChange={(e) => setFluentSettings({...fluentSettings, deltaTemp: e.target.value})}
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
                onChange={(e) => setFluentSettings({...fluentSettings, fanRPM: e.target.value})}
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
                onChange={(e) => setSimaiSettings({...simaiSettings, prediction: e.target.value})}
                style={{ flex: 1 }}
              >
                <option value="latest">Latest Prediction</option>
                <option value="pred_001">Prediction 001</option>
                <option value="pred_002">Prediction 002</option>
                <option value="pred_003">Prediction 003</option>
              </select>
            </div>

            <button className="primary" style={{ marginTop: '12px', marginBottom: '24px' }}>
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
                  onChange={(e) => setSimaiSettings({...simaiSettings, ambientTemp: parseInt(e.target.value)})}
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
                  onChange={(e) => setSimaiSettings({...simaiSettings, deltaTemp: parseInt(e.target.value)})}
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
                  onChange={(e) => setSimaiSettings({...simaiSettings, fanVelocity: parseInt(e.target.value)})}
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
                  onChange={(e) => setSimaiSettings({...simaiSettings, heatLoad: parseInt(e.target.value)})}
                />
                <span className="value-display">{simaiSettings.heatLoad}</span>
              </div>
            </div>

            <button className="success" style={{ marginTop: '24px', width: '100%' }}>
              Generate Prediction
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CFDAnalysis;
