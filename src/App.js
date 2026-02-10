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
   Legend config (NEW)
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
     "linear-gradient(180deg, #30123b, #4456c7, #2ab9a1, #aadb32, #f9e721)",
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
   gradient:
     "linear-gradient(180deg, #000000, #ffffff)",
  },
];

function App() {
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

  const [screenStream, setScreenStream] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Docks
  const [hudExpanded, setHudExpanded] = useState(true);
  const [plotsExpanded, setPlotsExpanded] = useState(true);

  const videoRef = useRef(null);

  // Shared plotting state
  const [plottingVariables, setPlottingVariables] = useState({
    temperature: true,
    pressure: false,
    velocity: false,
    power: true,
    humidity: false,
  });

  /* =========================
     Legend state (NEW)
     ========================= */
  const [legendOpen, setLegendOpen] = useState(false);
  const [legendVar, setLegendVar] = useState("temperature");
  const [legendPreset, setLegendPreset] = useState("viridis");

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

  useEffect(() => {
    if (videoRef.current && screenStream) {
      videoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  const tabs = MODE_TABS[activeMode];

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always", displaySurface: "monitor" },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      setScreenStream(stream);
      setIsStreaming(true);

      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (error) {
      console.error("Error starting screen share:", error);
      alert("Failed to start screen sharing: " + error.message);
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
    }
    setScreenStream(null);
    setIsStreaming(false);
  };

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

  return (
    <div className="App">
      {/* Background Stream */}
      <div className="stream-background">
        {isStreaming ? (
          <video ref={videoRef} autoPlay playsInline className="stream-video" />
        ) : (
          <div className="no-stream-overlay">
            <div className="start-prompt">
              <div className="prompt-icon">🖥️</div>
              <h2>WebRTC Data Center Monitor</h2>
              <p>Start screen sharing to monitor your data center</p>
              <button className="start-stream-button" onClick={startScreenShare}>
                ▶ Start Screen Sharing
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
        >
          {plotsExpanded ? "‹" : "›"}
        </button>
      </div>

      {/* LEFT PANEL (SLIDES ITSELF) */}
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

      {/* ✅ LEGEND (NEW) — shows only when left panel is open */}
      {plotsExpanded && (
          <div className={`legend-vertical-frame ${legendOpen ? "open" : ""}`}>
            {/* Top row: gear only */}
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

            {/* Body: values + vertical bar */}
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

            {/* Settings (only when open) */}
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
        >
          {hudExpanded ? "›" : "‹"}
        </button>
      </div>

      {/* RIGHT PANEL (SLIDES ITSELF) */}
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

          {/* Neon STREAMING pill (click => stop) */}
          <button
            className={`streaming-pill ${isStreaming ? "on" : "off"}`}
            onClick={isStreaming ? stopScreenShare : startScreenShare}
            title={
              isStreaming ? "Click to stop streaming" : "Click to start streaming"
            }
          >
            {isStreaming ? "STREAMING" : "START"}
          </button>
        </div>

        {/* MODE BAR */}
        <div className="hud-mode-nav">
          <div className="hud-mode-scroll">
            {MODE_ORDER.map((mode) => (
              <button
                key={mode}
                className={`hud-mode-button ${
                  activeMode === mode ? "active" : ""
                }`}
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
                className={`hud-tab-button ${
                  activeTab === tab ? "active" : ""
                }`}
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

      {/* Bottom strip unchanged */}
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
