"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─── chevron icon ─────────────────────────────────────────────────
function ChevronIcon({ open }) {
  return (
    <motion.svg
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0 text-[var(--saffron)]"
    >
      <path d="M6 9l6 6 6-6" />
    </motion.svg>
  );
}

// ─── small location pin icon ──────────────────────────────────────
function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
    >
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

// ─── star icon ───────────────────────────────────────────────────
function StarIcon() {
  return (
    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

// ─── main component ───────────────────────────────────────────────
export default function MobileRestaurantSelector({
  locationTabs,
  locationTabMeta,
  locationCounts,
  restaurants,
}) {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const selectorRef = useRef(null);
  const resultsRef = useRef(null);

  // Close dropdown when tapping outside
  useEffect(() => {
    if (!selectorOpen) return;
    const handler = (e) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target)) {
        setSelectorOpen(false);
      }
    };
    document.addEventListener("touchstart", handler, { passive: true });
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("mousedown", handler);
    };
  }, [selectorOpen]);

  const handleLocationPick = (location) => {
    setSelectedLocation(location);
    setSelectorOpen(false);
    // Smooth scroll to restaurant list after short delay
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  const filteredRestaurants = selectedLocation
    ? restaurants.filter((r) => (r.city || "Srinagar") === selectedLocation)
    : [];

  return (
    <div className="space-y-6">
      {/* ── Selector trigger button ─────────────────────────────── */}
      <div ref={selectorRef} className="relative">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectorOpen((v) => !v)}
          className={`relative w-full overflow-hidden rounded-[1.5rem] border transition-all duration-500 text-left ${
            selectorOpen
              ? "border-[rgba(212,175,55,0.6)] shadow-[0_0_30px_rgba(212,175,55,0.15)]"
              : "border-white/10 hover:border-white/30"
          }`}
          aria-expanded={selectorOpen}
          aria-haspopup="listbox"
        >
          {/* Background Image & Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/wazwan-hero.png"
              alt="Background"
              className="w-full h-full object-cover object-center opacity-60 scale-105"
            />
            {/* Gradient fading to black on the left and bottom */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/90 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/60 to-transparent" />
          </div>

          <div className="relative z-10 px-6 py-7">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Fork/Spoon icon in gold outline circle */}
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[var(--saffron)] text-[var(--saffron)] bg-[#0B0B0B]/50 backdrop-blur-sm"
                >
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
                    {selectedLocation ?? "Explore Restaurants"}
                  </p>
                  <p className="mt-1 text-[0.75rem] font-normal leading-snug text-white/60 tracking-wide max-w-[180px]">
                    {selectedLocation 
                      ? `${locationCounts[selectedLocation] || 0} venues available` 
                      : "Discover exceptional dining across Kashmir's finest locations"}
                  </p>
                </div>
              </div>

              {/* Right Arrow in circle */}
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all ${selectorOpen ? "border-[var(--saffron)] text-[var(--saffron)]" : "border-white/20 text-white/80 bg-white/5"} backdrop-blur-sm`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`h-5 w-5 transition-transform duration-300 ${selectorOpen ? "rotate-90" : "rotate-0"}`} strokeLinecap="round" strokeLinejoin="round">
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

        {/* ── Dropdown panel ────────────────────────────────────── */}
        <AnimatePresence>
          {selectorOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "top" }}
              role="listbox"
              className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 overflow-hidden rounded-2xl border border-white/15 bg-[rgba(11,11,11,0.92)] shadow-[0_24px_64px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
            >
              {/* Glass shimmer line */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--saffron)] to-transparent opacity-30" />

              <div className="p-2">
                {locationTabs.map((location, i) => {
                  const isSelected = selectedLocation === location;
                  const count = locationCounts[location] || 0;
                  const icon = locationTabMeta[location]?.icon;

                  return (
                    <motion.button
                      key={location}
                      role="option"
                      aria-selected={isSelected}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.22, delay: i * 0.05 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleLocationPick(location)}
                      className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left transition-all duration-200 ${
                        isSelected
                          ? "bg-[rgba(212,175,55,0.12)] text-white"
                          : "text-white/80 hover:bg-white/5 active:bg-white/10"
                      }`}
                    >
                      {/* Miniaturized location icon */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border transition-colors ${
                          isSelected
                            ? "border-[var(--saffron)] bg-[var(--saffron)] text-black"
                            : "border-white/10 bg-white/5 text-white/50"
                        }`}
                      >
                        <div className="scale-75">{icon}</div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-display text-base font-semibold ${
                            isSelected ? "text-white" : "text-white/90"
                          }`}
                        >
                          {location}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-[0.68rem] font-medium uppercase tracking-widest text-[var(--saffron)]">
                          <PinIcon />
                          {count} {count === 1 ? "venue" : "venues"}
                        </p>
                      </div>

                      {/* Check mark when selected */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--saffron)]"
                        >
                          <svg
                            viewBox="0 0 12 12"
                            fill="none"
                            className="h-3 w-3"
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="black"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Bottom shimmer */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--saffron)] to-transparent opacity-30" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Restaurant results ────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {selectedLocation && (
          <motion.div
            ref={resultsRef}
            key={selectedLocation}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Location header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[var(--saffron)]">
                  Now Exploring
                </p>
                <h3 className="font-display text-2xl font-semibold text-white">
                  {selectedLocation}
                </h3>
              </div>
              <span className="rounded-full border border-[var(--saffron)] bg-[rgba(212,175,55,0.08)] px-3 py-1 text-xs font-bold text-[var(--saffron)]">
                {filteredRestaurants.length}{" "}
                {filteredRestaurants.length === 1 ? "Venue" : "Venues"}
              </span>
            </div>

            {/* Cards */}
            {filteredRestaurants.length > 0 ? (
              <div className="space-y-4">
                {filteredRestaurants.map((restaurant, i) => (
                  <motion.article
                    key={restaurant._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
                  >
                    {/* Cover image */}
                    {restaurant.image && (
                      <div className="relative h-44 w-full overflow-hidden">
                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="h-full w-full object-cover"
                        />
                        {/* Rating badge */}
                        <div className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full border border-[var(--saffron)] bg-black/60 px-2.5 py-1 text-xs font-bold text-[var(--saffron)] backdrop-blur-md">
                          <StarIcon />
                          {restaurant.rating}
                        </div>
                      </div>
                    )}

                    <div className="p-5">
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[var(--saffron)]">
                        {restaurant.location?.split(",")[0]}
                      </p>
                      <h4 className="mt-1 font-display text-xl font-semibold text-white">
                        {restaurant.name}
                      </h4>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/55">
                        {restaurant.description}
                      </p>

                      {/* Dish tags */}
                      {(restaurant.linkedDishes || []).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {(restaurant.linkedDishes || []).slice(0, 3).map((dish) => (
                            <span
                              key={dish._id}
                              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-widest text-white/70"
                            >
                              {dish.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-white/40">
                          {restaurant.priceLevel}
                        </span>
                        <Link
                          href={`/restaurants/${restaurant.slug || restaurant._id}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--saffron)] px-5 py-2 text-xs font-bold uppercase tracking-widest text-black transition-transform active:scale-95"
                        >
                          View
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-12">
                <p className="text-sm text-white/40">
                  {selectedLocation?.toLowerCase() === "srinagar" 
                    ? "No restaurants listed for Srinagar yet" 
                    : `No venues listed yet for ${selectedLocation}.`}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
