import React, { useState } from 'react';
import './ControlPanel.css';

const ControlPanel = ({ isExpanded, onToggle }) => {
  const [settings, setSettings] = useState({
    mainCamera: true,
    overlayCamera: false,
    gridView: true,
    annotations: true,
    fps: '60',
    quality: 'high'
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelectChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className={`control-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="panel-header" onClick={onToggle}>
        <div className="panel-title">
          <span className="panel-icon">⚙</span>
          <span>Display</span>
        </div>
        <span className={`expand-icon ${isExpanded ? 'rotated' : ''}`}>▼</span>
      </div>
      
      {isExpanded && (
        <div className="control-content">
          <div className="control-section">
            <h4>Camera Views</h4>
            <div className="toggle-group">
              <label className="toggle-item">
                <input
                  type="checkbox"
                  checked={settings.mainCamera}
                  onChange={() => toggleSetting('mainCamera')}
                />
                <span>Main Camera</span>
              </label>
              <label className="toggle-item">
                <input
                  type="checkbox"
                  checked={settings.overlayCamera}
                  onChange={() => toggleSetting('overlayCamera')}
                />
                <span>Overlay Camera</span>
              </label>
            </div>
          </div>

          <div className="control-section">
            <h4>Visibility</h4>
            <div className="toggle-group">
              <label className="toggle-item">
                <input
                  type="checkbox"
                  checked={settings.gridView}
                  onChange={() => toggleSetting('gridView')}
                />
                <span>Grid View</span>
              </label>
              <label className="toggle-item">
                <input
                  type="checkbox"
                  checked={settings.annotations}
                  onChange={() => toggleSetting('annotations')}
                />
                <span>Annotations</span>
              </label>
            </div>
          </div>

          <div className="control-section">
            <h4>Stream Quality</h4>
            <div className="select-group">
              <label>
                <span>FPS</span>
                <select
                  value={settings.fps}
                  onChange={(e) => handleSelectChange('fps', e.target.value)}
                >
                  <option value="30">30 FPS</option>
                  <option value="60">60 FPS</option>
                  <option value="120">120 FPS</option>
                </select>
              </label>
              <label>
                <span>Quality</span>
                <select
                  value={settings.quality}
                  onChange={(e) => handleSelectChange('quality', e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="ultra">Ultra</option>
                </select>
              </label>
            </div>
          </div>

          <div className="control-section">
            <h4>Quick Actions</h4>
            <div className="action-buttons">
              <button className="action-btn">
                <span>📸</span>
                <span>Screenshot</span>
              </button>
              <button className="action-btn">
                <span>🎥</span>
                <span>Record</span>
              </button>
              <button className="action-btn">
                <span>⚡</span>
                <span>Reset View</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
