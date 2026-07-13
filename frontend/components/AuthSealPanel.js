"use client";

import React, { useEffect, useRef, useState } from "react";

const defaultSealPhrases = [
  "Everything Kashmir, kept for you.",
  "Kashmir, all in one place.",
  "Your way to Kashmir.",
  "Kashmir, thoughtfully curated.",
  "Where Kashmir comes together.",
  "Kashmir, at your fingertips.",
  "The home of everything Kashmir.",
  "Kashmir begins here.",
  "Discover Kashmir. Authentically.",
  "Every corner of Kashmir, in one place.",
  "The heart of Kashmir, made accessible.",
  "Bringing Kashmir closer to you.",
  "Kashmir, beyond the postcards.",
  "More than a guide. It's Kashmir.",
  "Crafted for those who love Kashmir."
];

export default function AuthSealPanel({ 
  phrases = defaultSealPhrases,
  tagline = "Wazwan Way · Est. Kashmir",
  subText = "Saved routes, custom itineraries, and Waza AI — all synced the moment you sign in."
}) {
  const headlineRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);

    let phraseIdx = 0;
    let timeoutId;

    const cycleStatic = () => {
      if (headlineRef.current) {
        headlineRef.current.textContent = phrases[phraseIdx % phrases.length];
        phraseIdx++;
        timeoutId = setTimeout(cycleStatic, 2600);
      }
    };

    const typeWriterLoop = () => {
      if (!headlineRef.current) return;
      const phrase = phrases[phraseIdx % phrases.length];
      let i = 0;
      const typeSpeed = 42, holdTime = 2000, deleteSpeed = 22, gapTime = 350;

      const typeStep = () => {
        if (!headlineRef.current) return;
        headlineRef.current.textContent = phrase.slice(0, i);
        i++;
        if (i <= phrase.length) { timeoutId = setTimeout(typeStep, typeSpeed); }
        else { timeoutId = setTimeout(deleteStep, holdTime); }
      };
      
      const deleteStep = () => {
        if (!headlineRef.current) return;
        i--;
        headlineRef.current.textContent = phrase.slice(0, i);
        if (i > 0) { timeoutId = setTimeout(deleteStep, deleteSpeed); }
        else {
          phraseIdx++;
          timeoutId = setTimeout(typeWriterLoop, gapTime);
        }
      };
      typeStep();
    };

    if (mq.matches) {
      cycleStatic();
    } else {
      timeoutId = setTimeout(typeWriterLoop, 900);
    }

    return () => clearTimeout(timeoutId);
  }, [phrases]);

  return (
    <div className="seal-panel">
      <div className="seal-wrap">
        <div className="seal-flash flash"></div>
        <svg className="seal stamp" viewBox="0 0 184 184" fill="none">
          <g className="seal-rings">
            <circle cx="92" cy="92" r="88" stroke="var(--line)" strokeWidth="1"/>
            <circle cx="92" cy="92" r="74" stroke="var(--gold-soft)" strokeWidth="1"/>
            <circle cx="92" cy="92" r="60" stroke="var(--line)" strokeWidth="1"/>
            {/* compass ticks */}
            <g stroke="var(--gold)" strokeWidth="1.4">
              <line x1="92" y1="4" x2="92" y2="16"/>
              <line x1="92" y1="168" x2="92" y2="180"/>
              <line x1="4" y1="92" x2="16" y2="92"/>
              <line x1="168" y1="92" x2="180" y2="92"/>
            </g>
          </g>
          <circle cx="92" cy="92" r="44" fill="url(#sealGrad)" stroke="var(--gold)" strokeWidth="1"/>
          <defs>
            <radialGradient id="sealGrad" cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#e6bd7a"/>
              <stop offset="55%" stopColor="var(--gold)"/>
              <stop offset="100%" stopColor="var(--copper)"/>
            </radialGradient>
          </defs>
          <text x="92" y="102" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="34" fontWeight="600" fill="#12100d">WW</text>
        </svg>
      </div>

      <div className="seal-tagline">{tagline}</div>
      <h1 className="seal-headline">
        <span ref={headlineRef}></span>
        {!reducedMotion && <span className="seal-caret"></span>}
      </h1>
      <p className="seal-sub">{subText}</p>
    </div>
  );
}
