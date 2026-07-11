import React, { useEffect, useRef, useState } from "react";
import { parseEmphasis } from "../../lib/parseEmphasis";

export default function RouteChapters({ waypoints }) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);
    const handler = (e) => setReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (!waypoints || waypoints.length === 0) return null;

  const validChapters = waypoints
    .map((wp, index) => {
      // Keep track of the full array index to find the prevKm accurately
      const prevKm = index > 0 ? waypoints[index - 1].distanceKm : 0;
      return { ...wp, prevKm, originalIndex: index };
    })
    .filter(wp => wp.chapterImage && wp.chapterBody);

  if (validChapters.length === 0) return null;

  return (
    <div>
      {validChapters.map((chapter, idx) => (
        <Chapter 
          key={idx}
          chapter={chapter} 
          index={idx}
          reduceMotion={reduceMotion}
        />
      ))}
    </div>
  );
}

function Chapter({ chapter, index, reduceMotion }) {
  const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const isRight = index % 2 !== 0;

  useEffect(() => {
    const section = sectionRef.current;
    const img = imgRef.current;
    if (!section) return;

    // Reveal Observer for the text body
    const revealObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisible(true);
        revealObserver.disconnect();
      }
    }, { threshold: 0.2 });
    
    revealObserver.observe(section);

    // Parallax logic
    let rafId = null;
    const onScroll = () => {
      if (!img || reduceMotion) return;
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        // Only apply parallax if section is somewhat in viewport
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
          const shift = rect.top * -0.08;
          img.style.transform = `translateY(${shift}px) scale(1.08)`;
        }
        rafId = null;
      });
    };

    if (!reduceMotion) {
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll(); // initial set
    } else if (img) {
      img.style.transform = "scale(1)";
    }

    return () => {
      revealObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [reduceMotion]);

  return (
    <section 
      ref={sectionRef} 
      className={`relative min-h-screen flex items-center overflow-hidden border-t border-[var(--hair)] ${isRight ? 'flex-row-reverse' : ''}`}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          ref={imgRef}
          src={chapter.chapterImage}
          alt={chapter.chapterHeadline || "Route chapter"}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
        />
        <div 
          className="absolute inset-0" 
          style={{
            background: isRight 
              ? "linear-gradient(270deg, var(--ink) 0%, rgba(8,8,10,0.55) 42%, rgba(8,8,10,0.15) 68%)"
              : "linear-gradient(90deg, var(--ink) 0%, rgba(8,8,10,0.55) 42%, rgba(8,8,10,0.15) 68%)"
          }}
        />
      </div>

      {/* Chapter Body */}
      <div 
        className={`relative z-10 px-10 max-w-full md:max-w-[560px] w-full transition-all duration-1000 ease-[cubic-bezier(.16,1,.3,1)] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[28px]'}`}
      >
        <div className="flex items-center gap-3 mb-[22px]">
          <span className="w-[30px] h-[1px] bg-[var(--gold)]"></span>
          <span className="font-mono text-[12px] tracking-[0.15em] text-[var(--gold)]">
            CHAPTER {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <h2 className="font-serif font-normal text-[var(--ivory)] mb-5"
            style={{ fontSize: "clamp(34px, 4.4vw, 58px)" }}>
          {parseEmphasis(chapter.chapterHeadline)}
        </h2>

        <p className="text-[15px] leading-[1.85] text-[var(--dim)] max-w-[46ch] mb-[26px]">
          {chapter.chapterBody}
        </p>

        <div className="flex gap-[28px]">
          <div>
            <div className="font-mono text-[11.5px] text-[var(--ivory)]">KM {chapter.prevKm}&ndash;{chapter.distanceKm}</div>
            <small className="block font-sans text-[9px] tracking-[0.14em] uppercase text-[var(--dimmer)] mt-1">Distance covered</small>
          </div>
          <div>
            <div className="font-mono text-[11.5px] text-[var(--ivory)]">{chapter.elevationM.toLocaleString()}M</div>
            <small className="block font-sans text-[9px] tracking-[0.14em] uppercase text-[var(--dimmer)] mt-1">Elevation</small>
          </div>
        </div>
      </div>
    </section>
  );
}
