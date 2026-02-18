# WebRTC React - Data Center Monitoring Dashboard

A modern React application for data center monitoring with WebRTC screen sharing, live metrics visualization, and data recording capabilities.

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

## Omniverse Streaming (REAL - Not Stub)

This application uses the **REAL** NVIDIA Omniverse WebRTC Streaming Library.

**Important:** Omniverse streaming and Flownex backend are **separate systems**.

- **Omniverse:** Frontend WebRTC video streaming (REAL library)
- **Flownex:** Backend Python API bridge (can be stub or real, independent)

### Setup for Omniverse Streaming

1. **Ensure library is installed:**
   ```bash
   # Library should be in node_modules/@nvidia/omniverse-webrtc-streaming-library/
   # With dist/ folder containing built files
   ```

2. **Configure streaming:**
   Edit `stream.config.json` with your Omniverse Kit server address

3. **Start Omniverse Kit:**
   - Launch Omniverse Kit application
   - Enable WebRTC streaming extension
   - Note the IP and port (default: 127.0.0.1:49100)

4. **Start the app:**
   ```bash
   npm start
   ```

5. **Connect:**
   - Click "Connect Omniverse Stream"
   - Real video feed will appear

**For detailed setup:** See [OMNIVERSE_REAL_LIBRARY.md](OMNIVERSE_REAL_LIBRARY.md)

## Troubleshooting

### Webpack Source Map Warnings

If you see warnings like:
```
Failed to parse source map from 'inputplaybackworker.js.map'
```

**Solution:** Already fixed in `.env` with `GENERATE_SOURCEMAP=false`

This is a known issue with the NVIDIA library's missing source map files. The warning doesn't affect functionality - streaming works perfectly.

**Details:** See [FIX_SOURCE_MAP_WARNINGS.md](FIX_SOURCE_MAP_WARNINGS.md)

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

## Project Structure

```
webrtc-react/
├── public/          # Static files
├── src/             # Source code
│   ├── components/  # React components
│   ├── tabs/        # Tab components
│   ├── App.js       # Main application
│   └── App.css      # Styles
├── package.json     # Dependencies
└── README.md        # This file
```

## License

MIT
