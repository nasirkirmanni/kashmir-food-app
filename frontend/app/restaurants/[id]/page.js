"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MapPreview from "@/components/MapPreview";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import { endpoints, request } from "@/lib/api";

export default function RestaurantDetailPage() {
  const params = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadRestaurant = () =>
    request(endpoints.restaurant(params.id)).then((data) => setRestaurant(data));

  useEffect(() => {
    loadRestaurant().finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <div className="places-wrap py-24 text-[var(--muted)]">Loading restaurant...</div>;
  }

  if (!restaurant) {
    return <div className="places-wrap py-24 text-[var(--muted)]">Restaurant not found.</div>;
  }

  return (
    <div className="wazwan-shell">
      <section className="place-hero">
        <div>
          <span className="place-eyebrow">{restaurant.city}</span>
          <h1>{restaurant.name}</h1>
          <p>{restaurant.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="place-badge">{restaurant.priceLevel}</span>
            <span className="place-badge">{restaurant.rating} / 5</span>
            {restaurant.authentic ? <span className="place-badge">Authentic</span> : null}
            {restaurant.touristTrapWarning ? <span className="place-badge">Tourist Warning</span> : null}
          </div>
          <p className="restaurant-submeta mt-5">{restaurant.location}</p>
          {restaurant.phoneNumber ? (
            <div className="mt-4">
              <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[var(--saffron)]">
                Contact
              </p>
              <a
                href={`tel:${restaurant.phoneNumber.replace(/[^\d+]/g, "")}`}
                className="mt-2 inline-flex text-base font-medium text-[var(--crimson)]"
              >
                {restaurant.phoneNumber}
              </a>
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                restaurant.googleMapsQuery || restaurant.location
              )}`}
              target="_blank"
              rel="noreferrer"
              className="wazwan-btn-primary inline-flex"
            >
              Open in Google Maps
            </a>
            {restaurant.phoneNumber ? (
              <a
                href={`tel:${restaurant.phoneNumber.replace(/[^\d+]/g, "")}`}
                className="restaurant-map-link"
              >
                Call Restaurant
              </a>
            ) : null}
          </div>
        </div>

        <div className="rounded-[20px] border border-[var(--border)] bg-white p-4 shadow-card">
          <img src={restaurant.image} alt={restaurant.name} className="restaurant-cover h-[320px]" />
        </div>
      </section>

      <section className="places-wrap pt-0">
        <div className="grid gap-8 lg:grid-cols-[1fr,0.95fr]">
          <div className="space-y-6">
            <article className="restaurant-place-card">
              <span className="place-eyebrow">Known For</span>
              <h3>Signature dishes at this table</h3>
              <div className="restaurant-grid-luxury mt-2">
                {restaurant.linkedDishes.map((dish) => (
                  <div key={dish._id} className="rounded-[16px] border border-[var(--border)] p-4">
                    <img src={dish.image} alt={dish.name} className="restaurant-cover h-32" />
                    <p className="font-display mt-3 text-2xl text-[var(--walnut)]">{dish.name}</p>
                    <p className="restaurant-submeta mt-1">{dish.category}</p>
                  </div>
                ))}
              </div>
            </article>

            {restaurant.touristTrapReason ? (
              <article className="restaurant-place-card">
                <span className="place-eyebrow">Tourist Note</span>
                <h3>Pricing and visitor guidance</h3>
                <p className="restaurant-desc">{restaurant.touristTrapReason}</p>
              </article>
            ) : null}

            <MapPreview query={restaurant.googleMapsQuery} />
          </div>

          <div className="space-y-6">
            <ReviewForm restaurantId={restaurant._id} onSuccess={loadRestaurant} />
            <div>
              <div className="place-head mb-4">
                <div>
                  <span className="place-eyebrow">Traveler Reviews</span>
                  <h2>What visitors are saying</h2>
                </div>
              </div>
              <ReviewList reviews={restaurant.reviews} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
