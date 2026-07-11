import React from "react";
import { generateElevationPath } from "@/lib/generateElevationPath";

export default function ElevationProfile({ waypoints = [] }) {
  // SVG size matches the mockup (1000px wide, 260px high, with 40px internal padding)
  const width = 1000;
  const height = 260;
  const padding = 40;

  const { linePath, fillPath, points } = generateElevationPath(waypoints, width, height, padding);

  if (!points || points.length === 0) {
    return (
      <div className="bg-[#14120D] border border-white/5 rounded-[4px] p-8 text-center text-[#8C8377]">
        No elevation profile data available.
      </div>
    );
  }

  // Calculate min and max elevations for header display
  const elevations = waypoints.map((w) => w.elevationM);
  const minElevation = Math.min(...elevations);
  const maxElevation = Math.max(...elevations);

  return (
    <div className="profile-panel">
      <div className="profile-label-row flex justify-between mb-2">
        <span className="profile-label text-[10px] tracking-[0.15em] uppercase text-[#5C574C] font-semibold">
          Elevation profile
        </span>
        <span className="profile-label text-[10px] tracking-[0.15em] uppercase text-[#5C574C] font-semibold">
          {minElevation.toLocaleString()}m &rarr; {maxElevation.toLocaleString()}m
        </span>
      </div>

      <div className="profile-chart relative w-full h-[260px]">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C9A24D" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#C9A24D" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line className="grid-line stroke-[rgba(255,255,255,0.07)] stroke-1" x1="0" y1="60" x2={width} y2="60" />
          <line className="grid-line stroke-[rgba(255,255,255,0.07)] stroke-1" x1="0" y1="120" x2={width} y2="120" />
          <line className="grid-line stroke-[rgba(255,255,255,0.07)] stroke-1" x1="0" y1="180" x2={width} y2="180" />

          {/* Elevation filled area */}
          <path d={fillPath} className="elev-fill fill-[url(#elevGrad)]" />
          
          {/* Elevation top line path */}
          <path d={linePath} className="elev-line fill-none stroke-[#C9A24D] stroke-2" />

          {/* Waypoints & Labels */}
          {points.map((pt, idx) => {
            const isStart = idx === 0;
            const isEnd = idx === points.length - 1;
            
            // Align start to left, end to right, and intermediate points to middle
            let textAnchor = "middle";
            if (isStart) textAnchor = "start";
            if (isEnd) textAnchor = "end";

            // Alternate vertical positioning to prevent text collisions
            // Start is always below, End is always above, others alternate
            let position = "above";
            if (isStart) {
              position = "below";
            } else if (isEnd) {
              position = "above";
            } else {
              position = idx % 2 === 0 ? "below" : "above";
            }

            const nameY = position === "above" ? pt.y - 20 : pt.y + 25;
            const subY = position === "above" ? pt.y - 7 : pt.y + 38;

            const waypointType = pt.waypoint.type ? pt.waypoint.type.toUpperCase() : "STOP";
            const noteText = pt.waypoint.note 
              ? pt.waypoint.note.toUpperCase() 
              : `${waypointType} · ${pt.waypoint.elevationM.toLocaleString()}M`;

            return (
              <g key={idx}>
                {/* Dot */}
                <circle 
                  cx={pt.x} 
                  cy={pt.y} 
                  r={isStart || isEnd ? 6 : 5.5} 
                  className={`wp-dot stroke-[#C9A24D] stroke-2 ${
                    isStart || isEnd ? "fill-[#C9A24D]" : "fill-[#0A0A08]"
                  }`} 
                />
                
                {/* Waypoint name */}
                <text 
                  x={pt.x} 
                  y={nameY} 
                  textAnchor={textAnchor}
                  className="wp-label font-mono text-[10.5px] fill-[#F2EAD8]"
                >
                  {pt.waypoint.name.toUpperCase()}
                </text>

                {/* Waypoint metadata note */}
                <text 
                  x={pt.x} 
                  y={subY} 
                  textAnchor={textAnchor}
                  className="wp-sub font-sans text-[9px] fill-[#8C8377]"
                >
                  {isStart ? `START · ${pt.waypoint.elevationM.toLocaleString()}M` : isEnd ? `END · ${pt.waypoint.elevationM.toLocaleString()}M` : noteText}
                </text>

                {/* KM counter tick labels along the bottom */}
                <text 
                  x={pt.x} 
                  y="245" 
                  textAnchor={textAnchor}
                  className="km-label font-mono text-[9.5px] fill-[#5C574C]"
                >
                  KM {pt.waypoint.distanceKm}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
