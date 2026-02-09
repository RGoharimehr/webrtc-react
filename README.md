# WebRTC React - Data Center Monitoring Dashboard with HUD Overlay

A modern data center monitoring and control dashboard with WebRTC screen sharing and an industrial dark theme HUD overlay built with React.

![HUD Overlay Expanded](https://github.com/user-attachments/assets/59fedd2c-a2f7-4143-9982-bffd54652f58)

## Features

🖥️ **Full-Screen WebRTC Streaming**
- Share entire screen or specific windows
- High-quality video streaming with audio capture
- Stream fills the entire window as background
- Start/stop controls integrated into HUD

🎮 **Compact HUD Overlay**
- Floating control panel in top-right corner
- Minimize/expand functionality (+ / - buttons)
- Semi-transparent with backdrop blur effect
- Stays on top of the video stream
- All controls accessible without blocking the stream

🏢 **Data Center Monitoring Theme**
- Dark industrial theme (#1a1a1a, #2d2d2d, #363636)
- Lime green accent color (#86ef47) for emphasis
- Modern, clean typography
- Compact design optimized for overlay display

📊 **7 Functional Control Tabs**

### 1. Operating Conditions
- **Key Metrics Display**: PUE, Maximum Case Temperature, Condenser Pressure
- **Dynamic Parameters**: Ambient Temperature, Delta Temperature, Fan RPM, Heat Load, Humidity
- **Simulation Controls**: Start/Stop Transient, Solve Steady State, ANSYS SimAI Prediction
- **Real-time Logs**: Track all parameter changes and simulation events

### 2. Geometrical Design
- **Geometric Parameters**: Server dimensions, aisle width, ceiling height, rack count
- **Layout Configuration**: Rack arrangement types, floor type selection
- **Static Input Controls**: Sliders for precise dimensional adjustments

### 3. Results Visualization
- **Property Selection**: Temperature, Pressure, Velocity, Humidity
- **Colormap Options**: Jet, Rainbow, Hot, Cool, Viridis
- **Manual Bounds**: Optional min/max value controls
- **Color Legend**: Dynamic gradient display with bound values

### 4. Plotting
- **Y-Axis Variables**: Temperature, Pressure, Velocity, Power, Humidity
- **X-Axis Selection**: Time, Iteration, Distance
- **Plot Management**: Add plots, clear all plots
- **Visual Feedback**: Warning message when no data available
- **Plot Display**: Light-themed plot area with gridlines and legends

### 5. Configuration
- **Flownex Integration**: Project file and IO directory selection
- **Auto-solve Option**: Solve on input change
- **Data Interval**: Adjustable from 0.25s to 1.5s
- **API Testing**: Open/close project, connection status

### 6. Results Mapping
- **Workflow Sections**: Three numbered workflow steps
- **Prim Override**: Target path configuration
- **Config Generation**: One-click mapping file creation
- **Project I/O**: Import and export functionality

### 7. CFD Analysis
- **ANSYS FLUENT**: Ambient temp, delta temp, fan RPM dropdowns
- **ANSYS SimAI**: 
  - Prediction selection and visualization
  - Parameter sliders: Ambient (10-60), Delta (10-60), Fan RPM (100-1000), Heat Load (0-250kW)
  - Generate prediction button

## Technical Features

✅ **State Management**
- Session storage for tab persistence
- Local state management with React hooks
- Real-time parameter updates

✅ **User Interface**
- Collapsible sections for space efficiency
- Color-coded status indicators
- Disabled state handling
- Smooth tab transitions
- Real-time value displays on sliders

✅ **Responsive Design**
- Fixed header with scrollable content
- Adaptive layouts
- Minimum width: 1024px recommended

## Prerequisites

- Node.js (version 14 or higher)
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

## Running the Application

To start the development server:

```bash
npm start
```

This will:
- Start the development server
- Open the application in your default browser at `http://localhost:3000`

## Usage

1. **Start Screen Sharing**
   - Click the "▶ Start Screen Sharing" button in the center
   - Select the screen or window you want to share
   - Click "Share" in the browser dialog
   - Your screen will fill the entire window

2. **Use the HUD Controls**
   - HUD panel appears in the top-right corner
   - Click tabs to switch between different control sections
   - Use the "−" button to minimize the HUD to just the title bar
   - Use the "+" button to expand the HUD again
   - Click the "■" button to stop screen sharing

3. **Adjust Parameters**
   - All controls work the same as before, just in compact form
   - Sliders show real-time values
   - Dropdowns for discrete selections
   - Logs track all operations

4. **HUD States**
   - **Expanded**: 420px width, shows all controls and tabs
   - **Minimized**: 280px width, shows only title bar
   - **Semi-transparent**: 95% opacity with backdrop blur for visibility over the stream

## Color Coding

- **Lime Green (#86ef47)**: Valid values, active states, section titles
- **Blue (#0050E0)**: Active tab, primary actions
- **Red (#ff3333)**: Invalid values, errors, N/A states
- **Yellow (#ffcc00)**: Warnings, alerts

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.  
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.  
It correctly bundles React in production mode and optimizes the build for the best performance.

## Troubleshooting

For detailed troubleshooting steps, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

### Setup Verification

Run the setup verification script to diagnose any issues:

```bash
node verify-setup.js
```

This will check your installation and provide specific recommendations if issues are found.

### 'react-scripts' is not recognized

If you see the error `'react-scripts' is not recognized as an internal or external command`, follow these steps:

#### Quick Fix

```bash
npm install
```

#### If npm install only installs a few packages (~49 instead of ~1300)

This indicates a corrupted installation or cache issue. Follow these steps:

**On Windows (PowerShell or Command Prompt):**

```powershell
# 1. Remove existing installation
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# 2. Clear npm cache
npm cache clean --force

# 3. Reinstall dependencies
npm install
```

**On macOS/Linux:**

```bash
# 1. Remove existing installation
rm -rf node_modules package-lock.json

# 2. Clear npm cache
npm cache clean --force

# 3. Reinstall dependencies
npm install
```

#### Verify Installation Success

After running `npm install`, you should see:
- `added 1293 packages` (or similar large number, typically 1200-1300)
- If you see `added 49 packages` or another small number, the installation failed

Run the verification script to confirm:
```bash
node verify-setup.js
```

#### Additional Troubleshooting Steps

1. **Update npm to the latest version:**
   ```bash
   npm install -g npm@latest
   ```

2. **Check Node.js version:**
   ```bash
   node --version
   ```
   Ensure you have Node.js 14 or higher installed.

3. **Try using a different npm registry (if behind a firewall):**
   ```bash
   npm config set registry https://registry.npmjs.org/
   npm install
   ```

4. **Check for antivirus interference:**
   Some antivirus software can interfere with npm installations. Try temporarily disabling it during installation.

5. **Use yarn as an alternative:**
   ```bash
   npm install -g yarn
   yarn install
   yarn start
   ```

### Common Issues on Windows

- **Long path names:** Windows has a path length limit. Install Node.js and your project in a directory with a short path (e.g., `C:\projects\webrtc-react`)
- **Permissions:** Run your terminal as Administrator if you encounter permission errors
- **Execution Policy:** If scripts won't run, you may need to adjust PowerShell's execution policy:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

## Features

- Local video streaming using WebRTC
- React hooks for state management
- Simple and clean UI

## Screenshots

### HUD Overlay - Expanded State
![HUD Expanded](https://github.com/user-attachments/assets/59fedd2c-a2f7-4143-9982-bffd54652f58)

The HUD overlay in expanded state showing:
- All 7 control tabs in compact vertical layout
- Key metrics cards with color-coded values
- Dynamic parameter sliders with real-time displays
- Simulation control buttons
- Semi-transparent design with backdrop blur

### HUD Overlay - Minimized State
![HUD Minimized](https://github.com/user-attachments/assets/0bc4a86e-8381-4dc7-8e62-4eee8e324e04)

The HUD minimized to just the title bar:
- Compact 280px width
- "Data Center Control" title visible
- "+" button to expand again
- Minimal obstruction of the video stream

## Technology Stack

- **React 18** - Modern React with hooks
- **WebRTC** - Screen sharing via `getDisplayMedia`
- **CSS3** - Dark theme with backdrop-filter blur effects
- **JavaScript ES6+** - Modern syntax and features
- **Session Storage** - Tab persistence across refreshes

## License

MIT