"use client";

import Link from "next/link";
import { ArrowLeft, Clock, User, Search } from "lucide-react";
import { useState } from "react";

export default function GuidebookIndexClient({ categoryArticles, label, category }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = categoryArticles.filter((article) => {
    const query = searchQuery.toLowerCase();
    return (
      article.title.toLowerCase().includes(query) ||
      article.description.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen pt-28 pb-32 px-4 sm:px-6 lg:px-8 flex flex-col items-center page-shell relative">
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent pointer-events-none z-0" />
      <div className="w-full max-w-4xl relative z-10">
        <Link 
          href={`/kashmiri-food/${category}`} 
          className="inline-flex items-center gap-2 text-white/50 hover:text-[var(--saffron)] transition-colors mb-10 text-xs sm:text-sm uppercase tracking-wider font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {label} Catalog
        </Link>
        
        <div className="mb-12">
          <span className="text-[var(--saffron)] font-bold tracking-[0.2em] uppercase text-[0.65rem] mb-3 block">
            Culinary Guides & Rituals
          </span>
          <h1 className="font-display text-3xl sm:text-5xl text-white mb-6">
            {label} Guidebook
          </h1>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-2xl mb-8">
            Deep dive articles detailing the preparation, traditions, etiquette, and secrets of {label} dining.
          </p>

          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-white/40" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-[var(--saffron)]/50 focus:ring-1 focus:ring-[var(--saffron)]/50 transition-colors"
              placeholder="Search articles by title or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {filteredArticles.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl border border-white/5 text-center my-12">
            <p className="text-white/40 text-sm mb-4">No articles found matching "{searchQuery}".</p>
            <button 
              onClick={() => setSearchQuery("")}
              className="text-[var(--saffron)] hover:text-amber-400 text-xs uppercase tracking-wider font-bold"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
            {filteredArticles.map((article) => (
              <Link key={article.slug} href={`/kashmiri-food/${category}/guide/${article.slug}`}>
                <article className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 hover:border-[var(--saffron)]/30 hover:shadow-[0_12px_40px_rgba(212,175,55,0.06)] group transition-all duration-300 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[var(--saffron)] font-bold tracking-[0.15em] uppercase text-[0.6rem] bg-[var(--saffron)]/10 px-3 py-1 rounded-full border border-[var(--saffron)]/20">
                        Guide
                      </span>
                      <span className="flex items-center gap-1.5 text-white/40 text-[0.65rem] uppercase tracking-wider font-semibold">
                        <Clock className="w-3.5 h-3.5" /> {article.readTime}
                      </span>
                    </div>
                    <h3 className="font-display text-xl text-white mb-3 group-hover:text-[var(--saffron)] transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-white/50 text-xs sm:text-sm leading-relaxed mb-6 line-clamp-3">
                      {article.description}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                    <span className="text-[0.65rem] uppercase tracking-wider font-bold text-white/50 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[var(--saffron)]" /> {article.author}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--saffron)] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read Guide &rarr;
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
