"use client";
import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const OPT = '/images/optimized/explore';

export default function ScenicDrivesSection() {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const handleMove = (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.01)`;
    };
    const handleLeave = () => { card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(1)'; };
    card.addEventListener('mousemove', handleMove);
    card.addEventListener('mouseleave', handleLeave);
    return () => { card.removeEventListener('mousemove', handleMove); card.removeEventListener('mouseleave', handleLeave); };
  }, []);

  return (
    <section id="drives" className="section drives-section section-ambient waypoint-target" data-wp="Scenic Drives">
      <div className="amb-bg">
        <Image src={`${OPT}/river-valley.avif`} alt="" fill sizes="100vw" quality={60} loading="lazy" style={{ objectFit: 'cover' }} />
        <div className="amb-scrim"></div>
      </div>

      <div className="container">
        <div className="drives-grid">
          <div className="drives-media reveal tilt-card" ref={cardRef}>
            <Image src="/scenic.jpg" alt="Road winding through golden mustard fields in Kashmir" fill sizes="(max-width:900px) 100vw, 50vw" quality={70} loading="lazy" style={{ objectFit: 'cover' }} />
            <div className="road-svg">
              <svg viewBox="0 0 400 400" preserveAspectRatio="none" aria-hidden="true"><path id="road-path" d="M40,400 C60,300 220,320 200,220 C180,120 320,140 340,20" stroke="var(--paper)" strokeWidth="2" strokeDasharray="6 10" fill="none" opacity="0.55" /></svg>
            </div>
          </div>
          <div className="drives-copy reveal">
            <p className="eyebrow">04 — Scenic Drives</p>
            <h2 className="serif section-title">Scenic drives,<br /><em>endless</em> stories.</h2>
            <p className="bleed-sub" style={{ color: 'var(--paper-dim)' }}>Unforgettable road trips through winding valleys, mustard fields, and quiet mountain passes.</p>

            <div className="route-card">
              <p className="mono route-label">Featured Route</p>
              <h3 className="serif">The Great Kashmir Road Trip</h3>
              <div className="stat-row mono" style={{ marginTop: '14px' }}>
                <span>2 DAYS</span><span>·</span><span>MODERATE</span>
              </div>
              <Link href="/scenic-drives" className="btn btn-primary" style={{ marginTop: '22px' }}>View route <span>→</span></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
