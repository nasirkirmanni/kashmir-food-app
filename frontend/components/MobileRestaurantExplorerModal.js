"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─── star icon ───────────────────────────────────────────────────
function StarIcon() {
  return (
    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export default function MobileRestaurantExplorerModal({
  locationTabs,
  locationTabMeta,
  locationCounts,
  restaurants,
}) {
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [activeLocation, setActiveLocation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  const handleLocationClick = (location) => {
    setActiveLocation(location);
    setIsModalOpen(true);
  };

  const filteredRestaurants = activeLocation
    ? restaurants.filter((r) => (r.city || "Srinagar") === activeLocation)
    : [];

  return (
    <div className="space-y-4 relative">
      {/* ── Trigger Button ────────────────── */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsGridOpen(!isGridOpen)}
        className={`relative w-full overflow-hidden rounded-[1.5rem] border transition-all duration-500 text-left ${
          isGridOpen
            ? "border-[rgba(212,175,55,0.6)] shadow-[0_0_30px_rgba(212,175,55,0.15)]"
            : "border-white/10 hover:border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        }`}
      >
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/wazwan-hero.png"
            alt="Background"
            className="w-full h-full object-cover object-center opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/60 to-transparent" />
        </div>

        <div className="relative z-10 px-6 py-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Fork/Spoon icon in gold outline circle */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--saffron)] text-[var(--saffron)] bg-[#0B0B0B]/50 backdrop-blur-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20" />
                  <path d="M17 2v20" />
                  <path d="M22 2v20" />
                  <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                  <path d="M7 2v20" />
                </svg>
              </div>

              <div>
                <p className="font-display text-2xl font-normal text-white tracking-wide">
                  Explore Restaurants
                </p>
                <p className="mt-1 text-[0.75rem] font-normal leading-snug text-white/60 tracking-wide max-w-[180px]">
                  Discover exceptional dining across Kashmir&apos;s finest locations
                </p>
              </div>
            </div>

            {/* Right Arrow (rotates when open) */}
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all ${isGridOpen ? "border-[var(--saffron)] text-[var(--saffron)] rotate-90" : "border-white/20 text-white/80 bg-white/5"} backdrop-blur-sm`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Bottom locations row */}
          <div className="mt-5 pt-4 border-t border-white/10 w-full text-center">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)]">
              Srinagar • Gulmarg • Pahalgam • Sonamarg
            </p>
          </div>
        </div>
      </motion.button>

      {/* ── Inline 2x2 Location Grid ─────────────────────────────── */}
      <AnimatePresence>
        {isGridOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 pt-2 pb-4">
              {locationTabs.map((location, i) => {
                const count = locationCounts[location] || 0;
                return (
                  <motion.button
                    key={location}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleLocationClick(location)}
                    className="relative flex flex-col items-center justify-center h-32 rounded-[1.2rem] border border-white/10 bg-white/5 overflow-hidden shadow-lg"
                  >
                    <div className="absolute inset-0 z-0 opacity-40">
                       <img src={`/wazwan-hero.png`} className="w-full h-full object-cover grayscale brightness-50 mix-blend-overlay" alt="" />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/50 to-transparent" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="mb-2 h-8 w-8 flex items-center justify-center rounded-full bg-[var(--saffron)] text-black">
                        <div className="scale-75">{locationTabMeta[location]?.icon}</div>
                      </div>
                      <span className="font-display text-lg font-medium text-white">{location}</span>
                      <span className="mt-1 text-[0.6rem] font-bold uppercase tracking-widest text-[var(--saffron)]">
                        {count} Venues
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Fullscreen Restaurant Modal ──────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex flex-col bg-[#0B0B0B] overflow-hidden"
          >
            {/* Dark glassmorphic background elements */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.08),transparent_50%)]" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#0B0B0B]/80 backdrop-blur-xl">
              <div className="h-10 w-10" /> {/* Spacer for centering */}

              <h2 className="font-display text-xl font-medium tracking-wide text-white">
                {activeLocation} Restaurants
              </h2>

              <button
                onClick={() => setIsModalOpen(false)}
                className="flex items-center justify-center h-10 w-10 rounded-full border border-white/15 bg-white/5 text-white active:scale-95 transition-transform"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Area - 2 Column Grid */}
            <div className="relative z-10 flex-1 overflow-y-auto px-5 py-6 no-scrollbar">
              <div className="grid grid-cols-2 gap-4 pb-10">
                {filteredRestaurants.map((restaurant, i) => (
                  <Link href={`/restaurants/${restaurant._id}`} key={restaurant._id} passHref>
                    <motion.a
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      whileTap={{ scale: 0.96 }}
                      className="block h-full overflow-hidden rounded-[1.2rem] border border-white/10 bg-white/5 flex flex-col shadow-lg"
                    >
                      <div className="relative h-32 w-full overflow-hidden bg-black/50">
                        {restaurant.image && (
                          <img
                            src={restaurant.image}
                            alt={restaurant.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[0.65rem] font-bold text-[var(--saffron)] backdrop-blur-md">
                          <StarIcon />
                          {restaurant.rating}
                        </div>
                      </div>
                      
                      <div className="flex flex-1 flex-col p-3">
                        <h3 className="font-display text-sm font-medium text-white line-clamp-1">
                          {restaurant.name}
                        </h3>
                        <p className="mt-1 text-[0.6rem] font-medium uppercase tracking-wider text-white/50">
                          {restaurant.cuisineType || "Kashmiri Cuisine"}
                        </p>
                      </div>
                    </motion.a>
                  </Link>
                ))}
                {filteredRestaurants.length === 0 && (
                  <div className="col-span-2 py-10 text-center text-white/50 text-sm">
                    No venues available in this location yet.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
