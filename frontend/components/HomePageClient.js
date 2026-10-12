"use client";

import dynamic from "next/dynamic";
import s from "@/components/home/documentary/film.module.css";

/* ─── The documentary and the chapters after it (desktop ≥768px; code-split, SSR'd for SEO) ─── */
const ActEvening = dynamic(() => import("@/components/home/documentary/ActEvening"));
const ActPounding = dynamic(() => import("@/components/home/documentary/ActPounding"));
const ActDegs = dynamic(() => import("@/components/home/documentary/ActDegs"));
const ActTrami = dynamic(() => import("@/components/home/documentary/ActTrami"));
const ActCredits = dynamic(() => import("@/components/home/documentary/ActCredits"));
const PassportStrip = dynamic(() => import("@/components/home/PassportStrip"));
const ChapterRail = dynamic(() => import("@/components/home/ChapterRail"), { ssr: false });
const ChooseKashmir = dynamic(() => import("@/components/home/ChooseKashmir"));
const SeasonsJourney = dynamic(() => import("@/components/home/SeasonsJourney"));
const WazaFinale = dynamic(() => import("@/components/home/WazaFinale"));

/* ═══════════════════════════════════════════════════════
   MAIN HOMEPAGE CLIENT COMPONENT
   Desktop: after the hero's finished feast, a documentary of how it came to be, in five acts,
   then the chapters that open out into the rest of Kashmir.
   Mobile:  nothing — the phone home lives entirely in HomePageHero.
   ═══════════════════════════════════════════════════════ */
export default function HomePageClient() {
  return (
    // hidden below md: every section in here is desktop-only, and the
    // min-h-screen wrapper was leaving a blank screen at the end of the
    // mobile strip.
    <div className={`${s.film} hidden md:block bg-transparent text-white selection:bg-[var(--saffron)] selection:text-black min-h-screen relative`}>

      {/* ═══════════════════════════════════════════════════════
          DESKTOP — THE DOCUMENTARY, THEN THE WIDER VALLEY
          I.    The Evening Before (the cooks arrive; the fires are lit)
          II.   The Pounding (rista and gushtaba, from one stone)
          III.  Red and White (the long night at the degs)
          IV.   The Trami (the guests, and the courses in order)
          V.    The Credits (the words of the feast, and its sources)
          VI.   Four Doors (choose your Kashmir)
          VII.  The Seasons (pinned time passage)
          VIII. Meet Waza (the finale)
          ═══════════════════════════════════════════════════════ */}
      {/* The chapter rail — the film's index, fixed to the right edge. Its
          chapter list must match the data-ww-chapter blocks below. */}
      <ChapterRail />

      <div data-ww-chapter="I">
        <ActEvening />
      </div>
      <div data-ww-chapter="II">
        <ActPounding />
      </div>
      <div data-ww-chapter="III">
        <ActDegs />
      </div>
      <div data-ww-chapter="IV">
        <ActTrami />
      </div>
      <div data-ww-chapter="V">
        <ActCredits />
      </div>

      <div data-ww-chapter="VI">
        <ChooseKashmir />
      </div>
      <div data-ww-chapter="VII">
        <SeasonsJourney />
      </div>

      {/* Interlude — the journey is being recorded */}
      <PassportStrip />

      <div data-ww-chapter="VIII">
        <WazaFinale />
      </div>
    </div>
  );
}
