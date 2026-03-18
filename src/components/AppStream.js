import React, { Component } from 'react';
import PropTypes from 'prop-types';
import StreamConfig from '../stream.config.json';
// Legacy: NVIDIA Omniverse WebRTC Streaming Library (used only for 'local' source)
import { AppStreamer, StreamType } from '@nvidia/omniverse-webrtc-streaming-library';

// Delay before reconnecting when using the legacy 'local' (NVIDIA NVST) source.
// The library Promise resolves client-side before the Omniverse NVST server
// finishes releasing its threads; connecting too soon causes NVST_R_BUSY.
const NVST_SERVER_TEARDOWN_DELAY_MS = 2000;

// Maximum milliseconds to wait for the browser's ICE gathering to complete
// before sending the (possibly partial) SDP offer to the Python server.
const ICE_GATHERING_TIMEOUT_MS = 5000;

// ─────────────────────────────────────────────────────────────────────────────
// Module-level state for the Python WebRTC path (used by static methods).
// Using a plain object avoids stale-closure issues across component remounts.
// ─────────────────────────────────────────────────────────────────────────────
const _rtc = {
    pc: null,           // RTCPeerConnection instance
    dataChannel: null,  // RTCDataChannel instance (created by this side)
    isConnected: false,
};

/** Returns true when the Python WebRTC data channel is open and ready. */
function _isDataChannelReady() {
    return _rtc.dataChannel !== null && _rtc.dataChannel.readyState === 'open';
}

class AppStream extends Component {
    constructor(props) {
        super(props);
        
        this._requested = false;
        this.state = {
            streamReady: false
        };
    }

    componentDidMount() {
        if (!this._requested) {
            this._requested = true;
            this._startStream();
        }
    }

    async _startStream() {
        if (StreamConfig.source === 'python_webrtc') {
            // ── Python / Aiortc path ─────────────────────────────────────────
            // Close any existing peer connection before creating a new one.
            if (_rtc.pc) {
                try { _rtc.pc.close(); } catch (_) { /* ignore */ }
                _rtc.pc = null;
                _rtc.dataChannel = null;
                _rtc.isConnected = false;
            }

            if (!this._requested) return;

            const { server, port } = StreamConfig.python_webrtc;
            const signalingUrl = `http://${server}:${port}/webrtc/offer`;

            try {
                await this._startPythonWebRtcStream(signalingUrl);
            } catch (error) {
                console.error('Python WebRTC stream error:', error);
                if (this._requested && this.props.onStreamFailed) {
                    this.props.onStreamFailed();
                }
            }
            return;
        }

        if (StreamConfig.source === 'local') {
            // ── Legacy NVIDIA Omniverse NVST path ────────────────────────────
            // Wait for any previous session to fully stop on the server before
            // connecting.  Calling connect() while the server is still tearing
            // down causes NVST_R_BUSY.
            try {
                const stopResult = AppStreamer.stop();
                if (stopResult && typeof stopResult.then === 'function') {
                    await stopResult.catch((err) =>
                        console.warn('AppStreamer.stop() before connect:', err)
                    );
                }
            } catch (error) {
                console.warn('AppStreamer.stop() before connect failed:', error);
            }

            if (!this._requested) return;

            // Give the Omniverse NVST server time to fully release its threads
            // after stop().
            await new Promise((resolve) => setTimeout(resolve, NVST_SERVER_TEARDOWN_DELAY_MS));

            if (!this._requested) return;

            const streamSource = StreamType.DIRECT;
            const streamConfig = {
                videoElementId: 'remote-video',
                audioElementId: 'remote-audio',
                authenticate: true,
                maxReconnects: 0,
                signalingServer: StreamConfig.local.server,
                signalingPort: StreamConfig.local.signalingPort,
                mediaServer: StreamConfig.local.server,
                ...(StreamConfig.local.mediaPort != null && { mediaPort: StreamConfig.local.mediaPort }),
                nativeTouchEvents: true,
                width: 1920,
                height: 1080,
                fps: 60,
                onUpdate: (message) => this._onUpdate(message),
                onStart: (message) => this._onStart(message),
                onCustomEvent: (message) => this._onCustomEvent(message),
                onStop: (message) => { console.log('Stream stopped:', message); },
                onTerminate: (message) => { console.log('Stream terminated:', message); }
            };

            try {
                AppStreamer.connect({ streamConfig, streamSource })
                    .then((result) => {
                        console.info('AppStreamer connected:', result);
                    })
                    .catch((error) => {
                        console.error('AppStreamer connection error:', error);
                        if (this._requested && this.props.onStreamFailed) {
                            this.props.onStreamFailed();
                        }
                    });
            } catch (error) {
                console.error('Error initializing AppStreamer:', error);
                if (this._requested && this.props.onStreamFailed) {
                    this.props.onStreamFailed();
                }
            }
            return;
        }

        console.error(`Unknown or unsupported stream source: ${StreamConfig.source}`);
    }

    /**
     * Start a WebRTC stream via the Python aiortc signalling server.
     *
     * Uses native browser RTCPeerConnection rather than the Node.js NVIDIA
     * library, eliminating the extra runtime and the marshalling overhead
     * when sharing values with the Python simulation backend.
     *
     * @param {string} signalingUrl  Full URL of the POST /webrtc/offer endpoint.
     */
    async _startPythonWebRtcStream(signalingUrl) {
        const pc = new RTCPeerConnection({ iceServers: [] });
        _rtc.pc = pc;

        // ── Incoming media track ──────────────────────────────────────────────
        pc.ontrack = (evt) => {
            if (evt.track.kind === 'video') {
                const video = document.getElementById('remote-video');
                if (video) {
                    video.srcObject = evt.streams[0];
                    video.play().catch((err) =>
                        console.warn('Auto-play blocked:', err)
                    );
                }
            }
        };

        // ── Data channel (bidirectional message passing) ──────────────────────
        const dc = pc.createDataChannel('bridge');
        _rtc.dataChannel = dc;

        dc.onopen = () => {
            _rtc.isConnected = true;
            console.info('[Python WebRTC] data channel open');
            this._onStart({ action: 'start', status: 'success', info: 'Python WebRTC stream ready' });
        };

        dc.onclose = () => {
            _rtc.isConnected = false;
            console.info('[Python WebRTC] data channel closed');
        };

        dc.onmessage = (evt) => {
            try {
                const msg = JSON.parse(evt.data);
                this._onCustomEvent(msg);
            } catch (e) {
                console.warn('[Python WebRTC] data channel message parse error:', e);
            }
        };

        // ── Signalling: create offer → POST to Python server → set answer ─────

        // Add a recvonly video transceiver so the offer includes a video m-section.
        // The Python aiortc server will respond with a sendonly track in the answer.
        pc.addTransceiver('video', { direction: 'recvonly' });

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Wait for ICE gathering to complete so the offer SDP contains all
        // local candidates.  This is sufficient for localhost connections and
        // matches the server-side gather-then-respond strategy in webrtc_server.py.
        await new Promise((resolve) => {
            if (pc.iceGatheringState === 'complete') {
                resolve();
            } else {
                const onStateChange = () => {
                    if (pc.iceGatheringState === 'complete') {
                        pc.removeEventListener('icegatheringstatechange', onStateChange);
                        resolve();
                    }
                };
                pc.addEventListener('icegatheringstatechange', onStateChange);
                // Fallback timeout so we never block indefinitely
                setTimeout(resolve, ICE_GATHERING_TIMEOUT_MS);
            }
        });

        if (!this._requested) return;

        const response = await fetch(signalingUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sdp: pc.localDescription.sdp, type: pc.localDescription.type }),
        });

        if (!response.ok) {
            throw new Error(`Signalling server returned HTTP ${response.status}`);
        }

        const answer = await response.json();

        if (!this._requested) return;

        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.info('[Python WebRTC] peer connection established');
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.streamReady === false && this.state.streamReady === true) {
            const video = document.getElementById('remote-video');
            if (video) {
                video.tabIndex = -1;
                video.playsInline = true;
                video.muted = true;
                video.play().catch(err => console.warn('Auto-play failed:', err));
            }
        }
    }

    componentWillUnmount() {
        this._requested = false;
        AppStream.stop();
    }

    static sendMessage(message) {
        console.log('[PrimQuery] AppStream.sendMessage — sending:', message);
        if (StreamConfig.source === 'python_webrtc') {
            // Python WebRTC path: send through the data channel
            if (_isDataChannelReady()) {
                try {
                    _rtc.dataChannel.send(message);
                    console.log('[PrimQuery] AppStream.sendMessage — sent via data channel');
                } catch (error) {
                    console.error('[PrimQuery] AppStream.sendMessage — data channel send ERROR:', error);
                }
            } else {
                console.warn('[PrimQuery] AppStream.sendMessage — data channel not open, message dropped');
            }
        } else {
            // Legacy NVIDIA library path
            try {
                AppStreamer.sendMessage(message);
                console.log('[PrimQuery] AppStream.sendMessage — AppStreamer.sendMessage() returned (no error thrown)');
            } catch (error) {
                console.error('[PrimQuery] AppStream.sendMessage — ERROR:', error);
            }
        }
    }

    static stop() {
        if (StreamConfig.source === 'python_webrtc') {
            // Python WebRTC path: close the peer connection
            if (_rtc.pc) {
                try { _rtc.pc.close(); } catch (error) {
                    console.warn('Error closing RTCPeerConnection:', error);
                }
                _rtc.pc = null;
                _rtc.dataChannel = null;
                _rtc.isConnected = false;
            }
        } else {
            // Legacy NVIDIA library path
            try {
                AppStreamer.stop();
            } catch (error) {
                console.warn('Error stopping AppStreamer:', error);
            }
        }
    }

    _onStart(message) {
        if (message.action === 'start' && message.status === 'success' && !this.state.streamReady) {
            console.info('Stream ready');
            this.setState({ streamReady: true });
            if (this.props.onStarted) {
                this.props.onStarted();
            }
        }

        if (message.status === "error") {
            console.error('Stream error:', message.info);
            if (this.props.onStreamFailed) {
                this.props.onStreamFailed();
            }
        }
    }

    _onUpdate(message) {
        try {
            if (message.action === 'authUser' && message.status === 'success') {
                console.info('User authenticated:', message.info);
                if (this.props.onLoggedIn) {
                    this.props.onLoggedIn(message.info);
                }
            }
        } catch (error) {
            console.error('Update error:', error, message);
        }
    }

    _onCustomEvent(message) {
        console.log("[PrimQuery] AppStream._onCustomEvent — raw message from Kit:", message);
        if (this.props.handleCustomEvent) {
            this.props.handleCustomEvent(message);
        } else {
            console.warn("[PrimQuery] AppStream._onCustomEvent — handleCustomEvent prop not set, message dropped");
        }
    }

    render() {
        const { style = {} } = this.props;

        return (
            <div
                key="stream-container"
                id="omniverse-stream-container"
                style={{
                    backgroundColor: this.state.streamReady ? 'transparent' : '#1a1a1a',
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    ...style
                }}
            >
                <video
                    key="video-canvas"
                    id="remote-video"
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        visibility: this.state.streamReady ? 'visible' : 'hidden'
                    }}
                    tabIndex={-1}
                    playsInline
                    muted
                    autoPlay
                />
                <audio id="remote-audio" muted></audio>
                
                {/* Connection status overlay */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    fontSize: '18px',
                    textAlign: 'center',
                    visibility: this.state.streamReady ? 'hidden' : 'visible'
                }}>
                    <div style={{ marginBottom: '20px' }}>
                        <div className="spinner" style={{
                            border: '4px solid rgba(255, 255, 255, 0.3)',
                            borderTop: '4px solid white',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 15px'
                        }}></div>
                    </div>
                    <div>Connecting to Omniverse stream...</div>
                </div>
                
                {/* Add CSS animation for spinner */}
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }
}

AppStream.propTypes = {
    style: PropTypes.object,
    onStarted: PropTypes.func,
    onStreamFailed: PropTypes.func,
    onLoggedIn: PropTypes.func,
    handleCustomEvent: PropTypes.func
};

AppStream.defaultProps = {
    style: {}
};

export default AppStream;
