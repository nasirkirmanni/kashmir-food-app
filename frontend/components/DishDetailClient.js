"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import MapPreview from "@/components/MapPreview";
import { endpoints, request } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ReactMarkdown from "react-markdown";
import JsonLd, { buildRecipeSchema } from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function DishDetailClient({ initialDish = null }) {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [dish, setDish] = useState(initialDish);
  const [loading, setLoading] = useState(!initialDish);

  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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
      const data = await request(endpoints.chat, {
        method: "POST",
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Please provide a minimal, precise, and step-wise guided recipe for ${dish.name}. No introductory or concluding remarks, just the recipe steps and minimal ingredients list.`
            }
          ]
        }),
      });

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
      setShowAuthModal(true);
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
    if (params.slug) {
      if (dish && (dish.slug === params.slug || dish._id === params.slug)) {
        if (params.slug.match(/^[0-9a-fA-F]{24}$/) && dish.slug) {
          router.replace(`/dishes/${dish.slug}`);
        }
        return;
      }
      request(endpoints.dish(params.slug))
        .then((data) => {
          setDish(data);
          if (params.slug.match(/^[0-9a-fA-F]{24}$/) && data.slug) {
            router.replace(`/dishes/${data.slug}`);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch dish:", err);
          setDish(null);
        })
        .finally(() => setLoading(false));
    }
  }, [params.slug, router]);

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
      {/* JSON-LD Structured Data */}
      <JsonLd data={buildRecipeSchema(dish)} />

      <section className="place-hero">
        <div>
          <Breadcrumbs items={[
            { name: "Home", href: "/" },
            { name: "Dishes", href: "/dishes" },
            { name: dish.name, href: `/dishes/${dish.slug}` },
          ]} />
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
            {dish.category === "Wazwan" ? (
              <span className="place-badge border-[var(--saffron)] text-[var(--saffron)] bg-[var(--saffron-pale)] font-bold">★ Traditional Wazwan Course</span>
            ) : (
              <span className="place-badge border-blue-500/40 text-blue-300 bg-blue-500/10 font-bold">❀ Traditional Home-style Recipe</span>
            )}
          </div>

          <div className="mt-8 rounded-[18px] border border-white/10 bg-white/5 backdrop-blur-md p-5 shadow-lg max-w-xl">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--saffron)] mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Waza AI Culinary Authority Scores
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-white/90">
                  <span>Authenticity</span>
                  <span className="text-[var(--saffron)] font-bold">{dish.authenticityScore || "4.0"}/5</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--saffron)] rounded-full" style={{ width: `${((dish.authenticityScore || 4.0) / 5) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-white/90">
                  <span>Tourist Friendliness</span>
                  <span className="text-[var(--saffron)] font-bold">{dish.touristFriendlinessScore || "4.0"}/5</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--saffron)] rounded-full" style={{ width: `${((dish.touristFriendlinessScore || 4.0) / 5) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-white/90">
                  <span>Luxury & Comfort</span>
                  <span className="text-[var(--saffron)] font-bold">{dish.luxuryScore || "3.0"}/5</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--saffron)] rounded-full" style={{ width: `${((dish.luxuryScore || 3.0) / 5) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <button
              onClick={handleExploreRecipe}
              className="rounded-full bg-[var(--saffron)] px-8 py-3 text-sm font-bold uppercase tracking-widest text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-transform hover:scale-105 active:scale-95"
            >
              Explore Recipe
            </button>
            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={handleToggleFavorite}
                disabled={isSaving}
                className={`rounded-full px-8 py-3 text-sm font-bold uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 border ${isFavorite ? 'border-[var(--saffron)] text-[var(--saffron)]' : 'border-white/20 text-white hover:border-white/50'}`}
              >
                {isSaving ? "Saving..." : (isFavorite ? "✓ Saved Dish" : "+ Add to Saved Dishes")}
              </button>
              
              {isFavorite && (
                <Link
                  href="/favorites"
                  className="rounded-full bg-white/5 border border-white/10 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10 hover:border-white/30 hover:text-[var(--saffron)]"
                >
                  View Saved Dishes &rarr;
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-[var(--border)] bg-white/5 p-4 shadow-card overflow-hidden">
          <img
            src={dish.image}
            alt={dish.name}
            loading="eager"
            decoding="async"
            className="restaurant-cover h-[320px] w-full object-cover rounded-[12px]"
            onError={(e) => { e.currentTarget.src = '/placeholder-dish.jpg'; e.currentTarget.onerror = null; }}
          />
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
                {dish.restaurants && dish.restaurants.map((restaurant) => (
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
                      <Link href={`/restaurants/${restaurant.slug || restaurant._id}`} className="wazwan-btn-ghost">
                        View restaurant -&gt;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {dish.restaurants && dish.restaurants[0] ? <MapPreview query={dish.restaurants[0].location} /> : null}
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

              <div className="p-6 md:p-8 overflow-y-auto flex-1 text-white/90 leading-relaxed">
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
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => <h1 className="font-display text-2xl font-bold text-[var(--saffron)] mt-4 mb-2" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="font-display text-xl font-bold text-[var(--saffron)] mt-4 mb-2" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="font-display text-lg font-bold text-[var(--saffron)] mt-3 mb-1.5" {...props} />,
                      p: ({ node, ...props }) => <p className="font-body text-sm text-white/90 leading-relaxed mb-3 last:mb-0" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1.5 text-sm text-white/80" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1.5 text-sm text-white/80" {...props} />,
                      li: ({ node, ...props }) => <li className="pl-0.5" {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-bold text-[var(--saffron)]" {...props} />,
                      code: ({ node, ...props }) => <code className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-xs text-[var(--saffron)]" {...props} />,
                      blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-[var(--saffron)] pl-3 italic text-white/60 my-3" {...props} />,
                    }}
                  >
                    {recipeResult}
                  </ReactMarkdown>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-[24px] border border-[var(--border)] bg-[var(--background)] p-8 shadow-2xl"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--saffron-pale)]">
                  <svg className="h-6 w-6 text-[var(--saffron)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-xl font-bold font-display text-white">You are signed out</h3>
                <p className="mb-6 text-sm text-[var(--muted)]">
                  Create an account or sign in to save your favourite dishes and build your Wazwan trail.
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/login"
                    className="w-full rounded-full bg-[var(--saffron)] py-3 text-sm font-bold uppercase tracking-widest text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-transform hover:scale-105 active:scale-95 text-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="w-full rounded-full border border-white/20 py-3 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:border-white/50 text-center"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
