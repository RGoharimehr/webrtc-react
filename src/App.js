import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { useBridge } from "./bridge/useBridge";
import { LEGEND_VARIABLES, LEGEND_PRESETS } from "./simulationEnv";

import OperatingConditions from "./tabs/OperatingConditions";
import GeometricalDesign from "./tabs/GeometricalDesign";
import ResultsVisualization from "./tabs/ResultsVisualization";
import Plotting from "./tabs/Plotting";
import Configuration from "./tabs/Configuration";
import ResultsMapping from "./tabs/ResultsMapping";
import CFDAnalysis from "./tabs/CFDAnalysis";

import GraphsPanel from "./components/GraphsPanel";
import DraggableResizable from "./components/DraggableResizable";
import AppStream from "./components/AppStream";

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

export default function App() {
  // ✅ hooks must be INSIDE the component
  const bridge = useBridge();

  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamKey, setStreamKey] = useState(0);

  // Streaming mode: "omniverse" | "screen" | null
  const [streamMode, setStreamMode] = useState(null);

  // Ref for screen sharing stream
  const screenStreamRef = useRef(null);
  const videoRef = useRef(null);

  // GraphsPanel API ref for data recording
  const graphsApiRef = useRef(null);

  // Docks
  const [hudExpanded, setHudExpanded] = useState(true);
  const [plotsExpanded, setPlotsExpanded] = useState(true);

  // Mode/tab state
  const [activeMode, setActiveMode] = useState(() => {
    return sessionStorage.getItem("activeMode") || "SIMULATE";
  });

  const [activeTab, setActiveTab] = useState(() => {
    const savedMode = sessionStorage.getItem("activeMode") || "SIMULATE";
    return sessionStorage.getItem(`activeTab:${savedMode}`) || MODE_TABS[savedMode][0];
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
  // Per-property manual min/max overrides: { [varId]: { min, max } }
  const [legendRanges, setLegendRanges] = useState({});

  const legendVarObj =
    LEGEND_VARIABLES.find((v) => v.id === legendVar) || LEGEND_VARIABLES[0];

  const legendGradient =
    (LEGEND_PRESETS.find((p) => p.id === legendPreset) || LEGEND_PRESETS[0]).gradient;

  const effectiveMin = legendRanges[legendVar]?.min ?? legendVarObj.min;
  const effectiveMax = legendRanges[legendVar]?.max ?? legendVarObj.max;

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
      saved && MODE_TABS[activeMode].includes(saved) ? saved : MODE_TABS[activeMode][0];
    setActiveTab(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach((t) => t.stop());
        }
      } catch (e) {
        console.warn("Cleanup error (stream):", e);
      }
    };
  }, [streamMode]);

  const stopScreenShare = () => {
    try {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    } catch (e) {
      console.warn("Error stopping screen share:", e);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    screenStreamRef.current = null;
    setIsStreaming(false);
    setStreamMode(null);
  };

  const disconnectOmniverseStream = () => {
    setIsStreaming(false);
    setStreamMode(null);
  };

  const startScreenShare = async () => {
    try {
      disconnectOmniverseStream();

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always", displaySurface: "monitor" },
        audio: false,
      });

      screenStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsStreaming(true);
      setStreamMode("screen");

      const [track] = stream.getVideoTracks();
      if (track) track.onended = () => stopScreenShare();
    } catch (err) {
      console.error("Error starting screen share:", err);
      alert("Failed to start screen sharing: " + err.message);
    }
  };

  const connectOmniverseStream = () => {
    stopScreenShare();
    setStreamKey((k) => k + 1);
    setIsStreaming(true);
    setStreamMode("omniverse");
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
        return <OperatingConditions bridge={bridge} />;
      case "Geometrical Design":
        return <GeometricalDesign bridge={bridge} />;
      case "Results Visualization":
        return (
          <ResultsVisualization
            bridge={bridge}
            legendVar={legendVar}
            setLegendVar={setLegendVar}
            legendPreset={legendPreset}
            setLegendPreset={setLegendPreset}
            legendVariables={LEGEND_VARIABLES}
            legendPresets={LEGEND_PRESETS}
            effectiveMin={effectiveMin}
            effectiveMax={effectiveMax}
          />
        );
      case "Plotting":
        return (
          <Plotting
            plottingVariables={plottingVariables}
            setPlottingVariables={setPlottingVariables}
            graphsApiRef={graphsApiRef}
          />
        );
      case "CFD Analysis":
        return <CFDAnalysis />;
      case "Configuration":
        return <Configuration bridge={bridge} />;
      case "Results Mapping":
        return <ResultsMapping />;
      default:
        return <OperatingConditions bridge={bridge} />;
    }
  };

  const stopActiveStream = () => {
    if (!isStreaming) return;
    if (streamMode === "screen") stopScreenShare();
    else disconnectOmniverseStream();
  };

  const updateLegendRange = (field, rawValue) => {
    const v = parseFloat(rawValue);
    if (Number.isFinite(v)) {
      setLegendRanges((r) => ({
        ...r,
        [legendVar]: { ...(r[legendVar] || {}), [field]: v },
      }));
    }
  };

  return (
    <div className="App">
      {/* Background Stream */}
      <div className="stream-background">
        {isStreaming ? (
          streamMode === "omniverse" ? (
            <AppStream
              key={streamKey}
              onStarted={() => console.log("Omniverse stream started")}
              onStreamFailed={() => {
                console.error("Omniverse stream failed");
                setIsStreaming(false);
                setStreamMode(null);
              }}
              onLoggedIn={(userId) => console.log("Logged in:", userId)}
              handleCustomEvent={(event) => console.log("Custom event:", event)}
            />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="stream-video" />
          )
        ) : (
          <div className="no-stream-overlay">
            <div className="start-prompt">
              <div className="prompt-icon">🛰️</div>
              <h2>Omniverse WebRTC Monitor</h2>
              <p>Choose a stream source</p>

              <button className="start-stream-button" onClick={connectOmniverseStream}>
                ▶ Connect Omniverse Stream
              </button>

              <div style={{ height: 10 }} />

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

        <GraphsPanel bridge={bridge} plottingVariables={plottingVariables} ref={graphsApiRef} />
      </DraggableResizable>

      {/* LEGEND */}
      {plotsExpanded && (
        <div className={`legend-vertical-frame ${legendOpen ? "open" : ""}`}>
          <div className="legend-top-row">
            <button className="legend-gear" onClick={() => setLegendOpen((v) => !v)}>
              ⚙
            </button>
          </div>

          <div className="legend-body">
            <div className="legend-values">
              <div className="legend-value-max">
                {effectiveMax}
                {legendVarObj.units}
              </div>
              <div className="legend-value-min">
                {effectiveMin}
                {legendVarObj.units}
              </div>
            </div>

            <div className="legend-bar-vertical-wrap">
              <div className="legend-bar-vertical" style={{ background: legendGradient }} />
            </div>
          </div>

          {legendOpen && (
            <div className="legend-settings-pop">
              <div className="legend-settings-grid">
                <div className="legend-setting">
                  <label className="legend-setting-label">Property</label>
                  <select
                    className="legend-select"
                    value={legendVar}
                    onChange={(e) => setLegendVar(e.target.value)}
                  >
                    {LEGEND_VARIABLES.map((v) => (
                      <option key={v.id} value={v.id}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div className="legend-setting">
                  <label className="legend-setting-label">Color Map</label>
                  <select
                    className="legend-select"
                    value={legendPreset}
                    onChange={(e) => setLegendPreset(e.target.value)}
                  >
                    {LEGEND_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="legend-setting">
                  <label className="legend-setting-label">Min ({legendVarObj.units})</label>
                  <input
                    type="number"
                    className="legend-range-input"
                    value={effectiveMin}
                    onChange={(e) => updateLegendRange("min", e.target.value)}
                  />
                </div>
                <div className="legend-setting">
                  <label className="legend-setting-label">Max ({legendVarObj.units})</label>
                  <input
                    type="number"
                    className="legend-range-input"
                    value={effectiveMax}
                    onChange={(e) => updateLegendRange("max", e.target.value)}
                  />
                </div>
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

          <span
            className={`streaming-pill ${bridge.connected ? "on" : "off"}`}
            style={{ marginLeft: 10, cursor: "default" }}
            title={bridge.connected ? "Bridge connected" : "Bridge disconnected"}
          >
            {bridge.connected ? "BRIDGE" : "NO BRIDGE"}
          </span>

          <button
            className={`streaming-pill ${isStreaming ? "on" : "off"}`}
            onClick={() => (!isStreaming ? connectOmniverseStream() : stopActiveStream())}
          >
            {isStreaming ? (streamMode === "screen" ? "SCREEN" : "STREAMING") : "START"}
          </button>
        </div>

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
