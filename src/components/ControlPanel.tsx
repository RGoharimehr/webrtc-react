import React, { useState } from 'react';
import './ControlPanel.css';

interface ControlPanelProps {
  onParameterChange?: (parameter: string, value: any) => void;
  onSendCommand?: (command: string, params?: any) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  onParameterChange,
  onSendCommand 
}) => {
  const [speed, setSpeed] = useState(50);
  const [rideHeight, setRideHeight] = useState(100);
  const [selectedModel, setSelectedModel] = useState('default');
  const [selectedCamera, setSelectedCamera] = useState('perspective');

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setSpeed(value);
    onParameterChange?.('speed', value);
  };

  const handleRideHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setRideHeight(value);
    onParameterChange?.('rideHeight', value);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedModel(value);
    onParameterChange?.('model', value);
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCamera(value);
    onSendCommand?.('setCamera', { camera: value });
  };

  const handleApplyParameters = () => {
    onSendCommand?.('applyParameters', {
      speed,
      rideHeight,
      model: selectedModel
    });
  };

  const handleResetView = () => {
    onSendCommand?.('resetView', {});
  };

  return (
    <div className="control-panel">
      <div className="panel-header">
        <h2>Control Panel</h2>
        <p>Configure simulation parameters</p>
      </div>

      <div className="panel-content">
        <div className="control-section">
          <h3>Model Selection</h3>
          <div className="control-group">
            <label htmlFor="model-select">Model Type:</label>
            <select 
              id="model-select"
              value={selectedModel} 
              onChange={handleModelChange}
              className="select-input"
            >
              <option value="default">Default Model</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="truck">Truck</option>
              <option value="custom">Custom Model</option>
            </select>
          </div>
        </div>

        <div className="control-section">
          <h3>Simulation Parameters</h3>
          
          <div className="control-group">
            <label htmlFor="speed-slider">
              Speed: <span className="value-display">{speed} km/h</span>
            </label>
            <input
              id="speed-slider"
              type="range"
              min="0"
              max="200"
              value={speed}
              onChange={handleSpeedChange}
              className="slider"
            />
            <div className="slider-markers">
              <span>0</span>
              <span>100</span>
              <span>200</span>
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="height-slider">
              Ride Height: <span className="value-display">{rideHeight} mm</span>
            </label>
            <input
              id="height-slider"
              type="range"
              min="50"
              max="150"
              value={rideHeight}
              onChange={handleRideHeightChange}
              className="slider"
            />
            <div className="slider-markers">
              <span>50</span>
              <span>100</span>
              <span>150</span>
            </div>
          </div>
        </div>

        <div className="control-section">
          <h3>View Settings</h3>
          <div className="control-group">
            <label htmlFor="camera-select">Camera View:</label>
            <select 
              id="camera-select"
              value={selectedCamera} 
              onChange={handleCameraChange}
              className="select-input"
            >
              <option value="perspective">Perspective</option>
              <option value="top">Top View</option>
              <option value="side">Side View</option>
              <option value="front">Front View</option>
              <option value="rear">Rear View</option>
            </select>
          </div>
        </div>

        <div className="control-actions">
          <button 
            onClick={handleApplyParameters}
            className="btn btn-primary btn-large"
          >
            Apply Parameters
          </button>
          <button 
            onClick={handleResetView}
            className="btn btn-secondary btn-large"
          >
            Reset View
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
