"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { endpoints, request } from "@/lib/api";

function DishesPageContent() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    // Fetch only traditional wazwan dishes
    request(endpoints.dishes("?categoryType=wazwan"))
      .then((data) => setDishes(data))
      .catch((err) => {
        console.error("Failed to load traditional Wazwan dishes:", err);
        setError("Failed to load traditional Wazwan dishes. Please try again later.");
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

  // Filter core wazwan dishes
  const coreDishes = dishes.filter(d => coreDishNames.includes(d.name.toLowerCase()));

  // Group dishes by course
  const courses = {
    foundation: dishes.filter(d => d.courseType === "foundation"),
    signature: dishes.filter(d => d.courseType === "signature"),
    vegetarian: dishes.filter(d => d.courseType === "vegetarian")
  };

  if (loading) {
    return (
      <div className="wazwan-shell min-h-screen flex items-center justify-center">
        <div className="text-white/60 animate-pulse text-lg uppercase tracking-widest font-bold">
          Loading Traditional Wazwan Catalog...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wazwan-shell min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="wazwan-btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wazwan-shell relative min-h-screen pb-24">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.06),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.03),transparent_70%)] pointer-events-none" />

      {/* Container for all content */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="place-hero !grid-cols-1 md:!grid-cols-[1fr_auto] gap-8 items-center border-b border-white/5 pb-12" style={{ maxWidth: 'none', margin: '0' }}>
          <div>
            <span className="place-eyebrow">The Royal Feast</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tight mb-4">
              Traditional Wazwan
            </h1>
            <p className="text-white/70 max-w-2xl text-base md:text-lg leading-relaxed">
              The traditional Kashmiri Wazwan is a formal 36-course banquet cooked by master chefs (Wazas). Today, the authoritative Trami sequence centers around exactly <strong>16 historical dishes</strong> served on the engraved copper platter.
            </p>
          </div>
          <div>
            <Link href="/kashmiri-food" className="wazwan-btn-ghost text-xs uppercase tracking-widest font-bold border border-white/10 px-6 py-3 rounded-full hover:border-white/30">
              View All Kashmiri Food &rarr;
            </Link>
          </div>
        </section>

        {/* Must-Have Core Dishes Highlights */}
        <section className="mt-12">
          <div className="mb-8 border-l-2 border-[var(--saffron)] pl-4">
            <h2 className="text-2xl md:text-4xl font-display font-medium text-white">
              The 10 Core Wazwan Masterpieces
            </h2>
            <p className="text-white/50 text-xs md:text-base mt-1">
              These dishes define the culinary soul of the traditional Wazwan experience.
            </p>
          </div>

          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {coreDishes.map((dish) => (
              <motion.article
                key={dish._id}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="wazwan-dish-card flex flex-col justify-between border-[var(--saffron)]/20 shadow-[0_0_30px_rgba(212,175,55,0.05)]"
              >
                <div className="relative h-[220px] w-full overflow-hidden bg-white/5">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    onError={(e) => { e.currentTarget.src = '/placeholder-dish.jpg'; e.currentTarget.onerror = null; }}
                  />
                  <div className="absolute top-4 left-4 bg-[var(--saffron)] text-black font-bold uppercase tracking-widest text-[0.6rem] px-2.5 py-1 rounded">
                    Core Dish
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--saffron)]">
                    {dish.courseType} Course
                  </p>
                  <h3 className="font-display mt-2 text-2xl text-white">{dish.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{dish.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="place-badge">{dish.foodType}</span>
                    <span className="place-badge">{dish.spiceLevel}</span>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-4 border-t border-white/5 flex justify-between items-center bg-black/20">
                  <Link href={`/dishes/${dish.slug || dish._id}`} className="bg-[var(--saffron)] text-black font-bold px-4 py-2 rounded hover:bg-[var(--saffron-light)] transition-colors">
                    View Dish Details
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Traditional Trami Progression Sections */}
        <section className="mt-24 border-t border-white/5 pt-16">
          <div className="text-center mb-16">
            <span className="text-[var(--saffron)] text-xs font-bold uppercase tracking-[0.2em] block mb-2">Trami Ritual Sequence</span>
            <h2 className="text-3xl md:text-5xl font-display font-medium text-white">The 16 Authoritative Dishes</h2>
          </div>

          {/* Foundation */}
          <div className="mb-20">
            <div className="border-b border-white/10 pb-3 mb-8">
              <h3 className="text-xl font-bold uppercase tracking-widest text-white/80">
                Foundation Courses
              </h3>
              <p className="text-xs text-white/40 mt-1">Dishes served directly on the rice bed when the trami is placed before the guests.</p>
            </div>
            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {courses.foundation.map((dish) => (
                <div key={dish._id} className="wazwan-dish-card flex flex-col justify-between">
                  <div className="p-6">
                    <h4 className="font-display text-2xl text-white mb-2">{dish.name}</h4>
                    <p className="text-white/60 text-xs leading-relaxed mb-4">{dish.description}</p>
                    <div className="flex gap-2">
                      <span className="place-badge">{dish.foodType}</span>
                      <span className="place-badge">{dish.priceRange}</span>
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-4 border-t border-white/5 bg-black/10 flex justify-between items-center">
                    <Link href={`/dishes/${dish.slug || dish._id}`} className="text-xs font-bold text-[var(--saffron)] hover:text-white transition-colors">
                      Explore Details &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signature */}
          <div className="mb-20">
            <div className="border-b border-white/10 pb-3 mb-8">
              <h3 className="text-xl font-bold uppercase tracking-widest text-white/80">
                Signature Meat Courses
              </h3>
              <p className="text-xs text-white/40 mt-1">The primary mutton and chicken gravies slow-cooked over wood fire and served one by one.</p>
            </div>
            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {courses.signature.map((dish) => (
                <div key={dish._id} className="wazwan-dish-card flex flex-col justify-between">
                  <div className="p-6">
                    <h4 className="font-display text-2xl text-white mb-2">{dish.name}</h4>
                    <p className="text-white/60 text-xs leading-relaxed mb-4">{dish.description}</p>
                    <div className="flex gap-2">
                      <span className="place-badge">{dish.foodType}</span>
                      <span className="place-badge">{dish.priceRange}</span>
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-4 border-t border-white/5 bg-black/10 flex justify-between items-center">
                    <Link href={`/dishes/${dish.slug || dish._id}`} className="text-xs font-bold text-[var(--saffron)] hover:text-white transition-colors">
                      Explore Details &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vegetarian Accompaniments */}
          <div>
            <div className="border-b border-white/10 pb-3 mb-8">
              <h3 className="text-xl font-bold uppercase tracking-widest text-white/80">
                Vegetarian Accompaniments
              </h3>
              <p className="text-xs text-white/40 mt-1">Collards, potatoes, and lotus roots cooked in yogurt to refresh the palate between meats.</p>
            </div>
            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {courses.vegetarian.map((dish) => (
                <div key={dish._id} className="wazwan-dish-card flex flex-col justify-between">
                  <div className="p-6">
                    <h4 className="font-display text-2xl text-white mb-2">{dish.name}</h4>
                    <p className="text-white/60 text-xs leading-relaxed mb-4">{dish.description}</p>
                    <div className="flex gap-2">
                      <span className="place-badge">{dish.foodType}</span>
                      <span className="place-badge">{dish.priceRange}</span>
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-4 border-t border-white/5 bg-black/10 flex justify-between items-center">
                    <Link href={`/dishes/${dish.slug || dish._id}`} className="text-xs font-bold text-[var(--saffron)] hover:text-white transition-colors">
                      Explore Details &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function DishesPage() {
  return (
    <Suspense fallback={<div className="places-wrap py-24 text-[var(--muted)]">Loading wazwan dishes...</div>}>
      <DishesPageContent />
    </Suspense>
  );
}