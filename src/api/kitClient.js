/**
 * WebSocket API Client for Omniverse Kit Extension
 * 
 * Handles:
 * - WebSocket connection management
 * - Request/response messaging with requestId tracking
 * - Server push updates (events)
 * - Auto-reconnection
 */

class KitClient {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.pendingRequests = new Map(); // requestId -> { resolve, reject, timer }
    this.requestIdCounter = 0;
    this.eventListeners = new Map(); // eventType -> Set of callbacks
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000; // ms
    this.reconnectTimer = null;
    this.requestTimeout = 30000; // 30 seconds
    this.autoReconnect = true;
    
    // Connection settings from environment
    this.host = process.env.REACT_APP_KIT_API_HOST || 'localhost';
    this.port = process.env.REACT_APP_KIT_API_PORT || '49080';
    this.proto = process.env.REACT_APP_KIT_API_PROTO || 'ws';
  }

  /**
   * Connect to the WebSocket server
   */
  connect() {
    if (this.isConnected || this.isConnecting) {
      console.warn('Already connected or connecting to Kit API');
      return Promise.resolve();
    }

    this.isConnecting = true;
    const url = `${this.proto}://${this.host}:${this.port}`;
    console.log(`Connecting to Kit API: ${url}`);

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('✅ Kit API connected');
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this._emit('connected');
          resolve();
        };

        this.ws.onclose = (event) => {
          console.log('Kit API disconnected', event.code, event.reason);
          this.isConnected = false;
          this.isConnecting = false;
          this._emit('disconnected');
          
          // Reject all pending requests
          this.pendingRequests.forEach((pending, requestId) => {
            clearTimeout(pending.timer);
            pending.reject(new Error('Connection closed'));
          });
          this.pendingRequests.clear();

          // Auto-reconnect if enabled
          if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
            this.reconnectTimer = setTimeout(() => {
              this.connect().catch(err => console.error('Reconnect failed:', err));
            }, this.reconnectDelay);
          }
        };

        this.ws.onerror = (error) => {
          console.error('Kit API error:', error);
          this.isConnecting = false;
          this._emit('error', error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this._handleMessage(message);
          } catch (err) {
            console.error('Failed to parse Kit API message:', err, event.data);
          }
        };
      } catch (err) {
        this.isConnecting = false;
        reject(err);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    this.autoReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
  }

  /**
   * Send a request and wait for response
   * @param {string} type - Message type (e.g., 'inputs.get', 'sim.startTransient')
   * @param {object} payload - Request payload (optional)
   * @returns {Promise} - Resolves with response payload or rejects with error
   */
  async sendRequest(type, payload = {}) {
    if (!this.isConnected) {
      throw new Error('Not connected to Kit API. Call connect() first.');
    }

    const requestId = `req_${++this.requestIdCounter}_${Date.now()}`;
    const request = {
      type,
      requestId,
      payload
    };

    return new Promise((resolve, reject) => {
      // Set timeout
      const timer = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Request timeout: ${type}`));
      }, this.requestTimeout);

      // Store pending request
      this.pendingRequests.set(requestId, { resolve, reject, timer });

      // Send request
      try {
        this.ws.send(JSON.stringify(request));
      } catch (err) {
        this.pendingRequests.delete(requestId);
        clearTimeout(timer);
        reject(err);
      }
    });
  }

  /**
   * Handle incoming message (response or push)
   */
  _handleMessage(message) {
    const { type, requestId, ok, payload, error } = message;

    // Check if this is a response to a pending request
    if (requestId && this.pendingRequests.has(requestId)) {
      const pending = this.pendingRequests.get(requestId);
      this.pendingRequests.delete(requestId);
      clearTimeout(pending.timer);

      if (ok !== false) {
        pending.resolve(payload);
      } else {
        const err = new Error(error?.message || 'Request failed');
        err.code = error?.code;
        err.details = error?.details;
        pending.reject(err);
      }
      return;
    }

    // Handle push messages (no requestId or not matched)
    if (type && type.startsWith('push.')) {
      const eventType = type.substring(5); // Remove 'push.' prefix
      this._emit(eventType, payload);
      this._emit('push', { type: eventType, payload });
      return;
    }

    // Log unhandled messages
    console.warn('Unhandled message from Kit API:', message);
  }

  /**
   * Subscribe to server push events
   * @param {string} eventType - Event type (e.g., 'outputs', 'status')
   * @param {function} callback - Callback function
   */
  on(eventType, callback) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType).add(callback);
  }

  /**
   * Unsubscribe from server push events
   */
  off(eventType, callback) {
    if (this.eventListeners.has(eventType)) {
      this.eventListeners.get(eventType).delete(callback);
    }
  }

  /**
   * Emit event to listeners
   */
  _emit(eventType, data) {
    if (this.eventListeners.has(eventType)) {
      this.eventListeners.get(eventType).forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error(`Error in event listener for '${eventType}':`, err);
        }
      });
    }
  }

  /**
   * Ping the server
   */
  async ping() {
    return this.sendRequest('ping');
  }

  /**
   * Get server status
   */
  async getStatus() {
    return this.sendRequest('status.get');
  }

  /**
   * Get current inputs
   */
  async getInputs() {
    return this.sendRequest('inputs.get');
  }

  /**
   * Set inputs
   */
  async setInputs(inputs) {
    return this.sendRequest('inputs.set', inputs);
  }

  /**
   * Get configuration
   */
  async getConfig() {
    return this.sendRequest('config.get');
  }

  /**
   * Set configuration
   */
  async setConfig(config) {
    return this.sendRequest('config.set', config);
  }

  /**
   * Start transient simulation
   */
  async startTransient() {
    return this.sendRequest('sim.startTransient');
  }

  /**
   * Stop transient simulation
   */
  async stopTransient() {
    return this.sendRequest('sim.stopTransient');
  }

  /**
   * Load steady state
   */
  async loadSteadyState() {
    return this.sendRequest('sim.loadSteadyState');
  }

  /**
   * Get current outputs
   */
  async getOutputs() {
    return this.sendRequest('outputs.get');
  }

  /**
   * Get history data
   */
  async getHistory(options = {}) {
    return this.sendRequest('history.get', options);
  }

  /**
   * Clear history buffer
   */
  async clearHistory() {
    return this.sendRequest('history.clear');
  }

  /**
   * Set visualization property
   */
  async setVizProperty(property) {
    return this.sendRequest('viz.setProperty', { property });
  }

  /**
   * Set visualization colormap
   */
  async setVizColormap(colormap, minBound, maxBound) {
    return this.sendRequest('viz.setColormap', { colormap, minBound, maxBound });
  }

  /**
   * Refresh visualization
   */
  async refreshViz() {
    return this.sendRequest('viz.refresh');
  }

  /**
   * Get visualization options
   */
  async getVizOptions() {
    return this.sendRequest('viz.getOptions');
  }

  /**
   * Apply results mapping
   */
  async applyMapping() {
    return this.sendRequest('mapping.apply');
  }

  /**
   * Export project as ZIP
   */
  async exportZip() {
    return this.sendRequest('mapping.exportZip');
  }

  /**
   * Import project from ZIP
   */
  async importZip(path) {
    return this.sendRequest('mapping.importZip', { path });
  }

  /**
   * Start recording
   */
  async startRecording(options = {}) {
    return this.sendRequest('record.start', options);
  }

  /**
   * Stop recording
   */
  async stopRecording() {
    return this.sendRequest('record.stop');
  }

  /**
   * Export recording
   */
  async exportRecording() {
    return this.sendRequest('record.export');
  }
}

// Create singleton instance
const kitClient = new KitClient();

export default kitClient;
