"use client";

import dynamic from "next/dynamic";

/* ─── The cinematic chapters (desktop ≥768px; code-split, SSR'd for SEO) ─── */
const TheTrami = dynamic(() => import("@/components/home/TheTrami"));
const TheManners = dynamic(() => import("@/components/home/TheManners"));
const TheCraft = dynamic(() => import("@/components/home/TheCraft"));
const WazasNight = dynamic(() => import("@/components/home/WazasNight"));
const TheSamovar = dynamic(() => import("@/components/home/TheSamovar"));
const SpeakWazwan = dynamic(() => import("@/components/home/SpeakWazwan"));
const PassportStrip = dynamic(() => import("@/components/home/PassportStrip"));
const ChapterRail = dynamic(() => import("@/components/home/ChapterRail"), { ssr: false });
const ChooseKashmir = dynamic(() => import("@/components/home/ChooseKashmir"));
const SeasonsJourney = dynamic(() => import("@/components/home/SeasonsJourney"));
const WazaFinale = dynamic(() => import("@/components/home/WazaFinale"));

/* ═══════════════════════════════════════════════════════
   MAIN HOMEPAGE CLIENT COMPONENT
   Desktop: a nine-chapter cinematic narrative after the hero.
   Mobile:  nothing — the phone home lives entirely in HomePageHero.
   ═══════════════════════════════════════════════════════ */
export default function HomePageClient() {
  return (
    // hidden below md: every section in here is desktop-only, and the
    // min-h-screen wrapper was leaving a blank screen at the end of the
    // mobile strip.
    <div className="hidden md:block bg-transparent text-white overflow-hidden selection:bg-[var(--saffron)] selection:text-black min-h-screen relative">

      {/* ═══════════════════════════════════════════════════════
          DESKTOP — THE NINE CHAPTERS
          I.    The Trami (the feast, course by course)
          II.   The Manners (the code of the trami)
          III.  The Craft (the handmade things the table rests on)
          IV.   The Waza's Night (the overnight cook)
          V.    The Samovar (noon chai and kahwa)
          VI.   Speak Wazwan (the words of the feast)
          VII.  Four Doors (choose your Kashmir)
          VIII. The Seasons (pinned time passage)
          IX.   Meet Waza (the finale)
          ═══════════════════════════════════════════════════════ */}
      {/* The chapter rail — the film's index, fixed to the right edge. Its
          CHAPTERS list must match the data-ww-chapter blocks below. */}
      <ChapterRail />

      {/* Chapter I — the sarposh lifts, and the courses arrive */}
      <div data-ww-chapter="I">
        <TheTrami />
      </div>

      {/* Chapter II — the Code of the Trami: learn the manners before you eat */}
      <div data-ww-chapter="II">
        <TheManners />
      </div>

      {/* Chapter III — the handmade things the table rests on */}
      <div data-ww-chapter="III">
        <TheCraft />
      </div>

      {/* Chapter IV — the night-long cook behind the feast */}
      <div data-ww-chapter="IV">
        <WazasNight />
      </div>

      {/* Chapter V — two teas from one copper urn */}
      <div data-ww-chapter="V">
        <TheSamovar />
      </div>

      {/* Chapter VI — the vocabulary of the feast */}
      <div data-ww-chapter="VI">
        <SpeakWazwan />
      </div>

      <div data-ww-chapter="VII">
        <ChooseKashmir />
      </div>
      <div data-ww-chapter="VIII">
        <SeasonsJourney />
      </div>

      {/* Interlude — the journey is being recorded */}
      <PassportStrip />

      <div data-ww-chapter="IX">
        <WazaFinale />
      </div>
    </div>
  );
}
