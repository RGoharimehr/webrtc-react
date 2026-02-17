# Integration Guide: kit-cae Web UI

This document explains how to integrate this React web application into the NVIDIA-Omniverse/kit-cae repository.

## Overview

This React web application provides a modern web-based UI for the NVIDIA Omniverse kit-cae (Computer-Aided Engineering) extension. It acts as a thin client that communicates with the kit-cae extension backend via WebSocket API and WebRTC for visualization streaming.

## Integration into kit-cae Repository

### Option 1: As a Subdirectory (Recommended)

Add this webapp as a subdirectory in the kit-cae repository:

```
kit-cae/
├── exts/                    # Existing Kit extensions
│   └── omni.cdu.physics/   # Your Kit extension
├── webapp/                  # Web UI (this application)
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── README.md
├── docs/
└── README.md
```

**Steps:**

1. Clone the kit-cae repository:
   ```bash
   git clone https://github.com/NVIDIA-Omniverse/kit-cae.git
   cd kit-cae
   ```

2. Add this webapp as a subdirectory:
   ```bash
   # Create webapp directory
   mkdir -p webapp
   
   # Copy all files from this repository to webapp/
   cd webapp
   git clone https://github.com/RGoharimehr/webrtc-react.git .
   rm -rf .git  # Remove git history if adding to main repo
   ```

3. Update kit-cae's main README to reference the webapp:
   ```markdown
   ## Web UI
   
   This repository includes a React-based web interface in the `webapp/` directory.
   See [webapp/README.md](webapp/README.md) for installation and usage instructions.
   ```

### Option 2: As a Git Submodule

Keep this webapp as a separate repository but reference it as a submodule:

```bash
cd kit-cae
git submodule add https://github.com/RGoharimehr/webrtc-react.git webapp
git submodule update --init --recursive
```

**Advantages:**
- Maintains separate version control
- Can be updated independently
- Easier to track changes

**Disadvantages:**
- Requires submodule commands for updates
- More complex for contributors

### Option 3: Monorepo with Separate Directory

Merge this repository into kit-cae while maintaining git history:

```bash
cd kit-cae
git subtree add --prefix webapp https://github.com/RGoharimehr/webrtc-react.git main --squash
```

## Backend Connection Configuration

The webapp is pre-configured to connect to the kit-cae extension backend. Update `.env` file in the webapp directory:

```bash
# Kit CAE Extension Backend
REACT_APP_KIT_API_HOST=localhost
REACT_APP_KIT_API_PORT=49080
REACT_APP_KIT_API_PROTO=ws

# WebRTC Video Streaming
REACT_APP_OV_SIGNAL_HOST=localhost
REACT_APP_OV_SIGNAL_PORT=49100
```

## Kit Extension Requirements

The kit-cae extension must implement the WebSocket API protocol documented in this webapp's README.md. Key requirements:

1. **WebSocket Server** on port 49080 (configurable)
   - Message protocol: JSON request/response + push updates
   - See webapp/README.md for complete protocol specification

2. **WebRTC Signaling Server** on port 49100 (for video streaming)
   - Standard WebRTC signaling protocol
   - SDP offer/answer exchange
   - ICE candidate negotiation

3. **Required API Endpoints:**
   - `ping`, `status.get`
   - `inputs.get`, `inputs.set`
   - `config.get`, `config.set`
   - `sim.startTransient`, `sim.stopTransient`, `sim.loadSteadyState`
   - `outputs.get`, `history.get`, `history.clear`
   - `viz.setProperty`, `viz.setColormap`, `viz.refresh`, `viz.getOptions`
   - `record.start`, `record.stop`, `record.export`
   - `mapping.apply`, `mapping.exportZip`, `mapping.importZip`

## Development Workflow

### Webapp Development

```bash
cd webapp
npm install
npm start
```

This will start the development server on http://localhost:3000

### Kit Extension Development

Run the kit-cae extension with the WebSocket server enabled:

```bash
# In the kit-cae directory
./omni.sh --ext-folder exts --enable omni.cdu.physics
```

### Testing Integration

1. Start the Kit extension with WebSocket server
2. Start the webapp development server
3. Open http://localhost:3000 in browser
4. Click "CONNECT" button to establish connection
5. Verify all tabs are functional

## Production Deployment

### Building the Webapp

```bash
cd webapp
npm run build
```

This creates an optimized production build in `webapp/build/`

### Serving the Webapp

The built webapp can be served:

1. **From Kit Extension:** Serve static files from the Kit extension HTTP server
2. **Separate Web Server:** Deploy to Apache, Nginx, or cloud hosting
3. **Electron App:** Package as a desktop application

Example nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/kit-cae/webapp/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy WebSocket connections
    location /ws {
        proxy_pass http://localhost:49080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Docker Deployment

Create a Dockerfile in the kit-cae root:

```dockerfile
# Build webapp
FROM node:18 AS webapp-build
WORKDIR /webapp
COPY webapp/package*.json ./
RUN npm install
COPY webapp/ ./
RUN npm run build

# Kit runtime
FROM nvcr.io/nvidia/omniverse-kit:latest
COPY exts/ /app/exts/
COPY --from=webapp-build /webapp/build /app/webapp
EXPOSE 49080 49100 3000
CMD ["./omni.sh", "--ext-folder", "/app/exts"]
```

## Continuous Integration

Add webapp build to kit-cae CI pipeline:

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  build-webapp:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install webapp dependencies
        run: cd webapp && npm install
      - name: Build webapp
        run: cd webapp && npm run build
      - name: Test webapp
        run: cd webapp && npm test
```

## Documentation Updates

After integration, update the following:

1. **kit-cae/README.md:** Add webapp section
2. **kit-cae/docs/:** Create webapp usage guide
3. **Webapp URLs:** Update all references from RGoharimehr/webrtc-react to NVIDIA-Omniverse/kit-cae

## Support and Maintenance

- **Webapp Issues:** Report in kit-cae issues with "webapp" label
- **Backend API:** Document in kit-cae extension docs
- **Protocol Changes:** Update both webapp and extension together

## License Considerations

This webapp is licensed under an Academic Use License. When integrating into kit-cae:

1. Ensure license compatibility
2. Include LICENSE file in webapp directory
3. Add attribution in kit-cae README
4. Update citations if required

## Next Steps

1. Choose integration option (subdirectory recommended)
2. Implement WebSocket API in kit-cae extension
3. Test integration locally
4. Update kit-cae documentation
5. Create pull request to NVIDIA-Omniverse/kit-cae

## Questions?

For questions about integration:
- Open an issue in the kit-cae repository
- Contact the kit-cae maintainers
- Review the webapp README.md for API documentation
