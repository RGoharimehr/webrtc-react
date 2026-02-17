# Quick Start Guide: kit-cae + Webapp Integration

This guide will help you quickly integrate this webapp with the NVIDIA Omniverse kit-cae extension.

## 🎯 Goal

Connect this React webapp to your kit-cae extension to provide a web-based UI for data center monitoring and simulation control.

## 📋 Prerequisites

- [ ] NVIDIA Omniverse kit-cae extension installed and working
- [ ] Node.js 14+ and npm installed
- [ ] Basic understanding of WebSocket and REST APIs

## 🚀 Quick Integration (3 Steps)

### Step 1: Add Webapp to kit-cae Repository

Choose one of these methods:

**Method A: Copy Files (Simplest)**
```bash
# In your kit-cae repository
mkdir -p webapp
cd webapp

# Copy all files from this repository
# (Either manually or via git clone, then remove .git)
```

**Method B: Git Submodule (Recommended)**
```bash
# In your kit-cae repository root
git submodule add https://github.com/RGoharimehr/webrtc-react.git webapp
git submodule update --init --recursive
```

### Step 2: Install Webapp Dependencies

```bash
cd webapp  # or wherever you placed the webapp
npm install
```

This will install ~1300 packages (React, WebSocket client, etc.)

### Step 3: Start Both Services

**Terminal 1 - Start kit-cae backend:**
```bash
# In kit-cae repository root
./omni.sh --ext-folder exts --enable omni.cdu.physics

# Ensure WebSocket server starts on port 49080
```

**Terminal 2 - Start webapp:**
```bash
# In webapp directory
npm start

# Opens browser at http://localhost:3000
```

## ✅ Verify Connection

1. Open http://localhost:3000 in your browser
2. Look for the "KIT API" button in the Dashboard Control panel (top right)
3. Click "CONNECT"
4. Button should change from red to green showing "KIT API"
5. You should see live data in the "Live Metrics" panel

## 🔧 Configuration

If connection fails, check `.env` file in webapp directory:

```bash
REACT_APP_KIT_API_HOST=localhost
REACT_APP_KIT_API_PORT=49080
```

Make sure these match your kit-cae extension configuration.

## 📚 Next Steps

### For Backend Developers

1. **Review API Requirements:** See [KIT_CAE_BACKEND_API.md](KIT_CAE_BACKEND_API.md)
2. **Implement WebSocket Server:** Add WebSocket server to your extension
3. **Implement API Endpoints:** Add handlers for all required message types
4. **Test Each Endpoint:** Use webapp to verify each feature works

### For Frontend Developers

1. **Customize UI:** Modify React components in `src/tabs/`
2. **Add Features:** Extend functionality in `src/api/kitClient.js`
3. **Styling:** Update `src/App.css` for visual changes

## 🐛 Troubleshooting

### Webapp won't connect to backend

- **Check backend is running:** `curl http://localhost:49080` should respond
- **Check firewall:** Ensure ports 49080 and 49100 are open
- **Check .env file:** Verify host and port settings
- **Check browser console:** Open DevTools (F12) and look for connection errors

### "Module not found" errors

```bash
cd webapp
rm -rf node_modules package-lock.json
npm install
```

### Backend not receiving messages

- Enable debug logging in kit-cae extension
- Check WebSocket server is properly handling JSON messages
- Verify message format matches API specification

## 📖 Documentation

- **Integration Guide:** [INTEGRATION.md](INTEGRATION.md) - Complete integration documentation
- **API Specification:** [KIT_CAE_BACKEND_API.md](KIT_CAE_BACKEND_API.md) - Backend API requirements
- **Webapp README:** [README.md](README.md) - Webapp usage and features

## 💡 Development Tips

### Running in Development Mode

The webapp uses React hot-reload - changes to code will automatically refresh the browser.

```bash
# Webapp terminal
npm start  # Leave this running

# Edit files in src/ directory
# Browser updates automatically
```

### Testing Without Backend

The webapp includes mock data mode. If backend is not connected, it will automatically use simulated data for development.

### Production Build

```bash
cd webapp
npm run build

# Creates optimized build in webapp/build/
# Serve with any web server (nginx, Apache, etc.)
```

### Docker Deployment

Example Dockerfile:

```dockerfile
# Build webapp
FROM node:18 AS build
WORKDIR /webapp
COPY webapp/package*.json ./
RUN npm install
COPY webapp/ ./
RUN npm run build

# Serve with nginx
FROM nginx:alpine
COPY --from=build /webapp/build /usr/share/nginx/html
EXPOSE 80
```

## 🎓 Learning Resources

- **React:** https://react.dev/
- **WebSocket API:** https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
- **WebRTC:** https://webrtc.org/
- **Omniverse Kit:** https://docs.omniverse.nvidia.com/kit/

## 🤝 Getting Help

- **Issues:** Open issue in kit-cae repository
- **Questions:** Check existing issues or discussions
- **Contributions:** Fork, modify, submit PR

## 📝 Common Tasks

### Update Backend Host

Edit `.env`:
```bash
REACT_APP_KIT_API_HOST=192.168.1.100  # Your server IP
```

Then restart webapp:
```bash
npm start
```

### Add New Tab

1. Create component in `src/tabs/NewTab.js`
2. Import in `src/App.js`
3. Add to `MODE_TABS` configuration
4. Implement backend API if needed

### Modify Metrics Display

Edit `src/components/GraphsPanel.js` to change:
- Which metrics are displayed
- How they are visualized
- Update frequency

## ✨ Success!

You should now have:
- ✅ Webapp running on http://localhost:3000
- ✅ Connected to kit-cae backend
- ✅ Live data streaming
- ✅ Interactive simulation control

Ready to start developing! 🚀
