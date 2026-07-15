"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Sparkles } from "lucide-react";

/**
 * Chapter V — Choose your Kashmir.
 * Full-bleed four-panel doorway row (reference: /redesign/ck.png). Panels sit
 * edge to edge with hairline gold dividers; each rests quiet — photography
 * under a themed wash, a gold index and a vertical spine title at the
 * bottom-left. Hover spotlights one door: siblings dim, the image swells,
 * the spine unfolds into a horizontal title + one-line description, and a
 * gold rule draws in under the index. Ask Waza (04) is the concierge, not a
 * destination — its index carries a sparkle mark and a faint pulsing glow.
 * All interaction is CSS (transform/opacity only); reduced-motion collapses
 * every transition to instant states.
 */

const DOORS = [
  {
    key: "feast",
    num: "01",
    title: "The Feast",
    line: "Copper trami, saffron smoke, thirty-six courses deep.",
    image: "/redesign/img/door-feast.webp",
    wash: "linear-gradient(180deg, rgba(56,30,10,0.32) 0%, rgba(8,7,6,0.5) 100%)",
    href: "/kashmiri-food",
  },
  {
    key: "wild",
    num: "02",
    title: "The Wild",
    line: "Glacier lakes, pine ridges, silence above the tree line.",
    image: "/redesign/img/door-wild.webp",
    wash: "linear-gradient(180deg, rgba(12,30,22,0.34) 0%, rgba(8,7,6,0.5) 100%)",
    href: "/explore",
  },
  {
    key: "culture",
    num: "03",
    title: "The Culture",
    line: "Mughal gardens, papier-mâché, verses older than the chinars.",
    image: "/redesign/img/door-culture.webp",
    wash: "linear-gradient(180deg, rgba(24,20,16,0.32) 0%, rgba(8,7,6,0.5) 100%)",
    href: "/how-to-experience",
  },
  {
    key: "waza",
    num: "04",
    title: "Ask Waza",
    line: "A concierge that has eaten everywhere and slept nowhere.",
    image: "/redesign/img/night-dal.webp",
    wash: "linear-gradient(180deg, rgba(12,11,16,0.38) 0%, rgba(8,7,6,0.55) 100%)",
    href: null, // opens the live AI
    concierge: true,
  },
];

/* Legibility grade layered over every wash so bottom-left copy stays readable. */
const LEGIBILITY = "linear-gradient(to top, rgba(8,7,6,0.82) 0%, rgba(8,7,6,0.2) 38%, rgba(8,7,6,0) 62%)";

const CSS = `
.ck-section {
  --ck-bg: #080706;
  --ck-gold: #c9a35f;
  --ck-ivory: #f3ede2;
  --ck-hairline: rgba(201, 163, 95, 0.16);
  --ck-ease: cubic-bezier(0.22, 1, 0.36, 1);
  background: var(--ck-bg);
}
.ck-header {
  text-align: center;
  padding: 100px 24px 56px;
}
.ck-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  font-family: var(--font-jetbrains-mono, monospace);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ck-gold);
}
.ck-eyebrow::before {
  content: "";
  width: 44px;
  height: 1px;
  background: var(--ck-gold);
  opacity: 0.75;
}
.ck-h {
  margin: 24px auto 0;
  font-family: var(--font-bodoni, "Playfair Display", serif);
  font-size: clamp(2.6rem, 4vw, 3.25rem);
  font-weight: 600;
  line-height: 1.06;
  letter-spacing: -0.01em;
  color: var(--ck-ivory);
}
.ck-h em {
  font-style: italic;
  color: var(--ck-gold);
}
.ck-sub {
  margin: 20px auto 0;
  max-width: 520px;
  font-size: 16px;
  line-height: 1.7;
  color: rgba(243, 237, 226, 0.6);
}
.ck-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  width: 100%;
}
.ck-panel {
  position: relative;
  display: block;
  height: clamp(620px, 82vh, 700px);
  padding: 0;
  border: 0;
  overflow: hidden;
  text-align: left;
  cursor: pointer;
  background: var(--ck-bg);
  transition: opacity 500ms ease;
}
.ck-panel + .ck-panel {
  border-left: 1px solid var(--ck-hairline);
}
.ck-panel:focus-visible {
  outline: 2px solid var(--ck-gold);
  outline-offset: -2px;
}
.ck-imgwrap {
  position: absolute;
  inset: 0;
  transition: transform 800ms var(--ck-ease);
  will-change: transform;
}
.ck-panel:hover .ck-imgwrap,
.ck-panel:focus-visible .ck-imgwrap {
  transform: scale(1.05);
}
.ck-wash {
  position: absolute;
  inset: 0;
}
/* Resting label — index above a vertical spine title, bottom-left */
.ck-label {
  position: absolute;
  left: 30px;
  bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  transition: opacity 400ms ease, transform 500ms var(--ck-ease);
}
.ck-vert {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  font-family: var(--font-bodoni, "Playfair Display", serif);
  font-size: 28px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.01em;
  color: var(--ck-ivory);
}
.ck-num {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--font-jetbrains-mono, monospace);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.18em;
  color: var(--ck-gold);
}
.ck-num-glow {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 58px;
  height: 58px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 163, 95, 0.4), transparent 70%);
  animation: ck-pulse 4s ease-in-out infinite;
  pointer-events: none;
}
@keyframes ck-pulse {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.8; }
}
/* Hover reveal — the spine unfolds into a horizontal title + line */
.ck-reveal {
  position: absolute;
  left: 30px;
  right: 30px;
  bottom: 30px;
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 450ms ease, transform 550ms var(--ck-ease);
}
.ck-rnum {
  padding-bottom: 7px;
}
.ck-rnum::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: var(--ck-gold);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 600ms var(--ck-ease) 150ms;
}
.ck-rtitle {
  margin-top: 14px;
  font-family: var(--font-bodoni, "Playfair Display", serif);
  font-size: 28px;
  font-weight: 500;
  line-height: 1.15;
  color: var(--ck-ivory);
}
.ck-rline {
  margin-top: 10px;
  max-width: 30ch;
  font-size: 14px;
  line-height: 1.7;
  color: rgba(243, 237, 226, 0.72);
}
.ck-panel:hover .ck-label,
.ck-panel:focus-visible .ck-label {
  opacity: 0;
  transform: translateY(-10px);
}
.ck-panel:hover .ck-reveal,
.ck-panel:focus-visible .ck-reveal {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 60ms;
}
.ck-panel:hover .ck-rnum::after,
.ck-panel:focus-visible .ck-rnum::after {
  transform: scaleX(1);
}
/* Spotlight — siblings dim while one door is open */
.ck-row:hover .ck-panel:not(:hover) {
  opacity: 0.7;
}
.ck-row:has(.ck-panel:focus-visible) .ck-panel:not(:focus-visible) {
  opacity: 0.7;
}
/* Stacked layout below the 4-across breakpoint */
@media (max-width: 1023px) {
  .ck-row { grid-template-columns: 1fr; }
  .ck-panel { height: 50vh; min-height: 380px; }
  .ck-panel + .ck-panel {
    border-left: 0;
    border-top: 1px solid var(--ck-hairline);
  }
  .ck-label { display: none; }
  .ck-reveal { opacity: 1; transform: none; }
  .ck-rnum::after { transform: scaleX(1); }
}
@media (prefers-reduced-motion: reduce) {
  .ck-panel, .ck-imgwrap, .ck-label, .ck-reveal, .ck-rnum::after { transition: none; }
  .ck-panel:hover .ck-imgwrap, .ck-panel:focus-visible .ck-imgwrap { transform: none; }
  .ck-num-glow { animation: none; opacity: 0.5; }
}
`;

function DoorNumber({ door, withRule }) {
  return (
    <span className={`ck-num${withRule ? " ck-rnum" : ""}`}>
      {door.concierge && <span className="ck-num-glow" aria-hidden="true" />}
      {door.concierge && <Sparkles size={11} strokeWidth={1.75} aria-hidden="true" />}
      {door.num}
    </span>
  );
}

export default function ChooseKashmir() {
  const router = useRouter();

  const open = (door) => {
    if (door.href) router.push(door.href);
    else if (typeof window !== "undefined") window.dispatchEvent(new Event("open-waza-ai-intro"));
  };

  return (
    <section aria-label="Choose your Kashmir" className="ck-section relative hidden md:block">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="ck-header">
        <span className="ck-eyebrow">Where to begin</span>
        <h2 className="ck-h">
          Choose your <em>Kashmir</em>.
        </h2>
        <p className="ck-sub font-body">
          Four doors into the same valley. Open the one that matches how you want to spend your time here.
        </p>
      </div>

      <div className="ck-row">
        {DOORS.map((door) => (
          <button
            key={door.key}
            type="button"
            className="ck-panel"
            onClick={() => open(door)}
            aria-label={`${door.title} — ${door.line}`}
          >
            <div className="ck-imgwrap">
              <Image
                src={door.image}
                alt=""
                fill
                sizes="(max-width: 1023px) 100vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="ck-wash" style={{ background: `${LEGIBILITY}, ${door.wash}` }} />

            {/* Resting: quiet spine */}
            <span className="ck-label" aria-hidden="true">
              <DoorNumber door={door} />
              <span className="ck-vert">{door.title}</span>
            </span>

            {/* Hover / focus / stacked: the door opens */}
            <span className="ck-reveal">
              <DoorNumber door={door} withRule />
              <span className="ck-rtitle block">{door.title}</span>
              <span className="ck-rline block font-body">{door.line}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
