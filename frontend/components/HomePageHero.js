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
/* Waza chat demo — conversation swap + typing dots */
.ws-chat-in {
  animation: ws-chat-in 450ms var(--ws-ease) both;
}
@keyframes ws-chat-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.ws-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--ws-gold);
  animation: ws-dot 1.1s ease-in-out infinite;
}
.ws-dot:nth-child(2) { animation-delay: 0.18s; }
.ws-dot:nth-child(3) { animation-delay: 0.36s; }
@keyframes ws-dot {
  0%, 60%, 100% { opacity: 0.25; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}
.ws-caret {
  display: inline-block;
  width: 2px;
  height: 0.95em;
  margin-left: 2px;
  vertical-align: text-bottom;
  background: var(--ws-gold-2);
  animation: ws-caret 0.9s steps(1) infinite;
}
@keyframes ws-caret {
  50% { opacity: 0; }
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
  .ws-chat-in { animation: none; }
  .ws-dot { animation: none; opacity: 0.6; }
  .ws-caret { animation: none; opacity: 0; }
}
`;

/* The staged conversation for the Waza demo — real app answers, no fluff. */
const WAZA_DEMO_PAIRS = [
  {
    q: "Where should I eat wazwan tonight in Srinagar?",
    a: "Ahdoos on Residency Road — order the rista and tabak maaz. Locals' pick, no tourist markup.",
  },
  {
    q: "Is Doodhpathri worth a day trip in July?",
    a: "Absolutely. 43.5 km from Srinagar and the meadows are at their greenest — leave by 8 AM.",
  },
  {
    q: "What is noon chai?",
    a: "Kashmir's pink salted tea from the samovar. Have it at dawn with a warm czochworu.",
  },
];

/**
 * "How Waza works" — a staged chat that loops: the question appears, Waza
 * types, the answer streams in like the real SSE widget. Runs only while
 * visible on the active screen; reduced motion shows a finished exchange.
 */
function WazaDemo({ active, reducedMotion }) {
  const [pairIdx, setPairIdx] = useState(0);
  const [phase, setPhase] = useState("q"); // q → typing → a → hold
  const [typed, setTyped] = useState(0);
  const pair = WAZA_DEMO_PAIRS[pairIdx];

  useEffect(() => {
    if (reducedMotion || !active) return undefined; // frozen mid-state; resumes when active
    let t;
    if (phase === "q") t = setTimeout(() => setPhase("typing"), 1200);
    else if (phase === "typing") t = setTimeout(() => { setTyped(0); setPhase("a"); }, 1000);
    else if (phase === "a") {
      if (typed < pair.a.length) t = setTimeout(() => setTyped((v) => Math.min(v + 2, pair.a.length)), 26);
      else t = setTimeout(() => setPhase("hold"), 3000);
    } else {
      t = setTimeout(() => {
        setPairIdx((i) => (i + 1) % WAZA_DEMO_PAIRS.length);
        setTyped(0);
        setPhase("q");
      }, 250);
    }
    return () => clearTimeout(t);
  }, [phase, typed, pairIdx, active, reducedMotion, pair.a.length]);

  const showTyping = !reducedMotion && phase === "typing";
  const answerText = reducedMotion ? pair.a : phase === "a" || phase === "hold" ? pair.a.slice(0, typed) : "";
  const answerDone = reducedMotion || (typed >= pair.a.length && (phase === "a" || phase === "hold"));

  return (
    <div
      key={pairIdx}
      className="ws-chat-in flex min-h-[196px] flex-col gap-3"
      aria-hidden="true"
    >
      {/* The traveller asks */}
      <div className="max-w-[82%] self-end rounded-2xl rounded-br-md border border-white/10 bg-white/[0.07] px-4 py-3">
        <p className="font-body text-[13.5px] leading-relaxed text-[#F4ECDF]/90">{pair.q}</p>
      </div>
      {/* Waza answers */}
      {(showTyping || answerText) && (
        <div className="max-w-[88%] self-start rounded-2xl rounded-bl-md border border-[#C8A46A]/25 bg-[#C8A46A]/[0.06] px-4 py-3">
          <span className="ws-eyebrow flex items-center gap-1.5 text-[#C8A46A]">
            <Sparkles size={10} strokeWidth={1.75} aria-hidden="true" /> Waza
          </span>
          {showTyping ? (
            <span className="mt-2.5 flex gap-1.5 py-1">
              <span className="ws-dot" />
              <span className="ws-dot" />
              <span className="ws-dot" />
            </span>
          ) : (
            <p className="mt-2 font-body text-[13.5px] leading-relaxed text-white/85">
              {answerText}
              {!answerDone && <span className="ws-caret" />}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

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

  // The Waza demo animates only while its section is actually on screen.
  const wazaDemoRef = useRef(null);
  const [wazaDemoInView, setWazaDemoInView] = useState(false);
  useEffect(() => {
    const el = wazaDemoRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([entry]) => setWazaDemoInView(entry.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
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
  const [coverVideoReady, setCoverVideoReady] = useState(false);

  // Defer the video fetch until the page has finished loading (plus a beat of
  // idle) so its ~1.4MB never competes with the LCP image or hydration. The
  // still cover shows first and the video fades in over it, so the delay is
  // invisible to the user.
  useEffect(() => {
    let idleId, timeoutId;
    const arm = () => {
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(() => setCoverVideoReady(true), { timeout: 2500 });
      } else {
        timeoutId = window.setTimeout(() => setCoverVideoReady(true), 1500);
      }
    };
    if (document.readyState === "complete") arm();
    else {
      window.addEventListener("load", arm, { once: true });
      return () => {
        window.removeEventListener("load", arm);
        if (idleId) window.cancelIdleCallback?.(idleId);
        if (timeoutId) window.clearTimeout(timeoutId);
      };
    }
    return () => {
      if (idleId) window.cancelIdleCallback?.(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  // Mount the video only on actual mobile viewports (the strip is display:none
  // on desktop but a hidden <video autoplay> would still download) and never
  // under reduced motion — the still cover serves both cases.
  const showCoverVideo = isMobile && coverVideoOk && !reducedMotion && coverVideoReady;

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
  const BLOCKED_DISH_IMAGES = /marchwangan|daniwal-korma|waza-kokur|czochworu/i;
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
                <Image src={door.image} alt={door.title || ""} fill sizes="100vw" className="object-cover" />
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

        </nav>

        {/* The finale — Need help? Waza is here. A staged conversation shows
            exactly how the concierge answers, then one decisive CTA. */}
        <section
          ref={wazaDemoRef}
          aria-label="Waza AI — the concierge"
          className="relative border-t border-[rgba(200,164,106,0.16)] px-6 pb-16 pt-14"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(200,164,106,0.07), transparent 60%)" }}
          />
          <div className="relative">
            <span className="ws-index">
              <span className="ws-glow" aria-hidden="true" />
              <Sparkles size={11} strokeWidth={1.75} aria-hidden="true" />
              Need help?
              <span className="ws-rule" />
            </span>
            <h2 className="ws-title mt-4 text-[34px]">
              Waza is <em>here</em>.
            </h2>
            <p className="ws-line mt-2.5 max-w-[310px]">
              A concierge that has eaten everywhere and slept nowhere — ask it anything about Kashmir.
            </p>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <WazaDemo active={wazaDemoInView && !awayFromHome} reducedMotion={reducedMotion} />
            </div>

            <button
              type="button"
              onClick={(e) => {
                if (isMobile) handleNavClick(e, 2);
                else window.dispatchEvent(new Event("open-waza-ai-intro"));
              }}
              className="mt-8 flex h-[52px] w-full items-center justify-center gap-2.5 rounded-full bg-[#C8A46A] text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#050505] transition-transform active:scale-[0.97]"
            >
              Try it now
              <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </section>

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
