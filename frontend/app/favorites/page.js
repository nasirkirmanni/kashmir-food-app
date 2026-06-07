"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { endpoints, request } from "@/lib/api";

export default function FavoritesPage() {
  const { user, loading } = useAuth();
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (!user) return;
    request(endpoints.favorites).then((data) => setFavorites(data));
  }, [user]);

  if (loading) {
    return <div className="places-wrap py-24 text-[var(--muted)]">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="wazwan-shell">
        <section className="place-hero">
          <div>
            <span className="place-eyebrow">Favorites</span>
            <h1>Log in to keep your Kashmir shortlist.</h1>
            <p>
              Save dishes and restaurants you want to revisit later so your Wazwan planning stays
              elegant and easy.
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="wazwan-shell">
      <section className="place-hero">
        <div>
          <span className="place-eyebrow">Favorites</span>
          <h1>Your saved Wazwan trail.</h1>
          <p>Everything you bookmarked for the trip lives here, from dishes to dining rooms.</p>
        </div>
      </section>

      <section className="places-wrap pt-0">
        <div className="restaurant-grid-luxury">
          {favorites.map((favorite, index) => (
            <article key={`${favorite.itemType}-${index}`} className="restaurant-place-card">
              <div className="restaurant-meta">
                <span className="place-badge">{favorite.itemType}</span>
              </div>
              <h3>{favorite.item?.name}</h3>
              <p className="restaurant-desc">
                {favorite.item?.description || favorite.item?.location || "Saved for later."}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
