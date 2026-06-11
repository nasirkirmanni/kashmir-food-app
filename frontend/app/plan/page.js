"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { endpoints, request } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

// Static fallback data in case API fails
const fallbackDestinations = [
  { name: "Srinagar", location: "Central Kashmir", bestTimeToVisit: "April to October", attractions: ["Dal Lake Shikara", "Mughal Gardens"], authenticityScore: 4.5, touristFriendlinessScore: 4.8, luxuryScore: 4.2 },
  { name: "Gulmarg", location: "North Kashmir, Baramulla", bestTimeToVisit: "December to March", attractions: ["Gondola Phase II", "Apharwat Peak"], authenticityScore: 4.0, touristFriendlinessScore: 4.5, luxuryScore: 4.9 },
  { name: "Pahalgam", location: "South Kashmir, Anantnag", bestTimeToVisit: "March to November", attractions: ["Aru Valley", "Betaab Valley"], authenticityScore: 4.7, touristFriendlinessScore: 4.6, luxuryScore: 4.8 },
  { name: "Sonamarg", location: "Central Kashmir, Ganderbal", bestTimeToVisit: "April to October", attractions: ["Thajiwas Glacier", "Sindh River Rapids"], authenticityScore: 4.2, touristFriendlinessScore: 4.2, luxuryScore: 3.8 },
  { name: "Gurez Valley", location: "North Kashmir, Bandipora", bestTimeToVisit: "June to September", attractions: ["Habba Khatoon Peak", "Dawar Hamlet"], authenticityScore: 5.0, touristFriendlinessScore: 3.5, luxuryScore: 2.5 }
];

export default function PlanTripPage() {
  const [step, setStep] = useState(1);
  const [durationMode, setDurationMode] = useState("predefined"); // predefined vs custom
  const [duration, setDuration] = useState("5"); // parsed to integer later
  const [selectedStyles, setSelectedStyles] = useState([]); // multi-select
  const [travelParty, setTravelParty] = useState("Couple"); // single-select
  const [travelSeason, setTravelSeason] = useState("Summer"); // single-select
  const [budgetTier, setBudgetTier] = useState("Premium"); // single-select
  const [selectedInterests, setSelectedInterests] = useState([]); // multi-select

  // Database collections
  const [dbDestinations, setDbDestinations] = useState([]);
  const [dbRestaurants, setDbRestaurants] = useState([]);
  const [dbDishes, setDbDishes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Modal / Preview state
  const [result, setResult] = useState(null);
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  // Fetch collections on mount
  useEffect(() => {
    Promise.all([
      request(endpoints.destinations()).catch(() => fallbackDestinations),
      request(endpoints.restaurants()).catch(() => []),
      request(endpoints.dishes()).catch(() => [])
    ])
      .then(([destData, restData, dishData]) => {
        setDbDestinations(destData.length ? destData : fallbackDestinations);
        setDbRestaurants(restData);
        setDbDishes(dishData);
        setLoadingData(false);
      })
      .catch((err) => {
        console.error("Error loading planner databases:", err);
        setDbDestinations(fallbackDestinations);
        setLoadingData(false);
      });
  }, []);

  // Multi-select helpers
  const toggleStyle = (style) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  // Reusable future-ready Itinerary Engine
  const generateItinerary = (params, db) => {
    const { days, styles, party, season, budget, interests } = params;
    const { destinations, restaurants, dishes } = db;

    const numDays = parseInt(days, 10) || 5;

    // Score weight mapping based on traveler preferences
    const scoredDestinations = destinations.map((dest) => {
      let score = 0;

      // Base weight from DB audited scores
      const auth = dest.authenticityScore || 4.0;
      const friend = dest.touristFriendlinessScore || 4.0;
      const lux = dest.luxuryScore || 3.0;

      // Apply traveler profile weights
      if (styles.includes("Food Lover")) score += auth * 2.0;
      if (styles.includes("Luxury Traveler")) score += lux * 2.0;
      if (styles.includes("Cultural Explorer")) score += auth * 1.5 + friend * 0.5;
      if (styles.includes("Family Vacation")) score += friend * 2.0;
      if (styles.includes("Couple / Honeymoon")) score += lux * 1.2 + auth * 0.8;
      if (styles.includes("Adventure Seeker")) score += auth * 1.0 + friend * 1.0;

      // Season contextual matching
      const destNameLower = dest.name.toLowerCase();
      if (season === "Winter") {
        if (destNameLower.includes("gulmarg")) score += 10;
        if (destNameLower.includes("srinagar")) score += 5;
      } else if (season === "Summer" || season === "Spring") {
        if (destNameLower.includes("pahalgam") || destNameLower.includes("sonamarg") || destNameLower.includes("valley")) {
          score += 8;
        }
      }

      // Travel party matching
      if (party === "Couple" && lux >= 4.0) score += 3;
      if (party === "Family" && friend >= 4.5) score += 4;

      return { dest, score };
    }).sort((a, b) => b.score - a.score);

    // Pick top destinations, distribute dynamically over N days
    const chosenDests = scoredDestinations.map((sd) => sd.dest);

    const dayByDay = [];
    for (let d = 1; d <= numDays; d++) {
      // Rotate through best scored destinations
      const currentDest = chosenDests[(d - 1) % chosenDests.length] || destinations[0];

      // Find matching restaurants in this destination
      let destRestaurants = restaurants.filter(
        (r) => (r.city || "").toLowerCase() === currentDest.name.toLowerCase()
      );
      if (destRestaurants.length === 0) {
        // Fallback to restaurants in same region or general list
        destRestaurants = restaurants.length ? restaurants : [{ name: "Local Traditional Eatery", location: currentDest.name, rating: 4.2, priceLevel: "Mid-range", authentic: true, linkedDishes: [] }];
      }

      // Sort restaurants based on budget tier and styles
      const sortedRestaurants = [...destRestaurants].sort((a, b) => {
        let rScoreA = a.rating || 4.0;
        let rScoreB = b.rating || 4.0;

        if (budget === "Luxury") {
          if (a.priceLevel === "Luxury") rScoreA += 5;
          if (b.priceLevel === "Luxury") rScoreB += 5;
          rScoreA += (a.luxuryScore || 3.0);
          rScoreB += (b.luxuryScore || 3.0);
        } else if (budget === "Budget") {
          if (a.priceLevel === "Budget") rScoreA += 5;
          if (b.priceLevel === "Budget") rScoreB += 5;
        }

        if (styles.includes("Food Lover")) {
          rScoreA += (a.authenticityScore || 4.0) * 1.5;
          rScoreB += (b.authenticityScore || 4.0) * 1.5;
        }

        return rScoreB - rScoreA;
      });

      const recommendedRestaurant = sortedRestaurants[0] || restaurants[0] || { name: "Traditional Waza Kitchen", location: "Main Chowk" };

      // Find recommended dish served here or matching interests
      let recommendedDish = null;
      if (recommendedRestaurant.linkedDishes && recommendedRestaurant.linkedDishes.length) {
        // Resolve linked dishes from ID map
        const resolvedDishes = recommendedRestaurant.linkedDishes.map((id) =>
          dishes.find((dish) => dish._id === id || dish.slug === id)
        ).filter(Boolean);

        if (resolvedDishes.length) {
          // If interests selected, prioritize matching dish
          const matchingInterest = resolvedDishes.find((dish) => {
            const cat = (dish.category || "").toLowerCase();
            if (interests.includes("Traditional Wazwan") && cat === "wazwan") return true;
            if (interests.includes("Street Food") && cat === "street food") return true;
            if (interests.includes("Trout & Mountain Cuisine") && (dish.name.toLowerCase().includes("trout") || dish.name.toLowerCase().includes("fish"))) return true;
            return false;
          });
          recommendedDish = matchingInterest || resolvedDishes[0];
        }
      }

      if (!recommendedDish) {
        // Select general dish
        recommendedDish = dishes.length ? dishes[(d - 1) % dishes.length] : { name: "Rogan Josh", category: "Wazwan" };
      }

      // Budget indicator
      const budgetMap = { Budget: "₹", "Mid-Range": "₹₹", Premium: "₹₹₹", Luxury: "₹₹₹₹" };
      const estBudget = budgetMap[budget] || "₹₹";

      // Contextual travel tips
      let travelTip = "Wear comfortable walking shoes and carry small change.";
      if (currentDest.name.toLowerCase().includes("gulmarg")) {
        travelTip = season === "Winter"
          ? "Rent snow boots and hire an audited local guide for Phase II gondola trails."
          : "Enjoy the scenic meadows; carry a light jacket for breezy evenings.";
      } else if (currentDest.name.toLowerCase().includes("pahalgam")) {
        travelTip = "Take a pony ride to Baisaran Meadow (Mini Switzerland) and keep Lidder river walks in the morning.";
      } else if (season === "Winter") {
        travelTip = "Try traditional Harissa in Old City at dawn; stay indoors during snow storms and keep room heaters active.";
      } else if (season === "Autumn") {
        travelTip = "Walk among the golden-orange Chinar trees at Shalimar Bagh and carry path cameras for scenic autumn foliage.";
      }

      // Choose attraction
      const attraction = currentDest.attractions && currentDest.attractions.length
        ? currentDest.attractions[(d - 1) % currentDest.attractions.length]
        : `${currentDest.name} Scenic Point`;

      dayByDay.push({
        day: d,
        destination: currentDest.name,
        attraction,
        restaurant: recommendedRestaurant.name,
        restaurantSlug: recommendedRestaurant.slug || recommendedRestaurant._id,
        dish: recommendedDish.name,
        dishSlug: recommendedDish.slug || recommendedDish._id,
        estBudget,
        travelTip
      });
    }

    // Assemble Trip Summary
    const uniqueDishes = Array.from(new Set(dayByDay.map((d) => d.dish)));
    const uniqueRestaurants = Array.from(new Set(dayByDay.map((d) => d.restaurant)));

    // Budget range calculation helper
    const costPerDay = { Budget: 2000, "Mid-Range": 5000, Premium: 10000, Luxury: 25000 }[budget];
    const totalEstCost = `₹${(costPerDay * numDays * (party === "Solo Traveler" ? 1 : party === "Couple" ? 1.8 : 3.5)).toLocaleString()} - ₹${(costPerDay * numDays * 1.5 * (party === "Solo Traveler" ? 1 : party === "Couple" ? 1.8 : 3.5)).toLocaleString()}`;

    // Select Photo Spots & Cultural experiences based on selections
    const photoSpots = [];
    if (dayByDay.some((d) => d.destination === "Srinagar")) photoSpots.push("Dal Lake houseboats during golden sunset", "Shalimar Bagh stone fountains");
    if (dayByDay.some((d) => d.destination === "Gulmarg")) photoSpots.push("Apharwat peak snow ridges", "Baba Reshi shrine ancient wood structures");
    if (dayByDay.some((d) => d.destination === "Pahalgam")) photoSpots.push("Betaab Valley streams", "Aru valley pine hills");
    if (photoSpots.length < 2) photoSpots.push("Local spice markets Maharaj Gunj", "Turquoise flows of Lidder River");

    const culturalExperiences = [];
    if (interests.includes("Traditional Wazwan")) culturalExperiences.push("Feasting from a copper Trami platter with local etiquette");
    if (interests.includes("Kandur Bakery")) culturalExperiences.push("Morning chat with neighborhood bakers at a wood-fired Kandur-wan");
    if (interests.includes("Kahwa Experiences")) culturalExperiences.push("Brewing custom saffron tea in an antique brass Samovar");
    if (culturalExperiences.length < 2) culturalExperiences.push("Sipping pink salted Noon Chai on a wooden houseboat deck");

    return {
      title: `${numDays}-Day ${season} Getaway for a ${party}`,
      spots: uniqueRestaurants,
      dishesToTry: uniqueDishes,
      dayByDay,
      summary: {
        totalEstCost,
        photoSpots,
        culturalExperiences
      }
    };
  };

  const handleGeneratePlan = () => {
    const params = {
      days: duration,
      styles: selectedStyles.length ? selectedStyles : ["Food Lover"],
      party: travelParty,
      season: travelSeason,
      budget: budgetTier,
      interests: selectedInterests.length ? selectedInterests : ["Traditional Wazwan"]
    };

    const db = {
      destinations: dbDestinations,
      restaurants: dbRestaurants,
      dishes: dbDishes
    };

    // Run dynamic recommendation engine
    const itinerary = generateItinerary(params, db);
    setResult(itinerary);
    setStep(7); // Jump to results page
  };

  const compilePrompt = () => {
    return `Plan a ${duration}-day Kashmir trip.
Traveler Type: ${selectedStyles.length ? selectedStyles.join(" + ") : "Food Lover"}
Travel Party: ${travelParty}
Season: ${travelSeason}
Budget: ${budgetTier}
Interests: ${selectedInterests.length ? selectedInterests.join(", ") : "Traditional Wazwan"}

Generate itinerary using destinations, restaurants, and dishes from the Wazwan Way database.`;
  };

  const handleSendToWazaAI = () => {
    const promptText = compilePrompt();
    setShowPromptPreview(false);

    if (typeof window !== "undefined") {
      if (window.innerWidth >= 768) {
        // Desktop: Dispatch global custom window event to open layout chatbot drawer
        window.dispatchEvent(new CustomEvent("open-waza-ai-prompt", { detail: promptText }));
      } else {
        // Mobile: Redirect to full screen waza-ai component with URL parameters
        window.location.href = `/waza-ai?prompt=${encodeURIComponent(promptText)}`;
      }
    }
  };

  return (
    <div className="wazwan-shell relative min-h-screen pb-24">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.06),transparent_60%)] pointer-events-none" />

      {/* Hero */}
      <section className="place-hero !grid-cols-1 md:!grid-cols-[1fr_auto] gap-8 items-center border-b border-white/5 pb-12">
        <div>
          <span className="place-eyebrow">Luxury Travel Concierge</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tight mb-4">
            Plan My Kashmir Trip
          </h1>
          <p className="text-white/70 max-w-2xl text-base md:text-lg leading-relaxed">
            Construct a personalized, score-weighted itinerary leveraging audited database reviews, local restaurants, and wazwan courses.
          </p>
        </div>
        <div>
          <Link href="/" className="wazwan-btn-ghost text-xs uppercase tracking-widest font-bold border border-white/10 px-6 py-3 rounded-full hover:border-white/30">
            &larr; Back to Home
          </Link>
        </div>
      </section>

      {/* Loading data state */}
      {loadingData && (
        <div className="max-w-3xl mx-auto px-4 mt-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--saffron)] mx-auto mb-4"></div>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Querying database collections...</p>
        </div>
      )}

      {/* Main Questionnaire Flow */}
      {!loadingData && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <AnimatePresence mode="wait">
            {/* STEP 1: Duration Selector */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[var(--saffron)] text-[0.6rem] font-bold uppercase tracking-[0.25em]">
                    Step 1 of 6: Duration
                  </span>
                  <span className="text-white/40 text-xs font-semibold">15% Complete</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-6">
                  How many days is your trip?
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "3 Days", value: "3", desc: "Weekend getaway", mode: "predefined" },
                    { label: "5 Days", value: "5", desc: "Classic Valley tour", mode: "predefined" },
                    { label: "7 Days", value: "7", desc: "Wilderness explorer", mode: "predefined" },
                    { label: "Custom Trip", value: "custom", desc: "Choose own duration", mode: "custom" }
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setDurationMode(item.mode);
                        if (item.value !== "custom") {
                          setDuration(item.value);
                        }
                      }}
                      className={`p-5 rounded-xl border text-center transition-all ${
                        (item.mode === "custom" && durationMode === "custom") ||
                        (item.mode === "predefined" && durationMode === "predefined" && duration === item.value)
                          ? "bg-[var(--saffron)] border-[var(--saffron)] text-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                          : "bg-black/30 border-white/10 text-white hover:border-white/30"
                      }`}
                    >
                      <div className="text-base font-bold">{item.label}</div>
                      <div className={`text-[0.62rem] mt-1 leading-normal ${
                        (item.mode === "custom" && durationMode === "custom") ||
                        (item.mode === "predefined" && durationMode === "predefined" && duration === item.value)
                          ? "text-black/85"
                          : "text-white/50"
                      }`}>
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom slider display (1 - 30 days) */}
                {durationMode === "custom" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-8 p-6 bg-black/40 border border-white/5 rounded-xl text-center"
                  >
                    <div className="text-xs uppercase tracking-widest text-white/50 mb-3">
                      Select Custom Duration
                    </div>
                    <div className="text-4xl font-display font-medium text-[var(--saffron)] mb-4">
                      {duration} Days
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--saffron)]"
                    />
                    <div className="flex justify-between text-[0.6rem] text-white/40 mt-2">
                      <span>1 Day</span>
                      <span>15 Days</span>
                      <span>30 Days</span>
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-end border-t border-white/5 pt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="wazwan-btn-primary rounded-full px-8 py-3 text-xs uppercase tracking-widest font-bold"
                  >
                    Next Step &rarr;
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Travel Style (Multi-select) */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[var(--saffron)] text-[0.6rem] font-bold uppercase tracking-[0.25em]">
                    Step 2 of 6: Travel Style
                  </span>
                  <span className="text-white/40 text-xs font-semibold">33% Complete</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-2">
                  Select your travel style
                </h2>
                <p className="text-white/50 text-xs mb-6">Select all options that apply to your journey</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { label: "Food Lover", value: "Food Lover", desc: "Prioritizes food authenticity, heritage recipes, and Waza kitchens" },
                    { label: "Luxury Traveler", value: "Luxury Traveler", desc: "Focuses on high-end resort lodging, comfort, and luxury dining" },
                    { label: "Adventure Seeker", value: "Adventure Seeker", desc: "Tours active valleys, mountain hikes, and stream walks" },
                    { label: "Family Vacation", value: "Family Vacation", desc: "Safe, highly accessible routes and tourist-friendly dining" },
                    { label: "Couple / Honeymoon", value: "Couple / Honeymoon", desc: "Romantic lakeside scenic points and private cozy environments" },
                    { label: "Cultural Explorer", value: "Cultural Explorer", desc: "Emphasizes historical shrines, copper craft markets, and old city walks" }
                  ].map((item) => {
                    const isSelected = selectedStyles.includes(item.value);
                    return (
                      <button
                        key={item.value}
                        onClick={() => toggleStyle(item.value)}
                        className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? "bg-[var(--saffron)] border-[var(--saffron)] text-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                            : "bg-black/30 border-white/10 text-white hover:border-white/30"
                        }`}
                      >
                        <div className="text-sm font-bold flex justify-between items-center w-full">
                          <span>{item.label}</span>
                          {isSelected && <span className="text-xs">✓</span>}
                        </div>
                        <div className={`text-[0.65rem] mt-2 leading-normal ${isSelected ? "text-black/80" : "text-white/50"}`}>
                          {item.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between border-t border-white/5 pt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="wazwan-btn-ghost text-xs uppercase tracking-widest font-bold px-6 py-3 border border-white/10 rounded-full hover:border-white/20"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={selectedStyles.length === 0}
                    className="wazwan-btn-primary rounded-full px-8 py-3 text-xs uppercase tracking-widest font-bold disabled:opacity-50"
                  >
                    Next Step &rarr;
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Travel Party (Single-select) */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[var(--saffron)] text-[0.6rem] font-bold uppercase tracking-[0.25em]">
                    Step 3 of 6: Travel Party
                  </span>
                  <span className="text-white/40 text-xs font-semibold">50% Complete</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-6">
                  Who are you traveling with?
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
                  {[
                    { label: "Solo Traveler", value: "Solo Traveler", desc: "Independent adventure" },
                    { label: "Couple", value: "Couple", desc: "Romantic getaway" },
                    { label: "Family", value: "Family", desc: "All ages comfort" },
                    { label: "Friends", value: "Friends", desc: "Group exploration" },
                    { label: "Business", value: "Business Traveler", desc: "Work-friendly stays" }
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setTravelParty(item.value)}
                      className={`p-4 rounded-xl border text-center transition-all flex flex-col justify-between items-center h-28 ${
                        travelParty === item.value
                          ? "bg-[var(--saffron)] border-[var(--saffron)] text-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                          : "bg-black/30 border-white/10 text-white hover:border-white/30"
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className={`text-[0.55rem] mt-2 leading-tight ${travelParty === item.value ? "text-black/85" : "text-white/40"}`}>
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between border-t border-white/5 pt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="wazwan-btn-ghost text-xs uppercase tracking-widest font-bold px-6 py-3 border border-white/10 rounded-full hover:border-white/20"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="wazwan-btn-primary rounded-full px-8 py-3 text-xs uppercase tracking-widest font-bold"
                  >
                    Next Step &rarr;
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Season (Single-select) */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[var(--saffron)] text-[0.6rem] font-bold uppercase tracking-[0.25em]">
                    Step 4 of 6: Season
                  </span>
                  <span className="text-white/40 text-xs font-semibold">66% Complete</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-6">
                  When are you visiting Kashmir?
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Spring", value: "Spring", desc: "April to May (Badamwari blossoms & tulips)" },
                    { label: "Summer", value: "Summer", desc: "June to August (Lush green alpine meadows)" },
                    { label: "Autumn", value: "Autumn", desc: "September to November (Golden Chinars & saffron)" },
                    { label: "Winter", value: "Winter", desc: "December to March (Snow resorts & warm Harissa)" }
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setTravelSeason(item.value)}
                      className={`p-5 rounded-xl border text-left transition-all h-36 flex flex-col justify-between ${
                        travelSeason === item.value
                          ? "bg-[var(--saffron)] border-[var(--saffron)] text-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                          : "bg-black/30 border-white/10 text-white hover:border-white/30"
                      }`}
                    >
                      <div className="text-sm font-bold">{item.label}</div>
                      <div className={`text-[0.6rem] mt-2 leading-relaxed ${travelSeason === item.value ? "text-black/85" : "text-white/50"}`}>
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between border-t border-white/5 pt-6">
                  <button
                    onClick={() => setStep(3)}
                    className="wazwan-btn-ghost text-xs uppercase tracking-widest font-bold px-6 py-3 border border-white/10 rounded-full hover:border-white/20"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={() => setStep(5)}
                    className="wazwan-btn-primary rounded-full px-8 py-3 text-xs uppercase tracking-widest font-bold"
                  >
                    Next Step &rarr;
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Budget */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[var(--saffron)] text-[0.6rem] font-bold uppercase tracking-[0.25em]">
                    Step 5 of 6: Budget Tier
                  </span>
                  <span className="text-white/40 text-xs font-semibold">80% Complete</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-6">
                  What is your budget tier?
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Budget", value: "Budget", desc: "Local dhabas, street carts, and pocket-friendly stays" },
                    { label: "Mid-Range", value: "Mid-Range", desc: "Standard family restaurants and cozy hotels" },
                    { label: "Premium", value: "Premium", desc: "Comfort-focused dining and boutique lodgings" },
                    { label: "Luxury", value: "Luxury", desc: "Fine dining wazwan, five-star heritage resorts" }
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setBudgetTier(item.value)}
                      className={`p-5 rounded-xl border text-left transition-all h-32 flex flex-col justify-between ${
                        budgetTier === item.value
                          ? "bg-[var(--saffron)] border-[var(--saffron)] text-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                          : "bg-black/30 border-white/10 text-white hover:border-white/30"
                      }`}
                    >
                      <div className="text-sm font-bold">{item.label}</div>
                      <div className={`text-[0.6rem] mt-2 leading-relaxed ${budgetTier === item.value ? "text-black/85" : "text-white/50"}`}>
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between border-t border-white/5 pt-6">
                  <button
                    onClick={() => setStep(4)}
                    className="wazwan-btn-ghost text-xs uppercase tracking-widest font-bold px-6 py-3 border border-white/10 rounded-full hover:border-white/20"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={() => setStep(6)}
                    className="wazwan-btn-primary rounded-full px-8 py-3 text-xs uppercase tracking-widest font-bold"
                  >
                    Next Step &rarr;
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 6: Culinary Interests (Multi-select) */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[var(--saffron)] text-[0.6rem] font-bold uppercase tracking-[0.25em]">
                    Step 6 of 6: Food Interests
                  </span>
                  <span className="text-white/40 text-xs font-semibold">95% Complete</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-2">
                  Select culinary interests
                </h2>
                <p className="text-white/50 text-xs mb-6">Choose one or more items to optimize dish checks</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { label: "Traditional Wazwan", value: "Traditional Wazwan", desc: "Rogan Josh, Gushtaba, and multi-course sharing platters" },
                    { label: "Street Food & Tujji", value: "Street Food", desc: "Khayam Chowk charcoal barbecue, seekh kebabs, and wraps" },
                    { label: "Kandur Bakery", value: "Kandur Bakery", desc: "Local baked breads (Girda, Bakerkhani) paired with morning tea" },
                    { label: "Kahwa Experiences", value: "Kahwa Experiences", desc: "Saffron, green tea, cinnamon and almond sweet infusions" },
                    { label: "Trout & River Fish", value: "Trout & Mountain Cuisine", desc: "Fresh mountain stream trout shallow-fried in local spices" },
                    { label: "Vegetarian Cuisine", value: "Vegetarian Kashmiri Cuisine", desc: "Dum Aelve potatoes, Ruwangan Chaman cheese, and Haak greens" }
                  ].map((item) => {
                    const isSelected = selectedInterests.includes(item.value);
                    return (
                      <button
                        key={item.value}
                        onClick={() => toggleInterest(item.value)}
                        className={`p-5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? "bg-[var(--saffron)] border-[var(--saffron)] text-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                            : "bg-black/30 border-white/10 text-white hover:border-white/30"
                        }`}
                      >
                        <div className="text-sm font-bold flex justify-between items-center w-full">
                          <span>{item.label}</span>
                          {isSelected && <span className="text-xs">✓</span>}
                        </div>
                        <div className={`text-[0.65rem] mt-2 leading-normal ${isSelected ? "text-black/80" : "text-white/50"}`}>
                          {item.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between border-t border-white/5 pt-6">
                  <button
                    onClick={() => setStep(5)}
                    className="wazwan-btn-ghost text-xs uppercase tracking-widest font-bold px-6 py-3 border border-white/10 rounded-full hover:border-white/20"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={handleGeneratePlan}
                    disabled={selectedInterests.length === 0}
                    className="wazwan-btn-primary rounded-full px-8 py-3 text-xs uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(212,175,55,0.35)] disabled:opacity-50"
                  >
                    Generate My Plan!
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 7: Completed Dynamic Itinerary Results */}
            {step === 7 && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 animate-fade-in"
              >
                {/* Header card */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-40 w-40 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1),transparent_70%)] pointer-events-none" />
                  <span className="text-[var(--saffron)] text-[0.65rem] font-bold tracking-[0.25em] uppercase block mb-3">
                    Waza AI Custom Plan Generated
                  </span>
                  <h2 className="text-3xl font-display font-medium text-white mb-2 leading-tight">
                    {result.title}
                  </h2>
                  <div className="flex flex-wrap gap-2.5 mt-4 text-[0.65rem] text-white/50 font-bold uppercase tracking-wider">
                    <span className="bg-white/5 px-2.5 py-1 rounded border border-white/5">{travelSeason} Season</span>
                    <span className="bg-white/5 px-2.5 py-1 rounded border border-white/5">{budgetTier} Tier</span>
                    <span className="bg-white/5 px-2.5 py-1 rounded border border-white/5">{travelParty}</span>
                  </div>

                  <button
                    onClick={() => setStep(1)}
                    className="mt-6 inline-flex text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/30 rounded-full px-4 py-1.5 bg-black/40 transition-colors"
                  >
                    Modify Selection
                  </button>
                </div>

                {/* TRIP SUMMARY PANEL */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-xl">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--saffron)] mb-6 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                    </svg>
                    Trip Summary & Financials
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                      <span className="text-white/40 block mb-1 uppercase tracking-wider text-[0.6rem]">Estimated Cost Range</span>
                      <strong className="text-lg text-[var(--saffron)] font-display block mt-1">{result.summary.totalEstCost}</strong>
                      <span className="text-[0.6rem] text-white/30 mt-1 block">Includes dining & transport guidance</span>
                    </div>

                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                      <span className="text-white/40 block mb-2 uppercase tracking-wider text-[0.6rem]">Best Photo Spots</span>
                      <ul className="space-y-1.5 text-white/80">
                        {result.summary.photoSpots.map((spot, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[var(--saffron)]">•</span>
                            <span>{spot}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                      <span className="text-white/40 block mb-2 uppercase tracking-wider text-[0.6rem]">Cultural Highlights</span>
                      <ul className="space-y-1.5 text-white/80">
                        {result.summary.culturalExperiences.map((exp, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[var(--saffron)]">•</span>
                            <span>{exp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Day-by-Day Timeline map */}
                <div className="space-y-5">
                  <h3 className="text-xl font-display text-white font-medium pl-1">
                    Day-by-Day Concierge Route
                  </h3>
                  <div className="relative border-l border-white/10 pl-6 sm:pl-8 space-y-8 ml-3 sm:ml-4">
                    {result.dayByDay.map((dayPlan) => (
                      <div key={dayPlan.day} className="relative">
                        {/* Day Bubble */}
                        <div className="absolute -left-[35px] sm:-left-[43px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-[var(--saffron)] text-black font-bold font-display text-[0.7rem] shadow-[0_0_12px_rgba(212,175,55,0.35)]">
                          {dayPlan.day}
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/5 hover:border-white/10 p-5 transition-all shadow-lg">
                          <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-2">
                            <div>
                              <span className="text-white/40 text-[0.55rem] font-bold uppercase tracking-wider block">
                                Day 0{dayPlan.day}
                              </span>
                              <strong className="text-white text-base font-display">{dayPlan.destination}</strong>
                            </div>
                            <span className="text-[var(--saffron)] font-mono text-xs">{dayPlan.estBudget} Budget</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-3">
                            <div className="space-y-2">
                              <div>
                                <span className="text-[var(--saffron)] font-bold block mb-0.5">Morning Attraction</span>
                                <span className="text-white/80">{dayPlan.attraction}</span>
                              </div>
                              <div>
                                <span className="text-[var(--saffron)] font-bold block mb-0.5">Recommended Dining</span>
                                <Link 
                                  href={`/restaurants/${dayPlan.restaurantSlug}`} 
                                  className="text-white hover:text-[var(--saffron)] font-medium underline underline-offset-2 transition-colors"
                                >
                                  {dayPlan.restaurant} &rarr;
                                </Link>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div>
                                <span className="text-[var(--saffron)] font-bold block mb-0.5">Must-Try Dish</span>
                                <span className="text-white/80">{dayPlan.dish}</span>
                              </div>
                              <div className="bg-[var(--saffron-pale)] rounded-lg p-2.5 border border-[var(--saffron)]/10">
                                <span className="text-[var(--saffron)] font-bold block mb-0.5 uppercase tracking-widest text-[0.55rem]">Travel Tip</span>
                                <span className="text-white/95 leading-normal text-[0.7rem]">{dayPlan.travelTip}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations Grid Panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dining Checklist */}
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--saffron)] mb-4 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      Dining Stops List
                    </h4>
                    <ul className="space-y-3">
                      {result.spots.map((spot, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start text-xs text-white/85">
                          <span className="text-[var(--saffron)] font-bold text-sm leading-none">•</span>
                          <div>
                            <span className="font-semibold text-white block">{spot}</span>
                            <span className="text-white/40 text-[0.65rem]">Audited Destination Spot</span>
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
                      Must-Try Dishes Checklist
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

                {/* BOT QUERY TRIGGER */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md text-center">
                  <span className="text-xs text-[var(--saffron)] font-bold uppercase tracking-[0.25em] block mb-2">
                    ✨ Let Waza AI Plan Everything
                  </span>
                  <h3 className="text-xl font-display text-white mb-2">Request complete custom adjustments</h3>
                  <p className="text-white/60 text-sm max-w-lg mx-auto mb-6 leading-relaxed">
                    Have Waza AI review your {duration}-day trip preferences and write custom restaurant reservations, transport packages, or daily timings.
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setShowPromptPreview(true)}
                      className="wazwan-btn-primary rounded-full px-8 py-3.5 text-xs uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:scale-105 transition-transform"
                    >
                      Ask Waza AI
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* PROMPT PREVIEW MODAL */}
      <AnimatePresence>
        {showPromptPreview && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-2xl border border-[var(--saffron)]/30 bg-[#0F0F0F] p-6 md:p-8 shadow-2xl"
            >
              <button
                onClick={() => setShowPromptPreview(false)}
                className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mb-6">
                <span className="text-[var(--saffron)] text-[0.6rem] font-bold uppercase tracking-[0.2em] block mb-1">
                  Waza AI Concierge
                </span>
                <h3 className="text-xl font-display font-medium text-white">
                  Review AI Planner Request
                </h3>
                <p className="text-white/50 text-xs mt-1">
                  The following structured query will be sent to Waza AI to generate custom insights.
                </p>
              </div>

              {/* Prompt box */}
              <div className="bg-black/50 border border-white/10 rounded-xl p-4 font-mono text-xs text-white/80 leading-relaxed whitespace-pre-wrap mb-6 select-text max-h-[220px] overflow-y-auto">
                {compilePrompt()}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSendToWazaAI}
                  className="flex-1 rounded-full bg-[var(--saffron)] py-3 text-xs font-bold uppercase tracking-widest text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-102 transition-transform active:scale-98"
                >
                  Send To Waza AI
                </button>
                <button
                  onClick={() => setShowPromptPreview(false)}
                  className="flex-1 rounded-full border border-white/20 py-3 text-xs font-bold uppercase tracking-widest text-white hover:border-white/40 transition-colors"
                >
                  Cancel & Edit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
