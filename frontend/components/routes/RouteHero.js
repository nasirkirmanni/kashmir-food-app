import React, { useEffect, useState } from "react";

export default function RouteHero({ trail, heroImage }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);

    const handler = (e) => setReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const trailTypeLabel = trail.type ? trail.type.replace(/_/g, " ") : "ROAD TRIP";

  return (
    <section className="relative h-screen flex items-end overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage || "/wazwan-hero.jpg"}
          alt={trail.title}
          className={`absolute inset-0 w-full h-full object-cover ${!reduceMotion ? "animate-kenburns" : ""}`}
          style={{
            transform: reduceMotion ? "scale(1)" : "scale(1.12)"
          }}
        />
        {/* Gradient overlay matching cinematic template */}
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(8,8,10,0.15) 0%, rgba(8,8,10,0.2) 40%, rgba(8,8,10,0.96) 96%)"
          }}
        />
      </div>

      {/* Hero Body */}
      <div className="relative z-10 w-full px-10 pb-[90px] max-w-[1240px] mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-[22px] h-[1px] bg-[var(--gold)]"></span>
          <span className="font-mono text-[10.5px] tracking-[0.32em] uppercase text-[var(--gold)]">
            {trailTypeLabel} &middot; ROUTE DETAIL
          </span>
        </div>

        <h1 className="font-serif font-normal leading-[0.96] tracking-[-0.01em] text-[var(--ivory)]"
            style={{ fontSize: "clamp(48px, 7.4vw, 108px)" }}>
          {trail.title}
        </h1>

        <div className="flex flex-wrap gap-x-11 gap-y-6 mt-10">
          <div>
            <div className="text-[9.5px] tracking-[0.16em] uppercase text-[var(--dimmer)] mb-1.5 font-sans">Distance</div>
            <div className="font-mono text-[19px] text-[var(--gold-bright)]">{trail.distanceKm || 0} km</div>
          </div>
          <div>
            <div className="text-[9.5px] tracking-[0.16em] uppercase text-[var(--dimmer)] mb-1.5 font-sans">Duration</div>
            <div className="font-mono text-[19px] text-[var(--gold-bright)]">{trail.durationLabel || "N/A"}</div>
          </div>
          <div>
            <div className="text-[9.5px] tracking-[0.16em] uppercase text-[var(--dimmer)] mb-1.5 font-sans">Difficulty</div>
            <div className="font-mono text-[19px] text-[var(--gold-bright)] capitalize">{trail.difficulty || "Easy"}</div>
          </div>
          <div>
            <div className="text-[9.5px] tracking-[0.16em] uppercase text-[var(--dimmer)] mb-1.5 font-sans">Best season</div>
            <div className="font-mono text-[19px] text-[var(--gold-bright)]">
              {trail.bestSeasonStart && trail.bestSeasonEnd ? `${trail.bestSeasonStart} \u2013 ${trail.bestSeasonEnd}` : "All Year"}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Cue */}
      <div className="absolute bottom-[34px] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2.5 opacity-55">
        <span className="font-mono text-[9.5px] tracking-[0.2em] text-[var(--dim)]">SCROLL TO DRIVE</span>
        <div className="w-[1px] h-[34px] animate-pulse" style={{ background: "linear-gradient(var(--gold), transparent)" }}></div>
      </div>
    </section>
  );
}
