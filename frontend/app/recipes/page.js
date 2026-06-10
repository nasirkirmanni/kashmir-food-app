"use client";

import { useState, useEffect } from "react";
import { endpoints, request } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function RecipesPage() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeResult, setRecipeResult] = useState(null);
  const [recipeError, setRecipeError] = useState(null);

  useEffect(() => {
    request(endpoints.dishes(""))
      .then((data) => setDishes(data))
      .catch((err) => setError("Failed to load dishes."))
      .finally(() => setLoading(false));
  }, []);

  const filteredDishes = dishes.filter(dish => 
    dish.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExploreRecipe = async (dish) => {
    setSelectedDish(dish);
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

  return (
    <div className="wazwan-shell min-h-screen pb-20">
      <section className="place-hero">
        <div>
          <span className="place-eyebrow">The Wazwan Way</span>
          <h1>Secret Recipes</h1>
          <p>Discover the precise, step-by-step methods behind authentic Kashmiri dishes.</p>
        </div>
      </section>

      <section className="places-wrap pt-0 md:-mt-8">
        <div className="place-section border-t-0 pt-0">
          <div className="rounded-[20px] border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative z-10 mb-8">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recipes..."
              className="w-full rounded-xl border border-white/10 bg-black/40 text-white/90 placeholder-white/30 px-4 py-3 text-sm outline-none focus:border-[var(--saffron)] transition-colors"
            />
          </div>

          <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-white/50">Loading recipes...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-400">{error}</div>
            ) : filteredDishes.length === 0 ? (
              <div className="p-8 text-center text-white/50">No recipes found.</div>
            ) : (
              <ul className="divide-y divide-white/5">
                {filteredDishes.map((dish) => (
                  <li key={dish._id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                    <div>
                      <h3 className="font-display text-xl text-white tracking-wide">{dish.name}</h3>
                      <p className="text-xs text-[var(--saffron)] uppercase tracking-widest mt-1">{dish.category}</p>
                    </div>
                    <button
                      onClick={() => handleExploreRecipe(dish)}
                      className="shrink-0 w-full sm:w-auto text-center rounded-full border border-[var(--saffron)] bg-[var(--saffron)]/10 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[var(--saffron)] transition-all hover:bg-[var(--saffron)] hover:text-black active:scale-95"
                    >
                      Explore Recipe
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Recipe Modal */}
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
