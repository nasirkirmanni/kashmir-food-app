"use client";

import React, { useState, useMemo } from "react";
import { Search, Compass, Plus, Minus, Layers, MapPin } from "lucide-react";

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

  const clusters = [
    { name: "Nishat Bagh", count: 12, x: 320, y: 150 },
    { name: "Lal Chowk", count: 15, x: 180, y: 300 },
    { name: "Munshi Bagh", count: 6, x: 230, y: 360 },
    { name: "Rawalpora", count: 4, x: 100, y: 440 },
    { name: "Rajbah", count: 8, x: 130, y: 330 },
  ];

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
            placeholder="Search as I move the map"
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
            {/* Srinagar Land Boundaries and Features */}
            {/* Dal Lake shape in center-right */}
            <path
              d="M 230 110 C 270 120, 310 100, 340 120 C 370 140, 360 210, 340 250 C 320 290, 270 280, 250 250 C 230 220, 210 180, 210 150 C 210 120, 220 110, 230 110 Z"
              fill="rgba(16, 42, 69, 0.4)"
              stroke="rgba(212, 175, 55, 0.2)"
              strokeWidth="1.5"
              className="transition-all"
            />
            {/* Jhelum River canal */}
            <path
              d="M 50 480 C 100 450, 120 380, 140 330 C 160 280, 190 250, 190 220 C 190 190, 160 170, 170 110 C 180 50, 200 20, 200 0"
              stroke="rgba(16, 42, 69, 0.25)"
              strokeWidth="5"
              fill="none"
            />

            {/* Dal Lake Text Label */}
            <text
              x="290"
              y="180"
              className="text-[10px] font-bold fill-[#3a6080]/80 tracking-[0.2em] uppercase stroke-none"
              textAnchor="middle"
            >
              Dal Lake
            </text>

            {/* Major road lines */}
            <path
              d="M 20 250 L 380 250"
              stroke="rgba(255,255,255,0.02)"
              strokeWidth="2"
            />
            <path
              d="M 150 20 L 150 480"
              stroke="rgba(255,255,255,0.02)"
              strokeWidth="2"
            />
            <path
              d="M 80 80 L 320 420"
              stroke="rgba(255,255,255,0.01)"
              strokeWidth="1.5"
            />

            {/* Render Static Cluster Points */}
            {clusters.map((c, idx) => (
              <g key={`cluster-${idx}`} className="cursor-default opacity-85">
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
                <text
                  x={c.x}
                  y={c.y - 18}
                  textAnchor="middle"
                  className="text-[7.5px] font-bold fill-white/40 tracking-wider uppercase stroke-none"
                >
                  {c.name}
                </text>
              </g>
            ))}

            {/* Interactive Pins */}
            {filteredPins.map((pin) => {
              const isHovered = hoveredRestaurantId === pin.id;
              const isMainLocation = pin.restaurant.city?.toLowerCase() === activeLocation.toLowerCase();

              if (!isMainLocation && pin.restaurant.city) return null;

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
        <button
          className="w-9 h-9 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-[var(--saffron)] transition-colors hover:scale-105 active:scale-95 shadow-md"
          title="Map Layers"
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 px-4 py-2.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-4 text-[10px] font-bold tracking-wider uppercase shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--saffron)] border border-black/50" />
          <span className="text-white/80">Restaurant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white/20 border border-black/50" />
          <span className="text-white/40">More Restaurants</span>
        </div>
      </div>
    </div>
  );
}
