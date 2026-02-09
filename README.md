# WebRTC React - Data Center Monitoring Dashboard with Draggable Panels

A modern data center monitoring and control dashboard with WebRTC screen sharing, iOS 16-style glassmorphism effects, **draggable and resizable panels**, and live metrics visualization built with React.

![Draggable Panels](https://github.com/user-attachments/assets/529e7035-0c2d-4515-9397-4bc7ae66ae18)

## Features

🎯 **Draggable & Resizable Panels** ⭐ NEW!
- Move panels anywhere on screen by dragging the header
- Resize from any edge or corner (8 resize handles)
- Constrained to viewport boundaries
- Dashboard: 250-500px width, Live Metrics: 200-400px width
- Smooth transitions and visual feedback

🖥️ **Full-Screen WebRTC Streaming**
- Share entire screen or specific windows
- High-quality video streaming with audio capture
- Stream fills the entire window as background
- Start/stop controls integrated into HUD

✨ **iOS 16-Style Glassmorphism**
- Ultra-modern glass-like tinted panels
- 40px backdrop blur with 180% saturation
- Semi-transparent overlays (70% opacity)
- Subtle inset glow effects
- Matches iOS 16 design language

🎨 **Standardized Typography & Sizing** ⭐ NEW!
- Consistent font sizes across all components
- Uniform button heights (32px) and spacing
- CSS variable-based design system
- Professional, clean appearance
- Optimized readability

📊 **Live Metrics Panel**
- Draggable panel positioned on left side
- Real-time temperature and power consumption charts
- SVG-based smooth line graphs with gradient fills
- Current values and trend indicators
- Glass-tinted backgrounds

🎮 **Compact HUD Dashboard**
- Draggable control panel (initially top-right)
- Resizable from 250px to 500px width
- Minimize/expand functionality
- Semi-transparent with backdrop blur effect
- All controls accessible without blocking the stream

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

2. **Move and Resize Panels** ⭐ NEW!
   - **To Move**: Click and drag the panel header (with ⋮⋮ icon)
   - **To Resize**: Hover near any edge or corner and drag
   - **Dashboard Panel**: 250-500px width, 400-900px height
   - **Live Metrics Panel**: 200-400px width, 400-900px height
   - Panels stay within screen boundaries automatically

3. **View Live Metrics**
   - Graphs panel initially positioned on the left side
   - Shows real-time temperature and power consumption
   - Always visible for continuous monitoring
   - Glass-tinted backgrounds for iOS 16 aesthetic
   - Drag to reposition anywhere on screen

4. **Use the Dashboard Controls**
   - Dashboard panel initially positioned on the right side
   - Click tabs to switch between different control sections
   - Use the "− Minimize" button to collapse the panel
   - Use the "+ Expand" button to restore the panel
   - Click the "■ Stop" button to stop screen sharing
   - Drag to your preferred position

5. **Adjust Parameters**
   - All controls work in the compact draggable form
   - Sliders show real-time values
   - Dropdowns for discrete selections
   - Logs track all operations
   - Standardized button sizes and spacing

6. **iOS 16 Glassmorphism**
   - Both panels use ultra-modern glass effects
   - 40px backdrop blur with 180% saturation
   - Tinted semi-transparent backgrounds
   - Subtle borders and inset glows
   - Perfectly readable over any stream content

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

### iOS 16 Glassmorphism with Live Metrics
![iOS Glassmorphism](https://github.com/user-attachments/assets/a3a3d02f-0c95-460d-8344-b261e4ee73c8)

The complete interface featuring:
- **Left**: Data Center Control HUD with iOS 16 glass effect
  - All 7 control tabs in compact vertical layout
  - Key metrics cards with color-coded values
  - Dynamic parameter sliders with real-time displays
  - Simulation control buttons
- **Right**: Live Metrics panel with glass-tinted graphs
  - Temperature distribution chart with gradient fill
  - Power consumption chart with trend indicators
  - Current values and trend metrics
  - Always visible for continuous monitoring
- **Background**: WebRTC stream with start prompt
- **Glass Effect**: 40px backdrop blur, 180% saturation, tinted overlays
- **Draggable & Resizable**: Custom React component with mouse event handling

## Documentation

For detailed information about specific features:
- **[Draggable Panels Guide](DRAGGABLE_PANELS_GUIDE.md)** - Complete guide to using and customizing draggable/resizable panels
- **[Troubleshooting](TROUBLESHOOTING.md)** - Solutions for common issues
- **[Solution Summary](SOLUTION_SUMMARY.md)** - Overview of implementation approach

## Technology Stack

- **React 18** - Modern React with hooks
- **WebRTC** - Screen sharing via `getDisplayMedia`
- **CSS3** - iOS 16 glassmorphism with backdrop-filter and saturate effects
- **SVG** - Smooth line charts with gradient fills
- **JavaScript ES6+** - Modern syntax and features
- **Session Storage** - Tab persistence across refreshes
- **Custom Components** - Draggable/resizable panel system

## License

MIT