"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import dishesData from "@/data/dishes.json";



function DishCard({ dish, linkText = "View Recipe Details" }) {
  const [imgSrc, setImgSrc] = useState(dish.image || '/placeholder-dish.jpg');

  return (
    <Link href={`/dishes/${dish.slug || dish._id}`} className="block">
      <div className="wazwan-dish-card flex flex-col justify-between hover:border-[var(--saffron)]/30 h-full">
        {/* Dish Image */}
        <div className="relative h-20 sm:h-40 w-full overflow-hidden bg-white/5 shrink-0">
          <Image
            src={imgSrc}
            alt={dish.name}
            fill
            quality={70}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            onError={() => setImgSrc('/placeholder-dish.jpg')}
            loading="lazy"
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

function KashmiriFoodContent({ initialDishes = dishesData, activeTab: propTab = null, activeGuide = null }) {
  const router = useRouter();
  
  const [dishes] = useState(initialDishes);
  
  // Use propTab as the source of truth for active tab
  const activeTab = propTab;
  const [searchQuery, setSearchQuery] = useState("");



  const selectTab = (tabId) => {
    setSearchQuery("");
    if (tabId) {
      const urlSlug = tabId === "street_food" ? "street-food" : tabId;
      router.push(`/kashmiri-food/${urlSlug}`, { scroll: false });
    } else {
      router.push(`/kashmiri-food`, { scroll: false });
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
      label: "Kashmiri wazwan",
      count: wazwanDishes.length,
      unit: "items",
      desc: "The legendary royal feast slow-cooked by traditional Wazas and served on a copper Trami.",
      bgImage: "/images/optimized/wazwan-cover-800.avif",
      icon: (
        <svg className="w-5 h-5 text-[var(--saffron)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 20h18M12 4v4M12 8A8 8 0 0 0 4 16h16A8 8 0 0 0 12 8z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      watermark: (
        <svg viewBox="0 0 100 100" fill="none" stroke="rgba(200, 164, 106, 0.08)" strokeWidth="1.5" className="absolute right-1 bottom-1 w-20 h-20 pointer-events-none select-none z-0">
          <ellipse cx="50" cy="55" rx="38" ry="22" />
          <circle cx="34" cy="53" r="8" />
          <circle cx="52" cy="58" r="6" />
          <circle cx="66" cy="50" r="7" />
        </svg>
      )
    },
    {
      id: "beverages",
      label: "Kashmiri beverages",
      count: beverageDishes.length,
      unit: "beverages",
      desc: "Authentic Kashmiri drinks — Noon Chai, Saffron Kahwa, and Babribyol.",
      bgImage: "/images/optimized/Kashmiri-beverages-800.avif",
      icon: (
        <svg className="w-5 h-5 text-[var(--saffron)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      watermark: (
        <svg viewBox="0 0 100 100" fill="none" stroke="rgba(200, 164, 106, 0.08)" strokeWidth="1.5" className="absolute right-1 bottom-1 w-20 h-20 pointer-events-none select-none z-0">
          <path d="M50 15 C30 50, 30 75, 50 85 C70 75, 70 50, 50 15 Z" />
          <path d="M50 35 C42 55, 42 70, 50 78 C58 70, 58 55, 50 35 Z" />
        </svg>
      )
    },
    {
      id: "bakery",
      label: "Kashmiri bakery",
      count: bakeryDishes.length,
      unit: "breads",
      desc: "The neighborhood bakery culture featuring flatbreads like Girda and Bakerkhani.",
      bgImage: "/images/optimized/bakery-cover-800.avif",
      icon: (
        <svg className="w-5 h-5 text-[var(--saffron)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="1.5" />
        </svg>
      ),
      watermark: (
        <svg viewBox="0 0 100 100" fill="none" stroke="rgba(200, 164, 106, 0.08)" strokeWidth="1.5" className="absolute right-1 bottom-1 w-20 h-20 pointer-events-none select-none z-0">
          <circle cx="38" cy="62" r="18" />
          <circle cx="62" cy="58" r="18" />
          <circle cx="50" cy="42" r="16" />
        </svg>
      )
    },
    {
      id: "street_food",
      label: "Street food",
      count: streetFoodDishes.length,
      unit: "eats",
      desc: "Local bazaar treats from coal-grilled Tujji to winter Harissa.",
      bgImage: "/images/optimized/street-food-cover-800.avif",
      icon: (
        <svg className="w-5 h-5 text-[var(--saffron)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="16" cy="16" r="1.5" />
        </svg>
      ),
      watermark: (
        <svg viewBox="0 0 100 100" fill="none" stroke="rgba(200, 164, 106, 0.08)" strokeWidth="1.5" className="absolute right-1 bottom-1 w-20 h-20 pointer-events-none select-none z-0">
          <rect x="25" y="35" width="50" height="35" rx="4" />
          <circle cx="40" cy="52" r="4" />
          <circle cx="60" cy="52" r="4" />
        </svg>
      )
    }
  ];

  return (
    <div className="mt-8 px-4 sm:px-0">
          <AnimatePresence mode="wait">
            {activeTab === null ? (
              /* PORTAL Landing Grid: 3-columns on mobile, 2-columns on desktop */
              <motion.div
                key="portal"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="max-w-6xl mx-auto my-12"
              >
                {/* Premium Header styled to match reference image */}
                <div className="mb-8 text-left">
                  <span className="place-eyebrow !text-[0.62rem] !mb-1.5 block !text-[var(--saffron)] tracking-[0.2em] font-bold">
                    CULINARY IDENTITY OF THE VALLEY
                  </span>
                  <h1 className="text-4xl font-display font-medium tracking-tight text-white mb-3">
                    Kashmiri food guide
                  </h1>
                  <p className="text-white/60 text-xs sm:text-sm leading-relaxed max-w-md">
                    Explore the authentic culinary traditions of Kashmir. Choose a category to open its catalog.
                  </p>
                  
                  {/* Decorative wave separator divider */}
                  <div className="flex items-center justify-between gap-6 my-8">
                    <div className="h-[1px] bg-gradient-to-r from-transparent to-[var(--saffron)]/45 flex-1" />
                    <svg className="w-10 h-4 text-[var(--saffron)] opacity-85 shrink-0" viewBox="0 0 40 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M 2 8 C 8 2, 14 14, 20 8 C 26 2, 32 14, 38 8" strokeLinecap="round" />
                    </svg>
                    <div className="h-[1px] bg-gradient-to-l from-transparent to-[var(--saffron)]/45 flex-1" />
                  </div>
                </div>

                {/* Grid layout with redesigned radial-gradient warm cards */}
                <div className="grid grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => selectTab(category.id)}
                      className="w-full text-left bg-gradient-to-br from-[#2E1D13] to-[#120B07] p-4 sm:p-8 rounded-[20px] border border-[#523A28]/45 hover:border-[var(--saffron)]/40 transition-all duration-300 hover:translate-y-[-4px] flex flex-col justify-between h-44 sm:h-64 group relative overflow-hidden shadow-lg shadow-black/45"
                    >
                      {/* Original background cover image */}
                      {category.bgImage && (
                        <>
                          <Image
                            src={category.bgImage}
                            alt=""
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-35 transition-opacity duration-500 scale-100 group-hover:scale-105 z-0"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/55 to-black/85 z-0" />
                        </>
                      )}

                      {/* Watermark illustrations */}
                      {category.watermark}

                      {/* Rounded icon box */}
                      <div className="z-10">
                        <div className="w-9 h-9 rounded-xl bg-black/45 border border-[#523A28]/50 flex items-center justify-center shrink-0">
                          {category.icon}
                        </div>
                      </div>

                      {/* Title & Badge */}
                      <div className="z-10 mt-auto">
                        <h3 className="text-[15px] sm:text-xl font-display font-medium text-white leading-tight mb-2 pr-2">
                          {category.label}
                        </h3>
                        <span className="place-badge !bg-black/35 !border-[#523A28]/35 !text-[var(--saffron)] text-[10px] sm:text-xs font-bold py-1 px-2.5 rounded-full inline-block">
                          {`${category.count} ${category.unit}`}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Restored big bold branding text in the empty space below with symmetrical spirals */}
                <div className="mt-12 mb-8 relative flex flex-col items-center justify-center text-center py-6 px-8 select-none">
                  {/* Left spiral flourish */}
                  <svg className="absolute left-[5%] sm:left-[15%] top-[10%] w-16 h-16 text-[#C8A46A]/8 pointer-events-none" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M 50 50 A 5 5 0 0 0 45 45 A 10 10 0 0 0 55 55 A 15 15 0 0 0 40 40 A 20 20 0 0 0 60 60 A 25 25 0 0 0 35 35" />
                  </svg>
                  {/* Right spiral flourish */}
                  <svg className="absolute right-[5%] sm:right-[15%] top-[10%] w-16 h-16 text-[#C8A46A]/8 pointer-events-none scale-x-[-1]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M 50 50 A 5 5 0 0 0 45 45 A 10 10 0 0 0 55 55 A 15 15 0 0 0 40 40 A 20 20 0 0 0 60 60 A 25 25 0 0 0 35 35" />
                  </svg>

                  <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-[0.25em] text-[var(--saffron)] leading-tight mb-2 drop-shadow-md">
                    All Things
                  </h2>
                  <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-[0.25em] text-[var(--saffron)] leading-tight drop-shadow-md">
                    Kashmir
                  </h2>
                </div>
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
                <div className="sticky top-0 z-50 bg-[#0B0B0B]/80 backdrop-blur-xl border-b border-white/10 py-4 mb-8 -mx-4 px-4 flex flex-col gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
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
                          {tab.label} {`(${tab.count})`}
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

                {/* Dynamic content lists */}
                {filteredItems.length === 0 ? (
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
                            <ul className="text-xs text-white/80 space-y-2.5 list-disc list-inside leading-relaxed mb-5">
                              <li>Guests wash hands in a mobile copper basin, the <strong>Tash-t-Næær</strong>, brought right to their seat.</li>
                              <li>The platter is covered by a dome lid called a <strong>Sarposh</strong>, which is removed only when all guests are seated.</li>
                              <li>Dishes are eaten collectively with fingers directly from the trami platter, symbolizing brotherhood and equality.</li>
                            </ul>
                            <Link href="/etiquette" className="block bg-black/20 border border-[var(--saffron)]/30 rounded-xl p-4 hover:bg-black/30 transition-colors group">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="text-[var(--saffron)] font-bold text-sm mb-1 group-hover:text-white transition-colors">Wazwan Etiquette Guide</h5>
                                  <p className="text-white/60 text-xs">Learn the 7 unwritten rules of dining.</p>
                                </div>
                                <span className="text-[var(--saffron)] group-hover:translate-x-1 transition-transform">&rarr;</span>
                              </div>
                            </Link>
                            <Link href="/kashmiri-food/wazwan/guide" className="block bg-black/20 border border-[var(--saffron)]/30 rounded-xl p-4 hover:bg-black/30 transition-colors group mt-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="text-[var(--saffron)] font-bold text-sm mb-1 group-hover:text-white transition-colors">Wazwan Guidebook</h5>
                                  <p className="text-white/60 text-xs">Read deep-dives on history, costs, and dishes.</p>
                                </div>
                                <span className="text-[var(--saffron)] group-hover:translate-x-1 transition-transform">&rarr;</span>
                              </div>
                            </Link>
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
  );
}

export default function KashmiriFoodClient({ initialDishes = dishesData, activeTab = null, activeGuide = null }) {
  return (
    <KashmiriFoodContent initialDishes={initialDishes} activeTab={activeTab} activeGuide={activeGuide} />
  );
}
