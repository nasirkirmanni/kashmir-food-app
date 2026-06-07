"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { endpoints, request } from "@/lib/api";

export default function DishCard({ dish, onFavorite }) {
  const { user } = useAuth();

  const addFavorite = async () => {
    if (!user) {
      alert("Please log in to save favorites.");
      return;
    }

    await request(endpoints.favorites, {
      method: "POST",
      body: JSON.stringify({ itemId: dish._id, itemType: "dish" })
    });

    onFavorite?.();
  };

  return (
    <article className="overflow-hidden rounded-[28px] bg-white shadow-card transition hover:-translate-y-1">
      <div className="relative h-56 overflow-hidden">
        <img src={dish.image} alt={dish.name} className="h-full w-full object-cover" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-pine">
          {dish.foodType}
        </span>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl text-pine">{dish.name}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{dish.description}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 px-3 py-2 text-right text-xs font-semibold text-saffron">
            <div>{dish.popularityRating} / 5</div>
            <div>Popular</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-mist px-3 py-1">{dish.category}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">{dish.priceRange}</span>
        </div>

        <div className="flex gap-3">
          <Link
            href={`/dishes/${dish._id}`}
            className="flex-1 rounded-full bg-pine px-4 py-3 text-center text-sm font-semibold text-white hover:bg-cedar"
          >
            View details
          </Link>
          <button
            type="button"
            onClick={addFavorite}
            className="rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-saffron hover:text-saffron"
          >
            Save
          </button>
        </div>
      </div>
    </article>
  );
}
