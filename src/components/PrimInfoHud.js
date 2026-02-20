// src/components/PrimInfoHud.js
//
// Small floating HUD that appears next to the cursor after a 1-second hold on
// the Omniverse stream.  It shows the value of the `flownex:componentName`
// attribute on whichever USD prim the user is pointing at.
//
// Props
// ─────
// x, y          number   Viewport pixel coordinates (from pointer event).
// status        string   "hidden" | "querying" | "found" | "not_found" | "error"
// componentName string   Value of flownex:componentName (status === "found")
// primPath      string   USD prim path (optional, shown when available)
// onClose       func     Called when the × button is pressed
import React from "react";

const PrimInfoHud = ({ x, y, status, componentName, primPath, onClose }) => {
  if (status === "hidden") return null;

  // Keep the HUD within the viewport: nudge left/up if too close to the edge.
  const OFFSET_X = 16;
  const OFFSET_Y = 10;
  const HUD_W = 240;
  const HUD_H = 100;

  const left = Math.min(x + OFFSET_X, window.innerWidth  - HUD_W - 8);
  const top  = Math.min(y + OFFSET_Y, window.innerHeight - HUD_H - 8);

  return (
    <div
      className="prim-info-hud"
      style={{ left, top }}
      role="tooltip"
      aria-label="USD prim info"
    >
      {/* ── Header ── */}
      <div className="prim-info-hud-header">
        <span className="prim-info-hud-title">USD Prim Info</span>
        <button className="prim-info-hud-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      {/* ── Body ── */}
      <div className="prim-info-hud-body">
        {status === "querying" && (
          <div className="prim-info-querying">
            <span className="prim-info-spinner" aria-hidden="true" />
            Querying prim…
          </div>
        )}

        {status === "not_found" && (
          <div className="prim-info-none">
            No <code>flownex:componentName</code> attribute at this location.
          </div>
        )}

        {status === "error" && (
          <div className="prim-info-error">
            Query failed — check Omniverse Kit extension.
          </div>
        )}

        {status === "found" && (
          <>
            <div className="prim-info-row">
              <span className="prim-info-attr">flownex:componentName</span>
              <span className="prim-info-val">{componentName || "—"}</span>
            </div>
            {primPath && (
              <div className="prim-info-row prim-info-row--path">
                <span className="prim-info-attr">Prim path</span>
                <span className="prim-info-val prim-info-val--mono">{primPath}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PrimInfoHud;
