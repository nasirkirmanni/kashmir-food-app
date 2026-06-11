"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function PlanTripPage() {
  const [step, setStep] = useState(1);
  const [duration, setDuration] = useState("5"); // default 5 days
  const [style, setStyle] = useState("Foodie"); // Foodie, Family, Luxury, Explorer
  const [cuisine, setCuisine] = useState("Wazwan"); // Wazwan, Street, Trout, Home-style
  const [result, setResult] = useState(null);

  const handleGeneratePlan = () => {
    // Curate matching templates
    let title = `${duration}-Day Custom ${style} Itinerary`;
    let spots = [];
    let dishesToTry = [];
    let dayByDay = [];

    if (duration === "3") {
      dayByDay = [
        {
          day: 1,
          morning: "Heritage walk in Old City Srinagar, breakfast Noon Chai and Girda at local Kandur.",
          afternoon: "Visit Jama Masjid & Shah-e-Hamdan shrine.",
          evening: "Heritage Wazwan dinner at Ahdoos Restaurant."
        },
        {
          day: 2,
          morning: "Shikara ride on Dal Lake, exploring floating vegetable markets.",
          afternoon: "Visit Nishat Bagh & Shalimar Bagh Mughal Gardens.",
          evening: "Khayam Chowk food crawl: Mutton Tujji skewers grilled on charcoal."
        },
        {
          day: 3,
          morning: "Walk through the Zabarwan forest trail or botanical garden.",
          afternoon: "Visit Hazratbal shrine and grab street fritters (Nadru Monji).",
          evening: "Saffron Kahwa sunset cruise on a Dal Lake boat."
        }
      ];
    } else if (duration === "5") {
      dayByDay = [
        {
          day: 1,
          morning: "Arrive in Srinagar, settle into a Dal Lake houseboat. Afternoon Shikara ride.",
          afternoon: "Sip Kahwa overlooking Hazratbal shrine.",
          evening: "Wazwan dining at Mughal Darbar."
        },
        {
          day: 2,
          morning: "Drive to Gulmarg meadows. Ride the Gondola cable car to Apharwat peak.",
          afternoon: "Snow hiking or golfing around the pine forests.",
          evening: "Warming potato stews (Dum Aelve) at a mountain cabin restaurant."
        },
        {
          day: 3,
          morning: "Drive from Gulmarg to Pahalgam shepherd valley. Pass saffron fields at Pampore.",
          afternoon: "Arrive at Lidder River valley. Pine walk.",
          evening: "Fresh Lidder River trout fish fry at a riverside resort."
        },
        {
          day: 4,
          morning: "Explore the scenic Aru Valley and Betaab Valley meadow walks.",
          afternoon: "Visit the Kokernag botanical springs and the local trout fisheries.",
          evening: "Enjoy Al-Hachh Mutton (slow-cooked mutton with sun-dried gourd) in Pahalgam."
        },
        {
          day: 5,
          morning: "Return to Srinagar. Morning walk around Nigeen lake.",
          afternoon: "Explore the spice market in Maharaj Gunj for local saffron and walnuts.",
          evening: "Celebration dinner on the houseboat."
        }
      ];
    } else {
      // 7 Days
      dayByDay = [
        {
          day: 1,
          morning: "Arrive in Srinagar, check in. Settle down with fresh Kandur baker bread.",
          afternoon: "Explore Shalimar Bagh garden front.",
          evening: "Houseboat sunset cruise."
        },
        {
          day: 2,
          morning: "Drive to Sonamarg glacier valley. Take pony trail to Thajiwas Glacier.",
          afternoon: "Hike near the Sindh river banks.",
          evening: "Roadside trout grills cooked over local firewood."
        },
        {
          day: 3,
          morning: "Travel from Sonamarg through the high Razdan Pass.",
          afternoon: "Descend into the remote Gurez frontier valley.",
          evening: "Dine on local Shina buckwheat bread and salted pink tea in Dawar."
        },
        {
          day: 4,
          morning: "Explore the ancient village settlements under Habba Khatoon peak.",
          afternoon: "Walk along the pristine turquoise Kishanganga River.",
          evening: "Homestay traditional stew dinner with local mountain families."
        },
        {
          day: 5,
          morning: "Return drive from Gurez border valley back to Srinagar.",
          afternoon: "Stop at viewpoints overlooking Wular Lake.",
          evening: "Fried fish street dinner by the lakeside road."
        },
        {
          day: 6,
          morning: "Old city Srinagar heritage food walk: visit copper Samovar hammerers.",
          afternoon: "Explore historic shrines and Zaina Kadal bazaars.",
          evening: "Dine on Nadru Yakhni (lotus stem yogurt curry) at Lhasa Restaurant."
        },
        {
          day: 7,
          morning: "Morning stroll in the almond orchards of Hari Parbat.",
          afternoon: "Visit the Pari Mahal ruins.",
          evening: "Grand Wazwan dinner feast (Trami) with the complete set: Gushtaba, Rista, and Tabak Maaz."
        }
      ];
    }

    // Adjust highlights based on style & cuisine choices
    if (cuisine === "Wazwan") {
      spots = ["Ahdoos (Residency Road)", "Mughal Darbar (Lal Chowk)", "Waza Kitchens in Old City"];
      dishesToTry = ["Gushtaba (Yogurt Meatballs)", "Rista (Red Chili Meatballs)", "Tabak Maaz (Crisp Ribs)", "Rogan Josh"];
    } else if (cuisine === "Street") {
      spots = ["Khayam Chowk (Tujji lane)", "Hazratbal Market Fritter Stalls", "Lal Bazar Kandur Bakeries"];
      dishesToTry = ["Mutton Tujji (Barbecue)", "Nadru Monji (Lotus Fritters)", "Lavas (Flatbread Wrap)", "Noon Chai"];
    } else if (cuisine === "Trout") {
      spots = ["Trout Beat (Pahalgam)", "Glacier Heights (Sonamarg)", "Kokernag Springs Cafe"];
      dishesToTry = ["Lidder Trout Fry", "Nadru Yakhni", "Kashmiri Pulao", "Saffron Kahwa"];
    } else {
      // Home-style
      spots = ["Local homestays in Srinagar", "Heritage rooms in Shehr-e-Khas", "Lhasa Restaurant"];
      dishesToTry = ["Nadru Yakhni (Lotus Stems)", "Haak Saag (Collard Greens)", "Al-Hachh Mutton", "Matsgand (Meatballs)"];
    }

    // Set result
    setResult({
      title,
      spots,
      dishesToTry,
      dayByDay
    });
    setStep(4); // Move to results step
  };

  return (
    <div className="wazwan-shell relative min-h-screen pb-24">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.06),transparent_60%)] pointer-events-none" />

      {/* Hero */}
      <section className="place-hero !grid-cols-1 md:!grid-cols-[1fr_auto] gap-8 items-center border-b border-white/5 pb-12">
        <div>
          <span className="place-eyebrow">Interactive Trip Planner</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tight mb-4">
            Plan My Kashmir Trip
          </h1>
          <p className="text-white/70 max-w-2xl text-base md:text-lg leading-relaxed">
            Specify your days, travel style, and culinary interests to instantly construct a curated culinary travel map.
          </p>
        </div>
        <div>
          <Link href="/" className="wazwan-btn-ghost text-xs uppercase tracking-widest font-bold border border-white/10 px-6 py-3 rounded-full hover:border-white/30">
            &larr; Back to Home
          </Link>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md"
            >
              <span className="text-[var(--saffron)] text-[0.6rem] font-bold uppercase tracking-[0.25em] block mb-2">
                Step 1 of 3
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-6">
                How many days is your trip?
              </h2>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: "3 Days", value: "3", desc: "Short Weekend Break" },
                  { label: "5 Days", value: "5", desc: "Standard Valley Tour" },
                  { label: "7 Days", value: "7", desc: "Wilderness Explorer" }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setDuration(item.value)}
                    className={`p-5 rounded-xl border text-center transition-all ${
                      duration === item.value
                        ? "bg-[var(--saffron)] border-[var(--saffron)] text-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                        : "bg-black/30 border-white/10 text-white hover:border-white/30"
                    }`}
                  >
                    <div className="text-lg font-bold">{item.label}</div>
                    <div className={`text-[0.62rem] mt-1 ${duration === item.value ? "text-black/80" : "text-white/50"}`}>
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="wazwan-btn-primary rounded-full px-8 py-3 text-xs uppercase tracking-widest font-bold"
                >
                  Next Step &rarr;
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md"
            >
              <span className="text-[var(--saffron)] text-[0.6rem] font-bold uppercase tracking-[0.25em] block mb-2">
                Step 2 of 3
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-6">
                What is your travel style?
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: "Foodie Pilgrim", value: "Foodie", desc: "Focus strictly on authentic tastes" },
                  { label: "Family Holiday", value: "Family", desc: "Comfortable, safe and accessible" },
                  { label: "Luxury Honeymoon", value: "Luxury", desc: "Premium stays, scenic resort views" },
                  { label: "Adventure Explorer", value: "Explorer", desc: "Valleys, mountains and hiking trails" }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setStyle(item.value)}
                    className={`p-5 rounded-xl border text-left transition-all ${
                      style === item.value
                        ? "bg-[var(--saffron)] border-[var(--saffron)] text-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                        : "bg-black/30 border-white/10 text-white hover:border-white/30"
                    }`}
                  >
                    <div className="text-base font-bold">{item.label}</div>
                    <div className={`text-[0.65rem] mt-1 leading-normal ${style === item.value ? "text-black/80" : "text-white/50"}`}>
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="wazwan-btn-ghost text-xs uppercase tracking-widest font-bold px-6 py-3 border border-white/10 rounded-full hover:border-white/20"
                >
                  &larr; Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="wazwan-btn-primary rounded-full px-8 py-3 text-xs uppercase tracking-widest font-bold"
                >
                  Next Step &rarr;
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md"
            >
              <span className="text-[var(--saffron)] text-[0.6rem] font-bold uppercase tracking-[0.25em] block mb-2">
                Step 3 of 3
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-6">
                Select your culinary interest
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { label: "Wazwan Feasts", value: "Wazwan", desc: "Iconic minced meat dishes cooked over wood fire" },
                  { label: "Street Food & Tea", value: "Street", desc: "Noon Chai, local breads, grilled Tujji" },
                  { label: "River Trout Fry", value: "Trout", desc: "Fresh Lidder and Sindh mountain river trout" },
                  { label: "Home-style Recipes", value: "Home-style", desc: "Radish-fish, lotus stems, collard greens" }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setCuisine(item.value)}
                    className={`p-5 rounded-xl border text-left transition-all ${
                      cuisine === item.value
                        ? "bg-[var(--saffron)] border-[var(--saffron)] text-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                        : "bg-black/30 border-white/10 text-white hover:border-white/30"
                    }`}
                  >
                    <div className="text-base font-bold">{item.label}</div>
                    <div className={`text-[0.65rem] mt-1 leading-normal ${cuisine === item.value ? "text-black/80" : "text-white/50"}`}>
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="wazwan-btn-ghost text-xs uppercase tracking-widest font-bold px-6 py-3 border border-white/10 rounded-full hover:border-white/20"
                >
                  &larr; Back
                </button>
                <button
                  onClick={handleGeneratePlan}
                  className="wazwan-btn-primary rounded-full px-8 py-3 text-xs uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-all"
                >
                  Generate My Plan!
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Header card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
                <span className="text-[var(--saffron)] text-[0.65rem] font-bold tracking-[0.25em] uppercase block mb-3">
                  Waza AI Plan Completed
                </span>
                <h2 className="text-3xl font-display font-medium text-white mb-2">
                  {result.title}
                </h2>
                <p className="text-white/60 text-sm leading-relaxed max-w-xl">
                  Constructed dynamically for a <strong>{style}</strong> profile, with key culinary stops optimized for <strong>{cuisine}</strong> lovers.
                </p>
                <button
                  onClick={() => setStep(1)}
                  className="absolute top-6 right-6 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/30 rounded-full px-4 py-1.5 bg-black/40"
                >
                  Reset Quiz
                </button>
              </div>

              {/* Day-by-Day Timeline map */}
              <div className="space-y-4">
                <h3 className="text-lg font-display text-white font-medium pl-1">
                  Day-by-Day Journey Map
                </h3>
                <div className="relative border-l border-white/10 pl-6 space-y-8 ml-3">
                  {result.dayByDay.map((dayPlan) => (
                    <div key={dayPlan.day} className="relative">
                      {/* Bubble Day bubble */}
                      <div className="absolute -left-[35px] top-0 flex items-center justify-center w-5.5 h-5.5 rounded-full bg-[var(--saffron)] text-black font-bold font-display text-[0.7rem] shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                        {dayPlan.day}
                      </div>
                      <div className="rounded-xl border border-white/5 bg-white/5 p-5">
                        <span className="text-white/40 text-[0.55rem] font-bold uppercase tracking-wider block mb-1">
                          Day 0{dayPlan.day}
                        </span>
                        
                        <div className="space-y-3 mt-2 text-xs">
                          <div>
                            <span className="text-[var(--saffron)] font-bold block">Morning & Sightseeing</span>
                            <span className="text-white/80">{dayPlan.morning}</span>
                          </div>
                          {dayPlan.afternoon && (
                            <div>
                              <span className="text-[var(--saffron)] font-bold block">Afternoon Stop</span>
                              <span className="text-white/80">{dayPlan.afternoon}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-[var(--saffron)] font-bold block">Evening Dining Spot</span>
                            <span className="text-white/80">{dayPlan.evening}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations Card Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dining Stops */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--saffron)] mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Recommended Dining Stops
                  </h4>
                  <ul className="space-y-3">
                    {result.spots.map((spot, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-xs text-white/80">
                        <span className="text-[var(--saffron)] text-sm leading-none">•</span>
                        <div>
                          <span className="font-semibold text-white block">{spot}</span>
                          <span className="text-white/50 text-[0.65rem]">Audited by Waza AI</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Dish Checklist */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--saffron)] mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Your Dish Checklist
                  </h4>
                  <ul className="space-y-3">
                    {result.dishesToTry.map((dish, idx) => (
                      <li key={idx} className="flex gap-3 items-center text-xs text-white/80">
                        <input
                          type="checkbox"
                          id={`dish-${idx}`}
                          className="rounded border-white/10 bg-black/40 text-[var(--saffron)] focus:ring-[var(--saffron)] cursor-pointer h-4 w-4"
                        />
                        <label htmlFor={`dish-${idx}`} className="cursor-pointer font-medium hover:text-[var(--saffron)] transition-colors">
                          {dish}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bot query footer */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md text-center">
                <h3 className="text-xl font-display text-white mb-2">Want further personalization?</h3>
                <p className="text-white/60 text-sm max-w-md mx-auto mb-6">
                  Chat with Waza AI. You can say: <em className="text-[var(--saffron)]">"Modify my 5-day foodie itinerary to include child-friendly dinner options in Srinagar."</em>
                </p>
                <div className="flex justify-center gap-4">
                  <Link href="/waza-ai" className="wazwan-btn-primary rounded-full px-8 py-3 text-xs uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:scale-105 transition-transform">
                    Start Custom Chat
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
