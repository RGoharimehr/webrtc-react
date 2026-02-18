import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AppStreamer, StreamEvent } from '@nvidia/omniverse-webrtc-streaming-library';
import StreamConfig from '../stream.config.json';

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
                    visibility: this.state.streamReady ? 'visible' : 'hidden',
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
                    }}
                    tabIndex={-1}
                    playsInline
                    muted
                    autoPlay
                />
                <audio id="remote-audio" muted></audio>
                {!this.state.streamReady && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        fontSize: '18px',
                        textAlign: 'center'
                    }}>
                        Connecting to Omniverse stream...
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
