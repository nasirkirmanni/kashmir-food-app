"use client";
import React from 'react';
import Image from 'next/image';

const OPT = '/images/optimized/explore';

export default function ItinerariesSection() {
  return (
    <section className="section itin-section section-ambient waypoint-target" data-wp="Itineraries">
      <div className="amb-bg">
        <Image src={`${OPT}/red-jacket-hiker.avif`} alt="" fill sizes="100vw" quality={60} loading="lazy" style={{ objectFit: 'cover' }} />
        <div className="amb-scrim"></div>
      </div>

      <div className="container">
        <div className="itin-card reveal">
          <div className="itin-marker">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21z" stroke="currentColor" strokeWidth="1.4" /><circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.4" /></svg>
          </div>
          <h2 className="serif section-title" style={{ marginBottom: '14px' }}>Your route through<br />Kashmir, saved.</h2>
          <p className="bleed-sub" style={{ color: 'var(--paper-dim)', margin: '0 auto 32px' }}>Save destinations, scenic drives, and curated collections as you go — we&apos;ll trace the trail for you.</p>
          <a href="#" className="btn btn-primary">View saved items <span>→</span></a>
        </div>
      </div>
    </section>
  );
}
