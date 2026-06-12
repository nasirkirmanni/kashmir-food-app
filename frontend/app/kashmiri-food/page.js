"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { endpoints, request } from "@/lib/api";

function ShimmerSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="border border-white/5 rounded-xl sm:rounded-2xl bg-white/5 p-3 sm:p-6 animate-pulse flex flex-col justify-between h-28 sm:h-48">
          <div>
            <div className="h-3 sm:h-6 bg-white/10 rounded w-2/3 mb-2 sm:mb-4"></div>
            <div className="hidden sm:block h-4 bg-white/5 rounded w-full mb-2"></div>
            <div className="hidden sm:block h-4 bg-white/5 rounded w-5/6"></div>
          </div>
          <div className="flex gap-1 sm:gap-2 mt-2 sm:mt-4">
            <div className="h-4 sm:h-6 bg-white/10 rounded-full w-10 sm:w-16"></div>
            <div className="hidden sm:block h-6 bg-white/10 rounded-full w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DishCard({ dish, linkText = "View Recipe Details" }) {
  return (
    <Link href={`/dishes/${dish.slug || dish._id}`} className="block">
      <div className="wazwan-dish-card flex flex-col justify-between hover:border-[var(--saffron)]/30 h-full">
        {/* Dish Image */}
        <div className="relative h-20 sm:h-40 w-full overflow-hidden bg-white/5 shrink-0">
          <img
            src={dish.image}
            alt={dish.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            onError={(e) => { e.currentTarget.src = '/placeholder-dish.jpg'; e.currentTarget.onerror = null; }}
          />
        </div>
        <div className="p-3 sm:p-6 flex flex-col flex-grow justify-between">
          <div>
            <h4 className="font-display text-[0.65rem] sm:text-xl text-white mb-1 line-clamp-2 leading-tight">{dish.name}</h4>
            <p className="hidden sm:block text-white/60 text-xs leading-relaxed line-clamp-3 mb-4">{dish.description}</p>
          </div>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="hidden sm:flex gap-2">
              <span className="place-badge">{dish.foodType || "Veg"}</span>
              <span className="place-badge">{dish.spiceLevel || dish.priceRange || "Medium"}</span>
            </div>
            <span className="sm:hidden text-[0.55rem] font-bold uppercase tracking-wider text-[var(--saffron)]">
              Explore &rarr;
            </span>
          </div>
        </div>
        <div className="hidden sm:flex px-6 pb-4 border-t border-white/5 pt-3 justify-between items-center bg-black/10 text-[0.65rem] font-bold uppercase tracking-wider text-[var(--saffron)]">
          {linkText} &rarr;
        </div>
      </div>
    </Link>
  );
}

function KashmiriFoodContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Default to null to show the portal view (landing cards)
  const [activeTab, setActiveTab] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Load all dishes upfront on mount
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

  // Listen to URL search parameter modifications to open correct tabs
  useEffect(() => {
    const urlTab = searchParams.get("tab");
    if (urlTab && ["wazwan", "beverages", "bakery", "street_food"].includes(urlTab)) {
      setActiveTab(urlTab);
    } else {
      setActiveTab(null);
    }
  }, [searchParams]);

  const selectTab = (tabId) => {
    setActiveTab(tabId);
    setSearchQuery("");
    const params = new URLSearchParams(window.location.search);
    if (tabId) {
      params.set("tab", tabId);
      router.replace(`/kashmiri-food?${params.toString()}`, { scroll: false });
    } else {
      params.delete("tab");
      router.replace(`/kashmiri-food`, { scroll: false });
    }
  };

  // Categorize dishes using exact database enum matches for categoryType
  const wazwanDishes = dishes.filter((d) => d.categoryType === "wazwan");
  const beverageDishes = dishes.filter((d) => d.categoryType === "beverage");
  const bakeryDishes = dishes.filter((d) => d.categoryType === "bakery");
  
  // Constrain Street Food to items explicitly classified as kashmiri_cuisine AND categorized as Street Food
  const streetFoodDishes = dishes.filter(
    (d) => d.categoryType === "kashmiri_cuisine" && d.category === "Street Food"
  );

  // Get selected category items
  const getActiveItems = () => {
    switch (activeTab) {
      case "wazwan":
        return wazwanDishes;
      case "beverages":
        return beverageDishes;
      case "bakery":
        return bakeryDishes;
      case "street_food":
        return streetFoodDishes;
      default:
        return [];
    }
  };

  const activeItems = getActiveItems();

  // Filter items by user search query (case-insensitive on name & description)
  const filteredItems = activeItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group Wazwan dishes by courseType
  const wazwanCourses = {
    foundation: filteredItems.filter((d) => d.courseType === "foundation"),
    signature: filteredItems.filter((d) => d.courseType === "signature" || d.courseType === "additional_meat"),
    vegetarian: filteredItems.filter((d) => d.courseType === "vegetarian"),
  };

  // Sort Wazwan foundation courses strictly by traditional serve sequence
  const foundationOrder = ["rice", "seekh kebab", "methi maaz", "tabak maaz", "muji chetin"];
  const sortedWazwanFoundation = [...wazwanCourses.foundation].sort((a, b) => {
    const indexA = foundationOrder.indexOf(a.name.toLowerCase());
    const indexB = foundationOrder.indexOf(b.name.toLowerCase());
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const categories = [
    {
      id: "wazwan",
      label: "Kashmiri Wazwan",
      count: wazwanDishes.length,
      unit: "Dishes",
      desc: "The legendary royal feast slow-cooked by traditional Wazas and served on a copper Trami. Built around 16 authoritative dishes in strict traditional sequence.",
      bgImage: "/images/optimized/wazwan-cover-800.avif",
      icon: (
        <svg className="w-5 h-5 sm:w-8 sm:h-8 text-[var(--saffron)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: "beverages",
      label: "Kashmiri Beverages",
      count: beverageDishes.length,
      unit: "Beverages",
      desc: "Authentic Kashmiri drinks — Noon Chai, Saffron Kahwa, Babribyol, and creamy Kashmiri Lassi.",
      icon: (
        <svg className="w-5 h-5 sm:w-8 sm:h-8 text-[var(--saffron)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.5 8.5v3a3.5 3.5 0 01-7 0v-3h7z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.5 9h1.5a1.5 1.5 0 011.5 1.5v1a1.5 1.5 0 01-1.5 1.5h-1.5" />
        </svg>
      )
    },
    {
      id: "bakery",
      label: "Kashmiri Bakery",
      count: bakeryDishes.length,
      unit: "Breads",
      desc: "The unique neighborhood bakery culture featuring clay-oven flatbreads like Girda, Czochworu, and Bakerkhani.",
      bgImage: "/images/optimized/bakery-cover-800.avif",
      icon: (
        <svg className="w-5 h-5 sm:w-8 sm:h-8 text-[var(--saffron)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657a8 8 0 01-11.314 0zM12 2C8 6 6 10 6 14a6 6 0 0012 0c0-4-2-8-6-12z" />
        </svg>
      )
    },
    {
      id: "street_food",
      label: "Kashmiri Street Food",
      count: streetFoodDishes.length,
      unit: "Eats",
      desc: "Rustic street treats from coal-grilled Tujji skewers to winter Harissa pastes found in Srinagar's bazaars.",
      bgImage: "/images/optimized/street-food-cover-800.avif",
      icon: (
        <svg className="w-5 h-5 sm:w-8 sm:h-8 text-[var(--saffron)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

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

      {/* Center-aligned container wrapper to prevent any viewport layout overflow */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full box-border">
        
        {/* Hero Header */}
        <section className="place-hero !grid-cols-1 md:!grid-cols-[1fr_auto] gap-8 items-center border-b border-white/5 pb-12">
          <div>
            <span className="place-eyebrow">Culinary Identity of the Valley</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tight mb-4">
              Kashmiri Food Guide
            </h1>
            <p className="text-white/70 max-w-2xl text-base md:text-lg leading-relaxed">
              Explore the authentic culinary traditions of Kashmir. Choose a category below to open its dedicated catalog and discover recipes, traditions, and custom pairings.
            </p>
          </div>
          <div>
            <Link href="/" className="wazwan-btn-ghost text-xs uppercase tracking-widest font-bold border border-white/10 px-6 py-3 rounded-full hover:border-white/30">
              &larr; Back to Home
            </Link>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            {activeTab === null ? (
              /* PORTAL Landing Grid: 3-columns on mobile, 2-columns on desktop */
              <motion.div
                key="portal"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-2 gap-3 sm:gap-6 max-w-6xl mx-auto my-12"
              >
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => selectTab(category.id)}
                    className="w-full text-left glass-panel p-3.5 sm:p-8 rounded-xl sm:rounded-2xl border border-white/5 hover:border-[var(--saffron)]/30 transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(212,175,55,0.08)] flex flex-col justify-between h-36 sm:h-64 group relative overflow-hidden"
                  >
                    {/* Cover image background for categories with bgImage */}
                    {category.bgImage && (
                      <>
                        <picture>
                          <source media="(max-width: 768px)" srcSet={category.bgImage ? category.bgImage.replace('-800.avif', '-400.avif') : ''} />
                          <img
                            src={category.bgImage}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-35 transition-opacity duration-500 scale-100 group-hover:scale-105"
                          />
                        </picture>
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black/85 z-0" />
                      </>
                    )}

                    <div className="absolute top-0 right-0 p-3 sm:p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity z-10">
                      {category.icon}
                    </div>
                    <div className="w-full z-10">
                      <div className="mb-3 sm:mb-4">
                        <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 group-hover:border-[var(--saffron)]/30 transition-colors inline-flex items-center justify-center shrink-0">
                          {category.icon}
                        </div>
                      </div>
                      <h3 className="text-sm sm:text-2xl font-display font-medium text-white group-hover:text-[var(--saffron)] transition-colors mb-1 sm:mb-2 line-clamp-2">
                        {category.label}
                      </h3>
                      <p className="hidden sm:block text-white/60 text-xs md:text-sm leading-relaxed max-w-md">
                        {category.desc}
                      </p>
                    </div>
                    <div className="flex items-end justify-between w-full z-10">
                      <div className="hidden sm:flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-wider text-[var(--saffron)]">
                        Explore Catalog <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                      </div>
                      <span className="place-badge !bg-[var(--saffron-pale)] !border-[var(--saffron)]/20 !text-[var(--saffron)] text-[0.6rem] sm:text-[0.7rem] font-bold py-0.5 sm:py-1 px-1.5 sm:px-3 ml-auto">
                        {loading ? (
                          <span className="h-2 sm:h-3 w-6 sm:w-10 bg-[var(--saffron)]/20 rounded animate-pulse inline-block align-middle"></span>
                        ) : (
                          `${category.count} ${category.unit === "Dishes" ? "Items" : category.unit}`
                        )}
                      </span>
                    </div>
                  </button>
                ))}
              </motion.div>
            ) : (
              /* ACTIVE TAB VIEW with Subnav and Search */
              <motion.div
                key="tabs-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                {/* Sticky sub-navigation & search bar */}
                <div className="sticky top-20 z-40 bg-[#0B0B0B]/95 border-b border-white/5 py-4 my-8 -mx-4 px-4 flex flex-col gap-4">
                  <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
                    {/* Category switcher tabs */}
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth w-full md:w-auto">
                      <button
                        onClick={() => selectTab(null)}
                        className="shrink-0 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-white/80 border border-white/5 hover:border-white/20 transition-all flex items-center gap-2"
                      >
                        &larr; Categories
                      </button>
                      <div className="h-6 w-px bg-white/10 hidden sm:block"></div>
                      {categories.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => selectTab(tab.id)}
                          className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border shadow-sm ${
                            activeTab === tab.id
                              ? "bg-[var(--saffron)] text-black border-[var(--saffron)] shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                              : "bg-white/5 text-white/60 border-white/5 hover:border-white/20 hover:text-white"
                          }`}
                        >
                          {tab.label} {!loading && `(${tab.count})`}
                        </button>
                      ))}
                    </div>

                    {/* Search Bar Input */}
                    <div className="relative w-full md:w-80 shrink-0">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        placeholder="Search within category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-full text-xs text-white placeholder-white/40 focus:outline-none focus:border-[var(--saffron)]/50 focus:bg-white/10 focus:ring-1 focus:ring-[var(--saffron)]/20 transition-all"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-white/40 hover:text-white transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shimmer skeleton or dynamic content lists */}
                {loading ? (
                  <ShimmerSkeleton />
                ) : filteredItems.length === 0 ? (
                  /* Search Not Found view */
                  <div className="text-center py-20 border border-white/5 bg-white/5 rounded-2xl">
                    <svg className="w-12 h-12 text-white/20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-white/60 text-sm">No items match your search &quot;{searchQuery}&quot;</p>
                    <button onClick={() => setSearchQuery("")} className="mt-4 text-xs font-bold text-[var(--saffron)] hover:text-white transition-colors uppercase tracking-widest">
                      Clear Search Filter
                    </button>
                  </div>
                ) : (
                  /* Dynamic lists by selected category */
                  <div className="mt-8">
                    {activeTab === "wazwan" && (
                      <div>
                        {/* Wazwan traditional intro details */}
                        <div className="flex flex-col lg:flex-row gap-8 items-start mb-12">
                          <div className="lg:w-1/2">
                            <span className="text-[var(--saffron)] text-[0.65rem] font-bold uppercase tracking-[0.25em] block mb-2">
                              Traditional Feast Platter
                            </span>
                            <h2 className="text-3xl md:text-4xl font-display font-medium text-white mb-4">
                              Kashmiri Wazwan Trami
                            </h2>
                            <p className="text-white/70 leading-relaxed text-sm md:text-base">
                              The traditional Wazwan is a masterclass in meat preparation, typically cooked by a master chef called a <em>Waza</em>. It is a formal social ritual where four guests sit together around a large engraved copper platter called the <strong>Trami</strong>. 
                            </p>
                            <p className="text-white/65 leading-relaxed text-sm mt-3">
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
                              <li>Guests wash hands in a mobile copper basin, the <strong>Tash-t-Næær</strong>, brought right to their seat.</li>
                              <li>The platter is covered by a dome lid called a <strong>Sarposh</strong>, which is removed only when all guests are seated.</li>
                              <li>Dishes are eaten collectively with fingers directly from the trami platter, symbolizing brotherhood and equality.</li>
                            </ul>
                          </div>
                        </div>

                        {/* Grouped wazwan course listings */}
                        <div className="space-y-12">
                          {/* Foundation Courses (sorted in serve sequence) */}
                          {sortedWazwanFoundation.length > 0 && (
                            <div>
                              <h3 className="text-lg font-bold uppercase tracking-widest text-white/50 border-b border-white/5 pb-2 mb-6">
                                Foundation Courses <span className="text-[var(--saffron)] text-xs"> (Placed directly on the Trami on arrival)</span>
                              </h3>
                              <div className="grid grid-cols-3 gap-2 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {sortedWazwanFoundation.map((dish) => (
                                  <DishCard key={dish._id} dish={dish} linkText="View Recipe Details" />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Signature Meat Courses */}
                          {wazwanCourses.signature.length > 0 && (
                            <div>
                              <h3 className="text-lg font-bold uppercase tracking-widest text-white/50 border-b border-white/5 pb-2 mb-6">
                                Signature Meat Courses <span className="text-[var(--saffron)] text-xs"> (Slow-cooked lamb masterpieces served sequentially)</span>
                              </h3>
                              <div className="grid grid-cols-3 gap-2 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {wazwanCourses.signature.map((dish) => (
                                  <DishCard key={dish._id} dish={dish} linkText="View Recipe Details" />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Vegetarian Accompaniments */}
                          {wazwanCourses.vegetarian.length > 0 && (
                            <div>
                              <h3 className="text-lg font-bold uppercase tracking-widest text-white/50 border-b border-white/5 pb-2 mb-6">
                                Vegetarian Accompaniments <span className="text-[var(--saffron)] text-xs"> (Earthy vegetables served to balance rich meats)</span>
                              </h3>
                              <div className="grid grid-cols-3 gap-2 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {wazwanCourses.vegetarian.map((dish) => (
                                  <DishCard key={dish._id} dish={dish} linkText="View Recipe Details" />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === "beverages" && (
                      <div>
                        <div className="mb-12">
                          <span className="text-[var(--saffron)] text-[0.65rem] font-bold uppercase tracking-[0.25em] block mb-2">
                            Warmth in a Cup
                          </span>
                          <h2 className="text-3xl md:text-4xl font-display font-medium text-white mb-4">
                            Kashmiri Beverages
                          </h2>
                          <p className="text-white/70 max-w-3xl text-sm md:text-base leading-relaxed">
                            The climate of Kashmir shapes its beverage customs. From the iconic pink-hued Noon Chai served with fresh bakery bread, to saffron-infused Kahwa brewed in charcoal Samovars, creamy Kashmiri Lassi, and the fragrant Babribyol — these are the authentic drinks of the valley.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
                          {filteredItems.map((dish) => (
                            <DishCard key={dish._id} dish={dish} linkText="View Beverage Profile" />
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "bakery" && (
                      <div>
                        <div className="flex flex-col lg:flex-row gap-8 items-start mb-12">
                          <div className="lg:w-1/2">
                            <span className="text-[var(--saffron)] text-[0.65rem] font-bold uppercase tracking-[0.25em] block mb-2">
                              The Kandur-Wan
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
                              <span className="text-white/80"><strong>Girda:</strong> Breakfast flatbread</span>
                              <span className="text-[var(--saffron)] font-mono">6:00 AM – 9:00 AM</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 pb-2">
                              <span className="text-white/80"><strong>Czochworu:</strong> Sesame afternoon bread</span>
                              <span className="text-[var(--saffron)] font-mono">3:30 PM – 5:30 PM</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/80"><strong>Bakerkhani:</strong> Golden flaky puff</span>
                              <span className="text-[var(--saffron)] font-mono">4:00 PM – 6:00 PM</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                          {filteredItems.map((dish) => (
                            <DishCard key={dish._id} dish={dish} linkText="View Baking Details" />
                          ))}
                        </div>
                      </div>
                    )}

                    {activeTab === "street_food" && (
                      <div>
                        <div className="mb-12">
                          <span className="text-[var(--saffron)] text-[0.65rem] font-bold uppercase tracking-[0.25em] block mb-2">
                            Local Street Staples
                          </span>
                          <h2 className="text-3xl md:text-4xl font-display font-medium text-white mb-4">
                            Kashmiri Street Food
                          </h2>
                          <p className="text-white/70 max-w-3xl text-sm md:text-base leading-relaxed">
                            The bustling streets of Downtown Srinagar and local bazaar stalls serve incredibly rich and rustic street food. From coal-grilled Tujji skewers wrapped in tandoor Lavas to slow-cooked winter Harissa pastes.
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                          {filteredItems.map((dish) => (
                            <DishCard key={dish._id} dish={dish} linkText="View Street Food Info" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function KashmiriFoodPage() {
  return (
    <Suspense fallback={<div className="places-wrap py-24 text-[var(--muted)]">Loading Kashmiri Food...</div>}>
      <KashmiriFoodContent />
    </Suspense>
  );
}
