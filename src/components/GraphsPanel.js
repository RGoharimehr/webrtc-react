import React, { useMemo, useImperativeHandle, useRef, useState, useEffect } from "react";

const GraphsPanel = React.memo(
  React.forwardRef(({ plottingVariables }, ref) => {
    // Live data state - simulated with slight variations
    const [liveData, setLiveData] = useState({
      temperature: 68.5,
      power: 125.8,
      pressure: 1.35,
      velocity: 2.4,
      humidity: 52,
    });

    const iterationRef = useRef(0);
    const timeRef = useRef(0);

    // Simulate live data updates every 500ms
    useEffect(() => {
      const interval = setInterval(() => {
        setLiveData((prev) => ({
          temperature: Math.max(20, Math.min(90, prev.temperature + (Math.random() - 0.5) * 2)),
          power: Math.max(0, Math.min(200, prev.power + (Math.random() - 0.5) * 3)),
          pressure: Math.max(0.8, Math.min(2.8, prev.pressure + (Math.random() - 0.5) * 0.1)),
          velocity: Math.max(0, Math.min(6, prev.velocity + (Math.random() - 0.5) * 0.3)),
          humidity: Math.max(0, Math.min(100, prev.humidity + (Math.random() - 0.5) * 1.5)),
        }));
        iterationRef.current += 1;
        timeRef.current += 0.5;
      }, 500);

      return () => clearInterval(interval);
    }, []);

    // Expose API to parent via ref
    useImperativeHandle(ref, () => ({
      getCurrentData: () => ({
        timestamp: new Date(),
        time: timeRef.current,
        iteration: iterationRef.current,
        distance: timeRef.current * 0.5, // Mock distance calculation
        ...liveData,
      }),
    }));

    const activeGraphs = useMemo(() => {
      const graphs = {
        temperature: {
          enabled: plottingVariables.temperature,
          value: liveData.temperature,
          unit: "°C",
          trend: "+2.3",
          title: "Temperature Trend",
          stroke: "#ff6b6b",
          gradientId: "tempGradient",
          path: "M 0 60 L 15 50 L 30 55 L 45 45 L 60 48 L 75 40 L 90 38 L 105 35 L 120 38 L 135 30 L 150 33 L 165 28 L 180 30 L 195 25 L 210 28",
        },
        power: {
          enabled: plottingVariables.power,
          value: liveData.power,
          unit: "kW",
          trend: "-1.2",
          title: "Power Trend",
          stroke: "#86ef47",
          gradientId: "powerGradient",
          path: "M 0 45 L 15 42 L 30 44 L 45 38 L 60 40 L 75 36 L 90 34 L 105 38 L 120 32 L 135 34 L 150 30 L 165 32 L 180 28 L 195 30 L 210 26",
        },
        pressure: {
          enabled: plottingVariables.pressure,
          value: liveData.pressure,
          unit: "bar",
          trend: "+0.05",
          title: "Pressure Trend",
          stroke: "#0050E0",
          gradientId: "pressureGradient",
          path: "M 0 52 L 15 50 L 30 54 L 45 48 L 60 50 L 75 46 L 90 48 L 105 44 L 120 46 L 135 42 L 150 44 L 165 40 L 180 42 L 195 38 L 210 40",
        },
        velocity: {
          enabled: plottingVariables.velocity,
          value: liveData.velocity,
          unit: "m/s",
          trend: "+0.1",
          title: "Velocity Trend",
          stroke: "#00ffff",
          gradientId: "velocityGradient",
          path: "M 0 48 L 15 46 L 30 50 L 45 44 L 60 46 L 75 42 L 90 44 L 105 40 L 120 42 L 135 38 L 150 40 L 165 36 L 180 38 L 195 34 L 210 36",
        },
        humidity: {
          enabled: plottingVariables.humidity,
          value: liveData.humidity,
          unit: "%",
          trend: "+1.0",
          title: "Humidity Trend",
          stroke: "#4a9eff",
          gradientId: "humidityGradient",
          path: "M 0 50 L 15 48 L 30 52 L 45 46 L 60 48 L 75 44 L 90 46 L 105 42 L 120 44 L 135 40 L 150 42 L 165 38 L 180 40 L 195 36 L 210 38",
        },
      };

    // "Good/bad" depends on the metric.
    // Temperature: up is bad, down is good
    // Power: down is good, up is bad
    // Others: up = neutral, down = neutral (you can customize later)
    const getTrendTone = (metricId, trendStr) => {
      const isPlus = String(trendStr).trim().startsWith("+");
      const isMinus = String(trendStr).trim().startsWith("-");

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

      // default for others
      return "neutral";
    };

    const metricOrder = ["temperature", "power", "pressure", "velocity", "humidity"];

      return metricOrder.map((key) => {
        const g = graphs[key];
        return {
          key,
          graph: g,
          tone: getTrendTone(key, g?.trend || "0"),
        };
      }).filter((item) => item.graph?.enabled);
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

              {/* ✅ single row: Current (left) + Trend chip (right) */}
              <div className="graph-metric-row">
                <div className="metric-current">
                  <div className="metric-current-label">Current</div>
                  <div className="metric-current-value">
                    {g.value.toFixed(2)}
                    <span className="metric-unit">{g.unit}</span>
                  </div>
                </div>

                <div className={`metric-trend-chip ${tone}`}>
                  <span className="metric-trend-arrow" aria-hidden="true">
                    {String(g.trend).trim().startsWith("+") ? "▲" : String(g.trend).trim().startsWith("-") ? "▼" : "•"}
                  </span>
                  <span className="metric-trend-value">
                    {g.trend}
                    <span className="metric-unit">{g.unit}</span>
                  </span>
                  <span className="metric-trend-label">Trend</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  })
);

export default GraphsPanel;
