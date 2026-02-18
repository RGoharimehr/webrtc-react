import React, { Component } from 'react';
import PropTypes from 'prop-types';
import StreamConfig from '../stream.config.json';
// Use stub by default - can be replaced when real library is installed
import { AppStreamer } from '../lib/omniverse-webrtc-stub';

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

            let streamConfig;
            let streamSource;

            if (StreamConfig.source === 'local') {
                streamSource = 'DIRECT';
                streamConfig = {
                    videoElementId: 'remote-video',
                    audioElementId: 'remote-audio',
                    authenticate: true,
                    maxReconnects: 20,
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
                    onStop: (message) => { console.log('Stream stopped:', message) },
                    onTerminate: (message) => { console.log('Stream terminated:', message) }
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
                        if (this.props.onStreamFailed) {
                            this.props.onStreamFailed();
                        }
                    });
            } catch (error) {
                console.error('Error initializing AppStreamer:', error);
                if (this.props.onStreamFailed) {
                    this.props.onStreamFailed();
                }
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
        try {
            AppStreamer.stop();
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
                    <div style={{ 
                        fontSize: '14px', 
                        color: '#aaa', 
                        marginTop: '10px' 
                    }}>
                        Using stub library - install NVIDIA library for real streaming
                    </div>
                </div>
                
                {/* Add CSS animation for spinner */}
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
                
                {/* Placeholder content when stream is ready (stub mode) */}
                {this.state.streamReady && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                        color: 'white'
                    }}>
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎥</div>
                            <h2 style={{ marginBottom: '15px' }}>Omniverse Stream Connected (Stub Mode)</h2>
                            <p style={{ color: '#aaa', marginBottom: '10px' }}>
                                Video feed would appear here with real NVIDIA streaming library
                            </p>
                            <div style={{
                                display: 'inline-block',
                                padding: '8px 16px',
                                background: 'rgba(76, 175, 80, 0.3)',
                                border: '1px solid #4CAF50',
                                borderRadius: '4px',
                                marginTop: '15px'
                            }}>
                                ✓ Stream Active
                            </div>
                        </div>
                    </div>
                )}
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
