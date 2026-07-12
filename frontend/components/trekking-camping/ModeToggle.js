"use client";

import React from "react";

export default function ModeToggle({ mode, onModeChange }) {
  const isTrek = mode === "trek";

  return (
    <nav className="tc-mode-nav">
      <div
        className="tc-pill"
        style={{
          transform: isTrek ? "translateX(0)" : "translateX(118px)"
        }}
      />
      <button
        className={isTrek ? "active" : ""}
        onClick={() => onModeChange("trek", true)}
      >
        Trekking
      </button>
      <button
        className={!isTrek ? "active" : ""}
        onClick={() => onModeChange("camp", true)}
      >
        Camping
      </button>
    </nav>
  );
}
