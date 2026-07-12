"use client";

import React from "react";

const CIRC = 213.6; // 2 * π * 34

export default function AltimeterDial({ elevation, name, visible, maxElev }) {
  const offset = CIRC - (Math.min(elevation, maxElev) / maxElev) * CIRC;
  const displayElev = elevation > 0 ? elevation.toLocaleString() + " FT" : "— FT";

  return (
    <div className={`tc-altimeter ${visible ? "show" : ""}`}>
      <div>
        <div className="readout-label">Elevation</div>
        <div className="readout-val mono">{displayElev}</div>
        <div className="readout-name">{name}</div>
      </div>
      <div className="dial-wrap">
        <svg viewBox="0 0 80 80">
          <circle
            className="track"
            cx="40"
            cy="40"
            r="34"
            strokeDasharray={CIRC}
            strokeDashoffset="0"
          />
          <circle
            className="fill"
            cx="40"
            cy="40"
            r="34"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="center-label mono">FT</div>
      </div>
    </div>
  );
}
