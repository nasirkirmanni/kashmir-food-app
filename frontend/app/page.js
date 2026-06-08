"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LandingCanvas from "@/components/LandingCanvas";
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

export default function HomePage() {
  const [dishes, setDishes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isRestaurantModalVisible, setIsRestaurantModalVisible] = useState(false);
  const [isDishModalVisible, setIsDishModalVisible] = useState(false);

  const locationTabs = ["Srinagar", "Pahalgam", "Gulmarg", "Sonamarg"];

  useEffect(() => {
    Promise.all([request(endpoints.dishes()), request(endpoints.restaurants())])
      .then(([dishData, restaurantData]) => {
        setDishes(dishData);
        setRestaurants(restaurantData);
      })
      .catch(() => null);
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

  return (
    <div className="bg-[#0B0B0B] text-white overflow-hidden selection:bg-[var(--saffron)] selection:text-black min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative flex min-h-screen items-center justify-center pt-20">
        <LandingCanvas />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.1),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(122,16,37,0.15),transparent_50%)]" />
        
        <div className="page-shell relative z-10 mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-block rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--saffron)] backdrop-blur-xl">
              Welcome to the Royal Cuisine of Kashmir
            </div>
            <h1 className="mt-10 font-display text-5xl md:text-7xl lg:text-[8rem] font-medium leading-[0.95] tracking-tight text-white drop-shadow-2xl">
              The <em className="text-[var(--saffron)] not-italic">Royal</em> Table
              <br />
              of Kashmir
            </h1>
            <p className="mx-auto mt-8 max-w-2xl font-body text-lg leading-relaxed text-white/70">
              Wazwan is not just a meal. It is a cinematic experience of tradition, hospitality, storytelling, and unforgettable dishes carried from the kitchens of Kashmir to the traveler&apos;s table.
            </p>
            
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
              <Link
                href="/restaurants"
                className="w-full md:w-auto text-center rounded-full bg-[var(--saffron)] px-8 py-4 text-sm font-semibold tracking-wide text-black shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-transform duration-300 hover:scale-105"
              >
                Explore Restaurants
              </Link>
              <Link
                href="/#dishes"
                className="w-full md:w-auto text-center rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold tracking-wide text-white backdrop-blur-md transition duration-300 hover:bg-white/10 hover:border-white/30"
              >
                Discover the Dishes &rarr;
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* INTRO STRIP */}
      <div className="bg-[var(--crimson)] py-20 text-center relative z-10 border-y border-white/10 shadow-[0_0_60px_rgba(122,16,37,0.4)]">
        <p className="mx-auto max-w-4xl px-4 font-display text-2xl md:text-3xl lg:text-4xl font-normal leading-relaxed text-white/90 italic tracking-wide">
          Prepared by the <strong className="font-semibold text-[var(--saffron)] not-italic">Waza</strong>, Kashmir&apos;s master chefs, the Wazwan feast can span <strong className="font-semibold text-[var(--saffron)] not-italic">dozens of dishes</strong> cooked with patience, ceremony, saffron, dry ginger, and the soul of the valley.
        </p>
      </div>

      {/* 2. RESTAURANTS SECTION */}
      <section id="restaurants" className="relative py-32 z-10">
        <div className="page-shell">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="mb-24 text-center"
          >
            <span className="text-[0.75rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)]">Where To Eat</span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white">The Finest Destinations</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">Curated from Residency Road, Dal Lake, and Srinagar&apos;s most prestigious dining rooms.</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {locationTabs.map((location, i) => {
              const isActive = selectedLocation === location;
              const count = locationCounts[location] || 0;
              const icon = locationTabMeta[location]?.icon;

              return (
                <motion.button
                  key={location}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                  onClick={() => {
                    setSelectedLocation(location);
                    setIsRestaurantModalVisible(true);
                  }}
                  className={`group relative flex min-h-[120px] w-full flex-col justify-center overflow-hidden rounded-[24px] border border-white/10 p-6 text-left transition-all duration-300 ${
                    isActive
                      ? "bg-white/15 shadow-[0_0_40px_rgba(212,175,55,0.15)] border-white/30"
                      : "bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
                  }`}
                >
                  <div className="relative z-10 flex items-center gap-5">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-[18px] border transition-colors duration-300 ${isActive ? "border-[var(--saffron)] bg-[var(--saffron)] text-black" : "border-white/10 bg-black/40 text-white/70 group-hover:border-[var(--saffron)] group-hover:text-[var(--saffron)]"}`}>
                      {icon}
                    </div>
                    <div>
                      <p className="font-display text-2xl font-semibold text-white">{location}</p>
                      <p className="mt-1 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-[var(--saffron)]">
                        {count} Locations
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. CURATED SELECTION */}
      <section className="relative overflow-hidden border-y border-white/10 bg-[#111111] py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.1),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(122,16,37,0.1),transparent_40%)]" />
        
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

          <div className="flex snap-x snap-mandatory overflow-x-auto pb-10 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0 gap-8">
            {curatedRestaurants.map((restaurant, i) => (
              <motion.div
                key={restaurant._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: "easeOut" }}
                whileHover={{ y: -10 }}
                className="group relative flex w-[85vw] shrink-0 snap-center flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl transition-all sm:w-auto hover:border-[var(--saffron)] hover:shadow-[0_20px_60px_rgba(212,175,55,0.15)]"
              >
                <div className="relative h-72 overflow-hidden">
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-70" />
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="h-full w-full object-cover transition duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full border border-[var(--saffron)] bg-black/60 px-3 py-1.5 text-xs font-bold text-[var(--saffron)] backdrop-blur-md">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    {restaurant.rating}
                  </div>
                </div>
                
                <div className="flex flex-1 flex-col p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--saffron)]">
                    {restaurant.location.split(",")[0]}
                  </p>
                  <h3 className="mt-3 font-display text-3xl font-medium tracking-tight text-white">
                    <Link href={`/restaurants/${restaurant._id}`} className="transition-colors hover:text-[var(--saffron)]">
                      {restaurant.name}
                    </Link>
                  </h3>
                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-white/60">
                    {restaurant.description}
                  </p>
                  
                  <div className="mt-6 flex flex-wrap gap-2">
                    {(restaurant.linkedDishes || []).slice(0, 3).map((dish) => (
                      <span
                        key={dish._id}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-widest text-white/80"
                      >
                        {dish.name}
                      </span>
                    ))}
                  </div>

                  <div className="mt-10 mt-auto border-t border-white/10 pt-6">
                    <Link
                      href={`/restaurants/${restaurant._id}`}
                      className="inline-flex w-full items-center justify-between rounded-full bg-white/5 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all group-hover:bg-[var(--saffron)] group-hover:text-black"
                    >
                      View Experience
                      <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">&rarr;</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
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

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {featuredDishes.map((dish, i) => (
            <motion.article
              key={dish._id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="group cursor-pointer overflow-hidden rounded-[24px] border border-white/10 bg-white/5 shadow-xl backdrop-blur-xl transition-all hover:border-[var(--saffron)] hover:shadow-[0_10px_40px_rgba(212,175,55,0.15)]"
              onClick={() => {
                setSelectedDish(dish);
                setIsDishModalVisible(true);
              }}
            >
              <div className="relative h-56 overflow-hidden">
                <div className="absolute inset-0 z-10 bg-black/20 transition duration-500 group-hover:bg-transparent" />
                <img
                  src={dishImageOverrides[dish.name] || dish.image}
                  alt={dish.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-8">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)]">
                  {dish.category}
                </p>
                <h3 className="mt-3 font-display text-3xl font-medium tracking-tight text-white">{dish.name}</h3>
                <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-white/60">{dish.description}</p>
                <div className="mt-6">
                  <span className="inline-flex items-center gap-2 text-[0.75rem] font-bold uppercase tracking-widest text-white transition-colors group-hover:text-[var(--saffron)]">
                    View Details
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">&rarr;</span>
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
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

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tips.map((tip, i) => (
            <motion.article 
              key={tip.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="rounded-[24px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition hover:border-[var(--saffron)]"
            >
              <div className="font-display text-4xl font-bold text-[var(--saffron)] opacity-50">
                {tip.number}
              </div>
              <h3 className="mt-6 font-display text-3xl font-medium tracking-tight text-white">{tip.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-white/60">{tip.description}</p>
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
