import React, { useState } from 'react';
import './CommandPanel.css';

interface CommandPanelProps {
  onSendCommand?: (command: string, params?: any) => void;
  isConnected?: boolean;
}

interface Command {
  name: string;
  label: string;
  description: string;
  params?: string[];
}

const CommandPanel: React.FC<CommandPanelProps> = ({ 
  onSendCommand,
  isConnected = false
}) => {
  const [selectedCommand, setSelectedCommand] = useState('');
  const [commandParams, setCommandParams] = useState<Record<string, string>>({});
  const [commandHistory, setCommandHistory] = useState<Array<{
    command: string;
    timestamp: Date;
    status: 'success' | 'error';
  }>>([]);

  const availableCommands: Command[] = [
    {
      name: 'startSimulation',
      label: 'Start Simulation',
      description: 'Begin the simulation with current parameters'
    },
    {
      name: 'stopSimulation',
      label: 'Stop Simulation',
      description: 'Stop the currently running simulation'
    },
    {
      name: 'resetScene',
      label: 'Reset Scene',
      description: 'Reset the scene to initial state'
    },
    {
      name: 'captureFrame',
      label: 'Capture Frame',
      description: 'Capture current frame as screenshot'
    },
    {
      name: 'setQuality',
      label: 'Set Quality',
      description: 'Adjust rendering quality',
      params: ['quality']
    },
    {
      name: 'toggleGrid',
      label: 'Toggle Grid',
      description: 'Show/hide reference grid'
    },
    {
      name: 'setLighting',
      label: 'Set Lighting',
      description: 'Adjust scene lighting',
      params: ['intensity']
    }
  ];

  const handleCommandSelect = (commandName: string) => {
    setSelectedCommand(commandName);
    setCommandParams({});
  };

  const handleParamChange = (paramName: string, value: string) => {
    setCommandParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleSendCommand = () => {
    if (!selectedCommand) return;

    const command = availableCommands.find(cmd => cmd.name === selectedCommand);
    if (!command) return;

    try {
      onSendCommand?.(selectedCommand, commandParams);
      
      setCommandHistory(prev => [{
        command: command.label,
        timestamp: new Date(),
        status: 'success'
      }, ...prev.slice(0, 9)]);

      setSelectedCommand('');
      setCommandParams({});
    } catch (error) {
      setCommandHistory(prev => [{
        command: command.label,
        timestamp: new Date(),
        status: 'error'
      }, ...prev.slice(0, 9)]);
    }
  };

  const selectedCommandObj = availableCommands.find(cmd => cmd.name === selectedCommand);

  return (
    <div className="command-panel">
      <div className="panel-header">
        <h2>Command Panel</h2>
        <p>Send commands to Omniverse</p>
      </div>

      <div className="panel-content">
        <div className="command-section">
          <h3>Available Commands</h3>
          <div className="command-grid">
            {availableCommands.map((cmd) => (
              <button
                key={cmd.name}
                className={`command-btn ${selectedCommand === cmd.name ? 'selected' : ''}`}
                onClick={() => handleCommandSelect(cmd.name)}
                disabled={!isConnected}
              >
                <div className="command-btn-label">{cmd.label}</div>
                <div className="command-btn-desc">{cmd.description}</div>
              </button>
            ))}
          </div>
        </div>

        {selectedCommandObj && (
          <div className="command-details">
            <h3>Command Details</h3>
            <div className="details-content">
              <p><strong>Command:</strong> {selectedCommandObj.label}</p>
              <p><strong>Description:</strong> {selectedCommandObj.description}</p>
              
              {selectedCommandObj.params && selectedCommandObj.params.length > 0 && (
                <div className="param-inputs">
                  <p><strong>Parameters:</strong></p>
                  {selectedCommandObj.params.map((param) => (
                    <div key={param} className="param-input-group">
                      <label htmlFor={`param-${param}`}>{param}:</label>
                      <input
                        id={`param-${param}`}
                        type="text"
                        value={commandParams[param] || ''}
                        onChange={(e) => handleParamChange(param, e.target.value)}
                        className="param-input"
                        placeholder={`Enter ${param}`}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              <button 
                onClick={handleSendCommand}
                className="btn btn-primary btn-large"
                disabled={!isConnected}
              >
                Send Command
              </button>
            </div>
          </div>
        )}

        <div className="command-history">
          <h3>Command History</h3>
          {commandHistory.length === 0 ? (
            <p className="no-history">No commands sent yet</p>
          ) : (
            <div className="history-list">
              {commandHistory.map((entry, index) => (
                <div key={index} className={`history-item ${entry.status}`}>
                  <span className="history-command">{entry.command}</span>
                  <span className="history-time">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                  <span className={`history-status status-${entry.status}`}>
                    {entry.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPanel;
