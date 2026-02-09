import React, { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [localStream, setLocalStream] = useState(null);
  const localVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setLocalStream(stream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const stopLocalVideo = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>WebRTC React Application</h1>
        <p>Simple WebRTC video streaming with React</p>
      </header>
      <main className="App-main">
        <div className="video-container">
          <div className="video-box">
            <h3>Local Video</h3>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="video-player"
            />
          </div>

        </div>
        <div className="controls">
          <button onClick={startLocalVideo} disabled={localStream !== null}>
            Start Video
          </button>
          <button onClick={stopLocalVideo} disabled={localStream === null}>
            Stop Video
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
