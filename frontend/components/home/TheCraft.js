"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useSceneMode from "@/hooks/useSceneMode";

/**
 * Chapter III — The Craft.
 * The valley's table rests on four handmade things. A gold constellation —
 * each star an ingredient; the active one blooms into a relic card with its
 * micro-story and a passage deeper into the journal.
 */

const EASE = [0.22, 1, 0.36, 1];

const INGREDIENTS = [
  {
    key: "saffron",
    name: "Saffron",
    origin: "Pampore · The Karewa Plateaus",
    story:
      "One flower gives three threads. It takes a hundred and sixty flowers to fill a single gram — grown on Pampore's plateaus for over two thousand years, and still picked at dawn, by hand.",
    image: "/redesign/img/craft-saffron.webp",
    href: "/blog/pampore-kashmiri-saffron",
    x: 96, y: 84,
  },
  {
    key: "ver",
    name: "Ver Masala",
    origin: "The Mother Spice Cake",
    story:
      "Sun-dried discs of chilli, garlic and shallot pounded with mustard oil, hung on a string by the kitchen window. Every Wazwan gravy begins by breaking a piece of one.",
    image: "/redesign/img/craft-ver.webp",
    href: "/blog/what-is-ver-masala",
    x: 296, y: 132,
  },
  {
    key: "nadru",
    name: "Nadru",
    origin: "Dal & Anchar Lakes",
    story:
      "Lotus stem pulled from the lake beds — a lace of hollows that stays crisp through the longest simmer. The only vegetable Kashmiris will fight over.",
    image: "/redesign/img/craft-nadru.webp",
    href: "/blog/nadru-lotus-stem-kashmir",
    x: 148, y: 252,
  },
  {
    key: "kandur",
    name: "The Kandur's Bread",
    origin: "Every Mohalla · Twice Daily",
    story:
      "Bread is bought, never baked at home. The neighbourhood kandur pulls girda from the tandoor before sunrise — you carry it home in a bare hand, still warm.",
    image: "/images/kashmiri-food/bakery.webp",
    href: "/blog/kandur-wan-breads",
    x: 318, y: 316,
  },
];

/* Constellation edges (indices into INGREDIENTS) */
const EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 2],
];

export default function TheCraft() {
  const { reducedMotion } = useSceneMode();
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const hoveredRef = useRef(false);
  hoveredRef.current = hovered;

  // The constellation is alive: it advances on its own until studied.
  useEffect(() => {
    if (reducedMotion) return undefined;
    const id = setInterval(() => {
      if (!hoveredRef.current) setActive((a) => (a + 1) % INGREDIENTS.length);
    }, 5000);
    return () => clearInterval(id);
  }, [reducedMotion]);

  const item = INGREDIENTS[active];

  return (
    <section
      aria-label="The Craft — the handmade things Kashmir's table rests on"
      className="relative hidden overflow-hidden bg-[#050505] md:block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(200,164,106,0.06),transparent_55%)]" />

      <div className="page-shell py-28">
        <div className="text-center">
          <span
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            className="text-[0.62rem] font-medium uppercase tracking-[0.44em] text-[#C8A46A]"
          >
            Chapter III — The Craft
          </span>
          <h2
            style={{ fontFamily: "var(--font-bodoni)" }}
            className="mx-auto mt-6 max-w-3xl text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.01em] text-white"
          >
            Four ingredients carry <span className="italic text-[#E6C875]">the valley</span>.
          </h2>
          <p className="mx-auto mt-6 max-w-md font-body text-base leading-relaxed text-white/55">
            A constellation of handmade things. Every point is a story your table depends on.
          </p>
        </div>

        <div className="mt-20 grid items-center gap-16 lg:grid-cols-2">
          {/* ─── The constellation ─── */}
          <div className="relative mx-auto aspect-square w-full max-w-[520px]">
            <svg viewBox="0 0 400 400" className="h-full w-full">
              {/* Edges — drawn as the section enters view */}
              {EDGES.map(([a, b], i) => (
                <motion.line
                  key={i}
                  x1={INGREDIENTS[a].x}
                  y1={INGREDIENTS[a].y}
                  x2={INGREDIENTS[b].x}
                  y2={INGREDIENTS[b].y}
                  stroke="rgba(200,164,106,0.35)"
                  strokeWidth="1"
                  strokeDasharray="3 5"
                  initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 1.4, delay: 0.25 + i * 0.2, ease: EASE }}
                />
              ))}
            </svg>

            {/* Stars — buttons overlaid at SVG coordinates */}
            {INGREDIENTS.map((ing, i) => {
              const isActive = active === i;
              return (
                <button
                  key={ing.key}
                  type="button"
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  aria-label={`${ing.name} — ${ing.origin}`}
                  aria-pressed={isActive}
                  className="group absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center outline-none"
                  style={{ left: `${(ing.x / 400) * 100}%`, top: `${(ing.y / 400) * 100}%` }}
                >
                  <span className="relative flex h-11 w-11 items-center justify-center">
                    {/* Pulse ring on the active star */}
                    {isActive && !reducedMotion && (
                      <span
                        className="absolute inset-0 rounded-full border border-[#C8A46A]/50"
                        style={{ animation: "pulse-glow 2.6s ease-in-out infinite" }}
                      />
                    )}
                    <span
                      className="rounded-full transition-all duration-500 group-focus-visible:ring-2 group-focus-visible:ring-[#C8A46A]"
                      style={{
                        width: isActive ? 13 : 8,
                        height: isActive ? 13 : 8,
                        background: isActive ? "#E6C875" : "rgba(230,200,117,0.55)",
                        boxShadow: isActive
                          ? "0 0 22px rgba(200,164,106,0.9), 0 0 50px rgba(200,164,106,0.4)"
                          : "0 0 10px rgba(200,164,106,0.35)",
                      }}
                    />
                  </span>
                  <span
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                    className="mt-1 whitespace-nowrap text-[0.6rem] uppercase tracking-[0.24em] transition-colors duration-400"
                  >
                    <span style={{ color: isActive ? "#E6C875" : "rgba(255,255,255,0.4)" }}>{ing.name}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* ─── The relic card ─── */}
          <div className="relative mx-auto w-full max-w-sm" style={{ minHeight: 560 }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={item.key}
                initial={reducedMotion ? false : { opacity: 0, y: 22, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -14, scale: 0.99 }}
                transition={{ duration: 0.55, ease: EASE }}
                className="overflow-hidden rounded-[22px] border border-[#C8A46A]/25 bg-[#0A0906] shadow-[0_0_70px_rgba(200,164,106,0.1)]"
              >
                <div className="relative aspect-[4/5] max-h-[340px] w-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={`${item.name} — ${item.origin}`}
                    fill
                    sizes="(max-width: 1024px) 90vw, 26rem"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0906] via-transparent to-transparent" />
                </div>
                <div className="p-7">
                  <span
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                    className="text-[0.58rem] uppercase tracking-[0.3em] text-[#C8A46A]"
                  >
                    {item.origin}
                  </span>
                  <h3
                    style={{ fontFamily: "var(--font-bodoni)" }}
                    className="mt-3 text-3xl font-semibold text-white"
                  >
                    {item.name}
                  </h3>
                  <p className="mt-4 font-body text-[0.9rem] leading-relaxed text-white/65">{item.story}</p>
                  <Link
                    href={item.href}
                    prefetch={false}
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                    className="group/link mt-6 inline-flex items-center gap-2.5 text-[0.6rem] uppercase tracking-[0.24em] text-[#E6C875] transition-colors hover:text-white"
                  >
                    Read the story
                    <ArrowRight size={12} className="transition-transform duration-300 group-hover/link:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
