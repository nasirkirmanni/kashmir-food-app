"use client";

import { useState, useEffect } from "react";
import { endpoints, request, streamRequest } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { createPortal } from "react-dom";
import AuthRequiredModal from "@/components/AuthRequiredModal";

import dishesData from "@/data/dishes.json";

export default function RecipesPage() {
  const [dishes, setDishes] = useState(dishesData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeResult, setRecipeResult] = useState(null);
  const [recipeError, setRecipeError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  const coreDishNames = [
    "tabak maaz",
    "seekh kebab",
    "methi maaz",
    "rista",
    "rogan josh",
    "daniwal korma",
    "aab gosht",
    "marchwangan korma",
    "yakhni",
    "gushtaba"
  ];

  const filteredDishes = dishes.filter(dish => 
    coreDishNames.includes(dish.name.toLowerCase()) &&
    dish.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="wazwan-shell min-h-screen pb-20 bg-[#0a0a0a]">
      <section className="pt-32 pb-8 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="mb-10">
          <span className="text-[var(--saffron)] text-[0.65rem] font-bold uppercase tracking-[0.2em] block mb-3">
            RECIPES <span className="opacity-50">—</span>
          </span>
          <h1 className="text-4xl md:text-5xl font-display text-white mb-4 leading-tight">
            Authentic Kashmiri<br/>Recipes
          </h1>
          <p className="text-white/60 text-sm md:text-base max-w-lg leading-relaxed">
            Explore traditional Wazwan delicacies, regional favorites and everyday comfort food.
          </p>
        </div>

        <div className="bg-[#141414] rounded-3xl border border-white/5 overflow-hidden">
          {/* Search bar inside the block to replace pills */}
          <div className="p-4 sm:p-5 border-b border-white/5">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Wazwan recipes..."
              className="w-full rounded-xl border border-white/10 bg-black/40 text-white/90 placeholder-white/30 px-4 py-3 text-sm outline-none focus:border-[var(--saffron)] transition-colors"
            />
          </div>
          {loading ? (
            <div className="p-10 text-center text-white/50">Loading recipes...</div>
          ) : error ? (
            <div className="p-10 text-center text-red-400">{error}</div>
          ) : filteredDishes.length === 0 ? (
            <div className="p-10 text-center text-white/50">No recipes found.</div>
          ) : (
            <ul className="flex flex-col p-4 gap-4">
              {filteredDishes.map((dish, index) => (
                <li key={dish._id} className="relative group bg-[#1c1c1c] border border-white/5 rounded-2xl p-5 hover:bg-[#222] hover:border-white/10 transition-all duration-300">
                  <div className="flex gap-4 sm:gap-5">
                    {/* Number block */}
                    <div className="hidden sm:flex flex-shrink-0 w-14 h-14 items-center justify-center rounded-xl border border-white/10 bg-[#141414] text-[var(--saffron)] font-display text-xl">
                      {index + 1}
                    </div>

                    {/* Image Thumbnail */}
                    {dish.image && (
                      <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-white/10">
                        <img 
                          src={dish.image.startsWith('http') ? dish.image : `https://wazwanway.com${dish.image}`} 
                          alt={dish.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { e.target.src = '/images/dishes/rogan-josh.webp'; }}
                        />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1 pr-10 sm:pr-12">
                      <h3 className="font-display text-2xl text-white tracking-wide mb-1">
                        {dish.slug ? (
                          <Link href={`/dishes/${dish.slug}${dish.recipe?.instructions?.length ? "#recipe" : ""}`} className="hover:text-[var(--saffron)] transition-colors">
                            {dish.name}
                          </Link>
                        ) : (
                          dish.name
                        )}
                      </h3>
                      <p className="text-[0.65rem] font-bold text-[var(--saffron)] uppercase tracking-[0.15em] mb-3">{dish.category}</p>
                      <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-lg">{dish.description}</p>
                      
                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/40">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          {dish.time || "45 mins"}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M18 20V10m-6 10V4M6 20v-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          {dish.spiceLevel || "Medium"}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          {dish.servings || "4 Servings"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bookmark Icon */}
                  <button className="absolute top-5 right-5 text-white/30 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>

                  {/* Explore Arrow: written recipe when it exists, Waza AI otherwise */}
                  {dish.recipe?.instructions?.length > 0 && dish.slug ? (
                    <Link
                      href={`/dishes/${dish.slug}#recipe`}
                      aria-label={`Read the ${dish.name} recipe`}
                      className="absolute bottom-5 right-5 w-10 h-10 rounded-full border border-[var(--saffron)]/30 flex items-center justify-center text-[var(--saffron)] hover:bg-[var(--saffron)] hover:text-black transition-all group-hover:border-[var(--saffron)]"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleExploreRecipe(dish)}
                      aria-label={`Ask Waza AI for a ${dish.name} recipe`}
                      className="absolute bottom-5 right-5 w-10 h-10 rounded-full border border-[var(--saffron)]/30 flex items-center justify-center text-[var(--saffron)] hover:bg-[var(--saffron)] hover:text-black transition-all group-hover:border-[var(--saffron)]"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                  )}
                </li>
              ))}
            </ul>
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
