# Steps to Integrate This Webapp into kit-cae Repository

This document provides step-by-step instructions for the kit-cae repository maintainers to integrate this webapp.

## Overview

This webapp should be placed in the NVIDIA-Omniverse/kit-cae repository as a subdirectory, providing a web-based UI for the kit-cae extension.

## Recommended Repository Structure

```
kit-cae/
├── exts/                    # Kit extensions
│   └── omni.cdu.physics/   # Main CAE extension
│       ├── omni/
│       ├── config/
│       └── docs/
├── webapp/                  # Web UI (THIS APPLICATION)
│   ├── public/
│   ├── src/
│   ├── .env
│   ├── package.json
│   ├── README.md
│   ├── INTEGRATION.md
│   └── KIT_CAE_BACKEND_API.md
├── docs/
├── .github/
└── README.md
```

## Integration Steps for kit-cae Maintainers

### Option 1: Direct Copy (One-time Integration)

**Step 1:** Clone this repository
```bash
git clone https://github.com/RGoharimehr/webrtc-react.git kit-cae-webapp-temp
cd kit-cae-webapp-temp
```

**Step 2:** Copy files to kit-cae
```bash
# In kit-cae repository
mkdir -p webapp
cp -r ../kit-cae-webapp-temp/* webapp/
rm -rf webapp/.git  # Remove git history
```

**Step 3:** Update kit-cae README.md
```markdown
## Web UI

This repository includes a web-based interface for the kit-cae extension.

### Quick Start
```bash
cd webapp
npm install
npm start
```

See [webapp/README.md](webapp/README.md) for detailed documentation.
```

**Step 4:** Commit to kit-cae
```bash
git add webapp/
git commit -m "Add web-based UI for kit-cae extension"
git push
```

### Option 2: Git Submodule (Maintains Separate Updates)

**Step 1:** Add as submodule
```bash
# In kit-cae repository root
git submodule add https://github.com/RGoharimehr/webrtc-react.git webapp
git submodule update --init --recursive
```

**Step 2:** Commit submodule reference
```bash
git add .gitmodules webapp
git commit -m "Add webapp as submodule"
git push
```

**Step 3:** Update webapp in future
```bash
cd webapp
git pull origin main
cd ..
git add webapp
git commit -m "Update webapp to latest version"
git push
```

**Advantages:**
- Easy to update webapp independently
- Clear version tracking
- Contributors can work on webapp separately

**Disadvantages:**
- Requires `git submodule update` for cloners
- Slightly more complex workflow

### Option 3: Git Subtree (Merged History)

**Step 1:** Add as subtree
```bash
# In kit-cae repository root
git subtree add --prefix webapp https://github.com/RGoharimehr/webrtc-react.git main --squash
```

**Step 2:** Update webapp in future
```bash
git subtree pull --prefix webapp https://github.com/RGoharimehr/webrtc-react.git main --squash
```

**Advantages:**
- Simple for users (no submodule commands)
- Full integration with kit-cae
- Can modify webapp directly in kit-cae

## Post-Integration Tasks

### 1. Update kit-cae Main README

Add a "Web UI" section to kit-cae's README.md:

```markdown
## Web UI

The kit-cae extension includes a modern web-based interface for monitoring and controlling simulations.

### Features
- Real-time data visualization
- Simulation control (start/stop/configure)
- Data recording and export
- WebRTC video streaming from Omniverse

### Getting Started

1. **Install webapp dependencies:**
   ```bash
   cd webapp
   npm install
   ```

2. **Start the kit-cae extension:**
   ```bash
   ./omni.sh --ext-folder exts --enable omni.cdu.physics
   ```

3. **Start the webapp:**
   ```bash
   cd webapp
   npm start
   ```

4. **Open browser:** http://localhost:3000

For detailed documentation, see [webapp/README.md](webapp/README.md).

### Backend API

The webapp requires a WebSocket API in the kit-cae extension. See [webapp/KIT_CAE_BACKEND_API.md](webapp/KIT_CAE_BACKEND_API.md) for implementation details.
```

### 2. Update kit-cae Documentation

Create or update `docs/webapp.md`:

```markdown
# Web UI Documentation

## Architecture
[Copy from webapp/README.md]

## Installation
[Copy from webapp/README.md]

## Backend Integration
[Copy from webapp/KIT_CAE_BACKEND_API.md]
```

### 3. Add to CI/CD Pipeline

Update `.github/workflows/ci.yml`:

```yaml
name: CI

on: [push, pull_request]

jobs:
  build-extension:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      # ... existing extension build steps ...

  build-webapp:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true  # If using submodule
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install webapp dependencies
        run: |
          cd webapp
          npm install
      
      - name: Build webapp
        run: |
          cd webapp
          npm run build
      
      - name: Test webapp
        run: |
          cd webapp
          npm test -- --watchAll=false
```

### 4. Update License

If kit-cae uses a different license than the webapp's Academic Use License:

1. Keep webapp's LICENSE file in `webapp/LICENSE`
2. Add attribution in kit-cae's main LICENSE or README
3. Consider dual-licensing or license harmonization

### 5. Add Contributing Guidelines

Update `CONTRIBUTING.md` in kit-cae:

```markdown
## Contributing to the Web UI

The web UI is located in the `webapp/` directory.

### Development Setup
```bash
cd webapp
npm install
npm start
```

### Making Changes
1. Edit files in `webapp/src/`
2. Test locally with kit-cae backend running
3. Run `npm run build` to verify production build
4. Submit PR with description of changes

### Code Style
- React components: Functional components with hooks
- State management: React useState and useEffect
- API client: WebSocket via `src/api/kitClient.js`
```

## Testing the Integration

After integration, verify everything works:

### 1. Clone Fresh Repository
```bash
git clone https://github.com/NVIDIA-Omniverse/kit-cae.git
cd kit-cae
git submodule update --init --recursive  # If using submodule
```

### 2. Build Extension
```bash
# Follow kit-cae build instructions
./build.sh  # or similar
```

### 3. Build Webapp
```bash
cd webapp
npm install
npm run build
```

### 4. Start Services
```bash
# Terminal 1: Extension
./omni.sh --ext-folder exts --enable omni.cdu.physics

# Terminal 2: Webapp
cd webapp
npm start
```

### 5. Test Connection
- Open http://localhost:3000
- Click "CONNECT" button
- Verify green "KIT API" status
- Test each tab functionality

## Deployment

### Development
- Extension: Local Omniverse installation
- Webapp: `npm start` (port 3000)

### Production
- Extension: Deployed Omniverse instance
- Webapp: Nginx/Apache serving `webapp/build/`
- See `webapp/INTEGRATION.md` for deployment details

## Documentation Links

After integration, update these links:

- Change `https://github.com/RGoharimehr/webrtc-react` → `https://github.com/NVIDIA-Omniverse/kit-cae`
- Update issue tracker links
- Update contributor guidelines

## Support

For questions about integration:
- Create an issue in kit-cae repository
- Tag with "webapp" label
- Reference this integration guide

## Maintenance

### Updating Webapp
```bash
# If using submodule
cd webapp
git pull origin main
cd ..
git add webapp
git commit -m "Update webapp"

# If using subtree
git subtree pull --prefix webapp https://github.com/RGoharimehr/webrtc-react.git main --squash
```

### Monitoring
- Watch for webapp issues in kit-cae issue tracker
- Monitor webapp dependencies for security updates
- Keep Node.js version current

## Checklist for Maintainers

- [ ] Choose integration method (submodule recommended)
- [ ] Integrate webapp into kit-cae repository
- [ ] Update kit-cae main README
- [ ] Add webapp documentation to docs/
- [ ] Update CI/CD pipeline
- [ ] Address license compatibility
- [ ] Update contributing guidelines
- [ ] Test fresh clone and build
- [ ] Update all documentation links
- [ ] Announce to community

## Questions?

Contact the webapp maintainer or kit-cae team for assistance with integration.
