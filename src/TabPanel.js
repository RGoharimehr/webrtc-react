import React, { useState } from 'react';
import './TabPanel.css';

const TabPanel = ({ isExpanded, onToggle }) => {
  const [activeTab, setActiveTab] = useState('Operating Conditions');
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);

  const tabs = [
    'Operating Conditions',
    'Geometrical Design',
    'Results Visualization',
    'Plotting',
    'Configuration',
    'Results Mapping',
    'CFD'
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Operating Conditions':
        return (
          <div className="tab-content">
            <h3>Operating Conditions</h3>
            <div className="input-group">
              <label>Temperature</label>
              <input type="number" placeholder="Enter temperature" />
            </div>
            <div className="input-group">
              <label>Pressure</label>
              <input type="number" placeholder="Enter pressure" />
            </div>
            <div className="input-group">
              <label>Flow Rate</label>
              <input type="number" placeholder="Enter flow rate" />
            </div>
          </div>
        );
      case 'Geometrical Design':
        return (
          <div className="tab-content">
            <h3>Geometrical Design</h3>
            <div className="input-group">
              <label>Diameter</label>
              <input type="number" placeholder="Enter diameter" />
            </div>
            <div className="input-group">
              <label>Length</label>
              <input type="number" placeholder="Enter length" />
            </div>
            <div className="input-group">
              <label>Shape</label>
              <select>
                <option>Circular</option>
                <option>Square</option>
                <option>Rectangular</option>
              </select>
            </div>
          </div>
        );
      case 'Results Visualization':
        return (
          <div className="tab-content">
            <h3>Results Visualization</h3>
            <div className="viz-controls">
              {/* Placeholder buttons - functionality to be implemented */}
              <button className="viz-button">Show Contours</button>
              <button className="viz-button">Show Vectors</button>
              <button className="viz-button">Show Streamlines</button>
            </div>
          </div>
        );
      case 'Plotting':
        return (
          <div className="tab-content">
            <h3>Plotting</h3>
            <div className="plot-controls">
              <label>
                <input type="checkbox" /> Temperature Distribution
              </label>
              <label>
                <input type="checkbox" /> Velocity Profile
              </label>
              <label>
                <input type="checkbox" /> Pressure Map
              </label>
            </div>
          </div>
        );
      case 'Configuration':
        return (
          <div className="tab-content">
            <h3>Configuration</h3>
            <div className="input-group">
              <label>Solver Type</label>
              <select>
                <option>Steady State</option>
                <option>Transient</option>
              </select>
            </div>
            <div className="input-group">
              <label>Turbulence Model</label>
              <select>
                <option>k-epsilon</option>
                <option>k-omega</option>
                <option>LES</option>
              </select>
            </div>
          </div>
        );
      case 'Results Mapping':
        return (
          <div className="tab-content">
            <h3>Results Mapping</h3>
            <div className="mapping-controls">
              {/* Placeholder buttons - functionality to be implemented */}
              <button className="map-button">Export Data</button>
              <button className="map-button">Generate Report</button>
              <button className="map-button">Save Configuration</button>
            </div>
          </div>
        );
      case 'CFD':
        const handleRunSimulation = () => {
          setIsSimulationRunning(true);
          // Simulate progress (in real app, this would be actual simulation progress)
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            setSimulationProgress(progress);
            if (progress >= 100) {
              clearInterval(interval);
              setIsSimulationRunning(false);
            }
          }, 500);
        };

        const handleStopSimulation = () => {
          setIsSimulationRunning(false);
          setSimulationProgress(0);
        };

        return (
          <div className="tab-content">
            <h3>CFD Analysis</h3>
            <div className="cfd-controls">
              <button 
                className="cfd-button" 
                onClick={handleRunSimulation}
                disabled={isSimulationRunning}
              >
                Run Simulation
              </button>
              <button 
                className="cfd-button" 
                onClick={handleStopSimulation}
                disabled={!isSimulationRunning}
              >
                Stop Simulation
              </button>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${simulationProgress}%` }}
                ></div>
              </div>
              {simulationProgress > 0 && (
                <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  {simulationProgress}% Complete
                </div>
              )}
            </div>
          </div>
        );
      default:
        return <div className="tab-content">Select a tab</div>;
    }
  };

  return (
    <div className={`tab-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="panel-header" onClick={onToggle}>
        <div className="panel-title">
          <span className="panel-icon">☰</span>
          <span>Controls</span>
        </div>
        <span className={`expand-icon ${isExpanded ? 'rotated' : ''}`}>▼</span>
      </div>
      
      {isExpanded && (
        <>
          <div className="tab-buttons">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="tab-content-container">
            {renderTabContent()}
          </div>
        </>
      )}
    </div>
  );
};

export default TabPanel;
