"use client";

import React from "react";

export default function CloseSection() {
  const handleClick = (e) => {
    e.preventDefault();
    const hero = document.getElementById("tc-hero");
    if (hero) hero.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="tc-close">
      <div className="tc-close-bg">
        <picture>
          <source
            media="(max-width: 768px)"
            srcSet="/images/trekking-camping/pexels-amit-chowdhury-2402860-18318114.jpg"
          />
          <img
            src="/images/trekking-camping/pexels-abtrvl-9144239.jpg"
            alt="Kashmir mountain panorama"
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>
      <div className="tc-close-body">
        <p className="mono">10 destinations &middot; one wilderness</p>
        <h2 className="serif">
          The altitude is real.
          <br />
          So is the silence.
        </h2>
        <button className="tc-cta" onClick={handleClick}>
          BEGIN THE ASCENT &rarr;
        </button>
      </div>
    </section>
  );
}
