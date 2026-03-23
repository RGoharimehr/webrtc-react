import React, { Component } from "react";
import PropTypes from "prop-types";
import StreamConfig from "../stream.config.json";

const ICE_GATHERING_TIMEOUT_MS = 2500;

const _rtc = {
  pc: null,
  dataChannel: null,
  isConnected: false,
};

function _isDataChannelReady() {
  return !!_rtc.dataChannel && _rtc.dataChannel.readyState === "open";
}

class AppStream extends Component {
  constructor(props) {
    super(props);
    this.state = {
      streamReady: false,
      streamFailed: false,
    };
    this._requested = false;
  }

  componentDidMount() {
    this._requested = true;
    this.setState({ streamReady: false, streamFailed: false });

    this._startPythonWebRTC()
      .then(() => {
        if (!this._requested) return;
        this.setState({ streamReady: true, streamFailed: false });
        if (this.props.onStarted) {
          this.props.onStarted();
        }
      })
      .catch((err) => {
        console.warn("[AppStream] WebRTC failed, continuing UI:", err);
        if (!this._requested) return;

        this.setState({
          streamReady: true,
          streamFailed: true,
        });

        if (this.props.onStreamFailed) {
          this.props.onStreamFailed(err);
        }
      });
  }

  componentWillUnmount() {
    this._requested = false;
    AppStream.stop();
  }

  async _startPythonWebRTC() {
    const cfg = StreamConfig.python_webrtc || {};
    const host = cfg.server || "127.0.0.1";
    const port = cfg.port || 8001;
    const signalingUrl = `http://${host}:${port}/webrtc/offer`;

    const pc = new RTCPeerConnection();
    _rtc.pc = pc;

    pc.ontrack = (evt) => {
      if (evt.track.kind === "video") {
        const video = document.getElementById("remote-video");
        if (video) {
          video.srcObject = evt.streams[0];
          video.play().catch((err) => {
            console.warn("[AppStream] autoplay blocked:", err);
          });
        }
      }
    };

    const dc = pc.createDataChannel("bridge");
    _rtc.dataChannel = dc;

    dc.onopen = () => {
      _rtc.isConnected = true;
      console.log("[AppStream] data channel open");
    };

    dc.onclose = () => {
      _rtc.isConnected = false;
      console.log("[AppStream] data channel closed");
    };

    dc.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (this.props.handleCustomEvent) {
          this.props.handleCustomEvent(msg);
        }
      } catch (e) {
        console.warn("[AppStream] data channel parse error:", e);
      }
    };

    pc.addTransceiver("video", { direction: "recvonly" });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    await new Promise((resolve) => {
      if (pc.iceGatheringState === "complete") {
        resolve();
      } else {
        const onStateChange = () => {
          if (pc.iceGatheringState === "complete") {
            pc.removeEventListener("icegatheringstatechange", onStateChange);
            resolve();
          }
        };
        pc.addEventListener("icegatheringstatechange", onStateChange);
        setTimeout(resolve, ICE_GATHERING_TIMEOUT_MS);
      }
    });

    if (!this._requested) return;

    const response = await fetch(signalingUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sdp: pc.localDescription.sdp,
        type: pc.localDescription.type,
      }),
    });

    if (!response.ok) {
      throw new Error(`Signaling server returned HTTP ${response.status}`);
    }

    const answer = await response.json();

    if (!this._requested) return;
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
  }

  static sendMessage(message) {
    if (_isDataChannelReady()) {
      try {
        _rtc.dataChannel.send(message);
      } catch (error) {
        console.error("[AppStream] data channel send error:", error);
      }
    } else {
      console.warn("[AppStream] data channel not open, message dropped");
    }
  }

  static stop() {
    if (_rtc.pc) {
      try {
        _rtc.pc.close();
      } catch (error) {
        console.warn("[AppStream] error closing RTCPeerConnection:", error);
      }
      _rtc.pc = null;
      _rtc.dataChannel = null;
      _rtc.isConnected = false;
    }
  }

  render() {
    const { style = {} } = this.props;
    const { streamReady, streamFailed } = this.state;

    return (
      <div
        id="omniverse-stream-container"
        style={{
          backgroundColor: "#111",
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          ...style,
        }}
      >
        <video
          id="remote-video"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            visibility: streamReady && !streamFailed ? "visible" : "hidden",
          }}
          tabIndex={-1}
          playsInline
          muted
          autoPlay
        />
        <audio id="remote-audio" muted />

        {!streamReady && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "18px",
              textAlign: "center",
              background: "rgba(0,0,0,0.25)",
            }}
          >
            Connecting to Omniverse stream...
          </div>
        )}

        {streamReady && streamFailed && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "18px",
              textAlign: "center",
              background: "rgba(0,0,0,0.25)",
              padding: "20px",
            }}
          >
            Stream is unavailable right now. The rest of the web app is still active.
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
  handleCustomEvent: PropTypes.func,
};

AppStream.defaultProps = {
  style: {},
};

export default AppStream;