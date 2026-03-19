// src/tabs/Configuration.js
import React, { useEffect, useMemo, useRef, useState } from "react";

const Configuration = ({ bridge }) => {
  // ── Flownex project fields ──────────────────────────────────────────────────
  const [projectFile, setProjectFile] = useState("");
  const [ioDirectory, setIoDirectory] = useState("");
  const filePickerRef = useRef(null);
  const dirPickerRef  = useRef(null);

  const onFilePicked = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // Use the real OS path when available (Electron / nwjs), else the file name.
    const path = f.path || f.name;
    setProjectFile(path);
    addLog(`Project file selected: ${path}`);
  };

  const onDirPicked = (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    // webkitRelativePath looks like "FolderName/file.csv" — grab the top folder.
    const rel  = files[0].webkitRelativePath || "";
    const top  = rel.split("/")[0];
    // Use real path when available (Electron), otherwise the top-folder name.
    const path = files[0].path
      ? files[0].path.split(/[/\\]/).slice(0, -1).join("/")
      : top;
    setIoDirectory(path);
    addLog(`IO folder selected: ${path}`);
  };

  // Merge project fields into the JSON config textarea whenever they change.
  const applyProjectFieldsToConfig = (projFile, ioDir) => {
    setConfigText((prev) => {
      try {
        const obj = prev.trim() ? JSON.parse(prev) : {};
        if (projFile !== undefined) obj.project_file  = projFile;
        if (ioDir    !== undefined) obj.io_directory   = ioDir;
        return JSON.stringify(obj, null, 2);
      } catch {
        return prev; // leave malformed JSON untouched
      }
    });
    setConfigError("");
  };

  // Keep project fields in sync with backend config on load.
  // (done in the existing bridge.config useEffect below)

  // Local editable config mirror (populated from bridge.config on load)
  const [configText, setConfigText] = useState("");
  const [configError, setConfigError] = useState("");

  // Custom extensions state
  const [jsUrls, setJsUrls] = useState("");
  const [cssUrls, setCssUrls] = useState("");
  const [extLog, setExtLog] = useState("");

  const [logs, setLogs] = useState("Configuration panel ready.\n");

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

  // ── Connection / status ─────────────────────────────────────────────────────
  const flownexStatus = bridge?.flownexStatus;
  const statusText = useMemo(() => {
    if (!bridge?.connected) return "Not Connected";
    if (!flownexStatus) return "Connected";
    return flownexStatus.state === "error" ? "Error" : "Connected";
  }, [bridge?.connected, flownexStatus]);

  const statusColor =
    statusText === "Connected"
      ? "var(--success-green)"
      : "var(--error-red)";

  // Keep configText in sync when backend config arrives
  useEffect(() => {
    if (bridge?.config != null) {
      setConfigText(JSON.stringify(bridge.config, null, 2));
      setConfigError("");
      // Populate project fields from backend config
      if (bridge.config.project_file  != null) setProjectFile(bridge.config.project_file);
      if (bridge.config.io_directory   != null) setIoDirectory(bridge.config.io_directory);
    }
  }, [bridge?.config]);

  // Reflect backend errors in logs
  useEffect(() => {
    const errs = bridge?.errors;
    if (!errs?.length) return;
    addLog(`Backend error: ${errs[errs.length - 1]}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bridge?.errors?.length]);

  // Reflect flownexStatus changes in logs
  useEffect(() => {
    if (!flownexStatus?.state) return;
    if (flownexStatus.state === "running")
      addLog(flownexStatus.message || "Backend running...");
    if (flownexStatus.state === "idle" && flownexStatus.progress === 1.0)
      addLog(flownexStatus.message || "Backend finished.");
    if (flownexStatus.state === "error")
      addLog(flownexStatus.message || "Backend error.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flownexStatus?.state, flownexStatus?.message, flownexStatus?.progress]);

  // ── Backend command handlers ────────────────────────────────────────────────
  const handleGetStatus = () => {
    addLog("Requesting flownex.get_status…");
    bridge?.getStatus?.();
  };

  const handleGetConfig = () => {
    addLog("Requesting flownex.get_config…");
    bridge?.getConfig?.();
  };

  const handleSetConfig = () => {
    try {
      const parsed = JSON.parse(configText);
      addLog("Sending flownex.set_config…");
      bridge?.setConfigRemote?.(parsed);
    } catch (e) {
      setConfigError("Invalid JSON: " + e.message);
    }
  };

  const handleLoadInputs = () => {
    addLog("Requesting flownex.load_inputs…");
    bridge?.loadInputs?.();
  };

  const handleLoadStaticInputs = () => {
    addLog("Requesting flownex.load_static_inputs…");
    bridge?.loadStaticInputs?.();
  };

  const handleLoadOutputs = () => {
    addLog("Requesting flownex.load_outputs…");
    bridge?.loadOutputs?.();
  };

  // ── Custom extensions ───────────────────────────────────────────────────────
  const loadExtensions = () => {
    const parseUrls = (raw) =>
      raw
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean);

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

    parseUrls(jsUrls).forEach((url) => {
      const escapedUrl = CSS.escape(url);
      if (document.querySelector(`script[data-custom-ext][src="${escapedUrl}"]`)) {
        addExtLog(`JS already loaded: ${url}`);
        return;
      }
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

  // ── Rendered state summary helpers ─────────────────────────────────────────
  const dynCount = bridge?.dynamicInputDefs?.length ?? 0;
  const staCount = bridge?.staticInputDefs?.length ?? 0;
  const outCount = bridge?.outputDefs?.length ?? 0;

  return (
    <div>
      {/* ── Status ── */}
      <div className="collapsible">
        <div className="collapsible-header">
          <span className="collapsible-title">Backend Status</span>
          <span className="collapsible-icon expanded">▼</span>
        </div>
        <div className="collapsible-content">
          <div style={{ marginBottom: "10px" }}>
            <span style={{ fontWeight: 600 }}>Connection: </span>
            <span style={{ color: statusColor }}>
              <span
                className={`status-indicator ${
                  bridge?.connected ? "active" : "inactive"
                }`}
              />
              {statusText}
            </span>
          </div>

          {flownexStatus && (
            <div style={{ marginBottom: "10px", fontSize: 13 }}>
              <span style={{ fontWeight: 600 }}>Flownex state: </span>
              <span style={{ color: "var(--text-secondary)" }}>
                {flownexStatus.state ?? "—"}
                {flownexStatus.message ? ` — ${flownexStatus.message}` : ""}
              </span>
            </div>
          )}

          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10 }}>
            Dynamic inputs: <strong>{dynCount}</strong> &nbsp;|&nbsp;
            Static inputs: <strong>{staCount}</strong> &nbsp;|&nbsp;
            Outputs: <strong>{outCount}</strong>
          </div>

          <div className="button-group">
            <button onClick={handleGetStatus}>Get Status</button>
            <button onClick={handleGetConfig}>Get Config</button>
          </div>

          <div className="button-group" style={{ marginTop: 8 }}>
            <button onClick={handleLoadInputs}>Load Inputs</button>
            <button onClick={handleLoadStaticInputs}>Load Static Inputs</button>
            <button onClick={handleLoadOutputs}>Load Outputs</button>
          </div>
        </div>
      </div>

      {/* ── Flownex Project ── */}
      <div className="collapsible">
        <div className="collapsible-header">
          <span className="collapsible-title">Flownex Project</span>
          <span className="collapsible-icon expanded">▼</span>
        </div>
        <div className="collapsible-content">
          {/* Hidden file pickers */}
          <input
            ref={filePickerRef}
            type="file"
            accept=".fnx,.proj,.flo,.zip,.json,*"
            style={{ display: "none" }}
            onChange={onFilePicked}
          />
          <input
            ref={dirPickerRef}
            type="file"
            webkitdirectory="true"
            directory="true"
            multiple
            style={{ display: "none" }}
            onChange={onDirPicked}
          />

          {/* Project File */}
          <div className="input-row" style={{ marginBottom: 10 }}>
            <label className="input-label">Project File:</label>
            <div style={{ flex: 1, display: "flex", gap: 6 }}>
              <input
                type="text"
                value={projectFile}
                onChange={(e) => {
                  setProjectFile(e.target.value);
                  applyProjectFieldsToConfig(e.target.value, undefined);
                }}
                placeholder="D:\Simulation\project.fnx"
                style={{ flex: 1 }}
              />
              <button
                onClick={() => filePickerRef.current?.click()}
                title="Browse for project file"
              >
                Browse…
              </button>
            </div>
          </div>

          {/* IO Folder */}
          <div className="input-row" style={{ marginBottom: 10 }}>
            <label className="input-label">IO Folder:</label>
            <div style={{ flex: 1, display: "flex", gap: 6 }}>
              <input
                type="text"
                value={ioDirectory}
                onChange={(e) => {
                  setIoDirectory(e.target.value);
                  applyProjectFieldsToConfig(undefined, e.target.value);
                }}
                placeholder="D:\Simulation\IOFiles"
                style={{ flex: 1 }}
              />
              <button
                onClick={() => dirPickerRef.current?.click()}
                title="Browse for IO folder"
              >
                Browse…
              </button>
            </div>
          </div>

          <div style={{ color: "var(--text-secondary)", fontSize: 11, marginBottom: 8 }}>
            Tip: use <em>Browse…</em> to pick a file/folder, or paste the full path directly.
            Changes are reflected in the Config editor below and sent with <em>Set Config</em>.
          </div>

          <div className="button-group">
            <button
              onClick={() => {
                applyProjectFieldsToConfig(projectFile, ioDirectory);
                try {
                  const obj = configText.trim() ? JSON.parse(configText) : {};
                  obj.project_file  = projectFile;
                  obj.io_directory  = ioDirectory;
                  addLog("Sending flownex.set_config with project paths…");
                  bridge?.setConfigRemote?.(obj);
                } catch (e) {
                  setConfigError("Invalid JSON: " + e.message);
                }
              }}
            >
              Apply Project Paths
            </button>
          </div>
        </div>
      </div>

      {/* ── Config editor ── */}
      <div className="collapsible">
        <div className="collapsible-header">
          <span className="collapsible-title">Flownex Configuration</span>
          <span className="collapsible-icon expanded">▼</span>
        </div>
        <div className="collapsible-content">
          <div style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 8 }}>
            Use <em>Get Config</em> above to load the current backend config, edit below,
            then <em>Set Config</em> to apply.
          </div>
          <textarea
            value={configText}
            onChange={(e) => {
              setConfigText(e.target.value);
              setConfigError("");
            }}
            placeholder='{"project_file": "", "io_directory": "", ...}'
            rows={8}
            style={{
              width: "100%",
              resize: "vertical",
              fontFamily: "monospace",
              fontSize: 12,
              background: "rgba(0,0,0,0.35)",
              color: "var(--text-primary)",
              border: configError
                ? "1px solid var(--error-red)"
                : "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              padding: "6px 8px",
            }}
          />
          {configError && (
            <div style={{ color: "var(--error-red)", fontSize: 11, marginTop: 4 }}>
              {configError}
            </div>
          )}
          <div className="button-group" style={{ marginTop: 8 }}>
            <button onClick={handleSetConfig}>Set Config</button>
          </div>
        </div>
      </div>

      {/* ── Custom Extensions ── */}
      <div className="collapsible">
        <div className="collapsible-header">
          <span className="collapsible-title">Custom Extensions</span>
          <span className="collapsible-icon expanded">▼</span>
        </div>
        <div className="collapsible-content">
          <div style={{ color: "var(--text-secondary)", fontSize: 12, marginBottom: 10 }}>
            Load custom <code>.js</code> / <code>.css</code> files hosted on a local or remote
            server. Loaded scripts have full access to{" "}
            <code>window.__bridgeAPI</code>.{" "}
            <span style={{ color: "var(--warning-yellow)" }}>
              ⚠ Only load scripts from trusted sources.
            </span>
          </div>

          <div className="input-row" style={{ alignItems: "flex-start" }}>
            <label className="input-label" style={{ paddingTop: 4 }}>JS URLs (one per line):</label>
            <textarea
              value={jsUrls}
              onChange={(e) => setJsUrls(e.target.value)}
              placeholder={"http://localhost:9000/my-extension.js"}
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
{`const api = window.__bridgeAPI;
api.getStatus();
api.setInputValue("Fan_Speed", 1200);`}
            </pre>
          </div>
        </div>
      </div>

      {/* ── Logs ── */}
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
