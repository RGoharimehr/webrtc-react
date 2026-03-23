import React from "react";

export default function GraphsPanel({ history = [], variables = [] }) {
  if (!history.length || !variables.length) {
    return <div style={{ opacity: 0.8 }}>No data to plot.</div>;
  }

  const t0 = history[0].t || Date.now();
  const time = history.map((h) => ((h.t || t0) - t0) / 1000);
  const maxTime = Math.max(time[time.length - 1], 1);

  return (
    <div>
      {variables.map((varKey) => {
        const values = history.map((h) =>
          typeof h[varKey] === "number" ? h[varKey] : null
        );
        const cleanValues = values.filter((v) => v !== null);

        if (!cleanValues.length) {
          return (
            <div key={varKey} style={{ marginBottom: "20px" }}>
              <strong>{varKey}</strong>
              <div style={{ opacity: 0.7 }}>No numeric data yet.</div>
            </div>
          );
        }

        const maxVal = Math.max(...cleanValues);
        const minVal = Math.min(...cleanValues);

        return (
          <div key={varKey} style={{ marginBottom: "24px" }}>
            <div style={{ marginBottom: "8px", fontWeight: 700 }}>{varKey}</div>

            <svg
              width="100%"
              height="220"
              viewBox="0 0 520 220"
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "10px",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              {values.map((v, i) => {
                if (i === 0 || v === null || values[i - 1] === null) return null;

                const x1 = (time[i - 1] / maxTime) * 500 + 10;
                const x2 = (time[i] / maxTime) * 500 + 10;

                const y1 =
                  190 -
                  ((values[i - 1] - minVal) / (maxVal - minVal + 1e-6)) * 160;
                const y2 =
                  190 - ((v - minVal) / (maxVal - minVal + 1e-6)) * 160;

                return (
                  <line
                    key={`${varKey}-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="cyan"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
          </div>
        );
      })}
    </div>
  );
}