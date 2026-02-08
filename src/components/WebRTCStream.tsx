import React, { useRef, useState } from 'react';
import './WebRTCStream.css';

interface WebRTCStreamProps {
  serverUrl?: string;
  onConnectionStateChange?: (state: string) => void;
}

const WebRTCStream: React.FC<WebRTCStreamProps> = ({ 
  onConnectionStateChange 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraState, setCameraState] = useState<string>('inactive');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  const startCamera = async () => {
    try {
      setCameraState('requesting');
      setError('');
      onConnectionStateChange?.('requesting');

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      // Set the stream to the video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setMediaStream(stream);
      setCameraState('active');
      onConnectionStateChange?.('active');
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      let errorMessage = 'Failed to access camera';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Camera permission denied';
        setCameraState('denied');
        onConnectionStateChange?.('denied');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera found';
        setCameraState('not-found');
        onConnectionStateChange?.('not-found');
      } else {
        setCameraState('error');
        onConnectionStateChange?.('error');
      }
      
      setError(errorMessage);
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      // Stop all tracks
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraState('inactive');
    setError('');
    onConnectionStateChange?.('inactive');
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
        {cameraState === 'inactive' && !error && (
          <div className="stream-overlay">
            <div className="overlay-content">
              <h3>📹 Camera View</h3>
              <p>Click Start Camera to view your webcam</p>
            </div>
          </div>
        )}
        {error && (
          <div className="stream-overlay">
            <div className="overlay-content">
              <h3>⚠️ Camera Error</h3>
              <p>{error}</p>
              {cameraState === 'denied' && (
                <p style={{ fontSize: '11px', marginTop: '8px', color: '#bf8700' }}>
                  Please allow camera access in your browser settings
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="stream-controls">
        <button 
          onClick={startCamera} 
          disabled={cameraState === 'active' || cameraState === 'requesting'}
          className="btn btn-primary"
        >
          {cameraState === 'requesting' ? 'Requesting...' : 'Start Camera'}
        </button>
        <button 
          onClick={stopCamera} 
          disabled={cameraState !== 'active'}
          className="btn btn-secondary"
        >
          Stop Camera
        </button>
        <span className={`status-badge status-${cameraState}`}>
          {cameraState === 'active' ? '🟢 active' : 
           cameraState === 'requesting' ? '🟡 requesting' :
           cameraState === 'denied' ? '🔴 denied' :
           cameraState === 'not-found' ? '🔴 no camera' :
           cameraState === 'error' ? '🔴 error' : '⚪ inactive'}
        </span>
      </div>
    </div>
  );
};

export default WebRTCStream;
