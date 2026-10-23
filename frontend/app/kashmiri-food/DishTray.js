"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { resolveContentPhoto } from "@/lib/contentImages";
import { dietOf } from "@/lib/dishTrays";
import { DISH_PHOTOS } from "@/lib/wazwanSequence";

// The Indian food-label marks: a dot in a square for vegetarian, a triangle for non-vegetarian.
function DietMark({ diet }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <rect x="0.75" y="0.75" width="10.5" height="10.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {diet === "veg" ? <circle cx="6" cy="6" r="2.5" fill="currentColor" /> : <path d="M6 3.1 8.9 8.5H3.1Z" fill="currentColor" />}
    </svg>
  );
}

function Chevron({ back }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={back ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function TrayCard({ dish, number }) {
  const photo = resolveContentPhoto(dish.image);
  const framing = photo ? DISH_PHOTOS[photo] : null;
  const diet = dietOf(dish);
  // Shown as stored: the dish-page text corrections (lib/dishContent.js) touch none of these, and
  // lib/dishTrays.test.js fails if one ever does.
  const description = dish.description?.trim();
  return (
    <article className="tray-card">
      <div className="tray-photo">
        {photo ? (
          <Image
            src={photo}
            alt={framing?.alt || dish.name}
            fill
            sizes="(max-width: 767px) 74vw, 240px"
            className={framing?.framed ? "framed" : undefined}
            style={framing?.focal ? { objectPosition: framing.focal } : undefined}
          />
        ) : null}
        <p className="tray-meta">
          <span className="tray-num">{String(number).padStart(2, "0")}</span>
          {diet ? (
            <span className={`tray-diet tray-diet-${diet}`}>
              <DietMark diet={diet} />
              {diet === "veg" ? "Veg" : "Non-veg"}
            </span>
          ) : null}
        </p>
      </div>
      <div className="tray-body">
        <h4 className="tray-name">
          <Link href={`/dishes/${dish.slug}`} className="tray-link">
            {dish.name}
          </Link>
        </h4>
        {description ? <p className="tray-desc">{description}</p> : null}
        <span className="tray-more" aria-hidden="true">
          View details <Arrow />
        </span>
      </div>
    </article>
  );
}

/**
 * A chapter's dishes set out in a tray under its photograph: a row of cards that scrolls sideways,
 * with arrows where there is more to see and a pointer to use them, and a swipe on phones.
 */
export default function DishTray({ id, title, sub, dishes, more }) {
  const railRef = useRef(null);
  const [edges, setEdges] = useState({ scrollable: false, atStart: true, atEnd: false });

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const max = rail.scrollWidth - rail.clientWidth;
      const next = { scrollable: max > 4, atStart: rail.scrollLeft <= 4, atEnd: rail.scrollLeft >= max - 4 };
      setEdges((prev) =>
        prev.scrollable === next.scrollable && prev.atStart === next.atStart && prev.atEnd === next.atEnd ? prev : next,
      );
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    rail.addEventListener("scroll", schedule, { passive: true });
    const resize = new ResizeObserver(schedule);
    resize.observe(rail);
    return () => {
      rail.removeEventListener("scroll", schedule);
      resize.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // One press moves on by the cards in view, so the next set lands where the first one was.
  const page = (direction) => {
    const rail = railRef.current;
    const card = rail?.querySelector(".tray-item");
    if (!card) return;
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    const inView = Math.max(1, Math.floor((rail.clientWidth + gap) / step));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollBy({ left: direction * inView * step, behavior: reduce ? "auto" : "smooth" });
  };

  const titleId = `${id}-tray-title`;
  const railId = `${id}-tray`;
  return (
    <div className="dish-tray reveal">
      <div className="tray-head">
        <h3 id={titleId} className="tray-title">
          {title}
        </h3>
        {sub ? <p className="tray-sub">{sub}</p> : null}
        {edges.scrollable ? (
          <div className="tray-arrows">
            <button
              type="button"
              className="tray-arrow"
              onClick={() => page(-1)}
              disabled={edges.atStart}
              aria-controls={railId}
              aria-label={`Previous: ${title}`}
            >
              <Chevron back />
            </button>
            <button
              type="button"
              className="tray-arrow"
              onClick={() => page(1)}
              disabled={edges.atEnd}
              aria-controls={railId}
              aria-label={`Next: ${title}`}
            >
              <Chevron />
            </button>
          </div>
        ) : null}
      </div>
      <ol id={railId} ref={railRef} className="tray-rail" aria-labelledby={titleId} data-h-scroll>
        {dishes.map((dish, index) => (
          <li key={dish._id || dish.slug} className="tray-item">
            <TrayCard dish={dish} number={index + 1} />
          </li>
        ))}
        {more ? (
          <li className="tray-item">
            <Link href={more.href} className="tray-card tray-more-card">
              <span className="tray-more-icon">
                <Arrow />
              </span>
              <span className="tray-more-title">{more.title}</span>
              <span className="tray-more-sub">{more.sub}</span>
            </Link>
          </li>
        ) : null}
      </ol>
    </div>
  );
}
