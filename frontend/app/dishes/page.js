"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { endpoints, request } from "@/lib/api";

function DishesPageContent() {
  const searchParams = useSearchParams();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    searchQuery: searchParams.get("search") || "",
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    setFilters({
      searchQuery: searchParams.get("search") || "",
    });
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    const search = searchParams.get("search");

    if (filters.searchQuery) params.set("search", filters.searchQuery);

    setLoading(true);
    setError(null);
    request(endpoints.dishes(`?${params.toString()}`))
      .then((data) => setDishes(data))
      .catch((err) => {
        console.error("Failed to fetch dishes:", err);
        setError("Failed to load dishes. Please check your connection or try again later.");
      })
      .finally(() => setLoading(false));
  }, [filters, searchParams]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (dishes.length > 0) {
      const rjIndex = dishes.findIndex(d => d.name.toLowerCase().includes("rogan josh"));
      if (rjIndex !== -1) {
        setCurrentIndex(rjIndex);
      }
    }
  }, [dishes]);

  useEffect(() => {
    if (isExpanded || filters.searchQuery || dishes.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % dishes.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isExpanded, filters.searchQuery, dishes.length]);

  const singleDish = dishes.length > 0 ? [dishes[currentIndex]] : [];
  const dishesToShow = filters.searchQuery ? dishes : singleDish;

  return (
    <div className="wazwan-shell">
      <section className="place-hero">
        <div>
          <span className="place-eyebrow">The Wazwan</span>
          <h1>Signature dishes from Kashmir&apos;s ceremonial table.</h1>
        </div>

        <div className="jump-grid">
          <div className="jump-card">
            <strong>Search by Name</strong>
            <span>Type a dish name in the search bar below to jump directly to a favorite.</span>
          </div>
        </div>
      </section>

      <section className="places-wrap pt-0 md:-mt-8">
        <div className="place-section border-t-0 pt-0">
          <div className="rounded-[20px] border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative z-10">
            <input
              value={filters.searchQuery}
              onChange={(event) => setFilters({ searchQuery: event.target.value })}
              placeholder="Search dishes..."
              className="w-full rounded-xl border border-white/10 bg-black/40 text-white/90 placeholder-white/30 px-4 py-3 text-sm outline-none focus:border-[var(--saffron)] transition-colors"
            />
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              <p className="text-[var(--muted)]">Loading dishes...</p>
            ) : error ? (
              <p className="text-red-400">{error}</p>
            ) : dishesToShow.length === 0 ? (
              <p className="text-[var(--muted)]">No dishes found matching your search.</p>
            ) : (
              <AnimatePresence mode="popLayout">
                {dishesToShow.map((dish) => (
                  <motion.article 
                    key={dish._id} 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="wazwan-dish-card"
                  >
                    <img src={dish.image} alt={dish.name} className="h-56 w-full object-cover" />
                    <div className="p-6">
                      <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[var(--saffron)]">
                        {dish.category}
                      </p>
                      <h3 className="font-display mt-2 text-2xl text-[var(--walnut)]">{dish.name}</h3>
                      <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{dish.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="place-badge">{dish.foodType}</span>
                        <span className="place-badge">{dish.spiceLevel}</span>
                        <span className="place-badge">{dish.priceRange}</span>
                      </div>
                      <div className="mt-6">
                        <Link href={`/dishes/${dish._id}`} className="wazwan-btn-primary inline-flex">
                          View dish
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            )}
          </div>
          
          {!filters.searchQuery && dishes.length > 1 && (
            <div className="mt-12 flex justify-center">
              <button onClick={() => setIsExpanded(true)} className="rounded-full bg-[var(--saffron)] px-8 py-3 text-sm font-bold uppercase tracking-widest text-black shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-transform hover:scale-105 active:scale-95">
                Explore Dishes
              </button>
            </div>
          )}
          
          <div className="jump-grid mt-16 pt-8 border-t border-white/10">
            <div className="jump-card">
              <strong>Spot the Classics</strong>
              <span>Rogan Josh, Gushtaba, Rista, and Tabak Maaz are your essential starting points.</span>
            </div>
            <div className="jump-card">
              <strong>Match Your Taste</strong>
              <span>Look for food type, spice level, and price range before planning the meal.</span>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl bg-[#111] border border-white/10 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 md:px-10 border-b border-white/10 bg-black/40">
                <div>
                  <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--saffron)]">The Wazwan</span>
                  <h2 className="mt-1 text-2xl md:text-3xl font-display text-white">All Signature Dishes</h2>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="rounded-full p-3 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all hover:rotate-90 active:scale-90"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 md:p-10 overflow-y-auto flex-1">
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                  {dishes.map((dish) => (
                    <article key={dish._id} className="group overflow-hidden rounded-[20px] border border-white/10 bg-white/5 shadow-xl transition-all hover:border-[var(--saffron)] hover:shadow-[0_10px_40px_rgba(212,175,55,0.15)] flex flex-col">
                      <div className="relative h-40 shrink-0 overflow-hidden">
                        <img src={dish.image} alt={dish.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[var(--saffron)]">
                            {dish.category}
                          </p>
                          <h3 className="font-display mt-2 text-xl text-white">{dish.name}</h3>
                          <p className="mt-2 text-xs leading-5 text-white/60 line-clamp-3">{dish.description}</p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center">
                          <Link href={`/dishes/${dish._id}`} className="text-xs font-bold uppercase tracking-widest text-white transition-colors group-hover:text-[var(--saffron)]">
                            View details &rarr;
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DishesPage() {
  return (
    <Suspense
      fallback={<div className="places-wrap py-24 text-[var(--muted)]">Loading dishes...</div>}
    >
      <DishesPageContent />
    </Suspense>
  );
}
