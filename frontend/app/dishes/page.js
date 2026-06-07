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
    category: searchParams.get("category") || "",
    foodType: searchParams.get("foodType") || "",
    budget: searchParams.get("budget") || ""
  });

  useEffect(() => {
    setFilters({
      category: searchParams.get("category") || "",
      foodType: searchParams.get("foodType") || "",
      budget: searchParams.get("budget") || ""
    });
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    const search = searchParams.get("search");

    if (search) params.set("search", search);
    if (filters.category) params.set("category", filters.category);
    if (filters.foodType) params.set("foodType", filters.foodType);
    if (filters.budget) params.set("budget", filters.budget);

    setLoading(true);
    request(endpoints.dishes(`?${params.toString()}`))
      .then((data) => setDishes(data))
      .finally(() => setLoading(false));
  }, [filters, searchParams]);

  return (
    <div className="wazwan-shell">
      <section className="place-hero">
        <div>
          <span className="place-eyebrow">The Wazwan</span>
          <h1>Signature dishes from Kashmir&apos;s ceremonial table.</h1>
          <p>
            Explore the core dishes of Wazwan, from iconic meat courses to rich gravies and
            celebratory classics, all presented in the same editorial style as your reference
            designs.
          </p>
        </div>

        <div className="jump-grid">
          <div className="jump-card">
            <strong>Filter by Category</strong>
            <span>Use Wazwan, Street Food, Budget Eats, or Luxury Dining to narrow the list.</span>
          </div>
          <div className="jump-card">
            <strong>Search by Name</strong>
            <span>Type a dish name in the URL search query to jump directly to a favorite.</span>
          </div>
          <div className="jump-card">
            <strong>Spot the Classics</strong>
            <span>Rogan Josh, Gushtaba, Rista, and Tabak Maaz are your essential starting points.</span>
          </div>
          <div className="jump-card">
            <strong>Match Your Taste</strong>
            <span>Look for food type, spice level, and price range before planning the meal.</span>
          </div>
        </div>
      </section>

      <section className="places-wrap pt-0">
        <div className="place-section border-t-0 pt-0">
          <div className="place-head">
            <div>
              <span className="place-eyebrow">Browse Dishes</span>
              <h2>Filter the Wazwan spread</h2>
            </div>
            <p>Choose a category, food type, or budget keyword to refine the list below.</p>
          </div>

          <div className="grid gap-4 rounded-[20px] border border-[var(--border)] bg-white/90 p-5 shadow-card md:grid-cols-3">
            <select
              value={filters.category}
              onChange={(event) => setFilters({ ...filters, category: event.target.value })}
              className="rounded-md border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="">All categories</option>
              <option value="Wazwan">Wazwan</option>
              <option value="Street Food">Street Food</option>
              <option value="Cafes">Cafes</option>
              <option value="Budget Eats">Budget Eats</option>
              <option value="Luxury Dining">Luxury Dining</option>
            </select>
            <select
              value={filters.foodType}
              onChange={(event) => setFilters({ ...filters, foodType: event.target.value })}
              className="rounded-md border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="">All food types</option>
              <option value="Veg">Veg</option>
              <option value="Non-veg">Non-veg</option>
            </select>
            <input
              value={filters.budget}
              onChange={(event) => setFilters({ ...filters, budget: event.target.value })}
              placeholder="Budget keyword, e.g. 450 or INR"
              className="rounded-md border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none"
            />
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              <p className="text-[var(--muted)]">Loading dishes...</p>
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
