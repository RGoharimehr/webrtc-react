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

// Per-variable display ranges — must match LEGEND_VARIABLES in simulationEnv.js
const VAR_RANGES = {
  temperature: { lo: 20,  hi: 90  },
  power:       { lo: 0,   hi: 200 },
  pressure:    { lo: 0.8, hi: 2.8 },
  velocity:    { lo: 0,   hi: 6   },
  humidity:    { lo: 0,   hi: 100 },
};

const HISTORY_SIZE = 21;   // how many data points to keep per variable
const KEYS = Object.keys(DEFAULT_LIVE);

/**
 * Compute an SVG polyline path from a history array.
 * Values are clamped to [lo, hi] and mapped to the SVG viewport (210 × 80).
 * Returns null if there are fewer than 2 valid data points.
 */
function computePath(values, lo, hi) {
  const valid = values.filter((v) => v !== null && Number.isFinite(v));
  if (valid.length < 2) return null;

  const n = values.length;
  const W = 210, H = 80, PAD_V = 8;
  const plotH = H - 2 * PAD_V;
  const range = hi > lo ? hi - lo : 1;
  const scaleY = (v) => PAD_V + plotH * (1 - (clamp(v, lo, hi) - lo) / range);

  const pts = values
    .map((v, i) => {
      if (v === null || !Number.isFinite(v)) return null;
      const x = n > 1 ? (i / (n - 1)) * W : W / 2;
      return `${x.toFixed(1)} ${scaleY(v).toFixed(1)}`;
    })
    .filter(Boolean);

  return pts.length >= 2
    ? pts.map((p, i) => (i === 0 ? `M ${p}` : `L ${p}`)).join(" ")
    : null;
}

const GraphsPanel = React.memo(
  React.forwardRef(({ bridge, plottingVariables }, ref) => {
    const [liveData, setLiveData] = useState(DEFAULT_LIVE);

    // Rolling per-variable history for sparkline rendering
    const [history, setHistory] = useState(() =>
      Object.fromEntries(KEYS.map((k) => [k, [DEFAULT_LIVE[k]]]))
    );

    const iterationRef = useRef(0);
    const timeRef = useRef(0);

    // Track previous values so we can compute delta trends
    const prevRef = useRef({ ...DEFAULT_LIVE });
    const trendRef = useRef(Object.fromEntries(KEYS.map((k) => [k, 0])));

    /**
     * Apply a new data snapshot: update live values, trends, history, and
     * time counters. Accepts the fully-clamped `next` object.
     */
    const applySnapshot = (next) => {
      const prev = prevRef.current;
      trendRef.current = Object.fromEntries(KEYS.map((k) => [k, next[k] - prev[k]]));
      prevRef.current = next;
      iterationRef.current += 1;
      timeRef.current += 0.5;

      setLiveData(next);
      setHistory((h) =>
        Object.fromEntries(
          KEYS.map((k) => [k, [...h[k].slice(-(HISTORY_SIZE - 1)), next[k]]])
        )
      );
    };

    // ---- 1) Pull from bridge when available ----
    useEffect(() => {
      if (!bridge?.connected) return;

      const out = bridge?.state?.outputs;
      if (!out || Object.keys(out).length === 0) return;

      const prev = prevRef.current;
      const next = {
        temperature: clamp(num(out.temperature, prev.temperature), 20, 90),
        power:       clamp(num(out.power,       prev.power),       0,  200),
        pressure:    clamp(num(out.pressure,    prev.pressure),    0.8, 2.8),
        velocity:    clamp(num(out.velocity,    prev.velocity),    0,  6),
        humidity:    clamp(num(out.humidity,    prev.humidity),    0,  100),
      };

      applySnapshot(next);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bridge?.connected, bridge?.state?.outputs]);

    // ---- 2) Fallback simulation ONLY when bridge is not connected ----
    useEffect(() => {
      if (bridge?.connected) return;

      const interval = setInterval(() => {
        const prev = prevRef.current;
        const next = {
          temperature: clamp(prev.temperature + (Math.random() - 0.5) * 2, 20, 90),
          power:       clamp(prev.power       + (Math.random() - 0.5) * 3, 0,  200),
          pressure:    clamp(prev.pressure    + (Math.random() - 0.5) * 0.1, 0.8, 2.8),
          velocity:    clamp(prev.velocity    + (Math.random() - 0.5) * 0.3, 0,  6),
          humidity:    clamp(prev.humidity    + (Math.random() - 0.5) * 1.5, 0,  100),
        };
        applySnapshot(next);
      }, 500);

      return () => clearInterval(interval);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bridge?.connected]);

    // Expose API to parent via ref
    useImperativeHandle(ref, () => ({
      getCurrentData: () => ({
        timestamp: new Date(),
        time: timeRef.current,
        iteration: iterationRef.current,
        ...liveData,
      }),
    }));

    const activeGraphs = useMemo(() => {
      const trendS = (k, dec) => {
        const d = num(trendRef.current?.[k], 0);
        return `${d >= 0 ? "+" : ""}${d.toFixed(dec)}`;
      };

      const graphs = {
        temperature: {
          enabled: plottingVariables.temperature,
          value: liveData.temperature,
          unit: "°C",
          trend: trendS("temperature", 2),
          title: "Temperature Trend",
          stroke: "#ff6b6b",
          gradientId: "tempGradient",
          path: computePath(
            history.temperature,
            VAR_RANGES.temperature.lo,
            VAR_RANGES.temperature.hi
          ),
        },
        power: {
          enabled: plottingVariables.power,
          value: liveData.power,
          unit: "kW",
          trend: trendS("power", 2),
          title: "Power Trend",
          stroke: "#86ef47",
          gradientId: "powerGradient",
          path: computePath(history.power, VAR_RANGES.power.lo, VAR_RANGES.power.hi),
        },
        pressure: {
          enabled: plottingVariables.pressure,
          value: liveData.pressure,
          unit: "bar",
          trend: trendS("pressure", 3),
          title: "Pressure Trend",
          stroke: "#0050E0",
          gradientId: "pressureGradient",
          path: computePath(
            history.pressure,
            VAR_RANGES.pressure.lo,
            VAR_RANGES.pressure.hi
          ),
        },
        velocity: {
          enabled: plottingVariables.velocity,
          value: liveData.velocity,
          unit: "m/s",
          trend: trendS("velocity", 2),
          title: "Velocity Trend",
          stroke: "#00ffff",
          gradientId: "velocityGradient",
          path: computePath(
            history.velocity,
            VAR_RANGES.velocity.lo,
            VAR_RANGES.velocity.hi
          ),
        },
        humidity: {
          enabled: plottingVariables.humidity,
          value: liveData.humidity,
          unit: "%",
          trend: trendS("humidity", 1),
          title: "Humidity Trend",
          stroke: "#4a9eff",
          gradientId: "humidityGradient",
          path: computePath(
            history.humidity,
            VAR_RANGES.humidity.lo,
            VAR_RANGES.humidity.hi
          ),
        },
      };

      const getTrendTone = (metricId, trendStrVal) => {
        const isPlus  = String(trendStrVal).trim().startsWith("+");
        const isMinus = String(trendStrVal).trim().startsWith("-");
        if (metricId === "temperature") return isPlus ? "bad"  : isMinus ? "good" : "neutral";
        if (metricId === "power")       return isMinus ? "good" : isPlus  ? "bad"  : "neutral";
        return "neutral";
      };

      return ["temperature", "power", "pressure", "velocity", "humidity"]
        .map((key) => {
          const g = graphs[key];
          return { key, graph: g, tone: getTrendTone(key, g?.trend || "0") };
        })
        .filter((item) => item.graph?.enabled);
    }, [plottingVariables, liveData, history]);

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
                      <stop offset="0%"   style={{ stopColor: g.stroke, stopOpacity: 0.35 }} />
                      <stop offset="100%" style={{ stopColor: g.stroke, stopOpacity: 0.05 }} />
                    </linearGradient>
                  </defs>
                  {g.path && (
                    <path
                      d={g.path}
                      fill={`url(#${g.gradientId})`}
                      stroke={g.stroke}
                      strokeWidth="2"
                    />
                  )}
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

