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

  // Close modal when navigating via MobileNav (e.g., Home button)
  useEffect(() => {
    const handleCloseAll = () => setIsModalOpen(false);
    window.addEventListener('close-all-modals', handleCloseAll);
    return () => window.removeEventListener('close-all-modals', handleCloseAll);
  }, []);

  const handleLocationClick = (location) => {
    setActiveLocation(location);
    setIsModalOpen(true);
  };

  const filteredRestaurants = activeLocation
    ? restaurants.filter((r) => (r.city || "Srinagar") === activeLocation)
    : [];

  return (
    <div className="space-y-4 relative px-2">
      {/* ── Inline 2x2 Location Grid ─────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 pb-4">
        {locationTabs.map((location, i) => {
          const count = locationCounts[location] || 0;
          const locationImages = {
            Srinagar: "/images/Destinations/Srinagar.jpg",
            Gulmarg: "/images/Destinations/Gulmarg.jpg",
            Pahalgam: "/images/Destinations/Pahalgam.jpg",
            Sonamarg: "/images/Destinations/Sonmarg.jpg"
          };
          const imgUrl = locationImages[location] || "/wazwan-hero.jpg";

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
              <div className="absolute inset-0 z-0 opacity-50">
                 <img src={imgUrl} loading="lazy" decoding="async" className="w-full h-full object-cover brightness-75" alt="" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/40 to-transparent" />
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

      {/* ── Fullscreen Restaurant Modal ──────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 flex flex-col bg-[#0B0B0B] pt-[72px] md:pt-20 overflow-hidden"
          >
            {/* Dark glassmorphic background elements */}
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.08),transparent_50%)]" />

            {/* Header */}
            <div className="relative z-10 flex items-center px-4 md:px-6 py-4 border-b border-white/10 bg-[#0B0B0B]/90 backdrop-blur-xl">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex items-center gap-2 text-white/80 hover:text-[var(--saffron)] transition-colors relative z-20"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] mt-0.5">Back</span>
              </button>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <h2 className="font-display text-lg font-medium tracking-wide text-white">
                  {activeLocation} Restaurants
                </h2>
              </div>
            </div>

            {/* Content Area - 3 Column Grid */}
            <div className="relative z-10 flex-1 overflow-y-auto px-2 sm:px-5 py-6 no-scrollbar">
              <div className="grid grid-cols-3 gap-2 pb-10">
                {filteredRestaurants.map((restaurant, i) => (
                  <Link href={`/restaurants/${restaurant.slug || restaurant._id}`} key={restaurant._id} passHref legacyBehavior>
                    <motion.a
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      whileTap={{ scale: 0.96 }}
                      className="block h-full overflow-hidden rounded-xl border border-white/10 bg-white/5 flex flex-col shadow-lg"
                    >
                      <div className="relative h-24 w-full overflow-hidden bg-black/50">
                        {restaurant.image && (
                          <img
                            src={restaurant.image}
                            alt={restaurant.name}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 rounded bg-black/80 px-1 py-0.5 text-[0.55rem] font-bold text-[var(--saffron)] backdrop-blur-md">
                          <StarIcon />
                          {restaurant.rating}
                        </div>
                      </div>
                      
                      <div className="flex flex-1 flex-col p-2">
                        <h3 className="font-display text-xs font-medium text-white line-clamp-1 truncate">
                          {restaurant.name}
                        </h3>
                        <p className="mt-0.5 text-[0.45rem] font-medium uppercase tracking-wider text-white/50 truncate">
                          {restaurant.cuisineType || "Kashmiri Cuisine"}
                        </p>
                      </div>
                    </motion.a>
                  </Link>
                ))}
                {filteredRestaurants.length === 0 && (
                  <div className="col-span-3 py-10 text-center text-white/50 text-sm">
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
