"use client";

import React, { useEffect, useRef, useState } from "react";

export default function TrekCampHero() {
  const heroRef = useRef(null);
  const innerRef = useRef(null);
  const bgImgRef = useRef(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const rafId = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = (e) => setReduceMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // 3D cursor-tilt effect (rAF-throttled, skipped under prefers-reduced-motion)
  useEffect(() => {
    if (reduceMotion) return;
    const hero = heroRef.current;
    const inner = innerRef.current;
    const bgImg = bgImgRef.current;
    if (!hero || !inner || !bgImg) return;

    const onMouseMove = (e) => {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        inner.style.transform = `rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
        bgImg.style.transform = `scale(1.1) translate(${-x * 12}px, ${-y * 12}px)`;
        rafId.current = null;
      });
    };

    hero.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => {
      hero.removeEventListener("mousemove", onMouseMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [reduceMotion]);

  return (
    <section className="tc-hero" id="tc-hero" ref={heroRef}>
      <div className="tc-hero-bg" id="tc-heroBg">
        <picture>
          <source
            media="(max-width: 768px)"
            srcSet="/images/trekking-camping/pexels-egojane-8985291.jpg"
          />
          <img
            ref={bgImgRef}
            src="/images/trekking-camping/pexels-simarphotos-34571097.jpg"
            alt="Kashmir alpine landscape"
            className={reduceMotion ? "tc-kenburns-static" : "tc-kenburns-active"}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </div>

      <div className="tc-hero-inner" ref={innerRef}>
        <div className="tc-hero-kicker">Kashmir &middot; Above the Tree Line</div>
        <h1 className="serif">
          Two ways into
          <span className="line2">the wild.</span>
        </h1>
        <p className="tc-hero-sub">
          Five legendary treks. Five untouched basecamps. Every trail and every
          campsite in Kashmir, mapped by elevation, distance, and the silence
          that waits at the top.
        </p>
      </div>

      <div className="tc-scroll-hint">
        <span>SCROLL TO ASCEND</span>
        <div className="l" />
      </div>
    </section>
  );
}
