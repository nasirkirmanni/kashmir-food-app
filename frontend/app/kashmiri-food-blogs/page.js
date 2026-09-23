"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, User, ArrowUpRight, Search, ChevronRight } from "lucide-react";
import Link from "next/link";
import { kashmirifoodBlogs, CATEGORIES } from "@/data/kashmirifoodBlogs";

export default function KashmirifoodBlogsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Only Tier 1 on the main page
  const tier1Posts = kashmirifoodBlogs.filter((p) => p.tier === 1);

  const filteredPosts = tier1Posts
    .filter((post) => selectedCategory === "All" || post.category === selectedCategory)
    .filter(
      (post) =>
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Get categories that actually have Tier 1 posts
  const activeCats = ["All", ...new Set(tier1Posts.map((p) => p.category))];

  return (
    <div className="min-h-screen pt-28 pb-32 px-6 page-shell flex flex-col items-center">
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent pointer-events-none z-0" />

      <div className="w-full max-w-6xl relative z-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center"
        >
          <span className="text-[var(--saffron)] font-bold tracking-[0.25em] uppercase text-[0.6rem] mb-4 block">
            Wazwan Way Encyclopaedia
          </span>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white mb-6 tracking-tight">
            Kashmiri Food Blogs
          </h1>
          <p className="text-white/55 text-sm md:text-base lg:text-lg leading-relaxed max-w-2xl mx-auto">
            Deep, researched guides to every important Kashmiri dish. Explore the history, ingredients,
            preparation, and cultural significance of Kashmir's legendary cuisine.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-10 max-w-xl mx-auto"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[var(--saffron)]/40 focus:ring-1 focus:ring-[var(--saffron)]/20 transition-all backdrop-blur-xl"
            />
          </div>
        </motion.div>

        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-2.5 mb-14"
        >
          {activeCats.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase border transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-[var(--saffron)] text-black border-[var(--saffron)]"
                  : "bg-white/5 text-white/60 border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Featured Hero Dish (first Tier 1) */}
        {filteredPosts.length > 0 && (
          <Link href={`/kashmiri-food-blogs/${filteredPosts[0].slug}`}>
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mb-12 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 sm:p-12 hover:border-[var(--saffron)]/30 hover:shadow-[0_20px_60px_rgba(212,175,55,0.1)] group transition-all"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[var(--saffron)] font-bold tracking-[0.15em] uppercase text-[0.55rem] bg-[var(--saffron)]/10 px-3 py-1 rounded-full border border-[var(--saffron)]/20">
                  {filteredPosts[0].category}
                </span>
                {filteredPosts[0].isWazwan && (
                  <span className="text-amber-300/70 font-bold tracking-[0.15em] uppercase text-[0.55rem] bg-amber-300/5 px-3 py-1 rounded-full border border-amber-300/15">
                    Wazwan Dish
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-white/40 text-[0.6rem] uppercase tracking-wider font-semibold ml-auto">
                  <Clock className="w-3.5 h-3.5" /> {filteredPosts[0].readTime}
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white mb-4 group-hover:text-[var(--saffron)] transition-colors leading-tight">
                {filteredPosts[0].title}
              </h2>
              <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-6 max-w-3xl">
                {filteredPosts[0].excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-[0.6rem] uppercase tracking-wider font-bold text-white/45">
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-[var(--saffron)]" /> {filteredPosts[0].author}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {filteredPosts[0].date}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-[var(--saffron)] group-hover:text-black flex items-center justify-center text-white/55 transition-all">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
            </motion.article>
          </Link>
        )}

        {/* Remaining Tier 1 Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          <AnimatePresence mode="popLayout">
            {filteredPosts.slice(1).map((post, i) => (
              <Link key={post.slug} href={`/kashmiri-food-blogs/${post.slug}`}>
                <motion.article
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[28px] p-6 sm:p-7 flex flex-col justify-between hover:border-[var(--saffron)]/30 hover:shadow-[0_15px_45px_rgba(212,175,55,0.08)] group transition-all h-full"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--saffron)] font-bold tracking-[0.12em] uppercase text-[0.55rem] bg-[var(--saffron)]/10 px-2.5 py-1 rounded-full border border-[var(--saffron)]/20">
                          {post.category}
                        </span>
                        {post.isWazwan && (
                          <span className="text-amber-300/60 font-bold tracking-[0.1em] uppercase text-[0.5rem] bg-amber-300/5 px-2 py-0.5 rounded-full border border-amber-300/10">
                            Wazwan
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1 text-white/35 text-[0.55rem] uppercase tracking-wider font-semibold">
                        <Clock className="w-3 h-3" /> {post.readTime}
                      </span>
                    </div>

                    <h3 className="font-display text-lg sm:text-xl text-white mb-3 group-hover:text-[var(--saffron)] transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-white/45 text-xs sm:text-sm leading-relaxed mb-5 line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3 text-[0.55rem] uppercase tracking-wider font-bold text-white/45">
                      <span className="flex items-center gap-1"><User className="w-3 h-3 text-[var(--saffron)]" /> {post.author}</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-[var(--saffron)] group-hover:text-black flex items-center justify-center text-white/50 transition-all">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </motion.article>
              </Link>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Sub-section Links: Tier 2 + Tier 3 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Link href="/kashmiri-food-blogs/traditional-dishes">
            <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[24px] p-8 hover:border-[var(--saffron)]/25 transition-all group">
              <span className="text-[var(--saffron)] font-bold tracking-[0.2em] uppercase text-[0.55rem] mb-3 block">
                Tier 2
              </span>
              <h2 className="font-display text-2xl text-white mb-3 group-hover:text-[var(--saffron)] transition-colors">
                Traditional Dishes
              </h2>
              <p className="text-white/45 text-sm leading-relaxed mb-5">
                Important regional and traditional Kashmiri dishes — from Seekh Kebab to Girda bread, Mutton Tujji, and Phirni.
              </p>
              <span className="flex items-center gap-1.5 text-[var(--saffron)] text-xs font-semibold uppercase tracking-wider">
                Explore <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>

          <Link href="/kashmiri-food-blogs/hidden-gems">
            <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-[24px] p-8 hover:border-[var(--saffron)]/25 transition-all group">
              <span className="text-[var(--saffron)] font-bold tracking-[0.2em] uppercase text-[0.55rem] mb-3 block">
                Tier 3
              </span>
              <h2 className="font-display text-2xl text-white mb-3 group-hover:text-[var(--saffron)] transition-colors">
                Hidden Gems
              </h2>
              <p className="text-white/45 text-sm leading-relaxed mb-5">
                Lesser-known Kashmiri dishes worth documenting — from Methi Maaz to Basrakh, Babribyol, and beyond.
              </p>
              <span className="flex items-center gap-1.5 text-[var(--saffron)] text-xs font-semibold uppercase tracking-wider">
                Explore <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Related Content Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h2 className="font-display text-2xl text-white mb-6">Explore More</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "Wazwan Guide", href: "/kashmiri-food/wazwan/guide/what-is-wazwan" },
              { label: "Kashmiri Food Portal", href: "/kashmiri-food" },
              { label: "Restaurants", href: "/restaurants" },
              { label: "Best Wazwan in Srinagar", href: "/restaurants/best-wazwan-srinagar" },
              { label: "Kashmir Travel", href: "/plan" },
              { label: "Waza AI", href: "/waza-ai" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase border border-white/10 bg-white/5 text-white/55 hover:border-[var(--saffron)]/30 hover:text-[var(--saffron)] transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
