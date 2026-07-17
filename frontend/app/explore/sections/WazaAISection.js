"use client";
import React from 'react';
import Image from 'next/image';
import WazaAITeaser from '@/components/WazaAITeaser';

const OPT = '/images/optimized/explore';

// General Kashmir/Wazwan Q&A (NOT the itinerary planner — that lives at
// /itinerary-builder, reached from the hero button). Answers render as HTML.
const WAZA_QA = [
  {
    q: "What's the most iconic Wazwan dish to try first?",
    a: "Start with <strong>Rogan Josh</strong> and <strong>Rista</strong> — they open a traditional trami and show the full range of Kashmiri spice.",
  },
  {
    q: "Is Kahwa worth trying?",
    a: "Always. <strong>Kahwa</strong> is saffron-and-cinnamon green tea poured from a samovar — the perfect close to a Wazwan meal.",
  },
  {
    q: "Where do locals eat in Srinagar's Old City?",
    a: "The lanes around <strong>Maharaj Gunj</strong> — visit a <strong>Kandur</strong> bakery at dawn for hot Girda and salted Noon Chai.",
  },
];

export default function WazaAISection() {
  const askWaza = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-waza-ai-intro"));
    }
  };

  return (
    <section id="waza" className="section waza-section section-ambient waypoint-target" data-wp="Waza AI">
      <div className="amb-bg">
        <Image src={`${OPT}/blue-valley.avif`} alt="" fill sizes="100vw" quality={60} loading="lazy" style={{ objectFit: 'cover' }} />
        <div className="amb-scrim"></div>
      </div>
      <div className="topo-pattern"></div>
      <div className="container">
        <div className="waza-grid">
          <div className="waza-copy reveal">
            <span className="status-pill mono"><span className="dot"></span> Waza AI · live</span>
            <h2 className="serif section-title" style={{ marginTop: '20px' }}>
              Ask Waza anything<br />about <em>Kashmir</em>.
            </h2>
            <p className="bleed-sub" style={{ color: 'var(--paper-dim)' }}>
              Dishes, etiquette, seasons, hidden gems — Waza AI answers like a local expert in your pocket. Ready to plan? The hero button builds you a full day-by-day itinerary.
            </p>
            <div className="waza-features mono">
              <div><span>01</span> Real Kashmiri food &amp; culture knowledge</div>
              <div><span>02</span> Honest, tourist-trap-aware answers</div>
              <div><span>03</span> Instant — no forms, no waiting</div>
            </div>
            <button type="button" onClick={askWaza} className="btn btn-primary" style={{ marginTop: '32px' }}>
              Ask Waza AI
            </button>
          </div>

          <div className="waza-demo reveal">
            <WazaAITeaser qaData={WAZA_QA} />
          </div>
        </div>
      </div>
    </section>
  );
}
