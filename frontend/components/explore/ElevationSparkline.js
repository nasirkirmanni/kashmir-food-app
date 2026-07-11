import React from "react";
import { generateElevationPath } from "@/lib/generateElevationPath";

export default function ElevationSparkline({ waypoints }) {
  // Dims: width=150, height=34, padding=4
  const { linePath, fillPath, points } = generateElevationPath(waypoints, 150, 34, 4);

  if (!points || points.length === 0) {
    return (
      <svg className="w-[150px] h-[34px] opacity-20" viewBox="0 0 150 34">
        <line x1="2" y1="17" x2="148" y2="17" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" />
      </svg>
    );
  }

  return (
    <svg className="w-[150px] h-[34px] block overflow-visible" viewBox="0 0 150 34">
      {/* Light gradient fill beneath the path */}
      <path 
        d={fillPath} 
        fill="rgba(201, 162, 77, 0.05)" 
        className="transition-all duration-300" 
      />
      {/* Smooth elevation line */}
      <path 
        d={linePath} 
        fill="none" 
        stroke="var(--dimmer, #5C574C)" 
        strokeWidth="1.4" 
        className="transition-colors duration-300" 
      />
      {/* Start and end dots */}
      {points.length > 0 && (
        <circle cx={points[0].x} cy={points[0].y} r="2.5" fill="var(--gold, #C9A24D)" className="transition-colors duration-300" />
      )}
      {points.length > 1 && (
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="2.5" fill="var(--gold, #C9A24D)" className="transition-colors duration-300" />
      )}
    </svg>
  );
}
