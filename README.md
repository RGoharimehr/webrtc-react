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
