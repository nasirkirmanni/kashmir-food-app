"use client";
import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

const OPT = '/images/optimized/explore';

export default function HiddenGemsSection() {
  const stripRef = useRef(null);

  useEffect(() => {
    if (!stripRef.current) return;
    const btns = stripRef.current.querySelectorAll('.fs-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const track = stripRef.current.querySelector('.filmstrip-track');
        if (track) track.scrollBy({ left: 340 * parseInt(btn.dataset.dir), behavior: 'smooth' });
      });
    });
  }, []);

  return (
    <section id="gems" className="section-bleed waypoint-target" data-wp="Hidden Gems">
      <Image
        src={`${OPT}/misty-village.avif`}
        alt=""
        fill
        sizes="100vw"
        quality={60}
        loading="lazy"
        className="bleed-img"
        style={{ objectFit: 'cover' }}
      />
      <div className="bleed-scrim"></div>
      <div className="container bleed-content">
        <div className="section-head reveal">
          <p className="eyebrow" style={{ color: 'var(--paper)' }}>02 — Hidden Gems</p>
          <h2 className="serif section-title">Untouched valleys,<br /><em>quietly</em> kept.</h2>
          <p className="bleed-sub">Destinations far from the tourist trail — the ones locals rarely mention out loud.</p>
        </div>
      </div>

      <div className="filmstrip reveal" id="gems-strip" ref={stripRef}>
        <div className="filmstrip-track">
          <div className="fcard fcard-lg" style={{ position: 'relative', aspectRatio: '3/4' }}>
            <Image src={`${OPT}/yusm.avif`} alt="Yusmarg meadow — a hidden gem in Kashmir" fill sizes="(max-width:900px) 280px, 400px" quality={68} loading="lazy" style={{ objectFit: 'cover' }} />
            <div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Yusmarg</h4><span className="mono">Half Day · Low crowd</span></div>
          </div>
          <div className="fcard" style={{ position: 'relative', aspectRatio: '3/4' }}>
            <Image src={`${OPT}/gurez.avif`} alt="Gurez Valley — remote valley in northern Kashmir" fill sizes="(max-width:900px) 240px, 300px" quality={68} loading="lazy" style={{ objectFit: 'cover' }} />
            <div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Gurez Valley</h4><span className="mono">2 Days · Low crowd</span></div>
          </div>
          <div className="fcard" style={{ position: 'relative', aspectRatio: '3/4' }}>
            <Image src={`${OPT}/lolab.avif`} alt="Lolab Valley — peaceful valley surrounded by pine forests" fill sizes="(max-width:900px) 240px, 300px" quality={68} loading="lazy" style={{ objectFit: 'cover' }} />
            <div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Lolab Valley</h4><span className="mono">1 Day · Low crowd</span></div>
          </div>
          <div className="fcard fcard-lg" style={{ position: 'relative', aspectRatio: '3/4' }}>
            <Image src={`${OPT}/doodhpathri.avif`} alt="Doodhpathri — lush green meadow with flowing streams" fill sizes="(max-width:900px) 280px, 400px" quality={68} loading="lazy" style={{ objectFit: 'cover' }} />
            <div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Doodhpathri</h4><span className="mono">1 Day · Moderate</span></div>
          </div>
          <div className="fcard" style={{ position: 'relative', aspectRatio: '3/4' }}>
            <Image src={`${OPT}/daksum.avif`} alt="Daksum — dense forest and mountain streams" fill sizes="(max-width:900px) 240px, 300px" quality={68} loading="lazy" style={{ objectFit: 'cover' }} />
            <div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Daksum</h4><span className="mono">2 Days · Low crowd</span></div>
          </div>
        </div>
        <div className="filmstrip-nav">
          <button className="fs-btn" data-dir="-1" aria-label="Scroll hidden gems left">←</button>
          <button className="fs-btn" data-dir="1" aria-label="Scroll hidden gems right">→</button>
        </div>
      </div>
    </section>
  );
}
