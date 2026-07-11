import React, { useEffect, useRef, useState } from "react";
import { generateElevationPath } from "../../lib/generateElevationPath";

export default function RouteElevationChart({ trail }) {
  const containerRef = useRef(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setDrawn(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const waypoints = trail.waypoints || [];
  const { linePath, fillPath, points } = generateElevationPath(waypoints, 1000, 300, 40);

  return (
    <section 
      ref={containerRef}
      className={`max-w-[1240px] mx-auto px-10 pt-[170px] pb-[140px] border-t border-[var(--hair)] transition-all duration-1000 ease-[cubic-bezier(.16,1,.3,1)] ${drawn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[28px]'}`}
    >
      <div className="font-mono text-[10.5px] tracking-[0.28em] uppercase text-[var(--gold)] mb-5">
        Route profile &middot; Live map
      </div>
      <h2 className="font-serif font-normal text-[var(--ivory)] mb-[70px] max-w-[16ch]"
          style={{ fontSize: "clamp(30px, 3.6vw, 46px)", lineHeight: 1.1 }}>
        {trail.description}
      </h2>

      <div className="w-full h-[340px]">
        <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C9A24D" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#C9A24D" stopOpacity="0"/>
            </linearGradient>
          </defs>
          
          {/* Grid Lines */}
          <line x1="0" y1="70" x2="1000" y2="70" stroke="var(--hair)" />
          <line x1="0" y1="150" x2="1000" y2="150" stroke="var(--hair)" />
          <line x1="0" y1="230" x2="1000" y2="230" stroke="var(--hair)" />

          {/* Fill Path */}
          <path 
            d={fillPath} 
            fill="url(#elevGradient)"
            className={`transition-opacity duration-[1.6s] ease-in-out delay-[600ms] ${drawn ? 'opacity-100' : 'opacity-0'}`}
          />
          
          {/* Line Path */}
          <path 
            d={linePath}
            fill="none"
            stroke="var(--gold)"
            strokeWidth="2"
            strokeDasharray="1500"
            strokeDashoffset={drawn ? 0 : 1500}
            className="transition-all duration-[2.4s] ease-[cubic-bezier(.16,1,.3,1)]"
          />

          {/* Waypoints */}
          {points.map((p, i) => {
            const isTerm = p.waypoint.type === "start" || p.waypoint.type === "end";
            const textAnchor = i === 0 ? "start" : i === points.length - 1 ? "end" : "middle";
            
            // Stagger animations slightly for each point
            const delay = `${600 + (i * 150)}ms`;

            return (
              <g key={i}>
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={isTerm ? 6 : 5.5}
                  fill={isTerm ? "var(--gold)" : "var(--ink)"}
                  stroke="var(--gold)"
                  strokeWidth="2"
                  className="transition-opacity duration-500 ease-in-out"
                  style={{ opacity: drawn ? 1 : 0, transitionDelay: delay }}
                />
                
                {/* Labels: alternating above/below if we want, or just below. The reference had alternate positioning based on mockup, but let's just stick to the reference offset logic. */}
                <text 
                  x={p.x} 
                  y={p.y + 28} 
                  textAnchor={textAnchor}
                  className="font-mono text-[11px] fill-[var(--ivory)] transition-opacity duration-500"
                  style={{ opacity: drawn ? 1 : 0, transitionDelay: delay }}
                >
                  {p.waypoint.name.toUpperCase()}
                </text>
                
                <text 
                  x={p.x} 
                  y={p.y + 41} 
                  textAnchor={textAnchor}
                  className="font-sans text-[9px] fill-[var(--dim)] transition-opacity duration-500"
                  style={{ opacity: drawn ? 1 : 0, transitionDelay: delay }}
                >
                  {p.waypoint.note ? p.waypoint.note.toUpperCase() : (p.waypoint.type === 'start' ? `START \u00B7 ${p.waypoint.elevationM}M` : `ELEV \u00B7 ${p.waypoint.elevationM}M`)}
                </text>

                <text 
                  x={p.x} 
                  y={284} 
                  textAnchor={textAnchor}
                  className="font-mono text-[9.5px] fill-[var(--dimmer)]"
                >
                  KM {p.waypoint.distanceKm}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
