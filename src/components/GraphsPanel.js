import React from 'react';

const GraphsPanel = ({ plottingVariables }) => {
  const graphs = {
    temperature: { enabled: plottingVariables.temperature, value: 68.5, unit: '°C', trend: '+2.3' },
    power: { enabled: plottingVariables.power, value: 125.8, unit: 'kW', trend: '-1.2' },
    pressure: { enabled: plottingVariables.pressure, value: 101.3, unit: 'kPa', trend: '+0.5' },
    velocity: { enabled: plottingVariables.velocity, value: 2.4, unit: 'm/s', trend: '+0.1' },
    humidity: { enabled: plottingVariables.humidity, value: 52, unit: '%', trend: '+1.0' }
  };

  return (
    <div className="graphs-panel-inner">
      <div className="graphs-panel-content">
        {/* Temperature Graph */}
        {graphs.temperature.enabled && (
          <div className="graph-card">
            <div className="graph-card-title">Temperature Distribution</div>
            <div className="graph-visualization">
              <svg style={{ width: '100%', height: '80px' }}>
                <defs>
                  <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#ff6b6b', stopOpacity: 0.4 }} />
                    <stop offset="100%" style={{ stopColor: '#ff6b6b', stopOpacity: 0.05 }} />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 60 L 15 50 L 30 55 L 45 45 L 60 48 L 75 40 L 90 38 L 105 35 L 120 38 L 135 30 L 150 33 L 165 28 L 180 30 L 195 25 L 210 28"
                  fill="url(#tempGradient)"
                  stroke="#ff6b6b"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="graph-metrics">
              <div className="graph-metric">
                <div className="graph-metric-label">Current</div>
                <div className="graph-metric-value">{graphs.temperature.value}{graphs.temperature.unit}</div>
              </div>
              <div className="graph-metric">
                <div className="graph-metric-label">Trend</div>
                <div className="graph-metric-value" style={{ color: graphs.temperature.trend.startsWith('+') ? '#ff6b6b' : '#86ef47' }}>
                  {graphs.temperature.trend}{graphs.temperature.unit}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Power Graph */}
        {graphs.power.enabled && (
          <div className="graph-card">
            <div className="graph-card-title">Power Consumption</div>
            <div className="graph-visualization">
              <svg style={{ width: '100%', height: '80px' }}>
                <defs>
                  <linearGradient id="powerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#86ef47', stopOpacity: 0.4 }} />
                    <stop offset="100%" style={{ stopColor: '#86ef47', stopOpacity: 0.05 }} />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 45 L 15 42 L 30 44 L 45 38 L 60 40 L 75 36 L 90 34 L 105 38 L 120 32 L 135 34 L 150 30 L 165 32 L 180 28 L 195 30 L 210 26"
                  fill="url(#powerGradient)"
                  stroke="#86ef47"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="graph-metrics">
              <div className="graph-metric">
                <div className="graph-metric-label">Current</div>
                <div className="graph-metric-value">{graphs.power.value}{graphs.power.unit}</div>
              </div>
              <div className="graph-metric">
                <div className="graph-metric-label">Trend</div>
                <div className="graph-metric-value" style={{ color: graphs.power.trend.startsWith('-') ? '#86ef47' : '#ff6b6b' }}>
                  {graphs.power.trend}{graphs.power.unit}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pressure Graph */}
        {graphs.pressure.enabled && (
          <div className="graph-card">
            <div className="graph-card-title">Pressure Field</div>
            <div className="graph-visualization">
              <svg style={{ width: '100%', height: '80px' }}>
                <defs>
                  <linearGradient id="pressureGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#0050E0', stopOpacity: 0.4 }} />
                    <stop offset="100%" style={{ stopColor: '#0050E0', stopOpacity: 0.05 }} />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 52 L 15 50 L 30 54 L 45 48 L 60 50 L 75 46 L 90 48 L 105 44 L 120 46 L 135 42 L 150 44 L 165 40 L 180 42 L 195 38 L 210 40"
                  fill="url(#pressureGradient)"
                  stroke="#0050E0"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="graph-metrics">
              <div className="graph-metric">
                <div className="graph-metric-label">Current</div>
                <div className="graph-metric-value">{graphs.pressure.value}{graphs.pressure.unit}</div>
              </div>
              <div className="graph-metric">
                <div className="graph-metric-label">Trend</div>
                <div className="graph-metric-value">{graphs.pressure.trend}{graphs.pressure.unit}</div>
              </div>
            </div>
          </div>
        )}

        {/* Velocity Graph */}
        {graphs.velocity.enabled && (
          <div className="graph-card">
            <div className="graph-card-title">Velocity Field</div>
            <div className="graph-visualization">
              <svg style={{ width: '100%', height: '80px' }}>
                <defs>
                  <linearGradient id="velocityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#00ffff', stopOpacity: 0.4 }} />
                    <stop offset="100%" style={{ stopColor: '#00ffff', stopOpacity: 0.05 }} />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 48 L 15 46 L 30 50 L 45 44 L 60 46 L 75 42 L 90 44 L 105 40 L 120 42 L 135 38 L 150 40 L 165 36 L 180 38 L 195 34 L 210 36"
                  fill="url(#velocityGradient)"
                  stroke="#00ffff"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="graph-metrics">
              <div className="graph-metric">
                <div className="graph-metric-label">Current</div>
                <div className="graph-metric-value">{graphs.velocity.value}{graphs.velocity.unit}</div>
              </div>
              <div className="graph-metric">
                <div className="graph-metric-label">Trend</div>
                <div className="graph-metric-value">{graphs.velocity.trend}{graphs.velocity.unit}</div>
              </div>
            </div>
          </div>
        )}

        {/* Humidity Graph */}
        {graphs.humidity.enabled && (
          <div className="graph-card">
            <div className="graph-card-title">Humidity</div>
            <div className="graph-visualization">
              <svg style={{ width: '100%', height: '80px' }}>
                <defs>
                  <linearGradient id="humidityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#4a9eff', stopOpacity: 0.4 }} />
                    <stop offset="100%" style={{ stopColor: '#4a9eff', stopOpacity: 0.05 }} />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 50 L 15 48 L 30 52 L 45 46 L 60 48 L 75 44 L 90 46 L 105 42 L 120 44 L 135 40 L 150 42 L 165 38 L 180 40 L 195 36 L 210 38"
                  fill="url(#humidityGradient)"
                  stroke="#4a9eff"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="graph-metrics">
              <div className="graph-metric">
                <div className="graph-metric-label">Current</div>
                <div className="graph-metric-value">{graphs.humidity.value}{graphs.humidity.unit}</div>
              </div>
              <div className="graph-metric">
                <div className="graph-metric-label">Trend</div>
                <div className="graph-metric-value">{graphs.humidity.trend}{graphs.humidity.unit}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphsPanel;
