# Camera Feature Guide

## Overview

The WebRTC Camera Controller now displays your local webcam feed instead of receiving remote video streams. This guide explains how to use the camera feature.

## Getting Started

### Starting the Camera

1. Open the application in your web browser
2. Click the **"Start Camera"** button in the video stream panel
3. Your browser will ask for camera permission
4. Click **"Allow"** to grant camera access
5. Your camera feed will appear in the video display area

### Stopping the Camera

1. Click the **"Stop Camera"** button
2. The camera will turn off and the video feed will stop
3. The display will return to the initial state

## Camera States

The application displays different states with color-coded indicators:

| State | Indicator | Description |
|-------|-----------|-------------|
| **Inactive** | ⚪ inactive | Camera is not started |
| **Requesting** | 🟡 requesting | Waiting for camera permission |
| **Active** | 🟢 active | Camera is streaming |
| **Denied** | 🔴 denied | User denied camera permission |
| **No Camera** | 🔴 no camera | No camera device found |
| **Error** | 🔴 error | Other camera access error |

## Troubleshooting

### Permission Denied

**Problem**: Browser shows "Camera permission denied" error

**Solutions**:
1. Click the camera icon in your browser's address bar
2. Select "Always allow" for camera access
3. Refresh the page and try again
4. Check browser settings → Privacy & Security → Camera permissions

### No Camera Found

**Problem**: Application shows "No camera found" error

**Solutions**:
1. Check if your camera is physically connected
2. Ensure no other application is using the camera
3. Try unplugging and reconnecting USB cameras
4. Check Device Manager (Windows) or System Settings (Mac) to verify camera is detected
5. Update camera drivers if needed

### Camera Not Working

**Problem**: Camera permission granted but video doesn't show

**Solutions**:
1. Try refreshing the page
2. Close other applications using the camera
3. Restart your browser
4. Try a different browser
5. Check if camera works in other applications

## Browser Requirements

The camera feature requires:
- Modern web browser (Chrome 53+, Firefox 36+, Safari 11+, Edge 79+)
- Camera device (built-in or USB)
- HTTPS connection (or localhost for development)
- Camera permissions granted

## Privacy & Security

- Camera access is requested only when you click "Start Camera"
- No video is recorded or transmitted to any server
- Video stays local to your browser
- Camera turns off completely when you click "Stop Camera"
- You can revoke camera permissions anytime in browser settings

## Camera Settings

The application requests:
- **Resolution**: 1280x720 (HD) preferred
- **Facing Mode**: User-facing camera (front camera)
- **Audio**: Disabled (video only)

The browser may use a different resolution if HD is not available.

## Developer Notes

### MediaDevices API

The application uses the standard MediaDevices API:

```typescript
navigator.mediaDevices.getUserMedia({
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user'
  },
  audio: false
})
```

### Error Handling

The component handles three main error types:

1. **NotAllowedError / PermissionDeniedError**: User denied permission
2. **NotFoundError / DevicesNotFoundError**: No camera device found
3. **Other errors**: Generic camera access errors

### Cleanup

When stopping the camera or unmounting the component, all media tracks are properly stopped:

```typescript
mediaStream.getTracks().forEach(track => track.stop());
```

## Common Use Cases

### Video Conferencing
Use as a preview for video calls before joining a meeting.

### Photo/Video Capture
Can be extended to capture still images or record video.

### AR/VR Applications
Provides camera feed for augmented reality overlays.

### Computer Vision
Can be used as input for ML models or image processing.

## Future Enhancements

Potential features that could be added:
- Camera selection (if multiple cameras available)
- Resolution selection
- Photo capture button
- Video recording
- Filters and effects
- Mirror mode toggle
- Zoom controls

## Support

For issues or questions:
- Check browser console for detailed error messages
- Verify camera works in other applications
- Ensure you're using a supported browser
- Try in a different browser to isolate the issue
