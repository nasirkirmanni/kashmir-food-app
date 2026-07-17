"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import './explore.css';

/* ---- Lazy-loaded below-fold sections ---- */
const HiddenGemsSection = dynamic(() => import('./sections/HiddenGemsSection'), {
  loading: () => <div style={{ minHeight: '900px' }} />
});
const PhotographySection = dynamic(() => import('./sections/PhotographySection'), {
  loading: () => <div style={{ minHeight: '600px' }} />
});
const ScenicDrivesSection = dynamic(() => import('./sections/ScenicDrivesSection'), {
  loading: () => <div style={{ minHeight: '600px' }} />
});
const FoodTrailsSection = dynamic(() => import('./sections/FoodTrailsSection'), {
  loading: () => <div style={{ minHeight: '600px' }} />
});
const NatureEscapesSection = dynamic(() => import('./sections/NatureEscapesSection'), {
  loading: () => <div style={{ minHeight: '600px' }} />
});
const SeasonSwitchSection = dynamic(() => import('./sections/SeasonSwitchSection'), {
  loading: () => <div style={{ minHeight: '600px' }} />
});
const WazaAISection = dynamic(() => import('./sections/WazaAISection'), {
  loading: () => <div style={{ minHeight: '600px' }} />
});
const ItinerariesSection = dynamic(() => import('./sections/ItinerariesSection'), {
  loading: () => <div style={{ minHeight: '400px' }} />
});
const ExploreFooter = dynamic(() => import('./sections/ExploreFooter'), {
  loading: () => <div style={{ minHeight: '300px' }} />
});

/* ---- Optimized image paths ---- */
const OPT = '/images/optimized/explore';

export default function ExploreClient({ data }) {
  const [temperature, setTemperature] = useState("--");
  const [activeCollection, setActiveCollection] = useState("01");
  const heroImgRef = useRef(null);

  const collectionsData = [
    {
      id: "01",
      title: "Hidden Gems",
      desc: "Untouched valleys, quietly kept",
      image: `${OPT}/yusm.avif`,
      pill: "5 Locations",
      stats: "5 STOPS · 4 DAYS · EASY",
      link: "gems"
    },
    {
      id: "02",
      title: "Photography Spots",
      desc: "Light worth waiting for",
      image: `${OPT}/hariparbat-dusk.avif`,
      pill: "7 Locations",
      stats: "7 STOPS · 2 DAYS · ALL LEVELS",
      link: "photography"
    },
    {
      id: "03",
      title: "Scenic Drives",
      desc: "Winding valleys, endless stories",
      image: `${OPT}/river-valley.avif`,
      pill: "3 Routes",
      stats: "3 ROUTES · 1 DAY · DRIVING",
      link: "drives"
    },
    {
      id: "04",
      title: "Food Trails",
      desc: "The seven-course wazwan tradition",
      image: `${OPT}/dal-shikara-sunset.avif`,
      pill: "8 Spots",
      stats: "8 SPOTS · 2 DAYS · FOODIE",
      link: "food"
    },
    {
      id: "05",
      title: "Trekking & Camping",
      desc: "Sleep under deodar pines",
      image: `${OPT}/cloudy-peaks.avif`,
      pill: "6 Trails",
      stats: "6 TRAILS · 5 DAYS · HARD",
      link: "nature"
    },
    {
      id: "06",
      title: "Best By Season",
      desc: "Winter wonderland, mapped",
      image: `${OPT}/mustard-fields.avif`,
      pill: "4 Seasons",
      stats: "12 STOPS · ALL YEAR · VARIES",
      link: "season"
    }
  ];

  const currentCollection = collectionsData.find(c => c.id === activeCollection);

  /* ---- Weather fetch (deferred via requestIdleCallback) ---- */
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch("https://wttr.in/Srinagar?format=j1");
        const json = await res.json();
        if (json?.current_condition?.[0]) {
          setTemperature(json.current_condition[0].temp_C);
        }
      } catch (err) {
        console.error("Weather fetch failed:", err);
      }
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(fetchWeather);
    } else {
      setTimeout(fetchWeather, 2000);
    }
  }, []);

  /* ---- Reveal on scroll (IntersectionObserver + MutationObserver for dynamic imports) ---- */
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });

    const observeReveal = (node) => {
      if (node.nodeType !== 1) return;
      if (node.classList.contains('reveal')) io.observe(node);
      const childReveals = node.querySelectorAll('.reveal');
      childReveals.forEach(el => io.observe(el));
    };

    // Observe already rendered elements
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // Observe dynamically imported elements as they mount
    const mo = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => observeReveal(node));
      });
    });
    
    const root = document.querySelector('.explore-page-root') || document.body;
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  /* ---- Hero typed prompt ---- */
  useEffect(() => {
    const prompts = [
      "5 friends · ₹3000 budget · hidden alpine lakes...",
      "Honeymoon in Gulmarg · 4 days · slow pace...",
      "Solo trip · photography · avoid the crowds...",
      "Family of 4 · easy trails · real wazwan food..."
    ];
    const typedEl = document.getElementById('ai-typed');
    if (!typedEl) return;
    let pIndex = 0, cIndex = 0, deleting = false, timer;
    function typeLoop() {
      const current = prompts[pIndex];
      if (!deleting) {
        cIndex++;
        typedEl.textContent = current.slice(0, cIndex);
        if (cIndex === current.length) { deleting = true; timer = setTimeout(typeLoop, 1800); return; }
      } else {
        cIndex--;
        typedEl.textContent = current.slice(0, cIndex);
        if (cIndex === 0) { deleting = false; pIndex = (pIndex + 1) % prompts.length; }
      }
      timer = setTimeout(typeLoop, deleting ? 26 : 44);
    }
    typeLoop();
    return () => clearTimeout(timer);
  }, []);

  /* ---- Parallax (hero only) ---- */
  useEffect(() => {
    const heroImg = heroImgRef.current;
    if (!heroImg) return;
    function onScroll() {
      const y = window.scrollY;
      heroImg.style.transform = `translateY(${y * 0.15 * 0.25}px)`;
    }
    window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ---- Hero plan button -> Itinerary Builder (Part 1) ---- */
  useEffect(() => {
    const btn = document.getElementById('hero-plan-btn');
    if (!btn) return;
    const handler = (e) => {
      e.preventDefault();
      // Navigate to the dedicated Itinerary Builder (no longer scrolls to a
      // waitlist section, and does not open the Waza AI chat).
      window.location.href = '/itinerary-builder';
    };
    btn.addEventListener('click', handler);
    return () => btn.removeEventListener('click', handler);
  }, []);

  return (
    <div className="explore-page-root">
      <div id="grain"></div>

      {/*  ============ LANDING UTILITY BAR ============  */}
      <div className="landing-utility-bar reveal">
        <span className="weather-chip mono">Srinagar · {temperature}°C</span>
        <Link href="/itineraries" className="btn btn-ghost btn-sm">Itineraries</Link>
        <Link href="/plan" className="btn btn-primary btn-sm">Plan a trip</Link>
      </div>

      {/*  ============ HERO ============  */}
      <section id="hero">
        <div className="hero-media">
          <img
            ref={heroImgRef}
            src={`${OPT}/hariparbat-dusk.avif`}
            alt="Hariparbat Fort at dusk overlooking Srinagar and Dal Lake"
            className="hero-img"
            id="hero-img"
            width={1920}
            height={1280}
            fetchPriority="high"
            decoding="async"
          />
          <div className="hero-scrim"></div>
          <div className="hero-scrim-bottom"></div>
        </div>

        <div className="hero-content">
          <p className="eyebrow reveal">Discover Paradise — 34.0837° N</p>
          <h1 className="serif hero-title">
            <span className="reveal" style={{"transitionDelay":".05s"}}>What should</span><br />
            <span className="reveal" style={{"transitionDelay":".15s"}}>Kashmir show <em>you</em></span><br />
            <span className="reveal" style={{"transitionDelay":".25s"}}>today?</span>
          </h1>
          <p className="hero-sub reveal" style={{"transitionDelay":".35s"}}>Hidden waterfalls, alpine silence, and the valleys locals keep to themselves — traced into a route built around you.</p>

          <div className="hero-ai reveal" style={{"transitionDelay":".45s"}}>
            <div className="hero-ai-bar">
              <span className="hero-ai-dot"></span>
              <span id="ai-typed" className="mono"></span><span className="caret">|</span>
            </div>
            <div className="hero-ai-actions">
              <button className="btn btn-primary" id="hero-plan-btn" aria-label="Ask Waza AI to plan your trip"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg> Ask Waza AI</button>
              <a href="#collections" className="btn btn-ghost">Browse manually</a>
            </div>
          </div>
        </div>

        <div className="hero-info-card reveal" style={{"transitionDelay":".5s"}}>
          <div className="hero-stat-row"><span>Elevation, Srinagar</span><span className="mono">1,585 m</span></div>
          <div className="hero-stat-row"><span>Best window</span><span className="mono">Apr – Oct</span></div>
          <div className="hero-stat-row"><span>Valleys catalogued</span><span className="mono">25</span></div>
          <p className="hero-info-quote serif">"Agar firdaus ba roy-e zamin ast,<br />hamin ast, hamin ast, hamin ast."</p>
        </div>

        <div className="hero-scroll reveal" style={{"transitionDelay":".6s"}}>
          <span className="mono">Scroll to explore</span>
          <div className="scroll-line"><div className="scroll-dot"></div></div>
        </div>

        <div className="hero-peaks">
          <svg viewBox="0 0 1600 200" preserveAspectRatio="none" aria-hidden="true"><path d="M0,200 L0,120 L160,40 L340,110 L520,20 L700,95 L900,10 L1100,90 L1300,30 L1460,100 L1600,60 L1600,200 Z" fill="var(--ink)"/></svg>
        </div>
      </section>

      {/*  ============ FEATURED COLLECTIONS ============  */}
      <section id="collections" className="section section-ambient waypoint-target" data-wp="Featured">
        <div className="amb-bg">
          <Image
            src={`${OPT}/snow-jump.avif`}
            alt=""
            fill
            sizes="100vw"
            quality={60}
            loading="lazy"
            style={{ objectFit: 'cover' }}
          />
          <div className="amb-scrim"></div>
        </div>

        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">01 — Featured Collections</p>
            <h2 className="serif section-title">Curated by people who<br />actually live here.</h2>
          </div>

          <div className="collections-grid">
            <div className="collection-hero reveal tilt-card">
              <Image
                key={currentCollection.id}
                src={currentCollection.image}
                alt={currentCollection.desc}
                fill
                sizes="(max-width: 900px) 100vw, 60vw"
                quality={70}
                style={{ objectFit: 'cover' }}
              />
              <div className="collection-hero-scrim"></div>
              <span className="pill" key={`pill-${currentCollection.id}`}>{currentCollection.pill}</span>
              <div className="collection-hero-copy" key={`copy-${currentCollection.id}`}>
                <h3 className="serif">{currentCollection.title}</h3>
                <p>{currentCollection.desc}</p>
                <div className="stat-row mono">
                  {currentCollection.stats.split('·').map((stat, i, arr) => (
                    <React.Fragment key={i}>
                      <span>{stat.trim()}</span>
                      {i < arr.length - 1 && <span>·</span>}
                    </React.Fragment>
                  ))}
                </div>
                <a 
                  href={`#${currentCollection.link}`} 
                  className="collection-link"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(currentCollection.link)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore collection <span>→</span>
                </a>
              </div>
            </div>

            <ul className="collection-list reveal">
              {collectionsData.map(c => (
                <li 
                  key={c.id} 
                  className={activeCollection === c.id ? "active" : ""}
                  onClick={() => setActiveCollection(c.id)}
                >
                  <span className="mono">{c.id}</span>
                  <div>
                    <p>{c.title}</p>
                    <small>{c.desc}</small>
                  </div>
                  <span className="arrow" aria-hidden="true">→</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/*  ============ LAZY-LOADED BELOW-FOLD SECTIONS ============  */}
      <HiddenGemsSection />
      <PhotographySection />
      <ScenicDrivesSection />
      <FoodTrailsSection />
      <NatureEscapesSection />
      <SeasonSwitchSection />
      <WazaAISection />
      <ItinerariesSection />
      <ExploreFooter />
    </div>
  );
}
