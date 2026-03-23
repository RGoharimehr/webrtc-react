import React, { useEffect, useState } from "react";

export default function Configuration({ bridge, state }) {
  const [projectFile, setProjectFile] = useState("");
  const [ioDirectory, setIoDirectory] = useState("");
  const [pollInterval, setPollInterval] = useState("1.0");

  useEffect(() => {
    if (state?.config?.projectFile) setProjectFile(state.config.projectFile);
    if (state?.config?.ioDirectory) setIoDirectory(state.config.ioDirectory);

    const intervalValue =
      state?.config?.resultPollingInterval ??
      state?.config?.pollInterval ??
      state?.resultPollingInterval;

    if (intervalValue !== undefined && intervalValue !== null) {
      setPollInterval(String(intervalValue));
    }
  }, [state]);

  useEffect(() => {
    if (!bridge) return;

    bridge.onMessage = (msg) => {
      if (msg?.type !== "response" || !msg?.payload) return;

      const path = msg.payload.path;
      if (!path) return;

      if (String(path).toLowerCase().endsWith(".proj")) {
        setProjectFile(path);
      } else {
        setIoDirectory(path);
      }
    };
  }, [bridge]);

  const browseProject = () => {
    bridge?.send?.({
      type: "browse_file",
      payload: {
        mode: "file",
        filters: [{ label: "Flownex Project", extension: "*.proj" }],
      },
    });
  };

  const browseIO = () => {
    bridge?.send?.({
      type: "browse_file",
      payload: {
        mode: "directory",
      },
    });
  };

  const configure = () => {
    if (!projectFile || !ioDirectory) {
      alert("Please enter both project file and IO directory.");
      return;
    }

    bridge?.send?.({
      type: "configure",
      payload: {
        projectFile,
        ioDirectory,
        resultPollingInterval: Number(pollInterval),
      },
    });
  };

  const openFlownex = () => {
    bridge?.send?.({
      type: "open_flownex",
      payload: {},
    });
  };

  const closeFlownex = () => {
    bridge?.send?.({
      type: "close_flownex",
      payload: {},
    });
  };

  const connectProject = () => {
    bridge?.send?.({
      type: "open_project",
      payload: {},
    });
  };

  return (
    <div style={{ padding: "16px", maxWidth: "700px" }}>
      <h2>Configuration</h2>

      <div style={{ marginBottom: "18px" }}>
        <label style={{ display: "block", marginBottom: "6px" }}>
          Flownex Project:
        </label>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={projectFile}
            onChange={(e) => setProjectFile(e.target.value)}
            placeholder="Paste or type .proj file path"
            style={{ flex: 1, padding: "10px" }}
          />
          <button onClick={browseProject}>Browse</button>
        </div>
      </div>

      <div style={{ marginBottom: "18px" }}>
        <label style={{ display: "block", marginBottom: "6px" }}>
          IO Directory:
        </label>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={ioDirectory}
            onChange={(e) => setIoDirectory(e.target.value)}
            placeholder="Paste or type IO folder path"
            style={{ flex: 1, padding: "10px" }}
          />
          <button onClick={browseIO}>Browse</button>
        </div>
      </div>

      <div style={{ marginBottom: "18px", maxWidth: "240px" }}>
        <label style={{ display: "block", marginBottom: "6px" }}>
          Result Polling Interval (s):
        </label>
        <input
          type="number"
          step="0.1"
          min="0.1"
          value={pollInterval}
          onChange={(e) => setPollInterval(e.target.value)}
          style={{ width: "100%", padding: "10px" }}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={configure}>Configure</button>
        <button onClick={openFlownex}>Open Flownex</button>
        <button onClick={closeFlownex}>Close Flownex</button>
        <button onClick={connectProject}>Open Project</button>
      </div>
    </div>
  );
}