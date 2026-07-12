"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const OPT = '/images/optimized/explore';

export default function NatureEscapesSection() {
  return (
    <section id="nature" className="section section-ambient waypoint-target" data-wp="Nature">
      <div className="amb-bg">
        <Image src={`${OPT}/cloudy-peaks.avif`} alt="" fill sizes="100vw" quality={60} loading="lazy" style={{ objectFit: 'cover' }} />
        <div className="amb-scrim" style={{ opacity: '0.55' }}></div>
      </div>

      <div className="container">
        <div className="trek-grid">
          <div className="trek-copy reveal">
            <p className="eyebrow">06 — Trekking &amp; Camping</p>
            <h2 className="serif section-title">Sleep under deodar,<br />wake in <em>alpine</em> light.</h2>
            <p className="bleed-sub" style={{ color: 'var(--paper-dim)' }}>Twelve routes through pine forest and open ridgeline, from easy overnight camps to multi-day treks above the treeline. Tents, guides, and permits — mapped out before you lace up.</p>
            <div className="trek-stats mono">
              <span className="trek-stat">12 curated treks</span>
              <span className="trek-stat">3–8 day routes</span>
              <span className="trek-stat">2,400–4,200m altitude</span>
            </div>
            <Link href="/trekking-camping" className="btn btn-primary">Explore Treks &amp; Camps <span>→</span></Link>
          </div>

          <div className="route-card trek-elevation reveal tilt-card">
            <p className="mono route-label">Sample Trek Profile</p>
            <h3 className="serif">Ridge to Summit Route</h3>
            <svg className="elevation-chart" viewBox="0 0 520 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Elevation profile showing base camp at 2400m rising to summit at 4200m">
              <line className="ec-grid" x1="20" y1="220" x2="500" y2="220" />
              <line className="ec-grid" x1="20" y1="130" x2="500" y2="130" />
              <line className="ec-grid" x1="20" y1="40" x2="500" y2="40" />
              <path className="ec-area" d="M40,220 L190,150 L340,95 L480,40 L480,220 L40,220 Z" />
              <path className="ec-line" d="M40,220 L190,150 L340,95 L480,40" />
              <circle className="ec-ring" cx="40" cy="220" r="10" />
              <circle className="ec-dot" cx="40" cy="220" r="5" />
              <text className="ec-elev" x="40" y="244" textAnchor="middle">2,400m</text>
              <circle className="ec-ring" cx="190" cy="150" r="10" />
              <circle className="ec-dot" cx="190" cy="150" r="5" />
              <text className="ec-elev" x="190" y="128" textAnchor="middle">3,100m</text>
              <circle className="ec-ring" cx="340" cy="95" r="10" />
              <circle className="ec-dot" cx="340" cy="95" r="5" />
              <text className="ec-elev" x="340" y="73" textAnchor="middle">3,650m</text>
              <circle className="ec-ring" cx="480" cy="40" r="10" />
              <circle className="ec-dot" cx="480" cy="40" r="5" />
              <text className="ec-elev" x="480" y="24" textAnchor="middle">4,200m</text>
            </svg>
            <div className="elevation-legend mono">
              <div className="elevation-legend-item"><span className="dot"></span>Base Camp <span className="elev-val">2,400m</span></div>
              <div className="elevation-legend-item"><span className="dot"></span>Alpine Meadow <span className="elev-val">3,100m</span></div>
              <div className="elevation-legend-item"><span className="dot"></span>Ridge Camp <span className="elev-val">3,650m</span></div>
              <div className="elevation-legend-item"><span className="dot"></span>Summit Point <span className="elev-val">4,200m</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
