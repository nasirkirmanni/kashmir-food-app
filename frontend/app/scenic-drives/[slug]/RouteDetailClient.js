"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { endpoints, request } from '@/lib/api';
import './scenic-drive-detail.css';

export default function RouteDetailClient({ route }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      request(endpoints.savedRoutes).then(routes => {
        setIsSaved(routes.includes(route.slug));
      }).catch(console.error);
    }
  }, [user, route.slug]);

  const toggleSave = async () => {
    if (!user) {
      alert("Please log in to save routes.");
      return;
    }
    setIsSaving(true);
    try {
      if (isSaved) {
        await request(endpoints.savedRoutes, {
          method: "DELETE",
          body: JSON.stringify({ slug: route.slug })
        });
        setIsSaved(false);
      } else {
        await request(endpoints.savedRoutes, {
          method: "POST",
          body: JSON.stringify({ slug: route.slug })
        });
        setIsSaved(true);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save route.");
    } finally {
      setIsSaving(false);
    }
  };

  const railRef = useRef(null);
  const readoutRef = useRef(null);
  const kmElRef = useRef(null);
  const altElRef = useRef(null);
  const profile = route.profile;
  const totalKm = profile[profile.length - 1].dist;
  const startAlt = profile[0].alt;
  const endAlt = profile[profile.length - 1].alt;

  useEffect(() => {
    if (!mounted) return;

    // Exact sd.html DOM lookups
    const rail = document.getElementById('rail');
    const readout = document.getElementById('readout');
    const kmEl = document.getElementById('km');
    const altEl = document.getElementById('alt');

    let targetKm = 0;
    let targetAlt = startAlt;
    let currentKm = 0;
    let currentAlt = startAlt;
    let lastRenderedKm = -1;
    let lastRenderedAlt = -1;
    let rafId = null;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const doc = document.documentElement;
        const maxScroll = Math.max(doc.scrollHeight, document.body.scrollHeight) - window.innerHeight;
        const pct = Math.max(0, Math.min(1, window.scrollY / (maxScroll || 1)));
        
        targetKm = pct * totalKm;
        targetAlt = startAlt + pct * (endAlt - startAlt);
        
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    const loop = () => {
      if (rail) {
        const doc = document.documentElement;
        const maxScroll = Math.max(doc.scrollHeight, document.body.scrollHeight) - window.innerHeight;
        const pct = Math.max(0, Math.min(1, window.scrollY / (maxScroll || 1)));
        rail.style.width = (pct * 100) + '%';
      }
      
      if (readout) {
        if (window.scrollY > window.innerHeight * 0.6) {
          readout.style.opacity = '1';
        } else {
          readout.style.opacity = '0';
        }
      }

      if (Math.abs(targetKm - currentKm) < 0.05) currentKm = targetKm;
      else currentKm += (targetKm - currentKm) * 0.08;

      if (Math.abs(targetAlt - currentAlt) < 0.05) currentAlt = targetAlt;
      else currentAlt += (targetAlt - currentAlt) * 0.08;

      const roundedKm = Math.round(currentKm);
      const roundedAlt = Math.round(currentAlt);

      if (kmEl && roundedKm !== lastRenderedKm) {
        kmEl.textContent = 'KM ' + String(roundedKm).padStart(2, '0') + ' / ' + totalKm;
        lastRenderedKm = roundedKm;
      }
      if (altEl && roundedAlt !== lastRenderedAlt) {
        altEl.textContent = 'ALT ' + roundedAlt.toLocaleString() + 'M';
        lastRenderedAlt = roundedAlt;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [totalKm, startAlt, endAlt, mounted]);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('in');
      });
    }, { threshold: 0.2 });
    
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    
    const profileIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          document.querySelectorAll('.elev-line, .elev-fill, .wp-dot, .wp-txt, .wp-sub').forEach(el => el.classList.add('draw'));
          profileIo.disconnect();
        }
      });
    }, { threshold: 0.3 });
    
    const pSec = document.getElementById('profile-sec');
    if (pSec) profileIo.observe(pSec);

    document.querySelectorAll('.chapter-media img').forEach(img => {
      const parent = img.closest('.chapter');
      window.addEventListener('scroll', () => {
        if (!parent) return;
        const r = parent.getBoundingClientRect();
        const shift = (r.top) * -0.08;
        img.style.transform = `translateY(${shift}px) scale(1.08)`;
      }, { passive: true });
    });
  }, []);

  const maxAlt = Math.max(...profile.map(p => p.alt));
  const minAlt = Math.min(...profile.map(p => p.alt));
  const maxDist = totalKm;

  const mapPoint = (p) => {
    const x = 20 + (p.dist / maxDist) * 940;
    const y = 260 - ((p.alt - minAlt) / (maxAlt - minAlt)) * 240;
    return { x, y, ...p };
  };
  
  const pts = profile.map(mapPoint);
  let pathD = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    pathD += ` L${pts[i].x},${pts[i].y}`;
  }
  const fillD = `${pathD} L${pts[pts.length - 1].x},260 L${pts[0].x},260 Z`;

  const portalContent = mounted && typeof document !== 'undefined' ? createPortal(
    <>
      <div 
        id="rail" 
        style={{
          position: 'fixed', top: '80px', left: '0', height: '2px', width: '0%', 
          background: '#C9A24D', zIndex: 999999, transition: 'width 0.05s linear'
        }}
      ></div>
      <div 
        id="readout" 
        style={{
          position: 'fixed', top: '102px', right: '32px', zIndex: 999999, textAlign: 'right',
          fontFamily: "'IBM Plex Mono', monospace", fontSize: '11px', color: '#EBCB7E',
          opacity: 0, transition: 'opacity 0.5s ease', pointerEvents: 'none'
        }}
      >
        <div id="km">KM 00 / {totalKm}</div>
        <div className="alt" id="alt">ALT {startAlt.toLocaleString()}M</div>
      </div>
    </>,
    document.body
  ) : null;

  return (
    <>
      {portalContent}

      {/* HERO */}
      <section className="hero">
        <div className="hero-media">
          <img src={route.heroImage} alt={route.title} />
        </div>
        <div className="hero-body">
          <div className="hero-kicker" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div><span className="tick"></span>{route.kicker}</div>
            <button 
              onClick={toggleSave} 
              disabled={isSaving}
              style={{
                background: isSaved ? 'var(--saffron)' : 'transparent', 
                border: '1px solid var(--saffron)', 
                color: isSaved ? '#000' : 'var(--saffron)', 
                padding: '6px 14px', borderRadius: '40px', cursor: 'pointer', fontSize: '11px', 
                textTransform: 'uppercase', letterSpacing: '1px', transition: 'all 0.3s ease'
              }}
            >
              {isSaved ? "Saved" : "Save Route"}
            </button>
          </div>
          <h1 className="serif">{route.title}</h1>
          <div className="hero-meta">
            <div><div className="m-label">Distance</div><div className="m-val mono">{route.distance}</div></div>
            <div><div className="m-label">Duration</div><div className="m-val mono">{route.duration}</div></div>
            <div><div className="m-label">Difficulty</div><div className="m-val mono">{route.difficulty}</div></div>
            <div><div className="m-label">Best season</div><div className="m-val mono">{route.bestSeason}</div></div>
          </div>
        </div>
        <div className="scroll-cue"><span>SCROLL TO DRIVE</span><div className="line"></div></div>
      </section>

      {/* ELEVATION */}
      <section className="wrap profile-section reveal" id="profile-sec">
        <div className="section-kicker">Route profile &middot; Live map</div>
        <h2 className="serif section-title">{route.elevationTitle}</h2>

        <div className="profile-svg-wrap">
          <svg viewBox="0 0 1000 300" preserveAspectRatio="none">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C9A24D" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#C9A24D" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <line className="grid-l" x1="0" y1="70" x2="1000" y2="70"/>
            <line className="grid-l" x1="0" y1="150" x2="1000" y2="150"/>
            <line className="grid-l" x1="0" y1="230" x2="1000" y2="230"/>

            <path className="elev-fill" id="fill" d={fillD} />
            <path className="elev-line" id="line" d={pathD} />

            {pts.map((pt, i) => (
              <g key={i}>
                <circle className={`wp-dot ${i === 0 || i === pts.length - 1 ? 'term' : ''}`} cx={pt.x} cy={pt.y} r={i === 0 || i === pts.length - 1 ? "6" : "5.5"}/>
                <text className="wp-txt" x={pt.x} y={pt.y - 20} textAnchor={i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle"}>{pt.name}</text>
                <text className="wp-sub" x={pt.x} y={pt.y - 7} textAnchor={i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle"}>{pt.subtext}</text>
                <text className="km-txt" x={pt.x} y="284" textAnchor={i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle"}>{pt.km}</text>
              </g>
            ))}
          </svg>
        </div>
      </section>

      {/* CHAPTERS */}
      {route.chapters.map((chap, i) => (
        <section className={`chapter ${i % 2 !== 0 ? 'right' : ''}`} key={i}>
          <div className="chapter-media">
            <img src={chap.media} alt={chap.title} />
          </div>
          <div className="chapter-body">
            <div className="chapter-num"><span className="tick"></span>CHAPTER {chap.num}</div>
            <h2 className="serif">{chap.title}</h2>
            <p>{chap.description}</p>
            <div className="chapter-meta">
              {chap.meta.map((m, idx) => (
                <div key={idx}>
                  {m.value}
                  <small>{m.label}</small>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* FIELD NOTES */}
      <section className="wrap notes-section reveal">
        <div className="section-kicker">Field Notes</div>
        <h2 className="serif section-title">What to know before you turn the key.</h2>
        <div className="notes-grid">
          {route.notes.map((note, i) => (
            <div className="note-cell" key={i}>
              <div className="n-label">{note.label}</div>
              <div className="n-val">{note.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CLOSE */}
      <section className="close-section">
        <div className="ghost-svg">
          <svg viewBox="0 0 1000 300" preserveAspectRatio="none">
            <path d="M20,220 C280,215 420,205 560,175 C700,145 800,90 850,55 L960,20" fill="none" stroke="#C9A24D" strokeWidth="2" />
          </svg>
        </div>
        <div className="close-body reveal">
          <p className="mono">{route.distance} &middot; {route.duration} &middot; {route.slug === 'srinagar-to-doodhpathri' ? 'one meadow' : 'the journey awaits'}</p>
          <h2 className="serif">{route.slug === 'srinagar-to-doodhpathri' ? 'The road is open. So is the meadow.' : 'The road is open. So is the view.'}</h2>
          <Link href="/scenic-drives" className="cta">PLAN THIS DRIVE &rarr;</Link>
        </div>
      </section>
    </>
  );
}
