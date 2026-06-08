"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LandingCanvas from "@/components/LandingCanvas";
import { endpoints, request } from "@/lib/api";

const locationTabMeta = {
  Srinagar: {
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8">
        <path
          d="M5 23.5c2.1-1.2 4.2-1.2 6.3 0 2.1 1.2 4.2 1.2 6.4 0 2.1-1.2 4.2-1.2 6.3 0 1 .6 2 .9 3 .9"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M10.5 21V11.8L16 8l5.5 3.8V21"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.7"
        />
        <path
          d="M12.7 21v-5.1h6.6V21M14.6 13.2h2.8"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    )
  },
  Pahalgam: {
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8">
        <path
          d="M7 24.5h18M10.3 24.5V18l-3.1 2.2L10.3 13l3.2 5 1.9-1.3"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M19.6 24.5v-8l-3.7 2.7L19.6 10l3.8 6.1 1.8-1.3v9.7"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    )
  },
  Gulmarg: {
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8">
        <path
          d="M4.5 23.5 12.8 12l3.7 4.8 4.9-7.3 6.1 14z"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
        <path
          d="m11.9 14.2 1.8-2.2 1.5 1.9M18.9 12.8l1.8-2.1 1.6 2M4 23.5h24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.35"
        />
      </svg>
    )
  },
  Sonamarg: {
    icon: (
      <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8">
        <path
          d="M5 23.5 12 12l4.1 6 4.8-8.5L27 23.5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
        <path
          d="m12 12 2-2.8M16.9 8.9h3M18.4 7.4v3"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.35"
        />
        <path
          d="M4 23.5h24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.35"
        />
      </svg>
    )
  }
};

const dishImageOverrides = {
  "Methi Maaz": "/images/dishes/methi-maaz.jpg",
  "Waza Kokur": "/images/dishes/waza-kokur.jpg",
  "Dani Phol":
    "https://img1.wsimg.com/isteam/ip/dd6344ba-b4f2-40bd-9964-c303da269da2/Dani%20Phol.jpg/:/rs=w:600,cg:true,m",
  "Daniwal Korma": "/images/dishes/daniwal-korma.png",
  "Waza Palak": "/images/dishes/waza-palak.png",
  "Waza Haak": "/images/dishes/waza-haak.png",
  "Wazwaan Mushroom": "/images/dishes/wazwaan-mushroom.png",
  "Aab Gosh":
    "https://img1.wsimg.com/isteam/ip/dd6344ba-b4f2-40bd-9964-c303da269da2/Aab%20Gosht%20Final.jpg/:/rs=w:600,cg:true,m",
  "Marchwangan Korma": "/images/dishes/marchwangan-korma.jpg",
  "Ruwangan Chaman": "/images/dishes/ruwangan-chaman.png",
  "Dum Aelve": "/images/dishes/dum-aelve.jpg",
  "Gande Tsitin": "/images/dishes/gande-tsitin.png",
  "Muji Chetin": "/images/dishes/muji-chetin.png"
};

const dishResearchSummaries = {
  "Rogan Josh":
    "Rogan Josh is a classic Kashmiri lamb dish known for tender meat in a deeply aromatic red gravy built with fennel, dry ginger, and Kashmiri spices.",
  Gushtaba:
    "Gushtaba is the grand finale of a Wazwan, made from finely pounded mutton meatballs simmered in a creamy yogurt gravy with a soft, velvety texture.",
  Rista:
    "Rista features hand-shaped meatballs cooked in a fiery red Kashmiri gravy and is one of the most iconic ceremonial dishes in Wazwan.",
  "Tabak Maaz":
    "Tabak Maaz is made from lamb ribs that are simmered until tender, then fried for a rich, crisp finish that often opens a traditional feast.",
  "Methi Maaz":
    "Methi Maaz is a traditional tripe dish flavored with spices and fenugreek, valued for its deep savory taste and old-school Wazwan character.",
  "Waza Kokur":
    "Waza Kokur is a Kashmiri whole-chicken preparation cooked in the style of the waza, bringing a festive chicken course into the largely meat-heavy spread.",
  "Dani Phol":
    "Dani Phol is a mutton drumstick dish prized for its rich cut of meat and its place among the more traditional courses of Wazwan.",
  "Daniwal Korma":
    "Daniwal Korma is a coriander-finished mutton curry with yogurt, spices, and onion puree, offering a fragrant and balanced break from hotter gravies.",
  "Waza Palak":
    "Waza Palak is a spinach-based Wazwan preparation that brings a greener, lighter note to the feast without leaving the traditional Kashmiri flavor profile.",
  "Waza Haak":
    "Waza Haak highlights Kashmiri collard greens cooked simply and skillfully, adding an earthy vegetal dish to the Wazwan table.",
  "Wazwaan Mushroom":
    "Wazwaan Mushroom is a mushroom-based Wazwan preparation, appreciated as a rarer vegetarian-style course with earthy flavor and softer texture.",
  "Aab Gosh":
    "Aab Gosh is a Kashmiri lamb curry cooked in a milk-based gravy, known for its gentle richness, cardamom warmth, and softer seasoning.",
  "Marchwangan Korma":
    "Marchwangan Korma is an intensely spiced Wazwan korma, recognized for a bold browned-onion sauce and a noticeably hotter flavor profile.",
  Kabab:
    "Kabab in Wazwan uses minced meat roasted on skewers over hot coals, adding smoky flavor and a familiar starter-like course to the feast.",
  Yakhin:
    "Yakhin is a curd-based Kashmiri gravy, most closely associated with meat dishes like gushtaba and valued for its mild, aromatic character.",
  "Ruwangan Chaman":
    "Ruwangan Chaman is a paneer dish in tomato-based gravy that adds color, contrast, and a recognizable vegetarian option to the Wazwan lineup.",
  "Dum Aelve":
    "Dum Aelve is a Kashmiri potato preparation cooked in yogurt gravy, offering a milder and comforting vegetarian counterpoint within the feast.",
  "Gande Tsitin":
    "Gande Tsitin is an onion chutney mixed with chilies, yogurt, salt, and spices, used to sharpen and refresh heavier bites of Wazwan.",
  "Muji Chetin":
    "Muji Chetin is a radish-and-walnut chutney that brings crunch, pungency, and freshness alongside the richer gravies of Kashmiri cuisine."
};

export default function HomePage() {
  const [dishes, setDishes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedDish, setSelectedDish] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isRestaurantModalVisible, setIsRestaurantModalVisible] = useState(false);
  const [isRestaurantModalClosing, setIsRestaurantModalClosing] = useState(false);
  const [isDishModalVisible, setIsDishModalVisible] = useState(false);
  const [isDishModalClosing, setIsDishModalClosing] = useState(false);

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
    if (!selectedDish) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsDishModalClosing(true);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedDish]);

  useEffect(() => {
    if (!isDishModalClosing) {
      return undefined;
    }

    const closeTimer = window.setTimeout(() => {
      setIsDishModalVisible(false);
      setIsDishModalClosing(false);
      setSelectedDish(null);
    }, 300);

    return () => window.clearTimeout(closeTimer);
  }, [isDishModalClosing]);

  useEffect(() => {
    if (!isRestaurantModalVisible) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsRestaurantModalClosing(true);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isRestaurantModalVisible]);

  useEffect(() => {
    if (!isRestaurantModalClosing) {
      return undefined;
    }

    const closeTimer = window.setTimeout(() => {
      setIsRestaurantModalVisible(false);
      setIsRestaurantModalClosing(false);
      setSelectedLocation(null);
    }, 220);

    return () => window.clearTimeout(closeTimer);
  }, [isRestaurantModalClosing]);

  const featuredDishes = dishes.filter(
    (dish) => dish.category === "Wazwan" || dish.name === "Gushtaba"
  );
  const locationCounts = locationTabs.reduce((counts, location) => {
    counts[location] = restaurants.filter(
      (restaurant) => (restaurant.city || "Srinagar") === location
    ).length;
    return counts;
  }, {});
  const featuredRestaurants = selectedLocation
    ? restaurants.filter((restaurant) => (restaurant.city || "Srinagar") === selectedLocation)
    : [];
  const isRestaurantModalMounted = isRestaurantModalVisible || isRestaurantModalClosing;
  const tips = [
    {
      number: "01",
      title: "Book in Advance",
      description:
        "A full Wazwan is often prepared overnight, so call ahead if you want the ceremonial feast experience rather than a standard menu order."
    },
    {
      number: "02",
      title: "Come Hungry, Come Many",
      description:
        "Wazwan is best enjoyed in a group. The shared trami experience makes the meal feel cultural, social, and complete."
    },
    {
      number: "03",
      title: "Start with the Classics",
      description:
        "If you are new to Kashmiri food, begin with Rogan Josh, Gushtaba, Rista, and Tabak Maaz before branching into rarer specialties."
    },
    {
      number: "04",
      title: "Respect the Finale",
      description:
        "Dishes like Gushtaba are traditionally served at the end of a Wazwan, so knowing the order makes the experience far more immersive."
    },
    {
      number: "05",
      title: "Ask About Authenticity",
      description:
        "Some restaurants are polished for tourists, while others preserve older cooking styles. Use the authenticity notes in the app."
    },
    {
      number: "06",
      title: "Pair Food with the Place",
      description:
        "A Dal Lake setting, an old city dining hall, and a heritage restaurant each create a very different mood around the same dish."
    }
  ];

  return (
    <div className="wazwan-shell relative overflow-hidden">
      <LandingCanvas />

      <section className="page-shell wazwan-hero-grid">
        <div className="wazwan-pattern" />

        <div className="relative z-10 mx-auto max-w-4xl text-center lg:col-span-2">
          <div className="wazwan-badge">Kashmir&apos;s definitive feast guide</div>
          <h1 className="wazwan-hero-title mt-8">
            The <em>Royal</em>
            <br />
            Table of Kashmir
          </h1>
          <p className="wazwan-hero-sub mt-6">
            Wazwan is not just a meal. It is a ceremony of tradition, hospitality, storytelling,
            and unforgettable dishes carried from the kitchens of Kashmir to the traveler&apos;s table.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/restaurants" className="wazwan-btn-primary">
              Explore Restaurants
            </Link>
            <Link href="/#dishes" className="wazwan-btn-ghost">
              Discover the Dishes -&gt;
            </Link>
          </div>
        </div>
      </section>

      <div className="wazwan-intro-strip">
        <p>
          Prepared by the <strong>Waza</strong>, Kashmir&apos;s master chefs, the Wazwan feast can
          span <strong>dozens of dishes</strong> cooked with patience, ceremony, saffron, dry
          ginger, and the soul of the valley.
        </p>
      </div>

      <section id="dishes" className="page-shell py-24">
        <div className="wazwan-section-header">
          <span className="wazwan-tag">The Courses</span>
          <h2>Signature Wazwan Dishes</h2>
          <p>
            A journey through the dishes that define Kashmir&apos;s grandest culinary tradition.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredDishes.map((dish) => (
            <article
              key={dish._id}
              className="wazwan-dish-card cursor-pointer"
              onClick={() => {
                setSelectedDish(dish);
                setTimeout(() => setIsDishModalVisible(true), 10);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedDish(dish);
                  setTimeout(() => setIsDishModalVisible(true), 10);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Open details for ${dish.name}`}
            >
              <img
                src={dishImageOverrides[dish.name] || dish.image}
                alt={dish.name}
                className="h-48 w-full object-cover"
              />
              <div className="p-6">
                <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[var(--saffron)]">
                  {dish.category}
                </p>
                <h3 className="font-display mt-2 text-2xl text-[var(--walnut)]">{dish.name}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{dish.description}</p>
                <span className="mt-4 inline-block rounded-full bg-[var(--cream-dark)] px-3 py-1 text-xs font-medium text-[var(--walnut-mid)]">
                  {dish.foodType} - {dish.spiceLevel}
                </span>
                <div className="mt-5">
                  <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-[var(--crimson)]">
                    Tap for dish details
                    <span aria-hidden="true">-&gt;</span>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="restaurants" className="bg-[var(--smoke)] py-24">
        <div className="page-shell">
          <div className="wazwan-section-header">
            <span className="wazwan-tag">Where To Eat</span>
            <h2>The Finest Wazwan Restaurants</h2>
            <p>Curated from Residency Road, Dal Lake, and Srinagar&apos;s best-known dining rooms.</p>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {locationTabs.map((location) => {
              const isActive = selectedLocation === location;
              const count = locationCounts[location] || 0;
              const icon = locationTabMeta[location]?.icon;

              return (
                <button
                  key={location}
                  type="button"
                  onClick={() => {
                    setSelectedLocation(location);
                    setIsRestaurantModalClosing(false);
                    setIsRestaurantModalVisible(true);
                  }}
                  className={`group relative min-h-[116px] overflow-hidden rounded-[26px] border px-5 py-5 text-left transition duration-300 ${
                    isActive
                      ? "border-[rgba(200,134,10,0.9)] bg-[linear-gradient(135deg,rgba(255,250,243,0.98),rgba(248,238,216,0.96))] text-[var(--walnut)] shadow-[0_24px_60px_rgba(200,134,10,0.18),0_0_0_1px_rgba(200,134,10,0.1)]"
                      : "border-[rgba(58,42,26,0.1)] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(250,245,237,0.94))] text-[var(--walnut)] shadow-[0_16px_38px_rgba(58,42,26,0.08)] hover:-translate-y-1.5 hover:scale-[1.01] hover:border-[rgba(200,134,10,0.32)] hover:shadow-[0_24px_56px_rgba(58,42,26,0.14)]"
                  }`}
                >
                  <div
                    className={`pointer-events-none absolute inset-0 opacity-100 transition duration-300 ${
                      isActive
                        ? "bg-[radial-gradient(circle_at_top_right,rgba(200,134,10,0.18),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(139,26,46,0.08),transparent_38%)]"
                        : "bg-[radial-gradient(circle_at_top_right,rgba(200,134,10,0.08),transparent_36%)]"
                    }`}
                  />
                  <div className="relative flex h-full items-center gap-4">
                    <div
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] border transition duration-300 ${
                        isActive
                          ? "border-[rgba(200,134,10,0.45)] bg-white/90 text-[var(--saffron)] shadow-[0_12px_28px_rgba(200,134,10,0.18)]"
                          : "border-[rgba(58,42,26,0.08)] bg-[rgba(255,250,244,0.82)] text-[var(--walnut-mid)] group-hover:border-[rgba(200,134,10,0.28)] group-hover:text-[var(--saffron)]"
                      }`}
                    >
                      {icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-display text-[1.45rem] leading-none tracking-[-0.02em]">
                            {location}
                          </p>
                          <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                            Restaurant Guide
                          </p>
                        </div>

                        <span
                          className={`inline-flex h-11 min-w-[46px] items-center justify-center rounded-full px-3 text-base font-semibold transition ${
                            isActive
                              ? "bg-[rgba(200,134,10,0.14)] text-[var(--saffron)] shadow-[inset_0_0_0_1px_rgba(200,134,10,0.14)]"
                              : "bg-[rgba(255,248,240,0.95)] text-[var(--walnut-mid)] shadow-[inset_0_0_0_1px_rgba(58,42,26,0.08)] group-hover:bg-[rgba(200,134,10,0.1)] group-hover:text-[var(--saffron)]"
                          }`}
                        >
                          {count}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-[28px] border border-[rgba(58,42,26,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(251,246,239,0.95))] px-6 py-12 text-center text-[var(--muted)] shadow-[0_20px_60px_rgba(58,42,26,0.08)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(200,134,10,0.18)] bg-[rgba(255,249,241,0.95)] text-[var(--saffron)] shadow-[0_10px_24px_rgba(200,134,10,0.08)]">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
                <path
                  d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
                <circle cx="12" cy="10" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </div>
            <p className="mt-5 font-accent text-[1.15rem] text-[var(--muted)]">
              Select a location to view restaurants.
            </p>
          </div>
        </div>
      </section>

      <div className="wazwan-quote">
        <p>
          &quot;To be invited to a Wazwan is to be welcomed into someone&apos;s heart. The feast is not
          cooked, it is composed like music.&quot;
        </p>
        <span>A Kashmiri elder, Srinagar</span>
      </div>

      <section id="tips" className="page-shell py-24">
        <div className="wazwan-section-header">
          <span className="wazwan-tag">Visitor Guide</span>
          <h2>How to Experience Wazwan</h2>
          <p>Everything you should know before you sit at the trami.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tips.map((tip) => (
            <article key={tip.number} className="wazwan-tip-card">
              <div className="font-display text-5xl font-bold text-[var(--saffron-light)]">
                {tip.number}
              </div>
              <h3 className="font-display mt-5 text-2xl text-[var(--walnut)]">{tip.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{tip.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="page-shell">
          <div className="flex flex-col items-center justify-between gap-6 rounded-[16px] border border-[var(--border)] bg-[var(--cream)] p-8 text-center lg:flex-row lg:text-left">
            <div>
              <p className="wazwan-tag mb-3">Plan Your Visit</p>
              <h2 className="font-display text-4xl text-[var(--walnut)]">
                Explore the full app experience
              </h2>
              <p className="font-accent mt-3 text-lg text-[var(--muted)]">
                Browse all dishes, discover every restaurant listing, save favorites, and build
                your Kashmir food trail.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/dishes" className="wazwan-btn-primary">
                View all dishes
              </Link>
              <Link href="/restaurants" className="wazwan-btn-ghost">
                View all restaurants -&gt;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {isRestaurantModalMounted ? (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center px-3 py-4 sm:px-6 sm:py-6 transition-all duration-200 ${
            isRestaurantModalClosing ? "bg-[rgba(30,22,18,0)]" : "bg-[rgba(30,22,18,0.38)]"
          } backdrop-blur-md`}
          onClick={() => setIsRestaurantModalClosing(true)}
        >
          <div
            className={`relative flex h-[min(88vh,920px)] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-white/30 bg-[rgba(255,248,240,0.74)] shadow-[0_30px_90px_rgba(30,22,18,0.22)] backdrop-blur-2xl transition-all duration-200 ${
              isRestaurantModalClosing
                ? "scale-[0.97] opacity-0"
                : "scale-100 opacity-100"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsRestaurantModalClosing(true)}
              className="absolute right-4 top-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/45 bg-white/80 text-xl text-[var(--walnut)] shadow-[0_12px_30px_rgba(58,42,26,0.14)] backdrop-blur transition hover:border-[rgba(139,26,46,0.28)] hover:text-[var(--crimson)]"
              aria-label="Close restaurant popup"
            >
              X
            </button>

            <div className="border-b border-white/35 px-6 pb-5 pt-6 sm:px-8 sm:pb-6 sm:pt-8">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--crimson)]">
                Location Dining Guide
              </p>
              <div className="mt-3 flex flex-col gap-3 pr-14 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="font-display text-3xl text-[var(--walnut)] sm:text-4xl">
                    {selectedLocation || "Restaurants"}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                    Browse every restaurant currently listed for this destination in WazwanWay.
                  </p>
                </div>
                <div className="self-start rounded-full border border-white/40 bg-white/65 px-4 py-2 text-sm font-medium text-[var(--walnut-mid)] backdrop-blur">
                  {featuredRestaurants.length} restaurants
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-4 sm:px-8 sm:pb-8 sm:pt-6">
              {featuredRestaurants.length ? (
                <div className="space-y-6">
                  {featuredRestaurants.map((restaurant) => (
                    <article key={restaurant._id} className="wazwan-restaurant-card bg-white/88 backdrop-blur-sm">
                      <div>
                        <div className="mb-4 flex items-start gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-[10px] border border-[var(--saffron-light)] bg-[var(--saffron-pale)] text-lg font-semibold text-[var(--crimson)]">
                            WW
                          </div>
                          <div>
                            <h3 className="font-display text-3xl text-[var(--walnut)]">
                              <Link href={`/restaurants/${restaurant._id}`} className="homepage-restaurant-link">
                                {restaurant.name}
                              </Link>
                            </h3>
                            <p className="mt-1 text-sm text-[var(--muted)]">
                              Location: {restaurant.location}
                            </p>
                          </div>
                        </div>
                        <p className="max-w-3xl text-sm leading-7 text-[var(--muted)]">
                          {restaurant.description}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {(restaurant.linkedDishes || []).map((dish) => (
                            <span
                              key={dish._id}
                              className="rounded-full border border-[rgba(200,134,10,0.2)] bg-[rgba(200,134,10,0.1)] px-3 py-1 text-xs font-medium text-[var(--walnut-mid)]"
                            >
                              {dish.name}
                            </span>
                          ))}
                        </div>
                        <div className="mt-6">
                          <Link
                            href={`/restaurants/${restaurant._id}`}
                            className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.08em] text-[var(--crimson)]"
                          >
                            View restaurant details
                            <span aria-hidden="true">-&gt;</span>
                          </Link>
                        </div>
                      </div>

                      <div className="text-left lg:text-right">
                        <div className="mb-2 text-sm font-medium text-[var(--walnut-mid)]">
                          Rating: {restaurant.rating} / 5
                        </div>
                        <div className="mb-2 text-sm text-[var(--muted)]">
                          Price:{" "}
                          <span className="font-medium text-[var(--walnut-mid)]">
                            {restaurant.priceLevel}
                          </span>
                        </div>
                        <div className="inline-block rounded-md bg-[var(--crimson)] px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.08em] text-white">
                          {restaurant.authentic ? "Authentic Pick" : "Dining Spot"}
                        </div>
                        <div className="mt-5">
                          <Link
                            href={`/restaurants/${restaurant._id}`}
                            className="wazwan-btn-primary inline-flex"
                          >
                            Open Details
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-white/35 bg-white/72 px-6 py-12 text-center text-[var(--muted)] shadow-card backdrop-blur">
                  No restaurants available in this location yet.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {selectedDish ? (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-8 transition-all duration-300 ${
            isDishModalVisible && !isDishModalClosing
              ? "bg-[rgba(30,22,18,0.38)] backdrop-blur-md opacity-100"
              : "bg-[rgba(30,22,18,0)] backdrop-blur-none opacity-0"
          }`}
          onClick={() => setIsDishModalClosing(true)}
        >
          <div
            className={`relative w-full max-w-2xl overflow-hidden rounded-[24px] border border-[var(--border)] bg-white shadow-2xl transition-all duration-300 ${
              isDishModalVisible && !isDishModalClosing
                ? "scale-100 translate-y-0"
                : "scale-95 translate-y-4"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsDishModalClosing(true)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--walnut)] transition hover:border-[var(--saffron)] hover:text-[var(--crimson)]"
              aria-label="Close dish details"
            >
              X
            </button>

            <img
              src={dishImageOverrides[selectedDish.name] || selectedDish.image}
              alt={selectedDish.name}
              className="h-64 w-full object-cover rounded-t-[24px]"
            />

            <div className="space-y-5 p-7 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="place-badge">{selectedDish.category}</span>
                <span className="place-badge">{selectedDish.foodType}</span>
                <span className="place-badge">{selectedDish.spiceLevel}</span>
              </div>

              <div>
                <h3 className="font-display text-4xl text-[var(--walnut)]">{selectedDish.name}</h3>
                <p className="mt-4 text-base leading-8 text-[var(--muted)]">
                  {dishResearchSummaries[selectedDish.name] ||
                    selectedDish.fullDescription ||
                    selectedDish.description}
                </p>
              </div>

              <div className="grid gap-4 border-t border-[var(--border)] pt-5 sm:grid-cols-2">
                <div>
                  <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[var(--saffron)]">
                    Why try it
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                    {selectedDish.description}
                  </p>
                </div>
                <div>
                  <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[var(--saffron)]">
                    Typical price
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                    {selectedDish.priceRange}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/dishes" className="wazwan-btn-primary">
                  Explore all dishes
                </Link>
                <button
                  type="button"
                  onClick={() => setIsDishModalClosing(true)}
                  className="wazwan-btn-ghost"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
