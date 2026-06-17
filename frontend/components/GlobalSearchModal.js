"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Search, X, Utensils, MapPin, ArrowRight, Loader2 } from "lucide-react";
import { endpoints, request } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";

export default function GlobalSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ dishes: [], restaurants: [] });
  const [error, setError] = useState(null);
  
  const inputRef = useRef(null);

  // Trigger modal on "open-search" event
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setQuery("");
      setResults({ dishes: [], restaurants: [] });
      setError(null);
    };
    window.addEventListener("open-search", handleOpen);
    return () => window.removeEventListener("open-search", handleOpen);
  }, []);

  // Autofocus search input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Intercept physical back press to close search modal
  useEffect(() => {
    if (!isOpen) return;

    const handleBackPress = (e) => {
      e.preventDefault();
      setIsOpen(false);
    };

    window.addEventListener("hardware-back-press", handleBackPress);
    return () => window.removeEventListener("hardware-back-press", handleBackPress);
  }, [isOpen]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Fetch results when debounced query changes
  useEffect(() => {
    const fetchResults = async () => {
      const trimmed = debouncedQuery.trim();
      if (trimmed.length < 2) {
        setResults({ dishes: [], restaurants: [] });
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const searchParam = `?search=${encodeURIComponent(trimmed)}`;
        
        // Fetch dishes and restaurants in parallel
        const [dishesRes, restaurantsRes] = await Promise.all([
          request(endpoints.dishes(searchParam)).catch(err => {
            console.error("Failed to fetch dishes in search:", err);
            return [];
          }),
          request(endpoints.restaurants(searchParam)).catch(err => {
            console.error("Failed to fetch restaurants in search:", err);
            return [];
          })
        ]);

        setResults({
          dishes: Array.isArray(dishesRes) ? dishesRes : [],
          restaurants: Array.isArray(restaurantsRes) ? restaurantsRes : []
        });
      } catch (err) {
        console.error("Search API error:", err);
        setError("Something went wrong while searching. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  const handleTrendingClick = (trendingSearch) => {
    setQuery(trendingSearch);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const trendingKeywords = [
    "Rogan Josh",
    "Gushtaba",
    "Kabab",
    "Ahdoos",
    "Chai Jaai",
    "Tabak Maaz",
    "Yakhni",
    "Mummy Please"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col bg-[#0B0B0B]/98 backdrop-blur-xl"
        >
          {/* Header Search Bar */}
          <div className="border-b border-white/5 px-4 py-4 sm:px-6">
            <div className="mx-auto flex max-w-3xl items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search dishes or restaurants..."
                  className="w-full rounded-full border border-white/10 bg-white/5 py-4 pl-12 pr-6 text-base text-white placeholder-white/40 outline-none transition duration-300 focus:border-[#C8A46A] focus:bg-white/10"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 p-3 text-white/70 transition duration-300 hover:bg-white/10 hover:text-white"
                aria-label="Close search"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            <div className="mx-auto max-w-3xl">
              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Empty state: Trending Searches */}
              {query.trim().length < 2 && !loading && (
                <div className="space-y-6 py-4">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#C8A46A]">
                      Trending Searches
                    </h3>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {trendingKeywords.map((keyword) => (
                        <button
                          key={keyword}
                          onClick={() => handleTrendingClick(keyword)}
                          className="rounded-full border border-white/5 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition duration-300 hover:border-[#C8A46A]/40 hover:bg-[#C8A46A]/10 hover:text-white"
                        >
                          {keyword}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex flex-col items-center justify-center py-20 text-white/50">
                  <Loader2 className="h-8 w-8 animate-spin text-[#C8A46A]" />
                  <p className="mt-4 text-sm">Searching authentic Kashmiri flavours...</p>
                </div>
              )}

              {/* Query populated: Search Results */}
              {query.trim().length >= 2 && !loading && (
                <div className="space-y-8">
                  {results.dishes.length === 0 && results.restaurants.length === 0 ? (
                    <div className="py-20 text-center text-white/45">
                      <p className="text-lg font-medium">No results found</p>
                      <p className="mt-2 text-sm">We couldn't find any dishes or restaurants matching "{query}"</p>
                    </div>
                  ) : null}

                  {/* Dishes Section */}
                  {results.dishes.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#C8A46A] px-1">
                        Dishes ({results.dishes.length})
                      </h3>
                      <div className="grid gap-2">
                        {results.dishes.map((dish) => (
                          <Link
                            key={dish._id}
                            href={`/dishes/${dish.slug || dish._id}`}
                            onClick={() => setIsOpen(false)}
                            className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-3 transition duration-300 hover:border-[#C8A46A]/30 hover:bg-[#C8A46A]/5"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-white/5">
                                {dish.image ? (
                                  <img
                                    src={dish.image}
                                    alt={dish.name}
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-white/20">
                                    <Utensils className="h-5 w-5" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-white group-hover:text-[#C8A46A] transition-colors">
                                  {dish.name}
                                </h4>
                                <p className="text-xs text-white/45 mt-0.5">
                                  {dish.category} • {dish.foodType}
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-white/25 transition duration-300 group-hover:translate-x-1 group-hover:text-[#C8A46A]" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Restaurants Section */}
                  {results.restaurants.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#C8A46A] px-1">
                        Restaurants ({results.restaurants.length})
                      </h3>
                      <div className="grid gap-2">
                        {results.restaurants.map((rest) => (
                          <Link
                            key={rest._id}
                            href={`/restaurants/${rest.slug || rest._id}`}
                            onClick={() => setIsOpen(false)}
                            className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-3 transition duration-300 hover:border-[#C8A46A]/30 hover:bg-[#C8A46A]/5"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-white/5">
                                {rest.image ? (
                                  <img
                                    src={rest.image}
                                    alt={rest.name}
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-white/20">
                                    <MapPin className="h-5 w-5" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-white group-hover:text-[#C8A46A] transition-colors">
                                  {rest.name}
                                </h4>
                                <p className="text-xs text-white/45 mt-0.5">
                                  {rest.location}
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-white/25 transition duration-300 group-hover:translate-x-1 group-hover:text-[#C8A46A]" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}