"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./wazwan.module.css";

/**
 * Sticky chapter navigation: highlights the chapter in view and shows reading
 * progress through the chapters as a hairline along its top edge.
 */
export default function ChapterNav({ items }) {
  const [active, setActive] = useState(null);
  const listRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    const sections = items.map((item) => document.getElementById(item.id)).filter(Boolean);
    if (!sections.length) return undefined;

    // A section is current while it crosses a narrow band just above mid-screen.
    const observer = new IntersectionObserver(
      (entries) => {
        const crossing = entries.filter((entry) => entry.isIntersecting);
        if (crossing.length) setActive(crossing[crossing.length - 1].target.id);
      },
      { rootMargin: "-38% 0px -58% 0px" }
    );
    sections.forEach((section) => observer.observe(section));

    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const first = sections[0].getBoundingClientRect();
      const last = sections[sections.length - 1].getBoundingClientRect();
      const start = window.scrollY + first.top - window.innerHeight * 0.5;
      const end = window.scrollY + last.bottom - window.innerHeight;
      const progress = end > start ? (window.scrollY - start) / (end - start) : 0;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
      }
      if (first.top > window.innerHeight * 0.62) setActive(null);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress);
    };
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [items]);

  // On narrow screens the list scrolls sideways; keep the current chapter in view.
  useEffect(() => {
    const list = listRef.current;
    if (!list || !active || list.scrollWidth <= list.clientWidth) return;
    const link = list.querySelector(`[data-chapter="${active}"]`);
    if (!link) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({
      left: link.offsetLeft - list.clientWidth / 2 + link.offsetWidth / 2,
      behavior: reduce ? "instant" : "smooth",
    });
  }, [active]);

  return (
    <nav aria-label="Chapters" className={styles.chapterNav}>
      <span ref={progressRef} className={styles.chapterNavProgress} aria-hidden="true" />
      <div className={`${styles.container} ${styles.chapterNavInner}`}>
        <a href="#top" className={styles.chapterNavTitle}>
          Traditional Wazwan
        </a>
        <ol ref={listRef} className={styles.chapterNavList}>
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                data-chapter={item.id}
                aria-current={active === item.id ? "location" : undefined}
                className={styles.chapterNavLink}
              >
                {item.number ? (
                  <span className={styles.navNumber} aria-hidden="true">
                    {item.number}
                  </span>
                ) : null}
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
