import React, { useState, useEffect } from 'react';
import './StatusDashboard.css';

interface StatusDashboardProps {
  connectionState?: string;
  streamStats?: {
    fps?: number;
    bitrate?: number;
    latency?: number;
  };
}

const StatusDashboard: React.FC<StatusDashboardProps> = ({ 
  connectionState = 'disconnected',
  streamStats = {}
}) => {
  const [uptime, setUptime] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      if (connectionState === 'connected') {
        setUptime(Math.floor((Date.now() - startTime) / 1000));
      } else {
        setUptime(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [connectionState, startTime]);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionIcon = () => {
    switch (connectionState) {
      case 'connected':
        return '🟢';
      case 'connecting':
        return '🟡';
      case 'failed':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <div className="status-dashboard">
      <div className="panel-header">
        <h2>Status Dashboard</h2>
        <p>Real-time connection and streaming metrics</p>
      </div>

      <div className="panel-content">
        <div className="status-grid">
          <div className="status-card">
            <div className="status-card-header">
              <span className="status-icon">{getConnectionIcon()}</span>
              <h3>Connection</h3>
            </div>
            <div className="status-card-body">
              <div className="status-value">{connectionState}</div>
              <div className="status-label">Status</div>
            </div>
          </div>

          <div className="status-card">
            <div className="status-card-header">
              <span className="status-icon">⏱️</span>
              <h3>Uptime</h3>
            </div>
            <div className="status-card-body">
              <div className="status-value">{formatUptime(uptime)}</div>
              <div className="status-label">HH:MM:SS</div>
            </div>
          </div>

          <div className="status-card">
            <div className="status-card-header">
              <span className="status-icon">📊</span>
              <h3>FPS</h3>
            </div>
            <div className="status-card-body">
              <div className="status-value">{streamStats.fps || '0'}</div>
              <div className="status-label">Frames per second</div>
            </div>
          </div>

          <div className="status-card">
            <div className="status-card-header">
              <span className="status-icon">⚡</span>
              <h3>Bitrate</h3>
            </div>
            <div className="status-card-body">
              <div className="status-value">
                {streamStats.bitrate ? `${(streamStats.bitrate / 1000).toFixed(1)}` : '0'}
              </div>
              <div className="status-label">Mbps</div>
            </div>
          </div>

          <div className="status-card">
            <div className="status-card-header">
              <span className="status-icon">🕐</span>
              <h3>Latency</h3>
            </div>
            <div className="status-card-body">
              <div className="status-value">{streamStats.latency || '0'}</div>
              <div className="status-label">ms</div>
            </div>
          </div>

          <div className="status-card">
            <div className="status-card-header">
              <span className="status-icon">🔧</span>
              <h3>Protocol</h3>
            </div>
            <div className="status-card-body">
              <div className="status-value">WebRTC</div>
              <div className="status-label">Transport</div>
            </div>
          </div>
        </div>

        <div className="system-info">
          <h3>System Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Browser:</span>
              <span className="info-value">{navigator.userAgent.split(' ').pop()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Platform:</span>
              <span className="info-value">{navigator.platform}</span>
            </div>
            <div className="info-item">
              <span className="info-label">WebRTC Support:</span>
              <span className="info-value">
                {window.RTCPeerConnection ? '✓ Supported' : '✗ Not Supported'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Session ID:</span>
              <span className="info-value">{Math.random().toString(36).substr(2, 9)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusDashboard;
