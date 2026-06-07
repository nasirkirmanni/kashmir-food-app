"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { endpoints, request } from "@/lib/api";

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

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    request(endpoints.restaurants()).then((data) => setRestaurants(data)).catch(() => null);
  }, []);

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
    <div className="wazwan-shell">
      <section className="place-hero">
        <div>
          <span className="place-eyebrow">Eat By Place</span>
          <h1>Find the right Wazwan table for each stop in Kashmir.</h1>
          <p>
            This page groups restaurants by destination so travelers can move from Srinagar to
            Gulmarg, Pahalgam, and Sonamarg without losing track of the best places to try Wazwan.
          </p>
        </div>

        <div className="jump-grid">
          {placeOrder.map((place) => (
            <a key={place} className="jump-card" href={`#${place.toLowerCase()}`}>
              <strong>{place}</strong>
              <span>{placeMeta[place].short}</span>
            </a>
          ))}
        </div>
      </section>

      <main className="places-wrap">
        {placeOrder.map((place) => {
          const placeRestaurants = grouped[place] || [];
          return (
            <section key={place} className="place-section" id={place.toLowerCase()}>
              <div className="place-head">
                <div>
                  <span className="place-eyebrow">{place}</span>
                  <h2>{placeMeta[place].title}</h2>
                </div>
                <p>{placeMeta[place].description}</p>
              </div>

              <div className="restaurant-grid-luxury">
                {placeRestaurants.length ? (
                  placeRestaurants.map((restaurant) => (
                    <article key={restaurant._id} className="restaurant-place-card">
                      {restaurant.image ? (
                        <Link href={`/restaurants/${restaurant._id}`} className="block">
                          <img
                            className="restaurant-cover"
                            src={restaurant.image}
                            alt={restaurant.name}
                          />
                        </Link>
                      ) : null}

                      <div className="restaurant-meta">
                        <span className="place-badge">
                          {restaurant.authentic ? "Authentic Pick" : "Dining Spot"}
                        </span>
                        <span className="place-badge">{restaurant.priceLevel}</span>
                      </div>

                      <h3>
                        <Link href={`/restaurants/${restaurant._id}`}>{restaurant.name}</Link>
                      </h3>
                      <div className="restaurant-rating">{restaurant.rating} / 5</div>
                      <div className="restaurant-submeta">{restaurant.location}</div>
                      {restaurant.phoneNumber ? (
                        <div className="restaurant-submeta">Phone: {restaurant.phoneNumber}</div>
                      ) : null}
                      <p className="restaurant-quote">
                        {restaurant.touristTrapWarning
                          ? "Tourist note available for this place."
                          : "A strong stop for travelers exploring regional Kashmiri food."}
                      </p>
                      <p className="restaurant-desc">{restaurant.description}</p>

                      <ul className="restaurant-highlights">
                        <li>
                          Known dishes:{" "}
                          {(restaurant.linkedDishes || [])
                            .map((dish) => dish.name)
                            .slice(0, 4)
                            .join(", ") || "Kashmiri specialties"}
                        </li>
                        <li>Google Maps available for quick directions.</li>
                      </ul>

                      <div className="restaurant-actions">
                        <Link
                          href={`/restaurants/${restaurant._id}`}
                          className="wazwan-btn-primary text-center"
                        >
                          View Details
                        </Link>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            restaurant.googleMapsQuery || restaurant.location
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="restaurant-map-link"
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
                    </article>
                  ))
                ) : (
                  <article className="restaurant-place-card">
                    <div className="restaurant-meta">
                      <span className="place-badge">Coming Soon</span>
                    </div>
                    <h3>{place}</h3>
                    <p className="restaurant-desc">
                      This destination section is ready for expansion. Add restaurants for {place} in
                      the admin panel or seed data to complete this route.
                    </p>
                  </article>
                )}
              </div>
            </section>
          );
        })}
      </main>

      <div className="page-shell pb-16">
        <Link href="/" className="wazwan-btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
