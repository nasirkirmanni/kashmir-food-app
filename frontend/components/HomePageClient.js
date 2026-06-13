"use client";

import Link from "next/link";
import { MapPin, ChefHat, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

import Image from "next/image";
import dynamic from "next/dynamic";
import FadeInWhenVisible from "@/components/FadeInWhenVisible";

const DesktopRestaurantTabs = dynamic(() => import("@/components/DesktopRestaurantTabs"), { ssr: false });
const MobileRestaurantExplorerModal = dynamic(() => import("@/components/MobileRestaurantExplorerModal"), { ssr: false });
import { endpoints, request } from "@/lib/api";

const locationTabMeta = {
  Srinagar: {
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8">
        <path d="M5 23.5c2.1-1.2 4.2-1.2 6.3 0 2.1 1.2 4.2 1.2 6.4 0 2.1-1.2 4.2-1.2 6.3 0 1 .6 2 .9 3 .9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M10.5 21V11.8L16 8l5.5 3.8V21" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        <path d="M12.7 21v-5.1h6.6V21M14.6 13.2h2.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    )
  },
  Pahalgam: {
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8">
        <path d="M7 24.5h18M10.3 24.5V18l-3.1 2.2L10.3 13l3.2 5 1.9-1.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
        <path d="M19.6 24.5v-8l-3.7 2.7L19.6 10l3.8 6.1 1.8-1.3v9.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      </svg>
    )
  },
  Gulmarg: {
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8">
        <path d="M4.5 23.5 12.8 12l3.7 4.8 4.9-7.3 6.1 14z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
        <path d="m11.9 14.2 1.8-2.2 1.5 1.9M18.9 12.8l1.8-2.1 1.6 2M4 23.5h24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.35" />
      </svg>
    )
  },
  Sonamarg: {
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8">
        <path d="M5 23.5 12 12l4.1 6 4.8-8.5L27 23.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
        <path d="m12 12 2-2.8M16.9 8.9h3M18.4 7.4v3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.35" />
        <path d="M4 23.5h24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.35" />
      </svg>
    )
  }
};

const dishImageOverrides = {
  "Methi Maaz": "/images/dishes/methi-maaz.jpg",
  "Waza Kokur": "/images/dishes/waza-kokur.jpg",
  "Dani Phol": "/images/dishes/dani-phol.jpg",
  "Daniwal Korma": "/images/dishes/daniwal-korma.jpg",
  "Waza Palak": "/images/dishes/waza-palak.jpg",
  "Waza Haak": "/images/dishes/waza-haak.jpg",
  "Wazwaan Mushroom": "/images/dishes/wazwaan-mushroom.jpg",
  "Aab Gosh": "/images/dishes/aab-gosht.jpg",
  "Aab Gosht": "/images/dishes/aab-gosht.jpg",
  "Marchwangan Korma": "/images/dishes/marchwangan-korma.jpg",
  "Ruwangan Chaman": "/images/dishes/ruwangan-chaman.jpg",
  "Dum Aelve": "/images/dishes/dum-aelve.jpg",
  "Gande Tsitin": "/images/dishes/gande-tsitin.jpg",
  "Muji Chetin": "/images/dishes/muji-chetin.jpg"
};

const dishResearchSummaries = {
  "Rogan Josh": "Rogan Josh is a classic Kashmiri lamb dish known for tender meat in a deeply aromatic red gravy built with fennel, dry ginger, and Kashmiri spices.",
  Gushtaba: "Gushtaba is the grand finale of a Wazwan, made from finely pounded mutton meatballs simmered in a creamy yogurt gravy with a soft, velvety texture.",
  Rista: "Rista features hand-shaped meatballs cooked in a fiery red Kashmiri gravy and is one of the most iconic ceremonial dishes in Wazwan.",
  "Tabak Maaz": "Tabak Maaz is made from lamb ribs that are simmered until tender, then fried for a rich, crisp finish that often opens a traditional feast.",
  "Methi Maaz": "Methi Maaz is a traditional tripe dish flavored with spices and fenugreek, valued for its deep savory taste and old-school Wazwan character.",
  "Waza Kokur": "Waza Kokur is a Kashmiri whole-chicken preparation cooked in the style of the waza, bringing a festive chicken course into the largely meat-heavy spread.",
  "Dani Phol": "Dani Phol is a mutton drumstick dish prized for its rich cut of meat and its place among the more traditional courses of Wazwan.",
  "Daniwal Korma": "Daniwal Korma is a coriander-finished mutton curry with yogurt, spices, and onion puree, offering a fragrant and balanced break from hotter gravies.",
  "Waza Palak": "Waza Palak is a spinach-based Wazwan preparation that brings a greener, lighter note to the feast without leaving the traditional Kashmiri flavor profile.",
  "Waza Haak": "Waza Haak highlights Kashmiri collard greens cooked simply and skillfully, adding an earthy vegetal dish to the Wazwan table.",
  "Wazwaan Mushroom": "Wazwaan Mushroom is a mushroom-based Wazwan preparation, appreciated as a rarer vegetarian-style course with earthy flavor and softer texture.",
  "Aab Gosh": "Aab Gosh is a Kashmiri lamb curry cooked in a milk-based gravy, known for its gentle richness, cardamom warmth, and softer seasoning.",
  "Marchwangan Korma": "Marchwangan Korma is an intensely spiced Wazwan korma, recognized for a bold browned-onion sauce and a noticeably hotter flavor profile.",
  Kabab: "Kabab in Wazwan uses minced meat roasted on skewers over hot coals, adding smoky flavor and a familiar starter-like course to the feast.",
  Yakhin: "Yakhin is a curd-based Kashmiri gravy, most closely associated with meat dishes like gushtaba and valued for its mild, aromatic character.",
  "Ruwangan Chaman": "Ruwangan Chaman is a paneer dish in tomato-based gravy that adds color, contrast, and a recognizable vegetarian option to the Wazwan lineup.",
  "Dum Aelve": "Dum Aelve is a Kashmiri potato preparation cooked in yogurt gravy, offering a milder and comforting vegetarian counterpoint within the feast.",
  "Gande Tsitin": "Gande Tsitin is an onion chutney mixed with chilies, yogurt, salt, and spices, used to sharpen and refresh heavier bites of Wazwan.",
  "Muji Chetin": "Muji Chetin is a radish-and-walnut chutney that brings crunch, pungency, and freshness alongside the richer gravies of Kashmiri cuisine."
};

const AuroraBackground = ({ colors }) => (
  <div className="absolute inset-0 z-0 opacity-40">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        x: [0, 20, 0],
        y: [0, 30, 0],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-[20%] -left-[20%] w-[70%] h-[70%] rounded-full blur-2xl mix-blend-screen"
      style={{ backgroundColor: colors[0] }}
    />
    <motion.div
      animate={{
        scale: [1, 1.3, 1],
        x: [0, -30, 0],
        y: [0, -20, 0],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute top-[30%] -right-[20%] w-[80%] h-[80%] rounded-full blur-2xl mix-blend-screen"
      style={{ backgroundColor: colors[1] }}
    />
    <motion.div
      animate={{
        scale: [1, 1.1, 1],
        x: [0, 20, 0],
        y: [0, -30, 0],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute -bottom-[20%] left-[10%] w-[60%] h-[60%] rounded-full blur-2xl mix-blend-screen"
      style={{ backgroundColor: colors[2] }}
    />
  </div>
);

export default function HomePageClient({ initialDishes = [], initialRestaurants = [] }) {
  const { scrollY } = useScroll();
  const scrollOpacity = useTransform(scrollY, [0, 100], [1, 0]);
  const [dishes, setDishes] = useState(initialDishes);
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [selectedDish, setSelectedDish] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isRestaurantModalVisible, setIsRestaurantModalVisible] = useState(false);
  const [isDishModalVisible, setIsDishModalVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  const locationTabs = ["Srinagar", "Pahalgam", "Gulmarg", "Sonamarg"];

  useEffect(() => {
    setIsMounted(true);
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);
    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  useEffect(() => {
    request(endpoints.dishes())
      .then((data) => setDishes(data))
      .catch((err) => console.error("Failed to fetch dishes:", err));
    request(endpoints.restaurants())
      .then((data) => setRestaurants(data))
      .catch((err) => console.error("Failed to fetch restaurants:", err));
  }, []);

  useEffect(() => {
    if (!selectedDish) return undefined;
    const onKeyDown = (e) => { if (e.key === "Escape") setIsDishModalVisible(false); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedDish]);

  useEffect(() => {
    if (!isDishModalVisible) {
      const timer = setTimeout(() => setSelectedDish(null), 300);
      return () => clearTimeout(timer);
    }
  }, [isDishModalVisible]);

  useEffect(() => {
    if (!isRestaurantModalVisible) return undefined;
    const onKeyDown = (e) => { if (e.key === "Escape") setIsRestaurantModalVisible(false); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isRestaurantModalVisible]);

  const targetFeaturedNames = ["Rista", "Gushtaba", "Kabab", "Aab Gosht"];
  const featuredDishes = targetFeaturedNames
    .map((name) => dishes.find((d) => d.name.toLowerCase() === name.toLowerCase()))
    .filter(Boolean);

  const targetCuratedNames = ["Ahdoos", "Mughal Darbar", "Kareema Restaurant"];
  const curatedRestaurants = restaurants
    .filter((r) => targetCuratedNames.includes(r.name))
    .sort((a, b) => targetCuratedNames.indexOf(a.name) - targetCuratedNames.indexOf(b.name));

  const locationCounts = locationTabs.reduce((counts, location) => {
    counts[location] = restaurants.filter(
      (restaurant) => (restaurant.city || "Srinagar") === location
    ).length;
    return counts;
  }, {});

  const featuredRestaurants = selectedLocation
    ? restaurants.filter((restaurant) => (restaurant.city || "Srinagar") === selectedLocation)
    : [];

  const tips = [
    { number: "01", title: "Book in Advance", description: "A full Wazwan is often prepared overnight, so call ahead if you want the ceremonial feast experience rather than a standard menu order." },
    { number: "02", title: "Come Hungry, Come Many", description: "Wazwan is best enjoyed in a group. The shared trami experience makes the meal feel cultural, social, and complete." },
    { number: "03", title: "Start with the Classics", description: "If you are new to Kashmiri food, begin with Rogan Josh, Gushtaba, Rista, and Tabak Maaz before branching into rarer specialties." },
    { number: "04", title: "Respect the Finale", description: "Dishes like Gushtaba are traditionally served at the end of a Wazwan, so knowing the order makes the experience far more immersive." },
    { number: "05", title: "Ask About Authenticity", description: "Some restaurants are polished for tourists, while others preserve older cooking styles. Use the authenticity notes in the app." },
    { number: "06", title: "Pair Food with the Place", description: "A Dal Lake setting, an old city dining hall, and a heritage restaurant each create a very different mood around the same dish." }
  ];

  return (
    <div className="bg-transparent text-white overflow-hidden selection:bg-[var(--saffron)] selection:text-black min-h-screen relative">
      <style>{`
        @media (min-width: 768px) {
          html {
            font-size: 95% !important;
          }
        }
        @keyframes stripe-scroll {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
      `}</style>
      
      {/* Global background is now handled by layout.js */}
      {/* 2. RESTAURANTS SECTION */}
      <section id="restaurants" className="hidden md:block relative pt-12 md:pt-32 pb-24 z-10 mt-8">
        <div className="page-shell">
          <FadeInWhenVisible
            className="mb-8 md:mb-24 text-center"
          >
            <span className="text-[0.75rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)]">Where To Eat</span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white">Discover the best restaurants</h2>
            <p className="mx-auto mt-4 px-6 max-w-sm md:max-w-2xl text-sm md:text-lg text-white/60">Curated from Residency Road, Dal Lake, and Srinagar&apos;s most prestigious dining rooms.</p>
          </FadeInWhenVisible>

          {/* ── DESKTOP: 4-tab grid (md and above) ─────────────── */}
          <div className="hidden md:block">
            {isMounted && isDesktop && (
              <DesktopRestaurantTabs
                locationTabs={locationTabs}
                locationTabMeta={locationTabMeta}
                locationCounts={locationCounts}
                selectedLocation={selectedLocation}
                onSelectLocation={(location) => {
                  setSelectedLocation(location);
                  setIsRestaurantModalVisible(true);
                }}
              />
            )}
          </div>

          {/* ── MOBILE: compact selector with inline results (below md) */}
          <div className="block md:hidden">
            <MobileRestaurantExplorerModal
              locationTabs={locationTabs}
              locationTabMeta={locationTabMeta}
              locationCounts={locationCounts}
              restaurants={restaurants}
            />

          </div>
        </div>
      </section>

      {/* 3. CURATED SELECTION */}
      <section className="hidden md:block relative overflow-hidden border-t border-white/10 bg-transparent py-24 md:py-32">
        
        <div className="page-shell relative z-10">
          <FadeInWhenVisible
            className="mb-24 text-center lg:text-left"
          >
            <span className="inline-block rounded-full border border-[var(--saffron)] bg-[rgba(212,175,55,0.1)] px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)] shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              Editor&apos;s Choice
            </span>
            <h2 className="mt-6 font-display text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white">Curated Selection</h2>
            <p className="mt-6 text-lg text-white/60 lg:max-w-xl">
              Handpicked dining experiences representing the finest flavors and uncompromising luxury of Kashmir.
            </p>
          </FadeInWhenVisible>

          <div className="flex flex-col max-w-4xl lg:mx-0">
            {curatedRestaurants.map((restaurant, i) => {
              let label = "Trending";
              if (i === 0) label = "Most Famous";
              else if (i === 1) label = "High Demand";
              else if (i === 2) label = "Editor's Pick";

              return (
                <Link href={`/restaurants/${restaurant.slug || restaurant._id}`} key={restaurant._id}>
                  <FadeInWhenVisible
                    delay={i * 0.1}
                    className="group flex flex-row items-center justify-between border-b border-white/10 py-6 transition-all hover:border-[var(--saffron)]"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-3 md:gap-4">
                        <h3 className="font-display text-2xl md:text-4xl font-medium text-white group-hover:text-[var(--saffron)] transition-colors">
                          {restaurant.name}
                        </h3>
                        <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-2.5 py-0.5 text-[0.6rem] md:text-[0.65rem] font-bold uppercase tracking-wider text-white/70">
                          {restaurant.location.split(",")[0]}
                        </span>
                      </div>
                      <p className="mt-1 md:mt-2 text-xs md:text-sm text-white/50">{restaurant.cuisineType || "Premium Kashmiri Cuisine"}</p>
                    </div>
                    <div className="text-right flex flex-col items-end justify-center">
                      <span className="text-[0.6rem] md:text-xs font-bold uppercase tracking-[0.2em] text-[var(--saffron)]">
                        {label}
                      </span>
                      <div className="mt-3 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-all group-hover:bg-[var(--saffron)] group-hover:text-black group-hover:border-[var(--saffron)]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 md:w-5 md:h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </div>
                    </div>
                  </FadeInWhenVisible>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. WAZWAN DISHES */}
      <section id="dishes" className="hidden md:block page-shell py-32">
        <FadeInWhenVisible 
          className="mb-24 text-center"
        >
          <span className="text-[0.75rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)]">The Courses</span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white">Signature Wazwan Dishes</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">A cinematic journey through the dishes that define Kashmir&apos;s grandest culinary tradition.</p>
        </FadeInWhenVisible>

        <div className="grid grid-cols-2 gap-3 md:gap-6 max-w-4xl mx-auto">
          {featuredDishes.slice(0, 4).map((dish, i) => (
            <FadeInWhenVisible
              key={dish._id}
              delay={i * 0.1}
              scaleOffset={0.95}
              className="group cursor-pointer overflow-hidden rounded-[16px] md:rounded-[20px] border border-white/10 bg-white/5 shadow-xl backdrop-blur-xl transition-all hover:border-[var(--saffron)] hover:shadow-[0_10px_40px_rgba(212,175,55,0.15)] flex flex-col"
            >
              <div onClick={() => {
                setSelectedDish(dish);
                setIsDishModalVisible(true);
              }} className="flex flex-col h-full">
              <div className="relative h-28 md:h-40 shrink-0 overflow-hidden">
                <div className="absolute inset-0 z-10 bg-black/20 transition duration-500 group-hover:bg-transparent" />
                <Image
                  src={dishImageOverrides[dish.name] || dish.image || '/wazwan-hero.jpg'}
                  alt={dish.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-4 md:p-6 flex flex-col flex-1 justify-between">
                <div>
                  <p className="text-[0.55rem] md:text-[0.65rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)] line-clamp-1">
                    {dish.category}
                  </p>
                  <h3 className="mt-1 md:mt-2 font-display text-lg md:text-2xl font-medium tracking-tight text-white line-clamp-1 md:line-clamp-none">{dish.name}</h3>
                  <p className="mt-1.5 md:mt-3 line-clamp-2 text-[0.6rem] md:text-xs leading-relaxed text-white/60">{dish.description}</p>
                </div>
                <div className="mt-3 md:mt-4">
                  <span className="inline-flex items-center gap-1.5 md:gap-2 text-[0.55rem] md:text-[0.65rem] font-bold uppercase tracking-widest text-white transition-colors group-hover:text-[var(--saffron)]">
                    View Details
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">&rarr;</span>
                  </span>
                </div>
              </div>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Link
            href="/dishes"
            className="inline-flex rounded-full bg-[var(--saffron)] px-8 py-4 text-sm font-bold uppercase tracking-widest text-black shadow-[0_0_30px_rgba(212,175,55,0.25)] transition-transform hover:scale-105 active:scale-95"
          >
            Explore all the dishes of wazwan
          </Link>
        </div>
      </section>

      {/* 5. QUOTES & TIPS */}
      <div className="hidden md:block bg-[#111111] py-24 text-center border-y border-white/10">
        <p className="mx-auto max-w-4xl px-4 font-display text-3xl md:text-4xl lg:text-5xl font-normal italic leading-tight text-white/90">
          &quot;To be invited to a Wazwan is to be welcomed into someone&apos;s heart. The feast is not cooked, it is composed like music.&quot;
        </p>
        <span className="mt-8 block text-[0.8rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)]">A Kashmiri Elder, Srinagar</span>
      </div>



      {/* ═══════════════════════════════════════════════════════
          PAGE 2 CONTENT (Mobile Only)
          ═══════════════════════════════════════════════════════ */}
      <section className="relative block md:hidden w-full h-[100vh] min-h-[100vh] max-h-[100vh] flex-col overflow-hidden snap-start snap-always page">
        {/* Top bar spacer */}
        <div className="h-[52px] shrink-0" />

        {/* Page 2 content (flex: 1) */}
        <div className="flex-1 flex flex-col justify-center px-5 relative z-10 w-full gap-8">
          
          {/* Section 1 — About Wazwan */}
          <div className="w-full text-left">
            <div className="inline-flex items-center rounded-sm bg-[#111] px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#2e2e2e] mb-4">
              THE WAZWAN
            </div>
            <h2 className="font-display font-black text-[32px] tracking-[-0.03em] text-[#fff] leading-[1.05] mb-5">
              Not just a meal.<br/>A ceremony.
            </h2>
            <p className="font-medium text-[#555] text-[12px] leading-[1.6]">
              Wazwan is a 36-course royal feast from Kashmir, cooked by master chefs called Wazas. Every dish tells a story of culture, fire, and hospitality.
            </p>
            <div className="w-full h-[1px] bg-[#1e1e1e] mt-8"></div>
          </div>

          {/* Section 2 — All Things Kashmir */}
          <div className="w-full">
            <h3 className="text-[9px] font-extrabold tracking-[0.16em] text-[#2e2e2e] uppercase mb-4">
              ALL THINGS KASHMIR
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dishes" className="block">
                <div className="bg-[#111] rounded-[18px] p-4 h-[120px] flex flex-col justify-between border-[0.5px] border-[#1e1e1e] relative">
                  <div className="text-white"><i className="ti ti-tools-kitchen text-[22px]"></i></div>
                  <div>
                    <h4 className="font-display font-black text-white text-[14px] mb-0.5">Traditional Wazwan</h4>
                    <p className="text-[#555] font-medium text-[11px]">36 courses, one feast</p>
                  </div>
                  <i className="ti ti-arrow-right absolute bottom-4 right-4 text-[#2e2e2e] text-[16px]"></i>
                </div>
              </Link>
              <Link href="/destinations" className="block">
                <div className="bg-[#111] rounded-[18px] p-4 h-[120px] flex flex-col justify-between border-[0.5px] border-[#1e1e1e] relative">
                  <div className="text-white"><i className="ti ti-map-2 text-[22px]"></i></div>
                  <div>
                    <h4 className="font-display font-black text-white text-[14px] mb-0.5">Rare Destinations</h4>
                    <p className="text-[#555] font-medium text-[11px]">Beyond the tourist trail</p>
                  </div>
                  <i className="ti ti-arrow-right absolute bottom-4 right-4 text-[#2e2e2e] text-[16px]"></i>
                </div>
              </Link>
              <Link href="/itineraries" className="block">
                <div className="bg-[#111] rounded-[18px] p-4 h-[120px] flex flex-col justify-between border-[0.5px] border-[#1e1e1e] relative">
                  <div className="text-white"><i className="ti ti-route text-[22px]"></i></div>
                  <div>
                    <h4 className="font-display font-black text-white text-[14px] mb-0.5">Food Trails</h4>
                    <p className="text-[#555] font-medium text-[11px]">Curated travel + food</p>
                  </div>
                  <i className="ti ti-arrow-right absolute bottom-4 right-4 text-[#2e2e2e] text-[16px]"></i>
                </div>
              </Link>
              <Link href="/history" className="block">
                <div className="bg-[#111] rounded-[18px] p-4 h-[120px] flex flex-col justify-between border-[0.5px] border-[#1e1e1e] relative">
                  <div className="text-white"><i className="ti ti-book text-[22px]"></i></div>
                  <div>
                    <h4 className="font-display font-black text-white text-[14px] mb-0.5">History & Culture</h4>
                    <p className="text-[#555] font-medium text-[11px]">14th-century origins</p>
                  </div>
                  <i className="ti ti-arrow-right absolute bottom-4 right-4 text-[#2e2e2e] text-[16px]"></i>
                </div>
              </Link>
            </div>
          </div>

          {/* Section 3 — Plan Kashmir Visit */}
          <div className="w-full bg-white rounded-[24px] p-5">
            <h2 className="font-body font-black text-[24px] tracking-[-0.04em] leading-tight text-black mb-4">
              Plan a Kashmir Visit
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/visit-kashmir" className="block">
                <div className="bg-[#f4f4f4] rounded-[18px] p-4 h-[120px] flex flex-col justify-between relative border border-black/5 hover:bg-[#ebebeb] transition-colors">
                  <div className="text-black"><i className="ti ti-map-2 text-[22px]"></i></div>
                  <div>
                    <h4 className="font-display font-black text-black text-[14px] leading-tight mb-0.5">Visit Kashmir</h4>
                    <p className="text-[#555] font-medium text-[11px]">Travel Guide</p>
                  </div>
                  <i className="ti ti-arrow-right absolute bottom-4 right-4 text-black text-[16px]"></i>
                </div>
              </Link>
              <Link href="/plan" className="block">
                <div className="bg-[#f4f4f4] rounded-[18px] p-4 h-[120px] flex flex-col justify-between relative border border-black/5 hover:bg-[#ebebeb] transition-colors">
                  <div className="text-black"><i className="ti ti-sparkles text-[22px]"></i></div>
                  <div>
                    <h4 className="font-display font-black text-black text-[13px] leading-tight mb-0.5">Let Waza AI plan a trip for you</h4>
                  </div>
                  <i className="ti ti-arrow-right absolute bottom-4 right-4 text-black text-[16px]"></i>
                </div>
              </Link>
            </div>
        </div>
        </div>
      </section>

      <section id="tips" className="hidden md:block page-shell py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="mb-24 text-center"
        >
          <span className="text-[0.75rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)]">Visitor Guide</span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white">How to Experience Wazwan</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">Everything you should know before you sit at the trami.</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 md:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tips.map((tip, i) => (
            <motion.article 
              key={tip.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="rounded-[16px] md:rounded-[24px] border border-white/10 bg-white/5 p-4 md:p-8 backdrop-blur-xl transition hover:border-[var(--saffron)] flex flex-col justify-start"
            >
              <div className="font-display text-2xl md:text-4xl font-bold text-[var(--saffron)] opacity-50">
                {tip.number}
              </div>
              <h3 className="mt-3 md:mt-6 font-display text-lg md:text-3xl font-medium tracking-tight text-white leading-tight">{tip.title}</h3>
              <p className="mt-2 md:mt-4 text-[0.65rem] md:text-sm leading-relaxed text-white/60 line-clamp-4 md:line-clamp-none">{tip.description}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* NEXT PAGE SWIPE INDICATOR (Mobile Only) */}
      <section className="flex md:hidden pb-32 pt-6 flex-col items-center justify-center relative z-10">
        <div className="flex flex-col items-center gap-1 opacity-50 animate-pulse">
          <i className="ti ti-arrow-right text-[28px] text-gray-400"></i>
        </div>
      </section>

      <section className="hidden md:block border-t border-white/10 bg-[#111111] py-24">
        <div className="page-shell">
          <div className="flex flex-col items-center justify-between gap-10 rounded-[32px] border border-[var(--saffron)] bg-[rgba(212,175,55,0.05)] p-12 text-center lg:flex-row lg:text-left shadow-[0_0_60px_rgba(212,175,55,0.1)]">
            <div>
              <p className="mb-4 text-[0.75rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)]">Plan Your Visit</p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white">
                The Complete Experience
              </h2>
              <p className="mt-4 max-w-xl text-lg text-white/60">
                Browse all dishes, discover every restaurant listing, save favorites, and build your Kashmir food trail.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto justify-center gap-4">
              <Link href="/kashmiri-food" className="w-full sm:w-auto text-center rounded-full bg-[var(--saffron)] px-8 py-4 text-sm font-bold uppercase tracking-wide text-black transition-transform hover:scale-105">
                View all dishes
              </Link>
              <Link href="/restaurants" className="w-full sm:w-auto text-center rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-wide text-white backdrop-blur transition hover:bg-white/10">
                View all restaurants &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* RESTAURANT MODAL */}
      <AnimatePresence>
        {isRestaurantModalVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-xl"
            onClick={() => setIsRestaurantModalVisible(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/20 bg-[#111111] shadow-[0_0_60px_rgba(0,0,0,0.5)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsRestaurantModalVisible(false)}
                className="absolute right-6 top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-xl text-white backdrop-blur transition hover:bg-[var(--saffron)] hover:text-black hover:border-[var(--saffron)]"
              >
                &times;
              </button>

              <div className="border-b border-white/10 bg-white/5 px-8 py-8 backdrop-blur-md">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)]">
                  Location Dining Guide
                </p>
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="font-display text-3xl md:text-5xl font-medium tracking-tight text-white">
                      {selectedLocation || "Restaurants"}
                    </h3>
                    <p className="mt-2 max-w-2xl text-white/60">
                      Browse every luxury restaurant currently listed for this destination.
                    </p>
                  </div>
                  <div className="self-start rounded-full border border-[var(--saffron)] bg-[rgba(212,175,55,0.1)] px-5 py-2 text-sm font-bold text-[var(--saffron)] shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                    {featuredRestaurants.length} Destinations
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
                {featuredRestaurants.length ? (
                  <div className="grid gap-6 lg:grid-cols-2">
                    {featuredRestaurants.map((restaurant) => (
                      <article key={restaurant._id} className="flex flex-col justify-between rounded-[24px] border border-white/10 bg-white/5 p-8 backdrop-blur transition hover:border-white/30">
                        <div>
                          <h3 className="font-display text-3xl font-medium tracking-tight text-white">
                            <Link href={`/restaurants/${restaurant.slug || restaurant._id}`} className="transition-colors hover:text-[var(--saffron)]">
                              {restaurant.name}
                            </Link>
                          </h3>
                          <p className="mt-2 text-sm font-medium uppercase tracking-widest text-[var(--saffron)]">
                            {restaurant.location}
                          </p>
                          <p className="mt-4 text-sm leading-relaxed text-white/60">
                            {restaurant.description}
                          </p>
                        </div>
                        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-white">
                              <svg className="h-3 w-3 text-[var(--saffron)]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                              {restaurant.rating}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-widest text-white/60">{restaurant.priceLevel}</span>
                          </div>
                          <Link href={`/restaurants/${restaurant.slug || restaurant._id}`} className="text-xs font-bold uppercase tracking-widest text-[var(--saffron)] hover:text-white transition-colors">
                            View Details &rarr;
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-lg text-white/50">No dining spots found in this location.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DISH MODAL */}
      <AnimatePresence>
        {isDishModalVisible && selectedDish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8 backdrop-blur-xl"
            onClick={() => setIsDishModalVisible(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-white/20 bg-[#111111] shadow-[0_0_50px_rgba(0,0,0,0.8)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsDishModalVisible(false)}
                className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-lg text-white backdrop-blur-md transition hover:bg-[var(--saffron)] hover:text-black hover:border-[var(--saffron)]"
              >
                &times;
              </button>

              <div className="relative h-48 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent z-10" />
                <Image
                  src={dishImageOverrides[selectedDish.name] || selectedDish.image || '/wazwan-hero.jpg'}
                  alt={selectedDish.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>

              <div className="relative z-20 -mt-12 p-6 md:p-8">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-[var(--saffron)] bg-black/60 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-widest text-[var(--saffron)] backdrop-blur-md">
                    {selectedDish.category}
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                    {selectedDish.foodType}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-2xl md:text-3xl font-medium tracking-tight text-white">{selectedDish.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  {dishResearchSummaries[selectedDish.name] || selectedDish.fullDescription || selectedDish.description}
                </p>

                <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/10 pt-6 gap-4">
                  <div>
                    <p className="text-[0.6rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)]">Pricing</p>
                    <p className="mt-1 text-xs text-white/60">{selectedDish.priceRange}</p>
                  </div>
                  <Link href="/dishes" className="rounded-full bg-[var(--saffron)] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-black transition hover:scale-105 shadow-[0_0_20px_rgba(212,175,55,0.2)] text-center">
                    Explore Menu
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
