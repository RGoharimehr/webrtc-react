// src/tabs/Configuration.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

const Configuration = ({ bridge }) => {
  const [config, setConfig] = useState({
    projectFile: "",
    ioDirectory: "",
    solveOnChange: true,
    dataInterval: 0.5,
  });

  const [logs, setLogs] = useState("Configuration panel ready.\n");

  const filePickerRef = useRef(null);
  const dirPickerRef = useRef(null);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => {
      const lines = prev.split("\n");
      if (lines.length >= 200) lines.splice(0, lines.length - 199);
      return lines.join("\n") + `[${timestamp}] ${message}\n`;
    });
  };

  const status = bridge?.state?.status;
  const statusText = useMemo(() => {
    if (!bridge?.connected) return "Not Connected";
    if (!status) return "Connected";
    return status.state === "error" ? "Error" : "Connected";
  }, [bridge?.connected, status]);

  const statusColor =
    statusText === "Connected"
      ? "var(--success-green)"
      : statusText === "Error"
      ? "var(--error-red)"
      : "var(--error-red)";

  // ---- browse handlers (browser-safe) ----
  const browseFile = () => filePickerRef.current?.click();
  const browseFolder = () => dirPickerRef.current?.click();

  const onFilePicked = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Browser gives fake path; keep name in UI, user can paste full path manually if needed
    setConfig((p) => ({ ...p, projectFile: f.name }));
    addLog(`Selected project file: ${f.name}`);
  };

  const onDirPicked = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // For directory picking, browsers expose webkitRelativePath like: "IOFiles/Inputs.csv"
    const rel = files[0].webkitRelativePath || "";
    const topFolder = rel.split("/")[0] || "SelectedFolder";

    setConfig((p) => ({ ...p, ioDirectory: topFolder }));
    addLog(`Selected IO directory: ${topFolder}`);
  };

  // ---- bridge calls ----
  const applyConfigure = () => {
    addLog("Sending configure(projectPath, ioDir) to bridge...");
    try {
      bridge?.configure?.(config.projectFile, config.ioDirectory);
    } catch (e) {
      addLog(`Bridge configure failed: ${e?.message || e}`);
    }
  };

  const openProject = () => {
    addLog("Open Project requested...");
    try {
      // safest: configure first so backend has paths + schema loaded
      bridge?.configure?.(config.projectFile, config.ioDirectory);
      bridge?.openProject?.();
    } catch (e) {
      addLog(`Open Project failed: ${e?.message || e}`);
    }
  };

  const closeProject = () => {
    addLog("Close Project requested...");
    try {
      bridge?.closeProject?.();
    } catch (e) {
      addLog(`Close Project failed: ${e?.message || e}`);
    }
  };

  const closeFlownex = () => {
    addLog("Close Flownex requested...");
    try {
      bridge?.closeFlownex?.();
    } catch (e) {
      addLog(`Close Flownex failed: ${e?.message || e}`);
    }
  };

  // reflect backend status in logs
  useEffect(() => {
    if (!status?.state) return;
    if (status.state === "running") addLog(status.message || "Backend running...");
    if (status.state === "idle" && status.progress === 1.0)
      addLog(status.message || "Backend finished.");
    if (status.state === "error") addLog(status.message || "Backend error.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.state, status?.message, status?.progress]);

  return (
    <div>
      <div className="collapsible">
        <div className="collapsible-header">
          <span className="collapsible-title">Flownex Configuration</span>
          <span className="collapsible-icon expanded">▼</span>
        </div>

        <div className="collapsible-content">
          <div style={{ marginBottom: "16px" }}>
            <span style={{ fontWeight: 600 }}>Status: </span>
            <span style={{ color: statusColor }}>
              <span
                className={`status-indicator ${
                  statusText === "Connected" ? "active" : "inactive"
                }`}
              />
              {statusText}
            </span>
          </div>

          {/* hidden pickers */}
          <input
            ref={filePickerRef}
            type="file"
            accept=".proj,.fnx,.zip,.json,.csv,*/*"
            style={{ display: "none" }}
            onChange={onFilePicked}
          />

          <input
            ref={dirPickerRef}
            type="file"
            webkitdirectory="true"
            directory="true"
            style={{ display: "none" }}
            onChange={onDirPicked}
          />

          <div className="input-row">
            <label className="input-label">Flownex Project File:</label>
            <div style={{ flex: 1, display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={config.projectFile}
                onChange={(e) =>
                  setConfig((p) => ({ ...p, projectFile: e.target.value }))
                }
                placeholder="Paste full path (recommended): D:\Flownex\...\project.proj"
                style={{ flex: 1 }}
              />
              <button onClick={browseFile}>...</button>
            </div>
          </div>

          <div className="input-row">
            <label className="input-label">IO Definition Directory:</label>
            <div style={{ flex: 1, display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={config.ioDirectory}
                onChange={(e) =>
                  setConfig((p) => ({ ...p, ioDirectory: e.target.value }))
                }
                placeholder="Paste full path (recommended): D:\Flownex\...\IOFiles"
                style={{ flex: 1 }}
              />
              <button onClick={browseFolder}>...</button>
            </div>
          </div>

          <div className="input-row">
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={config.solveOnChange}
                onChange={(e) =>
                  setConfig((p) => ({ ...p, solveOnChange: e.target.checked }))
                }
              />
              <span>Solve on Input Change</span>
            </label>
          </div>

          <div className="input-row">
            <label className="input-label">Flownex Data Interval [s]:</label>
            <div className="input-control">
              <input
                type="range"
                min="0.25"
                max="2.0"
                step="0.25"
                value={config.dataInterval}
                onChange={(e) =>
                  setConfig((p) => ({
                    ...p,
                    dataInterval: parseFloat(e.target.value),
                  }))
                }
              />
              <span className="value-display">{config.dataInterval} s</span>
            </div>
          </div>

          <div className="button-group" style={{ marginTop: 12 }}>
            <button onClick={applyConfigure}>Apply Configure</button>
          </div>
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">API Testing</h2>
        <div className="button-group">
          <button onClick={openProject}>Open Project</button>
          <button onClick={closeProject}>Close Project</button>
          <button className="warning" onClick={closeFlownex}>
            Close Flownex
          </button>
        </div>
      </div>

      <div className="logs-container">
        <div className="logs-title">Configuration Logs</div>
        <textarea
          className="logs-textarea"
          style={{ height: "120px" }}
          value={logs}
          readOnly
        />
      </div>
    </div>
  );
};

export default Configuration;
