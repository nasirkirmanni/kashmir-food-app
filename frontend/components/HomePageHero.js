"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ArrowRight, Sparkles, Flame } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import useSceneMode from "@/hooks/useSceneMode";
import { useMobileNavigation } from "@/context/MobileNavigationContext";
import HamburgerMenu from "@/components/HamburgerMenu";
import ScrollVideoHero from "@/components/hero/ScrollVideoHero";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";

/**
 * MOBILE HOME (below md) — "The Film Strip".
 * One continuous strip of full-bleed doors, every block the same anatomy:
 * photograph under a wash, gold index, mono eyebrow, Bodoni title, one line.
 * masthead → Today's Table cover → passport line → doors 01–04 → Ask Waza.
 * No cards, no chips, no second scroll axis. The desktop chapters stacked
 * vertical — mobile and desktop are the same film.
 * Motion: each door's gold rule draws once as it enters the viewport
 * (IntersectionObserver → .ws-in); everything else is still. Reduced motion
 * renders the finished state.
 */

/* The landscapes behind door 04 — the valley in every light and season. */
const EXPLORE_IMAGES = [
  "/redesign/img/door-wild.webp",
  "/redesign/img/amb-shikara.webp",
  "/redesign/img/season-summer-v2.webp",
  "/redesign/img/amb-dusk.webp",
  "/redesign/img/season-autumn.webp",
  "/redesign/img/season-winter-v2.webp",
  "/redesign/img/season-spring.webp",
];

const STRIP_CSS = `
.ws-strip {
  --ws-bg: #050505;
  --ws-gold: #C8A46A;
  --ws-gold-2: #E6C875;
  --ws-ivory: #F4ECDF;
  --ws-hairline: rgba(200, 164, 106, 0.16);
  --ws-ease: cubic-bezier(0.22, 1, 0.36, 1);
  background: var(--ws-bg);
}
.ws-eyebrow {
  font-family: var(--font-jetbrains-mono, monospace);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.26em;
  text-transform: uppercase;
}
.ws-title {
  font-family: var(--font-bodoni, serif);
  font-weight: 500;
  line-height: 1.04;
  letter-spacing: 0;
  color: var(--ws-ivory);
}
.ws-title em {
  font-style: italic;
  color: var(--ws-gold-2);
}
.ws-line {
  font-family: var(--font-hanken, ui-sans-serif, sans-serif);
  font-size: 13.5px;
  font-weight: 300;
  line-height: 1.7;
  letter-spacing: 0.01em;
  color: rgba(244, 236, 223, 0.66);
}
.ws-index {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--font-jetbrains-mono, monospace);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.2em;
  color: var(--ws-gold);
  padding-bottom: 8px;
}
.ws-rule {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 44px;
  height: 1px;
  background: var(--ws-gold);
}
.ws-door {
  position: relative;
  display: block;
  width: 100%;
  overflow: hidden;
  text-align: left;
  background: var(--ws-bg);
  border: 0;
  padding: 0;
}
.ws-door + .ws-door,
.ws-doors .ws-door:first-child {
  border-top: 1px solid var(--ws-hairline);
}
.ws-door:focus-visible {
  outline: 2px solid var(--ws-gold);
  outline-offset: -2px;
}
.ws-door:active .ws-door-title {
  color: var(--ws-gold-2);
}
.ws-door-title {
  transition: color 250ms ease;
}
.ws-glow {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 60px;
  height: 60px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(200, 164, 106, 0.45), transparent 70%);
  animation: ws-pulse 4s ease-in-out infinite;
  pointer-events: none;
}
@keyframes ws-pulse {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.85; }
}
/* Dish cycler — double-buffered crossfade with a slow drift per plate */
.ws-cycle-layer {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1100ms var(--ws-ease);
  will-change: opacity;
  animation: ws-drift 8s var(--ws-ease) both;
}
.ws-cycle-in {
  opacity: 1;
}
@keyframes ws-drift {
  from { transform: scale(1); }
  to { transform: scale(1.06); }
}
/* Scroll reveal — gated so the finished state is the default everywhere else */
@media (prefers-reduced-motion: no-preference) {
  .ws-reveal .ws-content {
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 700ms var(--ws-ease), transform 800ms var(--ws-ease);
  }
  .ws-reveal .ws-rule {
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 700ms var(--ws-ease) 200ms;
  }
  .ws-reveal.ws-in .ws-content {
    opacity: 1;
    transform: none;
  }
  .ws-reveal.ws-in .ws-rule {
    transform: scaleX(1);
  }
}
@media (prefers-reduced-motion: reduce) {
  .ws-glow { animation: none; opacity: 0.5; }
  .ws-cycle-layer { transition: none; animation: none; }
}
`;

/* The dining rooms behind door 01 — curated editorial interiors. */
const INTERIOR_IMAGES = [
  "/redesign/img/interior-shamyana.webp",
  "/redesign/img/interior-ahdoos.webp",
  "/redesign/img/interior-mughal-darbar.webp",
  "/redesign/img/interior-clove.webp",
];

/**
 * A door's living background — images crossfade in a shuffled loop
 * (dish plates on 02, dining rooms on 01). Double-buffered: the incoming
 * image mounts invisible, fades in only once it has actually loaded
 * (no pop-in), and the outgoing one stays beneath until it's covered.
 * Pauses off-screen.
 */
function DoorCycler({ images, reducedMotion, paused = false }) {
  const [layers, setLayers] = useState(() => [{ src: images[0], key: 0, loaded: true }]);
  const hostRef = useRef(null);
  const orderRef = useRef(images);
  const idxRef = useRef(0);
  const visibleRef = useRef(true);
  // Ref, not dep — a pause must not reset the interval or reshuffle the order.
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (reducedMotion || images.length < 2) return undefined;
    // Shuffle client-side only, so SSR and hydration agree on the first plate.
    orderRef.current = [images[0], ...images.slice(1).sort(() => Math.random() - 0.5)];

    let io;
    if (hostRef.current && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(([entry]) => { visibleRef.current = entry.isIntersecting; }, { threshold: 0.15 });
      io.observe(hostRef.current);
    }
    const tick = setInterval(() => {
      // Rotate only while the user is on this screen AND the door is in view.
      if (pausedRef.current || !visibleRef.current) return;
      idxRef.current = (idxRef.current + 1) % orderRef.current.length;
      setLayers((prev) => {
        const top = prev[prev.length - 1];
        return [top, { src: orderRef.current[idxRef.current], key: top.key + 1, loaded: false }];
      });
    }, 2000);
    return () => {
      clearInterval(tick);
      if (io) io.disconnect();
    };
  }, [images, reducedMotion]);

  return (
    <div ref={hostRef} className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {layers.map((layer) => (
        <div key={layer.key} className={`ws-cycle-layer ${layer.loaded ? "ws-cycle-in" : ""}`}>
          <Image
            src={layer.src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            onLoad={() =>
              setLayers((prev) => prev.map((l) => (l.key === layer.key ? { ...l, loaded: true } : l)))
            }
          />
        </div>
      ))}
    </div>
  );
}

/* Shared bottom wash — one legibility grammar for every plate. */
const WASH =
  "linear-gradient(to top, rgba(5,5,5,0.94) 0%, rgba(5,5,5,0.55) 30%, rgba(5,5,5,0.12) 58%, rgba(5,5,5,0.25) 100%)";

/* The cover art — the still is the poster/LCP and the reduced-motion &
   missing-file fallback; the video (1.2× baked into its encode) fades in
   over it once actually playing. Drop the raw clip in /redesign/ and
   re-encode before pointing COVER_VIDEO at it. */
const COVER_IMAGE = "/redesign/img/door-feast.webp";
const COVER_VIDEO = "/redesign/wazwan-cover.mp4";

export default function HomePageHero({ initialDishes = [] }) {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("Good evening");
  const [dateLine, setDateLine] = useState("Srinagar");
  const { activeIndex, setActiveIndex, isMobile } = useMobileNavigation();
  // Home is swipe screen 0 — rotations elsewhere freeze while the user is away.
  const awayFromHome = isMobile && activeIndex !== 0;

  // Winner-takes-all focus: with 56vh doors, two can be on screen at once —
  // only the MOST-visible door may rotate, so the one the user is "on"
  // animates and its neighbours hold still.
  const [focusedDoor, setFocusedDoor] = useState(null);
  const doorRatiosRef = useRef({});
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || typeof IntersectionObserver === "undefined") return undefined;
    const hosts = strip.querySelectorAll("[data-ws-door-key]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          doorRatiosRef.current[entry.target.dataset.wsDoorKey] = entry.intersectionRatio;
        });
        let best = null;
        let bestRatio = 0.35; // a door must be meaningfully on screen to win
        Object.entries(doorRatiosRef.current).forEach(([key, ratio]) => {
          if (ratio > bestRatio) {
            best = key;
            bestRatio = ratio;
          }
        });
        setFocusedDoor(best);
      },
      { threshold: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1] }
    );
    hosts.forEach((host) => io.observe(host));
    return () => io.disconnect();
  }, []);
  const { reducedMotion } = useSceneMode();
  const stripRef = useRef(null);
  const coverVideoRef = useRef(null);
  const [coverVideoOk, setCoverVideoOk] = useState(true);
  const [coverVideoPlaying, setCoverVideoPlaying] = useState(false);

  // Mount the video only on actual mobile viewports (the strip is display:none
  // on desktop but a hidden <video autoplay> would still download) and never
  // under reduced motion — the still cover serves both cases.
  const showCoverVideo = isMobile && coverVideoOk && !reducedMotion;

  // The Wazwan cover video is the one exception to screen-gating: per the
  // user's direction it plays continuously, wherever they are in the app.
  // Nudge it back to life if the browser ever pauses it (e.g. after a swipe).
  useEffect(() => {
    const v = coverVideoRef.current;
    if (!v) return;
    v.play().catch(() => {});
  }, [showCoverVideo, activeIndex]);

  const handleNavClick = (e, index) => {
    if (isMobile) {
      e.preventDefault();
      setActiveIndex(index);
    }
  };

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 4 && hour < 12) setGreeting("Good morning");
    else if (hour >= 12 && hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
    const formatted = now.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long" });
    setDateLine(`${formatted} · Srinagar`);
  }, []);

  // Doors light up once as they enter the viewport.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || typeof IntersectionObserver === "undefined") return undefined;
    const targets = strip.querySelectorAll(".ws-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("ws-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  const userName = user && user.name ? user.name.split(" ")[0] : null;

  // User-curated exclusions — these photos must never enter the rotation.
  const BLOCKED_DISH_IMAGES = /marchwangan|daniwal-korma|waza-kokur/i;
  const dishImages = initialDishes
    .map((dish) => dish.image)
    .filter((img) => img && !BLOCKED_DISH_IMAGES.test(img));

  const doors = [
    {
      key: "eat",
      num: "01",
      eyebrow: "Eat tonight",
      title: "The Tables.",
      line: "Curated rooms across the valley — no tourist traps.",
      image: "/redesign/img/interior-shamyana.webp", // static fallback
      cycleImages: INTERIOR_IMAGES,
      href: "/restaurants",
      navIndex: 1,
    },
    {
      key: "food",
      num: "02",
      eyebrow: "Kashmiri food",
      title: "The Dishes.",
      line: "From street-side harissa to royal rista — ninety dishes deep.",
      image: "/redesign/img/door-feast.webp", // static fallback if no dish data
      cycleImages: dishImages,
      href: "/kashmiri-food",
      navIndex: 3,
    },
    {
      key: "learn",
      num: "03",
      eyebrow: "Learn the feast",
      title: "The Manners.",
      line: "Thirty-six courses, one copper plate, a code of respect.",
      image: "/redesign/img/ritual-tashnaer.webp",
      href: "/how-to-experience",
    },
    {
      key: "explore",
      num: "04",
      eyebrow: "Explore Kashmir",
      title: "The Valley.",
      line: "Lakes, meadows and passes — the Kashmir beyond the table.",
      image: "/redesign/img/door-wild.webp", // static fallback
      cycleImages: EXPLORE_IMAGES,
      href: "/explore",
    },
  ];

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          MOBILE HOME (below md) — "The Film Strip"
          ═══════════════════════════════════════════════════════ */}
      <section ref={stripRef} className="ws-strip relative flex md:hidden w-full flex-col min-h-screen overflow-x-clip">
        <style dangerouslySetInnerHTML={{ __html: STRIP_CSS }} />

        {/* Masthead — one quiet line */}
        <header className="shrink-0 relative z-10" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
          <div className="flex items-center justify-between px-6 pt-10 pb-5">
            <div className="min-w-0">
              <span className="ws-eyebrow block truncate text-[#8a8a8a]">{dateLine}</span>
              <span
                style={{ fontFamily: "var(--font-bodoni)" }}
                className="mt-2 block truncate text-[17px] italic leading-snug text-[#F4ECDF]"
              >
                {greeting}{userName ? `, ${userName}` : ""}.
              </span>
            </div>
            {/* Two controls only — profile lives in the floating nav pill */}
            <div className="flex shrink-0 items-center gap-2.5 pl-4">
              <button
                onClick={() => window.dispatchEvent(new Event("open-search"))}
                aria-label="Search"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 transition-transform active:scale-95"
              >
                <Search size={15} className="text-[#C8A46A]" strokeWidth={1.75} />
              </button>
              <HamburgerMenu />
            </div>
          </div>
        </header>

        {/* Cover — The Wazwan. The feast opens the film.
            Swap COVER_IMAGE for the final art when it lands in /redesign/img/. */}
        <Link
          href="/kashmiri-food"
          prefetch={false}
          onClick={(e) => handleNavClick(e, 3)}
          className="ws-door relative block h-[70vh] min-h-[500px] w-full"
          aria-label="The Wazwan — Kashmir's royal feast"
        >
          <ImageWithSkeleton
            src={COVER_IMAGE}
            alt="The Wazwan — Kashmir's royal feast"
            fill
            priority
            className="object-cover"
            containerClassName="absolute inset-0"
            sizes="100vw"
          />
          {/* The living cover — z-10 after the image so it paints above it,
              before the wash so the grade still applies. */}
          {showCoverVideo && (
            <video
              ref={coverVideoRef}
              src={COVER_VIDEO}
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
              aria-hidden="true"
              tabIndex={-1}
              disablePictureInPicture
              onPlaying={() => setCoverVideoPlaying(true)}
              onError={() => setCoverVideoOk(false)}
              className={`absolute inset-0 z-10 h-full w-full object-cover transition-opacity duration-700 ease-out ${
                coverVideoPlaying ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
          {/* z-10/z-20 — ImageWithSkeleton renders its <img> at z-10 */}
          <div className="pointer-events-none absolute inset-0 z-10" style={{ background: WASH }} />
          <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-9">
            <span className="ws-index">
              Wazwan Way · The Royal Feast
              <span className="ws-rule" />
            </span>
            <h1 className="ws-title ws-door-title mt-4 text-[clamp(40px,11.5vw,52px)]">
              The <em>Wazwan</em>.
            </h1>
            <p className="ws-line mt-3 max-w-[310px]">
              Thirty-six courses, one copper trami — the feast Kashmir is named for.
            </p>
            <span className="ws-eyebrow mt-6 inline-flex items-center gap-2.5 text-[#F4ECDF]">
              Begin the feast <ArrowRight size={12} strokeWidth={1.75} aria-hidden="true" />
            </span>
          </div>
        </Link>

        {/* Passport line — signed-in only, one slim ledger row */}
        {user && (user.dailyStreak > 0 || user.totalXP > 0) && (
          <Link
            href="/profile"
            prefetch={false}
            onClick={(e) => handleNavClick(e, 4)}
            className="flex items-center justify-between border-t border-[rgba(200,164,106,0.16)] px-6 py-4"
          >
            <span className="flex items-center gap-2">
              <Flame size={11} className="text-[#C8A46A]" strokeWidth={2} aria-hidden="true" />
              <span className="ws-eyebrow text-[#8a8a8a]">
                {user.dailyStreak > 0 ? `Day ${user.dailyStreak}` : ""}
                {user.dailyStreak > 0 && user.totalXP > 0 ? " · " : ""}
                {user.totalXP > 0 ? `${user.totalXP} XP` : ""}
              </span>
            </span>
            <span className="ws-eyebrow inline-flex items-center gap-2 text-[#C8A46A]">
              Passport <ArrowRight size={11} strokeWidth={1.75} aria-hidden="true" />
            </span>
          </Link>
        )}

        {/* The doors */}
        <nav className="ws-doors" aria-label="Start here">
          {doors.map((door) => (
            <Link
              key={door.key}
              href={door.href}
              prefetch={false}
              onClick={door.navIndex != null ? (e) => handleNavClick(e, door.navIndex) : undefined}
              className="ws-door ws-reveal relative block h-[56vh] min-h-[420px]"
              aria-label={`${door.eyebrow} — ${door.title} ${door.line}`}
              data-ws-door-key={door.cycleImages && door.cycleImages.length ? door.key : undefined}
            >
              {door.cycleImages && door.cycleImages.length ? (
                <DoorCycler
                  images={door.cycleImages}
                  reducedMotion={reducedMotion}
                  paused={awayFromHome || focusedDoor !== door.key}
                />
              ) : (
                <Image src={door.image} alt="" fill sizes="100vw" className="object-cover" />
              )}
              <div className="pointer-events-none absolute inset-0" style={{ background: WASH }} />
              <div className="ws-content absolute inset-x-0 bottom-0 px-6 pb-8">
                <span className="ws-index">
                  {door.num} — {door.eyebrow}
                  <span className="ws-rule" />
                </span>
                <h2 className="ws-title ws-door-title mt-4 text-[34px]">{door.title}</h2>
                <p className="ws-line mt-2.5 max-w-[300px]">{door.line}</p>
              </div>
            </Link>
          ))}

          {/* Ask Waza — the closing plate, always lit */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("open-waza-ai-intro"))}
            className="ws-door ws-reveal relative block h-[52vh] min-h-[400px] w-full"
            aria-label="Ask Waza — the concierge that has eaten everywhere and slept nowhere"
          >
            <Image src="/redesign/img/night-dal.webp" alt="" fill sizes="100vw" className="object-cover" />
            <div className="pointer-events-none absolute inset-0" style={{ background: WASH }} />
            <div className="ws-content absolute inset-x-0 bottom-0 px-6 pb-9">
              <span className="ws-index">
                <span className="ws-glow" aria-hidden="true" />
                <Sparkles size={11} strokeWidth={1.75} aria-hidden="true" />
                The concierge · Always awake
                <span className="ws-rule" />
              </span>
              <h2 className="ws-title ws-door-title mt-4 text-[34px]">
                Ask <em>Waza</em>.
              </h2>
              <p className="ws-line mt-2.5 max-w-[300px]">Has eaten everywhere. Slept nowhere.</p>
              <span className="ws-eyebrow mt-6 inline-flex items-center gap-2.5 text-[#E6C875]">
                Wake the concierge <ArrowRight size={12} strokeWidth={1.75} aria-hidden="true" />
              </span>
            </div>
          </button>
        </nav>

        {/* Clearance for the floating nav pill */}
        <div className="h-28 shrink-0" />
      </section>

      {/* ═══════════════════════════════════════════════════════
          DESKTOP / TABLET HERO (≥768px) — Cinematic scroll-scrub reveal
          ═══════════════════════════════════════════════════════ */}
      <ScrollVideoHero />
    </>
  );
}
