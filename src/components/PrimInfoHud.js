// src/components/PrimInfoHud.js
//
// Small floating HUD that appears next to the cursor after a 1-second hold on
// the Omniverse stream. It shows the value of a queried USD attribute.

import React from "react";

const PrimInfoHud = ({ x, y, status, property, value, primPath, onClose }) => {
  if (status === "hidden") return null;

  const OFFSET_X = 16;
  const OFFSET_Y = 10;
  const HUD_W = 260;
  const HUD_H = 110;

  const left = Math.min(x + OFFSET_X, window.innerWidth - HUD_W - 8);
  const top = Math.min(y + OFFSET_Y, window.innerHeight - HUD_H - 8);

  const displayValue =
    value === null || value === undefined
      ? "—"
      : typeof value === "object"
      ? JSON.stringify(value)
      : String(value);

  return (
    <div
      className="prim-info-hud"
      style={{ left, top }}
      role="tooltip"
      aria-label="Thermofluidic prim info"
    >
      <div className="prim-info-hud-header">
        <span className="prim-info-hud-title">Thermofluidic Info</span>
        <button className="prim-info-hud-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className="prim-info-hud-body">
        {status === "querying" && (
          <div className="prim-info-querying">
            <span className="prim-info-spinner" aria-hidden="true" />
            Querying prim…
          </div>
        )}

        {status === "not_found" && (
          <div className="prim-info-none">
            No <code>{property || "attribute"}</code> found at this location.
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
              <span className="prim-info-attr">{property || "value"}</span>
              <span className="prim-info-val">{displayValue}</span>
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