// Stub for @nvidia/omniverse-webrtc-streaming-library
// This is a placeholder when the actual library is not available

console.warn('Using stub for NVIDIA Omniverse WebRTC Streaming Library');
console.info('To use real Omniverse streaming, install: npm install');

export const AppStreamer = {
    connect: () => {
        return Promise.reject(new Error('NVIDIA Omniverse WebRTC Streaming Library not installed'));
    },
    sendMessage: (message) => {
        console.warn('Cannot send message - library not installed:', message);
    },
    stop: () => {
        console.warn('Cannot stop - library not installed');
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
