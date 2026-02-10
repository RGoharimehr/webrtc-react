import React from "react";

const GraphsPanel = ({ plottingVariables }) => {
  const chartData = {
    temperature: { current: "68.5°C", trend: "+2.3°C" },
    power: { current: "125.8kW", trend: "-1.2kW" },
    pressure: { current: "2.1bar", trend: "+0.1bar" },
    velocity: { current: "3.2m/s", trend: "+0.4m/s" },
    humidity: { current: "45%", trend: "+5%" },
  };

  const sparklineData = {
    temperature: [50, 52, 55, 54, 58, 62, 64, 66, 65, 68, 70, 69, 71, 72],
    power: [120, 122, 121, 124, 125, 126, 125, 127, 128, 127, 129, 130, 129, 131],
    pressure: [2.0, 2.05, 2.02, 2.1, 2.12, 2.08, 2.15, 2.18, 2.16, 2.2, 2.22, 2.19],
    velocity: [2.8, 3.0, 3.1, 3.05, 3.2, 3.3, 3.25, 3.4, 3.5, 3.45],
    humidity: [40, 42, 43, 41, 45, 44, 46, 47, 45],
  };

  const createSparkline = (data, color) => {
    const width = 180;
    const height = 46;
    const padding = 4;

    const max = Math.max(...data); // ✅ FIXED
    const min = Math.min(...data); // ✅ FIXED

    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
        const y = height - ((value - min) / (max - min || 1)) * (height - padding * 2) - padding;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg
        className="graph-sparkline"
        width="100%"
        height="46"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  };

  return (
    <div className="graphs-panel-content">
      {Object.keys(plottingVariables).map((key) => {
        if (!plottingVariables[key]) return null;

        const color = key === "temperature" ? "#ff6b6b" : "#86ef47";
        const data = chartData[key];
        const sparkData = sparklineData[key] || [1, 2, 3, 2, 4];

        return (
          <div key={key} className="graph-card">
            <div className="graph-card-title">
              {key.charAt(0).toUpperCase() + key.slice(1)} Trend
            </div>

            <div className="graph-visualization">{createSparkline(sparkData, color)}</div>

            <div className="graph-metrics graph-metrics-chips">
              <div className="metric-chip">
                <div className="metric-chip-label">Current</div>
                <div className="metric-chip-value">{data?.current || "N/A"}</div>
              </div>

              <div className="metric-chip">
                <div className="metric-chip-label">Trend</div>
                <div
                  className={`metric-chip-value ${
                    String(data?.trend || "").startsWith("-") ? "neg" : "pos"
                  }`}
                >
                  {data?.trend || "N/A"}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GraphsPanel;
