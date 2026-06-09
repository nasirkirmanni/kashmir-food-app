"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { endpoints, request } from "@/lib/api";

function DishesPageContent() {
  const searchParams = useSearchParams();
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
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
            ) : dishes.length === 0 ? (
              <p className="text-[var(--muted)]">No dishes found matching your search.</p>
            ) : (
              dishes.map((dish) => (
                <article key={dish._id} className="wazwan-dish-card">
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
                </article>
              ))
            )}
          </div>
          
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
