# Troubleshooting Guide

This guide helps you resolve common issues when setting up and running the WebRTC React application.

## Quick Diagnosis

Run the setup verification script to diagnose your issue:

```bash
npm run verify
```

or directly:

```bash
node verify-setup.js
```

This script will check your setup and provide specific recommendations.

## Common Issues and Solutions

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

5. **As a last resort, try yarn:**
   ```bash
   npm install -g yarn
   yarn install
   yarn start
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

3. Or use shorter module paths:
   ```bash
   npm config set prefer-offline true
   npm config set progress false
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

3. **Use a different registry:**
   ```bash
   npm config set registry https://registry.npmmirror.com/
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

## Verification Checklist

After resolving issues, verify your setup:

- [ ] `node --version` shows 14.x or higher
- [ ] `npm --version` shows a recent version
- [ ] `npm run verify` passes all checks
- [ ] `node_modules/react-scripts` directory exists
- [ ] `npm start` launches the development server
- [ ] Browser opens to http://localhost:3000
- [ ] Application loads without errors

## Still Having Issues?

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

## Additional Resources

- [npm Documentation](https://docs.npmjs.com/)
- [Create React App Troubleshooting](https://create-react-app.dev/docs/troubleshooting/)
- [Node.js Installation Guide](https://nodejs.org/)
