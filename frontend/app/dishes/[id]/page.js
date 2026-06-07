"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MapPreview from "@/components/MapPreview";
import { endpoints, request } from "@/lib/api";

export default function DishDetailPage() {
  const params = useParams();
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request(endpoints.dish(params.id))
      .then((data) => setDish(data))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <div className="places-wrap py-24 text-[var(--muted)]">Loading dish...</div>;
  }

  if (!dish) {
    return <div className="places-wrap py-24 text-[var(--muted)]">Dish not found.</div>;
  }

  return (
    <div className="wazwan-shell">
      <section className="place-hero">
        <div>
          <span className="place-eyebrow">{dish.category}</span>
          <h1>{dish.name}</h1>
          <p>{dish.fullDescription}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="place-badge">{dish.foodType}</span>
            <span className="place-badge">{dish.spiceLevel}</span>
            <span className="place-badge">{dish.priceRange}</span>
            <span className="place-badge">{dish.popularityRating} / 5 popularity</span>
          </div>
        </div>

        <div className="rounded-[20px] border border-[var(--border)] bg-white p-4 shadow-card">
          <img src={dish.image} alt={dish.name} className="restaurant-cover h-[320px]" />
        </div>
      </section>

      <section className="places-wrap pt-0">
        <div className="grid gap-8 lg:grid-cols-[0.95fr,1.05fr]">
          <article className="restaurant-place-card">
            <span className="place-eyebrow">History</span>
            <h3>{dish.name} in Kashmiri tradition</h3>
            <p className="restaurant-desc">{dish.history}</p>
            <div className="rounded-[16px] bg-[var(--saffron-pale)] p-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--saffron)]">
                Tourist Tip
              </p>
              <p className="restaurant-desc mt-3">{dish.touristTip}</p>
            </div>
          </article>

          <div className="space-y-6">
            <article className="restaurant-place-card">
              <span className="place-eyebrow">Where To Try It</span>
              <h3>Restaurants serving {dish.name}</h3>
              <div className="mt-2 space-y-4">
                {dish.restaurants.map((restaurant) => (
                  <div key={restaurant._id} className="rounded-[16px] border border-[var(--border)] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-2xl text-[var(--walnut)]">{restaurant.name}</p>
                        <p className="restaurant-submeta mt-1">{restaurant.location}</p>
                      </div>
                      <div className="restaurant-rating">{restaurant.rating} / 5</div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="place-badge">{restaurant.priceLevel}</span>
                      {restaurant.authentic ? <span className="place-badge">Authentic</span> : null}
                      {restaurant.touristTrapWarning ? <span className="place-badge">Warning</span> : null}
                    </div>
                    <div className="mt-4">
                      <Link href={`/restaurants/${restaurant._id}`} className="wazwan-btn-ghost">
                        View restaurant -&gt;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {dish.restaurants[0] ? <MapPreview query={dish.restaurants[0].location} /> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
