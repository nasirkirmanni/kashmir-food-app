"use client";
import React, { useEffect } from 'react';
import Image from 'next/image';

const OPT = '/images/optimized/explore';

export default function SeasonSwitchSection() {
  useEffect(() => {
    const seasonData = {
      winter: {
        title: 'Destinations that come<br />alive in <em>winter</em>.',
        cards: [
          { img: `${OPT}/snow-jump.avif`, tag: 'Family', name: 'Gulmarg', meta: '1–2 Days · High crowd' },
          { img: `${OPT}/doodhpathri.avif`, tag: 'Hidden Gem', name: 'Doodhpathri', meta: 'Half Day · Moderate' },
          { img: `${OPT}/gurez.avif`, tag: 'Adventure', name: 'Sonamarg', meta: '1 Day · Moderate' },
          { img: `${OPT}/srinagar.avif`, tag: 'Family', name: 'Srinagar', meta: '2–3 Days · High crowd' },
          { img: `${OPT}/daksum.avif`, tag: 'Hidden Gem', name: 'Kokernag', meta: 'Half Day · Moderate' },
        ]
      },
      summer: {
        title: 'Destinations that come<br />alive in <em>summer</em>.',
        cards: [
          { img: `${OPT}/aru.avif`, tag: 'Family', name: 'Pahalgam', meta: '1–2 Days · High crowd' },
          { img: `${OPT}/yusm.avif`, tag: 'Hidden Gem', name: 'Yusmarg', meta: 'Half Day · Low crowd' },
          { img: `${OPT}/lolab.avif`, tag: 'Adventure', name: 'Betaab Valley', meta: 'Half Day · High effort' },
          { img: `${OPT}/gurez.avif`, tag: 'Family', name: 'Kokernag', meta: 'Half Day · Moderate' },
          { img: `${OPT}/daksum.avif`, tag: 'Hidden Gem', name: 'Daksum', meta: '2 Days · Low crowd' },
        ]
      }
    };

    function renderSeason(season) {
      const data = seasonData[season];
      const titleEl = document.getElementById('season-title');
      if (titleEl) titleEl.innerHTML = data.title;
      const wrap = document.getElementById('season-cards');
      if (wrap) {
        wrap.innerHTML = data.cards.map(c => `
          <div class="fcard tilt-card" style="position:relative;aspect-ratio:3/4;">
            <img src="${c.img}" alt="${c.name} destination" loading="lazy" style="width:100%;height:100%;object-fit:cover;" />
            <div class="fcard-tag">${c.tag}</div>
            <div class="fcard-copy"><h4>${c.name}</h4><span class="mono">${c.meta}</span></div>
          </div>
        `).join('');
      }

      document.querySelectorAll('.season-bg').forEach(bg => {
        bg.style.opacity = bg.dataset.season === season ? '1' : '0';
      });
      document.querySelectorAll('.season-btn').forEach(b => b.classList.toggle('active', b.dataset.season === season));
    }

    renderSeason('winter');
    document.querySelectorAll('.season-btn').forEach(btn => {
      btn.addEventListener('click', () => renderSeason(btn.dataset.season));
    });
  }, []);

  return (
    <section id="season" className="section-bleed season-section waypoint-target" data-wp="Seasons">
      <Image
        src={`${OPT}/snow-bridge.avif`}
        alt=""
        fill
        sizes="100vw"
        quality={60}
        loading="lazy"
        className="bleed-img season-bg"
        data-season="winter"
        style={{ objectFit: 'cover' }}
      />
      <Image
        src={`${OPT}/mustard-fields.avif`}
        alt=""
        fill
        sizes="100vw"
        quality={60}
        loading="lazy"
        className="bleed-img season-bg"
        data-season="summer"
        style={{ objectFit: 'cover', opacity: 0 }}
      />
      <div className="bleed-scrim"></div>

      <div className="container bleed-content">
        <div className="section-head-row reveal">
          <div>
            <p className="eyebrow" style={{ color: 'var(--paper)' }}>07 — Best By Season</p>
            <h2 className="serif section-title" id="season-title">Destinations that come<br />alive in <em>winter</em>.</h2>
          </div>
          <div className="season-toggle">
            <button className="season-btn active" data-season="winter" aria-label="Show winter destinations">❄ Winter</button>
            <button className="season-btn" data-season="summer" aria-label="Show summer destinations">☀ Summer</button>
          </div>
        </div>

        <div className="season-cards reveal" id="season-cards">
          {/* populated by JS */}
        </div>
      </div>
    </section>
  );
}
