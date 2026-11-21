"use client";

import { useEffect, useRef, useState } from "react";
import { InlineBackButton } from "@/components/BackButton";
import styles from "./restaurants.module.css";

/**
 * "On this page" for a restaurant's profile: the sections, with the one on screen marked. On phones
 * it is a bar that pins to the top and carries Back while pinned (components/BackButton.js); on wide
 * screens it stands in the side column. The links are plain anchors, so they work without JavaScript.
 */
export default function ProfileContents({ items }) {
  const [current, setCurrent] = useState(items[0]?.id || null);
  const listRef = useRef(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const sections = items.map((item) => document.getElementById(item.id)).filter(Boolean);
    const inView = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inView.add(entry.target.id);
          else inView.delete(entry.target.id);
        }
        const first = sections.find((section) => inView.has(section.id));
        if (first) setCurrent(first.id);
      },
      { rootMargin: "-25% 0px -60% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  // Keep the marked link in view when the bar scrolls sideways (phones); never moves the page.
  useEffect(() => {
    const list = listRef.current;
    if (!list || list.scrollWidth <= list.clientWidth) return;
    const link = list.querySelector('[aria-current="true"]');
    if (!link) return;
    const within = link.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft;
    const target = within - (list.clientWidth - link.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, target), behavior: "auto" });
  }, [current]);

  return (
    <nav className={styles.contents} aria-label="On this page" data-back-bar="">
      <div className={`${styles.container} ${styles.contentsRow}`}>
        <InlineBackButton className={styles.back} />
        <ul className={styles.contentsList} ref={listRef} data-h-scroll="">
          {items.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className={styles.contentsLink} aria-current={current === item.id ? "true" : undefined}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
