"use client";

import { useEffect, useRef, useState } from "react";
import { WAZA_SAMPLES } from "@/data/howToExperience";
import styles from "./HowToExperience.module.css";

const lengthOf = (segments) => segments.reduce((total, segment) => total + segment.text.length, 0);

function typed(segments, count) {
  let used = 0;
  return segments.map((segment, index) => {
    if (used >= count) return null;
    const text = segment.text.slice(0, count - used);
    used += segment.text.length;
    return segment.em ? <em key={index}>{text}</em> : <span key={index}>{text}</span>;
  });
}

/**
 * Waza's sample exchanges, typed out one after another while the panel is on screen (whole, with
 * reduced motion). It only illustrates: the section's own copy and button say what Waza does.
 */
export default function WazaDemo() {
  const first = WAZA_SAMPLES[0].items[0];
  const [shown, setShown] = useState({ cat: 0, item: 0, question: first.q, chars: lengthOf(first.a) });
  const panelRef = useRef(null);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return undefined;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let run = 0; // each start gets its own number, so a stopped loop can never resume alongside a new one
    let timer = 0;
    let wake = null;
    let cat = 0;
    let item = 0;
    const sleep = (ms) =>
      new Promise((resolve) => {
        wake = resolve;
        timer = window.setTimeout(resolve, ms);
      });

    const loop = async (id) => {
      while (id === run) {
        const sample = WAZA_SAMPLES[cat].items[item];
        const total = lengthOf(sample.a);
        setShown({ cat, item, question: sample.q, chars: 0 });
        await sleep(700);
        if (id !== run) return;
        if (reduce) {
          setShown((prev) => ({ ...prev, chars: total }));
        } else {
          for (let count = 1; count <= total && id === run; count += 1) {
            setShown((prev) => ({ ...prev, chars: count }));
            await sleep(14 + Math.random() * 22);
          }
        }
        await sleep(2800);
        if (id !== run) return;
        item += 1;
        if (item >= WAZA_SAMPLES[cat].items.length) {
          item = 0;
          cat = (cat + 1) % WAZA_SAMPLES.length;
        }
      }
    };

    const stop = () => {
      run += 1;
      window.clearTimeout(timer);
      wake?.();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        stop();
        if (entry.isIntersecting) loop(run);
      },
      { threshold: 0.2 },
    );
    observer.observe(panel);
    return () => {
      stop();
      observer.disconnect();
    };
  }, []);

  const category = WAZA_SAMPLES[shown.cat];
  const answer = category.items[shown.item].a;
  return (
    <div className={styles.demo} ref={panelRef} aria-hidden="true">
      <div className={styles.demoHead}>
        <span className={styles.demoMark}>W</span>
        <span className={styles.demoName}>Waza</span>
        <span className={styles.demoTopic}>
          {category.name.toLowerCase()} · {shown.item + 1} / {category.items.length}
        </span>
      </div>
      <div className={styles.demoBody}>
        <p className={styles.ask}>{shown.question}</p>
        {shown.chars > 0 ? (
          <p className={styles.reply}>
            {typed(answer, shown.chars)}
            {shown.chars < lengthOf(answer) ? <span className={styles.caret} /> : null}
          </p>
        ) : (
          <p className={styles.thinking}>
            <span />
            <span />
            <span />
          </p>
        )}
      </div>
    </div>
  );
}
