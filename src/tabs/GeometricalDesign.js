import React, { useEffect, useRef, useState } from "react";

const DEFAULTS = {
  serverHeight: 2.0,
  serverWidth: 0.6,
  serverDepth: 1.0,
  aisleWidth: 1.5,
  ceilingHeight: 3.0,
  rackCount: 20,
};

const GeometricalDesign = ({ bridge }) => {
  const [geometry, setGeometry] = useState(DEFAULTS);

  // ---- Debounce bridge sends (prevents spam while dragging) ----
  const pendingRef = useRef({});
  const flushTimerRef = useRef(null);

  const flushPending = () => {
    const pending = pendingRef.current;
    pendingRef.current = {};
    flushTimerRef.current = null;

    try {
      for (const [k, v] of Object.entries(pending)) {
        bridge?.setInput?.("static", k, v);
      }
    } catch (e) {
      console.warn("Bridge setInput failed:", e);
    }
  };

  const scheduleFlush = () => {
    if (flushTimerRef.current) return;
    flushTimerRef.current = setTimeout(flushPending, 120); // tweak 80–200ms
  };

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    };
  }, []);

  // ---- Pull backend snapshot -> update UI ----
  useEffect(() => {
    const backendStatic = bridge?.state?.inputs?.static;
    if (!backendStatic) return;

    setGeometry((prev) => {
      let changed = false;
      const next = { ...prev };

      for (const key of Object.keys(DEFAULTS)) {
        const incoming = backendStatic[key];
        if (incoming === undefined || incoming === null) continue;

        const normalized =
          key === "rackCount" ? parseInt(incoming, 10) : parseFloat(incoming);

        if (Number.isFinite(normalized) && next[key] !== normalized) {
          next[key] = normalized;
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [bridge?.state?.inputs?.static]);

  const handleGeometryChange = (param, rawValue) => {
    const value =
      param === "rackCount" ? parseInt(rawValue, 10) : parseFloat(rawValue);

    setGeometry((prev) => ({ ...prev, [param]: value }));

    // queue update, flush with debounce
    pendingRef.current[param] = value;
    scheduleFlush();
  };

  return (
    <div>
      <div className="section">
        <h2 className="section-title">Geometric Parameters</h2>

        <div className="input-row">
          <label className="input-label">Server Height [m]:</label>
          <div className="input-control">
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value={geometry.serverHeight}
              onChange={(e) => handleGeometryChange("serverHeight", e.target.value)}
            />
            <span className="value-display">{geometry.serverHeight} m</span>
          </div>
        </div>

        <div className="input-row">
          <label className="input-label">Server Width [m]:</label>
          <div className="input-control">
            <input
              type="range"
              min="0.3"
              max="1.0"
              step="0.05"
              value={geometry.serverWidth}
              onChange={(e) => handleGeometryChange("serverWidth", e.target.value)}
            />
            <span className="value-display">{geometry.serverWidth} m</span>
          </div>
        </div>

        <div className="input-row">
          <label className="input-label">Server Depth [m]:</label>
          <div className="input-control">
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={geometry.serverDepth}
              onChange={(e) => handleGeometryChange("serverDepth", e.target.value)}
            />
            <span className="value-display">{geometry.serverDepth} m</span>
          </div>
        </div>

        <div className="input-row">
          <label className="input-label">Aisle Width [m]:</label>
          <div className="input-control">
            <input
              type="range"
              min="0.8"
              max="3.0"
              step="0.1"
              value={geometry.aisleWidth}
              onChange={(e) => handleGeometryChange("aisleWidth", e.target.value)}
            />
            <span className="value-display">{geometry.aisleWidth} m</span>
          </div>
        </div>

        <div className="input-row">
          <label className="input-label">Ceiling Height [m]:</label>
          <div className="input-control">
            <input
              type="range"
              min="2.5"
              max="5.0"
              step="0.1"
              value={geometry.ceilingHeight}
              onChange={(e) => handleGeometryChange("ceilingHeight", e.target.value)}
            />
            <span className="value-display">{geometry.ceilingHeight} m</span>
          </div>
        </div>

        <div className="input-row">
          <label className="input-label">Number of Racks:</label>
          <div className="input-control">
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={geometry.rackCount}
              onChange={(e) => handleGeometryChange("rackCount", e.target.value)}
            />
            <span className="value-display">{geometry.rackCount}</span>
          </div>
        </div>

        {/* small connection indicator */}
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 10 }}>
          Bridge: {bridge?.connected ? "Connected" : "Disconnected"}
        </div>
      </div>

    </div>
  );
};

export default GeometricalDesign;
