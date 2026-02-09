import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import OperatingConditions from './tabs/OperatingConditions';
import GeometricalDesign from './tabs/GeometricalDesign';
import ResultsVisualization from './tabs/ResultsVisualization';
import Plotting from './tabs/Plotting';
import Configuration from './tabs/Configuration';
import ResultsMapping from './tabs/ResultsMapping';
import CFDAnalysis from './tabs/CFDAnalysis';

function App() {
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('activeTab') || 'Operating Conditions';
  });
  
  const [screenStream, setScreenStream] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hudExpanded, setHudExpanded] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (videoRef.current && screenStream) {
      videoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  const tabs = [
    'Operating Conditions',
    'Geometrical Design',
    'Results Visualization',
    'Plotting',
    'Configuration',
    'Results Mapping',
    'CFD Analysis'
  ];

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      setScreenStream(stream);
      setIsStreaming(true);

      // Handle user stopping the share via browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.error('Error starting screen share:', error);
      alert('Failed to start screen sharing: ' + error.message);
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setIsStreaming(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Operating Conditions':
        return <OperatingConditions />;
      case 'Geometrical Design':
        return <GeometricalDesign />;
      case 'Results Visualization':
        return <ResultsVisualization />;
      case 'Plotting':
        return <Plotting />;
      case 'Configuration':
        return <Configuration />;
      case 'Results Mapping':
        return <ResultsMapping />;
      case 'CFD Analysis':
        return <CFDAnalysis />;
      default:
        return <OperatingConditions />;
    }
  };

  return (
    <div className="App">
      {/* WebRTC Stream Background */}
      <div className="stream-background">
        {isStreaming ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="stream-video"
          />
        ) : (
          <div className="no-stream-overlay">
            <div className="start-prompt">
              <div className="prompt-icon">🖥️</div>
              <h2>WebRTC Data Center Monitor</h2>
              <p>Start screen sharing to monitor your data center</p>
              <button className="start-stream-button" onClick={startScreenShare}>
                ▶ Start Screen Sharing
              </button>
            </div>
          </div>
        )}
      </div>

      {/* HUD Overlay - Top Right */}
      <div className={`hud-overlay ${hudExpanded ? 'expanded' : 'minimized'}`}>
        <div className="hud-header">
          <div className="hud-title">
            <span className="hud-icon">🏢</span>
            <span>Data Center Control</span>
          </div>
          <div className="hud-controls">
            {isStreaming && (
              <button className="hud-button stop-button" onClick={stopScreenShare} title="Stop Streaming">
                ■
              </button>
            )}
            <button 
              className="hud-button" 
              onClick={() => setHudExpanded(!hudExpanded)}
              title={hudExpanded ? "Minimize" : "Expand"}
            >
              {hudExpanded ? '−' : '+'}
            </button>
          </div>
        </div>
        
        {hudExpanded && (
          <>
            {/* Tab Navigation */}
            <div className="hud-tab-navigation">
              <div className="hud-tab-scroll">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    className={`hud-tab-button ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="hud-content">
              {renderTabContent()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
