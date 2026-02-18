# WebRTC React - Data Center Monitoring Dashboard

A modern React application for data center monitoring with WebRTC screen sharing, live metrics visualization, and data recording capabilities.

## Implementation

### Prerequisites

- Node.js 14 or higher
- npm (comes with Node.js)
- Chromium browser (for WebRTC support)

### Installation

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

### Project Structure

```
webrtc-react/
├── public/          # Static files
├── src/             # Source code
│   ├── components/  # React components
│   │   ├── AppStream.js          # Omniverse stream handler
│   │   └── ...
│   ├── tabs/        # Tab components
│   ├── lib/         # Libraries
│   │   └── omniverse-webrtc-stub.js  # Stub for development
│   ├── App.js       # Main application
│   └── App.css      # Styles
├── stream.config.json  # Omniverse streaming configuration
├── package.json     # Dependencies
└── README.md        # This file
```

### Running the Application

Start the development server:

```bash
npm start
```

The application will open at `http://localhost:3000`

### Available Scripts

- **`npm start`** - Run the app in development mode
- **`npm test`** - Launch the test runner
- **`npm run build`** - Build the app for production
- **`npm run verify`** - Verify setup and diagnose issues

### Omniverse Streaming Setup

This application uses the NVIDIA Omniverse WebRTC Streaming Library for real-time 3D streaming.

**Important:** Omniverse streaming and Flownex backend are **separate systems**.

- **Omniverse:** Frontend WebRTC video streaming
- **Flownex:** Backend Python API bridge (independent)

#### Configuration

1. **Configure streaming:**
   Edit `stream.config.json` with your Omniverse Kit server address:
   ```json
   {
       "source": "local",
       "local": {
           "server": "127.0.0.1",
           "signalingPort": 49100,
           "mediaPort": null
       }
   }
   ```

2. **Start Omniverse Kit:**
   - Launch Omniverse Kit application
   - Enable WebRTC streaming extension
   - Note the IP and port (default: 127.0.0.1:49100)

3. **Start the app:**
   ```bash
   npm start
   ```

4. **Connect:**
   - Click "Connect Omniverse Stream"
   - Video feed will appear when connected

#### Using Real NVIDIA Library (Production)

To use the real NVIDIA Omniverse library instead of the stub:

1. Ensure you have access to NVIDIA's npm registry
2. Install the library:
   ```bash
   npm install @nvidia/omniverse-webrtc-streaming-library
   ```

3. Update import in `src/components/AppStream.js`:
   ```javascript
   // Change from:
   import { AppStreamer } from '../lib/omniverse-webrtc-stub';
   
   // To:
   import { AppStreamer } from '@nvidia/omniverse-webrtc-streaming-library';
   ```

## Debugging

### Verification Script

Run the setup verification script to diagnose your installation:

```bash
npm run verify
```

or directly:

```bash
node verify-setup.js
```

This script will check your setup and provide specific recommendations.

### Common Debugging Steps

1. **Check browser console** for JavaScript errors
2. **Check Network tab** for failed requests
3. **Verify streaming configuration** in `stream.config.json`
4. **Test with unmodified code** to isolate custom changes
5. **Check Omniverse Kit logs** if using real streaming

### Source Map Warnings

If you see warnings like:
```
Failed to parse source map from 'inputplaybackworker.js.map'
```

**Solution:** Already fixed in `.env` with `GENERATE_SOURCEMAP=false`

This is a known issue with the NVIDIA library's missing source map files. The warning doesn't affect functionality - streaming works perfectly.

## Troubleshooting

### Issue 1: 'react-scripts' is not recognized

**Symptom:**
```
'react-scripts' is not recognized as an internal or external command,
operable program or batch file.
```

**Root Cause:** The `react-scripts` package is not installed in your `node_modules` directory.

**Solution:**

1. First, try a simple install:
   ```bash
   npm install
   ```

2. If that doesn't work, check how many packages were installed. You should see something like:
   ```
   added 1293 packages, and audited 1294 packages
   ```
   
   If you see a small number like `audited 49 packages`, continue to the next step.

3. Clean install (removes corrupted cache and files):
   
   **Windows (PowerShell):**
   ```powershell
   Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
   Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
   npm cache clean --force
   npm install
   ```
   
   **Windows (Command Prompt):**
   ```cmd
   rmdir /s /q node_modules
   del package-lock.json
   npm cache clean --force
   npm install
   ```
   
   **macOS/Linux:**
   ```bash
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   ```

4. Verify the installation:
   ```bash
   npm run verify
   ```

### Issue 2: npm install only installs 49 packages

**Symptom:**
After running `npm install`, you see:
```
up to date, audited 49 packages in 923ms
```

**Root Cause:** This usually indicates one of the following:
- Corrupted npm cache
- Incomplete or corrupted `package-lock.json`
- Network/firewall issues
- npm configuration problems

**Solution:**

1. **Complete clean reinstall:**
   
   ```bash
   # Remove everything
   rm -rf node_modules package-lock.json
   
   # Clear npm cache
   npm cache clean --force
   
   # Reinstall
   npm install
   ```

2. **If still not working, update npm:**
   ```bash
   npm install -g npm@latest
   ```

3. **Try with verbose logging to see what's happening:**
   ```bash
   npm install --verbose
   ```

4. **Check npm configuration:**
   ```bash
   npm config list
   ```
   
   Look for any unusual settings. Reset to defaults if needed:
   ```bash
   npm config delete registry
   npm config delete proxy
   npm config delete https-proxy
   ```

### Issue 3: Permission Errors

**Symptom:**
```
EACCES: permission denied
```

**Solution:**

**Windows:**
- Run your terminal (PowerShell or Command Prompt) as Administrator
- Right-click the terminal icon and select "Run as Administrator"

**macOS/Linux:**
- Don't use `sudo` with npm install in your project directory
- Fix npm permissions: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally

### Issue 4: Long Path Names (Windows)

**Symptom:**
```
ENAMETOOLONG: name too long
```

**Solution:**

1. Move your project to a shorter path:
   ```
   Good: C:\projects\webrtc-react
   Bad: C:\Users\YourName\Documents\My Projects\Work\WebRTC\webrtc-react
   ```

2. Enable long paths in Windows (requires Administrator):
   ```powershell
   New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
   ```

### Issue 5: Antivirus Interference

**Symptom:**
- Installation hangs or is very slow
- Random files appear to be missing after installation
- react-scripts exists but can't be executed

**Solution:**

1. Temporarily disable your antivirus during installation
2. Add exclusions for:
   - Your project directory
   - `%APPDATA%\npm`
   - `%APPDATA%\npm-cache`

### Issue 6: Firewall/Proxy Issues

**Symptom:**
- Installation times out
- Cannot reach npm registry
- 404 or connection errors

**Solution:**

1. **Configure npm to use your proxy:**
   ```bash
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```

2. **Or bypass proxy for npm registry:**
   ```bash
   npm config set registry https://registry.npmjs.org/
   npm config set strict-ssl false  # Only if necessary
   ```

### Issue 7: Node.js Version Mismatch

**Symptom:**
```
error: The engine "node" is incompatible with this module
```

**Solution:**

1. Check your Node.js version:
   ```bash
   node --version
   ```

2. Ensure you have Node.js 14 or higher. Download from: https://nodejs.org/

3. If you need multiple Node.js versions, use nvm:
   - Windows: https://github.com/coreybutler/nvm-windows
   - macOS/Linux: https://github.com/nvm-sh/nvm

### Issue 8: Omniverse Stream Connection Problems

**Symptom:**
- "Connect Omniverse Stream" button doesn't work
- Stream never connects
- Connection timeout

**Solution:**

1. **Verify Omniverse Kit is running:**
   - Check that Omniverse Kit application is started
   - Ensure WebRTC streaming extension is enabled
   
2. **Check configuration:**
   - Verify `stream.config.json` has correct server IP and port
   - Default: `127.0.0.1:49100`
   
3. **Check network connectivity:**
   - If streaming from another machine, verify network connectivity
   - Check firewall rules allow WebRTC traffic
   
4. **Using stub mode (development):**
   - The application includes a stub for development
   - Stub mode will show placeholder content instead of real stream
   - This is normal behavior without the NVIDIA library installed

### Verification Checklist

After resolving issues, verify your setup:

- [ ] `node --version` shows 14.x or higher
- [ ] `npm --version` shows a recent version
- [ ] `npm run verify` passes all checks
- [ ] `node_modules/react-scripts` directory exists
- [ ] `npm start` launches the development server
- [ ] Browser opens to http://localhost:3000
- [ ] Application loads without errors

### Still Having Issues?

1. Run the verification script and share the output:
   ```bash
   npm run verify > setup-report.txt
   ```

2. Check the npm error log:
   - Windows: `%APPDATA%\npm-cache\_logs\`
   - macOS/Linux: `~/.npm/_logs/`

3. Provide the following information when seeking help:
   - Node.js version: `node --version`
   - npm version: `npm --version`
   - Operating System
   - Output from `npm run verify`
   - Content of the latest npm error log

4. Create an issue on GitHub with the above information

## License

MIT
