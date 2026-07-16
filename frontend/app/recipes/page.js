"use client";

import { useState, useEffect } from "react";
import { endpoints, request, streamRequest } from "@/lib/api";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { createPortal } from "react-dom";
import AuthRequiredModal from "@/components/AuthRequiredModal";
import { CHIPS, dishMatchesChip } from "@/lib/recipeFilters";

import dishesData from "@/data/dishes.json";
import "./recipes.css";

const EASE = [0.22, 1, 0.36, 1];

export default function RecipesPage() {
  const [dishes, setDishes] = useState(dishesData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChip, setActiveChip] = useState("all");

  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeResult, setRecipeResult] = useState(null);
  const [recipeError, setRecipeError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (recipeModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [recipeModalOpen]);

  useEffect(() => {
    request(endpoints.dishes(""))
      .then((data) => setDishes(data))
      .catch((err) => {
        console.error(err);
        if (dishesData.length === 0) setError("Failed to load dishes.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredDishes = dishes.filter(
    (dish) =>
      dishMatchesChip(dish, activeChip) &&
      dish.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const writtenRecipeCount = dishes.filter((dish) => dish.recipe).length;
  const activeChipLabel = CHIPS.find((c) => c.key === activeChip)?.label || "";

  const handleExploreRecipe = async (dish) => {
    setSelectedDish(dish);
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
        setShowAuthModal(true);
      } else {
        setRecipeError("Failed to fetch the secret recipe. Please try again.");
      }
      setRecipeLoading(false);
    }
  };

  return (
    <div className="wazwan-shell min-h-screen bg-[#0a0a0a] pb-[calc(90px_+_env(safe-area-inset-bottom))] md:pb-20">
      <section id="recipes-library" className="pt-32 pb-8 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="mb-8 md:mb-10">
          <span className="text-[var(--saffron)] text-[0.65rem] font-bold uppercase tracking-[0.2em] block mb-3">
            <span className="md:hidden">The Recipe Library</span>
            <span className="hidden md:inline">RECIPES <span className="opacity-50">—</span></span>
          </span>
          <h1 className="text-4xl md:text-5xl font-display text-white mb-4 leading-tight">
            Authentic Kashmiri<br/>Recipes
          </h1>
          <p className="md:hidden text-[0.65rem] font-bold uppercase tracking-[0.15em] text-white/40">
            {dishes.length} dishes · {writtenRecipeCount} written recipes
          </p>
          <p className="hidden md:block text-white/60 text-sm md:text-base max-w-lg leading-relaxed">
            Explore traditional Wazwan delicacies, regional favorites and everyday comfort food.
          </p>
        </div>

        {/* Sticky search + chips on mobile (solid backdrop, no blur);
            on md+ this doubles as the header of the original list block. */}
        <div className="sticky top-0 z-30 -mx-4 px-4 py-3 bg-[#0a0a0a] sm:-mx-6 sm:px-6 md:static md:z-auto md:mx-0 md:bg-[#141414] md:rounded-t-3xl md:border md:border-white/5 md:p-5">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Wazwan recipes..."
            className="w-full rounded-xl border border-white/10 bg-black/40 text-white/90 placeholder-white/30 px-4 py-3 text-sm outline-none focus:border-[var(--saffron)] transition-colors"
          />
          <div className="recipes-chip-rail mt-3 flex gap-2 overflow-x-auto pb-1 md:pb-0" data-h-scroll>
            {CHIPS.map((c) => (
              <motion.button
                key={c.key}
                type="button"
                onClick={() => setActiveChip(c.key)}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                aria-pressed={activeChip === c.key}
                className={`shrink-0 inline-flex min-h-[44px] items-center rounded-full border px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.15em] transition-colors ${
                  activeChip === c.key
                    ? "border-[var(--saffron)] bg-[var(--saffron)] text-black"
                    : "border-white/15 text-white/60 hover:border-white/30 hover:text-white"
                }`}
              >
                {c.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="md:bg-[#141414] md:rounded-b-3xl md:border md:border-t-0 md:border-white/5">
          {loading ? (
            <div className="p-10 text-center text-white/50">Loading recipes...</div>
          ) : error ? (
            <div className="p-10 text-center text-red-400">{error}</div>
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${activeChip}|${searchQuery}`}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={reduceMotion ? undefined : { opacity: 1, transition: { duration: 0.18, ease: "easeOut" } }}
                exit={reduceMotion ? undefined : { opacity: 0, transition: { duration: 0.12, ease: "easeOut" } }}
              >
                {filteredDishes.length === 0 ? (
                  <div className="p-10 text-center text-white/50">
                    {activeChip === "all"
                      ? "No recipes found."
                      : `No ${activeChipLabel} recipes match your search.`}
                  </div>
                ) : (
                  <ul className="flex flex-col gap-4 pt-4 md:p-4">
                    {filteredDishes.map((dish, index) => (
                      <motion.li
                        key={dish._id}
                        data-recipe-row
                        data-category={dish.category || ""}
                        data-category-type={dish.categoryType || ""}
                        data-has-recipe={dish.recipe ? "1" : "0"}
                        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                        transition={{ duration: 0.25, ease: EASE, delay: index < 6 ? index * 0.04 : 0 }}
                        className="relative group overflow-hidden rounded-2xl border border-white/10 bg-[#111] md:bg-[#1c1c1c] md:border-white/5 md:p-5 hover:bg-[#222] hover:border-white/10 transition-colors duration-300"
                      >
                        {/* Mobile: whole card is the action — written recipe when it exists, Waza AI otherwise */}
                        {dish.recipe && dish.slug ? (
                          <Link
                            href={`/dishes/${dish.slug}#recipe`}
                            aria-label={`Read the ${dish.name} recipe`}
                            className="absolute inset-0 z-10 md:hidden"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleExploreRecipe(dish)}
                            aria-label={`Ask Waza AI for a ${dish.name} recipe`}
                            className="absolute inset-0 z-10 md:hidden"
                          />
                        )}

                        <div className="flex flex-col md:flex-row md:gap-5">
                          {/* Number block (desktop rows) */}
                          <div className="hidden md:flex flex-shrink-0 w-14 h-14 items-center justify-center rounded-xl border border-white/10 bg-[#141414] text-[var(--saffron)] font-display text-xl">
                            {index + 1}
                          </div>

                          {/* Image: full-bleed 16/10 card cover on mobile, thumbnail on desktop */}
                          {dish.image && (
                            <div className="w-full aspect-[16/10] overflow-hidden md:w-24 md:h-24 md:aspect-auto md:flex-shrink-0 md:rounded-xl md:border md:border-white/10">
                              <img
                                src={dish.image.startsWith('http') ? dish.image : `https://wazwanway.com${dish.image}`}
                                alt={dish.name}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => { e.target.src = '/images/dishes/rogan-josh.webp'; }}
                              />
                            </div>
                          )}

                          {/* Content */}
                          <div className="flex-1 p-4 md:p-0 md:pr-12">
                            <h3 className="font-display text-xl md:text-2xl text-white tracking-wide mb-1">
                              {dish.slug ? (
                                <Link href={`/dishes/${dish.slug}${dish.recipe ? "#recipe" : ""}`} className="hover:text-[var(--saffron)] transition-colors">
                                  {dish.name}
                                </Link>
                              ) : (
                                dish.name
                              )}
                            </h3>
                            <div className="flex flex-wrap items-center mb-3">
                              <span className="text-[0.65rem] font-bold text-[var(--saffron)] uppercase tracking-[0.15em]">{dish.category}</span>
                              {dish.recipe ? (
                                <span className="ml-3 rounded-full border border-[var(--saffron)]/40 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Recipe</span>
                              ) : (
                                <span className="ml-3 rounded-full border border-white/10 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.15em] text-white/35">Ask Waza AI</span>
                              )}
                            </div>
                            <p className="hidden md:block text-sm text-white/50 leading-relaxed mb-6 max-w-lg">{dish.description}</p>

                            {/* Metadata Row — real fields only, no time display */}
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/40">
                              <div className="hidden md:flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M18 20V10m-6 10V4M6 20v-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                {dish.spiceLevel || "Medium"}
                              </div>
                              {dish.recipe?.servings && (
                                <div className="flex items-center gap-1.5">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  Serves {dish.recipe.servings}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bookmark Icon (desktop rows) */}
                        <button className="hidden md:block absolute top-5 right-5 text-white/30 hover:text-white transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>

                        {/* Explore Arrow (desktop rows): written recipe when it exists, Waza AI otherwise */}
                        {dish.recipe && dish.slug ? (
                          <Link
                            href={`/dishes/${dish.slug}#recipe`}
                            aria-label={`Read the ${dish.name} recipe`}
                            className="hidden md:flex absolute bottom-5 right-5 w-10 h-10 rounded-full border border-[var(--saffron)]/30 items-center justify-center text-[var(--saffron)] hover:bg-[var(--saffron)] hover:text-black transition-all group-hover:border-[var(--saffron)]"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleExploreRecipe(dish)}
                            aria-label={`Ask Waza AI for a ${dish.name} recipe`}
                            className="hidden md:flex absolute bottom-5 right-5 w-10 h-10 rounded-full border border-[var(--saffron)]/30 items-center justify-center text-[var(--saffron)] hover:bg-[var(--saffron)] hover:text-black transition-all group-hover:border-[var(--saffron)]"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                          </button>
                        )}
                      </motion.li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Recipe Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {recipeModalOpen && selectedDish && (
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
                    <h2 className="mt-1 text-2xl font-display text-white">{selectedDish.name}</h2>
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
        </AnimatePresence>,
        document.body
      )}

      {showAuthModal && (
        <AuthRequiredModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}
