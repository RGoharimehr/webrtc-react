import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import TabPanel from './TabPanel';
import ControlPanel from './ControlPanel';

function App() {
  const [screenStream, setScreenStream] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [leftPanelExpanded, setLeftPanelExpanded] = useState(true);
  const [rightPanelExpanded, setRightPanelExpanded] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && screenStream) {
      videoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

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
      let errorMessage = 'Failed to start screen sharing. ';
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Permission denied. Please allow screen sharing access.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No screen sharing source found.';
      } else {
        errorMessage += error.message;
      }
      alert(errorMessage);
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setIsStreaming(false);
    }
  };

  return (
    <div className="App">
      {/* HUD Panels */}
      <TabPanel 
        isExpanded={leftPanelExpanded}
        onToggle={() => setLeftPanelExpanded(!leftPanelExpanded)}
      />
      
      <ControlPanel 
        isExpanded={rightPanelExpanded}
        onToggle={() => setRightPanelExpanded(!rightPanelExpanded)}
      />

      {/* Main Content */}
      <div className="main-content">
        <div className="stream-container">
          {!isStreaming ? (
            <div className="start-screen">
              <div className="start-screen-content">
                <div className="app-icon">🖥️</div>
                <h1>WebRTC Screen Share</h1>
                <p>Share your screen with advanced HUD controls</p>
                <button 
                  className="start-button"
                  onClick={startScreenShare}
                >
                  <span className="button-icon">▶</span>
                  Start Screen Sharing
                </button>
              </div>
            </div>
          ) : (
            <div className="video-display">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="screen-video"
              />
              <div className="video-overlay">
                <div className="stream-indicator">
                  <span className="indicator-dot"></span>
                  <span>Streaming</span>
                </div>
                <button 
                  className="stop-button"
                  onClick={stopScreenShare}
                >
                  <span>■</span>
                  Stop Sharing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
