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
            title={isStreaming ? "Click to stop streaming" : "Click to start streaming"}
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
