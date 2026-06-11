"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { endpoints, request } from "@/lib/api";

export default function RestaurantCard({ restaurant, compact = false, onFavorite }) {
  const { user } = useAuth();

  const addFavorite = async () => {
    if (!user) {
      alert("Please log in to save favorites.");
      return;
    }

    await request(endpoints.favorites, {
      method: "POST",
      body: JSON.stringify({ itemId: restaurant._id, itemType: "restaurant" })
    });

    onFavorite?.();
  };

  return (
    <article className="overflow-hidden rounded-[28px] bg-white shadow-card">
      {!compact ? (
        <div className="h-48">
          <img src={restaurant.image} alt={restaurant.name} className="h-full w-full object-cover" />
        </div>
      ) : null}
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl text-pine">{restaurant.name}</h3>
            <p className="mt-2 text-sm text-slate-600">{restaurant.location}</p>
          </div>
          <div className="text-right text-sm font-semibold text-saffron">
            {restaurant.rating} / 5
          </div>
        </div>

        <p className="text-sm leading-6 text-slate-600">{restaurant.description}</p>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-mist px-3 py-1 text-pine">{restaurant.priceLevel}</span>
          {restaurant.authentic ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">Authentic</span>
          ) : null}
          {restaurant.overpriced ? (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">Overpriced</span>
          ) : null}
        </div>

        <div className="flex gap-3">
          <Link
            href={`/restaurants/${restaurant.slug || restaurant._id}`}
            className="rounded-full border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:border-saffron hover:text-saffron"
          >
            Details
          </Link>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              restaurant.googleMapsQuery
            )}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 rounded-full bg-pine px-4 py-3 text-center text-sm font-semibold text-white hover:bg-cedar"
          >
            Open map
          </a>
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
