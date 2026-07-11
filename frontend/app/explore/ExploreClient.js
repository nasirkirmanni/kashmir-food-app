"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './explore.css';

export default function ExploreClient({ data }) {
  useEffect(() => {
const WW_PLACEHOLDER = '/images/snow-jump.jpg';








/* ---------- reveal on scroll ---------- */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
},{threshold:0.15});
revealEls.forEach(el=>io.observe(el));

/* ---------- hero typed prompt ---------- */
const prompts = [
  "5 friends · ₹3000 budget · hidden alpine lakes...",
  "Honeymoon in Gulmarg · 4 days · slow pace...",
  "Solo trip · photography · avoid the crowds...",
  "Family of 4 · easy trails · real wazwan food..."
];
const typedEl = document.getElementById('ai-typed');
let pIndex=0, cIndex=0, deleting=false;
function typeLoop(){
  const current = prompts[pIndex];
  if(!deleting){
    cIndex++;
    typedEl.textContent = current.slice(0,cIndex);
    if(cIndex===current.length){ deleting=true; setTimeout(typeLoop, 1800); return; }
  } else {
    cIndex--;
    typedEl.textContent = current.slice(0,cIndex);
    if(cIndex===0){ deleting=false; pIndex=(pIndex+1)%prompts.length; }
  }
  setTimeout(typeLoop, deleting?26:44);
}
typeLoop();
document.getElementById('hero-plan-btn').addEventListener('click', (e)=>{
  e.preventDefault();
  document.getElementById('waza').scrollIntoView({behavior:'smooth'});
});

/* ---------- parallax ---------- */
const parallaxEls = document.querySelectorAll('[data-parallax]');
function onScrollParallax(){
  const y = window.scrollY;
  parallaxEls.forEach(el=>{
    const speed = parseFloat(el.dataset.parallax);
    const rect = el.closest('section').getBoundingClientRect();
    const offset = (window.innerHeight - rect.top) * speed;
    el.style.transform = `translateY(${offset*0.15}px)`;
  });
}
window.addEventListener('scroll', ()=>requestAnimationFrame(onScrollParallax), {passive:true});





/* ---------- filmstrip scroll buttons ---------- */
document.querySelectorAll('.fs-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const stripId = btn.dataset.strip==='photo' ? 'photo-strip' : 'gems-strip';
    const track = document.querySelector(`#${stripId} .filmstrip-track`);
    if(track) track.scrollBy({left: 340*parseInt(btn.dataset.dir), behavior:'smooth'});
  });
});
// fallback for gems strip buttons without data-strip
document.querySelectorAll('#gems-strip .fs-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelector('#gems-strip .filmstrip-track').scrollBy({left:340*parseInt(btn.dataset.dir), behavior:'smooth'});
  });
});

/* ---------- tilt cards ---------- */
document.querySelectorAll('.tilt-card').forEach(card=>{
  card.addEventListener('mousemove', (e)=>{
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left)/r.width - 0.5;
    const y = (e.clientY - r.top)/r.height - 0.5;
    card.style.transform = `perspective(1000px) rotateY(${x*6}deg) rotateX(${-y*6}deg) scale(1.01)`;
  });
  card.addEventListener('mouseleave', ()=>{ card.style.transform='perspective(1000px) rotateY(0) rotateX(0) scale(1)'; });
});

/* ---------- season switch ---------- */
const seasonData = {
  winter:{
    title:'Destinations that come<br />alive in <em>winter</em>.',
    cards:[
      {img: WW_PLACEHOLDER, tag:'Family', name:'Gulmarg', meta:'1–2 Days · High crowd'},
      {img: WW_PLACEHOLDER, tag:'Hidden Gem', name:'Doodhpathri', meta:'Half Day · Moderate'},
      {img: WW_PLACEHOLDER, tag:'Adventure', name:'Sonamarg', meta:'1 Day · Moderate'},
      {img: WW_PLACEHOLDER, tag:'Family', name:'Srinagar', meta:'2–3 Days · High crowd'},
      {img: WW_PLACEHOLDER, tag:'Hidden Gem', name:'Kokernag', meta:'Half Day · Moderate'},
    ]
  },
  summer:{
    title:'Destinations that come<br />alive in <em>summer</em>.',
    cards:[
      {img: WW_PLACEHOLDER, tag:'Family', name:'Pahalgam', meta:'1–2 Days · High crowd'},
      {img: WW_PLACEHOLDER, tag:'Hidden Gem', name:'Yusmarg', meta:'Half Day · Low crowd'},
      {img: WW_PLACEHOLDER, tag:'Adventure', name:'Betaab Valley', meta:'Half Day · High effort'},
      {img: WW_PLACEHOLDER, tag:'Family', name:'Kokernag', meta:'Half Day · Moderate'},
      {img: WW_PLACEHOLDER, tag:'Hidden Gem', name:'Daksum', meta:'2 Days · Low crowd'},
    ]
  }
};
function renderSeason(season){
  const data = seasonData[season];
  document.getElementById('season-title').innerHTML = data.title;
  const wrap = document.getElementById('season-cards');
  wrap.innerHTML = data.cards.map(c=>`
    <div className="fcard tilt-card"><img src="${c.img}" /><div className="fcard-tag">${c.tag}</div><div className="fcard-copy"><h4>${c.name}</h4><span className="mono">${c.meta}</span></div></div>
  `).join('');
  wrap.querySelectorAll('.tilt-card').forEach(card=>{
    card.addEventListener('mousemove', (e)=>{
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left)/r.width - 0.5;
      const y = (e.clientY - r.top)/r.height - 0.5;
      card.style.transform = `perspective(1000px) rotateY(${x*6}deg) rotateX(${-y*6}deg) scale(1.01)`;
    });
    card.addEventListener('mouseleave', ()=>{ card.style.transform='perspective(1000px) rotateY(0) rotateX(0) scale(1)'; });
  });
  document.querySelectorAll('.season-bg').forEach(bg=>{
    bg.style.opacity = bg.dataset.season===season ? '1':'0';
  });
  document.querySelectorAll('.season-btn').forEach(b=> b.classList.toggle('active', b.dataset.season===season));
}
renderSeason('winter');
document.querySelectorAll('.season-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>renderSeason(btn.dataset.season));
});

/* ---------- waza ai typing reveal ---------- */
const wazaMsg = document.getElementById('waza-ai-msg');
const wazaIO = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      setTimeout(()=>{
        wazaMsg.innerHTML = '<p>Found it — <strong>Gurez Valley</strong> for the lake, camping under deodar for the budget, and a wazwan stop in Bandipora on the way back. Building your 3-day route now →</p>';
      }, 1600);
      wazaIO.unobserve(wazaMsg);
    }
  });
},{threshold:0.6});
wazaIO.observe(wazaMsg);


  }, []);

  return (
    <div className="explore-page-root">
<div id="grain"></div>



{/*  ============ LANDING UTILITY BAR (weather + plan a trip) ============  */}
<div className="landing-utility-bar reveal">
  <span className="weather-chip mono">Srinagar · 29°C</span>
  <a href="#" className="btn btn-primary btn-sm">Plan a trip</a>
</div>

{/*  ============ HERO ============  */}
<section id="hero">
  <div className="hero-media">
    <img src="/images/hariparbat-dusk.jpg" alt="" className="hero-img" data-parallax="0.25" id="hero-img" />
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
        <button className="btn btn-primary" id="hero-plan-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg> Ask Waza AI</button>
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
    <svg viewBox="0 0 1600 200" preserveAspectRatio="none"><path d="M0,200 L0,120 L160,40 L340,110 L520,20 L700,95 L900,10 L1100,90 L1300,30 L1460,100 L1600,60 L1600,200 Z" fill="var(--ink)"/></svg>
  </div>
</section>

{/*  ============ FEATURED COLLECTIONS ============  */}
<section id="collections" className="section section-ambient waypoint-target" data-wp="Featured">
  <div className="amb-bg"><img src="/images/snow-jump.jpg" alt="" /><div className="amb-scrim"></div></div>

  <div className="container">
    <div className="section-head reveal">
      <p className="eyebrow">01 — Featured Collections</p>
      <h2 className="serif section-title">Curated by people who<br />actually live here.</h2>
    </div>

    <div className="collections-grid">
      <div className="collection-hero reveal tilt-card">
        <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MDAgNDAwIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMTcxYjEzIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iNTUlIiBzdG9wLWNvbG9yPSIjMjAyNDFhIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzJiMjIxNiIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9InVybCgjZykiLz4KICA8cGF0aCBkPSJNLTIwLDMyMCBRMTUwLDI4MCAzMDAsMzIwIFQ2MjAsMzEwIiBmaWxsPSJub25lIiBzdHJva2U9IiNjZmM3YWUiIHN0cm9rZS1vcGFjaXR5PSIwLjA5IiBzdHJva2Utd2lkdGg9IjEuNCIgc3Ryb2tlLWRhc2hhcnJheT0iMiAxMCIvPgogIDxwYXRoIGQ9Ik0tMjAsMzU1IFExNTAsMzE4IDMwMCwzNTUgVDYyMCwzNDUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NmYzdhZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDYiIHN0cm9rZS13aWR0aD0iMS40IiBzdHJva2UtZGFzaGFycmF5PSIyIDEwIi8+CiAgPHBhdGggZD0iTS0yMCw0MDAgTC0yMCwzMDAgTDgwLDIzMCBMMTcwLDI5MCBMMjYwLDIwMCBMMzUwLDI4MCBMNDQwLDE5MCBMNTMwLDI3MCBMNjIwLDI0MCBMNjIwLDQwMCBaIiBmaWxsPSIjMGMwZjBiIiBmaWxsLW9wYWNpdHk9IjAuNTUiLz4KICA8cGF0aCBkPSJNLTIwLDQwMCBMLTIwLDM0MCBMMTAwLDI3MCBMMjEwLDMzMCBMMzIwLDI1MCBMNDMwLDMyMCBMNTQwLDI2MCBMNjIwLDMwMCBMNjIwLDQwMCBaIiBmaWxsPSIjMGMwZjBiIiBmaWxsLW9wYWNpdHk9IjAuOSIvPgogIDxjaXJjbGUgY3g9IjMwMCIgY3k9IjE3NiIgcj0iNSIgZmlsbD0iI2NlN2MzZSIvPgogIDxjaXJjbGUgY3g9IjMwMCIgY3k9IjE3NiIgcj0iMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NlN2MzZSIgc3Ryb2tlLW9wYWNpdHk9IjAuNCIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KPC9zdmc+" alt="Snow destinations" />
        <div className="collection-hero-scrim"></div>
        <span className="pill">4 Locations</span>
        <div className="collection-hero-copy">
          <h3 className="serif">Snow Destinations</h3>
          <p>Where the valley turns silent and white.</p>
          <div className="stat-row mono">
            <span>4 STOPS</span><span>·</span><span>3 DAYS</span><span>·</span><span>MODERATE</span>
          </div>
          <a href="#" className="collection-link">Explore collection <span>→</span></a>
        </div>
      </div>

      <ul className="collection-list reveal">
        <li className="active"><span className="mono">02</span><div><p>Hidden Gems</p><small>Untouched valleys, quietly kept</small></div><span className="arrow">→</span></li>
        <li><span className="mono">03</span><div><p>Photography Spots</p><small>Light worth waiting for</small></div><span className="arrow">→</span></li>
        <li><span className="mono">04</span><div><p>Scenic Drives</p><small>Winding valleys, endless stories</small></div><span className="arrow">→</span></li>
        <li><span className="mono">05</span><div><p>Food Trails</p><small>The seven-course wazwan tradition</small></div><span className="arrow">→</span></li>
        <li><span className="mono">06</span><div><p>Trekking &amp; Camping</p><small>Sleep under deodar pines</small></div><span className="arrow">→</span></li>
        <li><span className="mono">07</span><div><p>Best By Season</p><small>Winter wonderland, mapped</small></div><span className="arrow">→</span></li>
      </ul>
    </div>
  </div>
</section>

{/*  ============ HIDDEN GEMS ============  */}
<section id="gems" className="section-bleed waypoint-target" data-wp="Hidden Gems">
  <img src="/images/misty-village.jpg" alt="" className="bleed-img" data-parallax="0.15" />
  <div className="bleed-scrim"></div>
  <div className="container bleed-content">
    <div className="section-head reveal">
      <p className="eyebrow" style={{"color":"var(--paper)"}}>02 — Hidden Gems</p>
      <h2 className="serif section-title">Untouched valleys,<br /><em>quietly</em> kept.</h2>
      <p className="bleed-sub">Destinations far from the tourist trail — the ones locals rarely mention out loud.</p>
    </div>
  </div>

  <div className="filmstrip reveal" id="gems-strip">
    <div className="filmstrip-track">
      <div className="fcard fcard-lg"><img src="/images/yusm.png" /><div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Yusmarg</h4><span className="mono">Half Day · Low crowd</span></div></div>
      <div className="fcard"><img src="/images/gurez.png" /><div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Gurez Valley</h4><span className="mono">2 Days · Low crowd</span></div></div>
      <div className="fcard"><img src="/images/lolab.png" /><div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Lolab Valley</h4><span className="mono">1 Day · Low crowd</span></div></div>
      <div className="fcard fcard-lg"><img src="/images/doodhpathri.png" /><div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Doodhpathri</h4><span className="mono">1 Day · Moderate</span></div></div>
      <div className="fcard"><img src="/images/daksum.jpg" /><div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Daksum</h4><span className="mono">2 Days · Low crowd</span></div></div>
    </div>
    <div className="filmstrip-nav">
      <button className="fs-btn" data-dir="-1">←</button>
      <button className="fs-btn" data-dir="1">→</button>
    </div>
  </div>
</section>

{/*  ============ PHOTOGRAPHY SPOTS ============  */}
<section className="section section-ambient waypoint-target" data-wp="Photography" style={{"paddingTop":"110px"}}>
  <div className="amb-bg"><img src="/images/dal-shikara-sunset.jpg" alt="" /><div className="amb-scrim"></div></div>

  <div className="container">
    <div className="section-head-row reveal">
      <div>
        <p className="eyebrow">03 — Photography Spots</p>
        <h2 className="serif section-title" style={{"marginBottom":"0"}}>The most majestic<br />light for your lens.</h2>
      </div>
      <div className="filmstrip-nav" style={{"padding":"0"}}>
        <button className="fs-btn" data-strip="photo" data-dir="-1">←</button>
        <button className="fs-btn" data-strip="photo" data-dir="1">→</button>
      </div>
    </div>
  </div>

  <div className="filmstrip reveal" id="photo-strip" style={{"marginTop":"56px"}}>
    <div className="filmstrip-track">
      <div className="fcard fcard-lg"><img src="/images/srinagar.jpg" /><div className="fcard-tag">Family</div><div className="fcard-copy"><h4>Srinagar</h4><span className="mono">2–3 Days · High crowd</span></div></div>
      <div className="fcard"><img src="/images/gul.jpg" /><div className="fcard-tag">Family</div><div className="fcard-copy"><h4>Gulmarg</h4><span className="mono">1–2 Days · High crowd</span></div></div>
      <div className="fcard"><img src="/images/gurez.png" /><div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Gurez Valley</h4><span className="mono">2 Days · Low crowd</span></div></div>
      <div className="fcard"><img src="/images/lolab.png" /><div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Lolab Valley</h4><span className="mono">1 Day · Low crowd</span></div></div>
      <div className="fcard fcard-lg"><img src="/images/aru.png" /><div className="fcard-tag">Adventure</div><div className="fcard-copy"><h4>Aru Valley</h4><span className="mono">1 Day · Moderate</span></div></div>
    </div>
  </div>
</section>

{/*  ============ SCENIC DRIVES ============  */}
<section id="drives" className="section drives-section section-ambient waypoint-target" data-wp="Scenic Drives">
  <div className="amb-bg"><img src="/images/river-valley.jpg" alt="" /><div className="amb-scrim"></div></div>

  <div className="container">
    <div className="drives-grid">
      <div className="drives-media reveal tilt-card">
        <img src="/images/mustard-fields.jpg" alt="Road through mustard fields" />
        <div className="road-svg">
          <svg viewBox="0 0 400 400" preserveAspectRatio="none"><path id="road-path" d="M40,400 C60,300 220,320 200,220 C180,120 320,140 340,20" stroke="var(--paper)" strokeWidth="2" strokeDasharray="6 10" fill="none" opacity="0.55"/></svg>
        </div>
      </div>
      <div className="drives-copy reveal">
        <p className="eyebrow">04 — Scenic Drives</p>
        <h2 className="serif section-title">Scenic drives,<br /><em>endless</em> stories.</h2>
        <p className="bleed-sub" style={{"color":"var(--paper-dim)"}}>Unforgettable road trips through winding valleys, mustard fields, and quiet mountain passes.</p>

        <div className="route-card">
          <p className="mono route-label">Featured Route</p>
          <h3 className="serif">The Great Kashmir Road Trip</h3>
          <div className="stat-row mono" style={{"marginTop":"14px"}}>
            <span>2 DAYS</span><span>·</span><span>MODERATE</span>
          </div>
          <a href="#" className="btn btn-primary" style={{"marginTop":"22px"}}>View route <span>→</span></a>
        </div>
      </div>
    </div>
  </div>
</section>

{/*  ============ FOOD TRAILS ============  */}
<section className="section food-section section-ambient waypoint-target" data-wp="Food Trails">
  <div className="amb-bg"><img src="/images/mtn-fog-deadtree.jpg" alt="" /><div className="amb-scrim"></div></div>

  <div className="container">
    <div className="section-head reveal">
      <p className="eyebrow">05 — Food Trails</p>
      <h2 className="serif section-title">A journey through<br />authentic <em>wazwan</em>.</h2>
    </div>
    <div className="food-grid reveal">
      <div className="food-card">
        <span className="food-icon mono">01</span>
        <h4 className="serif">Traditional Wazwan Trail</h4>
        <p>Seven courses, one copper platter, a tradition older than the city around it.</p>
        <div className="stat-row mono"><span>1–2 DAYS</span><span>·</span><span>EASY</span></div>
      </div>
      <div className="food-card">
        <span className="food-icon mono">02</span>
        <h4 className="serif">Kashmiri Bakeries & Chai Trail</h4>
        <p>Kandur ovens at dawn, noon chai, and the bakeries that never made it to a map.</p>
        <div className="stat-row mono"><span>3 HOURS</span><span>·</span><span>EASY</span></div>
      </div>
      <div className="food-card food-card-cta">
        <p className="serif food-cta-text">Hungry for<br />more trails?</p>
        <a href="#" className="btn btn-ghost" style={{"marginTop":"18px"}}>See all food trails <span>→</span></a>
      </div>
    </div>
  </div>
</section>

{/*  ============ NATURE ESCAPES ============  */}
<section id="nature" className="section section-ambient waypoint-target" data-wp="Nature">
  <div className="amb-bg"><img src="/images/cloudy-peaks.jpg" alt="" /><div className="amb-scrim" style={{"opacity":"0.55"}}></div></div>

  <div className="container">
    <div className="trek-grid">
      <div className="trek-copy reveal">
        <p className="eyebrow">06 — Trekking &amp; Camping</p>
        <h2 className="serif section-title">Sleep under deodar,<br />wake in <em>alpine</em> light.</h2>
        <p className="bleed-sub" style={{"color":"var(--paper-dim)"}}>Twelve routes through pine forest and open ridgeline, from easy overnight camps to multi-day treks above the treeline. Tents, guides, and permits — mapped out before you lace up.</p>
        <div className="trek-stats mono">
          <span className="trek-stat">12 curated treks</span>
          <span className="trek-stat">3–8 day routes</span>
          <span className="trek-stat">2,400–4,200m altitude</span>
        </div>
        <a href="#" className="btn btn-primary">Explore Treks &amp; Camps <span>→</span></a>
      </div>

      <div className="route-card trek-elevation reveal tilt-card">
        <p className="mono route-label">Sample Trek Profile</p>
        <h3 className="serif">Ridge to Summit Route</h3>
        <svg className="elevation-chart" viewBox="0 0 520 280" xmlns="http://www.w3.org/2000/svg">
          <line className="ec-grid" x1="20" y1="220" x2="500" y2="220"/>
          <line className="ec-grid" x1="20" y1="130" x2="500" y2="130"/>
          <line className="ec-grid" x1="20" y1="40" x2="500" y2="40"/>
          <path className="ec-area" d="M40,220 L190,150 L340,95 L480,40 L480,220 L40,220 Z"/>
          <path className="ec-line" d="M40,220 L190,150 L340,95 L480,40"/>
          <circle className="ec-ring" cx="40" cy="220" r="10"/>
          <circle className="ec-dot" cx="40" cy="220" r="5"/>
          <text className="ec-elev" x="40" y="244" textAnchor="middle">2,400m</text>
          <circle className="ec-ring" cx="190" cy="150" r="10"/>
          <circle className="ec-dot" cx="190" cy="150" r="5"/>
          <text className="ec-elev" x="190" y="128" textAnchor="middle">3,100m</text>
          <circle className="ec-ring" cx="340" cy="95" r="10"/>
          <circle className="ec-dot" cx="340" cy="95" r="5"/>
          <text className="ec-elev" x="340" y="73" textAnchor="middle">3,650m</text>
          <circle className="ec-ring" cx="480" cy="40" r="10"/>
          <circle className="ec-dot" cx="480" cy="40" r="5"/>
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

{/*  ============ SEASON SWITCH ============  */}
<section id="season" className="section-bleed season-section waypoint-target" data-wp="Seasons">
  <img src="/images/snow-bridge.jpg" alt="" className="bleed-img season-bg" data-season="winter" data-parallax="0.12" />
  <img src="/images/mustard-fields.jpg" alt="" className="bleed-img season-bg" data-season="summer" data-parallax="0.12" style={{"opacity":"0"}} />
  <div className="bleed-scrim"></div>

  <div className="container bleed-content">
    <div className="section-head-row reveal">
      <div>
        <p className="eyebrow" style={{"color":"var(--paper)"}}>07 — Best By Season</p>
        <h2 className="serif section-title" id="season-title">Destinations that come<br />alive in <em>winter</em>.</h2>
      </div>
      <div className="season-toggle">
        <button className="season-btn active" data-season="winter">❄ Winter</button>
        <button className="season-btn" data-season="summer">☀ Summer</button>
      </div>
    </div>

    <div className="season-cards reveal" id="season-cards">
      {/*  populated by JS  */}
    </div>
  </div>
</section>

{/*  ============ WAZA AI TRIP PLANNER ============  */}
<section id="waza" className="section waza-section section-ambient waypoint-target" data-wp="Waza AI">
  <div className="amb-bg"><img src="/images/blue-valley.jpg" alt="" /><div className="amb-scrim"></div></div>
  <div className="topo-pattern"></div>
  <div className="container">
    <div className="waza-grid">
      <div className="waza-copy reveal">
        <span className="status-pill mono"><span className="dot"></span> In active development</span>
        <h2 className="serif section-title" style={{"marginTop":"20px"}}>Tell Waza where<br />you want to <em>feel</em> something.</h2>
        <p className="bleed-sub" style={{"color":"var(--paper-dim)"}}>No forms, no filters. Describe your people, your budget, your mood — Waza drafts a real Kashmir itinerary in seconds, like having a local expert in your pocket.</p>
        <div className="waza-features mono">
          <div><span>01</span> Reads mood, not just dates</div>
          <div><span>02</span> Balances budget across stays, food & travel</div>
          <div><span>03</span> Routes around crowds automatically</div>
        </div>
        <a href="#" className="btn btn-primary" style={{"marginTop":"32px"}}>Join the waitlist</a>
      </div>

      <div className="waza-demo reveal">
        <div className="waza-window">
          <div className="waza-window-head">
            <span className="wdot" style={{"background":"#e0a15e"}}></span>
            <span className="wdot" style={{"background":"#a8543a"}}></span>
            <span className="wdot" style={{"background":"#4a5d46"}}></span>
            <span className="mono waza-window-title">waza-ai · planning</span>
          </div>
          <div className="waza-window-body">
            <div className="waza-msg user">
              <p>"We're five friends. Our budget is ₹3000 pp. We want hidden alpine lakes and real wazwan."</p>
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

{/*  ============ MY ITINERARIES CTA ============  */}
<section className="section itin-section section-ambient waypoint-target" data-wp="Itineraries">
  <div className="amb-bg"><img src="/images/red-jacket-hiker.jpg" alt="" /><div className="amb-scrim"></div></div>

  <div className="container">
    <div className="itin-card reveal">
      <div className="itin-marker">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21z" stroke="currentColor" strokeWidth="1.4"/><circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.4"/></svg>
      </div>
      <h2 className="serif section-title" style={{"marginBottom":"14px"}}>Your route through<br />Kashmir, saved.</h2>
      <p className="bleed-sub" style={{"color":"var(--paper-dim)","margin":"0 auto 32px"}}>Save destinations, scenic drives, and curated collections as you go — we'll trace the trail for you.</p>
      <a href="#" className="btn btn-primary">View saved items <span>→</span></a>
    </div>
  </div>
</section>

{/*  ============ FOOTER ============  */}
<footer className="site-footer section-ambient">
  <div className="amb-bg"><img src="/images/hillside-village.jpg" alt="" /><div className="amb-scrim"></div></div>

  <div className="container relative z-10 pt-20 pb-10 text-center">
    <div className="mb-8">
      <a href="/" className="font-display text-[2.5rem] font-semibold uppercase leading-[0.9] tracking-[0.15em] text-[#F5F5F0]">
        <span className="block" style={{fontFamily: 'Fraunces', letterSpacing: '0.15em'}}>Wazwan</span>
        <span className="block text-[#C8A46A]" style={{fontFamily: 'Fraunces', letterSpacing: '0.15em'}}>Way</span>
      </a>
    </div>
    <p className="mx-auto max-w-md font-display text-xl font-light italic text-[#F5F5F0]/70" style={{fontFamily: 'Fraunces'}}>
      The definitive guide to Kashmir's greatest culinary heritage.
    </p>
    <div className="mt-16 mb-16 flex flex-wrap justify-center gap-x-8 gap-y-6 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-[#F5F5F0]/80 max-w-4xl mx-auto leading-loose" style={{fontFamily: 'Inter'}}>
      <a href="/how-to-experience" className="transition-colors duration-300 hover:text-[#C8A46A]">Experience</a>
      <a href="/kashmiri-food" className="transition-colors duration-300 hover:text-[#C8A46A]">Kashmiri Food</a>
      <a href="/dishes" className="transition-colors duration-300 hover:text-[#C8A46A]">Dishes</a>
      <a href="/restaurants" className="transition-colors duration-300 hover:text-[#C8A46A]">Restaurants</a>
      <a href="/recipes" className="transition-colors duration-300 hover:text-[#C8A46A]">Recipes</a>
      <a href="/plan" className="transition-colors duration-300 hover:text-[#C8A46A]">Visit Kashmir</a>
      <a href="/blog" className="transition-colors duration-300 hover:text-[#C8A46A]">Blog</a>
      <a href="/about" className="transition-colors duration-300 hover:text-[#C8A46A]">About</a>
      <a href="/contact" className="transition-colors duration-300 hover:text-[#C8A46A]">Contact</a>
      <a href="/privacy" className="transition-colors duration-300 hover:text-[#C8A46A]">Privacy Policy</a>
      <a href="/login" className="transition-colors duration-300 hover:text-[#C8A46A]">Login</a>
    </div>
    <div className="border-t border-[#F5F5F0]/10 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row text-[0.7rem] uppercase tracking-widest text-[#F5F5F0]/70" style={{fontFamily: 'Inter'}}>
      <p>© 2026 Wazwan Way. All rights reserved.</p>
      <div className="flex gap-4">
        <a href="https://www.facebook.com/profile.php?id=61590712421415" target="_blank" rel="noreferrer" className="transition-colors duration-300 hover:text-[#C8A46A]">Facebook</a>
        <a href="https://x.com/wazwanway" target="_blank" rel="noreferrer" className="transition-colors duration-300 hover:text-[#C8A46A]">X</a>
      </div>
      <p>Designed for the culture.</p>
    </div>
  </div>
</footer>


</div>
  );
}
