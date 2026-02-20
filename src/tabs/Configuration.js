// src/tabs/Configuration.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

const BACKENDS = [
  { id: "flownex", label: "Flownex" },
  { id: "ansys", label: "Ansys" },
  { id: "omniverse", label: "NVIDIA Omniverse" },
  { id: "generic", label: "Generic / Custom" },
];

const Configuration = ({ bridge }) => {
  const [config, setConfig] = useState({
    projectFile: "",
    ioDirectory: "",
    backend: "flownex",
    solveOnChange: true,
    dataInterval: 0.5,
  });

  // Custom extensions state
  const [jsUrls, setJsUrls] = useState("");
  const [cssUrls, setCssUrls] = useState("");
  const [extLog, setExtLog] = useState("");

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

  const addExtLog = (msg) =>
    setExtLog((p) => p + `[${new Date().toLocaleTimeString()}] ${msg}\n`);

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
    addLog(`Sending configure(projectPath, ioDir, backend="${config.backend}") to bridge...`);
    try {
      bridge?.configure?.(config.projectFile, config.ioDirectory, config.backend);
    } catch (e) {
      addLog(`Bridge configure failed: ${e?.message || e}`);
    }
  };

  const openProject = () => {
    addLog("Open Project requested...");
    try {
      // safest: configure first so backend has paths + schema loaded
      bridge?.configure?.(config.projectFile, config.ioDirectory, config.backend);
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
    const label = BACKENDS.find((b) => b.id === config.backend)?.label || "App";
    addLog(`Close ${label} requested...`);
    try {
      bridge?.closeFlownex?.();
    } catch (e) {
      addLog(`Close App failed: ${e?.message || e}`);
    }
  };

  // ---- custom extensions ----
  const loadExtensions = () => {
    const parseUrls = (raw) =>
      raw
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean);

    // Load CSS files
    parseUrls(cssUrls).forEach((url) => {
      const escapedUrl = CSS.escape(url);
      if (document.querySelector(`link[data-custom-ext][href="${escapedUrl}"]`)) {
        addExtLog(`CSS already loaded: ${url}`);
        return;
      }
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      link.setAttribute("data-custom-ext", "true");
      link.onload = () => addExtLog(`CSS loaded: ${url}`);
      link.onerror = () => addExtLog(`CSS load error: ${url}`);
      document.head.appendChild(link);
    });

    // Load JS files — only from trusted origins (same host or explicit user intent)
    parseUrls(jsUrls).forEach((url) => {
      const escapedUrl = CSS.escape(url);
      if (document.querySelector(`script[data-custom-ext][src="${escapedUrl}"]`)) {
        addExtLog(`JS already loaded: ${url}`);
        return;
      }
      // Security notice: custom scripts run with full page access
      console.warn("[Custom Extension] Loading user-supplied script:", url,
        "— ensure this URL is from a trusted source.");
      const script = document.createElement("script");
      script.src = url;
      script.setAttribute("data-custom-ext", "true");
      script.onload = () => addExtLog(`JS loaded: ${url}`);
      script.onerror = () => addExtLog(`JS load error: ${url}`);
      document.head.appendChild(script);
    });

    if (!jsUrls.trim() && !cssUrls.trim()) {
      addExtLog("No extension URLs provided.");
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

  const backendLabel =
    BACKENDS.find((b) => b.id === config.backend)?.label || "App";

  return (
    <div>
      <div className="collapsible">
        <div className="collapsible-header">
          <span className="collapsible-title">Simulation Backend Configuration</span>
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
            <label className="input-label">Simulation Backend:</label>
            <select
              value={config.backend}
              onChange={(e) => setConfig((p) => ({ ...p, backend: e.target.value }))}
              style={{ flex: 1 }}
            >
              {BACKENDS.map((b) => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>
          </div>

          <div className="input-row">
            <label className="input-label">Project File:</label>
            <div style={{ flex: 1, display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={config.projectFile}
                onChange={(e) =>
                  setConfig((p) => ({ ...p, projectFile: e.target.value }))
                }
                placeholder="Paste full path: D:\Simulation\project.proj"
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
                placeholder="Paste full path: D:\Simulation\IOFiles"
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
            <label className="input-label">Data Interval [s]:</label>
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
            Close {backendLabel}
          </button>
        </div>
      </div>

      {/* Custom Extensions */}
      <div className="collapsible">
        <div className="collapsible-header">
          <span className="collapsible-title">Custom Extensions</span>
          <span className="collapsible-icon expanded">▼</span>
        </div>
        <div className="collapsible-content">
          <div style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 10 }}>
            Load custom <code>.js</code> / <code>.css</code> files hosted on a local or remote
            server. Loaded scripts have full access to{" "}
            <code>window.__bridgeAPI</code> — use it to send messages to the
            active simulation backend (Flownex, Ansys, Omniverse, …).{" "}
            <span style={{ color: "var(--warning-yellow)" }}>
              ⚠ Only load scripts from trusted sources.
            </span>
          </div>

          <div className="input-row" style={{ alignItems: "flex-start" }}>
            <label className="input-label" style={{ paddingTop: 4 }}>JS URLs (one per line):</label>
            <textarea
              value={jsUrls}
              onChange={(e) => setJsUrls(e.target.value)}
              placeholder={"http://localhost:9000/my-extension.js\nhttp://localhost:9000/other.js"}
              rows={3}
              style={{ flex: 1, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
            />
          </div>

          <div className="input-row" style={{ alignItems: "flex-start" }}>
            <label className="input-label" style={{ paddingTop: 4 }}>CSS URLs (one per line):</label>
            <textarea
              value={cssUrls}
              onChange={(e) => setCssUrls(e.target.value)}
              placeholder={"http://localhost:9000/my-styles.css"}
              rows={2}
              style={{ flex: 1, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
            />
          </div>

          <div className="button-group" style={{ marginTop: 8, marginBottom: 8 }}>
            <button onClick={loadExtensions}>Load Extensions</button>
          </div>

          {extLog && (
            <textarea
              readOnly
              value={extLog}
              rows={4}
              style={{
                width: "100%",
                resize: "vertical",
                fontFamily: "monospace",
                fontSize: 11,
                background: "rgba(0,0,0,0.35)",
                color: "var(--text-secondary)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                padding: "6px 8px",
              }}
            />
          )}

          <div style={{ color: "var(--text-secondary)", fontSize: 11, marginTop: 8 }}>
            <strong>Example custom script usage:</strong>
            <pre style={{ marginTop: 4, padding: "6px 8px", background: "rgba(0,0,0,0.35)", borderRadius: 6, whiteSpace: "pre-wrap" }}>
{`// Access bridge from your custom JS file:
const api = window.__bridgeAPI;
api.sendCustom("myCommand", { param: 42 });
api.setInput("dynamic", "Fan_Speed", 1200);`}
            </pre>
          </div>
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
