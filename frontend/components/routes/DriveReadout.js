import React from "react";

export default function DriveReadout({ currentKm, totalKm, currentAlt, show }) {
  return (
    <div 
      className="fixed top-[22px] right-[32px] z-[60] text-right font-mono text-[11px] text-[var(--gold-bright)] transition-opacity duration-500 ease-in-out pointer-events-none"
      style={{
        opacity: show ? 1 : 0
      }}
    >
      <div>
        KM {String(currentKm).padStart(2, '0')} / {totalKm}
      </div>
      <div className="text-[var(--dim)] text-[9.5px] mt-[3px]">
        ALT {currentAlt.toLocaleString()}M
      </div>
    </div>
  );
}
