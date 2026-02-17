import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import kitClient from '../api/kitClient';

const Plotting = ({ plottingVariables, setPlottingVariables, graphsApiRef }) => {
  const [xAxis, setXAxis] = useState('time');
  const [isRecording, setIsRecording] = useState(false);
  const [sampleCount, setSampleCount] = useState(0);
  const [useBackend, setUseBackend] = useState(false);
  const recordedDataRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  // Check backend connection
  useEffect(() => {
    setUseBackend(kitClient.isConnected);

    const onConnected = () => {
      setUseBackend(true);
    };

    const onDisconnected = () => {
      setUseBackend(false);
    };

    kitClient.on('connected', onConnected);
    kitClient.on('disconnected', onDisconnected);

    return () => {
      kitClient.off('connected', onConnected);
      kitClient.off('disconnected', onDisconnected);
    };
  }, []);

  const toggleVariable = (variable) => {
    setPlottingVariables(prev => ({ ...prev, [variable]: !prev[variable] }));
  };

  const startRecording = async () => {
    // Check if at least one variable is selected
    const hasSelectedVariable = Object.values(plottingVariables).some(v => v);
    if (!hasSelectedVariable) {
      alert('Please select at least one Y-axis variable to record.');
      return;
    }

    if (useBackend) {
      // Use backend recording
      try {
        const selectedVariables = Object.keys(plottingVariables).filter(k => plottingVariables[k]);
        await kitClient.startRecording({
          xAxis,
          variables: selectedVariables
        });
        setIsRecording(true);
        setSampleCount(0);
        alert('✅ Recording started on backend');
      } catch (err) {
        alert(`Failed to start recording: ${err.message}`);
        console.error('Failed to start recording:', err);
      }
    } else {
      // Use local recording
      if (!graphsApiRef?.current) {
        alert('Data source not available. Please wait for the application to fully load.');
        return;
      }

      recordedDataRef.current = [];
      setSampleCount(0);
      setIsRecording(true);

      // Start recording samples every 500ms
      recordingIntervalRef.current = setInterval(() => {
        if (graphsApiRef.current) {
          const data = graphsApiRef.current.getCurrentData();
          recordedDataRef.current.push(data);
          setSampleCount(prev => prev + 1);
        }
      }, 500);
    }
  };

  const stopRecording = async () => {
    if (useBackend) {
      // Stop backend recording and get export
      try {
        const result = await kitClient.stopRecording();
        setIsRecording(false);
        
        if (result.filePath) {
          // Backend saved to a file path
          alert(`✅ Recording saved to: ${result.filePath}\n\nThe file has been saved on the server.`);
        } else if (result.base64) {
          // Backend returned base64 data - download it
          const filename = result.filename || generateTimestampedFilename('OmniCool_Record', 'xlsx');
          downloadBase64File(result.base64, filename);
          alert(`✅ Recording exported! ${result.sampleCount || 'Multiple'} samples captured.`);
        } else {
          alert('✅ Recording stopped on backend');
        }
        
        setSampleCount(result.sampleCount || 0);
      } catch (err) {
        alert(`Failed to stop recording: ${err.message}`);
        console.error('Failed to stop recording:', err);
        setIsRecording(false);
      }
    } else {
      // Stop local recording
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      setIsRecording(false);

      if (recordedDataRef.current.length === 0) {
        alert('No data recorded. Please start recording first.');
        return;
      }

      // Export to XLSX
      await exportToXLSX(recordedDataRef.current);
    }
  };

  const generateTimestampedFilename = (prefix, extension) => {
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/:/g, '-')
      .replace(/\..+/, '')
      .replace('T', '_');
    return `${prefix}_${timestamp}.${extension}`;
  };

  const downloadBase64File = (base64Data, filename) => {
    // Convert base64 to blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToXLSX = async (data) => {
    // Prepare data for Excel
    const rows = data.map(sample => {
      const row = {};
      
      // Add X-axis data
      switch (xAxis) {
        case 'time':
          row['Time [s]'] = sample.time.toFixed(2);
          break;
        case 'iteration':
          row['Iteration'] = sample.iteration;
          break;
        case 'distance':
          row['Distance [m]'] = sample.distance.toFixed(2);
          break;
        default:
          row['Time [s]'] = sample.time.toFixed(2);
      }

      // Add Y-axis data for selected variables
      if (plottingVariables.temperature) {
        row['Temperature [°C]'] = sample.temperature.toFixed(2);
      }
      if (plottingVariables.pressure) {
        row['Pressure [bar]'] = sample.pressure.toFixed(3);
      }
      if (plottingVariables.velocity) {
        row['Velocity [m/s]'] = sample.velocity.toFixed(2);
      }
      if (plottingVariables.power) {
        row['Power [kW]'] = sample.power.toFixed(2);
      }
      if (plottingVariables.humidity) {
        row['Humidity [%]'] = sample.humidity.toFixed(1);
      }

      return row;
    });

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Recording');

    // Generate filename with timestamp
    const filename = generateTimestampedFilename('omnicool_recording', 'xlsx');

    // Try File System Access API first (modern browsers)
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'Excel Workbook',
            accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
          }]
        });

        const writable = await handle.createWritable();
        const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        await writable.write(buffer);
        await writable.close();

        alert(`Recording saved successfully! ${recordedDataRef.current.length} samples exported.`);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error saving file:', err);
          // Fallback to browser download
          fallbackDownload(workbook, filename);
        }
      }
    } else {
      // Fallback for older browsers
      fallbackDownload(workbook, filename);
    }
  };

  const fallbackDownload = (workbook, filename) => {
    XLSX.writeFile(workbook, filename);
    alert(`Recording downloaded! ${recordedDataRef.current.length} samples exported.`);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  return (
    <div>
      <div className="collapsible">
        <div className="collapsible-header">
          <span className="collapsible-title">Y-Axis Variables</span>
          <span className="collapsible-icon expanded">▼</span>
        </div>
        <div className="collapsible-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={plottingVariables.temperature}
                onChange={() => toggleVariable('temperature')}
                disabled={isRecording}
              />
              <span>Temperature [°C]</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={plottingVariables.pressure}
                onChange={() => toggleVariable('pressure')}
                disabled={isRecording}
              />
              <span>Pressure [bar]</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={plottingVariables.velocity}
                onChange={() => toggleVariable('velocity')}
                disabled={isRecording}
              />
              <span>Velocity [m/s]</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={plottingVariables.power}
                onChange={() => toggleVariable('power')}
                disabled={isRecording}
              />
              <span>Power Consumption [kW]</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={plottingVariables.humidity}
                onChange={() => toggleVariable('humidity')}
                disabled={isRecording}
              />
              <span>Humidity [%]</span>
            </label>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">X-Axis Selection</h2>
        <div className="input-row">
          <label className="input-label">X-Axis Variable:</label>
          <select 
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value)}
            style={{ flex: 1 }}
            disabled={isRecording}
          >
            <option value="time">Time [s]</option>
            <option value="iteration">Iteration Number</option>
            <option value="distance">Distance [m]</option>
          </select>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Data Recorder</h2>
        
        {isRecording && (
          <div style={{
            background: 'rgba(134, 239, 71, 0.1)',
            border: '1px solid rgba(134, 239, 71, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ color: 'var(--success-green)', fontSize: '20px' }}>●</span>
            <span style={{ color: 'var(--success-green)', fontWeight: 600 }}>
              Recording in progress...
            </span>
            <span style={{ 
              marginLeft: 'auto',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontWeight: 600
            }}>
              {sampleCount} samples
            </span>
          </div>
        )}

        <div className="button-group">
          {!isRecording ? (
            <button 
              className="success" 
              onClick={startRecording}
            >
              ▶ Start Recording
            </button>
          ) : (
            <button 
              className="warning" 
              onClick={stopRecording}
            >
              ■ Stop Recording & Export
            </button>
          )}
        </div>

        {!isRecording && sampleCount > 0 && (
          <div style={{
            marginTop: '12px',
            color: 'var(--text-secondary)',
            fontSize: '13px'
          }}>
            Last recording: {sampleCount} samples captured
          </div>
        )}
      </div>

      {!isRecording && (
        <div className="warning-message">
          ℹ️ Select variables and click "Start Recording" to begin capturing live data. 
          The recording will include all selected Y-axis variables sampled at 2 Hz (500ms intervals).
          When you stop, an Excel file will be exported with the format: omnicool_recording_YYYY-MM-DD_HH-mm-ss.xlsx
        </div>
      )}
    </div>
  );
};

export default Plotting;
