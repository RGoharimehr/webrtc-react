import React, { Component } from 'react';
import PropTypes from 'prop-types';
import StreamConfig from '../stream.config.json';
// Using real NVIDIA Omniverse WebRTC Streaming Library
import { AppStreamer, StreamType } from '@nvidia/omniverse-webrtc-streaming-library';

// Delay after calling AppStreamer.stop() before calling connect().
// The library Promise resolves client-side before the Omniverse NVST server
// finishes releasing its threads; connecting too soon causes NVST_R_BUSY.
const NVST_SERVER_TEARDOWN_DELAY_MS = 2000;

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
        // Wait for any previous session to fully stop on the server before connecting.
        // Calling connect() while the server is still tearing down causes NVST_R_BUSY.
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

        if (!this._requested) return; // component was unmounted while stopping

        // Give the Omniverse NVST server time to fully release its threads after stop().
        // The library Promise resolves client-side before server-side teardown completes,
        // so connecting too soon causes NVST_R_BUSY errors.
        await new Promise((resolve) => setTimeout(resolve, NVST_SERVER_TEARDOWN_DELAY_MS));

        if (!this._requested) return; // check again after the delay

        let streamConfig;
        let streamSource;

        if (StreamConfig.source === 'local') {
            streamSource = StreamType.DIRECT;
            streamConfig = {
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
        } else {
            console.error(`Unknown or unsupported stream source: ${StreamConfig.source}`);
            return;
        }

        try {
            const streamProps = { streamConfig, streamSource };
            AppStreamer.connect(streamProps)
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
        this._requested = false; // allow _startStream to bail if stop() completes after unmount
        try {
            const stopResult = AppStreamer.stop();
            if (stopResult && typeof stopResult.catch === 'function') {
                stopResult.catch((error) => console.warn('Error stopping AppStreamer:', error));
            }
        } catch (error) {
            console.warn('Error stopping AppStreamer:', error);
        }
    }

    static sendMessage(message) {
        try {
            AppStreamer.sendMessage(message);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    static stop() {
        try {
            AppStreamer.stop();
        } catch (error) {
            console.warn('Error stopping AppStreamer:', error);
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
        if (this.props.handleCustomEvent) {
            this.props.handleCustomEvent(message);
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
