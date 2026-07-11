import React from "react";

export default function DriveRail({ pct }) {
  return (
    <div 
      className="fixed top-0 left-0 h-[2px] bg-[var(--gold)] z-50 origin-left"
      style={{
        width: "100%",
        transform: `scaleX(${pct})`,
        transition: "transform 0.05s linear"
      }}
    />
  );
}
