# WebRTC React - Data Center Monitoring Dashboard

A modern React application for data center monitoring with WebRTC screen sharing, live metrics visualization, and data recording capabilities. The app connects to an Omniverse Kit extension backend via WebSocket API for real-time simulation control and data streaming.

## Architecture

This React web app acts as a **thin client UI** that communicates with an Omniverse Kit extension backend:

- **WebSocket API** (port 49080): Control/data communication with Kit extension
  - Real-time simulation control (start/stop transient, load steady state)
  - Input parameter management
  - Output data streaming (push updates + polling)
  - Visualization control (property selection, colormap settings)
  - Recording and export functionality
  - Results mapping and project management

- **WebRTC** (ports 49100, 47999): Video streaming only
  - Real-time visualization stream from Omniverse
  - Screen sharing capability

## Prerequisites

- Node.js 14 or higher
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/RGoharimehr/webrtc-react.git
cd webrtc-react
```

2. Install dependencies:
```bash
npm install
```

**Expected output:** Should install ~1300 packages

## Configuration

The application uses environment variables to configure backend connections. Edit `.env` file:

```bash
# WebRTC Signaling Server (for video streaming)
REACT_APP_OV_SIGNAL_HOST=153.104.44.62
REACT_APP_OV_SIGNAL_PORT=49100

# Kit API WebSocket (for control/data)
REACT_APP_KIT_API_HOST=153.104.44.62
REACT_APP_KIT_API_PORT=49080
REACT_APP_KIT_API_PROTO=ws
```

**Note:** Change the host IP address to match your Omniverse Kit extension server.

## Running the Application

Start the development server:

```bash
npm start
```

The application will open at `http://localhost:3000`

## Available Scripts

- **`npm start`** - Run the app in development mode
- **`npm test`** - Launch the test runner
- **`npm run build`** - Build the app for production
- **`npm run verify`** - Verify setup and diagnose issues

## Troubleshooting

### Common Issue: 'react-scripts' is not recognized

If you see this error, run:

```bash
npm install
```

### Installation Issues

If `npm install` only installs ~49 packages instead of ~1300:

**Windows:**
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm cache clean --force
npm install
```

**macOS/Linux:**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Verify Installation

Check that everything is installed correctly:

```bash
npm run verify
```

This will:
- Verify Node.js and npm versions
- Check that all required packages are installed
- Confirm the project structure is correct

### More Help

For detailed troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## Features

### Backend Integration (Kit API)
- **Real-time Simulation Control**
  - Start/stop transient simulations
  - Load steady-state solutions
  - Adjust operating conditions dynamically

- **Live Data Streaming**
  - Real-time metrics (temperature, pressure, velocity, power, humidity)
  - Push updates from backend + polling
  - Auto-reconnection on connection loss

- **Visualization Control**
  - Select property to visualize (temperature, pressure, etc.)
  - Choose colormap presets (jet, rainbow, viridis, etc.)
  - Set custom color bounds

- **Data Recording & Export**
  - Server-side recording with configurable variables
  - Export to Excel (XLSX) format
  - Timestamped filenames
  - Automatic download or save to server path

- **Results Mapping**
  - Apply output mapping to Omniverse prims
  - Import/export project ZIP files

- **Configuration Management**
  - Project file and I/O directory settings
  - Flownex data interval configuration
  - Auto-solve on input change

### Local Mode
The application automatically falls back to local mock data when the backend is not connected, allowing for UI development and testing without requiring the full backend stack.

### WebRTC Streaming
- Connect to Omniverse viewport stream
- Desktop screen sharing capability
- Dual streaming pill indicators (Video + API)


## Project Structure

```
webrtc-react/
├── public/          # Static files
├── src/             # Source code
│   ├── api/         # Backend API client
│   │   └── kitClient.js  # WebSocket client for Kit API
│   ├── components/  # React components
│   │   ├── GraphsPanel.js     # Live metrics display
│   │   └── DraggableResizable.js
│   ├── tabs/        # Tab components
│   │   ├── OperatingConditions.js  # Input parameters & simulation control
│   │   ├── ResultsVisualization.js # Visualization settings
│   │   ├── Plotting.js             # Data recording & export
│   │   ├── ResultsMapping.js       # Output mapping to prims
│   │   ├── Configuration.js        # Backend config management
│   │   ├── GeometricalDesign.js
│   │   └── CFDAnalysis.js
│   ├── App.js       # Main application
│   └── App.css      # Styles
├── .env             # Environment variables (backend connection)
├── package.json     # Dependencies
└── README.md        # This file
```

## Kit API WebSocket Protocol

The React app communicates with the Omniverse Kit extension via WebSocket using a JSON-based protocol.

### Connection
```javascript
import kitClient from './api/kitClient';

// Connect to backend
await kitClient.connect();

// Check connection status
console.log(kitClient.isConnected);

// Disconnect
kitClient.disconnect();
```

### Message Format

**Request:**
```json
{
  "type": "inputs.set",
  "requestId": "req_1_1234567890",
  "payload": { "ambientTemp": 25 }
}
```

**Response (Success):**
```json
{
  "type": "inputs.set.result",
  "requestId": "req_1_1234567890",
  "ok": true,
  "payload": { }
}
```

**Response (Error):**
```json
{
  "type": "inputs.set.result",
  "requestId": "req_1_1234567890",
  "ok": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Invalid parameter value"
  }
}
```

**Push Update:**
```json
{
  "type": "push.outputs",
  "payload": {
    "temperature": 68.5,
    "pressure": 1.35,
    "power": 125.8
  }
}
```

### Available API Methods

#### Connection & Status
```javascript
await kitClient.ping();                    // Ping server
await kitClient.getStatus();               // Get server status
```

#### Inputs & Configuration
```javascript
await kitClient.getInputs();               // Get current inputs
await kitClient.setInputs({ temp: 25 });   // Set inputs
await kitClient.getConfig();               // Get configuration
await kitClient.setConfig({ ... });        // Set configuration
```

#### Simulation Control
```javascript
await kitClient.startTransient();          // Start transient simulation
await kitClient.stopTransient();           // Stop simulation
await kitClient.loadSteadyState();         // Load steady state
```

#### Outputs & Data
```javascript
await kitClient.getOutputs();              // Get current outputs
await kitClient.getHistory({ ... });       // Get history data
await kitClient.clearHistory();            // Clear history buffer

// Subscribe to push updates
kitClient.on('outputs', (data) => {
  console.log('New outputs:', data);
});
```

#### Visualization
```javascript
await kitClient.setVizProperty('temperature');
await kitClient.setVizColormap('viridis', 20, 80);
await kitClient.refreshViz();
await kitClient.getVizOptions();
```

#### Recording
```javascript
await kitClient.startRecording({ xAxis: 'time', variables: ['temp', 'pressure'] });
const result = await kitClient.stopRecording();
// result contains filePath or base64 data
```

#### Mapping
```javascript
await kitClient.applyMapping();
await kitClient.exportZip();               // Returns { filePath: "..." }
await kitClient.importZip('/path/to/file.zip');
```

## License

This project is licensed under an **Academic Use License** - see the [LICENSE](LICENSE) file for details.

### Key Points:
- ✅ **Academic Use ONLY** - Free for educational and non-commercial research purposes
- ❌ **No Commercial Use** - Commercial use is strictly prohibited
- 📝 **Citation Required** - You must cite this work each time you use it

### How to Cite

When using this software in your academic work, please cite it as:

```
RGoharimehr. (2026). WebRTC React - Data Center Monitoring Dashboard. 
GitHub repository. https://github.com/RGoharimehr/webrtc-react
```

**BibTeX entry:**
```bibtex
@software{webrtc_react,
  author = {RGoharimehr},
  title = {WebRTC React - Data Center Monitoring Dashboard},
  year = {2026},
  publisher = {GitHub},
  url = {https://github.com/RGoharimehr/webrtc-react}
}
```

For commercial use inquiries, please contact the repository owner.
