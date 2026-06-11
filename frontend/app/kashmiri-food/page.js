"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { endpoints, request } from "@/lib/api";

function KashmiriFoodContent() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    setLoading(true);
    request(endpoints.dishes())
      .then((data) => setDishes(data))
      .catch((err) => {
        console.error("Failed to fetch dishes:", err);
        setError("Failed to load Kashmiri food catalog. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Categorize dishes
  const wazwanDishes = dishes.filter((d) => d.categoryType === "wazwan");
  const beverageDishes = dishes.filter((d) => d.categoryType === "beverage");
  const bakeryDishes = dishes.filter((d) => d.categoryType === "bakery");
  // In our DB model, everyday home-style & street food are tagged as 'kashmiri_cuisine'
  const streetFoodDishes = dishes.filter((d) => d.categoryType === "kashmiri_cuisine");

  // Group Wazwan dishes by courseType
  const wazwanCourses = {
    foundation: wazwanDishes.filter((d) => d.courseType === "foundation"),
    signature: wazwanDishes.filter((d) => d.courseType === "signature"),
    vegetarian: wazwanDishes.filter((d) => d.courseType === "vegetarian"),
  };

  const tabs = [
    { id: "all", label: "All Food" },
    { id: "wazwan", label: "Kashmiri Wazwan", count: wazwanDishes.length },
    { id: "beverages", label: "Kashmiri Beverages", count: beverageDishes.length },
    { id: "bakery", label: "Kashmiri Bakery", count: bakeryDishes.length },
    { id: "street_food", label: "Kashmiri Street Food", count: streetFoodDishes.length },
  ];

  const scrollToSection = (id) => {
    setActiveTab(id);
    if (id === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100; // Offset for navbar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="wazwan-shell min-h-screen flex items-center justify-center">
        <div className="text-white/60 animate-pulse text-lg uppercase tracking-widest font-bold">
          Loading Kashmiri Food Catalog...
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

      {/* Hero */}
      <section className="place-hero !grid-cols-1 md:!grid-cols-[1fr_auto] gap-8 items-center border-b border-white/5 pb-12">
        <div>
          <span className="place-eyebrow">Culinary Identity of the Valley</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tight mb-4">
            Kashmiri Food Guide
          </h1>
          <p className="text-white/70 max-w-2xl text-base md:text-lg leading-relaxed">
            Explore the authentic culinary traditions of Kashmir. From the highly structured 16-dish ceremonial <strong>Wazwan Trami</strong> feast to neighborhood clay-oven <strong>bakery goods</strong>, unique warming <strong>beverages</strong>, and rich downtown <strong>street foods</strong>.
          </p>
        </div>
        <div>
          <Link href="/" className="wazwan-btn-ghost text-xs uppercase tracking-widest font-bold border border-white/10 px-6 py-3 rounded-full hover:border-white/30">
            &larr; Back to Home
          </Link>
        </div>
      </section>

      {/* Navigation Pills */}
      <div className="sticky top-20 z-40 bg-[#0B0B0B]/90 backdrop-blur-md border-b border-white/5 py-4 my-8 -mx-4 px-4 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => scrollToSection(tab.id)}
            className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border ${
              activeTab === tab.id
                ? "bg-[var(--saffron)] text-black border-[var(--saffron)]"
                : "bg-white/5 text-white/60 border-white/5 hover:border-white/20 hover:text-white"
            }`}
          >
            {tab.label} {tab.count !== undefined && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* --- Section 1: Wazwan --- */}
      <section id="wazwan" className="scroll-mt-36 border-b border-white/5 pb-20 mb-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start mb-12">
          <div className="lg:w-1/2">
            <span className="text-[var(--saffron)] text-[0.65rem] font-bold uppercase tracking-[0.25em] block mb-2">
              01. The Royal Banquet
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-white mb-4">
              Kashmiri Wazwan
            </h2>
            <p className="text-white/70 leading-relaxed text-sm md:text-base">
              The traditional Wazwan is a masterclass in meat preparation, typically cooked by a master chef called a <em>Waza</em>. It is not simply a meal, but a formal social ritual where four guests sit together around a large engraved copper platter called the <strong>Trami</strong>. 
            </p>
            <p className="text-white/60 leading-relaxed text-sm mt-3">
              Only exactly <strong>16 authoritative dishes</strong> make up the official trami banquet sequence. Every dish is served in a strict traditional progression.
            </p>
          </div>
          <div className="lg:w-1/2 bg-[var(--saffron-pale)] border border-[var(--saffron)]/10 rounded-2xl p-6 backdrop-blur-md">
            <h4 className="text-[var(--saffron)] text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Trami Platter Etiquette
            </h4>
            <ul className="text-xs text-white/80 space-y-2.5 list-disc list-inside leading-relaxed">
              <li>Guests must wash their hands in a mobile copper basin, the <strong>Tash-t-Næær</strong>, brought right to their seat.</li>
              <li>The platter is covered by a dome lid called a <strong>Sarposh</strong>, which is removed only when all four guests are seated.</li>
              <li>Dishes are eaten collectively with fingers directly from the trami platter. Sharing symbolizes absolute brotherhood and equality.</li>
            </ul>
          </div>
        </div>

        {/* Wazwan Courses Groupings */}
        <div className="space-y-12">
          {/* Foundation */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-widest text-white/50 border-b border-white/5 pb-2 mb-6">
              Foundation Courses <span className="text-[var(--saffron)] text-xs"> (Placed directly on the Trami on arrival)</span>
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {wazwanCourses.foundation.map((dish) => (
                <div key={dish._id} className="wazwan-dish-card flex flex-col justify-between">
                  <div className="p-6">
                    <h4 className="font-display text-xl text-white mb-2">{dish.name}</h4>
                    <p className="text-white/60 text-xs leading-relaxed mb-4">{dish.description}</p>
                    <div className="flex gap-2">
                      <span className="place-badge">{dish.foodType}</span>
                      <span className="place-badge">{dish.spiceLevel}</span>
                    </div>
                  </div>
                  <div className="px-6 pb-6 border-t border-white/5 pt-4 flex justify-between items-center bg-black/10">
                    <Link href={`/dishes/${dish.slug || dish._id}`} className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--saffron)] hover:text-white transition-colors">
                      View Recipe Details &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signature Meat */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-widest text-white/50 border-b border-white/5 pb-2 mb-6">
              Signature Meat Courses <span className="text-[var(--saffron)] text-xs"> (Slow-cooked lamb masterpieces served sequentially)</span>
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {wazwanCourses.signature.map((dish) => (
                <div key={dish._id} className="wazwan-dish-card flex flex-col justify-between">
                  <div className="p-6">
                    <h4 className="font-display text-xl text-white mb-2">{dish.name}</h4>
                    <p className="text-white/60 text-xs leading-relaxed mb-4">{dish.description}</p>
                    <div className="flex gap-2">
                      <span className="place-badge">{dish.foodType}</span>
                      <span className="place-badge">{dish.spiceLevel}</span>
                    </div>
                  </div>
                  <div className="px-6 pb-6 border-t border-white/5 pt-4 flex justify-between items-center bg-black/10">
                    <Link href={`/dishes/${dish.slug || dish._id}`} className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--saffron)] hover:text-white transition-colors">
                      View Recipe Details &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vegetarian Accompaniments */}
          <div>
            <h3 className="text-lg font-bold uppercase tracking-widest text-white/50 border-b border-white/5 pb-2 mb-6">
              Vegetarian Accompaniments <span className="text-[var(--saffron)] text-xs"> (Earthy vegetables served to balance rich meats)</span>
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {wazwanCourses.vegetarian.map((dish) => (
                <div key={dish._id} className="wazwan-dish-card flex flex-col justify-between">
                  <div className="p-6">
                    <h4 className="font-display text-xl text-white mb-2">{dish.name}</h4>
                    <p className="text-white/60 text-xs leading-relaxed mb-4">{dish.description}</p>
                    <div className="flex gap-2">
                      <span className="place-badge">{dish.foodType}</span>
                      <span className="place-badge">{dish.spiceLevel}</span>
                    </div>
                  </div>
                  <div className="px-6 pb-6 border-t border-white/5 pt-4 flex justify-between items-center bg-black/10">
                    <Link href={`/dishes/${dish.slug || dish._id}`} className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--saffron)] hover:text-white transition-colors">
                      View Recipe Details &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 2: Beverages --- */}
      <section id="beverages" className="scroll-mt-36 border-b border-white/5 pb-20 mb-20">
        <div className="mb-12">
          <span className="text-[var(--saffron)] text-[0.65rem] font-bold uppercase tracking-[0.25em] block mb-2">
            02. Warmth in a Cup
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-medium text-white mb-4">
            Kashmiri Beverages
          </h2>
          <p className="text-white/70 max-w-3xl text-sm md:text-base leading-relaxed">
            The climate of Kashmir shapes its hot beverage customs. Spiced green teas served from charcoal Samovars provide essential warmth and help digest the rich meats of the valley.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {beverageDishes.map((dish) => (
            <div key={dish._id} className="wazwan-dish-card flex flex-col justify-between hover:border-[var(--saffron)]/30">
              <div className="p-6">
                <h3 className="font-display text-2xl text-white mb-2">{dish.name}</h3>
                <p className="text-white/60 text-xs leading-relaxed mb-4">{dish.description}</p>
                <div className="flex gap-2">
                  <span className="place-badge">{dish.spiceLevel}</span>
                  <span className="place-badge">{dish.priceRange}</span>
                </div>
              </div>
              <div className="px-6 pb-6 border-t border-white/5 pt-4 flex justify-between items-center bg-black/10">
                <Link href={`/dishes/${dish.slug || dish._id}`} className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--saffron)] hover:text-white transition-colors">
                  View Beverage Profile &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Section 3: Bakery --- */}
      <section id="bakery" className="scroll-mt-36 border-b border-white/5 pb-20 mb-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start mb-12">
          <div className="lg:w-1/2">
            <span className="text-[var(--saffron)] text-[0.65rem] font-bold uppercase tracking-[0.25em] block mb-2">
              03. The Kandur-Wan
            </span>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-white mb-4">
              Kashmiri Bakery
            </h2>
            <p className="text-white/70 leading-relaxed text-sm md:text-base">
              Kashmir has a unique neighborhood bakery culture. Bread is never baked in households. Instead, locals visit the community clay-oven bakery, the <strong>Kandur-wan</strong>, fresh every morning and afternoon to buy hot hand-crafted flatbreads.
            </p>
          </div>
          <div className="lg:w-1/2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md text-xs space-y-3">
            <h4 className="text-[var(--saffron)] font-bold uppercase tracking-wider">Hourly Kandur Custom</h4>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-white/80"><strong>Girda:</strong> Tandoor breakfast flatbread</span>
              <span className="text-[var(--saffron)] font-mono">6:00 AM – 9:00 AM</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-white/80"><strong>Czochworu:</strong> Sesame bagel-like bread</span>
              <span className="text-[var(--saffron)] font-mono">3:30 PM – 5:30 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/80"><strong>Bakerkhani:</strong> Golden laminated flaky puff</span>
              <span className="text-[var(--saffron)] font-mono">4:00 PM – 6:00 PM</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bakeryDishes.map((dish) => (
            <div key={dish._id} className="wazwan-dish-card flex flex-col justify-between hover:border-[var(--saffron)]/30">
              <div className="p-6">
                <h3 className="font-display text-2xl text-white mb-2">{dish.name}</h3>
                <p className="text-white/60 text-xs leading-relaxed mb-4">{dish.description}</p>
                <div className="flex gap-2">
                  <span className="place-badge">Bakery</span>
                  <span className="place-badge">{dish.priceRange}</span>
                </div>
              </div>
              <div className="px-6 pb-6 border-t border-white/5 pt-4 flex justify-between items-center bg-black/10">
                <Link href={`/dishes/${dish.slug || dish._id}`} className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--saffron)] hover:text-white transition-colors">
                  View Baking Details &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Section 4: Street Food --- */}
      <section id="street_food" className="scroll-mt-36 pb-12">
        <div className="mb-12">
          <span className="text-[var(--saffron)] text-[0.65rem] font-bold uppercase tracking-[0.25em] block mb-2">
            04. Local Street Staples
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-medium text-white mb-4">
            Kashmiri Street Food
          </h2>
          <p className="text-white/70 max-w-3xl text-sm md:text-base leading-relaxed">
            The bustling streets of Downtown Srinagar and local bazaar stalls serve incredibly rich and rustic street food. From coal-grilled Tujji skewers wrapped in tandoor Lavas to slow-cooked winter Harissa pastes.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {streetFoodDishes.map((dish) => (
            <div key={dish._id} className="wazwan-dish-card flex flex-col justify-between hover:border-[var(--saffron)]/30">
              <div className="p-6">
                <h3 className="font-display text-2xl text-white mb-2">{dish.name}</h3>
                <p className="text-white/60 text-xs leading-relaxed mb-4">{dish.description}</p>
                <div className="flex gap-2">
                  <span className="place-badge">{dish.foodType}</span>
                  <span className="place-badge">{dish.priceRange}</span>
                </div>
              </div>
              <div className="px-6 pb-6 border-t border-white/5 pt-4 flex justify-between items-center bg-black/10">
                <Link href={`/dishes/${dish.slug || dish._id}`} className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--saffron)] hover:text-white transition-colors">
                  View Street Food Info &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function KashmiriFoodPage() {
  return (
    <Suspense fallback={<div className="places-wrap py-24 text-[var(--muted)]">Loading catalog...</div>}>
      <KashmiriFoodContent />
    </Suspense>
  );
}
