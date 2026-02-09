# Getting Started Flowchart

This visual guide helps you understand the setup process step by step.

## Setup Process Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  START: Want to run the app?                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ Is Node.js installed?│
              │  (Run: node -v)      │
              └──────────┬───────────┘
                         │
           ┌─────────────┴─────────────┐
           │                           │
          YES                          NO
           │                           │
           ▼                           ▼
    ┌──────────────┐         ┌─────────────────────┐
    │ Skip to Step │         │ STEP 1: Install     │
    │      2       │         │      Node.js        │
    └──────┬───────┘         │                     │
           │                 │ • Go to nodejs.org  │
           │                 │ • Download installer│
           │                 │ • Run installer     │
           │                 │ • Restart terminal  │
           │                 └──────────┬──────────┘
           │                            │
           │                            ▼
           │                 ┌─────────────────────┐
           │                 │ Verify installation │
           │                 │  (Run: node -v)     │
           │                 └──────────┬──────────┘
           │                            │
           └────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ STEP 2: Navigate to  │
              │    project folder    │
              │                      │
              │  cd webrtc-react     │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ STEP 3: Install      │
              │    dependencies      │
              │                      │
              │   npm install        │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ STEP 4: Start the    │
              │    application       │
              │                      │
              │    npm start         │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Browser opens to    │
              │  localhost:3000      │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   SUCCESS! 🎉        │
              │   App is running     │
              └──────────────────────┘
```

## Troubleshooting Decision Tree

```
┌──────────────────────────────────────┐
│  ERROR: "npm is not recognized"      │
└────────────────┬─────────────────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │ Is Node.js installed? │
      │  (Check: node -v)     │
      └──────┬───────┬────────┘
             │       │
            YES      NO
             │       │
             │       ▼
             │  ┌─────────────────────┐
             │  │ Install Node.js     │
             │  │ from nodejs.org     │
             │  └─────────┬───────────┘
             │            │
             │            ▼
             │  ┌─────────────────────┐
             │  │ Restart terminal    │
             │  └─────────┬───────────┘
             │            │
             └────────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │ Did you restart      │
      │ your terminal?       │
      └──────┬───────┬───────┘
            YES      NO
             │       │
             │       ▼
             │  ┌─────────────────────┐
             │  │ Close and reopen    │
             │  │ terminal/PowerShell │
             │  └─────────┬───────────┘
             │            │
             └────────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │ Try: node -v again   │
      │                      │
      │ Still not working?   │
      │ See SETUP_GUIDE.md   │
      └──────────────────────┘
```

## Platform-Specific Quick Paths

### Windows Path
```
START
  │
  ├─► Download from nodejs.org
  │     │
  │     └─► Run .msi installer
  │           │
  │           └─► Keep default settings
  │                 │
  │                 └─► Click through wizard
  │                       │
  │                       └─► Restart PowerShell
  │                             │
  └─────────────────────────────┘
                │
                ▼
              READY
```

### macOS Path
```
START
  │
  ├─► Option A: Download .pkg installer
  │     │
  │     └─► Run installer
  │           │
  │           └─► Restart terminal
  │
  ├─► Option B: Use Homebrew
  │     │
  │     └─► brew install node
  │           │
  │           └─► Restart terminal
  │
  └─────────────────────────────┘
                │
                ▼
              READY
```

### Linux Path
```
START
  │
  ├─► Ubuntu/Debian
  │     │
  │     └─► sudo apt install nodejs npm
  │           │
  │           └─► Restart terminal
  │
  ├─► Fedora/RHEL
  │     │
  │     └─► sudo dnf install nodejs npm
  │           │
  │           └─► Restart terminal
  │
  └─────────────────────────────┘
                │
                ▼
              READY
```

## Command Sequence

### First Time Setup
```
┌───────────────────────────────────────────────┐
│ Terminal Commands (in order)                  │
├───────────────────────────────────────────────┤
│                                               │
│ 1. node --version     ← Check if installed   │
│                                               │
│ 2. cd webrtc-react    ← Go to project folder │
│                                               │
│ 3. npm install        ← Install dependencies │
│    (takes 1-2 minutes)                        │
│                                               │
│ 4. npm start          ← Start the app        │
│    (opens browser automatically)              │
│                                               │
└───────────────────────────────────────────────┘
```

### Daily Usage
```
┌───────────────────────────────────────────────┐
│ After first setup, just run:                  │
├───────────────────────────────────────────────┤
│                                               │
│ cd webrtc-react                               │
│ npm start                                     │
│                                               │
│ (That's it!)                                  │
│                                               │
└───────────────────────────────────────────────┘
```

## Error Handling Map

```
┌──────────────────────────────────────────┐
│         Common Errors & Solutions         │
├───────────────────┬──────────────────────┤
│ Error             │ Solution             │
├───────────────────┼──────────────────────┤
│ npm not recognized│ Install Node.js      │
│                   │ Restart terminal     │
├───────────────────┼──────────────────────┤
│ Cannot find       │ cd webrtc-react      │
│ package.json      │                      │
├───────────────────┼──────────────────────┤
│ Port 3000 in use  │ Close other apps or  │
│                   │ PORT=3001 npm start  │
├───────────────────┼──────────────────────┤
│ Module not found  │ npm install          │
├───────────────────┼──────────────────────┤
│ Camera denied     │ Allow in browser     │
│                   │ settings             │
└───────────────────┴──────────────────────┘
```

## Success Indicators

You know it's working when you see:

```
✅ Terminal shows:
   "Compiled successfully!"
   "You can now view webrtc-react in the browser"
   "Local: http://localhost:3000"

✅ Browser automatically opens

✅ You see the WebRTC Camera Controller interface

✅ The page has three panels:
   - Left: Control Panel (green)
   - Center: Camera View (black)
   - Right: Command Panel (white)

✅ Status shows "inactive" (before starting camera)
```

## Documentation Roadmap

```
You are here → FLOWCHART.md
                  │
                  ├─► Need Node.js? → SETUP_GUIDE.md
                  │
                  ├─► Quick steps? → QUICKSTART.md
                  │
                  ├─► npm errors? → NPM_TROUBLESHOOTING.md
                  │
                  ├─► Camera help? → CAMERA_GUIDE.md
                  │
                  └─► View UI? → VIEWING_GUIDE.md
```

## Time Estimates

```
┌────────────────────────────────┐
│ How long will setup take?      │
├────────────────────────────────┤
│                                │
│ Node.js installation: 5 min    │
│ npm install: 2 min             │
│ First start: 1 min             │
│                                │
│ Total: ~8 minutes              │
│                                │
│ (Already have Node.js?)        │
│ → Just 3 minutes!              │
│                                │
└────────────────────────────────┘
```

---

**Key Takeaway:** Install Node.js → Restart terminal → npm install → npm start → Done! 🚀
