# Node.js Version Requirements

## Quick Answer

This project requires:
- **Node.js:** 18.0.0 or higher
- **npm:** 10.0.0 or higher

## Why These Requirements?

The NVIDIA Omniverse WebRTC Streaming Library requires Node.js 18+ because:
- **WebRTC Support:** Modern WebRTC APIs need Node 18+
- **ES Modules:** Better ESM support in Node 18+
- **Performance:** Improved V8 JavaScript engine
- **Security:** Latest security patches and features

## Check Your Version

```bash
node --version
npm --version
```

**Example output:**
```
v20.11.0  ← Good! (18+ required)
10.5.0    ← Good! (10+ required)
```

## If You See EBADENGINE Warning

```
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'webrtc-react@0.1.0',
npm warn EBADENGINE   required: { node: '^18.0.0', npm: '^10.0.0' },
npm warn EBADENGINE   current: { node: 'v16.x.x', npm: '8.x.x' }
npm warn EBADENGINE }
```

**This means:** Your Node.js or npm version is too old.

## How to Upgrade

### Option 1: Download from nodejs.org (Easiest)

1. Visit [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS version** (Long Term Support)
3. Run the installer
4. Restart your terminal
5. Verify: `node --version`

**Recommended:** LTS version (usually 20.x or 22.x)

### Option 2: Use nvm (Best for Developers)

**nvm** (Node Version Manager) lets you install and switch between Node versions easily.

#### Install nvm:

**macOS/Linux:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
# Restart terminal
```

**Windows:**
Download from [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)

#### Use nvm to install Node:

```bash
# Install latest LTS version
nvm install --lts

# Or install specific version
nvm install 20

# Use the version
nvm use 20

# Verify
node --version
```

### Option 3: Package Managers

**macOS (Homebrew):**
```bash
brew update
brew install node@20
brew link node@20
```

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows (Chocolatey):**
```powershell
choco install nodejs-lts
```

## Verify Installation

After upgrading, verify both Node and npm:

```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 10.x.x or higher
```

Then reinstall dependencies:

```bash
cd webrtc-react
rm -rf node_modules package-lock.json
npm install
```

## Version Compatibility

### Supported Node Versions

| Version | Status | Recommended |
|---------|--------|-------------|
| 18.x | ✅ Supported | Yes (LTS) |
| 20.x | ✅ Supported | Yes (LTS) |
| 22.x | ✅ Supported | Yes (Current) |
| 24.x | ✅ Supported | Yes (Latest) |
| 16.x | ❌ Too old | No |
| 14.x | ❌ Too old | No |

### Supported npm Versions

| Version | Status |
|---------|--------|
| 10.x | ✅ Required minimum |
| 11.x | ✅ Supported |
| 9.x | ❌ Too old |
| 8.x | ❌ Too old |

## What If I Can't Upgrade?

### For Testing Only

You can bypass the engine check (NOT recommended for production):

```bash
npm install --engine-strict=false
```

**Warning:** The application may not work correctly with older Node versions.

### Why You Should Upgrade

1. **Security:** Older versions have known vulnerabilities
2. **Performance:** Newer versions are faster
3. **Compatibility:** Libraries may not work on old versions
4. **Support:** Older versions are no longer maintained

## Common Issues After Upgrading

### Issue: "command not found" after installing

**Solution:** Restart your terminal or add Node to PATH

**macOS/Linux:**
```bash
# Add to ~/.bashrc or ~/.zshrc
export PATH="/usr/local/bin:$PATH"
source ~/.bashrc  # or ~/.zshrc
```

**Windows:**
- Restart terminal as Administrator
- Or log out and log back in

### Issue: npm permissions errors

**Solution (macOS/Linux):**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Issue: Multiple Node versions conflict

**Solution:** Use nvm to manage versions
```bash
nvm list          # See installed versions
nvm use 20        # Switch to version 20
nvm alias default 20  # Set default
```

## Docker Users

If you're running in Docker, ensure your Dockerfile uses Node 18+:

```dockerfile
# Use Node 20 LTS
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "start"]
```

## CI/CD Configuration

### GitHub Actions

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
```

### GitLab CI

```yaml
image: node:20

before_script:
  - npm install
```

## Summary

✅ **Required:** Node.js 18+ and npm 10+
✅ **Recommended:** Node.js 20 LTS or 22 Current
✅ **Upgrade:** Via nodejs.org or nvm
✅ **Verify:** `node --version` and `npm --version`
✅ **Then:** `npm install` to reinstall dependencies

For detailed configuration information, see:
- [STREAM_CONFIGURATION.md](STREAM_CONFIGURATION.md) - Streaming setup
- [README.md](README.md) - General setup
- [OMNIVERSE_REAL_LIBRARY.md](OMNIVERSE_REAL_LIBRARY.md) - Library installation
