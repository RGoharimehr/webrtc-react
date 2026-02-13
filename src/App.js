import React, { useState, useEffect, useRef } from "react";
import "./App.css";

import OperatingConditions from "./tabs/OperatingConditions";
import GeometricalDesign from "./tabs/GeometricalDesign";
import ResultsVisualization from "./tabs/ResultsVisualization";
import Plotting from "./tabs/Plotting";
import Configuration from "./tabs/Configuration";
import ResultsMapping from "./tabs/ResultsMapping";
import CFDAnalysis from "./tabs/CFDAnalysis";

import GraphsPanel from "./components/GraphsPanel";
import DraggableResizable from "./components/DraggableResizable";

/* =========================
   Mode and Tab Configuration
   ========================= */
const MODE_ORDER = ["SIMULATE", "AI", "BUILD"];

const MODE_TABS = {
  SIMULATE: [
    "Operating Conditions",
    "Geometrical Design",
    "Results Visualization",
    "Plotting",
    "CFD Analysis",
  ],
  AI: ["AI"],
  BUILD: ["Configuration", "Results Mapping"],
};

/* =========================
   Legend config
   ========================= */
const LEGEND_VARIABLES = [
  { id: "temperature", label: "Temperature", units: "°C", min: 20, max: 90 },
  { id: "pressure", label: "Pressure", units: "bar", min: 0.8, max: 2.8 },
  { id: "power", label: "Power", units: "kW", min: 0, max: 200 },
  { id: "velocity", label: "Velocity", units: "m/s", min: 0, max: 6 },
  { id: "humidity", label: "Humidity", units: "%", min: 0, max: 100 },
];

const LEGEND_PRESETS = [
  {
    id: "viridis",
    name: "Viridis",
    gradient: "linear-gradient(180deg, #440154, #31688e, #35b779, #fde725)",
  },
  {
    id: "inferno",
    name: "Inferno",
    gradient:
      "linear-gradient(180deg, #000004, #420a68, #932567, #dd513a, #fca50a, #fcffa4)",
  },
  {
    id: "magma",
    name: "Magma",
    gradient:
      "linear-gradient(180deg, #000004, #3b0f70, #8c2981, #de4968, #fe9f6d, #fcfdbf)",
  },
  {
    id: "plasma",
    name: "Plasma",
    gradient:
      "linear-gradient(180deg, #0d0887, #7e03a8, #cc4678, #f89441, #f0f921)",
  },
  {
    id: "turbo",
    name: "Turbo",
    gradient:
      "linear-gradient(180deg, #30123b, #3b4cc0, #2ab9a1, #aadb32, #e6550d, #7f0000)",
  },
  {
    id: "coolwarm",
    name: "Cool–Warm",
    gradient:
      "linear-gradient(180deg, #3b4cc0, #788bff, #e6e6e6, #f2906b, #b40426)",
  },
  {
    id: "gray",
    name: "Grayscale",
    gradient: "linear-gradient(180deg, #000000, #ffffff)",
  },
];

function App() {
  // WebRTC refs
  const pcRef = useRef(null);
  const wsRef = useRef(null);
  const videoRef = useRef(null);

  // Streaming state
  const [screenStream, setScreenStream] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Streaming mode: "omniverse" | "screen" | null
  const [streamMode, setStreamMode] = useState(null);
  
  // Ref to track current stream for cleanup
  const screenStreamRef = useRef(null);

  // Docks
  const [hudExpanded, setHudExpanded] = useState(true);
  const [plotsExpanded, setPlotsExpanded] = useState(true);

  // Mode/tab state
  const [activeMode, setActiveMode] = useState(() => {
    return sessionStorage.getItem("activeMode") || "SIMULATE";
  });

  const [activeTab, setActiveTab] = useState(() => {
    const savedMode = sessionStorage.getItem("activeMode") || "SIMULATE";
    return (
      sessionStorage.getItem(`activeTab:${savedMode}`) ||
      MODE_TABS[savedMode][0]
    );
  });

  // Shared plotting state
  const [plottingVariables, setPlottingVariables] = useState({
    temperature: true,
    pressure: false,
    velocity: false,
    power: true,
    humidity: false,
  });

  // Legend state
  const [legendOpen, setLegendOpen] = useState(false);
  const [legendVar, setLegendVar] = useState("temperature");
  const [legendPreset, setLegendPreset] = useState("turbo");

  const legendVarObj =
    LEGEND_VARIABLES.find((v) => v.id === legendVar) || LEGEND_VARIABLES[0];

  const legendGradient =
    (LEGEND_PRESETS.find((p) => p.id === legendPreset) || LEGEND_PRESETS[0])
      .gradient;

  // Persist mode & tab per mode
  useEffect(() => {
    sessionStorage.setItem("activeMode", activeMode);
  }, [activeMode]);

  useEffect(() => {
    sessionStorage.setItem(`activeTab:${activeMode}`, activeTab);
  }, [activeTab, activeMode]);

  // When switching modes, restore that mode’s last tab (or default)
  useEffect(() => {
    const saved = sessionStorage.getItem(`activeTab:${activeMode}`);
    const next =
      saved && MODE_TABS[activeMode].includes(saved)
        ? saved
        : MODE_TABS[activeMode][0];
    setActiveTab(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode]);

  // Attach stream to video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = screenStream || null;
    }
  }, [screenStream]);

  // Keep ref in sync with screenStream for cleanup
  useEffect(() => {
    screenStreamRef.current = screenStream;
  }, [screenStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (pcRef.current) pcRef.current.close();
        if (wsRef.current) wsRef.current.close();
      } catch (e) {
        console.warn("Cleanup error (WebRTC):", e);
      }
      try {
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach((t) => t.stop());
        }
      } catch (e) {
        console.warn("Cleanup error (stream):", e);
      }
    };
  }, []);

  const stopScreenShare = () => {
    try {
      if (screenStream) {
        screenStream.getTracks().forEach((t) => t.stop());
      }
    } catch (e) {
      console.warn("Error stopping screen share:", e);
    }
    setScreenStream(null);
    setIsStreaming(false);
    setStreamMode(null);
  };

  const disconnectOmniverseStream = () => {
    try {
      if (pcRef.current) pcRef.current.close();
      if (wsRef.current) wsRef.current.close();
    } catch (e) {
      console.warn("Error disconnecting Omniverse stream:", e);
    }

    pcRef.current = null;
    wsRef.current = null;
    setScreenStream(null);
    setIsStreaming(false);
    setStreamMode(null);
  };

  const startScreenShare = async () => {
    try {
      // Stop any active Omniverse session first
      disconnectOmniverseStream();

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always", displaySurface: "monitor" },
        audio: false,
      });

      setScreenStream(stream);
      setIsStreaming(true);
      setStreamMode("screen");

      const [track] = stream.getVideoTracks();
      if (track) track.onended = () => stopScreenShare();
    } catch (err) {
      console.error("Error starting screen share:", err);
      alert("Failed to start screen sharing: " + err.message);
    }
  };

  const connectOmniverseStream = async () => {
    // Stop any active screen-share first
    stopScreenShare();

    // Use env if set; otherwise use localhost defaults
    const host = process.env.REACT_APP_OV_SIGNAL_HOST || "localhost";
    const port = process.env.REACT_APP_OV_SIGNAL_PORT || "49100";
    const proto = process.env.REACT_APP_OV_SIGNAL_PROTO || "ws";

    const wsUrl = `${proto}://${host}:${port}`;
    console.log("Connecting to Omniverse signaling:", wsUrl);

    // reset any old session
    disconnectOmniverseStream();

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) {
        setScreenStream(stream);
        setIsStreaming(true);
        setStreamMode("omniverse");
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ candidate: e.candidate }));
      }
    };

    ws.onopen = () => {
      console.log("Signaling connected.");
      // Some server builds require a kickoff message to request an offer.
      // If you need it, uncomment ONE:
      // ws.send(JSON.stringify({ action: "request_offer" }));
      // ws.send(JSON.stringify({ type: "request_offer" }));
    };

    ws.onmessage = async (evt) => {
      let msg;
      try {
        msg = JSON.parse(evt.data);
      } catch (e) {
        console.warn("Non-JSON signaling message:", evt.data);
        return;
      }

      console.log("Signal:", msg);

      try {
        // Pattern A: { sdp: { type:"offer", sdp:"..." } }
        if (msg.sdp && msg.sdp.type) {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ws.send(JSON.stringify({ sdp: pc.localDescription }));
          return;
        }

        // Pattern B: { type:"offer", sdp:"..." }
        if (msg.type === "offer" && msg.sdp) {
          await pc.setRemoteDescription(
            new RTCSessionDescription({ type: "offer", sdp: msg.sdp })
          );
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ws.send(JSON.stringify({ type: "answer", sdp: pc.localDescription.sdp }));
          return;
        }

        // ICE candidates
        const cand =
          msg.candidate || (msg.type === "candidate" ? msg.candidate : null);
        if (cand) {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
          return;
        }
      } catch (err) {
        console.error("Error handling signaling message:", err);
      }
    };

    ws.onerror = (e) => {
      console.error("WebSocket error:", e);
      alert(`Failed to connect to Omniverse signaling: ${wsUrl}`);
      disconnectOmniverseStream();
    };

    ws.onclose = () => {
      console.log("Signaling closed.");
      disconnectOmniverseStream();
    };
  };

  const tabs = MODE_TABS[activeMode];

  const renderTabContent = () => {
    if (activeMode === "AI") {
      return (
        <div className="section">
          <h2 className="section-title">AI</h2>
          <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            AI workflow UI placeholder (surrogate, optimization, agent, etc.)
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "Operating Conditions":
        return <OperatingConditions />;
      case "Geometrical Design":
        return <GeometricalDesign />;
      case "Results Visualization":
        return <ResultsVisualization />;
      case "Plotting":
        return (
          <Plotting
            plottingVariables={plottingVariables}
            setPlottingVariables={setPlottingVariables}
          />
        );
      case "CFD Analysis":
        return <CFDAnalysis />;
      case "Configuration":
        return <Configuration />;
      case "Results Mapping":
        return <ResultsMapping />;
      default:
        return <OperatingConditions />;
    }
  };

  const stopActiveStream = () => {
    if (!isStreaming) return;
    if (streamMode === "screen") stopScreenShare();
    else disconnectOmniverseStream();
  };

  return (
    <div className="App">
      {/* Background Stream */}
      <div className="stream-background">
        {isStreaming ? (
          <video ref={videoRef} autoPlay playsInline muted className="stream-video" />
        ) : (
          <div className="no-stream-overlay">
            <div className="start-prompt">
              <div className="prompt-icon">🛰️</div>
              <h2>Omniverse WebRTC Monitor</h2>
              <p>Choose a stream source</p>

              {/* Button 1: Omniverse */}
              <button className="start-stream-button" onClick={connectOmniverseStream}>
                ▶ Connect Omniverse Stream
              </button>

              <div style={{ height: 10 }} />

              {/* Button 2: Desktop screen share */}
              <button
                className="start-stream-button"
                onClick={startScreenShare}
                style={{
                  background: "rgba(255,255,255,0.10)",
                  color: "var(--text-primary)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  boxShadow: "none",
                }}
              >
                🖥️ Screen Share (Desktop)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* LEFT DOCK HANDLE */}
      <div className="dock-panel dock-left">
        <button
          className="dock-handle"
          onClick={() => setPlotsExpanded((v) => !v)}
          title={plotsExpanded ? "Hide panel" : "Show panel"}
          aria-label={plotsExpanded ? "Hide metrics panel" : "Show metrics panel"}
        >
          {plotsExpanded ? "‹" : "›"}
        </button>
      </div>

      {/* LEFT PANEL */}
      <DraggableResizable
        initialX={14}
        initialY={14}
        initialWidth={260}
        initialHeight={650}
        minWidth={220}
        minHeight={240}
        maxWidth={420}
        maxHeight={920}
        title="Live Metrics"
        hideDefaultHeader={true}
        className={`dock-slide-left ${plotsExpanded ? "open" : "closed"}`}
      >
        <div className="drag-handle panel-header-custom" title="Drag to move">
          <span className="panel-title">Live Metrics</span>
        </div>

        <GraphsPanel plottingVariables={plottingVariables} />
      </DraggableResizable>

      {/* LEGEND */}
      {plotsExpanded && (
        <div className={`legend-vertical-frame ${legendOpen ? "open" : ""}`}>
          <div className="legend-top-row">
            <button
              className="legend-gear"
              onClick={() => setLegendOpen((v) => !v)}
              title="Legend settings"
              aria-label="Legend settings"
            >
              ⚙
            </button>
          </div>

          <div className="legend-body">
            <div className="legend-values">
              <div className="legend-value-max">
                {legendVarObj.max}
                {legendVarObj.units}
              </div>

              <div className="legend-value-min">
                {legendVarObj.min}
                {legendVarObj.units}
              </div>
            </div>

            <div className="legend-bar-vertical-wrap">
              <div
                className="legend-bar-vertical"
                style={{ background: legendGradient }}
                aria-hidden="true"
              />
            </div>
          </div>

          {legendOpen && (
            <div className="legend-settings-pop">
              <div className="legend-settings-head">
                <div className="legend-settings-title">Legend Settings</div>
                <button
                  className="legend-settings-close"
                  onClick={() => setLegendOpen(false)}
                  aria-label="Close legend settings"
                >
                  ✕
                </button>
              </div>

              <div className="legend-settings-grid">
                <label className="legend-setting">
                  <div className="legend-setting-label">Variable</div>
                  <select
                    className="legend-select"
                    value={legendVar}
                    onChange={(e) => setLegendVar(e.target.value)}
                  >
                    {LEGEND_VARIABLES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="legend-setting">
                  <div className="legend-setting-label">Palette</div>
                  <select
                    className="legend-select"
                    value={legendPreset}
                    onChange={(e) => setLegendPreset(e.target.value)}
                  >
                    {LEGEND_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RIGHT DOCK HANDLE */}
      <div className="dock-panel dock-right">
        <button
          className="dock-handle"
          onClick={() => setHudExpanded((v) => !v)}
          title={hudExpanded ? "Hide panel" : "Show panel"}
          aria-label={hudExpanded ? "Hide dashboard panel" : "Show dashboard panel"}
        >
          {hudExpanded ? "›" : "‹"}
        </button>
      </div>

      {/* RIGHT PANEL */}
      <DraggableResizable
        initialX={Math.max(20, window.innerWidth - 320)}
        initialY={14}
        initialWidth={300}
        initialHeight={720}
        minWidth={270}
        minHeight={280}
        maxWidth={520}
        maxHeight={930}
        title="Dashboard Control"
        hideDefaultHeader={true}
        className={`dock-slide-right ${hudExpanded ? "open" : "closed"}`}
      >
        <div className="drag-handle panel-header-custom" title="Drag to move">
          <span className="panel-title">Dashboard Control</span>

          {/* Streaming pill controls active stream mode */}
          <button
            className={`streaming-pill ${isStreaming ? "on" : "off"}`}
            onClick={() => {
              if (!isStreaming) {
                // Default START = Omniverse (you can change to screen if you want)
                connectOmniverseStream();
              } else {
                stopActiveStream();
              }
            }}
            title={
              isStreaming
                ? streamMode === "screen"
                  ? "Click to stop screen sharing"
                  : "Click to disconnect Omniverse stream"
                : "Click to start Omniverse stream"
            }
          >
            {isStreaming ? (streamMode === "screen" ? "SCREEN" : "STREAMING") : "START"}
          </button>
        </div>

        {/* MODE BAR */}
        <div className="hud-mode-nav">
          <div className="hud-mode-scroll">
            {MODE_ORDER.map((mode) => (
              <button
                key={mode}
                className={`hud-mode-button ${activeMode === mode ? "active" : ""}`}
                onClick={() => setActiveMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* SUB-TABS */}
        <div className="hud-tab-navigation">
          <div className="hud-tab-scroll">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`hud-tab-button ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="hud-content">{renderTabContent()}</div>
      </DraggableResizable>

      {/* Bottom strip */}
      <div className="key-metrics-viewport">
        <div className="kms-item">
          <span className="kms-label">PUE</span>
          <span className="kms-value">1.42</span>
        </div>
        <div className="kms-sep" />
        <div className="kms-item">
          <span className="kms-label">Tmax</span>
          <span className="kms-value">68.5°C</span>
        </div>
        <div className="kms-sep" />
        <div className="kms-item">
          <span className="kms-label">Pcond</span>
          <span className="kms-value">N/A</span>
        </div>
      </div>
    </div>
  );
}

export default App;
