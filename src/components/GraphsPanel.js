import React, { useMemo, useImperativeHandle, useRef, useState, useEffect } from "react";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const num = (v, fallback = 0) => {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
};

const DEFAULT_LIVE = {
  temperature: 68.5,
  power: 125.8,
  pressure: 1.35,
  velocity: 2.4,
  humidity: 52,
};

const GraphsPanel = React.memo(
  React.forwardRef(({ bridge, plottingVariables }, ref) => {
    const [liveData, setLiveData] = useState(DEFAULT_LIVE);

    const iterationRef = useRef(0);
    const timeRef = useRef(0);

    // Track previous values so we can compute a simple trend (delta per update)
    const prevRef = useRef({ ...DEFAULT_LIVE });
    const trendRef = useRef({
      temperature: 0,
      power: 0,
      pressure: 0,
      velocity: 0,
      humidity: 0,
    });

    // ---- 1) Pull from bridge when available ----
    useEffect(() => {
      if (!bridge?.connected) return;

      // We assume the backend sends something like:
      // bridge.state.outputs = { temperature, pressure, power, velocity, humidity, ... }
      const out = bridge?.state?.outputs;
      if (!out) return;

      // Map outputs -> our UI fields (adjust keys if your backend uses different names)
      const next = {
        temperature: num(out.temperature, liveData.temperature),
        power: num(out.power, liveData.power),
        pressure: num(out.pressure, liveData.pressure),
        velocity: num(out.velocity, liveData.velocity),
        humidity: num(out.humidity, liveData.humidity),
      };

      // Optional clamping (keeps UI sane if backend spikes)
      next.temperature = clamp(next.temperature, 20, 90);
      next.power = clamp(next.power, 0, 200);
      next.pressure = clamp(next.pressure, 0.8, 2.8);
      next.velocity = clamp(next.velocity, 0, 6);
      next.humidity = clamp(next.humidity, 0, 100);

      // compute trends
      const prev = prevRef.current;
      trendRef.current = {
        temperature: next.temperature - prev.temperature,
        power: next.power - prev.power,
        pressure: next.pressure - prev.pressure,
        velocity: next.velocity - prev.velocity,
        humidity: next.humidity - prev.humidity,
      };
      prevRef.current = next;

      // time bookkeeping (if backend provides time/iteration, prefer it)
      iterationRef.current += 1;
      timeRef.current += 0.5;

      setLiveData(next);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      bridge?.connected,
      bridge?.state?.outputs, // if your state object identity changes, this will fire (OK)
    ]);

    // ---- 2) Fallback simulation ONLY when bridge is not connected ----
    useEffect(() => {
      if (bridge?.connected) return;

      const interval = setInterval(() => {
        setLiveData((prev) => {
          const next = {
            temperature: clamp(prev.temperature + (Math.random() - 0.5) * 2, 20, 90),
            power: clamp(prev.power + (Math.random() - 0.5) * 3, 0, 200),
            pressure: clamp(prev.pressure + (Math.random() - 0.5) * 0.1, 0.8, 2.8),
            velocity: clamp(prev.velocity + (Math.random() - 0.5) * 0.3, 0, 6),
            humidity: clamp(prev.humidity + (Math.random() - 0.5) * 1.5, 0, 100),
          };

          // trend vs previous
          trendRef.current = {
            temperature: next.temperature - prev.temperature,
            power: next.power - prev.power,
            pressure: next.pressure - prev.pressure,
            velocity: next.velocity - prev.velocity,
            humidity: next.humidity - prev.humidity,
          };
          prevRef.current = next;

          iterationRef.current += 1;
          timeRef.current += 0.5;

          return next;
        });
      }, 500);

      return () => clearInterval(interval);
    }, [bridge?.connected]);

    // Expose API to parent via ref
    useImperativeHandle(ref, () => ({
      getCurrentData: () => ({
        timestamp: new Date(),
        time: timeRef.current,
        iteration: iterationRef.current,
        distance: timeRef.current * 0.5, // Mock distance (keep or replace later)
        ...liveData,
      }),
    }));

    // Format trend as a signed string like "+0.12"
    const trendStr = (k, decimals = 2) => {
      const d = num(trendRef.current?.[k], 0);
      const s = d >= 0 ? "+" : "";
      return `${s}${d.toFixed(decimals)}`;
    };

    const activeGraphs = useMemo(() => {
      const graphs = {
        temperature: {
          enabled: plottingVariables.temperature,
          value: liveData.temperature,
          unit: "°C",
          trend: trendStr("temperature", 2),
          title: "Temperature Trend",
          stroke: "#ff6b6b",
          gradientId: "tempGradient",
          path: "M 0 60 L 15 50 L 30 55 L 45 45 L 60 48 L 75 40 L 90 38 L 105 35 L 120 38 L 135 30 L 150 33 L 165 28 L 180 30 L 195 25 L 210 28",
        },
        power: {
          enabled: plottingVariables.power,
          value: liveData.power,
          unit: "kW",
          trend: trendStr("power", 2),
          title: "Power Trend",
          stroke: "#86ef47",
          gradientId: "powerGradient",
          path: "M 0 45 L 15 42 L 30 44 L 45 38 L 60 40 L 75 36 L 90 34 L 105 38 L 120 32 L 135 34 L 150 30 L 165 32 L 180 28 L 195 30 L 210 26",
        },
        pressure: {
          enabled: plottingVariables.pressure,
          value: liveData.pressure,
          unit: "bar",
          trend: trendStr("pressure", 3),
          title: "Pressure Trend",
          stroke: "#0050E0",
          gradientId: "pressureGradient",
          path: "M 0 52 L 15 50 L 30 54 L 45 48 L 60 50 L 75 46 L 90 48 L 105 44 L 120 46 L 135 42 L 150 44 L 165 40 L 180 42 L 195 38 L 210 40",
        },
        velocity: {
          enabled: plottingVariables.velocity,
          value: liveData.velocity,
          unit: "m/s",
          trend: trendStr("velocity", 2),
          title: "Velocity Trend",
          stroke: "#00ffff",
          gradientId: "velocityGradient",
          path: "M 0 48 L 15 46 L 30 50 L 45 44 L 60 46 L 75 42 L 90 44 L 105 40 L 120 42 L 135 38 L 150 40 L 165 36 L 180 38 L 195 34 L 210 36",
        },
        humidity: {
          enabled: plottingVariables.humidity,
          value: liveData.humidity,
          unit: "%",
          trend: trendStr("humidity", 1),
          title: "Humidity Trend",
          stroke: "#4a9eff",
          gradientId: "humidityGradient",
          path: "M 0 50 L 15 48 L 30 52 L 45 46 L 60 48 L 75 44 L 90 46 L 105 42 L 120 44 L 135 40 L 150 42 L 165 38 L 180 40 L 195 36 L 210 38",
        },
      };

      const getTrendTone = (metricId, trendStrVal) => {
        const isPlus = String(trendStrVal).trim().startsWith("+");
        const isMinus = String(trendStrVal).trim().startsWith("-");

        if (metricId === "temperature") {
          if (isPlus) return "bad";
          if (isMinus) return "good";
          return "neutral";
        }

        if (metricId === "power") {
          if (isMinus) return "good";
          if (isPlus) return "bad";
          return "neutral";
        }

        return "neutral";
      };

      const metricOrder = ["temperature", "power", "pressure", "velocity", "humidity"];

      return metricOrder
        .map((key) => {
          const g = graphs[key];
          return { key, graph: g, tone: getTrendTone(key, g?.trend || "0") };
        })
        .filter((item) => item.graph?.enabled);
    }, [plottingVariables, liveData]);

    return (
      <div className="graphs-panel-inner">
        <div className="graphs-panel-content">
          {activeGraphs.map(({ key, graph: g, tone }) => (
            <div key={key} className="graph-card">
              <div className="graph-card-title">{g.title}</div>

              <div className="graph-visualization">
                <svg className="graph-spark" viewBox="0 0 210 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id={g.gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: g.stroke, stopOpacity: 0.35 }} />
                      <stop offset="100%" style={{ stopColor: g.stroke, stopOpacity: 0.05 }} />
                    </linearGradient>
                  </defs>
                  <path d={g.path} fill={`url(#${g.gradientId})`} stroke={g.stroke} strokeWidth="2" />
                </svg>
              </div>

              <div className="graph-metric-row">
                <div className="metric-current">
                  <div className="metric-current-label">Current</div>
                  <div className="metric-current-value">
                    {key === "humidity" ? g.value.toFixed(1) : g.value.toFixed(2)}
                    <span className="metric-unit">{g.unit}</span>
                  </div>
                </div>

                <div className={`metric-trend-chip ${tone}`}>
                  <span className="metric-trend-arrow" aria-hidden="true">
                    {String(g.trend).trim().startsWith("+")
                      ? "▲"
                      : String(g.trend).trim().startsWith("-")
                      ? "▼"
                      : "•"}
                  </span>
                  <span className="metric-trend-value">
                    {g.trend}
                    <span className="metric-unit">{g.unit}</span>
                  </span>
                  <span className="metric-trend-label">Trend</span>
                </div>
              </div>

              {/* Optional tiny footer to show source */}
              <div style={{ marginTop: 8, fontSize: 11, opacity: 0.6 }}>
                Source: {bridge?.connected ? "Bridge" : "Simulated"}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  })
);

export default GraphsPanel;
