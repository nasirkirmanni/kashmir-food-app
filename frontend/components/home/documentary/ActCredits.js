"use client";

import { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ACT_CREDITS } from "@/data/homeChapters";
import { Frame, TextLink, useAct } from "./film";
import s from "./film.module.css";

/**
 * Act V — The credits.
 * The film ends the way films do: the credits roll. The cast is the vocabulary of the feast (the
 * head cook, the cooks, the kitchen, the pots, the platter and its cover, the basin and ewer, the
 * cloth, the first and last courses, the name itself), then the research the film rests on, then
 * where to go next.
 */

const ID = "act-credits-title";

function askWaza() {
  window.dispatchEvent(new Event("open-waza-ai-intro"));
}

function CreditsContent() {
  const { cast, sourcesNote, sources, beyond, next } = ACT_CREDITS;
  return (
    <>
      <p className={s.actLabel}>Act V — The credits</p>
      <h2 id={ID} className={s.creditsTitle}>
        Wazwan
      </h2>
      <p className={s.creditsSub}>From the fire to the trami</p>

      <h3 className={s.creditsHeading}>Featuring</h3>
      <ul className={s.cast}>
        {cast.map((credit) => (
          <li key={credit.name} className={s.castRow}>
            <span className={s.castRole}>{credit.role}</span>
            <span className={s.castName}>
              {credit.href ? (
                <TextLink href={credit.href} className={s.castNameText}>
                  {credit.name}
                </TextLink>
              ) : (
                <span className={s.castNameText}>{credit.name}</span>
              )}
              <span className={s.castNote} style={{ display: "block" }}>
                {credit.note}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <h3 className={s.creditsHeading}>Research</h3>
      <p className={s.sourcesNote}>{sourcesNote}</p>
      <ul className={s.sources}>
        {sources.map((source) => (
          <li key={source}>{source}</li>
        ))}
      </ul>

      <h3 className={s.creditsHeading}>Beyond the feast</h3>
      <ul className={s.beyond}>
        {beyond.map((item) => (
          <li key={item.name}>
            <TextLink href={item.href} className={s.castNameText}>
              {item.name}
            </TextLink>
            <span className={s.castNote} style={{ display: "block" }}>
              {item.note}
            </span>
          </li>
        ))}
      </ul>

      <h3 className={s.creditsHeading}>Continue</h3>
      <ul className={s.next}>
        {next.map((link) => (
          <li key={link.href}>
            <TextLink href={link.href}>{link.label}</TextLink>
          </li>
        ))}
      </ul>
      <button type="button" className={s.askWaza} onClick={askWaza}>
        <MessageCircle size={17} aria-hidden="true" />
        Ask Waza about the feast
      </button>
      <p className={s.fin} aria-hidden="true">
        Fin.
      </p>
    </>
  );
}

export default function ActCredits() {
  const { wrapperRef, stageRef, progress, scene } = useAct();
  const rollRef = useRef(null);
  const rollHeight = useMotionValue(2400);
  const viewport = useMotionValue(900);

  useEffect(() => {
    const roll = rollRef.current;
    if (!scene || !roll) return undefined;
    const measure = () => {
      rollHeight.set(roll.offsetHeight);
      viewport.set(window.innerHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(roll);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [scene, rollHeight, viewport]);

  // The roll starts just below the frame and ends with its last lines above the bottom bar.
  const y = useTransform([progress, rollHeight, viewport], ([p, height, vh]) => {
    const t = Math.min(1, Math.max(0, (p - 0.02) / 0.9));
    const start = vh * 0.9;
    const end = vh * 0.86 - height;
    return start + (end - start) * t;
  });

  return (
    <section aria-labelledby={ID} className={`${s.act} hidden md:block`}>
      {scene ? (
        <div ref={wrapperRef} className={s.wrapper} style={{ height: "320vh" }}>
          <div ref={stageRef} className={s.stage}>
            {/* Centred by the outer box; the inner one only moves, so the two transforms don't collide. */}
            <div className={s.roll}>
              <motion.div ref={rollRef} style={{ y }}>
                <CreditsContent />
              </motion.div>
            </div>
            <Frame progress={progress} act="V" title="The credits" start={560} />
          </div>
        </div>
      ) : (
        <div className={s.still} style={{ textAlign: "center" }}>
          <div className="page-shell">
            <div style={{ maxWidth: "60rem", margin: "0 auto" }}>
              <CreditsContent />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
