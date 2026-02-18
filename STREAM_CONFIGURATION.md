# Stream Configuration Guide

This guide explains how to configure the Omniverse WebRTC streaming for different deployment scenarios.

## Overview

The `stream.config.json` file controls how the client connects to Omniverse Kit applications. Three streaming modes are supported:

1. **Local** - Direct connection to a Kit app running on your machine or local network
2. **Stream (OKAS)** - Omniverse Kit Application Streaming (on-demand cloud streaming)
3. **GFN** - Graphics Delivery Network (NVIDIA's cloud gaming infrastructure)

## Current Configuration

The application is currently configured for **local streaming** (default):

```json
{
  "source": "local",
  "local": {
    "server": "127.0.0.1",
    "signalingPort": 49100,
    "mediaPort": null
  }
}
```

This connects to an Omniverse Kit application running on your local machine.

## Configuration Options

### 1. Local Streaming

**Use when:** Running Kit application on the same machine or local network

```json
{
  "source": "local",
  "local": {
    "server": "127.0.0.1",        // IP address of machine running Kit
    "signalingPort": 49100,        // WebRTC signaling port (default: 49100)
    "mediaPort": null              // Media port (null = use default)
  }
}
```

**Steps to use:**
1. Start Omniverse Kit with WebRTC streaming extension enabled
2. Verify Kit is listening on port 49100: `curl http://127.0.0.1:49100`
3. Update `server` if Kit is on another machine (e.g., `"192.168.1.100"`)
4. Run the app: `npm start`
5. Click "Connect Omniverse Stream"

### 2. Omniverse Kit Application Streaming (OKAS)

**Use when:** Need on-demand cloud streaming of Kit applications

```json
{
  "source": "stream",
  "stream": {
    "appServer": "https://your-app-server.com",      // Optional: default app server
    "streamServer": "https://your-stream-server.com"  // Optional: default stream server
  }
}
```

**Features:**
- On-demand Kit app provisioning
- Select from available applications and versions
- Choose performance profiles
- Automatic session management

**Configuration:**
- `appServer` and `streamServer` are optional
- Can be set in UI when connecting
- Requires OKAS API access and credentials

**Workflow:**
1. Client requests streaming session from OKAS API
2. API returns session ID
3. Client polls until session is ready
4. Connection parameters are used to connect
5. Session auto-terminates on disconnect or timeout

### 3. Graphics Delivery Network (GDN/GFN)

**Use when:** Using NVIDIA's GeForce NOW infrastructure

```json
{
  "source": "gfn",
  "gfn": {
    "catalogClientId": "your-catalog-client-id",  // Required
    "clientId": "your-client-id",                 // Required
    "cmsId": 12345                                // Required: CMS ID number
  }
}
```

**Features:**
- Similar to OKAS but uses GFN infrastructure
- Different authentication mechanism
- Requires GFN credentials

**Configuration:**
- All three fields are **required**
- Obtain credentials from NVIDIA GFN portal
- Contact NVIDIA for access

## Environment-Specific Configurations

### Development (Local)

For development, use local streaming:

```json
{
  "source": "local",
  "local": {
    "server": "127.0.0.1",
    "signalingPort": 49100,
    "mediaPort": null
  }
}
```

**Advantages:**
- ✅ Fast iteration (no cloud delays)
- ✅ No credentials needed
- ✅ Full debugging access
- ✅ No usage costs

### Testing (OKAS/Stream)

For integration testing with cloud:

```json
{
  "source": "stream",
  "stream": {
    "appServer": "https://test-app-server.nvidia.com",
    "streamServer": "https://test-stream-server.nvidia.com"
  }
}
```

**Advantages:**
- ✅ Test cloud integration
- ✅ Validate API interactions
- ✅ Test session management
- ✅ No local Kit needed

### Production (OKAS/GFN)

For production deployment:

```json
{
  "source": "stream",  // or "gfn" depending on infrastructure
  "stream": {
    "appServer": "https://prod-app-server.nvidia.com",
    "streamServer": "https://prod-stream-server.nvidia.com"
  }
}
```

**Requirements:**
- ✅ Production credentials
- ✅ Proper error handling
- ✅ Session timeout management
- ✅ Monitoring and logging

## Configuration via Environment Variables

You can also configure streaming via `.env` file:

```env
# Omniverse streaming configuration
REACT_APP_OV_SIGNAL_HOST=127.0.0.1
REACT_APP_OV_SIGNAL_PORT=49100

# App configuration
PORT=3001
```

**Note:** The app currently reads from `.env` for backward compatibility, but `stream.config.json` is the preferred method.

## Switching Between Modes

To switch streaming modes:

1. **Edit `stream.config.json`:**
   ```bash
   # Open in editor
   nano stream.config.json
   # or
   code stream.config.json
   ```

2. **Change the `source` field:**
   ```json
   "source": "local"   // or "stream" or "gfn"
   ```

3. **Update corresponding configuration section**

4. **Restart the application:**
   ```bash
   npm start
   ```

## Troubleshooting

### Local Mode Issues

**Problem:** "Connection refused" or timeout
```
Failed to connect to 127.0.0.1:49100
```

**Solutions:**
1. Verify Kit is running: `ps aux | grep kit` (Linux/Mac) or Task Manager (Windows)
2. Check port: `netstat -an | grep 49100`
3. Verify WebRTC extension is enabled in Kit
4. Check firewall settings
5. Try different port if 49100 is in use

**Problem:** Video appears but is frozen

**Solutions:**
1. Check Kit's GPU is available
2. Verify Kit viewport is rendering
3. Check network bandwidth
4. Look at Kit's console for errors

### Stream/OKAS Mode Issues

**Problem:** "Unauthorized" or authentication errors

**Solutions:**
1. Verify credentials are correct
2. Check API endpoint URLs
3. Ensure you have OKAS access
4. Check if credentials expired

**Problem:** "Session timeout" during provisioning

**Solutions:**
1. Increase `maxReconnectAttempts` in config
2. First connection may be slow (shader caching)
3. Check OKAS service status
4. Verify network connectivity

### GFN Mode Issues

**Problem:** "Invalid CMS ID"

**Solutions:**
1. Verify CMS ID is correct number (not string)
2. Check catalogClientId format
3. Ensure GFN account is active

## Advanced Configuration

### Custom Reconnection Settings

You can add reconnection settings to any mode:

```json
{
  "source": "local",
  "reconnect": {
    "maxAttempts": 5,
    "delayMs": 2000,
    "backoffMultiplier": 1.5
  }
}
```

### Multiple Server Configuration

For load balancing or failover:

```json
{
  "source": "local",
  "local": {
    "servers": [
      {"server": "192.168.1.100", "signalingPort": 49100},
      {"server": "192.168.1.101", "signalingPort": 49100}
    ]
  }
}
```

**Note:** This requires custom implementation in `AppStream.js`

## Testing Your Configuration

### Verify Configuration Syntax

```bash
# Validate JSON
cat stream.config.json | python -m json.tool
# or
node -e "console.log(JSON.parse(require('fs').readFileSync('stream.config.json')))"
```

### Test Local Connection

```bash
# Test if Kit is listening
curl http://127.0.0.1:49100

# Expected: Some response (not "connection refused")
```

### Test Stream/OKAS Connection

Use NVIDIA's API test tools or:

```bash
# Test app server
curl https://your-app-server.com/health

# Test stream server
curl https://your-stream-server.com/health
```

## Reference

### Complete stream.config.json Template

```json
{
  "$comment": "Choose source: 'local', 'stream', or 'gfn'",
  "source": "local",
  
  "local": {
    "$comment": "Configuration for local Kit streaming",
    "server": "127.0.0.1",
    "signalingPort": 49100,
    "mediaPort": null
  },
  
  "stream": {
    "$comment": "Configuration for OKAS streaming",
    "appServer": "",
    "streamServer": ""
  },
  
  "gfn": {
    "$comment": "Configuration for GFN streaming",
    "catalogClientId": "",
    "clientId": "",
    "cmsId": 0
  }
}
```

### Related Files

- `src/components/AppStream.js` - Streaming component implementation
- `.env` - Environment variables (legacy configuration)
- `OMNIVERSE_REAL_LIBRARY.md` - Library setup guide
- `README.md` - General setup instructions

## Getting Help

If you encounter issues:

1. Check this guide for your specific scenario
2. Review logs in browser console (F12)
3. Check Kit's console for errors
4. Verify network connectivity
5. Consult NVIDIA Omniverse documentation
6. Check GitHub issues for similar problems

## Summary

- **Local mode** (default): Best for development, requires Kit running locally
- **Stream/OKAS mode**: On-demand cloud streaming, requires credentials
- **GFN mode**: NVIDIA infrastructure streaming, requires GFN access
- Configuration in `stream.config.json` controls streaming behavior
- Switch modes by changing `source` field and updating relevant sections
