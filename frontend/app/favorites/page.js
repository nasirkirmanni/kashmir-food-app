"use client";
import Link from "next/link";
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
    <div className="wazwan-shell pt-24 min-h-screen pb-32">
      <section className="place-hero">
        <div>
          <span className="place-eyebrow">Favorites</span>
          <h1>Your saved Wazwan trail.</h1>
          <p>Everything you bookmarked for the trip lives here, from dishes to dining rooms.</p>
        </div>
      </section>

      <section className="places-wrap pt-0">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {favorites.length === 0 ? (
            <p className="text-[var(--muted)] col-span-full">You haven't saved any dishes or restaurants yet.</p>
          ) : (
            favorites.map((favorite, index) => {
              const isDish = favorite.itemType === 'dish';
              const item = favorite.item;
              if (!item) return null;
              
              const linkHref = isDish ? `/dishes/${item._id}` : `/restaurants/${item._id}`;

              return (
                <article key={`${favorite.itemType}-${item._id || index}`} className="group overflow-hidden rounded-[20px] border border-white/10 bg-white/5 shadow-xl transition-all hover:border-[var(--saffron)] hover:shadow-[0_10px_40px_rgba(212,175,55,0.15)] flex flex-col relative">
                  {item.image && (
                    <div className="relative h-48 shrink-0 overflow-hidden">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                      <div className="absolute top-4 left-4">
                        <span className="place-badge shadow-md bg-black/60 backdrop-blur-md border border-white/20 text-white">{favorite.itemType}</span>
                      </div>
                    </div>
                  )}
                  {!item.image && (
                    <div className="restaurant-meta p-5 pb-0">
                      <span className="place-badge">{favorite.itemType}</span>
                    </div>
                  )}
                  
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {isDish && item.category && (
                        <p className="text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[var(--saffron)]">
                          {item.category}
                        </p>
                      )}
                      <h3 className="font-display mt-2 text-xl text-white">{item.name}</h3>
                      <p className="mt-2 text-xs leading-5 text-white/60 line-clamp-3">
                        {item.description || item.location || "Saved for later."}
                      </p>
                    </div>
                    <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center">
                      <Link href={linkHref} className="text-xs font-bold uppercase tracking-widest text-white transition-colors group-hover:text-[var(--saffron)]">
                        View details &rarr;
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
