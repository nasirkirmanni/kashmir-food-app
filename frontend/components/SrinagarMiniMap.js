"use client";

import React, { useState, useMemo } from "react";
import { Search, Compass, Plus, Minus, Layers } from "lucide-react";

export default function SrinagarMiniMap({
  restaurants = [],
  hoveredRestaurantId = null,
  onRestaurantSelect = () => {},
  activeLocation = "Srinagar",
}) {
  const [zoom, setZoom] = useState(1);
  const [mapCenter, setMapCenter] = useState({ x: 0, y: 0 });
  const [searchArea, setSearchArea] = useState("");

  // Deterministically map coordinates for restaurants that don't have them
  // Mapping within the bounds of our SVG map coordinate system: Width 400, Height 500
  const pins = useMemo(() => {
    return restaurants.map((r, i) => {
      // If restaurant has actual coords, use them scaled, otherwise hash the name
      let x = 200;
      let y = 250;

      if (r.coordinates && r.coordinates.x && r.coordinates.y) {
        x = r.coordinates.x;
        y = r.coordinates.y;
      } else {
        // Hash name to get coordinates in bounds: x [80, 320], y [100, 400]
        let hash = 0;
        const name = r.name || "";
        for (let j = 0; j < name.length; j++) {
          hash = name.charCodeAt(j) + ((hash << 5) - hash);
        }
        x = 80 + (Math.abs(hash) % 240);
        y = 100 + (Math.abs(hash * 3) % 300);
      }

      return {
        id: r._id || r.slug || i.toString(),
        name: r.name,
        rating: r.rating || "4.0",
        x,
        y,
        restaurant: r,
      };
    });
  }, [restaurants]);

  const filteredPins = useMemo(() => {
    let result = pins;
    if (searchArea.trim() !== "") {
      const query = searchArea.toLowerCase();
      result = pins.filter((pin) => {
        const nameMatch = pin.name?.toLowerCase().includes(query);
        const locMatch = pin.restaurant.location?.toLowerCase().includes(query);
        const tagMatch = pin.restaurant.tags?.some((tag) =>
          tag.toLowerCase().includes(query)
        );
        return nameMatch || locMatch || tagMatch;
      });
    }
    return result;
  }, [pins, searchArea]);

  // Dynamic map configurations depending on selected city tab
  const mapConfig = useMemo(() => {
    const city = (activeLocation || "Srinagar").toLowerCase();
    if (city === "gulmarg") {
      return {
        cityName: "Gulmarg",
        waterPath: "M 80 380 C 100 390, 110 380, 120 390 C 130 400, 125 415, 115 420 C 105 425, 90 415, 80 400 Z", // Alpather Lake
        waterFill: "rgba(16, 42, 69, 0.4)",
        waterStroke: "rgba(212, 175, 55, 0.2)",
        hasGolfCourse: true,
        golfCoursePath: "M 120 180 C 160 140, 240 140, 280 180 C 320 220, 300 300, 280 320 C 260 340, 140 340, 120 320 Z",
        hasGondola: true,
        gondolaPath: "M 200 320 L 50 480",
        labels: [
          { text: "Golf Course", x: 200, y: 250, className: "fill-emerald-500/20" },
          { text: "Alpather Lake", x: 120, y: 430 },
          { text: "Gondola Line", x: 110, y: 410 }
        ],
        roads: [
          { d: "M 200 110 C 140 150, 100 200, 100 280 C 100 360, 150 420, 200 420 C 250 420, 300 360, 300 280 C 300 200, 260 150, 200 110 Z" } // Outer Circle Rd
        ]
      };
    } else if (city === "pahalgam") {
      return {
        cityName: "Pahalgam",
        waterPath: "M 100 0 C 110 80, 120 150, 130 220 C 140 290, 150 350, 180 400 C 210 450, 250 480, 300 500", // Lidder River flow
        waterStroke: "rgba(58, 96, 128, 0.3)",
        waterWidth: 6,
        waterPath2: "M 300 80 C 330 90, 350 70, 370 90 C 390 110, 380 140, 360 160 C 340 180, 310 160, 290 140 Z", // Sheshnag Lake
        waterFill2: "rgba(16, 42, 69, 0.4)",
        waterStroke2: "rgba(212, 175, 55, 0.2)",
        labels: [
          { text: "Lidder River", x: 180, y: 280 },
          { text: "Sheshnag Lake", x: 335, y: 125 }
        ],
        roads: [
          { d: "M 50 120 L 350 450" },
          { d: "M 120 50 L 120 450" }
        ]
      };
    } else if (city === "sonamarg") {
      return {
        cityName: "Sonamarg",
        waterPath: "M 0 250 C 100 260, 200 240, 300 255 C 350 260, 380 240, 400 250", // Sindh River
        waterStroke: "rgba(58, 96, 128, 0.3)",
        waterWidth: 5,
        waterPath2: "M 120 252 C 110 300, 90 350, 80 400 C 70 450, 50 480, 30 500", // Thajiwas Stream
        waterStroke2: "rgba(58, 96, 128, 0.2)",
        waterWidth2: 3,
        labels: [
          { text: "Sindh River", x: 200, y: 235 },
          { text: "Thajiwas Glacier", x: 100, y: 440 }
        ],
        roads: [
          { d: "M 0 220 L 400 220" } // Srinagar-Leh NH 1D Highway
        ]
      };
    } else {
      // Srinagar (Default)
      return {
        cityName: "Srinagar",
        waterPath: "M 230 110 C 270 120, 310 100, 340 120 C 370 140, 360 210, 340 250 C 320 290, 270 280, 250 250 C 230 220, 210 180, 210 150 C 210 120, 220 110, 230 110 Z", // Dal Lake
        waterFill: "rgba(16, 42, 69, 0.4)",
        waterStroke: "rgba(212, 175, 55, 0.2)",
        waterPath2: "M 50 480 C 100 450, 120 380, 140 330 C 160 280, 190 250, 190 220 C 190 190, 160 170, 170 110 C 180 50, 200 20, 200 0", // Jhelum River
        waterStroke2: "rgba(16, 42, 69, 0.25)",
        waterWidth2: 5,
        labels: [
          { text: "Dal Lake", x: 290, y: 180 },
          { text: "Jhelum River", x: 110, y: 280 }
        ],
        roads: [
          { d: "M 20 250 L 380 250" },
          { d: "M 150 20 L 150 480" },
          { d: "M 80 80 L 320 420" }
        ]
      };
    }
  }, [activeLocation]);

  // Proximity-based dynamic cluster calculation
  const clusters = useMemo(() => {
    const city = (activeLocation || "Srinagar").toLowerCase();
    let baseClusters = [];
    if (city === "gulmarg") {
      baseClusters = [
        { name: "Main Market", x: 200, y: 110 },
        { name: "Gondola Base", x: 200, y: 320 },
        { name: "Golf Club", x: 150, y: 190 },
        { name: "Strawberry Valley", x: 280, y: 150 }
      ];
    } else if (city === "pahalgam") {
      baseClusters = [
        { name: "Market Place", x: 120, y: 240 },
        { name: "Aru Valley Rd", x: 140, y: 110 },
        { name: "Baisaran Trail", x: 230, y: 210 },
        { name: "Club Park", x: 110, y: 320 }
      ];
    } else if (city === "sonamarg") {
      baseClusters = [
        { name: "Main Bazaar", x: 250, y: 220 },
        { name: "Glacier Trail", x: 100, y: 380 },
        { name: "Fish Point", x: 320, y: 270 },
        { name: "Gagangir Road", x: 80, y: 200 }
      ];
    } else {
      // Srinagar
      baseClusters = [
        { name: "Nishat Bagh", x: 320, y: 150 },
        { name: "Lal Chowk", x: 180, y: 300 },
        { name: "Munshi Bagh", x: 230, y: 360 },
        { name: "Rawalpora", x: 100, y: 440 },
        { name: "Rajbagh", x: 130, y: 330 }
      ];
    }

    // Filter pins for this city
    const cityPins = pins.filter(p => (p.restaurant.city || "Srinagar").toLowerCase() === city);

    // Calculate dynamic counts based on proximity (distance < 85 units)
    return baseClusters.map(c => {
      const count = cityPins.filter(p => {
        const dist = Math.sqrt(Math.pow(p.x - c.x, 2) + Math.pow(p.y - c.y, 2));
        return dist < 85;
      }).length;
      return { ...c, count };
    });
  }, [pins, activeLocation]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 2.5));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.75));
  const handleRecenter = () => {
    setZoom(1);
    setMapCenter({ x: 0, y: 0 });
  };

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - mapCenter.x, y: e.clientY - mapCenter.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setMapCenter({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - mapCenter.x, y: touch.clientY - mapCenter.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setMapCenter({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full h-[600px] rounded-[24px] overflow-hidden border border-white/10 bg-[#070707] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col group select-none">
      {/* Map Header Search */}
      <div className="absolute top-4 left-4 right-4 z-20 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchArea}
            onChange={(e) => setSearchArea(e.target.value)}
            placeholder={`Search ${mapConfig.cityName} Dining...`}
            className="w-full h-10 pl-10 pr-4 bg-black/70 backdrop-blur-md text-xs text-white placeholder-white/30 border border-white/10 rounded-full focus:outline-none focus:border-[var(--saffron)]/60 transition-all font-body"
          />
        </div>
        <button
          onClick={handleRecenter}
          className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/60 hover:text-[var(--saffron)] transition-colors"
          title="Recenter Map"
        >
          <Compass className="w-5 h-5" />
        </button>
      </div>

      {/* Interactive Map Surface */}
      <div 
        className="flex-1 w-full h-full relative overflow-hidden bg-[#060606]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        {/* Subtle grid line pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Outer map scale and translate container */}
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            transform: `scale(${zoom}) translate(${mapCenter.x}px, ${mapCenter.y}px)`,
            transition: isDragging ? "none" : "transform 300ms ease-out",
          }}
        >
          <svg
            viewBox="0 0 400 500"
            className="w-[95%] h-[95%] text-white/5 font-display"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
          >
            {/* Dynamic Water Bodies */}
            {mapConfig.waterPath && (
              <path
                d={mapConfig.waterPath}
                fill={mapConfig.waterFill || "none"}
                stroke={mapConfig.waterStroke || "transparent"}
                strokeWidth={mapConfig.waterWidth || 1.5}
                className="transition-all"
              />
            )}
            {mapConfig.waterPath2 && (
              <path
                d={mapConfig.waterPath2}
                fill={mapConfig.waterFill2 || "none"}
                stroke={mapConfig.waterStroke2 || "transparent"}
                strokeWidth={mapConfig.waterWidth2 || 1.5}
                className="transition-all"
              />
            )}

            {/* Dynamic Golf Course Green Patch for Gulmarg */}
            {mapConfig.hasGolfCourse && (
              <path
                d={mapConfig.golfCoursePath}
                fill="rgba(16, 122, 69, 0.15)"
                stroke="rgba(34, 139, 34, 0.2)"
                strokeWidth="1"
              />
            )}

            {/* Dynamic Gondola Trail Line for Gulmarg */}
            {mapConfig.hasGondola && (
              <path
                d={mapConfig.gondolaPath}
                stroke="rgba(212, 175, 55, 0.4)"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            )}

            {/* Dynamic Roads & Trails */}
            {(mapConfig.roads || []).map((road, idx) => (
              <path
                key={`road-${idx}`}
                d={road.d}
                stroke="rgba(255,255,255,0.02)"
                strokeWidth="2"
              />
            ))}

            {/* Dynamic Text Labels */}
            {(mapConfig.labels || []).map((label, idx) => (
              <text
                key={`label-${idx}`}
                x={label.x}
                y={label.y}
                className={`text-[9px] font-bold tracking-[0.2em] uppercase stroke-none ${
                  label.className || "fill-[#3a6080]/80"
                }`}
                textAnchor="middle"
              >
                {label.text}
              </text>
            ))}

            {/* Render Dynamic Proximity Cluster Points */}
            {clusters.map((c, idx) => (
              <g key={`cluster-${idx}`} className="cursor-default opacity-85">
                {c.count > 0 && (
                  <>
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r="14"
                      fill="rgba(20, 20, 20, 0.9)"
                      stroke="rgba(212, 175, 55, 0.4)"
                      strokeWidth="1"
                    />
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r="11"
                      fill="rgba(212, 175, 55, 0.15)"
                    />
                    <text
                      x={c.x}
                      y={c.y + 3}
                      textAnchor="middle"
                      className="text-[9px] font-bold font-body fill-white stroke-none"
                    >
                      {c.count}
                    </text>
                  </>
                )}
                {/* Adjust text position depending on whether count badge is shown */}
                <text
                  x={c.x}
                  y={c.count > 0 ? c.y - 18 : c.y}
                  textAnchor="middle"
                  className={`font-bold tracking-wider uppercase stroke-none ${
                    c.count > 0 
                      ? "text-[7.5px] fill-white/40" 
                      : "text-[7px] fill-white/20"
                  }`}
                >
                  {c.name}
                </text>
              </g>
            ))}

            {/* Interactive Pins */}
            {filteredPins.map((pin) => {
              const isHovered = hoveredRestaurantId === pin.id;
              const city = pin.restaurant.city || "Srinagar";
              const isMainLocation = city.toLowerCase() === activeLocation.toLowerCase();

              if (!isMainLocation) return null;

              return (
                <g
                  key={pin.id}
                  onClick={() => onRestaurantSelect(pin.restaurant)}
                  className="cursor-pointer group/pin"
                >
                  {/* Outer pulsing glow circle */}
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r={isHovered ? 18 : 8}
                    fill={isHovered ? "rgba(212, 175, 55, 0.25)" : "rgba(212, 175, 55, 0.05)"}
                    stroke={isHovered ? "rgba(212, 175, 55, 0.8)" : "transparent"}
                    strokeWidth="1"
                    className="transition-all duration-300 ease-out"
                  />
                  {/* Glow animation layer */}
                  {isHovered && (
                    <circle
                      cx={pin.x}
                      cy={pin.y}
                      r="24"
                      fill="transparent"
                      stroke="rgba(212, 175, 55, 0.3)"
                      strokeWidth="1"
                      className="animate-ping"
                      style={{ transformOrigin: `${pin.x}px ${pin.y}px` }}
                    />
                  )}
                  {/* Pin core */}
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r="5"
                    fill={isHovered ? "#ffffff" : "var(--saffron)"}
                    stroke="#070707"
                    strokeWidth="1.5"
                    className="transition-colors duration-300"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-9 h-9 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-[var(--saffron)] transition-colors hover:scale-105 active:scale-95 shadow-md"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-9 h-9 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-[var(--saffron)] transition-colors hover:scale-105 active:scale-95 shadow-md"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 px-4 py-2.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-4 text-[10px] font-bold tracking-wider uppercase shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--saffron)] border border-black/50" />
          <span className="text-white/80">Restaurant</span>
        </div>
      </div>
    </div>
  );
}
