"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MapPreview from "@/components/MapPreview";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import { endpoints, request } from "@/lib/api";

export default function RestaurantDetailClient() {
  const params = useParams();
  const router = useRouter();
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
      <section className="place-hero !grid-cols-1 md:!grid-cols-[1.2fr_0.8fr]">
        <div>
          <button 
            onClick={() => router.back()} 
            className="mb-6 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-white/60 hover:text-[var(--saffron)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <span className="place-eyebrow">{restaurant.city}</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl">{restaurant.name}</h1>
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
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                restaurant.googleMapsQuery || restaurant.location
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full sm:w-auto justify-center rounded-full bg-[var(--saffron)] px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] text-black transition-transform hover:scale-105 shadow-[0_0_30px_rgba(212,175,55,0.2)]"
            >
              Open in Google Maps
            </a>
            {restaurant.phoneNumber ? (
              <a
                href={`tel:${restaurant.phoneNumber.replace(/[^\d+]/g, "")}`}
                className="inline-flex w-full sm:w-auto justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-white/10 backdrop-blur-md"
              >
                Call Restaurant
              </a>
            ) : null}
          </div>
        </div>

        <div className="rounded-[20px] border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-2xl mt-8 md:mt-0">
          {restaurant.image ? (
            <img src={restaurant.image} alt={restaurant.name} className="restaurant-cover h-[250px] md:h-[320px] object-cover" />
          ) : (
            <div className="restaurant-cover h-[250px] md:h-[320px] flex items-center justify-center bg-white/5 rounded-[12px]">
              <svg className="w-24 h-24 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
              </svg>
            </div>
          )}
        </div>
      </section>

      <section className="places-wrap pt-0">
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-[1fr,0.95fr]">
          <div className="space-y-6">
            <article className="rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-2xl p-6 md:p-8 shadow-2xl overflow-hidden">
              <h3 className="font-display text-[1.4rem] text-white mb-5 border-b border-white/10 pb-4">Popular Dishes Here</h3>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {restaurant.linkedDishes.map((dish) => (
                  <div key={dish._id} className="flex items-center gap-4 rounded-[14px] bg-white/5 backdrop-blur-md p-3 border border-white/10 shadow-lg transition hover:border-[var(--saffron)] hover:bg-white/10 cursor-pointer hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                    <div className="h-[4.2rem] w-[4.2rem] shrink-0 rounded-[10px] overflow-hidden bg-black/40 border border-white/10">
                      <img src={dish.image} alt={dish.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-[1.05rem] text-white font-medium truncate tracking-tight">{dish.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <svg className="w-3.5 h-3.5 text-[#e69b00]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        <span className="text-sm font-medium text-[#e69b00]">{dish.popularityRating || "4.8"}</span>
                      </div>
                    </div>
                    <div className="text-[0.95rem] text-white/60 pr-3 font-semibold whitespace-nowrap">
                      {dish.priceRange ? `₹${dish.priceRange.match(/\d+/)?.[0] || '...'}` : ''}
                    </div>
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
                  <h2 className="text-3xl md:text-4xl">What visitors are saying</h2>
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
