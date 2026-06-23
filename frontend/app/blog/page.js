"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, User, ArrowUpRight } from "lucide-react";

import Link from "next/link";

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Heritage Cookery", "Bread Culture", "Tea Rituals", "Dine Etiquette", "Spice Heritage"];

  const posts = [
    {
      title: "Secrets of Gushtaba: The Royal Velvet Meatball",
      slug: "secrets-of-gushtaba",
      summary: "Discover the meticulous science and immense physical effort behind creating the legendary final dish of the Wazwan feast.",
      readTime: "5 min read",
      date: "June 14, 2026",
      author: "Waza Rashid",
      category: "Heritage Cookery",
      excerpt: "If wazwan is a symphony, Gushtaba is the final, triumphant crescendo. The meat must be hand-pounded on walnut wood..."
    },
    {
      title: "The Kandur-Wan Breads of Kashmir",
      slug: "kandur-wan-breads",
      summary: "From morning Girda to evening Chochoor: how local clay-oven bakeries define daily life and social structures in the valley.",
      readTime: "4 min read",
      date: "June 10, 2026",
      author: "Adnan Kirmanni",
      category: "Bread Culture",
      excerpt: "Step into any Kashmiri neighborhood at dawn and you will follow the aroma of wood smoke and baking dough straight to the Kandur..."
    },
    {
      title: "Kahwa vs. Noon Chai: An Ancestral Tea Feud",
      slug: "kahwa-vs-noon-chai",
      summary: "An exploration of two distinct beverage traditions that warm the hearts and hearths of Kashmiri homes.",
      readTime: "6 min read",
      date: "May 28, 2026",
      author: "Zoya Jan",
      category: "Tea Rituals",
      excerpt: "One is amber, sweet, and spiced with cardamom and saffron; the other is pink, salty, and thick with butter and baking soda..."
    },
    {
      title: "Trami Etiquette: The Sacred Rules of Sharing",
      slug: "trami-etiquette",
      summary: "Everything a traveler needs to know about sitting, sharing, and savoring when invited to a traditional Kashmiri wedding feast.",
      readTime: "5 min read",
      date: "May 15, 2026",
      author: "Suhail Rather",
      category: "Dine Etiquette",
      excerpt: "To eat from a Trami is to share a bond of brotherhood. You sit in groups of four, removing shoes, and washing hands with the Tasht-naer..."
    },
    {
      title: "What is Ver Masala? The Secret Spice Behind Authentic Wazwan",
      slug: "what-is-ver-masala",
      summary: "Discover the labor-intensive history and pungent aromatic profile of the sun-dried spice cake that defines Kashmiri cooking.",
      readTime: "6 min read",
      date: "June 23, 2026",
      author: "Waza Rashid",
      category: "Spice Heritage",
      excerpt: "At the heart of Kashmiri culinary identity lies a closely guarded secret, a flavor profile so complex and punchy that it defines the very soul of the region's dishes..."
    },
    {
      title: "Kashmiri Saffron: Why Pampore Produces the World's Finest Saffron",
      slug: "pampore-kashmiri-saffron",
      summary: "Explore the ancient karewa soils of Pampore and the painstaking dawn harvests that yield the world's most potent and expensive spice.",
      readTime: "7 min read",
      date: "June 23, 2026",
      author: "Zoya Jan",
      category: "Spice Heritage",
      excerpt: "Saffron is the world's most expensive spice, a literal weight-in-gold commodity. While it is grown in countries like Iran and Spain, Kashmiri Saffron is universally recognized..."
    },
    {
      title: "Kashmiri Red Chili: The Spice That Gives Wazwan Its Iconic Color",
      slug: "kashmiri-red-chili",
      summary: "How a surprisingly mild chili pepper creates the fiery crimson illusion that characterizes the legendary Kashmiri Rogan Josh.",
      readTime: "5 min read",
      date: "June 23, 2026",
      author: "Adnan Kirmanni",
      category: "Spice Heritage",
      excerpt: "If you look at a traditional spread of Kashmiri Wazwan, you will be struck by a brilliant, fiery sea of crimson. Dishes like Rogan Josh and Rista sit on the copper Trami glistening..."
    },
    {
      title: "Nadru (Lotus Stem): Kashmir's Most Loved Vegetable",
      slug: "nadru-lotus-stem-kashmir",
      summary: "Dive deep into the waters of Dal Lake to discover the crunchy, versatile lotus stem that anchors the Kashmiri vegetable diet.",
      readTime: "5 min read",
      date: "June 23, 2026",
      author: "Zoya Jan",
      category: "Heritage Cookery",
      excerpt: "While the fame of Kashmiri cuisine often centers around the meat-heavy Wazwan, no vegetable commands as much respect, love, and cultural significance in the valley as Nadru—the lotus stem..."
    },
    {
      title: "Fennel and Dry Ginger: The Flavor Foundation of Traditional Wazwan",
      slug: "fennel-and-dry-ginger-wazwan",
      summary: "Understanding the sweet aniseed and pungent warmth that creates the complex, aromatic backbone of Kashmiri meat dishes.",
      readTime: "6 min read",
      date: "June 23, 2026",
      author: "Waza Rashid",
      category: "Spice Heritage",
      excerpt: "When outsiders attempt to recreate Kashmiri cuisine, they often make a critical error: they reach for the onion, garlic, and tomato. While these ingredients dominate the rest of the Indian subcontinent..."
    }
  ];

  const filteredPosts = selectedCategory === "All" 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen pt-28 pb-32 px-6 page-shell flex flex-col items-center">
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent pointer-events-none z-0" />
      
      <div className="w-full max-w-5xl relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-12 text-center"
        >
          <span className="text-[var(--saffron)] font-bold tracking-[0.2em] uppercase text-[0.65rem] mb-3 block">Wazwan Way Journal</span>
          <h1 className="font-display text-4xl md:text-6xl text-white mb-6">Culinary Stories & Secrets</h1>
          <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Deep dives into the ancient traditions, cooking techniques, and daily rituals that shape the gastronomic heritage of the Kashmiri valley.
          </p>
        </motion.div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-12">
          {categories.map((cat) => (
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
        </div>

        {/* Blog Posts Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <motion.article
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[28px] p-6 sm:p-8 flex flex-col justify-between hover:border-[var(--saffron)]/30 hover:shadow-[0_15px_45px_rgba(212,175,55,0.08)] group transition-all h-full"
                >
                  <div>
                    {/* Category & Read Time */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[var(--saffron)] font-bold tracking-[0.15em] uppercase text-[0.6rem] bg-[var(--saffron)]/10 px-3 py-1 rounded-full border border-[var(--saffron)]/20">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1.5 text-white/40 text-[0.65rem] uppercase tracking-wider font-semibold">
                        <Clock className="w-3.5 h-3.5" /> {post.readTime}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-xl sm:text-2xl text-white mb-3 group-hover:text-[var(--saffron)] transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-white/50 text-xs sm:text-sm leading-relaxed mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Footer Metadata */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-4 text-[0.65rem] uppercase tracking-wider font-bold text-white/50">
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-[var(--saffron)]" /> {post.author}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-[var(--saffron)] group-hover:text-black flex items-center justify-center text-white/55 transition-all">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.article>
              </Link>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
