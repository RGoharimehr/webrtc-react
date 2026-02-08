# How to View the UI

This guide explains different ways to view and test the Omniverse WebRTC Controller UI.

## Quick Start - Development Mode

To view the UI during development:

```bash
# 1. Install dependencies (first time only)
npm install

# 2. Start the development server
npm start
```

The application will automatically open in your browser at:
- **Local:** http://localhost:3000
- **Network:** http://YOUR_IP:3000 (accessible from other devices on your network)

The development server includes:
- ✅ Hot reload (changes appear instantly)
- ✅ Error messages in browser
- ✅ React DevTools support

## Production Build

To see how the UI looks in production:

```bash
# Build the optimized production version
npm run build

# Install a static server (first time only)
npm install -g serve

# Serve the production build
serve -s build
```

The production build will be available at http://localhost:3000

## Screenshots

### Full UI Layout

![Omniverse WebRTC Controller](https://github.com/user-attachments/assets/a69e9717-ef04-4a6d-a49f-b2d6d385c917)

### UI Components

The interface includes:

1. **Header Bar** (Top)
   - Application title: "OMNIVERSE WEBRTC CONTROLLER"
   - Connection status indicator (Disconnected/Connected)

2. **Control Panel** (Left Sidebar - Green)
   - Model Selection dropdown
   - Speed slider (0-200 km/h)
   - Ride Height slider (50-150 mm)
   - Camera View selector
   - Apply Parameters and Reset View buttons

3. **WebRTC Stream** (Center Top - Black)
   - Video display area
   - Connect/Disconnect buttons
   - Connection status badge

4. **Status Dashboard** (Center Bottom - Green)
   - Connection status card
   - Uptime timer
   - FPS, Bitrate, and Latency metrics
   - Protocol information
   - System information panel

5. **Command Panel** (Right Sidebar - Dark)
   - Available commands:
     - Start Simulation
     - Stop Simulation
     - Reset Scene
     - Capture Frame
     - Set Quality
     - Toggle Grid
     - Set Lighting
   - Command History section

6. **Footer** (Bottom)
   - Application information

## Testing Different Views

### Desktop View (Default)
Three-column layout with all panels visible side-by-side.

### Tablet View
To test tablet view, resize your browser window to approximately 768px - 1200px width.
The layout will adapt to a single-column stacked view.

### Mobile View
To test mobile view, resize your browser window to less than 768px width.
Use browser DevTools (F12) and select "Toggle Device Toolbar" for mobile emulation.

## Browser Developer Tools

For detailed inspection:

1. Open browser DevTools: `F12` or `Right-click → Inspect`
2. Test different screen sizes: Click the device icon or press `Ctrl+Shift+M`
3. Test different devices: Select from the device dropdown
4. Check console: View any errors or logs in the Console tab

## Testing Interactive Features

### Without Backend Connection

Even without an Omniverse backend, you can test:
- ✅ Slider interactions (speed, ride height)
- ✅ Dropdown selections (model, camera view)
- ✅ Button states (enabled/disabled based on connection)
- ✅ Responsive layout (resize browser window)

### With Backend Connection

To fully test WebRTC streaming:
1. Set up an Omniverse Kit server with WebRTC streaming
2. Update the server URL in `src/App.tsx`
3. Click "Connect" to establish WebRTC connection
4. Test video streaming and command sending

## Quick Commands

```bash
# View UI in development mode
npm start

# Build and view production version
npm run build && serve -s build

# Check for issues
npm run build  # Should complete without errors

# Stop development server
# Press Ctrl+C in the terminal where npm start is running
```

## Viewing on Mobile Devices

To view the UI on your phone/tablet:

1. Start the development server on your computer:
   ```bash
   npm start
   ```

2. Find your computer's IP address:
   - Look in the terminal output: "On Your Network: http://YOUR_IP:3000"
   - Or run: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

3. On your mobile device:
   - Connect to the same WiFi network
   - Open browser and go to: `http://YOUR_IP:3000`

## Troubleshooting

### UI Not Loading
- Check if `node_modules` exists: `ls node_modules`
- If not, run: `npm install`
- Restart the server: `npm start`

### Port 3000 Already in Use
- Kill the process: `lsof -ti:3000 | xargs kill -9` (Mac/Linux)
- Or use a different port: `PORT=3001 npm start`

### Changes Not Appearing
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Clear cache: Browser DevTools → Network tab → "Disable cache"
- Restart server: Stop with `Ctrl+C`, then run `npm start` again

## Next Steps

- See `docs/USAGE.md` for integration with Omniverse
- See `docs/ARCHITECTURE.md` for technical details
- See `README.md` for feature overview
