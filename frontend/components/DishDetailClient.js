"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import MapPreview from "@/components/MapPreview";
import { endpoints, request, streamRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ReactMarkdown from "react-markdown";
import JsonLd, { buildRecipeSchema, buildDishFaqSchema } from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { resolveImageUrl } from "@/lib/imageUtils";
import AuthRequiredModal from "@/components/AuthRequiredModal";
import StickyMobileNav from "@/components/StickyMobileNav";
import ExpandableText from "@/components/ExpandableText";

export default function DishDetailClient({ initialDish = null }) {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [dish, setDish] = useState(initialDish);
  const [loading, setLoading] = useState(!initialDish);
  const [error, setError] = useState(null);

  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authContext, setAuthContext] = useState(null);

  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeResult, setRecipeResult] = useState(null);
  const [recipeError, setRecipeError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showAuthModal || recipeModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showAuthModal, recipeModalOpen]);

  const handleExploreRecipe = async () => {
    setRecipeModalOpen(true);
    setRecipeLoading(true);
    setRecipeResult("");
    setRecipeError(null);

    try {
      const response = await streamRequest(endpoints.chat, {
        method: "POST",
        body: JSON.stringify({
          isRecipeExplore: true,
          messages: [
            {
              role: "user",
              content: `Please provide a minimal, precise, and step-wise guided recipe for ${dish.name}. No introductory or concluding remarks, just the recipe steps and minimal ingredients list.`
            }
          ]
        }),
      });

      setRecipeLoading(false);

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let fullRecipe = "";
      let buffer = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim();
              if (dataStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.reply) {
                  fullRecipe += parsed.reply;
                  setRecipeResult(fullRecipe);
                } else if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (e) {
                // Ignore invalid JSON lines
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      if (err.requiresAuth) {
        setRecipeModalOpen(false);
        setAuthContext("recipe");
        setShowAuthModal(true);
      } else {
        setRecipeError("Failed to fetch the secret recipe. Please try again.");
      }
      setRecipeLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      setAuthContext("favorite");
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
      setLoading(true);
      setError(null);
      request(endpoints.dish(params.slug))
        .then((data) => {
          setDish(data);
          if (params.slug.match(/^[0-9a-fA-F]{24}$/) && data.slug) {
            router.replace(`/dishes/${data.slug}`);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch dish:", err);
          setError("Failed to load dish details. Please try again later.");
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
    return (
      <div className="wazwan-shell flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--saffron)]"></div>
          <p className="text-[var(--saffron)] font-bold uppercase tracking-widest text-sm animate-pulse">Loading Dish...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wazwan-shell flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="text-red-400 font-bold text-xl">{error}</div>
          <button onClick={() => window.location.reload()} className="rounded-full bg-white/10 px-6 py-2 text-white hover:bg-white/20 transition-colors">Try Again</button>
        </div>
      </div>
    );
  }

  if (!dish) {
    return (
      <div className="wazwan-shell flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="text-white/60 font-medium text-xl">Dish not found.</div>
          <button onClick={() => router.back()} className="rounded-full bg-[var(--saffron)] px-6 py-2 text-black font-bold hover:scale-105 transition-transform">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wazwan-shell">
      {/* JSON-LD Structured Data */}
      <JsonLd data={buildRecipeSchema(dish)} />
      {buildDishFaqSchema(dish) ? <JsonLd data={buildDishFaqSchema(dish)} /> : null}

      <StickyMobileNav title={dish.name} />

      <section className="place-hero">
        <div>
          <div className="hidden md:block">
            <Breadcrumbs items={[
              { name: "Home", href: "/" },
              { name: "Dishes", href: "/dishes" },
              { name: dish.name, href: `/dishes/${dish.slug}` },
            ]} />
          </div>
          <button 
            onClick={() => router.back()} 
            className="mb-6 hidden md:flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest text-white/60 hover:text-[var(--saffron)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <span className="place-eyebrow">{dish.category}</span>
          <h1>{dish.name}</h1>
          <ExpandableText text={dish.fullDescription} threshold={100} />
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
              onClick={() => {
                // Written recipe lives on this page — scroll to it. Waza AI
                // stays the fallback for dishes without an authored recipe.
                if (dish.recipe?.instructions?.length) {
                  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                  document.getElementById("recipe")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
                } else {
                  handleExploreRecipe();
                }
              }}
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
          <div className="relative h-[320px] w-full">
            <ImageWithSkeleton
              src={resolveImageUrl(dish.image)}
              alt={dish.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="restaurant-cover object-cover rounded-[12px]"
            />
          </div>
        </div>
      </section>

      <section className="places-wrap pt-0">
        <div className="grid gap-8 lg:grid-cols-[0.95fr,1.05fr]">
          <article className="restaurant-place-card self-start">
            <span className="place-eyebrow">History</span>
            <h3>{dish.name} in Kashmiri tradition</h3>
            <ExpandableText text={dish.history} className="restaurant-desc whitespace-pre-wrap text-justify" threshold={150} />
            <div className="rounded-[16px] bg-[var(--saffron-pale)] p-5 mt-6">
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
                  <div key={restaurant._id || restaurant.name} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-black/40 p-4">
                    <div>
                      <h4 className="font-semibold text-white">{restaurant.name}</h4>
                      <p className="text-sm text-white/60">{restaurant.location}</p>
                    </div>
                    <Link href={`/restaurants/${restaurant.slug || restaurant._id}`} className="wazwan-btn-ghost text-xs">
                      View -&gt;
                    </Link>
                  </div>
                ))}
              </div>
            </article>

            {dish.restaurants && dish.restaurants[0] ? <MapPreview query={dish.restaurants[0].location} /> : null}
          </div>
        </div>
      </section>

      {dish.recipe?.ingredients?.length > 0 && dish.recipe?.instructions?.length > 0 && (
        <section className="places-wrap pt-0" id="recipe">
          <div className="mb-8 border-l-2 border-[var(--saffron)] pl-4">
            <span className="place-eyebrow">The Recipe</span>
            <h2 className="text-2xl md:text-4xl font-display font-medium text-white">
              How to make {dish.name}
              {dish.recipe.kashmiriName ? (
                <span className="text-white/40 text-lg md:text-2xl ml-3">({dish.recipe.kashmiriName})</span>
              ) : null}
            </h2>
            {dish.recipe.intro ? (
              <p className="restaurant-desc mt-3 max-w-3xl">{dish.recipe.intro}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-white/60">
              {dish.recipe.prepTimeMinutes ? <span>Prep {dish.recipe.prepTimeMinutes} min</span> : null}
              {dish.recipe.cookTimeMinutes ? <span>Cook {dish.recipe.cookTimeMinutes} min</span> : null}
              {dish.recipe.servings ? <span>Serves {dish.recipe.servings}</span> : null}
              {dish.recipe.difficulty ? <span className="text-[var(--saffron)]">{dish.recipe.difficulty}</span> : null}
              {dish.recipe.tradition ? <span>{dish.recipe.tradition}</span> : null}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.8fr,1.2fr]">
            <article className="restaurant-place-card self-start">
              <span className="place-eyebrow">Ingredients</span>
              <ul className="mt-4 space-y-2.5">
                {dish.recipe.ingredients.map((ing, i) => (
                  <li key={i} className="restaurant-desc flex gap-3">
                    <span className="text-[var(--saffron)] shrink-0 mt-[2px]">·</span>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
              {dish.recipe.wazaTips?.length > 0 && (
                <div className="rounded-[16px] bg-[var(--saffron-pale)] p-5 mt-6">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--saffron)]">
                    Waza Tips
                  </p>
                  <ul className="mt-3 space-y-2">
                    {dish.recipe.wazaTips.map((tip, i) => (
                      <li key={i} className="restaurant-desc">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>

            <article className="restaurant-place-card">
              <span className="place-eyebrow">Method</span>
              <ol className="mt-4 space-y-5">
                {dish.recipe.instructions.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="shrink-0 w-8 h-8 rounded-full border border-[var(--saffron)]/40 text-[var(--saffron)] flex items-center justify-center text-sm font-semibold">
                      {i + 1}
                    </span>
                    <p className="restaurant-desc pt-1">{step}</p>
                  </li>
                ))}
              </ol>
              {dish.recipe.commonMistakes?.length > 0 && (
                <div className="mt-8">
                  <span className="place-eyebrow">Common Mistakes</span>
                  <ul className="mt-3 space-y-2">
                    {dish.recipe.commonMistakes.map((m, i) => (
                      <li key={i} className="restaurant-desc flex gap-3">
                        <span className="text-white/30 shrink-0 mt-[2px]">×</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {dish.recipe.homeAdaptation ? (
                <div className="mt-8">
                  <span className="place-eyebrow">At Home</span>
                  <p className="restaurant-desc mt-3">{dish.recipe.homeAdaptation}</p>
                </div>
              ) : null}
              {dish.recipe.servingSuggestions ? (
                <div className="mt-8">
                  <span className="place-eyebrow">Serving</span>
                  <p className="restaurant-desc mt-3">{dish.recipe.servingSuggestions}</p>
                </div>
              ) : null}
            </article>
          </div>
        </section>
      )}

      {mounted && createPortal(
        <>
          {/* Recipe Modal */}
          <AnimatePresence>
            {recipeModalOpen && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-full max-w-2xl max-h-[85vh] rounded-[32px] border border-white/10 bg-[#0A0A0A] p-6 md:p-10 shadow-2xl overflow-hidden flex flex-col"
                >
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5 shrink-0">
                    <div>
                      <h3 className="text-2xl font-display font-medium text-white mb-1">Authentic Recipe</h3>
                      <p className="text-[var(--saffron)] text-sm">{dish.name}</p>
                    </div>
                    <button
                      onClick={() => setRecipeModalOpen(false)}
                      className="text-white/40 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {recipeLoading ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 border-4 border-white/10 border-t-[var(--saffron)] rounded-full animate-spin mb-6"></div>
                        <p className="text-white/60 animate-pulse font-medium tracking-wide">
                          Waza AI is crafting the perfect authentic recipe...
                        </p>
                      </div>
                    ) : recipeError ? (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
                        <p className="text-red-400 mb-4">{recipeError}</p>
                        <button 
                          onClick={handleExploreRecipe}
                          className="px-6 py-2 bg-red-500/20 text-red-300 rounded-full text-sm font-medium hover:bg-red-500/30 transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : (
                      <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10">
                        <ReactMarkdown
                          components={{
                            h1: ({ node, ...props }) => <h1 className="text-2xl font-display text-[var(--saffron)] mb-6 pb-4 border-b border-white/10" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-xl font-display text-white mt-8 mb-4 flex items-center gap-3 before:content-[''] before:block before:w-2 before:h-2 before:bg-[var(--saffron)] before:rounded-full" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-white/90 mt-6 mb-3" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-4 text-white/70 leading-loose" {...props} />,
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
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {showAuthModal && (
            <AuthRequiredModal
              titleLine1={authContext === "recipe" ? "Unlock Secret" : "Save Your"}
              titleLine2={authContext === "recipe" ? "Recipes" : "Favorites"}
              message={authContext === "recipe" 
                ? "You've explored your 2 free recipes.\nSign in or create an account to unlock unlimited authentic Kashmiri recipes." 
                : "Sign in or create an account to save dishes to your favorites."}
              onClose={() => setShowAuthModal(false)}
              onSuccess={() => {
                setShowAuthModal(false);
                if (authContext === "favorite" && !isFavorite) {
                  handleToggleFavorite();
                }
              }}
            />
          )}
        </>,
        document.body
      )}
    </div>
  );
}
