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

  const handleRemoveFavorite = async (itemId, itemType) => {
    try {
      await request(endpoints.favorites, {
        method: "DELETE",
        body: JSON.stringify({ itemId, itemType })
      });
      setFavorites(prev => prev.filter(fav => fav.item?._id !== itemId));
    } catch (err) {
      console.error(err);
      alert("Failed to remove from saved dishes.");
    }
  };

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
        <div className="grid gap-3 sm:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {favorites.filter(fav => fav.item != null).length === 0 ? (
            <div className="col-span-full flex flex-col items-center text-center py-20 px-6 bg-[#050505]/40 backdrop-blur-[24px] border border-white/10 rounded-[32px] shadow-2xl">
              <div className="mb-6 text-white/20">
                <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-display text-white mb-3">No dishes saved</h2>
              <p className="text-sm text-white/50 mb-10 max-w-sm leading-relaxed">
                You haven't saved any dishes to your trail yet. Explore Kashmir's greatest culinary heritage and bookmark your favorites.
              </p>
              <Link 
                href="/dishes" 
                className="rounded-full bg-[var(--saffron)] px-10 py-4 text-sm font-bold uppercase tracking-widest text-black shadow-[0_0_25px_rgba(212,175,55,0.25)] transition-transform hover:scale-105 active:scale-95"
              >
                Explore Dishes
              </Link>
            </div>
          ) : (
            favorites.filter(fav => fav.item != null).map((favorite, index) => {
              const isDish = favorite.itemType === 'dish';
              const item = favorite.item;
              
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
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveFavorite(item._id, favorite.itemType);
                        }}
                        className="text-white/40 hover:text-red-400 transition-colors p-1"
                        title="Remove from saved"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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
