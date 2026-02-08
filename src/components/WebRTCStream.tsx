import React, { useRef, useEffect, useState } from 'react';
import './WebRTCStream.css';

interface WebRTCStreamProps {
  serverUrl?: string;
  onConnectionStateChange?: (state: string) => void;
}

const WebRTCStream: React.FC<WebRTCStreamProps> = ({ 
  serverUrl = 'ws://localhost:8080',
  onConnectionStateChange 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (videoRef.current && peerConnection) {
      // Handle incoming streams
      peerConnection.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
        }
      };
    }
  }, [peerConnection]);

  const connectWebRTC = async () => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      });

      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        setConnectionState(state);
        onConnectionStateChange?.(state);
      };

      pc.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
        }
      };

      setPeerConnection(pc);
      setConnectionState('connecting');
    } catch (error) {
      console.error('Error connecting WebRTC:', error);
      setConnectionState('failed');
    }
  };

  const disconnectWebRTC = () => {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
      setConnectionState('disconnected');
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  return (
    <div className="webrtc-stream">
      <div className="stream-container">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline
          muted
          className="video-element"
        />
        {connectionState === 'disconnected' && (
          <div className="stream-overlay">
            <div className="overlay-content">
              <h3>WebRTC Stream</h3>
              <p>Click Connect to start streaming</p>
            </div>
          </div>
        )}
      </div>
      <div className="stream-controls">
        <button 
          onClick={connectWebRTC} 
          disabled={connectionState !== 'disconnected'}
          className="btn btn-primary"
        >
          Connect
        </button>
        <button 
          onClick={disconnectWebRTC} 
          disabled={connectionState === 'disconnected'}
          className="btn btn-secondary"
        >
          Disconnect
        </button>
        <span className={`status-badge status-${connectionState}`}>
          {connectionState}
        </span>
      </div>
    </div>
  );
};

export default WebRTCStream;
