"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import LandingCanvas from "@/components/LandingCanvas";
import Image from "next/image";
import DesktopRestaurantTabs from "@/components/DesktopRestaurantTabs";
import MobileRestaurantExplorerModal from "@/components/MobileRestaurantExplorerModal";

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
  "Dani Phol": "https://img1.wsimg.com/isteam/ip/dd6344ba-b4f2-40bd-9964-c303da269da2/Dani%20Phol.jpg/:/rs=w:600,cg:true,m",
  "Daniwal Korma": "/images/dishes/daniwal-korma.png",
  "Waza Palak": "/images/dishes/waza-palak.png",
  "Waza Haak": "/images/dishes/waza-haak.png",
  "Wazwaan Mushroom": "/images/dishes/wazwaan-mushroom.png",
  "Aab Gosh": "https://img1.wsimg.com/isteam/ip/dd6344ba-b4f2-40bd-9964-c303da269da2/Aab%20Gosht%20Final.jpg/:/rs=w:600,cg:true,m",
  "Marchwangan Korma": "/images/dishes/marchwangan-korma.jpg",
  "Ruwangan Chaman": "/images/dishes/ruwangan-chaman.png",
  "Dum Aelve": "/images/dishes/dum-aelve.jpg",
  "Gande Tsitin": "/images/dishes/gande-tsitin.png",
  "Muji Chetin": "/images/dishes/muji-chetin.png"
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

export default function HomePageClient({ initialDishes = [], initialRestaurants = [] }) {
  const { scrollY } = useScroll();
  const scrollOpacity = useTransform(scrollY, [0, 100], [1, 0]);
  const [dishes, setDishes] = useState(initialDishes);
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [selectedDish, setSelectedDish] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isRestaurantModalVisible, setIsRestaurantModalVisible] = useState(false);
  const [isDishModalVisible, setIsDishModalVisible] = useState(false);

  const locationTabs = ["Srinagar", "Pahalgam", "Gulmarg", "Sonamarg"];

  // Client-side fetching is now handled by SSR in app/page.js

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

  const featuredDishes = dishes.filter(
    (dish) => dish.category === "Wazwan" || dish.name === "Gushtaba"
  );

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

  const featureIconsGrid = (
    <div className="grid grid-cols-4 w-full">
      <div className="flex flex-col items-center text-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 md:h-8 md:w-8 text-[var(--saffron)] mb-2 md:mb-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
        <p className="text-[0.45rem] md:text-xs font-bold uppercase tracking-wider text-white">Authentic</p>
        <p className="mt-1 text-[0.45rem] md:text-xs leading-tight text-white/50 px-1">Handpicked experiences</p>
      </div>
      <div className="flex flex-col items-center text-center relative border-l border-white/10">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 md:h-8 md:w-8 text-[var(--saffron)] mb-2 md:mb-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <p className="text-[0.45rem] md:text-xs font-bold uppercase tracking-wider text-white">Premium</p>
        <p className="mt-1 text-[0.45rem] md:text-xs leading-tight text-white/50 px-1">Curated luxury dining</p>
      </div>
      <div className="flex flex-col items-center text-center relative border-l border-white/10">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 md:h-8 md:w-8 text-[var(--saffron)] mb-2 md:mb-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <p className="text-[0.45rem] md:text-xs font-bold uppercase tracking-wider text-white">Top Locations</p>
        <p className="mt-1 text-[0.45rem] md:text-xs leading-tight text-white/50 px-1">Across iconic places</p>
      </div>
      <div className="flex flex-col items-center text-center relative border-l border-white/10">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 md:h-8 md:w-8 text-[var(--saffron)] mb-2 md:mb-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
        <p className="text-[0.45rem] md:text-xs font-bold uppercase tracking-wider text-white">Trusted</p>
        <p className="mt-1 text-[0.45rem] md:text-xs leading-tight text-white/50 px-1">Selected for quality</p>
      </div>
    </div>
  );

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

      {/* ═══════════════════════════════════════════════════════
          MOBILE HERO (below md)
          ═══════════════════════════════════════════════════════ */}
      <div className="relative block md:hidden pt-28 pb-10 min-h-[100svh] flex flex-col">
        <div className="relative z-10 flex-1 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-center px-5"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--saffron)] bg-[#0B0B0B]/80 backdrop-blur-md px-5 py-2 text-[0.55rem] font-bold uppercase tracking-[0.22em] text-[var(--saffron)] shadow-[0_0_15px_rgba(212,175,55,0.15)]">
              <span className="text-xs">❖</span>
              Welcome to the Royal Cuisine of Kashmir
            </div>
            <h1 className="mt-6 font-display text-5xl font-medium leading-[1.05] tracking-tight text-white drop-shadow-lg">
              The <em className="text-[var(--saffron)] not-italic">Royal</em> Table
              <br />
              of Kashmir
            </h1>
            
            <div className="flex justify-center mt-4">
              <div className="flex items-center gap-3 text-[var(--saffron)] drop-shadow-md">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[var(--saffron)]/60"></div>
                <span className="text-xs">❖</span>
                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[var(--saffron)]/60"></div>
              </div>
            </div>

            <p className="mt-5 text-[0.85rem] leading-relaxed text-[#D1D5DB] mx-auto max-w-sm drop-shadow-md px-2">
              Wazwan is not just a meal. It is a cinematic experience of tradition, hospitality, storytelling, and unforgettable dishes from the kitchens of Kashmir to the traveler&apos;s table.
            </p>
          </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 grid grid-cols-2 gap-4 px-5 z-20 relative"
        >
          <Link href="/restaurants" className="group relative flex flex-col justify-end overflow-hidden rounded-[24px] border border-[#D4AF37]/30 bg-white/5 backdrop-blur-sm aspect-square transition-all active:scale-95 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
            <div className="relative z-10 p-4 flex flex-col items-start text-left">
              <div className="flex items-center mb-1 text-[#D4AF37]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              </div>
              <div className="font-display text-[1.2rem] font-medium text-[#D4AF37] leading-tight drop-shadow-md">Explore<br/>Restaurants</div>
            </div>
          </Link>
          
          <Link href="/dishes" className="group relative flex flex-col justify-end overflow-hidden rounded-[24px] border border-white/20 bg-white/5 backdrop-blur-sm aspect-square transition-all active:scale-95 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
            <div className="relative z-10 p-4 flex flex-col items-start text-left">
              <div className="flex items-center mb-1 text-white/70">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V21h12v-7.5m-12 0a3 3 0 01-3-3c0-1.66 1.34-3 3-3 .22 0 .44.02.65.07A4.49 4.49 0 0110.5 3c2 0 3.7 1.3 4.28 3.12.28-.08.57-.12.87-.12 2.07 0 3.75 1.68 3.75 3.75 0 1.66-1.34 3-3 3m-12 0h12" /></svg>
              </div>
              <div className="font-display text-[1.2rem] font-medium text-white leading-tight drop-shadow-md">Discover<br/>the Dishes</div>
            </div>
          </Link>
        </motion.div>
        
        <motion.div 
          style={{ opacity: scrollOpacity }}
          className="mt-10 flex flex-col items-center justify-center text-white/50 pb-6 z-20 relative"
        >
          <span className="text-[0.65rem] uppercase tracking-[0.2em] font-medium mb-2">Scroll</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
          </motion.div>
        </motion.div>

        <div className="hidden">
          {featureIconsGrid}
        </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          DESKTOP HERO (md and above)
          ═══════════════════════════════════════════════════════ */}
      <section className="relative hidden md:flex min-h-screen items-center justify-start pt-20 overflow-hidden bg-[#0B0B0B]">
        <div className="absolute inset-0 z-0 flex justify-end">
          <div className="relative w-full h-full">
            <Image priority fill src="/wazwan-hero.jpg" alt="Kashmiri Wazwan feast" className="object-cover object-right lg:object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/60 to-transparent" />
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#0B0B0B] to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0B0B0B] to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_55%,rgba(212,175,55,0.05),transparent_55%)]" />
          </div>
        </div>
        
        <LandingCanvas />
        
        <div className="page-shell relative z-10 w-full flex items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl text-left"
          >
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--saffron)]/40 bg-black/40 px-4 py-1.5 text-[0.55rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)] backdrop-blur-xl">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M12 2C12 2 8 6 8 12C8 18 12 22 12 22C12 22 16 18 16 12C16 6 12 2 12 2Z" />
                <path d="M12 22C12 22 4 18 4 12C4 6 12 2 12 2" fillOpacity="0.5"/>
                <path d="M12 22C12 22 20 18 20 12C20 6 12 2 12 2" fillOpacity="0.5"/>
              </svg>
              Welcome to the Royal Cuisine of Kashmir
            </div>
            
            <h1 className="mt-8 font-display text-6xl lg:text-[7rem] font-medium leading-[1.05] tracking-tight text-white drop-shadow-2xl">
              The <em className="text-[var(--saffron)] not-italic">Royal</em> Table
              <br />
              of Kashmir
            </h1>
            
            <div className="mt-8 flex justify-start">
              <svg width="60" height="12" viewBox="0 0 60 12" fill="none" className="text-[var(--saffron)]">
                <path d="M30 0L35 6L30 12L25 6L30 0Z" fill="currentColor"/>
                <path d="M0 6H20" stroke="currentColor" strokeWidth="1"/>
                <path d="M40 6H60" stroke="currentColor" strokeWidth="1"/>
              </svg>
            </div>

            <p className="mt-6 max-w-lg font-body text-lg leading-relaxed text-white/80 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              Wazwan is not just a meal. It is a cinematic experience of tradition, hospitality, storytelling, and unforgettable dishes carried from the kitchens of Kashmir to the traveler&apos;s table.
            </p>
            
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/restaurants"
                className="group flex items-center gap-2 rounded-full border border-[var(--saffron)]/40 bg-black/20 pl-1 pr-3 py-1 text-[0.65rem] font-bold tracking-wide text-[var(--saffron)] backdrop-blur-xl shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-300 hover:bg-black/40 hover:scale-105"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--saffron)]/20 text-[var(--saffron)] backdrop-blur-md">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                </div>
                Explore Restaurants
                <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
              </Link>
              
              <Link
                href="/dishes"
                className="group flex items-center gap-2 rounded-full border border-white/20 bg-white/5 pl-1 pr-3 py-1 text-[0.65rem] font-semibold tracking-wide text-white backdrop-blur-md transition duration-300 hover:bg-white/10 hover:border-white/40"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--saffron)] text-[var(--saffron)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                </div>
                Discover the Dishes
                <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
              </Link>
            </div>
            
            <div className="mt-16">
              {featureIconsGrid}
            </div>
          </motion.div>
        </div>
      </section>
      {/* 2. RESTAURANTS SECTION */}
      <section id="restaurants" className="relative pt-12 md:pt-32 pb-24 z-10 mt-8">
        <div className="page-shell">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="mb-8 md:mb-24 text-center"
          >
            <span className="text-[0.75rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)]">Where To Eat</span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white">The Finest Destinations</h2>
            <p className="mx-auto mt-4 px-6 max-w-sm md:max-w-2xl text-sm md:text-lg text-white/60">Curated from Residency Road, Dal Lake, and Srinagar&apos;s most prestigious dining rooms.</p>
          </motion.div>

          {/* ── DESKTOP: 4-tab grid (md and above) ─────────────── */}
          <div className="hidden md:block">
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
      <section className="relative overflow-hidden border-t border-white/10 bg-transparent py-24 md:py-32">
        
        <div className="page-shell relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-24 text-center lg:text-left"
          >
            <span className="inline-block rounded-full border border-[var(--saffron)] bg-[rgba(212,175,55,0.1)] px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)] shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              Editor&apos;s Choice
            </span>
            <h2 className="mt-6 font-display text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white">Curated Selection</h2>
            <p className="mt-6 text-lg text-white/60 lg:max-w-xl">
              Handpicked dining experiences representing the finest flavors and uncompromising luxury of Kashmir.
            </p>
          </motion.div>

          <div className="flex flex-col max-w-4xl lg:mx-0">
            {curatedRestaurants.map((restaurant, i) => {
              let label = "Trending";
              if (i === 0) label = "Most Famous";
              else if (i === 1) label = "High Demand";
              else if (i === 2) label = "Editor's Pick";

              return (
                <Link href={`/restaurants/${restaurant._id}`} key={restaurant._id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
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
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. WAZWAN DISHES */}
      <section id="dishes" className="page-shell py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="mb-24 text-center"
        >
          <span className="text-[0.75rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)]">The Courses</span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white">Signature Wazwan Dishes</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">A cinematic journey through the dishes that define Kashmir&apos;s grandest culinary tradition.</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 md:gap-6 max-w-4xl mx-auto">
          {featuredDishes.slice(0, 4).map((dish, i) => (
            <motion.article
              key={dish._id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="group cursor-pointer overflow-hidden rounded-[16px] md:rounded-[20px] border border-white/10 bg-white/5 shadow-xl backdrop-blur-xl transition-all hover:border-[var(--saffron)] hover:shadow-[0_10px_40px_rgba(212,175,55,0.15)] flex flex-col"
              onClick={() => {
                setSelectedDish(dish);
                setIsDishModalVisible(true);
              }}
            >
              <div className="relative h-28 md:h-40 shrink-0 overflow-hidden">
                <div className="absolute inset-0 z-10 bg-black/20 transition duration-500 group-hover:bg-transparent" />
                <img
                  src={dishImageOverrides[dish.name] || dish.image}
                  alt={dish.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
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
            </motion.article>
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
      <div className="bg-[#111111] py-24 text-center border-y border-white/10">
        <p className="mx-auto max-w-4xl px-4 font-display text-3xl md:text-4xl lg:text-5xl font-normal italic leading-tight text-white/90">
          &quot;To be invited to a Wazwan is to be welcomed into someone&apos;s heart. The feast is not cooked, it is composed like music.&quot;
        </p>
        <span className="mt-8 block text-[0.8rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)]">A Kashmiri Elder, Srinagar</span>
      </div>

      <section id="tips" className="page-shell py-32">
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

      <section className="border-t border-white/10 bg-[#111111] py-24">
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
              <Link href="/dishes" className="w-full sm:w-auto text-center rounded-full bg-[var(--saffron)] px-8 py-4 text-sm font-bold uppercase tracking-wide text-black transition-transform hover:scale-105">
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
                            <Link href={`/restaurants/${restaurant._id}`} className="transition-colors hover:text-[var(--saffron)]">
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
                          <Link href={`/restaurants/${restaurant._id}`} className="text-xs font-bold uppercase tracking-widest text-[var(--saffron)] hover:text-white transition-colors">
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
              className="relative w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/20 bg-[#111111] shadow-[0_0_80px_rgba(0,0,0,0.8)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsDishModalVisible(false)}
                className="absolute right-6 top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/40 text-xl text-white backdrop-blur-md transition hover:bg-[var(--saffron)] hover:text-black hover:border-[var(--saffron)]"
              >
                &times;
              </button>

              <div className="relative h-80 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent z-10" />
                <img
                  src={dishImageOverrides[selectedDish.name] || selectedDish.image}
                  alt={selectedDish.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="relative z-20 -mt-20 p-10">
                <div className="flex flex-wrap gap-3">
                  <span className="rounded-full border border-[var(--saffron)] bg-black/60 px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-widest text-[var(--saffron)] backdrop-blur-md">
                    {selectedDish.category}
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[0.7rem] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                    {selectedDish.foodType}
                  </span>
                </div>

                <h3 className="mt-6 font-display text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white">{selectedDish.name}</h3>
                <p className="mt-6 text-lg leading-relaxed text-white/70">
                  {dishResearchSummaries[selectedDish.name] || selectedDish.fullDescription || selectedDish.description}
                </p>

                <div className="mt-10 grid gap-8 border-t border-white/10 pt-8 sm:grid-cols-2">
                  <div>
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)]">Profile</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">{selectedDish.description}</p>
                  </div>
                  <div>
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)]">Pricing</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">{selectedDish.priceRange}</p>
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <Link href="/dishes" className="rounded-full bg-[var(--saffron)] px-8 py-4 text-sm font-bold uppercase tracking-wide text-black transition hover:scale-105 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
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
