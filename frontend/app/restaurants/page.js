"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

const cityCoordinates = {
  Srinagar: { lat: 34.0837, lon: 74.7973 },
  Gulmarg: { lat: 34.0484, lon: 74.3805 },
  Pahalgam: { lat: 34.0150, lon: 75.3150 },
  Sonamarg: { lat: 34.3031, lon: 75.2952 }
};

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getClosestCity(userLat, userLon) {
  let minDistance = Infinity;
  let closest = "Srinagar";
  for (const [city, coords] of Object.entries(cityCoordinates)) {
    const dist = getDistanceFromLatLonInKm(userLat, userLon, coords.lat, coords.lon);
    if (dist < minDistance) {
      minDistance = dist;
      closest = city;
    }
  }
  return closest;
}

function RestaurantsPageContent() {
  const searchParams = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [activeLocation, setActiveLocation] = useState(null);
  const [error, setError] = useState(null);
  const [locating, setLocating] = useState(false);

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        const { latitude, longitude } = position.coords;
        const closest = getClosestCity(latitude, longitude);
        setActiveLocation(closest);
      },
      (err) => {
        setLocating(false);
        setError("Unable to retrieve your location. Please check your permissions.");
      }
    );
  };

  // Initialize activeLocation from query params
  useEffect(() => {
    const locParam = searchParams.get('location');
    if (locParam) {
      // Find case-insensitive match from placeOrder
      const match = placeOrder.find(p => p.toLowerCase() === locParam.toLowerCase());
      if (match) {
        setActiveLocation(match);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    request(endpoints.restaurants())
      .then((data) => setRestaurants(data))
      .catch((err) => {
        console.error("Failed to fetch restaurants:", err);
        setError("Failed to load restaurants. Please check your connection or try again later.");
      });
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeLocation) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // Optional: Clear the query param when closing the modal
      if (searchParams.get('location')) {
        window.history.replaceState(null, '', '/restaurants');
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeLocation, searchParams]);

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
    <div className="relative min-h-screen bg-[#0A0A0A] overflow-y-auto overflow-x-hidden flex flex-col justify-start pt-28 md:pt-32 px-6">
      
      {/* Removed expensive CSS blur element to fix lag */}

      <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col gap-8 pb-16">
        <div>
          <h1 className="font-display font-black text-white text-[3rem] leading-[1.05] tracking-tight mb-3">
            Find the <br/>best Wazwan <br/><span className="text-[#555]">near you.</span>
          </h1>
          <p className="text-[#888] text-[0.85rem] leading-relaxed max-w-[260px]">
            Discover luxury dining options and local favorites based on your location.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Link href="/dishes" className="block">
            <div className="bg-[#111] rounded-[24px] p-6 h-[130px] flex flex-col justify-between hover:bg-[#161616] transition-colors border border-transparent hover:border-white/5 shadow-lg group">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:bg-[var(--saffron)] group-hover:text-black transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-[1.15rem]">Explore traditional wazwan</h3>
                <p className="text-[#666] text-[0.7rem] mt-1">Discover the 36-course royal feast</p>
              </div>
            </div>
          </Link>

          <button onClick={handleNearMe} disabled={locating} className="text-left w-full">
            <div className="bg-[#111] rounded-[24px] p-6 h-[130px] flex flex-col justify-between hover:bg-[#161616] transition-colors border border-transparent hover:border-[var(--saffron)]/30 shadow-lg group relative overflow-hidden">
              {/* Highlight gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--saffron)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="relative z-10 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:bg-[var(--saffron)] group-hover:text-black transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <h3 className="font-display font-bold text-white text-[1.15rem]">{locating ? "Locating..." : "Find restaurants near me"}</h3>
                  <p className="text-[#666] text-[0.7rem] mt-1">Uses GPS to find closest venues</p>
                </div>
                {locating && (
                  <svg className="animate-spin h-5 w-5 text-[var(--saffron)] mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ── Fullscreen Restaurant Modal ──────────────────────────── */}
      <AnimatePresence>
        {activeLocation && (
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
                onClick={() => setActiveLocation(null)}
                className="flex items-center gap-2 text-white/80 hover:text-[var(--saffron)] transition-colors relative z-20"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] mt-0.5">Back</span>
              </button>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <h2 className="font-display text-lg md:text-2xl font-medium tracking-wide text-white">
                  {activeLocation} Restaurants
                </h2>
              </div>
            </div>

            {/* Content Area - Restaurant Grid */}
            <div className="relative z-10 flex-1 overflow-y-auto px-5 py-8 no-scrollbar">
              <div className="max-w-7xl mx-auto">
                <div className="mb-10 text-center md:text-left">
                  <p className="text-[var(--saffron)] text-[0.65rem] font-bold tracking-[0.25em] uppercase mb-3">{activeLocation}</p>
                  <h3 className="text-3xl md:text-5xl lg:text-6xl font-display font-medium text-white">{placeMeta[activeLocation].title}</h3>
                  <p className="text-white/60 mt-4 max-w-2xl text-sm md:text-base mx-auto md:mx-0">{placeMeta[activeLocation].description}</p>
                </div>

                <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 pb-20">
                  {error ? (
                    <div className="col-span-full py-16 text-center px-4">
                      <p className="text-red-400 text-sm max-w-md mx-auto leading-relaxed">{error}</p>
                    </div>
                  ) : grouped[activeLocation]?.length > 0 ? (
                    grouped[activeLocation].map((restaurant) => (
                      <Link href={`/restaurants/${restaurant.slug || restaurant._id}`} key={restaurant._id} passHref legacyBehavior>
                        <motion.a
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -5 }}
                          className="block h-full overflow-hidden rounded-xl md:rounded-2xl border border-white/10 bg-white/5 flex flex-col shadow-lg transition-colors hover:border-[var(--saffron)] group"
                        >
                          <div className="relative h-24 sm:h-32 w-full overflow-hidden bg-black/50">
                            {restaurant.image ? (
                              <picture>
                                <source media="(max-width: 768px)" srcSet={restaurant.image ? restaurant.image.replace('-800.avif', '-400.avif') : ''} />
                                <img
                                  src={restaurant.image}
                                  alt={restaurant.name}
                                  className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                                />
                              </picture>
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-white/5 transition duration-700 group-hover:bg-white/10">
                                <svg className="w-12 h-12 md:w-16 md:h-16 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                </svg>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                              <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 flex items-center gap-0.5 rounded bg-black/80 px-1 py-0.5 md:px-1.5 md:py-0.5 text-[0.55rem] md:text-[0.65rem] font-bold text-[var(--saffron)] backdrop-blur-md">
                                <svg className="h-2 w-2 md:h-2.5 md:w-2.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {restaurant.rating}
                              </div>
                            {restaurant.authentic && (
                              <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 rounded-full border border-[var(--saffron)] bg-black/60 px-1 py-0.5 md:px-1.5 md:py-0.5 text-[0.4rem] md:text-[0.5rem] font-bold text-[var(--saffron)] backdrop-blur-md uppercase tracking-wider">
                                Authentic
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-1 flex-col p-2 sm:p-3 justify-between">
                            <div>
                              <h3 className="font-display text-xs sm:text-sm md:text-base font-medium text-white group-hover:text-[var(--saffron)] transition-colors truncate">
                                {restaurant.name}
                              </h3>
                              <p className="mt-0.5 md:mt-1 text-[0.45rem] md:text-[0.55rem] font-bold uppercase tracking-wider text-white/50 truncate">
                                {restaurant.location}
                              </p>
                              
                              {(restaurant.phoneNumber || restaurant.openingHours || restaurant.website) && (
                                <div className="mt-1 md:mt-1.5 flex flex-col gap-0.5 text-[0.45rem] md:text-[0.55rem] text-white/70">
                                  {restaurant.phoneNumber && (
                                    <div className="flex items-center gap-1">
                                      <svg className="w-2 h-2 md:w-2.5 md:h-2.5 text-[var(--saffron)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                      </svg>
                                      <span className="truncate">{restaurant.phoneNumber}</span>
                                    </div>
                                  )}
                                  {restaurant.website && (
                                    <div className="flex items-center gap-1">
                                      <svg className="w-2 h-2 md:w-2.5 md:h-2.5 text-[var(--saffron)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                      </svg>
                                      <span className="truncate">{restaurant.website}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
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

export default function RestaurantsPage() {
  return (
    <Suspense fallback={<div className="wazwan-shell relative min-h-screen pb-16 flex items-center justify-center text-white/50">Loading restaurants...</div>}>
      <RestaurantsPageContent />
    </Suspense>
  );
}
