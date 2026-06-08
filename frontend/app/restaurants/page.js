"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { endpoints, request } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const placeMeta = {
  Srinagar: {
    title: "Srinagar Restaurants",
    description:
      "The widest selection of Wazwan dining, from old institutions on Residency Road to busy city favorites near Lal Chowk and Dal Lake.",
    short:
      "Heritage dining rooms, city classics, and the deepest Wazwan bench."
  },
  Gulmarg: {
    title: "Gulmarg Restaurants",
    description:
      "Mountain-facing dining options for travelers who want Kashmiri food in a scenic, resort-style setting after the slopes and gondola rides.",
    short: "Scenic resort dining with mountain views and comforting Kashmiri plates."
  },
  Pahalgam: {
    title: "Pahalgam Restaurants",
    description:
      "Smaller in number than Srinagar, but useful for travelers staying near the main market and wanting warming Kashmiri meals after a day outdoors.",
    short: "Main market stops for hearty curries after a day in the valley."
  },
  Sonamarg: {
    title: "Sonamarg Restaurants",
    description:
      "Useful stops for travelers passing through Sonamarg who still want access to regional flavors and a proper meal near the mountains.",
    short: "Traveler-friendly restaurants near glacier routes and alpine viewpoints."
  }
};

const placeOrder = ["Srinagar", "Gulmarg", "Pahalgam", "Sonamarg"];

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [activeLocation, setActiveLocation] = useState(null);

  useEffect(() => {
    request(endpoints.restaurants()).then((data) => setRestaurants(data)).catch(() => null);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeLocation) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeLocation]);

  const grouped = useMemo(() => {
    const groups = Object.fromEntries(placeOrder.map((place) => [place, []]));

    restaurants.forEach((restaurant) => {
      const city = restaurant.city || "Srinagar";
      if (!groups[city]) {
        groups[city] = [];
      }
      groups[city].push(restaurant);
    });

    return groups;
  }, [restaurants]);

  return (
    <div className="wazwan-shell relative min-h-screen pb-16">
      <section className="place-hero mb-10">
        <div>
          <span className="place-eyebrow">Eat By Place</span>
          <h1>Find the right Wazwan table for each stop in Kashmir.</h1>
          <p>
            Choose a destination below to explore curated luxury dining options and local favorites.
          </p>
        </div>

        {/* 2x2 Grid of Locations */}
        <div className="jump-grid">
          {placeOrder.map((place) => (
            <button
              key={place}
              className="jump-card text-left w-full h-full cursor-pointer hover:shadow-[0_10px_40px_rgba(212,175,55,0.15)] hover:border-[var(--saffron)] transition-all bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col justify-between"
              onClick={() => setActiveLocation(place)}
            >
              <div>
                <strong className="block text-2xl font-display text-white mb-2">{place}</strong>
                <span className="block text-sm text-white/60 leading-relaxed">{placeMeta[place].short}</span>
              </div>
              <span className="block mt-6 text-[0.65rem] font-bold uppercase tracking-widest text-[var(--saffron)]">
                {(grouped[place] || []).length} Venues
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="page-shell flex justify-center">
        <Link href="/" className="wazwan-btn-primary mx-auto text-center inline-block">
          Back to Home
        </Link>
      </div>

      {/* ── Fullscreen Restaurant Modal ──────────────────────────── */}
      <AnimatePresence>
        {activeLocation && (
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

              <h2 className="font-display text-xl md:text-2xl font-medium tracking-wide text-white">
                {activeLocation} Restaurants
              </h2>

              <button
                onClick={() => setActiveLocation(null)}
                className="flex items-center justify-center h-10 w-10 rounded-full border border-white/15 bg-white/5 text-white active:scale-95 transition-transform hover:bg-white/10 hover:border-white/30"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Area - Restaurant Grid */}
            <div className="relative z-10 flex-1 overflow-y-auto px-5 py-8 no-scrollbar">
              <div className="max-w-7xl mx-auto">
                <div className="mb-10 text-center md:text-left">
                  <p className="text-[var(--saffron)] text-[0.65rem] font-bold tracking-[0.25em] uppercase mb-3">{activeLocation}</p>
                  <h3 className="text-3xl md:text-5xl lg:text-6xl font-display font-medium text-white">{placeMeta[activeLocation].title}</h3>
                  <p className="text-white/60 mt-4 max-w-2xl text-sm md:text-base mx-auto md:mx-0">{placeMeta[activeLocation].description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                  {grouped[activeLocation]?.length > 0 ? (
                    grouped[activeLocation].map((restaurant) => (
                      <Link href={`/restaurants/${restaurant._id}`} key={restaurant._id} passHref>
                        <motion.a
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -5 }}
                          className="block h-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 flex flex-col shadow-lg transition-colors hover:border-[var(--saffron)] group"
                        >
                          <div className="relative h-48 w-full overflow-hidden bg-black/50">
                            {restaurant.image && (
                              <img
                                src={restaurant.image}
                                alt={restaurant.name}
                                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[0.7rem] font-bold text-[var(--saffron)] backdrop-blur-md">
                              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {restaurant.rating}
                            </div>
                            {restaurant.authentic && (
                              <div className="absolute top-3 right-3 rounded-full border border-[var(--saffron)] bg-black/40 px-2.5 py-1 text-[0.6rem] font-bold text-[var(--saffron)] backdrop-blur-md uppercase tracking-wider">
                                Authentic Pick
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-1 flex-col p-5">
                            <h3 className="font-display text-xl font-medium text-white group-hover:text-[var(--saffron)] transition-colors line-clamp-1">
                              {restaurant.name}
                            </h3>
                            <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-wider text-white/50">
                              {restaurant.priceLevel} • {restaurant.location}
                            </p>
                            <p className="mt-3 text-sm text-white/60 line-clamp-2 leading-relaxed">
                              {restaurant.description}
                            </p>
                          </div>
                        </motion.a>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full py-16 border border-white/10 rounded-3xl bg-white/5 text-center px-4">
                      <p className="text-[var(--saffron)] uppercase tracking-widest text-[0.65rem] font-bold mb-3">Coming Soon</p>
                      <p className="text-white/60 text-sm max-w-md mx-auto leading-relaxed">This destination section is ready for expansion. More luxury dining experiences will be added here shortly.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
