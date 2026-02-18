// Stub for @nvidia/omniverse-webrtc-streaming-library
// This is a placeholder when the actual library is not available
// It simulates the behavior of the real library for development

console.warn('Using stub for NVIDIA Omniverse WebRTC Streaming Library');
console.info('To use real Omniverse streaming, install: npm install');

// Simulate connection behavior
let isConnected = false;
let callbacks = {};

export const AppStreamer = {
    connect: (streamProps) => {
        console.log('AppStreamer.connect called with:', streamProps);
        
        const { streamConfig } = streamProps || {};
        if (!streamConfig) {
            return Promise.reject(new Error('No stream config provided'));
        }
        
        // Store callbacks
        callbacks = {
            onStart: streamConfig.onStart,
            onUpdate: streamConfig.onUpdate,
            onCustomEvent: streamConfig.onCustomEvent,
            onStop: streamConfig.onStop,
            onTerminate: streamConfig.onTerminate
        };
        
        // Simulate async connection with delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log('Simulating connection to Omniverse stream...');
                console.log('Server:', streamConfig.signalingServer);
                console.log('Port:', streamConfig.signalingPort);
                
                // Simulate authentication if needed
                if (streamConfig.authenticate && callbacks.onUpdate) {
                    callbacks.onUpdate({
                        action: 'authUser',
                        status: 'success',
                        info: 'stub-user-' + Date.now()
                    });
                }
                
                // Simulate successful connection
                if (callbacks.onStart) {
                    callbacks.onStart({
                        action: 'start',
                        status: 'success',
                        info: 'Stream started (stub mode)'
                    });
                }
                
                isConnected = true;
                resolve({
                    action: 'connect',
                    status: 'success',
                    info: 'Connected to stub stream'
                });
            }, 1500); // Simulate network delay
        });
    },
    
    sendMessage: (message) => {
        if (!isConnected) {
            console.warn('Cannot send message - not connected');
            return;
        }
        console.log('Stub: Sending message:', message);
        
        // Simulate message echo
        if (callbacks.onCustomEvent) {
            setTimeout(() => {
                try {
                    const msg = JSON.parse(message);
                    callbacks.onCustomEvent({
                        event_type: 'stub_echo',
                        payload: {
                            original: msg,
                            timestamp: Date.now()
                        }
                    });
                } catch (e) {
                    console.warn('Failed to parse message:', e);
                }
            }, 100);
        }
    },
    
    stop: () => {
        if (!isConnected) {
            console.warn('Already stopped or not connected');
            return;
        }
        
        console.log('Stub: Stopping stream');
        
        if (callbacks.onStop) {
            callbacks.onStop({
                action: 'stop',
                status: 'success',
                info: 'Stream stopped'
            });
        }
        
        isConnected = false;
        callbacks = {};
    }
};

export const StreamEvent = {};
export const StreamProps = {};
export const DirectConfig = {};
export const GFNConfig = {};
export const StreamType = {
    DIRECT: 'DIRECT',
    GFN: 'GFN'
};
