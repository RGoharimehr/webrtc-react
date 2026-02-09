import React, { useState } from 'react';

const GraphsPanel = () => {
  const [graphs] = useState({
    temperature: { enabled: true, value: 68.5, unit: '°C', trend: '+2.3' },
    power: { enabled: true, value: 125.8, unit: 'kW', trend: '-1.2' },
    pressure: { enabled: false, value: 101.3, unit: 'kPa', trend: '+0.5' },
    velocity: { enabled: false, value: 2.4, unit: 'm/s', trend: '+0.1' }
  });

  return (
    <div className="graphs-panel">
      <div className="graphs-panel-header">
        <div className="graphs-panel-title">
          <span>📊</span>
          <span>Live Metrics</span>
        </div>
      </div>
      
      <div className="graphs-panel-content">
        {/* Temperature Graph */}
        {graphs.temperature.enabled && (
          <div className="graph-card">
            <div className="graph-card-title">Temperature Distribution</div>
            <div className="graph-visualization">
              <svg style={{ width: '100%', height: '120px' }}>
                <defs>
                  <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#ff6b6b', stopOpacity: 0.4 }} />
                    <stop offset="100%" style={{ stopColor: '#ff6b6b', stopOpacity: 0.05 }} />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 80 L 20 70 L 40 75 L 60 60 L 80 65 L 100 55 L 120 50 L 140 45 L 160 50 L 180 40 L 200 45 L 220 35 L 240 40 L 260 30 L 280 35"
                  fill="url(#tempGradient)"
                  stroke="#ff6b6b"
                  strokeWidth="2"
                />
                <path
                  d="M 0 80 L 20 70 L 40 75 L 60 60 L 80 65 L 100 55 L 120 50 L 140 45 L 160 50 L 180 40 L 200 45 L 220 35 L 240 40 L 260 30 L 280 35"
                  fill="none"
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
              <svg style={{ width: '100%', height: '120px' }}>
                <defs>
                  <linearGradient id="powerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#86ef47', stopOpacity: 0.4 }} />
                    <stop offset="100%" style={{ stopColor: '#86ef47', stopOpacity: 0.05 }} />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 60 L 20 55 L 40 58 L 60 50 L 80 52 L 100 48 L 120 45 L 140 50 L 160 42 L 180 45 L 200 40 L 220 43 L 240 38 L 260 40 L 280 35"
                  fill="url(#powerGradient)"
                  stroke="#86ef47"
                  strokeWidth="2"
                />
                <path
                  d="M 0 60 L 20 55 L 40 58 L 60 50 L 80 52 L 100 48 L 120 45 L 140 50 L 160 42 L 180 45 L 200 40 L 220 43 L 240 38 L 260 40 L 280 35"
                  fill="none"
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
      </div>
    </div>
  );
};

export default GraphsPanel;
