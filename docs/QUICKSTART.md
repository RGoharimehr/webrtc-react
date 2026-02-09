# Quick Start Guide

This is a simplified guide to get you started quickly. For detailed instructions, see the [Setup Guide](SETUP_GUIDE.md).

## ⚠️ Before You Start

**Do you have Node.js installed?**

Run this command in your terminal/PowerShell:
```bash
node --version
```

- ✅ **If you see a version number** (like `v18.17.0`): Great! Skip to [Step 2](#step-2-install-project-dependencies)
- ❌ **If you see "not recognized" or "command not found"**: Continue to [Step 1](#step-1-install-nodejs)

## Step 1: Install Node.js

### Windows Users

1. Go to https://nodejs.org/
2. Click the big **green button** that says "LTS" (Long Term Support)
3. Download and run the installer
4. Click through the installation wizard (keep all default settings)
5. **Restart your PowerShell/Terminal** (this is important!)
6. Verify by running: `node --version`

**Having issues?** See [NPM Troubleshooting](NPM_TROUBLESHOOTING.md)

### Mac Users

**Option A: Using the Installer**
1. Go to https://nodejs.org/
2. Download the macOS installer
3. Run the installer
4. Restart your terminal
5. Verify: `node --version`

**Option B: Using Homebrew** (if you have it)
```bash
brew install node
```

### Linux Users

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install nodejs npm
```

**Fedora/RHEL:**
```bash
sudo dnf install nodejs npm
```

Verify: `node --version`

## Step 2: Install Project Dependencies

Open your terminal/PowerShell and navigate to the project folder:

```bash
cd webrtc-react
```

Install all required packages:

```bash
npm install
```

**What's happening?** This downloads all the libraries the project needs. It might take 1-2 minutes.

**Expected output:**
```
added 1314 packages, and audited 1315 packages in 18s
```

## Step 3: Start the Application

```bash
npm start
```

**What's happening?** This starts a development server and opens your browser automatically.

**You should see:**
- A browser window opens to `http://localhost:3000`
- The WebRTC Camera Controller interface loads
- You can click "Start Camera" to use your webcam

## Visual Checklist

```
[ ] Node.js installed ─────► Run: node --version
[ ] In project folder ─────► Run: cd webrtc-react
[ ] Dependencies installed ─► Run: npm install
[ ] App running ───────────► Run: npm start
[ ] Browser opens ─────────► Visit: http://localhost:3000
```

## Common Commands

| Command | What it does |
|---------|-------------|
| `npm install` | Download project dependencies (first time only) |
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run tests |

## Troubleshooting

### ❌ "npm is not recognized"
**Problem:** Node.js is not installed
**Solution:** Go back to [Step 1](#step-1-install-nodejs)

### ❌ "Cannot find package.json"
**Problem:** You're not in the right folder
**Solution:** Run `cd webrtc-react` to navigate to the project

### ❌ "Port 3000 is already in use"
**Problem:** Another app is using port 3000
**Solution:** 
- Close other apps using port 3000, or
- Use a different port: `PORT=3001 npm start`

### ❌ Module errors after `git pull`
**Problem:** New dependencies were added
**Solution:** Run `npm install` again

### ❌ Camera not working
**Problem:** Browser permissions
**Solution:** Click the camera icon in your browser's address bar and allow access

## Next Steps

Once the app is running:

1. 📹 **Test the camera**: Click "Start Camera" button
2. 🎮 **Explore controls**: Try the sliders and dropdowns
3. 📊 **Check status**: View real-time metrics in the dashboard
4. 📖 **Read docs**: Check out [Camera Guide](CAMERA_GUIDE.md) for features

## Need More Help?

- 📖 [Complete Setup Guide](SETUP_GUIDE.md) - Detailed instructions
- 🐛 [Troubleshooting npm errors](NPM_TROUBLESHOOTING.md) - Fix "npm not recognized"
- 💬 [Open an Issue](https://github.com/RGoharimehr/webrtc-react/issues) - Ask for help

## Quick Reference Card

```
┌─────────────────────────────────────────┐
│  ESSENTIAL COMMANDS                     │
├─────────────────────────────────────────┤
│  Check Node.js: node --version          │
│  Check npm:     npm --version           │
│  Install deps:  npm install             │
│  Start app:     npm start               │
│  Build app:     npm run build           │
│                                         │
│  Need help? See docs/SETUP_GUIDE.md    │
└─────────────────────────────────────────┘
```

---

**Remember:** Always restart your terminal after installing Node.js! 🔄
