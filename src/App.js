import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    sessionStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const tabs = [
    'Operating Conditions',
    'Geometrical Design',
    'Results Visualization',
    'Plotting',
    'Configuration',
    'Results Mapping',
    'CFD Analysis'
  ];

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
      {/* Header Section */}
      <header className="app-header">
        <div className="logo-banner">
          <div className="logo-placeholder">
            <span className="logo-icon">🏢</span>
            <span className="logo-text">Data Center Monitor</span>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <div className="tab-scroll-container">
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
        </div>
      </header>

      {/* Tab Content */}
      <main className="tab-content">
        {renderTabContent()}
      </main>
    </div>
  );
}

export default App;
