import React, { useState } from 'react';
import './App.css';
import WebRTCStream from './components/WebRTCStream';
import ControlPanel from './components/ControlPanel';
import CommandPanel from './components/CommandPanel';
import StatusDashboard from './components/StatusDashboard';

function App() {
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [streamStats] = useState({
    fps: 60,
    bitrate: 5000,
    latency: 15
  });

  const handleConnectionStateChange = (state: string) => {
    setConnectionState(state);
    console.log('Connection state changed:', state);
  };

  const handleParameterChange = (parameter: string, value: any) => {
    console.log('Parameter changed:', parameter, value);
    // Here you would send the parameter change to Omniverse via WebRTC data channel
  };

  const handleSendCommand = (command: string, params?: any) => {
    console.log('Sending command:', command, params);
    // Here you would send the command to Omniverse via WebRTC data channel
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>Omniverse WebRTC Controller</h1>
            <p className="tagline">Interactive Digital Twin Interface</p>
          </div>
          <div className="header-actions">
            <span className={`connection-indicator ${connectionState}`}>
              <span className="indicator-dot"></span>
              {connectionState}
            </span>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="layout-grid">
          {/* Left Panel - Controls */}
          <aside className="sidebar sidebar-left">
            <ControlPanel 
              onParameterChange={handleParameterChange}
              onSendCommand={handleSendCommand}
            />
          </aside>

          {/* Center Panel - Video Stream */}
          <section className="main-content">
            <div className="content-section">
              <WebRTCStream 
                onConnectionStateChange={handleConnectionStateChange}
              />
            </div>
            <div className="content-section">
              <StatusDashboard 
                connectionState={connectionState}
                streamStats={streamStats}
              />
            </div>
          </section>

          {/* Right Panel - Commands */}
          <aside className="sidebar sidebar-right">
            <CommandPanel 
              onSendCommand={handleSendCommand}
              isConnected={connectionState === 'connected'}
            />
          </aside>
        </div>
      </main>

      <footer className="app-footer">
        <p>WebRTC-based Omniverse Controller | Powered by React & TypeScript</p>
      </footer>
    </div>
  );
}

export default App;
