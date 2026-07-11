import React, { useEffect, useRef, useState } from "react";
import { generateElevationPath } from "../../lib/generateElevationPath";

export default function RouteClose({ trail }) {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const waypoints = trail.waypoints || [];
  const { linePath } = generateElevationPath(waypoints, 1000, 300, 40);

  const stats = [
    `${trail.distanceKm || 0} km`,
    trail.durationLabel,
    waypoints.length ? `${waypoints.length} stops` : null
  ].filter(Boolean).join(" \u00B7 ");

  return (
    <section 
      className="relative h-[80vh] flex items-center justify-center text-center border-t border-[var(--hair)] overflow-hidden"
    >
      {/* Ghost Elevation Line */}
      <div className="absolute inset-0 opacity-[0.14] pointer-events-none">
        <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="w-full h-full">
          {linePath && (
            <path 
              d={linePath} 
              fill="none" 
              stroke="#C9A24D" 
              strokeWidth="2" 
            />
          )}
        </svg>
      </div>

      <div 
        ref={sectionRef}
        className={`relative z-10 transition-all duration-1000 ease-[cubic-bezier(.16,1,.3,1)] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[28px]'}`}
      >
        <p className="font-mono text-[11px] tracking-[0.24em] uppercase text-[var(--gold)] mb-6">
          {stats}
        </p>
        <h2 className="font-serif font-normal text-[var(--ivory)] max-w-[14ch] mx-auto mb-10"
            style={{ fontSize: "clamp(38px, 5.2vw, 66px)", lineHeight: 1.1 }}>
          The road is open. So is the meadow.
        </h2>
        <a 
          href="#"
          className="inline-flex items-center gap-3 border border-[rgba(201,162,77,0.5)] text-[var(--gold-bright)] font-mono text-[12px] tracking-[0.12em] px-[30px] py-[16px] rounded-[2px] transition-all duration-300 hover:bg-[rgba(201,162,77,0.08)] hover:border-[var(--gold-bright)]"
        >
          PLAN THIS DRIVE &rarr;
        </a>
      </div>
    </section>
  );
}
