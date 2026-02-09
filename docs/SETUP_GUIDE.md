# Development Environment Setup Guide

## Prerequisites

Before you can run this application, you need to install Node.js and npm (Node Package Manager) on your system.

### What You Need

- **Node.js** version 14.0.0 or higher
- **npm** (comes automatically with Node.js)
- A modern web browser with camera support
- A webcam (built-in or USB)

## Installation Instructions

### Windows

#### Method 1: Official Installer (Recommended for Beginners)

1. **Download Node.js**
   - Visit [nodejs.org](https://nodejs.org/)
   - Download the **LTS (Long Term Support)** version
   - Choose the Windows Installer (.msi) for your system (64-bit or 32-bit)

2. **Run the Installer**
   - Double-click the downloaded `.msi` file
   - Follow the installation wizard
   - Keep all default settings (including "Add to PATH")
   - Click "Install"
   - Accept the UAC prompt if it appears

3. **Verify Installation**
   - Open a **new** PowerShell or Command Prompt window
   - Run these commands:
   ```powershell
   node --version
   npm --version
   ```
   - You should see version numbers (e.g., `v18.17.0` and `9.6.7`)

#### Method 2: Using Chocolatey (Package Manager)

If you have Chocolatey installed:

```powershell
choco install nodejs
```

#### Method 3: Using Winget

If you have Windows Package Manager:

```powershell
winget install OpenJS.NodeJS
```

#### Troubleshooting Windows Installation

**Problem: "npm is not recognized" after installation**

Solution:
1. Close all PowerShell/Command Prompt windows
2. Open a **new** PowerShell window (the PATH is only updated in new windows)
3. Try again

If still not working:
1. Check if Node.js is installed: Go to `C:\Program Files\nodejs\`
2. Manually add to PATH:
   - Search for "Environment Variables" in Windows
   - Click "Environment Variables"
   - Under "System variables", find "Path"
   - Click "Edit"
   - Add: `C:\Program Files\nodejs\`
   - Click OK on all dialogs
   - Restart your terminal

**Problem: Permission errors when installing**

Solution:
- Run PowerShell as Administrator (right-click → "Run as Administrator")
- Or use the official installer instead of command-line installation

### macOS

#### Method 1: Official Installer

1. Visit [nodejs.org](https://nodejs.org/)
2. Download the macOS Installer (.pkg)
3. Run the installer and follow the prompts

#### Method 2: Using Homebrew (Recommended)

If you have Homebrew installed:

```bash
brew install node
```

#### Method 3: Using nvm (Node Version Manager)

For managing multiple Node.js versions:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart your terminal, then:
nvm install --lts
nvm use --lts
```

#### Verify Installation

```bash
node --version
npm --version
```

### Linux

#### Ubuntu/Debian

```bash
# Update package index
sudo apt update

# Install Node.js and npm
sudo apt install nodejs npm

# Verify installation
node --version
npm --version
```

#### Using NodeSource (for latest versions)

```bash
# For Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Fedora/RHEL/CentOS

```bash
sudo dnf install nodejs npm
```

#### Using nvm (All Linux Distributions)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart your terminal, then:
nvm install --lts
nvm use --lts
```

## Setting Up the Project

Once Node.js and npm are installed:

### 1. Clone the Repository

```bash
git clone https://github.com/RGoharimehr/webrtc-react.git
cd webrtc-react
```

### 2. Install Dependencies

```bash
npm install
```

This command will:
- Read `package.json`
- Download all required packages
- Create a `node_modules` folder
- Generate `package-lock.json` (if not present)

**Expected output:**
```
added 1314 packages, and audited 1315 packages in 18s
```

### 3. Start Development Server

```bash
npm start
```

This will:
- Compile the React application
- Start a development server
- Automatically open your browser to `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Common Issues and Solutions

### Issue: "npm install" is very slow

**Solution:**
- Use a faster registry:
  ```bash
  npm config set registry https://registry.npmjs.org/
  ```
- Clear npm cache:
  ```bash
  npm cache clean --force
  ```

### Issue: EACCES permission errors on Linux/macOS

**Solution:**
- Don't use sudo with npm
- Fix npm permissions:
  ```bash
  mkdir ~/.npm-global
  npm config set prefix '~/.npm-global'
  echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
  source ~/.profile
  ```

### Issue: Port 3000 is already in use

**Solution:**
- Kill the process using port 3000:
  
  **Windows:**
  ```powershell
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  ```
  
  **macOS/Linux:**
  ```bash
  lsof -ti:3000 | xargs kill -9
  ```

- Or use a different port:
  ```bash
  PORT=3001 npm start
  ```

### Issue: Module not found errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Cannot find module 'react-scripts'"

**Solution:**
```bash
npm install --save-dev react-scripts
```

## Verifying Your Setup

Run these commands to verify everything is working:

```bash
# Check Node.js version
node --version
# Should show v14.0.0 or higher

# Check npm version
npm --version
# Should show 6.0.0 or higher

# Check if project dependencies are installed
npm list --depth=0
# Should show all installed packages

# Try running the dev server
npm start
# Should start server on port 3000
```

## Next Steps

After successful setup:

1. 📖 Read the [README.md](../README.md) for project overview
2. 📹 Check [Camera Guide](CAMERA_GUIDE.md) for camera feature instructions
3. 👀 See [Viewing Guide](VIEWING_GUIDE.md) for UI preview options
4. 🏗️ Review [Architecture](ARCHITECTURE.md) to understand the codebase

## Getting Help

If you're still having issues:

1. Check the [troubleshooting section](#common-issues-and-solutions) above
2. Search for your error message online
3. Check [Node.js documentation](https://nodejs.org/docs/)
4. Check [npm documentation](https://docs.npmjs.com/)
5. Open an issue on GitHub with:
   - Your operating system
   - Node.js version (`node --version`)
   - npm version (`npm --version`)
   - Complete error message
   - Steps you've tried

## Alternative: Using Docker (Advanced)

If you prefer containerization:

```dockerfile
# Create a Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t webrtc-react .
docker run -p 3000:3000 webrtc-react
```

## System Requirements

### Minimum Requirements
- **OS**: Windows 10, macOS 10.14, Ubuntu 18.04 (or newer)
- **RAM**: 4 GB
- **Storage**: 500 MB for dependencies
- **Browser**: Chrome 53+, Firefox 36+, Safari 11+, Edge 79+

### Recommended Requirements
- **OS**: Latest stable version
- **RAM**: 8 GB or more
- **Storage**: 1 GB free space
- **Browser**: Latest Chrome or Edge
- **Webcam**: HD camera for best experience

## Development Tools (Optional)

Enhance your development experience:

- **VS Code**: Recommended code editor
  - Extensions: ESLint, Prettier, React Developer Tools
- **Git**: For version control
- **Chrome DevTools**: For debugging
- **React Developer Tools**: Browser extension

## Summary

✅ **Before running the application:**
1. Install Node.js (includes npm)
2. Verify installation: `node --version` and `npm --version`
3. Clone the repository
4. Run `npm install` to install dependencies
5. Run `npm start` to start the application

✅ **If you see "npm is not recognized":**
- You need to install Node.js first
- Follow the instructions for your operating system above
- Restart your terminal after installation

Happy coding! 🚀
