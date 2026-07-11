"use client";
import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

const OPT = '/images/optimized/explore';

export default function PhotographySection() {
  const stripRef = useRef(null);

  useEffect(() => {
    if (!stripRef.current) return;
    const btns = stripRef.current.parentElement.querySelectorAll('.fs-btn[data-strip="photo"]');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const track = stripRef.current.querySelector('.filmstrip-track');
        if (track) track.scrollBy({ left: 340 * parseInt(btn.dataset.dir), behavior: 'smooth' });
      });
    });
  }, []);

  return (
    <section id="photography" className="section section-ambient waypoint-target" data-wp="Photography" style={{ paddingTop: '110px' }}>
      <div className="amb-bg">
        <Image src={`${OPT}/dal-shikara-sunset.avif`} alt="" fill sizes="100vw" quality={60} loading="lazy" style={{ objectFit: 'cover' }} />
        <div className="amb-scrim"></div>
      </div>

      <div className="container">
        <div className="section-head-row reveal">
          <div>
            <p className="eyebrow">03 — Photography Spots</p>
            <h2 className="serif section-title" style={{ marginBottom: '0' }}>The most majestic<br />light for your lens.</h2>
          </div>
          <div className="filmstrip-nav" style={{ padding: '0' }}>
            <button className="fs-btn" data-strip="photo" data-dir="-1" aria-label="Scroll photography spots left">←</button>
            <button className="fs-btn" data-strip="photo" data-dir="1" aria-label="Scroll photography spots right">→</button>
          </div>
        </div>
      </div>

      <div className="filmstrip reveal" id="photo-strip" ref={stripRef} style={{ marginTop: '56px' }}>
        <div className="filmstrip-track">
          <div className="fcard fcard-lg" style={{ position: 'relative', aspectRatio: '3/4' }}>
            <Image src={`${OPT}/srinagar.avif`} alt="Srinagar cityscape and Dal Lake" fill sizes="(max-width:900px) 280px, 400px" quality={68} loading="lazy" style={{ objectFit: 'cover' }} />
            <div className="fcard-tag">Family</div><div className="fcard-copy"><h4>Srinagar</h4><span className="mono">2–3 Days · High crowd</span></div>
          </div>
          <div className="fcard" style={{ position: 'relative', aspectRatio: '3/4' }}>
            <Image src={`${OPT}/gul.avif`} alt="Gulmarg snowcapped mountains" fill sizes="(max-width:900px) 240px, 300px" quality={68} loading="lazy" style={{ objectFit: 'cover' }} />
            <div className="fcard-tag">Family</div><div className="fcard-copy"><h4>Gulmarg</h4><span className="mono">1–2 Days · High crowd</span></div>
          </div>
          <div className="fcard" style={{ position: 'relative', aspectRatio: '3/4' }}>
            <Image src={`${OPT}/gurez.avif`} alt="Gurez Valley mountain landscape" fill sizes="(max-width:900px) 240px, 300px" quality={68} loading="lazy" style={{ objectFit: 'cover' }} />
            <div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Gurez Valley</h4><span className="mono">2 Days · Low crowd</span></div>
          </div>
          <div className="fcard" style={{ position: 'relative', aspectRatio: '3/4' }}>
            <Image src={`${OPT}/lolab.avif`} alt="Lolab Valley pine forest" fill sizes="(max-width:900px) 240px, 300px" quality={68} loading="lazy" style={{ objectFit: 'cover' }} />
            <div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Lolab Valley</h4><span className="mono">1 Day · Low crowd</span></div>
          </div>
          <div className="fcard fcard-lg" style={{ position: 'relative', aspectRatio: '3/4' }}>
            <Image src={`${OPT}/aru.avif`} alt="Aru Valley hiking trail" fill sizes="(max-width:900px) 280px, 400px" quality={68} loading="lazy" style={{ objectFit: 'cover' }} />
            <div className="fcard-tag">Adventure</div><div className="fcard-copy"><h4>Aru Valley</h4><span className="mono">1 Day · Moderate</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
