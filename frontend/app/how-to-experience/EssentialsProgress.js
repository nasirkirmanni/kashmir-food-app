"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./HowToExperience.module.css";

/**
 * Where the reader is among the six essentials: a numbered rail in the left margin on wide
 * screens, a gold hairline under the top of the screen on narrower ones. Both show only while the
 * essentials are on screen.
 */
export default function EssentialsProgress({ sectionId, steps }) {
  const [state, setState] = useState({ visible: false, active: -1 });
  const lineRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const section = document.getElementById(sectionId);
    if (!section) return undefined;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const middle = window.innerHeight / 2;
      const box = section.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (middle - box.top) / box.height));
      let active = -1;
      steps.forEach(({ id }, index) => {
        const step = document.getElementById(id);
        if (step && step.getBoundingClientRect().top <= middle) active = index;
      });
      const visible = box.top < middle && box.bottom > middle;
      if (lineRef.current) lineRef.current.style.transform = `scaleX(${progress})`;
      if (trackRef.current) trackRef.current.style.transform = `scaleY(${progress})`;
      setState((prev) => (prev.visible === visible && prev.active === active ? prev : { visible, active }));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [sectionId, steps]);

  const shown = state.visible ? "" : undefined;
  return (
    <>
      <div className={styles.progressLine} data-visible={shown} aria-hidden="true">
        <span ref={lineRef} />
      </div>
      <nav className={styles.rail} data-visible={shown} aria-label="The six essentials">
        <span className={styles.railTrack} aria-hidden="true">
          <span ref={trackRef} />
        </span>
        <ol>
          {steps.map((step, index) => (
            <li key={step.id}>
              <a href={`#${step.id}`} aria-current={index === state.active ? "step" : undefined} title={step.title}>
                <span className={styles.srOnly}>{`${index + 1}. ${step.title}`}</span>
                <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
