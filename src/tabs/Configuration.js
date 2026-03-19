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
    if (f.path) {
      // Electron / nwjs: real OS path is available.
      setProjectFile(f.path);
      applyProjectFieldsToConfig(f.path, ioDirectory);
    } else {
      // Plain browser: the File API does not expose the real local path.
      // Do NOT populate the field with just the filename — it is useless as a path.
      // The user must type the full path in the text field.
      addLog(
        "⚠ Browser security: the local file path is not accessible in a standard browser. " +
        "Enter the full project path manually in the text field, " +
        "or run this app in an Electron shell."
      );
    }
  };

  const onDirPicked = (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    if (files[0].path) {
      // Electron / nwjs: real OS path available — strip the filename to get the directory.
      const dir = files[0].path.split(/[/\\]/).slice(0, -1).join("/");
      setIoDirectory(dir);
      applyProjectFieldsToConfig(projectFile, dir);
    } else {
      // Plain browser: webkitRelativePath gives "FolderName/file.csv" — only
      // the folder NAME, not its absolute path.  A folder name is useless as
      // an IO directory path and must NOT be sent to the backend.
      // The user must type the full directory path in the text field.
      addLog(
        "⚠ Browser security: the local directory path is not accessible in a standard browser. " +
        "Enter the full IO directory path manually in the text field, " +
        "or run this app in an Electron shell."
      );
    }
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

  // Local editable config mirror (populated from bridge.config on load)
  const [configText, setConfigText] = useState("");
  const [configError, setConfigError] = useState("");

  const [logs, setLogs] = useState("Configuration panel ready.\n");

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => {
      const lines = prev.split("\n");
      if (lines.length >= 200) lines.splice(0, lines.length - 199);
      return lines.join("\n") + `[${timestamp}] ${message}\n`;
    });
  };

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

  // ── Flownex action handlers ─────────────────────────────────────────────────
  const handleApplyConfigure = () => {
    applyProjectFieldsToConfig(projectFile, ioDirectory);
    addLog(`Sending flownex.set_config — project: "${projectFile}", ioDir: "${ioDirectory}"…`);
    bridge?.configure?.(projectFile, ioDirectory, "flownex");
  };

  const handleOpenFlownex = () => {
    addLog("Sending flownex.open_flownex…");
    bridge?.openFlownex?.();
  };

  const handleOpenProject = () => {
    addLog("Sending flownex.open_project…");
    bridge?.openProject?.();
  };

  const handleCloseFlownex = () => {
    addLog("Sending flownex.close_flownex…");
    bridge?.closeFlownex?.();
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
                placeholder="D:\Simulation\project.fnx  (enter full path)"
                style={{ flex: 1 }}
              />
              <button
                onClick={() => filePickerRef.current?.click()}
                title="Browse — full path only available in Electron; plain browser returns filename only"
              >
                Browse…
              </button>
            </div>
          </div>

          {/* IO Folder (directory path, not a file) */}
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
                placeholder="D:\Simulation\IOFiles  (enter full directory path)"
                style={{ flex: 1 }}
              />
              <button
                onClick={() => dirPickerRef.current?.click()}
                title="Browse for IO folder — full path only available in Electron; plain browser returns folder name only"
              >
                Browse…
              </button>
            </div>
          </div>

          <div style={{ color: "var(--text-secondary)", fontSize: 11, marginBottom: 8 }}>
            ⚠ <strong>Browser limitation:</strong> the <em>Browse…</em> buttons can only
            return the full path when running inside an Electron or nwjs shell
            (which exposes <code>File.prototype.path</code>).
            In a standard browser the local path is not accessible — use the
            text fields to enter the full path manually.
          </div>

          {/* Configuration workflow actions */}
          <div className="button-group" style={{ flexWrap: "wrap", gap: 6 }}>
            <button
              title="Send flownex.set_config to the Omniverse extension with project path and IO directory"
              onClick={handleApplyConfigure}
            >
              Apply Configure
            </button>
            <button
              title="Send flownex.open_flownex to the Omniverse extension"
              onClick={handleOpenFlownex}
            >
              Open Flownex
            </button>
            <button
              title="Send flownex.open_project to the Omniverse extension"
              onClick={handleOpenProject}
            >
              Open Project
            </button>
            <button
              title="Send flownex.close_flownex to the Omniverse extension"
              onClick={handleCloseFlownex}
            >
              Close Flownex
            </button>
          </div>

          <div style={{ color: "var(--text-secondary)", fontSize: 11, marginTop: 8 }}>
            Workflow: enter paths → <em>Apply Configure</em> → <em>Open Flownex</em> →
            <em> Open Project</em>. Use <em>Close Flownex</em> to shut down the application.
            <br />
            All commands use the Omniverse extension protocol
            (<code>flownex.*</code> command format).
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
