# WebRTC React - Data Center Monitoring Dashboard with Draggable Panels



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

## Documentation

For detailed information about specific features:
- **[Draggable Panels Guide](DRAGGABLE_PANELS_GUIDE.md)** - Complete guide to using and customizing draggable/resizable panels
- **[Troubleshooting](TROUBLESHOOTING.md)** - Solutions for common issues
- **[Solution Summary](SOLUTION_SUMMARY.md)** - Overview of implementation approach


## License

MIT