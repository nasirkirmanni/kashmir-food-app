"use client";
import React, { useEffect } from 'react';
import Image from 'next/image';

const OPT = '/images/optimized/explore';

export default function WazaAISection() {
  useEffect(() => {
    const wazaMsg = document.getElementById('waza-ai-msg');
    if (!wazaMsg) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          setTimeout(() => {
            wazaMsg.innerHTML = '<p>Found it — <strong>Gurez Valley</strong> for the lake, camping under deodar for the budget, and a wazwan stop in Bandipora on the way back. Building your 3-day route now →</p>';
          }, 1600);
          io.unobserve(wazaMsg);
        }
      });
    }, { threshold: 0.6 });
    io.observe(wazaMsg);
    return () => io.disconnect();
  }, []);

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
            <span className="status-pill mono"><span className="dot"></span> In active development</span>
            <h2 className="serif section-title" style={{ marginTop: '20px' }}>Tell Waza where<br />you want to <em>feel</em> something.</h2>
            <p className="bleed-sub" style={{ color: 'var(--paper-dim)' }}>No forms, no filters. Describe your people, your budget, your mood — Waza drafts a real Kashmir itinerary in seconds, like having a local expert in your pocket.</p>
            <div className="waza-features mono">
              <div><span>01</span> Reads mood, not just dates</div>
              <div><span>02</span> Balances budget across stays, food &amp; travel</div>
              <div><span>03</span> Routes around crowds automatically</div>
            </div>
            <a href="#" className="btn btn-primary" style={{ marginTop: '32px' }}>Join the waitlist</a>
          </div>

          <div className="waza-demo reveal">
            <div className="waza-window">
              <div className="waza-window-head">
                <span className="wdot" style={{ background: '#e0a15e' }}></span>
                <span className="wdot" style={{ background: '#a8543a' }}></span>
                <span className="wdot" style={{ background: '#4a5d46' }}></span>
                <span className="mono waza-window-title">waza-ai · planning</span>
              </div>
              <div className="waza-window-body">
                <div className="waza-msg user">
                  <p>&quot;We&apos;re five friends. Our budget is ₹3000 pp. We want hidden alpine lakes and real wazwan.&quot;</p>
                </div>
                <div className="waza-msg ai" id="waza-ai-msg">
                  <div className="waza-typing"><span></span><span></span><span></span></div>
                </div>
              </div>
            </div>
            <div className="waza-glow"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
