"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import useSceneMode from "@/hooks/useSceneMode";

/**
 * Chapter II — Choose Your Kashmir.
 * Four full-height doors into the valley. Hover / focus physically opens a
 * door (the panel widens, the image warms from monochrome dusk to colour,
 * the room's copy breathes in). Ask Waza opens the live AI via the app's
 * window-event bus instead of navigating.
 */

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const DOORS = [
  {
    key: "feast",
    num: "01",
    title: "The Feast",
    mood: "Warm · Celebratory",
    line: "Copper trami, saffron smoke, thirty-six courses deep.",
    image: "/redesign/img/door-feast.webp",
    tint: "rgba(200,120,40,0.22)",
    href: "/kashmiri-food",
  },
  {
    key: "wild",
    num: "02",
    title: "The Wild",
    mood: "Alpine · Untamed",
    line: "Glacier lakes, pine ridges, silence above the tree line.",
    image: "/redesign/img/door-wild.webp",
    tint: "rgba(90,140,120,0.22)",
    href: "/explore",
  },
  {
    key: "culture",
    num: "03",
    title: "The Culture",
    mood: "Timeless · Handmade",
    line: "Mughal gardens, papier-mâché, verses older than the chinars.",
    image: "/redesign/img/door-culture.webp",
    tint: "rgba(170,110,60,0.22)",
    href: "/how-to-experience",
  },
  {
    key: "waza",
    num: "04",
    title: "Ask Waza",
    mood: "Tradition · Intelligence",
    line: "A concierge that has eaten everywhere and slept nowhere.",
    image: "/redesign/img/night-dal.webp",
    tint: "rgba(90,90,180,0.20)",
    href: null, // opens the live AI
  },
];

export default function ChooseKashmir() {
  const [active, setActive] = useState(null);
  const { reducedMotion } = useSceneMode();
  const router = useRouter();

  const open = (door) => {
    if (door.href) router.push(door.href);
    else if (typeof window !== "undefined") window.dispatchEvent(new Event("open-waza-ai-intro"));
  };

  return (
    <section aria-label="Choose your Kashmir" className="relative hidden bg-[#050505] md:block">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(200,164,106,0.06),transparent_55%)]" />

      <div className="page-shell pt-28 text-center">
        <span
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          className="text-[0.62rem] font-medium uppercase tracking-[0.44em] text-[#C8A46A]"
        >
          Chapter V — Four Doors
        </span>
        <h2
          style={{ fontFamily: "var(--font-bodoni)" }}
          className="mx-auto mt-6 max-w-3xl text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-white"
        >
          Choose your <span className="italic text-[#E6C875]">Kashmir</span>.
        </h2>
        <p className="mx-auto mt-6 max-w-md font-body text-base leading-relaxed text-white/55">
          Four doors into the same valley. Open the one that matches how you want to spend your time here.
        </p>
      </div>

      <div className="page-shell py-20">
        <div
          className="flex h-[76vh] min-h-[540px] gap-3"
          onMouseLeave={() => setActive(null)}
        >
          {DOORS.map((door, i) => {
            const isActive = active === i;
            const grow = active === null ? 1 : isActive ? 3 : 0.72;
            return (
              <button
                key={door.key}
                type="button"
                onClick={() => open(door)}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                aria-label={`${door.title} — ${door.line}`}
                className="group relative min-w-0 cursor-pointer overflow-hidden rounded-[22px] border border-white/10 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#C8A46A]"
                style={{
                  flexGrow: grow,
                  flexBasis: 0,
                  transition: reducedMotion ? "none" : `flex-grow 700ms ${EASE}, border-color 400ms ease`,
                  borderColor: isActive ? "rgba(200,164,106,0.45)" : undefined,
                }}
              >
                {/* Door imagery — dusk-graded until opened */}
                <Image
                  src={door.image}
                  alt=""
                  fill
                  sizes="(max-width: 1280px) 50vw, 35vw"
                  className="object-cover"
                  style={{
                    filter: isActive ? "grayscale(0) brightness(0.9)" : "grayscale(0.55) brightness(0.45)",
                    transform: isActive ? "scale(1.06)" : "scale(1)",
                    transition: reducedMotion ? "none" : `filter 700ms ${EASE}, transform 1200ms ${EASE}`,
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to top, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.25) 45%, rgba(5,5,5,0.35) 100%), ${
                      isActive ? `radial-gradient(ellipse at 50% 80%, ${door.tint}, transparent 70%)` : "none"
                    }`,
                    transition: "background 500ms ease",
                  }}
                />

                {/* Door number */}
                <span
                  style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                  className="absolute left-5 top-5 text-[0.62rem] tracking-[0.22em] text-[#E6C875]/90"
                >
                  {door.num}
                </span>

                {/* Closed state — vertical title spine */}
                <span
                  style={{
                    fontFamily: "var(--font-bodoni)",
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    opacity: isActive ? 0 : 1,
                    transition: reducedMotion ? "none" : "opacity 350ms ease",
                  }}
                  className="pointer-events-none absolute bottom-8 left-6 text-[1.6rem] font-medium tracking-wide text-white/90"
                >
                  {door.title}
                </span>

                {/* Open state — the room breathes in */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 p-7 lg:p-9"
                  style={{
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? "translateY(0)" : "translateY(18px)",
                    transition: reducedMotion
                      ? "none"
                      : `opacity 500ms ${EASE} 150ms, transform 600ms ${EASE} 150ms`,
                  }}
                >
                  <span
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                    className="text-[0.58rem] uppercase tracking-[0.3em] text-[#E6C875]"
                  >
                    {door.mood}
                  </span>
                  <h3
                    style={{ fontFamily: "var(--font-bodoni)" }}
                    className="mt-3 whitespace-nowrap text-4xl font-semibold text-white lg:text-5xl"
                  >
                    {door.title}
                  </h3>
                  <p className="mt-3 max-w-xs font-body text-sm leading-relaxed text-white/70">{door.line}</p>
                  <span
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                    className="mt-5 inline-flex items-center gap-2.5 text-[0.6rem] uppercase tracking-[0.24em] text-[#E6C875]"
                  >
                    {door.href ? "Step through" : "Wake the concierge"}
                    <ArrowRight size={12} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
