# kit-cae Web UI

**Frontend Web Application for NVIDIA Omniverse kit-cae Extension**

A modern React-based web interface for the NVIDIA Omniverse kit-cae (Computer-Aided Engineering) extension. This application provides data center monitoring with WebRTC screen sharing, live metrics visualization, and data recording capabilities.

> **Note:** This webapp is designed to work with the [NVIDIA-Omniverse/kit-cae](https://github.com/NVIDIA-Omniverse/kit-cae) extension. For integration instructions, see [INTEGRATION.md](INTEGRATION.md).

## Architecture

This React web app acts as a **thin client UI** that communicates with the kit-cae Omniverse Kit extension backend:

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
- NVIDIA Omniverse kit-cae extension running with WebSocket API enabled

## Installation

### Standalone Installation

1. Clone the repository:
```bash
git clone https://github.com/RGoharimehr/webrtc-react.git
cd webrtc-react
```

### Installation within kit-cae Repository

If you're integrating this webapp into the kit-cae repository, see [INTEGRATION.md](INTEGRATION.md) for detailed instructions.

For development within kit-cae:
```bash
cd kit-cae/webapp  # Assuming webapp is in kit-cae/webapp/
npm install
```

2. Install dependencies:
```bash
npm install
```

**Expected output:** Should install ~1300 packages

## Configuration

### Backend Connection

This webapp connects to the NVIDIA Omniverse kit-cae extension backend. The kit-cae extension must implement the WebSocket API protocol as documented below.

The application uses environment variables to configure backend connections. Edit `.env` file:

```bash
# Kit CAE Extension Backend (WebSocket API for control/data)
REACT_APP_KIT_API_HOST=localhost
REACT_APP_KIT_API_PORT=49080
REACT_APP_KIT_API_PROTO=ws

# WebRTC Signaling Server (for video streaming from Omniverse)
REACT_APP_OV_SIGNAL_HOST=localhost
REACT_APP_OV_SIGNAL_PORT=49100
```

**Configuration Options:**

- For **local development**: Use `localhost`
- For **remote kit-cae server**: Use the server's IP address (e.g., `192.168.1.100`)
- For **production deployment**: Use the production server hostname or IP

**Note:** The kit-cae extension must be running with the WebSocket server enabled on the specified ports.

## Running the Application

Start the development server:

```bash
npm start
```

The application will open at `http://localhost:3000`

### Connecting to kit-cae Backend

1. **Start the kit-cae extension** with WebSocket server enabled:
   ```bash
   # In the kit-cae repository
   ./omni.sh --ext-folder exts --enable omni.cdu.physics
   ```

2. **Start the webapp** (in a separate terminal):
   ```bash
   npm start
   ```

3. **Connect in the browser:**
   - Open http://localhost:3000
   - Click the "CONNECT" button in the Dashboard Control panel
   - You should see "KIT API" status change to connected

**Troubleshooting Connection:**
- Ensure kit-cae extension WebSocket server is running on port 49080
- Check firewall settings allow connections on ports 49080 and 49100
- Verify the `.env` configuration matches your backend setup

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
