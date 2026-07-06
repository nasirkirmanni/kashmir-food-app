"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { endpoints, request } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Tent, Mountain, Compass, SlidersHorizontal, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";

import HeroSection from "@/components/visit-kashmir/HeroSection";
import DestinationsShowcase from "@/components/visit-kashmir/DestinationsShowcase";
import AuthenticWazwanShowcase from "@/components/visit-kashmir/AuthenticWazwanShowcase";
import ItineraryShowcase from "@/components/visit-kashmir/ItineraryShowcase";
import { TravelInfoGrid, TrustBar, BlogFAQSection, NewsletterBanner } from "@/components/visit-kashmir/InfoAndTrust";

const WazaAITripPlannerModal = dynamic(() => import("@/components/WazaAITripPlannerModal"), { ssr: false });

// Static fallback data in case API fails
const fallbackDestinations = [
  { name: "Srinagar", location: "Central Kashmir", bestTimeToVisit: "April to October", attractions: ["Dal Lake Shikara", "Mughal Gardens"], authenticityScore: 4.5, touristFriendlinessScore: 4.8, luxuryScore: 4.2 },
  { name: "Gulmarg", location: "North Kashmir, Baramulla", bestTimeToVisit: "December to March", attractions: ["Gondola Phase II", "Apharwat Peak"], authenticityScore: 4.0, touristFriendlinessScore: 4.5, luxuryScore: 4.9 },
  { name: "Pahalgam", location: "South Kashmir, Anantnag", bestTimeToVisit: "March to November", attractions: ["Aru Valley", "Betaab Valley"], authenticityScore: 4.7, touristFriendlinessScore: 4.6, luxuryScore: 4.8 },
  { name: "Sonamarg", location: "Central Kashmir, Ganderbal", bestTimeToVisit: "April to October", attractions: ["Thajiwas Glacier", "Sindh River Rapids"], authenticityScore: 4.2, touristFriendlinessScore: 4.2, luxuryScore: 3.8 },
  { name: "Gurez Valley", location: "North Kashmir, Bandipora", bestTimeToVisit: "June to September", attractions: ["Habba Khatoon Peak", "Dawar Hamlet"], authenticityScore: 5.0, touristFriendlinessScore: 3.5, luxuryScore: 2.5 }
];

export default function PlanTripPage() {
  const [isWazaModalOpen, setIsWazaModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [durationMode, setDurationMode] = useState("predefined"); // predefined vs custom
  const [duration, setDuration] = useState("5"); // parsed to integer later
  const [initialDuration, setInitialDuration] = useState("5");
  const [selectedStyles, setSelectedStyles] = useState([]); // multi-select
  const { user } = useAuth();
  const [travelParty, setTravelParty] = useState("Couple"); // single-select
  const [travelSeason, setTravelSeason] = useState("Summer"); // single-select
  const [budgetTier, setBudgetTier] = useState("Premium"); // single-select
  const [customBudgetValue, setCustomBudgetValue] = useState(7000);
  const [selectedInterests, setSelectedInterests] = useState([]); // multi-select
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [seniorsCount, setSeniorsCount] = useState(0);
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [arrivalDate, setArrivalDate] = useState(null);
  const [leavingDate, setLeavingDate] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  
  const [showAgencyPicker, setShowAgencyPicker] = useState(false);

  // Pre-populate contact fields if user is authenticated
  useEffect(() => {
    if (user) {
      setUserName(user.name || "");
      setUserEmail(user.email || "");
      // Use phone from user object if available
      setUserPhone(user.phone || "");
    }
  }, [user]);

  const [sendingQuery, setSendingQuery] = useState(false);
  const [querySent, setQuerySent] = useState(false);
  const [queryError, setQueryError] = useState(null);

  const handleSendToTeam = async () => {
    setSendingQuery(true);
    setQueryError(null);

    const queryData = {
      userName,
      userPhone,
      userEmail,
      duration,
      travelParty,
      travelSeason: travelSeason === "Custom" && arrivalDate && leavingDate
        ? `Custom Dates (Arrival: ${formatDateDMY(arrivalDate)} — Departure: ${formatDateDMY(leavingDate)})`
        : travelSeason,
      budgetTier: budgetTier === "Custom" ? `Custom (₹${customBudgetValue}/day)` : budgetTier,
      selectedInterests,
      adultsCount,
      childrenCount,
      seniorsCount,
      arrivalDate: arrivalDate ? arrivalDate.toISOString() : null,
      leavingDate: leavingDate ? leavingDate.toISOString() : null,
      itinerarySummary: {
        title: result.title,
        spots: result.spots,
        summary: result.summary
      }
    };

    try {
      await request(endpoints.tripQuery, {
        method: "POST",
        body: JSON.stringify(queryData)
      });
      setQuerySent(true);
    } catch (err) {
      console.error("Failed to send trip query:", err);
      setQueryError("Failed to send query. Please check your internet connection and try again.");
    } finally {
      setSendingQuery(false);
    }
  };

  // Database collections
  const [dbDestinations, setDbDestinations] = useState([]);
  const [dbRestaurants, setDbRestaurants] = useState([]);
  const [dbDishes, setDbDishes] = useState([]);
  const [dbTravelAgencies, setDbTravelAgencies] = useState([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState(null);
  const [viewingAgency, setViewingAgency] = useState(null);
  const [confirmedBookingAgency, setConfirmedBookingAgency] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  // Modal / Preview state
  const [result, setResult] = useState(null);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  // Fetch collections on mount
  useEffect(() => {
    Promise.all([
      request(endpoints.destinations()).catch(() => fallbackDestinations),
      request(endpoints.restaurants()).catch(() => []),
      request(endpoints.dishes()).catch(() => []),
      request("/travel-agencies").catch(() => [])
    ])
      .then(([destData, restData, dishData, agencyData]) => {
        setDbDestinations(destData.length ? destData : fallbackDestinations);
        setDbRestaurants(restData);
        setDbDishes(dishData);
        setDbTravelAgencies(agencyData || []);
        setLoadingData(false);
      })
      .catch((err) => {
        console.error("Error loading planner databases:", err);
        setDbDestinations(fallbackDestinations);
        setLoadingData(false);
      });
  }, []);

  // Scroll to top when transitioning into full-page takeover views
  useEffect(() => {
    if (showAgencyPicker || viewingAgency || confirmedBookingAgency) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showAgencyPicker, viewingAgency, confirmedBookingAgency]);

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

  const handlePrevMonth = () => {
    const today = new Date();
    const firstOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const prevMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
    if (prevMonth >= firstOfCurrentMonth) {
      setCalendarMonth(prevMonth);
    }
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
    setCalendarMonth(nextMonth);
  };

  const handleDateClick = (date) => {
    if (!arrivalDate || (arrivalDate && leavingDate)) {
      setArrivalDate(date);
      setLeavingDate(null);
    } else {
      if (date.getTime() === arrivalDate.getTime()) {
        setArrivalDate(null);
        setLeavingDate(null);
      } else if (date < arrivalDate) {
        setArrivalDate(date);
        setLeavingDate(null);
      } else {
        setLeavingDate(date);
        
        // Duration state sync: (leavingDate - arrivalDate) in days
        const diffTime = Math.abs(date - arrivalDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDuration(diffDays.toString());
      }
    }
  };

  const renderCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const cells = [];
    // Offset cells
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="w-10 h-10" />);
    }
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    for (let day = 1; day <= totalDays; day++) {
      const currentDate = new Date(year, month, day);
      const isPast = currentDate < today;
      
      const isArrival = arrivalDate && currentDate.getTime() === arrivalDate.getTime();
      const isLeaving = leavingDate && currentDate.getTime() === leavingDate.getTime();
      const isInRange = arrivalDate && leavingDate && currentDate > arrivalDate && currentDate < leavingDate;
      
      let bgClass = "text-white hover:bg-white/10";
      if (isPast) {
        bgClass = "text-white/20 cursor-not-allowed";
      } else if (isArrival || isLeaving) {
        bgClass = "bg-[var(--saffron)] text-black font-bold shadow-[0_0_10px_rgba(212,175,55,0.4)]";
      } else if (isInRange) {
        bgClass = "bg-[#C8A46A]/15 text-[var(--saffron)]";
      }
      
      cells.push(
        <button
          key={`day-${day}`}
          type="button"
          disabled={isPast}
          onClick={() => handleDateClick(currentDate)}
          className={`w-10 h-10 flex items-center justify-center rounded-full text-xs transition-all ${bgClass}`}
          style={{ minWidth: '40px', minHeight: '40px' }}
        >
          {day}
        </button>
      );
    }
    return cells;
  };

  // Reusable future-ready Itinerary Engine
  const generateItinerary = (params, db) => {
    const { days, styles, party, season, budget, interests, arrivalDate } = params;
    const { destinations, restaurants, dishes } = db;

    // Resolve season dynamically if Custom
    let resolvedSeason = season;
    if (season === "Custom" && arrivalDate) {
      const month = new Date(arrivalDate).getMonth();
      if ([11, 0, 1, 2].includes(month)) resolvedSeason = "Winter";
      else if ([3, 4].includes(month)) resolvedSeason = "Spring";
      else if ([5, 6, 7].includes(month)) resolvedSeason = "Summer";
      else if ([8, 9, 10].includes(month)) resolvedSeason = "Autumn";
    }

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
      if (resolvedSeason === "Winter") {
        if (destNameLower.includes("gulmarg")) score += 10;
        if (destNameLower.includes("srinagar")) score += 5;
      } else if (resolvedSeason === "Summer" || resolvedSeason === "Spring") {
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

        if (budget === "Luxury" || (typeof budget === "number" && budget >= 15000)) {
          if (a.priceLevel === "Luxury") rScoreA += 5;
          if (b.priceLevel === "Luxury") rScoreB += 5;
          rScoreA += (a.luxuryScore || 3.0);
          rScoreB += (b.luxuryScore || 3.0);
        } else if (budget === "Budget" || (typeof budget === "number" && budget < 3500)) {
          if (a.priceLevel === "Budget") rScoreA += 5;
          if (b.priceLevel === "Budget") rScoreB += 5;
        } else if (budget === "Premium" || (typeof budget === "number" && budget >= 7500 && budget < 15000)) {
          if (a.priceLevel === "Premium" || a.priceLevel === "Mid-range") rScoreA += 3;
          if (b.priceLevel === "Premium" || b.priceLevel === "Mid-range") rScoreB += 3;
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
      let estBudget = "₹₹";
      if (typeof budget === "number") {
        if (budget < 3500) estBudget = "₹";
        else if (budget < 7500) estBudget = "₹₹";
        else if (budget < 15000) estBudget = "₹₹₹";
        else estBudget = "₹₹₹₹";
      } else {
        const budgetMap = { Budget: "₹", "Mid-Range": "₹₹", Premium: "₹₹₹", Luxury: "₹₹₹₹" };
        estBudget = budgetMap[budget] || "₹₹";
      }

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
    const costPerDay = typeof budget === "number" ? budget : ({ Budget: 2000, "Mid-Range": 5000, Premium: 10000, Luxury: 25000 }[budget] || 7000);
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

  const getDerivedSeason = (date) => {
    if (!date) return "";
    const month = date.getMonth();
    if ([11, 0, 1, 2].includes(month)) return "Winter";
    if ([3, 4].includes(month)) return "Spring";
    if ([5, 6, 7].includes(month)) return "Summer";
    if ([8, 9, 10].includes(month)) return "Autumn";
    return "";
  };

  const getArrivalText = (date) => {
    if (!date) return "";
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    return `Arriving ${weekday} ${day} ${month}`;
  };

  const formatDateDMY = (date) => {
    if (!date) return "";
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  
  const updateDayPlan = (dayIdx, field, value) => {
    setResult(prev => {
      const newDayByDay = [...prev.dayByDay];
      newDayByDay[dayIdx] = { ...newDayByDay[dayIdx], [field]: value };
      return { ...prev, dayByDay: newDayByDay };
    });
  };

  const handleGeneratePlan = () => {
    const params = {
      days: duration,
      styles: selectedStyles.length ? selectedStyles : ["Food Lover"],
      party: travelParty,
      season: travelSeason,
      arrivalDate: arrivalDate ? arrivalDate.toISOString() : null,
      leavingDate: leavingDate ? leavingDate.toISOString() : null,
      budget: budgetTier === "Custom" ? customBudgetValue : budgetTier,
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
    setStep(9); // Jump to results page
  };

  const compilePrompt = () => {
    const seasonText = travelSeason === "Custom" && arrivalDate && leavingDate
      ? `Custom Dates (Arrival: ${formatDateDMY(arrivalDate)} — Departure: ${formatDateDMY(leavingDate)}, Auto-derived Season: ${getDerivedSeason(arrivalDate)})`
      : `${travelSeason} Season`;

    const selectedAgency = dbTravelAgencies.find(a => a._id === selectedAgencyId);
    const agencyText = selectedAgency ? `\nRequested Travel Agency: ${selectedAgency.agencyName}` : "";

    return `Plan a ${duration}-day Kashmir trip.
Registered Contact: ${userName} (${userPhone}, ${userEmail})
Traveler Type: ${selectedStyles.length ? selectedStyles.join(" + ") : "Food Lover"}
Travel Party: ${travelParty} (${adultsCount} Adults, ${childrenCount} Children, ${seniorsCount} Seniors over 65)
Season: ${seasonText}
Budget: ${budgetTier === "Custom" ? `Custom (₹${customBudgetValue.toLocaleString()}/day)` : budgetTier}
Interests: ${selectedInterests.length ? selectedInterests.join(", ") : "Traditional Wazwan"}${agencyText}

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

  if (confirmedBookingAgency) {
    return (
      <div className="bg-[#05170e] text-white min-h-screen font-body relative overflow-x-hidden pt-32 pb-16 flex flex-col items-center justify-center">
        <div className="max-w-2xl mx-auto px-6 text-center z-10 relative">
           {/* Success Icon */}
           <div className="w-28 h-28 bg-emerald-500 text-[#05170e] rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_80px_rgba(16,185,129,0.5)]">
             <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
             </svg>
           </div>
           
           <h1 className="text-4xl md:text-6xl font-display font-medium text-white mb-6">Booking Confirmed!</h1>
           
           <div className="space-y-4 mb-12">
             <p className="text-emerald-100/90 text-xl leading-relaxed">
               Your tour arrangements have been successfully locked in with <strong className="text-emerald-400 font-bold">{confirmedBookingAgency.agencyName}</strong>. 
             </p>
             <p className="text-white/60 text-base max-w-lg mx-auto">
               Their team will review your preferences and contact you as soon as possible to finalize your incredible trip!
             </p>
           </div>

           <Link 
             href="/"
             className="inline-flex items-center gap-2 bg-white text-[#05170e] font-bold text-sm tracking-widest uppercase px-10 py-4 rounded-full hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
           >
             Return to Home
           </Link>
        </div>
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_70%)] pointer-events-none" />
      </div>
    );
  }

  if (showAgencyPicker) {
    if (viewingAgency) {
      return (
        <div className="bg-[#0e0d0b] text-white min-h-screen font-body relative overflow-x-hidden pt-28">
          
          {/* Navigation Bar / Back Button */}
          <div className="max-w-7xl mx-auto px-6 md:px-16 mb-6">
            <button 
              onClick={() => setViewingAgency(null)}
              className="inline-flex items-center gap-3 text-white/50 hover:text-[var(--saffron)] text-sm font-bold uppercase tracking-widest transition-colors group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Agencies
            </button>
          </div>
          
          <div className="w-full flex flex-col min-h-screen">
            {/* Full-width Header */}
            <div className="relative h-[40vh] md:h-[55vh] bg-white/5 flex items-end overflow-hidden">
              {viewingAgency.thumbnailUrl ? (
                <img src={viewingAgency.thumbnailUrl} alt={viewingAgency.agencyName} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <Mountain className="absolute inset-0 w-full h-full object-cover opacity-10 text-white" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0d0b] via-[#0e0d0b]/40 to-transparent" />
              
              <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16 pb-12 flex justify-between items-end">
                <div>
                  <span className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-bold text-white border border-white/10 mb-6 inline-block shadow-xl">
                    ⭐ {viewingAgency.rating || "4.5"} Rating
                  </span>
                  <h2 className="text-5xl md:text-7xl font-display font-medium text-white tracking-tight drop-shadow-2xl">{viewingAgency.agencyName}</h2>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="max-w-7xl mx-auto px-6 md:px-16 py-16 w-full flex-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                <div className="md:col-span-2 space-y-12">
                  {/* Description */}
                  <section>
                    <h4 className="text-[var(--saffron)] text-sm font-bold uppercase tracking-[0.25em] mb-6">About</h4>
                    <p className="text-white/80 text-lg leading-relaxed">
                      {viewingAgency.description || "Trusted local travel partner providing exceptional Kashmiri experiences. We specialize in curating custom itineraries tailored to your unique preferences."}
                    </p>
                  </section>

                  {/* Unique Features */}
                  {(viewingAgency.features?.length > 0 || viewingAgency.qualities?.length > 0) && (
                    <section>
                      <h4 className="text-[var(--saffron)] text-sm font-bold uppercase tracking-[0.25em] mb-6">Why Choose Us</h4>
                      <div className="grid sm:grid-cols-2 gap-5">
                        {(viewingAgency.features || []).map((feature, idx) => (
                          <div key={`feat-${idx}`} className="flex gap-4 items-start p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                            <span className="text-emerald-400 mt-1 text-xl">✓</span>
                            <span className="text-white/90 font-medium leading-snug">{feature}</span>
                          </div>
                        ))}
                        {(viewingAgency.qualities || []).map((quality, idx) => (
                          <div key={`qual-${idx}`} className="flex gap-4 items-start p-6 rounded-2xl border border-[#c8a46a]/20 bg-[#c8a46a]/5 hover:bg-[#c8a46a]/10 transition-colors">
                            <span className="text-[var(--saffron)] mt-1 text-xl">✦</span>
                            <span className="text-white/90 font-medium leading-snug">{quality}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-12">
                  {/* Contact details */}
                  <section>
                    <h4 className="text-[var(--saffron)] text-sm font-bold uppercase tracking-[0.25em] mb-6">Contact Info</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-5 rounded-2xl border border-white/10 bg-white/5 shadow-lg">
                        <span className="text-white/50 text-2xl">📞</span>
                        <div>
                          <div className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Phone Number</div>
                          <div className="text-white/90 font-medium text-lg">{viewingAgency.contactNumber || "Contact details hidden"}</div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Social links */}
                  <section>
                    <h4 className="text-[var(--saffron)] text-sm font-bold uppercase tracking-[0.25em] mb-6">Social & Reviews</h4>
                    <div className="space-y-4">
                      {viewingAgency.instagramLink && (
                        <a href={viewingAgency.instagramLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 p-5 rounded-2xl border border-white/10 hover:border-pink-500/50 hover:bg-pink-500/10 transition-all group shadow-lg">
                          <span className="text-white/50 group-hover:text-pink-400 text-2xl transition-colors">📷</span>
                          <span className="text-white/80 group-hover:text-white font-medium transition-colors">Instagram Profile</span>
                        </a>
                      )}
                      {viewingAgency.facebookLink && (
                        <a href={viewingAgency.facebookLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-5 p-5 rounded-2xl border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all group shadow-lg">
                          <span className="text-white/50 group-hover:text-blue-400 text-2xl transition-colors">📘</span>
                          <span className="text-white/80 group-hover:text-white font-medium transition-colors">Facebook Page</span>
                        </a>
                      )}
                      
                      {!viewingAgency.instagramLink && !viewingAgency.facebookLink &&  (
                        <div className="text-white/40 text-sm italic p-6 bg-white/5 rounded-2xl border border-white/5">
                          No social links available.
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            </div>

            {/* Footer Actions - Sticky */}
            <div className="sticky bottom-0 w-full p-8 md:px-16 md:py-8 border-t border-white/10 bg-[#0e0d0b]/90 backdrop-blur-xl flex flex-col sm:flex-row justify-between items-center gap-6 z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
              <div className="text-white/50 text-base">
                Ready to lock in <strong className="text-white">{viewingAgency.agencyName}</strong>?
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setSelectedAgencyId(viewingAgency._id);
                    setConfirmedBookingAgency(viewingAgency);
                    setViewingAgency(null);
                    setShowAgencyPicker(false);
                  }}
                  className="wazwan-btn-primary px-16 py-5 rounded-full text-sm font-bold uppercase tracking-widest text-black shadow-[0_0_40px_rgba(212,175,55,0.4)] hover:scale-105 transition-transform w-full sm:w-auto"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="bg-dark-900 text-white min-h-screen font-body relative overflow-x-hidden pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Header */}
          <div className="mb-12">
            <span className="text-[var(--saffron)] text-sm font-bold uppercase tracking-[0.25em] mb-2 block">
              Final Step
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-medium text-white mb-4">Choose a Travel Partner</h1>
            <p className="text-white/60 text-lg max-w-2xl">
              Select one of our highly-rated, verified local agencies to arrange your trip. They will receive your itinerary and contact you directly.
            </p>
          </div>

          {/* Agency Grid */}
          <div className="mb-12">
            {dbTravelAgencies.length === 0 && (
              <div className="p-12 text-center text-white/40 border border-white/5 rounded-3xl bg-black/20">
                No verified travel agencies are available at the moment.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {dbTravelAgencies.map((agency) => {
                return (
                  <div
                    key={agency._id}
                    className="relative text-left transition-all rounded-3xl overflow-hidden border border-white/10 bg-black/40 hover:border-[var(--saffron)]/50 hover:bg-[#141210] hover:-translate-y-1 flex flex-col h-full"
                  >
                    {/* Thumbnail */}
                    <div className="h-48 bg-white/5 relative overflow-hidden flex items-center justify-center shrink-0">
                      {agency.thumbnailUrl ? (
                        <img src={agency.thumbnailUrl} alt={agency.agencyName} className="w-full h-full object-cover" />
                      ) : (
                        <Mountain className="w-12 h-12 text-white/10" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      
                      {/* Rating Badge */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-bold text-white border border-white/10">
                        ⭐ {agency.rating || "4.5"}
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <h4 className="text-xl font-display font-bold text-white leading-tight">{agency.agencyName}</h4>
                      </div>
                      
                      <p className="text-white/50 text-sm mb-6 line-clamp-3 leading-relaxed flex-1">
                        {agency.description || "Trusted local travel partner providing exceptional Kashmiri experiences."}
                      </p>

                      <button
                        onClick={() => setViewingAgency(agency)}
                        className="w-full py-3 rounded-xl border border-[var(--saffron)]/30 text-[var(--saffron)] text-xs font-bold uppercase tracking-widest hover:bg-[var(--saffron)] hover:text-black transition-colors"
                      >
                        Explore Agency
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Header Action / Back button */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => setShowAgencyPicker(false)}
              className="px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest border border-white/20 text-white hover:bg-white/5 transition-colors shadow-lg"
            >
              &larr; Back to Planner
            </button>
          </div>
        </div>



      </div>
    );
  }

  return (
    <div className="bg-dark-900 text-white min-h-screen font-body overflow-x-hidden relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,99,0.03),transparent_50%)] pointer-events-none z-0" />

      <HeroSection onPlanClick={() => {
        document.getElementById("planner-section")?.scrollIntoView({ behavior: "smooth" });
      }} />

      {/* FLOATING AI PLANNER */}
      <div className="relative z-30 w-full max-w-[900px] mx-auto px-6 md:px-12 -mt-32 md:-mt-48 mb-32" id="planner-section">
        <div className="bg-[#0e0d0b] border border-white/10 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] p-8 md:p-12 font-body">
          <div className="max-w-4xl mx-auto">
            
            {/* Custom Progress Bar Segment */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex-1 flex gap-2 mr-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <div key={s} className={`h-0.5 w-full rounded-full ${s <= step ? 'bg-[#c8a46a]' : 'bg-[#333]'}`} />
                ))}
              </div>
              <span className="text-[#888] text-sm whitespace-nowrap">Step {step} of 8</span>
            </div>

            <AnimatePresence mode="wait">
            {/* STEP 1: Duration Selector */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full"
              >
                <div className="text-[#c8a46a] text-sm font-semibold tracking-wider lowercase mb-3">
                  duration
                </div>
                <h2 className="text-4xl md:text-5xl font-playfair font-medium text-white mb-10 tracking-tight">
                  How many days is your trip?
                </h2>

                {travelSeason === "Custom" && arrivalDate && leavingDate ? (
                  <div className="mb-10 p-6 bg-[#1c1a17] border border-[#c8a46a]/20 rounded-2xl text-center">
                    <span className="text-xs text-[#c8a46a] font-bold uppercase tracking-widest block mb-2">
                      Custom Dates Active (Read-Only)
                    </span>
                    <div className="text-4xl font-display font-medium text-[#c8a46a] mb-2">
                      {duration} Days / {parseInt(duration) > 1 ? `${parseInt(duration) - 1} Nights` : '0 Nights'}
                    </div>
                    <p className="text-[#888] text-sm mt-2 leading-relaxed">
                      Arriving: <strong className="text-white">{arrivalDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                      <br />
                      Departure: <strong className="text-white">{leavingDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setTravelSeason("Summer");
                        setArrivalDate(null);
                        setLeavingDate(null);
                      }}
                      className="mt-4 text-xs text-[#888] hover:text-[#c8a46a] underline transition-colors uppercase tracking-wider font-bold"
                    >
                      Reset to Standard Seasons
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                      {[
                        { label: "3 days", value: "3", desc: "Weekend getaway", mode: "predefined", icon: Tent },
                        { label: "5 days", value: "5", desc: "Classic valley tour", mode: "predefined", icon: Mountain, popular: true },
                        { label: "7 days", value: "7", desc: "Wilderness explorer", mode: "predefined", icon: Compass },
                        { label: "Custom", value: "custom", desc: "Choose own length", mode: "custom", icon: SlidersHorizontal }
                      ].map((item) => {
                        const isSelected = (item.mode === "custom" && durationMode === "custom") ||
                                           (item.mode === "predefined" && durationMode === "predefined" && duration === item.value);
                        
                        return (
                          <button
                            key={item.label}
                            onClick={() => {
                              setDurationMode(item.mode);
                              if (item.value !== "custom") {
                                setDuration(item.value);
                              }
                            }}
                            className={`relative flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300 ${
                              isSelected
                                ? "bg-[#1c1a17] border border-[#c8a46a] shadow-[0_0_20px_rgba(200,164,106,0.1)]"
                                : "bg-[#1c1a17] border border-white/5 hover:border-white/20"
                            }`}
                            style={{ minHeight: "160px" }}
                          >
                            {item.popular && (
                              <div className="absolute -top-3 bg-[#c8a46a] text-black text-xs font-bold px-4 py-1 rounded-full z-10 shadow-lg">
                                Popular
                              </div>
                            )}
                            <item.icon className={`w-8 h-8 mb-4 ${isSelected ? "text-[#c8a46a]" : "text-[#888]"}`} strokeWidth={1.5} />
                            <div className="text-xl font-bold text-white mb-1">{item.label}</div>
                            <div className={`text-sm ${isSelected ? "text-[#c8a46a]" : "text-[#888]"}`}>
                              {item.desc}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom slider display (1 - 30 days) */}
                    {durationMode === "custom" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mb-12 p-8 bg-[#1c1a17] border border-[#c8a46a]/20 rounded-2xl text-center"
                      >
                        <div className="text-sm font-semibold tracking-wider text-[#888] mb-4">
                          Select Custom Duration
                        </div>
                        <div className="text-5xl font-playfair font-medium text-[#c8a46a] mb-6">
                          {duration} Days
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="30"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="w-full h-1.5 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#c8a46a]"
                        />
              <div className="flex justify-between text-xs text-[#888] mt-3">
                          <span>1 Day</span>
                          <span>15 Days</span>
                          <span>30 Days</span>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}

                <div className="flex justify-between items-center border-t border-white/5 pt-8 gap-4">
                  <div className="text-[#888] text-xs md:text-sm">
                    You can change this later
                  </div>
                  <button
                    onClick={() => {
                      setInitialDuration(duration);
                      setStep(2);
                    }}
                    className="bg-[#9a2b3b] hover:bg-[#b03144] text-white rounded-xl px-6 py-3 md:px-8 text-sm md:text-base font-semibold transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
                  >
                    Next step <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Travelers Counter */}
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
                    Step 2 of 8: Travelers
                  </span>
                  <span className="text-white/40 text-xs font-semibold">25% Complete</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-2">
                  Who is traveling?
                </h2>
                <p className="text-white/50 text-xs mb-8">Specify the group size and age distribution of your party.</p>

                <div className="space-y-6 mb-8">
                  {/* Adults Counter */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/20">
                    <div>
                      <div className="text-sm font-bold text-white">Adults</div>
                      <div className="text-[0.65rem] text-white/50">Age 13 or above</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-[var(--saffron)] hover:bg-[#C8A46A]/10"
                      >
                        -
                      </button>
                      <span className="text-lg font-bold text-white w-6 text-center">{adultsCount}</span>
                      <button
                        onClick={() => setAdultsCount(Math.min(20, adultsCount + 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-[var(--saffron)] hover:bg-[#C8A46A]/10"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Children Counter */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/20">
                    <div>
                      <div className="text-sm font-bold text-white">Children</div>
                      <div className="text-[0.65rem] text-white/50">Ages 2 to 12</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-[var(--saffron)] hover:bg-[#C8A46A]/10"
                      >
                        -
                      </button>
                      <span className="text-lg font-bold text-white w-6 text-center">{childrenCount}</span>
                      <button
                        onClick={() => setChildrenCount(Math.min(20, childrenCount + 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-[var(--saffron)] hover:bg-[#C8A46A]/10"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Seniors Counter (above 65) */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/20">
                    <div>
                      <div className="text-sm font-bold text-white">Seniors (65+)</div>
                      <div className="text-[0.65rem] text-white/50">Old age travelers (above 65)</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setSeniorsCount(Math.max(0, seniorsCount - 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-[var(--saffron)] hover:bg-[#C8A46A]/10"
                      >
                        -
                      </button>
                      <span className="text-lg font-bold text-white w-6 text-center">{seniorsCount}</span>
                      <button
                        onClick={() => setSeniorsCount(Math.min(20, seniorsCount + 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:border-[var(--saffron)] hover:bg-[#C8A46A]/10"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between border-t border-white/5 pt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="text-white/70 hover:text-[var(--crimson)] transition-colors text-[10px] uppercase tracking-widest font-bold px-4 py-2 border border-white/10 rounded-full hover:border-white/20"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="bg-[var(--crimson)] text-white hover:bg-[var(--crimson-light)] transition-all rounded-full px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold"
                  >
                    Next Step &rarr;
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Contact Details (New Step) */}
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
                    Step 3 of 8: Registration Details
                  </span>
                  <span className="text-white/40 text-xs font-semibold">37% Complete</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-2">
                  Registration Details
                </h2>
                <p className="text-white/50 text-xs mb-8">Please provide the details of the person registering this custom itinerary.</p>

                <div className="space-y-5 mb-8">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/60">Name of the person registering</label>
                    <input
                      type="text"
                      placeholder="e.g. Nasir Kirmani"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 focus:border-[var(--saffron)] focus:ring-1 focus:ring-[var(--saffron)] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/60">Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 focus:border-[var(--saffron)] focus:ring-1 focus:ring-[var(--saffron)] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all"
                    />
                  </div>

                  {/* Email ID */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/60">Email ID</label>
                    <input
                      type="email"
                      placeholder="e.g. nasir@example.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 focus:border-[var(--saffron)] focus:ring-1 focus:ring-[var(--saffron)] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-between border-t border-white/5 pt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="text-white/70 hover:text-[var(--crimson)] transition-colors text-[10px] uppercase tracking-widest font-bold px-4 py-2 border border-white/10 rounded-full hover:border-white/20"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    disabled={!userName || !userPhone || !userEmail}
                    className="bg-[var(--crimson)] text-white hover:bg-[var(--crimson-light)] transition-all rounded-full px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold disabled:opacity-50"
                  >
                    Next Step &rarr;
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Travel Style (Multi-select) */}
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
                    Step 4 of 8: Travel Style
                  </span>
                  <span className="text-white/40 text-xs font-semibold">50% Complete</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-2">
                  Select your travel style
                </h2>
                <p className="text-white/50 text-xs mb-6">Select all options that apply to your journey</p>

                <div className="grid grid-cols-2 gap-3 mb-8">

                  {[
                    { label: "Food Lover", value: "Food Lover", desc: "Authentic cuisine" },
                    { label: "Luxury", value: "Luxury Traveler", desc: "Premium resorts" },
                    { label: "Adventure", value: "Adventure Seeker", desc: "Active trekking" },
                    { label: "Family", value: "Family Vacation", desc: "Kid-friendly" },
                    { label: "Couple", value: "Couple / Honeymoon", desc: "Romantic getaways" },
                    { label: "Culture", value: "Cultural Explorer", desc: "Heritage sites" }
                  ].map((item) => {
                    const isSelected = selectedStyles.includes(item.value);
                    return (
                      <button
                        key={item.value}
                        onClick={() => toggleStyle(item.value)}
                        className={`relative p-4 rounded-2xl border text-left transition-all flex flex-col justify-start items-start gap-1 h-full ${
                          isSelected
                            ? "bg-[var(--saffron)] border-[var(--saffron)] text-black shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                            : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-black/10 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-black">✓</span>
                          </div>
                        )}
                        <h4 className={`text-sm font-bold pr-4 leading-tight tracking-wide ${isSelected ? "text-black" : "text-white"}`}>
                          {item.label}
                        </h4>
                        <p className={`text-[10px] leading-snug ${isSelected ? "text-black/80 font-semibold" : "text-white/60"}`}>
                          {item.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between border-t border-white/5 pt-6">
                  <button
                    onClick={() => setStep(3)}
                    className="text-white/70 hover:text-[var(--crimson)] transition-colors text-[10px] uppercase tracking-widest font-bold px-4 py-2 border border-white/10 rounded-full hover:border-white/20"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={() => setStep(5)}
                    disabled={selectedStyles.length === 0}
                    className="bg-[var(--crimson)] text-white hover:bg-[var(--crimson-light)] transition-all rounded-full px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold disabled:opacity-50"
                  >
                    Next Step &rarr;
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Travel Party (Single-select) */}
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
                    Step 5 of 8: Travel Party
                  </span>
                  <span className="text-white/40 text-xs font-semibold">62% Complete</span>
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
                      className={`p-4 rounded-xl border text-center transition-all flex flex-col justify-between items-center h-auto py-5 ${
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
                    onClick={() => setStep(4)}
                    className="text-white/70 hover:text-[var(--crimson)] transition-colors text-[10px] uppercase tracking-widest font-bold px-4 py-2 border border-white/10 rounded-full hover:border-white/20"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={() => setStep(6)}
                    className="bg-[var(--crimson)] text-white hover:bg-[var(--crimson-light)] transition-all rounded-full px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold"
                  >
                    Next Step &rarr;
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 6: Season (Single-select) */}
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
                    Step 6 of 8: Season
                  </span>
                  <span className="text-white/40 text-xs font-semibold">75% Complete</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-6">
                  When are you visiting Kashmir?
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
                  {[
                    { label: "Spring", value: "Spring", desc: "April to May" },
                    { label: "Summer", value: "Summer", desc: "June to August" },
                    { label: "Autumn", value: "Autumn", desc: "Sept to Nov" },
                    { label: "Winter", value: "Winter", desc: "Dec to March" },
                    { label: "Custom Dates", value: "Custom", desc: "Custom dates" }
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setTravelSeason(item.value)}
                      className={`p-4 rounded-xl border text-left transition-all h-auto py-5 flex flex-col justify-between ${
                        travelSeason === item.value
                          ? "bg-[var(--saffron)] border-[var(--saffron)] text-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                          : "bg-black/30 border-white/10 text-white hover:border-white/30"
                      }`}
                    >
                      <div className="text-xs font-bold">{item.label}</div>
                      <div className={`text-[0.55rem] mt-2 leading-relaxed ${travelSeason === item.value ? "text-black/85" : "text-white/50"}`}>
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>

                {travelSeason === "Custom" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-6 p-5 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md"
                  >
                    {!arrivalDate ? (
                      <div className="text-[var(--saffron)] font-bold text-center mb-4 uppercase tracking-widest text-sm">Select your arrival date</div>
                    ) : !leavingDate ? (
                      <div className="text-[var(--saffron)] font-bold text-center mb-4 uppercase tracking-widest text-sm">Now select your departure date</div>
                    ) : null}
                    {/* Calendar Month Header */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        disabled={new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1) < new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
                        className={`p-1.5 rounded-full border border-white/10 transition-colors ${
                          new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1) < new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                            ? "opacity-30 cursor-not-allowed"
                            : "text-white hover:border-[var(--saffron)] hover:text-[var(--saffron)]"
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </h3>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="p-1.5 rounded-full border border-white/10 text-white hover:border-[var(--saffron)] hover:text-[var(--saffron)] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Weekday Row */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((wd) => (
                        <div key={wd} className="text-white/40 text-[0.62rem] font-bold uppercase tracking-wider">
                          {wd}
                        </div>
                      ))}
                    </div>

                    {/* Day Grid */}
                    <div className="grid grid-cols-7 gap-1.5 justify-items-center">
                      {renderCalendarDays()}
                    </div>

                    {/* Trip Summary Strip */}
                    {arrivalDate && leavingDate && (
                      <>
                        {parseInt(duration) !== parseInt(initialDuration) && (
                          <div className="mt-4 p-3 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs text-center">
                            You selected {initialDuration} days in Step 1 but your dates cover {duration} days. Your itinerary will be {parseInt(duration) > parseInt(initialDuration) ? "extended" : "adjusted"} to {duration} days.
                          </div>
                        )}
                        <div className="mt-5 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/70">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-[#C8A46A]/15 text-[var(--saffron)] px-2.5 py-0.5 rounded font-bold uppercase text-[9px] tracking-wider border border-[var(--saffron)]/10">
                              {parseInt(duration) > 1 ? `${parseInt(duration) - 1} nights` : '0 nights'} ({duration} Days)
                            </span>
                            <span className="text-white/30">|</span>
                            <span>Derived Season: <strong className="text-white">{getDerivedSeason(arrivalDate)}</strong></span>
                          </div>
                          <div className="font-semibold text-[var(--saffron)]">
                            {getArrivalText(arrivalDate)}
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                <div className="flex justify-between border-t border-white/5 pt-6 mt-6">
                  <button
                    onClick={() => setStep(5)}
                    className="text-white/70 hover:text-[var(--crimson)] transition-colors text-[10px] uppercase tracking-widest font-bold px-4 py-2 border border-white/10 rounded-full hover:border-white/20"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={() => setStep(7)}
                    disabled={travelSeason === "Custom" && (!arrivalDate || !leavingDate)}
                    className="bg-[var(--crimson)] text-white hover:bg-[var(--crimson-light)] transition-all rounded-full px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold disabled:opacity-50"
                  >
                    Next Step &rarr;
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 7: Budget */}
            {step === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[var(--saffron)] text-[0.6rem] font-bold uppercase tracking-[0.25em]">
                    Step 7 of 8: Budget Tier
                  </span>
                  <span className="text-white/40 text-xs font-semibold">87% Complete</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-6">
                  What is your budget tier?
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
                  {[
                    { label: "Budget", value: "Budget", desc: "Pocket-friendly stays" },
                    { label: "Mid-Range", value: "Mid-Range", desc: "Cozy hotels & cafes" },
                    { label: "Premium", value: "Premium", desc: "Boutique lodgings" },
                    { label: "Luxury", value: "Luxury", desc: "Five-star heritage resorts" },
                    { label: "Custom Budget", value: "Custom", desc: "Custom limit" }
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setBudgetTier(item.value)}
                      className={`p-4 rounded-xl border text-left transition-all h-auto py-5 flex flex-col justify-between ${
                        budgetTier === item.value
                          ? "bg-[var(--saffron)] border-[var(--saffron)] text-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                          : "bg-black/30 border-white/10 text-white hover:border-white/30"
                      }`}
                    >
                      <div className="text-sm font-bold">{item.label}</div>
                      <div className={`text-[0.58rem] mt-2 leading-relaxed ${budgetTier === item.value ? "text-black/85" : "text-white/50"}`}>
                        {item.desc}
                      </div>
                    </button>
                  ))}
                </div>

                {budgetTier === "Custom" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-8 p-6 bg-black/40 border border-white/5 rounded-xl text-center"
                  >
                    <div className="text-xs uppercase tracking-widest text-white/50 mb-3">
                      Select Custom Daily Budget
                    </div>
                    <div className="text-4xl font-display font-medium text-[var(--saffron)] mb-4">
                      ₹{customBudgetValue.toLocaleString()} <span className="text-xs text-white/50">/ day</span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="50000"
                      step="500"
                      value={customBudgetValue}
                      onChange={(e) => setCustomBudgetValue(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--saffron)]"
                    />
                    <div className="flex justify-between text-[0.6rem] text-white/40 mt-2">
                      <span>₹1,000</span>
                      <span>₹25,000</span>
                      <span>₹50,000</span>
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-between border-t border-white/5 pt-6">
                  <button
                    onClick={() => setStep(6)}
                    className="text-white/70 hover:text-[var(--crimson)] transition-colors text-[10px] uppercase tracking-widest font-bold px-4 py-2 border border-white/10 rounded-full hover:border-white/20"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={() => setStep(8)}
                    className="bg-[var(--crimson)] text-white hover:bg-[var(--crimson-light)] transition-all rounded-full px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold"
                  >
                    Next Step &rarr;
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 8: Culinary Interests (Multi-select) */}
            {step === 8 && (
              <motion.div
                key="step8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[var(--saffron)] text-[0.6rem] font-bold uppercase tracking-[0.25em]">
                    Step 8 of 8: Food Interests
                  </span>
                  <span className="text-white/40 text-xs font-semibold">95% Complete</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-medium text-white mb-2">
                  Select culinary interests
                </h2>
                <p className="text-white/50 text-xs mb-6">Choose one or more items to optimize dish checks</p>

                <div className="grid grid-cols-2 gap-3 mb-8">

                  {[
                    { label: "Wazwan", value: "Traditional Wazwan", desc: "Multi-course platters" },
                    { label: "Street Food", value: "Street Food", desc: "Charcoal barbecue" },
                    { label: "Bakery", value: "Kandur Bakery", desc: "Local baked breads" },
                    { label: "Kahwa", value: "Kahwa Experiences", desc: "Saffron & green tea" },
                    { label: "Trout", value: "Trout & Mountain Cuisine", desc: "Fresh mountain trout" },
                    { label: "Vegetarian", value: "Vegetarian Kashmiri Cuisine", desc: "Dum Aloo & Haak" }
                  ].map((item) => {
                    const isSelected = selectedInterests.includes(item.value);
                    return (
                      <button
                        key={item.value}
                        onClick={() => toggleInterest(item.value)}
                        className={`relative p-4 rounded-2xl border text-left transition-all flex flex-col justify-start items-start gap-1 h-full ${
                          isSelected
                            ? "bg-[var(--saffron)] border-[var(--saffron)] text-black shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                            : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-black/10 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-black">✓</span>
                          </div>
                        )}
                        <h4 className={`text-sm font-bold pr-4 leading-tight tracking-wide ${isSelected ? "text-black" : "text-white"}`}>
                          {item.label}
                        </h4>
                        <p className={`text-[10px] leading-snug ${isSelected ? "text-black/80 font-semibold" : "text-white/60"}`}>
                          {item.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between border-t border-white/5 pt-6">
                  <button
                    onClick={() => setStep(7)}
                    className="text-white/70 hover:text-[var(--crimson)] transition-colors text-[10px] uppercase tracking-widest font-bold px-4 py-2 border border-white/10 rounded-full hover:border-white/20"
                  >
                    &larr; Back
                  </button>
                  <button
                    onClick={() => setShowAgencyPicker(true)}
                    disabled={selectedInterests.length === 0}
                    className="bg-[var(--crimson)] text-white hover:bg-[var(--crimson-light)] transition-all rounded-full px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(212,175,55,0.35)] disabled:opacity-50"
                  >
                    Select Travel Partner &rarr;
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 9: Completed Dynamic Itinerary Results */}
            {step === 9 && result && (
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
                    <span className="bg-white/5 px-2.5 py-1 rounded border border-white/5">
                      {travelSeason === "Custom" && arrivalDate ? `${getDerivedSeason(arrivalDate)} Season` : `${travelSeason} Season`}
                    </span>
                    <span className="bg-white/5 px-2.5 py-1 rounded border border-white/5">
                      {budgetTier === "Custom" ? `₹${customBudgetValue.toLocaleString()}/day` : `${budgetTier} Tier`}
                    </span>
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
                  <div className="flex items-center justify-between pl-1">
                    <h3 className="text-xl font-display text-white font-medium">
                      Day-by-Day Concierge Route
                    </h3>
                    <div className="text-[var(--saffron)] text-xs font-bold uppercase tracking-widest border border-[var(--saffron)]/20 px-3 py-1 rounded-full bg-[var(--saffron)]/5">
                      {currentDayIndex < result.dayByDay.length ? `Editing ${currentDayIndex + 1} of ${result.dayByDay.length}` : 'Final Review'}
                    </div>
                  </div>
                  <div className="relative border-l border-white/10 pl-6 sm:pl-8 space-y-8 ml-3 sm:ml-4">
                    {currentDayIndex < result.dayByDay.length ? (() => {
                      const dayPlan = result.dayByDay[currentDayIndex];
                      return (
                        <div key={dayPlan.day} className="relative animate-fade-in">
                          {/* Day Bubble */}
                          <div className="absolute -left-[35px] sm:-left-[43px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-[var(--saffron)] text-black font-bold font-display text-[0.7rem] shadow-[0_0_12px_rgba(212,175,55,0.35)] transition-all">
                            {dayPlan.day}
                          </div>
                          <div className="rounded-xl border border-[var(--saffron)]/30 bg-white/5 hover:border-[var(--saffron)]/60 p-5 transition-all shadow-[0_0_30px_rgba(212,175,55,0.05)]">
                            <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-2">
                              <div className="w-full mr-4">
                                <span className="text-[var(--saffron)] text-[0.55rem] font-bold uppercase tracking-wider block mb-1">
                                  Day 0{dayPlan.day} Destination
                                </span>
                                <input
                                  type="text"
                                  value={dayPlan.destination || ''}
                                  onChange={(e) => updateDayPlan(currentDayIndex, 'destination', e.target.value)}
                                  className="w-full bg-transparent text-white text-base font-display font-bold border-b border-dashed border-white/20 focus:border-[var(--saffron)] outline-none pb-0.5 transition-colors"
                                  placeholder="Enter destination..."
                                />
                              </div>
                              <div className="whitespace-nowrap flex flex-col items-end">
                                <span className="text-[var(--saffron)] font-mono text-[0.65rem] uppercase tracking-wider block mb-1">Budget</span>
                                <input 
                                  type="text"
                                  value={dayPlan.estBudget || ''}
                                  onChange={(e) => updateDayPlan(currentDayIndex, 'estBudget', e.target.value)}
                                  className="w-16 text-right bg-transparent text-white font-mono text-xs border-b border-dashed border-white/20 focus:border-[var(--saffron)] outline-none pb-0.5"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mt-4">
                              <div className="space-y-4">
                                <div>
                                  <span className="text-[var(--saffron)] font-bold block mb-1.5 uppercase tracking-widest text-[0.6rem]">Morning Attraction</span>
                                  <textarea
                                    value={dayPlan.attraction || ''}
                                    onChange={(e) => updateDayPlan(currentDayIndex, 'attraction', e.target.value)}
                                    rows={2}
                                    className="w-full bg-transparent text-white/90 border-b border-dashed border-white/20 focus:border-[var(--saffron)] outline-none resize-none transition-colors"
                                    placeholder="Add morning activity..."
                                  />
                                </div>
                                <div>
                                  <span className="text-[var(--saffron)] font-bold block mb-1.5 uppercase tracking-widest text-[0.6rem]">Recommended Dining</span>
                                  <input
                                    type="text"
                                    value={dayPlan.restaurant || ''}
                                    onChange={(e) => updateDayPlan(currentDayIndex, 'restaurant', e.target.value)}
                                    className="w-full bg-transparent text-white font-medium border-b border-dashed border-white/20 focus:border-[var(--saffron)] outline-none pb-0.5 transition-colors"
                                    placeholder="Select restaurant..."
                                  />
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <span className="text-[var(--saffron)] font-bold block mb-1.5 uppercase tracking-widest text-[0.6rem]">Must-Try Dish</span>
                                  <input
                                    type="text"
                                    value={dayPlan.dish || ''}
                                    onChange={(e) => updateDayPlan(currentDayIndex, 'dish', e.target.value)}
                                    className="w-full bg-transparent text-white/90 border-b border-dashed border-white/20 focus:border-[var(--saffron)] outline-none pb-0.5 transition-colors"
                                    placeholder="Enter must-try dish..."
                                  />
                                </div>
                                <div className="bg-[var(--saffron-pale)] rounded-lg p-3 border border-[var(--saffron)]/20 relative group">
                                  <span className="text-[var(--saffron)] font-bold block mb-1.5 uppercase tracking-widest text-[0.55rem]">Travel Tip</span>
                                  <textarea
                                    value={dayPlan.travelTip || ''}
                                    onChange={(e) => updateDayPlan(currentDayIndex, 'travelTip', e.target.value)}
                                    rows={2}
                                    className="w-full bg-transparent text-white/95 leading-relaxed text-[0.7rem] border-b border-dashed border-[var(--saffron)]/30 focus:border-[var(--saffron)] outline-none resize-none transition-colors"
                                    placeholder="Enter travel tip..."
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })() : (
                      /* Final Confirmation Screen integrated into timeline styling */
                      <div className="relative animate-fade-in">
                        <div className="absolute -left-[35px] sm:-left-[43px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-[#0e0d0b] font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                          ✓
                        </div>
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 md:p-8 text-center shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                          <h2 className="text-3xl font-display font-medium text-white mb-3">
                            Itinerary Complete
                          </h2>
                          <p className="text-white/60 mb-8 max-w-sm mx-auto text-xs leading-relaxed">
                            Your custom itinerary is ready to be sent to our travel partner. They will arrange premium bookings, transport, and contact you directly.
                          </p>

                          <div className="max-w-md mx-auto w-full">
                            {querySent ? (
                              <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm rounded-xl backdrop-blur-sm">
                                <strong className="text-emerald-400 block mb-1">Booking Request Sent!</strong>
                                <p className="text-[10px] text-white/60 uppercase tracking-wider mt-2">The agency will contact {userEmail}</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {queryError && <p className="text-[10px] uppercase tracking-widest text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{queryError}</p>}
                                <button
                                  onClick={handleSendToTeam}
                                  disabled={sendingQuery}
                                  className="wazwan-btn-primary w-full py-4 rounded-full text-xs font-bold uppercase tracking-widest text-black shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-105 transition-transform disabled:opacity-50"
                                >
                                  {sendingQuery ? "Sending Request..." : "Send Booking Request"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Wizard Navigation */}
                  <div className="pt-6 flex justify-between items-center pl-1 mt-4">
                    <button
                      onClick={() => setCurrentDayIndex(prev => prev - 1)}
                      disabled={currentDayIndex === 0}
                      className="px-5 py-2.5 rounded-full text-[0.65rem] font-bold uppercase tracking-widest text-white/50 border border-white/10 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      &larr; Previous Day
                    </button>
                    {currentDayIndex < result.dayByDay.length && (
                      <button
                        onClick={() => setCurrentDayIndex(prev => prev + 1)}
                        className="px-6 py-2.5 rounded-full text-[0.65rem] font-bold uppercase tracking-widest text-black bg-white hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform"
                      >
                        {currentDayIndex === result.dayByDay.length - 1 ? 'Review Final Step &rarr;' : 'Next Day &rarr;'}
                      </button>
                    )}
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

                          </motion.div>
          )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <DestinationsShowcase />
      <AuthenticWazwanShowcase />


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
      <WazaAITripPlannerModal 
        isOpen={isWazaModalOpen}
        onClose={() => setIsWazaModalOpen(false)}
      />
    </div>
  );
}
