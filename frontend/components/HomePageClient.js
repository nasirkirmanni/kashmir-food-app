"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const DesktopRestaurantTabs = dynamic(() => import("@/components/DesktopRestaurantTabs"), { ssr: false });

/* ─── The cinematic chapters (desktop ≥768px; code-split, SSR'd for SEO) ─── */
const RestaurantChapters = dynamic(() => import("@/components/home/RestaurantChapters"));
const TheManners = dynamic(() => import("@/components/home/TheManners"));
const TheCraft = dynamic(() => import("@/components/home/TheCraft"));
const TheRoads = dynamic(() => import("@/components/home/TheRoads"));
const PassportStrip = dynamic(() => import("@/components/home/PassportStrip"));
const ChapterRail = dynamic(() => import("@/components/home/ChapterRail"), { ssr: false });
const ChooseKashmir = dynamic(() => import("@/components/home/ChooseKashmir"));
const SeasonsJourney = dynamic(() => import("@/components/home/SeasonsJourney"));
const WazaFinale = dynamic(() => import("@/components/home/WazaFinale"));

/* ─── Location metadata for the browse-by-location tabs ─── */
const locationTabMeta = {
  Srinagar: {
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8">
        <path d="M5 23.5c2.1-1.2 4.2-1.2 6.3 0 2.1 1.2 4.2 1.2 6.4 0 2.1-1.2 4.2-1.2 6.3 0 1 .6 2 .9 3 .9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M10.5 21V11.8L16 8l5.5 3.8V21" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        <path d="M12.7 21v-5.1h6.6V21M14.6 13.2h2.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    )
  },
  Pahalgam: {
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8">
        <path d="M7 24.5h18M10.3 24.5V18l-3.1 2.2L10.3 13l3.2 5 1.9-1.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M19.6 24.5v-8l-3.7 2.7L19.6 10l3.8 6.1 1.8-1.3v9.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    )
  },
  Gulmarg: {
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8">
        <path d="M4.5 23.5 12.8 12l3.7 4.8 4.9-7.3 6.1 14z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
        <path d="m11.9 14.2 1.8-2.2 1.5 1.9M18.9 12.8l1.8-2.1 1.6 2M4 23.5h24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.35" />
      </svg>
    )
  },
  Sonamarg: {
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8">
        <path d="M5 23.5 12 12l4.1 6 4.8-8.5L27 23.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
        <path d="m12 12 2-2.8M16.9 8.9h3M18.4 7.4v3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.35" />
        <path d="M4 23.5h24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.35" />
      </svg>
    )
  }
};

/* ═══════════════════════════════════════════════════════
   MAIN HOMEPAGE CLIENT COMPONENT
   Desktop: a four-chapter cinematic narrative after the hero.
   Mobile:  the preserved swipe architecture (unchanged below).
   ═══════════════════════════════════════════════════════ */
export default function HomePageClient({ initialDishes = [], initialRestaurants = [] }) {
  const [restaurants] = useState(initialRestaurants);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isRestaurantModalVisible, setIsRestaurantModalVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  const locationTabs = ["Srinagar", "Pahalgam", "Gulmarg", "Sonamarg"];

  useEffect(() => {
    setIsMounted(true);
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  useEffect(() => {
    if (!isRestaurantModalVisible) return undefined;
    const onKeyDown = (e) => { if (e.key === "Escape") setIsRestaurantModalVisible(false); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isRestaurantModalVisible]);

  const locationCounts = locationTabs.reduce((counts, location) => {
    counts[location] = restaurants.filter(
      (restaurant) => (restaurant.city || "Srinagar") === location
    ).length;
    return counts;
  }, {});

  const featuredRestaurants = selectedLocation
    ? restaurants.filter((restaurant) => (restaurant.city || "Srinagar") === selectedLocation)
    : [];

  return (
    <div className="bg-transparent text-white overflow-hidden selection:bg-[var(--saffron)] selection:text-black min-h-screen relative">

      {/* ═══════════════════════════════════════════════════════
          DESKTOP — THE FOUR CHAPTERS
          I.   The Table (pinned restaurant storytelling)
          II.  Choose Your Kashmir (expanding doors)
          III. The Seasons (pinned time passage)
          IV.  Meet Waza (the finale)
          ═══════════════════════════════════════════════════════ */}
      {/* The chapter rail — the film's index, fixed to the right edge */}
      <ChapterRail />

      <div data-ww-chapter="I">
        <RestaurantChapters />
      </div>

      {/* Interlude — browse every table by destination (preserved functionality) */}
      <section className="hidden md:block border-t border-white/5 bg-[#050505] py-24">
        <div className="page-shell">
          <span
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
            className="text-[0.62rem] font-medium uppercase tracking-[0.44em] text-[#C8A46A]"
          >
            The full ledger
          </span>
          <h3
            style={{ fontFamily: "var(--font-bodoni)" }}
            className="mt-5 text-4xl font-semibold tracking-[-0.01em] text-white lg:text-5xl"
          >
            Every table, by <span className="italic text-[#E6C875]">destination</span>.
          </h3>
          <div className="mt-12">
            {isMounted && isDesktop && (
              <DesktopRestaurantTabs
                locationTabs={locationTabs}
                locationTabMeta={locationTabMeta}
                locationCounts={locationCounts}
                selectedLocation={selectedLocation}
                onSelectLocation={(location) => {
                  setSelectedLocation(location);
                  setIsRestaurantModalVisible(true);
                }}
              />
            )}
          </div>
        </div>
      </section>

      {/* Chapter II — the Code of the Trami: learn the manners before you eat */}
      <div data-ww-chapter="II">
        <TheManners />
      </div>

      {/* Chapter III — the handmade things the table rests on */}
      <div data-ww-chapter="III">
        <TheCraft />
      </div>

      {/* Chapter IV — the route atlas, alive */}
      <div data-ww-chapter="IV">
        <TheRoads />
      </div>

      <div data-ww-chapter="V">
        <ChooseKashmir />
      </div>
      <div data-ww-chapter="VI">
        <SeasonsJourney />
      </div>

      {/* Interlude — the journey is being recorded */}
      <PassportStrip />

      <div data-ww-chapter="VII">
        <WazaFinale />
      </div>

      {/* MOBILE: the home is a single scroll — "The Daily Trami" lives
          entirely in HomePageHero; no second snap-screen. */}

      {/* ═══════════════════════════════════════════════════════
          RESTAURANT LOCATION MODAL — preserved functionality
          ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isRestaurantModalVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-xl"
            onClick={() => setIsRestaurantModalVisible(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/20 bg-[#111111] shadow-[0_0_60px_rgba(0,0,0,0.5)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsRestaurantModalVisible(false)}
                className="absolute right-6 top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-xl text-white backdrop-blur transition hover:bg-[var(--saffron)] hover:text-black hover:border-[var(--saffron)]"
              >
                &times;
              </button>

              <div className="border-b border-white/10 bg-white/5 px-8 py-8 backdrop-blur-md">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)]">Location Dining Guide</p>
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-white">{selectedLocation || "Restaurants"}</h3>
                    <p className="mt-2 max-w-2xl text-white/60">Browse every luxury restaurant currently listed for this destination.</p>
                  </div>
                  <div className="self-start rounded-full border border-[var(--saffron)] bg-[rgba(212,175,55,0.1)] px-5 py-2 text-sm font-bold text-[var(--saffron)] shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                    {featuredRestaurants.length} Destinations
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
                {featuredRestaurants.length ? (
                  <div className="grid gap-6 lg:grid-cols-2">
                    {featuredRestaurants.map((restaurant) => (
                      <article key={restaurant._id} className="flex flex-col justify-between rounded-[24px] border border-white/10 bg-white/5 p-8 backdrop-blur transition hover:border-white/30">
                        <div>
                          <h3 className="font-display text-3xl font-medium tracking-tight text-white">
                            <Link href={`/restaurants/${restaurant.slug || restaurant._id}`} className="transition-colors hover:text-[var(--saffron)]">{restaurant.name}</Link>
                          </h3>
                          <p className="mt-2 text-sm font-medium uppercase tracking-widest text-[var(--saffron)]">{restaurant.location}</p>
                          <p className="mt-4 text-sm leading-relaxed text-white/60">{restaurant.description}</p>
                        </div>
                        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white">
                              <svg className="h-3 w-3 text-[var(--saffron)]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                              {restaurant.rating}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-widest text-white/60">{restaurant.priceLevel}</span>
                          </div>
                          <Link href={`/restaurants/${restaurant.slug || restaurant._id}`} className="text-xs font-bold uppercase tracking-widest text-[var(--saffron)] hover:text-white transition-colors">
                            View Details &rarr;
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-lg text-white/50">No dining spots found in this location.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
