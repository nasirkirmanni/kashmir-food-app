"use client";
import React from 'react';
import Image from 'next/image';

const OPT = '/images/optimized/explore';

export default function FoodTrailsSection() {
  return (
    <section id="food" className="section food-section section-ambient waypoint-target" data-wp="Food Trails">
      <div className="amb-bg">
        <Image src={`${OPT}/mtn-fog-deadtree.avif`} alt="" fill sizes="100vw" quality={60} loading="lazy" style={{ objectFit: 'cover' }} />
        <div className="amb-scrim"></div>
      </div>

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
            <h4 className="serif">Kashmiri Bakeries &amp; Chai Trail</h4>
            <p>Kandur ovens at dawn, noon chai, and the bakeries that never made it to a map.</p>
            <div className="stat-row mono"><span>3 HOURS</span><span>·</span><span>EASY</span></div>
          </div>
          <div className="food-card food-card-cta">
            <p className="serif food-cta-text">Hungry for<br />more trails?</p>
            <a href="#" className="btn btn-ghost" style={{ marginTop: '18px' }}>See all food trails <span>→</span></a>
          </div>
        </div>
      </div>
    </section>
  );
}
