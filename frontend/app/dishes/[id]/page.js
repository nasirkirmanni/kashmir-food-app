"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import MapPreview from "@/components/MapPreview";
import { endpoints, request } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function DishDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeResult, setRecipeResult] = useState(null);
  const [recipeError, setRecipeError] = useState(null);

  const handleExploreRecipe = async () => {
    setRecipeModalOpen(true);
    setRecipeLoading(true);
    setRecipeResult(null);
    setRecipeError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Please provide a minimal, precise, and step-wise guided recipe for ${dish.name}. No introductory or concluding remarks, just the recipe steps and minimal ingredients list.`
            }
          ]
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate recipe.");
      }

      setRecipeResult(data.reply);
    } catch (err) {
      console.error(err);
      setRecipeError("Failed to fetch the secret recipe. Please try again.");
    } finally {
      setRecipeLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    
    setIsSaving(true);
    try {
      await request(endpoints.favorites, {
        method: isFavorite ? "DELETE" : "POST",
        body: JSON.stringify({ itemId: dish._id, itemType: "dish" })
      });
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error(err);
      alert("Failed to update saved dishes.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    request(endpoints.dish(params.id))
      .then((data) => setDish(data))
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (user && dish) {
      request(endpoints.favorites)
        .then((favs) => {
          setIsFavorite(favs.some((f) => f.item?._id === dish._id || f.item === dish._id));
        })
        .catch(console.error);
    }
  }, [user, dish]);

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
          <button 
            onClick={() => router.back()} 
            className="mb-6 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-white/60 hover:text-[var(--saffron)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <span className="place-eyebrow">{dish.category}</span>
          <h1>{dish.name}</h1>
          <p>{dish.fullDescription}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="place-badge">{dish.foodType}</span>
            <span className="place-badge">{dish.spiceLevel}</span>
            <span className="place-badge">{dish.priceRange}</span>
            <span className="place-badge">{dish.popularityRating} / 5 popularity</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={handleExploreRecipe}
              className="rounded-full bg-[var(--saffron)] px-8 py-3 text-sm font-bold uppercase tracking-widest text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-transform hover:scale-105 active:scale-95"
            >
              Explore Recipe
            </button>
            <button
              onClick={handleToggleFavorite}
              disabled={isSaving}
              className={`rounded-full px-8 py-3 text-sm font-bold uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 border ${isFavorite ? 'border-[var(--saffron)] text-[var(--saffron)]' : 'border-white/20 text-white hover:border-white/50'}`}
            >
              {isSaving ? "Saving..." : (isFavorite ? "✓ Saved Dish" : "+ Add to Saved Dishes")}
            </button>
          </div>
        </div>

        <div className="rounded-[20px] border border-[var(--border)] bg-white p-4 shadow-card">
          <img src={dish.image} alt={dish.name} className="restaurant-cover h-[320px]" />
        </div>
      </section>

      <section className="places-wrap pt-0">
        <div className="grid gap-8 lg:grid-cols-[0.95fr,1.05fr]">
          <article className="restaurant-place-card self-start">
            <span className="place-eyebrow">History</span>
            <h3>{dish.name} in Kashmiri tradition</h3>
            <p className="restaurant-desc whitespace-pre-wrap text-justify">{dish.history}</p>
            <div className="rounded-[16px] bg-[var(--saffron-pale)] p-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--saffron)]">
                Tourist Tip
              </p>
              <p className="restaurant-desc mt-3 whitespace-pre-wrap text-justify">{dish.touristTip}</p>
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

      {/* Recipe Modal */}
      <AnimatePresence>
        {recipeModalOpen && dish && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-[#0f0f0f] border border-white/10 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/40">
                <div>
                  <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[var(--saffron)]">Secret Recipe</span>
                  <h2 className="mt-1 text-2xl font-display text-white">{dish.name}</h2>
                </div>
                <button
                  onClick={() => setRecipeModalOpen(false)}
                  className="rounded-full p-2 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all active:scale-90"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto flex-1 text-white/80 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {recipeLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 opacity-70">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--saffron)] mb-4"></div>
                    <p className="animate-pulse tracking-widest uppercase text-xs font-bold text-[var(--saffron)]">
                      finding the best secret recipe...
                    </p>
                  </div>
                ) : recipeError ? (
                  <p className="text-red-400 text-center py-10">{recipeError}</p>
                ) : (
                  recipeResult
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
