"use client";

import React, { useEffect, useRef, useState } from "react";

function DiamondRow({ level, max }) {
  return (
    <div className="tc-diamonds">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`dmd ${i < level ? "on" : ""}`} />
      ))}
    </div>
  );
}

export default function DestinationSection({ item, index, mode, total }) {
  const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const rafId = useRef(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = (e) => setReduceMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Parallax on background image (rAF-throttled, skipped under prefers-reduced-motion)
  useEffect(() => {
    if (reduceMotion) return;
    const section = sectionRef.current;
    const img = imgRef.current;
    if (!section || !img) return;

    const onScroll = () => {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        const r = section.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) {
          rafId.current = null;
          return;
        }
        const shift = r.top * 0.12;
        img.style.transform = `translateY(${shift}px) scale(1.08)`;
        rafId.current = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [reduceMotion]);

  const isTrek = mode === "trek";
  const counter = `${isTrek ? "TREK" : "CAMP"} 0${index + 1} / 0${total}`;
  const badge = isTrek ? "TREKKING" : "CAMPING";

  return (
    <section
      ref={sectionRef}
      className="tc-dest"
      data-mode={mode}
      data-elevation={item.elevation}
      data-name={item.name}
    >
      {/* Background image */}
      <div className="tc-dest-bg">
        <picture>
          {item.bgMobile && (
            <source media="(max-width: 768px)" srcSet={item.bgMobile} />
          )}
          <img
            ref={imgRef}
            src={item.bgDesktop}
            alt={item.name}
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>

      {/* Content */}
      <div className="tc-dest-content">
        <div className="tc-dest-num">
          <span className="tick" />
          {counter}
          <span className="tc-dest-mode-badge">{badge}</span>
        </div>

        <h3 className="serif">{item.name}</h3>
        <p className="tc-dest-tagline">{item.tagline}</p>
        <p className="tc-dest-desc">{item.description}</p>

        <div className="tc-dest-stats">
          {isTrek ? (
            <>
              <div className="tc-stat-block">
                <div className="s-label">Duration</div>
                <div className="s-val mono">{item.days}</div>
              </div>
              <div className="tc-stat-block">
                <div className="s-label">High Point</div>
                <div className="s-val mono">
                  {item.elevation.toLocaleString()} ft
                </div>
              </div>
              <div className="tc-stat-block">
                <div className="s-label">Starts From</div>
                <div className="s-val mono">{item.start}</div>
              </div>
              <div className="tc-stat-block">
                <div className="s-label">Difficulty</div>
                <DiamondRow level={item.difficulty} max={4} />
              </div>
            </>
          ) : (
            <>
              <div className="tc-stat-block">
                <div className="s-label">Access</div>
                <div className="s-val mono">{item.access}</div>
              </div>
              <div className="tc-stat-block">
                <div className="s-label">Elevation</div>
                <div className="s-val mono">
                  {item.elevation.toLocaleString()} ft
                </div>
              </div>
              <div className="tc-stat-block">
                <div className="s-label">Near</div>
                <div className="s-val mono">{item.start}</div>
              </div>
              <div className="tc-stat-block">
                <div className="s-label">Remoteness</div>
                <DiamondRow level={item.remoteness} max={3} />
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
