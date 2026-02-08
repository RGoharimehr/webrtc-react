# Usage Examples

## Basic Setup

### 1. Starting the Application

```bash
# Development mode
npm start

# Production build
npm run build
npm install -g serve
serve -s build
```

### 2. Connecting to Omniverse

Update `src/App.tsx` to point to your Omniverse WebRTC server:

```typescript
<WebRTCStream 
  serverUrl="ws://your-omniverse-server.com:8080"
  onConnectionStateChange={handleConnectionStateChange}
/>
```

## Implementing WebRTC Data Channel

To send commands to Omniverse, you'll need to implement the data channel communication:

```typescript
// In src/components/WebRTCStream.tsx

const connectWebRTC = async () => {
  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  });

  // Create data channel for commands
  const dataChannel = pc.createDataChannel('commands');
  
  dataChannel.onopen = () => {
    console.log('Data channel opened');
    // Notify parent component
    onDataChannelReady?.(dataChannel);
  };

  dataChannel.onmessage = (event) => {
    console.log('Received message:', event.data);
    // Handle responses from Omniverse
  };

  // ... rest of WebRTC setup
};
```

## Sending Commands

### Example: Start Simulation

```typescript
const handleSendCommand = (command: string, params?: any) => {
  if (dataChannel && dataChannel.readyState === 'open') {
    const message = JSON.stringify({
      type: 'command',
      command: command,
      params: params,
      timestamp: Date.now()
    });
    
    dataChannel.send(message);
    console.log('Sent command:', command, params);
  } else {
    console.error('Data channel not ready');
  }
};
```

### Example: Adjust Parameters

```typescript
const handleParameterChange = (parameter: string, value: any) => {
  if (dataChannel && dataChannel.readyState === 'open') {
    const message = JSON.stringify({
      type: 'parameter',
      name: parameter,
      value: value,
      timestamp: Date.now()
    });
    
    dataChannel.send(message);
    console.log('Sent parameter:', parameter, value);
  }
};
```

## Custom Commands

Add new commands to `src/components/CommandPanel.tsx`:

```typescript
const availableCommands: Command[] = [
  // ... existing commands
  {
    name: 'customCommand',
    label: 'Custom Command',
    description: 'Your custom command description',
    params: ['param1', 'param2']  // Optional parameters
  }
];
```

## Receiving Stream Statistics

Track real-time stream statistics:

```typescript
pc.getStats().then((stats) => {
  stats.forEach((report) => {
    if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
      const fps = report.framesPerSecond || 0;
      const bitrate = (report.bytesReceived * 8) / 1000; // kbps
      
      setStreamStats({
        fps,
        bitrate,
        latency: report.jitter || 0
      });
    }
  });
});
```

## Integration with Omniverse Kit

### Server-Side Setup (Python)

```python
# Example Omniverse Kit extension
import asyncio
import json
from aiortc import RTCPeerConnection, RTCSessionDescription

class WebRTCStreamingExtension:
    def __init__(self):
        self.pc = None
        self.data_channel = None
        
    async def setup_webrtc(self):
        self.pc = RTCPeerConnection()
        
        @self.pc.on("datachannel")
        def on_datachannel(channel):
            self.data_channel = channel
            
            @channel.on("message")
            def on_message(message):
                data = json.loads(message)
                self.handle_command(data)
    
    def handle_command(self, data):
        command = data.get('command')
        params = data.get('params', {})
        
        if command == 'startSimulation':
            self.start_simulation(params)
        elif command == 'stopSimulation':
            self.stop_simulation()
        # ... handle other commands
```

## Customizing the UI

### Changing Colors

Edit `src/App.css` and component CSS files:

```css
/* Change primary color from NVIDIA green to your brand color */
.btn-primary {
  background: #your-color;
}

.panel-header {
  background: linear-gradient(135deg, #your-color 0%, #darker-shade 100%);
}
```

### Adding New Parameters

In `src/components/ControlPanel.tsx`:

```typescript
const [newParameter, setNewParameter] = useState(50);

// In the JSX:
<div className="control-group">
  <label htmlFor="new-parameter">
    New Parameter: <span className="value-display">{newParameter}</span>
  </label>
  <input
    id="new-parameter"
    type="range"
    min="0"
    max="100"
    value={newParameter}
    onChange={(e) => {
      const value = parseInt(e.target.value);
      setNewParameter(value);
      onParameterChange?.('newParameter', value);
    }}
    className="slider"
  />
</div>
```

## Troubleshooting

### Issue: WebRTC connection fails

**Solution:**
1. Check that the server URL is correct
2. Verify firewall settings allow WebRTC ports
3. Check browser console for error messages
4. Ensure STUN/TURN servers are accessible

### Issue: Video not displaying

**Solution:**
1. Verify the WebRTC track is being received
2. Check `ontrack` event handler
3. Ensure video element `srcObject` is set correctly

### Issue: Commands not being sent

**Solution:**
1. Check data channel state: `dataChannel.readyState === 'open'`
2. Verify JSON message format
3. Check server-side command handler

## Best Practices

1. **Error Handling**: Always wrap WebRTC operations in try-catch blocks
2. **Connection State**: Monitor and display connection state to users
3. **Reconnection**: Implement automatic reconnection on failure
4. **Message Validation**: Validate command parameters before sending
5. **Performance**: Monitor frame rate and adjust quality accordingly

## Example Integration

See the reference implementation at:
- [NVIDIA Omniverse Blueprints](https://github.com/NVIDIA-Omniverse-Blueprints/digital-twins-for-fluid-simulation)
- [Omniverse Kit Documentation](https://docs.omniverse.nvidia.com/ovas/latest/index.html)
