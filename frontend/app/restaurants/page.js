"use client";

import Link from "next/link";
import Image from "next/image";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { useEffect, useMemo, useState, Suspense, memo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { endpoints, request } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
const SrinagarMiniMap = dynamic(() => import("@/components/SrinagarMiniMap"), { ssr: false });
import {
  Search,
  Star,
  MapPin,
  Clock,
  Bookmark,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  Info,
  DollarSign,
  ChevronDown,
  Navigation,
} from "lucide-react";

// --- HELPERS FOR PREMIUM DYNAMIC FALLBACKS ---

function getDeterministicHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Distance and Travel Time Resolver
function getDistanceMetrics(restaurant, userCoords) {
  let distance = 1.5;
  const hash = getDeterministicHash(restaurant._id || restaurant.slug || "default");
  
  if (userCoords) {
    const lat1 = userCoords.latitude;
    const lon1 = userCoords.longitude;
    const lat2 = restaurant.coordinates?.latitude || 34.0837;
    const lon2 = restaurant.coordinates?.longitude || 74.7973;
    
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distance = R * c;
  } else {
    // Generate realistic distance [0.5km - 8.5km] based on ID
    distance = 0.5 + (hash % 80) / 10;
  }
  
  // Srinagar traffic averages 25 km/h -> travel time = distance * 2.4 minutes + buffer
  const travelTime = Math.round(distance * 2.4 + 2);
  
  return {
    distance: `${distance.toFixed(1)} km`,
    travelTime: `${travelTime} mins`,
    distanceVal: distance,
  };
}

// Open/Closed Status Resolver
function getOpenStatus(openingHours) {
  if (!openingHours) {
    return { isOpen: true, text: "Open Now", hoursText: "11:30 AM - 10:00 PM" };
  }
  
  const cleanHours = openingHours.replace(/[\u2013\u2014]/g, "-").replace(/daily/i, "").trim();
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeVal = currentHour * 60 + currentMinute;
  
  const match = cleanHours.match(/(\d+):?(\d+)?\s*(AM|PM)\s*-\s*(\d+):?(\d+)?\s*(AM|PM)/i);
  if (match) {
    let [_, startH, startM, startAmpm, endH, endM, endAmpm] = match;
    startH = parseInt(startH);
    startM = startM ? parseInt(startM) : 0;
    endH = parseInt(endH);
    endM = endM ? parseInt(endM) : 0;
    
    if (startAmpm.toUpperCase() === "PM" && startH !== 12) startH += 12;
    if (startAmpm.toUpperCase() === "AM" && startH === 12) startH = 0;
    if (endAmpm.toUpperCase() === "PM" && endH !== 12) endH += 12;
    if (endAmpm.toUpperCase() === "AM" && endH === 12) endH = 0;
    
    const startTimeVal = startH * 60 + startM;
    let endTimeVal = endH * 60 + endM;
    
    if (endTimeVal < startTimeVal) {
      endTimeVal += 24 * 60;
    }
    
    const isOpen = currentTimeVal >= startTimeVal && currentTimeVal <= endTimeVal;
    return {
      isOpen,
      text: isOpen ? "Open Now" : "Closed",
      hoursText: cleanHours,
    };
  }
  
  return { isOpen: true, text: "Open Now", hoursText: cleanHours };
}

// Reviews and Must Try Food Resolver
function getEnrichedMetadata(restaurant) {
  const hash = getDeterministicHash(restaurant._id || restaurant.slug || "default");
  
  // Reviews count fallback
  const reviewsCount = restaurant.reviewsCount || restaurant.reviews?.length || (120 + (hash % 1100));
  
  // Price range mapping
  let priceRange = restaurant.priceRange || "₹₹₹";
  if (restaurant.priceLevel) {
    priceRange = restaurant.priceLevel === "Luxury" || restaurant.priceLevel === "Fine Dining" 
      ? "₹₹₹₹" 
      : restaurant.priceLevel === "Mid-range" 
      ? "₹₹₹" 
      : "₹₹";
  }
  
  // Must Try dishes mapping
  let mustTry = ["Rogan Josh", "Rista", "Tabak Maaz"];
  if (restaurant.linkedDishNames && restaurant.linkedDishNames.length > 0) {
    mustTry = restaurant.linkedDishNames.slice(0, 3);
  } else if (restaurant.tags && restaurant.tags.length > 0) {
    const dishTags = restaurant.tags.filter(t => !["Traditional", "Heritage", "Wazwan", "Luxury", "Highly Praised", "Fine Dining"].includes(t));
    if (dishTags.length > 0) {
      mustTry = [...dishTags, ...mustTry].slice(0, 3);
    }
  }
  
  return {
    reviewsCount: reviewsCount > 999 ? `${(reviewsCount / 1000).toFixed(1)}K` : reviewsCount,
    priceRange,
    mustTry,
  };
}

// --- RESTAURANT CARD COMPONENT ---

const LuxuryRestaurantCard = memo(({ 
  restaurant, 
  userCoords, 
  isHovered, 
  onMouseEnter, 
  onMouseLeave,
  isBookmarked,
  onToggleBookmark,
  onTagClick,
  onDishClick
}) => {
  const distanceMetrics = useMemo(() => getDistanceMetrics(restaurant, userCoords), [restaurant, userCoords]);
  const openStatus = useMemo(() => getOpenStatus(restaurant.openingHours), [restaurant.openingHours]);
  const enriched = useMemo(() => getEnrichedMetadata(restaurant), [restaurant]);

  // Load Mughal Darbar image from the web (TripAdvisor direct URL)
  const imageSrc = useMemo(() => {
    if (restaurant.name?.toLowerCase().includes("mughal darbar")) {
      return "https://media-cdn.tripadvisor.com/media/photo-s/16/e2/2b/9a/mughal-darbar.jpg";
    }
    return restaurant.image;
  }, [restaurant.name, restaurant.image]);

  return (
    <Link href={`/restaurants/${restaurant.slug || restaurant._id}`} passHref legacyBehavior prefetch={false}>
      <motion.a
        id={restaurant._id || restaurant.slug}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`relative flex flex-col w-full overflow-hidden rounded-2xl border transition-all duration-300 bg-[#0B0B0B] group active:scale-[0.99] ${
          isHovered 
            ? "border-[var(--saffron)]/70 shadow-[0_0_25px_rgba(212,175,55,0.15)] -translate-y-1" 
            : "border-white/10 shadow-lg hover:border-[var(--saffron)]/40"
        }`}
      >
        {/* Top: Restaurant Image */}
        <div className="relative w-full h-[200px] overflow-hidden bg-black/50">
          {imageSrc ? (
            <ImageWithSkeleton
              src={imageSrc}
              alt={restaurant.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-white/5">
              <Compass className="w-10 h-10 text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Top-left badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {restaurant.authentic && (
              <div className="flex items-center gap-1 rounded-full border border-[var(--saffron)] bg-black/75 px-2.5 py-1 text-[0.6rem] font-bold text-[var(--saffron)] backdrop-blur-md uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </div>
            )}
          </div>

          {/* Top-right bookmark */}
          <button
            onClick={onToggleBookmark}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full border flex items-center justify-center transition-colors backdrop-blur-md ${
              isBookmarked ? "bg-[var(--saffron-pale)] text-[var(--saffron)] border-[var(--saffron)]/40" : "bg-black/50 text-white/70 border-white/20 hover:text-[var(--saffron)] hover:border-[var(--saffron)]/50"
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-[var(--saffron)]" : ""}`} />
          </button>

          {/* Bottom-left: Open status pill */}
          <div className="absolute bottom-3 left-3">
            <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.6rem] font-bold backdrop-blur-md border ${
              openStatus.isOpen 
                ? "bg-green-900/60 text-green-400 border-green-500/30" 
                : "bg-red-900/60 text-red-400 border-red-500/30"
            }`}>
              <Clock className="w-3 h-3" />
              {openStatus.text}
            </div>
          </div>

          {/* Bottom-right: Distance pill */}
          <div className="absolute bottom-3 right-3">
            <div className="flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[0.6rem] font-bold text-[var(--saffron)] border border-white/10">
              <Navigation className="w-3 h-3 rotate-45" />
              {distanceMetrics.distance}
            </div>
          </div>
        </div>

        {/* Bottom: Content */}
        <div className="flex flex-col gap-3 p-4">
          {/* Name + Rating row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-base font-bold text-white group-hover:text-[var(--saffron)] transition-colors truncate">
                {restaurant.name}
              </h3>
              <p className="mt-1 text-[11px] text-white/50 flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-white/30 shrink-0" />
                {restaurant.location}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-green-700/80 text-white rounded px-2 py-0.5 text-xs font-bold shrink-0">
              <Star className="h-3 w-3 fill-current" />
              {restaurant.rating || "4.0"}
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 text-[11px] text-white/50 flex-wrap">
            <span>{enriched.reviewsCount} reviews</span>
            <span className="text-white/20">&bull;</span>
            <span className="text-white/70 font-mono">{enriched.priceRange}</span>
            <span className="text-white/20">&bull;</span>
            <span>{distanceMetrics.travelTime} away</span>
            <span className="text-white/20">&bull;</span>
            <span>{openStatus.hoursText}</span>
          </div>

          {/* Tags row */}
          <div className="flex flex-wrap gap-1.5">
            {(restaurant.tags || ["Wazwan", "Kashmiri", "Fine Dining"]).slice(0, 4).map((tag, idx) => (
              <button
                key={idx}
                onClick={(e) => onTagClick(tag, e)}
                className="rounded-full bg-white/5 hover:bg-[var(--saffron)] hover:text-black border border-white/5 px-2.5 py-0.5 text-[10px] font-medium text-white/60 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Must Try + Directions row */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
            <div className="text-[11px] text-white/50 flex items-center gap-1 min-w-0 flex-1 truncate">
              <span className="text-white/70 font-medium shrink-0">Must Try:</span>
              <span className="text-[var(--saffron)] font-semibold truncate">
                {enriched.mustTry.join(" \u2022 ")}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.googleMapsQuery || restaurant.name)}`);
              }}
              className="shrink-0 flex items-center gap-1 rounded-full border border-white/10 hover:border-[var(--saffron)]/40 hover:bg-white/5 text-white/70 px-3 py-1.5 text-[10px] font-bold transition-colors"
            >
              <Navigation className="w-3 h-3 text-[var(--saffron)] rotate-45" />
              Directions
            </button>
          </div>
        </div>
      </motion.a>
    </Link>
  );
});

LuxuryRestaurantCard.displayName = "LuxuryRestaurantCard";

// --- FEATURED PARTNER CARD COMPONENT ---

const FeaturedPartnerCard = memo(({ 
  restaurant, 
  userCoords, 
  isHovered, 
  onMouseEnter, 
  onMouseLeave,
  isBookmarked,
  onToggleBookmark,
  onTagClick,
  onDishClick
}) => {
  const distanceMetrics = useMemo(() => getDistanceMetrics(restaurant, userCoords), [restaurant, userCoords]);
  const openStatus = useMemo(() => getOpenStatus(restaurant.openingHours), [restaurant.openingHours]);
  const enriched = useMemo(() => getEnrichedMetadata(restaurant), [restaurant]);

  // Load Mughal Darbar image from the web (TripAdvisor direct URL)
  const imageSrc = useMemo(() => {
    if (restaurant.name?.toLowerCase().includes("mughal darbar")) {
      return "https://media-cdn.tripadvisor.com/media/photo-s/16/e2/2b/9a/mughal-darbar.jpg";
    }
    return restaurant.image;
  }, [restaurant.name, restaurant.image]);

  return (
    <Link href={`/restaurants/${restaurant.slug || restaurant._id}`} passHref legacyBehavior prefetch={false}>
      <motion.a
        id={`featured-${restaurant._id || restaurant.slug}`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative flex flex-col w-full overflow-hidden rounded-[28px] border bg-gradient-to-b from-[#16120b] to-[#0A0A0A] p-5 md:p-6 group active:scale-[0.99] gap-6 ${
          isHovered 
            ? "border-[var(--saffron)] shadow-[0_0_35px_rgba(212,175,55,0.25)]" 
            : "border-[var(--saffron)]/40 shadow-xl hover:border-[var(--saffron)]/80"
        }`}
      >
        {/* Top Tag Row */}
        <div className="absolute top-5 left-5 z-20 flex gap-2">
          <div className="flex items-center gap-1 rounded-full border border-[var(--saffron)] bg-black/90 px-3.5 py-1 text-[0.65rem] font-black text-[var(--saffron)] backdrop-blur-md uppercase tracking-widest shadow-lg">
            <Star className="w-3.5 h-3.5 fill-current text-[var(--saffron)]" />
            Featured Partner
          </div>
          <div className="flex items-center gap-1 rounded-full border border-green-500/40 bg-black/90 px-3 py-1 text-[0.65rem] font-black text-green-400 backdrop-blur-md uppercase tracking-wider shadow-lg">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified
          </div>
        </div>

        {/* Large Imagery Block */}
        <div className="relative w-full h-[240px] md:h-[280px] overflow-hidden rounded-2xl bg-black/50 border border-white/5">
          {imageSrc ? (
            <ImageWithSkeleton
              src={imageSrc}
              alt={restaurant.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={true}
              className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-white/5">
              <Compass className="w-16 h-16 text-white/10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          {/* Float Name & Meta on Bottom Left of Image */}
          <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl md:text-[2rem] font-black text-white drop-shadow-md">
                {restaurant.name}
              </h2>
              <p className="mt-1 text-xs text-white/70 font-semibold flex items-center gap-1 drop-shadow">
                <MapPin className="w-3.5 h-3.5 text-[var(--saffron)]" />
                {restaurant.location}
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-black/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
              <div className="flex items-center gap-1 bg-green-700 text-white rounded px-1.5 py-0.5 text-xs font-black">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span>{restaurant.rating || "4.5"}</span>
              </div>
              <span className="text-white/40">•</span>
              <span className="text-xs font-bold text-white/80">{enriched.reviewsCount} reviews</span>
              <span className="text-white/40">•</span>
              <span className="text-xs font-mono font-bold text-[var(--saffron)]">{enriched.priceRange}</span>
            </div>
          </div>
        </div>

        {/* Bottom Details Row */}
        <div className="flex flex-col md:flex-row justify-between gap-5 mt-2">
          <div className="flex-1 min-w-0">
            {/* Description */}
            <p className="text-sm text-white/80 leading-relaxed font-body">
              {restaurant.description || "Indulge in an authentic Kashmiri dining experience of unmatched caliber. Prepared by culinary masters utilizing traditional cooking vessels and heritage spices passed down through generations."}
            </p>
            
            <div className="mt-4 flex flex-wrap gap-4 items-center">
              {/* Cuisine Tags */}
              <div className="flex flex-wrap gap-1.5">
                {(restaurant.tags || ["Wazwan", "Kashmiri", "Fine Dining"]).map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => onTagClick(tag, e)}
                    className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/70 hover:bg-[var(--saffron)] hover:text-black transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <span className="hidden sm:inline text-white/20">|</span>
              {/* Must Try Dishes */}
              <div className="text-xs text-white/60 flex items-center gap-1">
                <span className="font-semibold text-white/80">Signature Dishes:</span>
                <div className="flex flex-wrap gap-1 font-bold">
                  {enriched.mustTry.map((dish, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => onDishClick(dish, e)}
                      className="text-[var(--saffron)] hover:text-white transition-colors"
                    >
                      {dish}{idx < enriched.mustTry.length - 1 ? " •" : ""}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Hours */}
          <div className="flex flex-row md:flex-col justify-end md:justify-between items-end shrink-0 gap-4 md:border-l border-white/10 md:pl-6">
            <div className="flex flex-col gap-1 items-end text-xs">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-green-500 shrink-0" />
                <span className="text-green-500 font-bold">{openStatus.text}</span>
                <span className="text-white/40">•</span>
                <span className="text-white/60 font-medium">{openStatus.hoursText}</span>
              </div>
              <div className="flex items-center gap-1 text-[var(--saffron)] font-bold mt-1">
                <Navigation className="w-3 h-3 rotate-45 shrink-0" />
                <span>{distanceMetrics.distance} ({distanceMetrics.travelTime}) away</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onToggleBookmark}
                className={`w-11 h-11 rounded-full border border-white/10 flex items-center justify-center transition-colors ${
                  isBookmarked ? "bg-[var(--saffron-pale)] text-[var(--saffron)] border-[var(--saffron)]/40" : "text-white/60 hover:text-[var(--saffron)] hover:border-[var(--saffron)]/50"
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-[var(--saffron)]" : ""}`} />
              </button>
              <button className="flex items-center justify-center gap-1.5 rounded-full bg-[var(--saffron)] hover:bg-[var(--saffron-light)] text-black px-6 py-3 text-xs font-black transition-all shadow-[0_4px_20px_rgba(212,175,55,0.25)]">
                Book Experience
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.a>
    </Link>
  );
});

FeaturedPartnerCard.displayName = "FeaturedPartnerCard";

// --- STATS COMPONENT ---

const StatsBar = ({ total, verified, open }) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-md">
      <div className="flex flex-col items-center justify-center text-center py-2 border-r border-white/15">
        <span className="text-[1.7rem] md:text-[2rem] font-display font-black text-white">{total}</span>
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-white/40 mt-1">Total Venues</span>
      </div>
      <div className="flex flex-col items-center justify-center text-center py-2 border-r border-white/15">
        <span className="text-[1.7rem] md:text-[2rem] font-display font-black text-[var(--saffron)] flex items-center gap-1">
          {verified}
        </span>
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-white/40 mt-1">Verified Partners</span>
      </div>
      <div className="flex flex-col items-center justify-center text-center py-2">
        <span className="text-[1.7rem] md:text-[2rem] font-display font-black text-green-400">{open}</span>
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-white/40 mt-1">Open Now</span>
      </div>
    </div>
  );
};

// --- CORE DISCOVERY PAGE CONTENT ---

function RestaurantsPageContent({ initialRestaurants = [] }) {
  const searchParams = useSearchParams();
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(initialRestaurants.length === 0);
  const [userCoords, setUserCoords] = useState(null);

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState([]);

  // Filter States
  const [activeLocation, setActiveLocation] = useState("Srinagar");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Sort by: Recommended");
  const [selectedCuisines, setSelectedCuisines] = useState(["All"]);
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [selectedRating, setSelectedRating] = useState("All");
  const [maxDistance, setMaxDistance] = useState(20);
  const [showOpenNowOnly, setShowOpenNowOnly] = useState(false);
  const [showReservations, setShowReservations] = useState(false);
  const [showFamilyFriendly, setShowFamilyFriendly] = useState(false);
  const [showOutdoorSeating, setShowOutdoorSeating] = useState(false);

  // Pagination limit (Load More)
  const [visibleLimit, setVisibleLimit] = useState(6);

  // Hover sync states (hovered card ID highlights map pin)
  const [hoveredRestaurantId, setHoveredRestaurantId] = useState(null);

  // Dropdown states & references
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef(null);

  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const locationMenuRef = useRef(null);

  // Desktop sidebar filters toggle state
  const [showDesktopFilters, setShowDesktopFilters] = useState(true);

  // Mobile Drawer toggles
  const [mobileShowFilters, setMobileShowFilters] = useState(false);
  const [mobileViewMode, setMobileViewMode] = useState("list"); // 'list' or 'map'

  // Fetch coordinates on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserCoords({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          () => {
            // Fallback coordinate: Srinagar Center
            setUserCoords({ latitude: 34.0837, longitude: 74.7973 });
          }
        );
      } else {
        // Fallback for no geolocation support
        setUserCoords({ latitude: 34.0837, longitude: 74.7973 });
      }
    }
  }, []);

  // Load Bookmarks on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wazwan-bookmarks");
      if (saved) {
        try {
          setBookmarks(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse bookmarks:", e);
        }
      }
    }
  }, []);

  // Toggle Bookmark Handler
  const handleToggleBookmark = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    let updated = [...bookmarks];
    if (updated.includes(id)) {
      updated = updated.filter((item) => item !== id);
    } else {
      updated.push(id);
    }
    setBookmarks(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("wazwan-bookmarks", JSON.stringify(updated));
    }
  };

  // Close menus when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
      if (locationMenuRef.current && !locationMenuRef.current.contains(event.target)) {
        setShowLocationMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync activeLocation with searchParam
  useEffect(() => {
    const locParam = searchParams.get("location");
    if (locParam) {
      const match = ["Srinagar", "Gulmarg", "Pahalgam", "Sonamarg"].find(
        (p) => p.toLowerCase() === locParam.toLowerCase()
      );
      if (match) {
        setActiveLocation(match);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    // Only show full screen loader if no initial fallback restaurants exist
    if (restaurants.length === 0) {
      setLoading(true);
    }
    request(endpoints.restaurants())
      .then((data) => {
        setRestaurants(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch restaurants:", err);
        if (restaurants.length === 0) {
          setError("Failed to load restaurants. Operating in offline demo mode.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleCuisineToggle = (cuisine) => {
    if (cuisine === "All") {
      setSelectedCuisines(["All"]);
    } else {
      let current = selectedCuisines.filter((c) => c !== "All");
      if (current.includes(cuisine)) {
        current = current.filter((c) => c !== cuisine);
        if (current.length === 0) current = ["All"];
      } else {
        current.push(cuisine);
      }
      setSelectedCuisines(current);
    }
  };

  const handleClearAllFilters = () => {
    setSelectedCuisines(["All"]);
    setSelectedPrice("All");
    setSelectedRating("All");
    setMaxDistance(20);
    setShowOpenNowOnly(false);
    setShowReservations(false);
    setShowFamilyFriendly(false);
    setShowOutdoorSeating(false);
    setSearchQuery("");
  };

  // Dynamically filter & sort list
  const processedRestaurants = useMemo(() => {
    let list = restaurants.filter((r) => {
      // 1. City Match
      const rCity = r.city || "Srinagar";
      if (rCity.toLowerCase() !== activeLocation.toLowerCase()) return false;

      // 2. Search Query Match
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesName = r.name?.toLowerCase().includes(query);
        const matchesLocation = r.location?.toLowerCase().includes(query);
        const matchesCuisines = r.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesName && !matchesLocation && !matchesCuisines) return false;
      }

      // 3. Price Filter
      const enriched = getEnrichedMetadata(r);
      if (selectedPrice !== "All") {
        if (enriched.priceRange !== selectedPrice) return false;
      }

      // 4. Cuisine Tags Filter
      if (!selectedCuisines.includes("All")) {
        const matchesAnyCuisine = selectedCuisines.some((c) => {
          return r.tags?.some((t) => t.toLowerCase().includes(c.toLowerCase()));
        });
        if (!matchesAnyCuisine) return false;
      }

      // 5. Rating Filter
      if (selectedRating !== "All") {
        const minRating = parseFloat(selectedRating.replace("+", ""));
        const rating = parseFloat(r.rating || "4.0");
        if (rating < minRating) return false;
      }

      // 6. Distance Filter
      const distanceData = getDistanceMetrics(r, userCoords);
      if (distanceData.distanceVal > maxDistance) return false;

      // 7. More Switch Filters
      if (showOpenNowOnly) {
        const openData = getOpenStatus(r.openingHours);
        if (!openData.isOpen) return false;
      }

      if (showFamilyFriendly && r.tags) {
        if (!r.tags.some((t) => t.toLowerCase().includes("family"))) return false;
      }

      return true;
    });

    // 8. Sorting
    if (sortBy === "Rating: High to Low") {
      list.sort((a, b) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"));
    } else if (sortBy === "Reviews: High to Low") {
      list.sort((a, b) => {
        const aReviews = getDeterministicHash(a._id) % 1000;
        const bReviews = getDeterministicHash(b._id) % 1000;
        return bReviews - aReviews;
      });
    } else if (sortBy === "Price: Low to High") {
      list.sort((a, b) => {
        const aVal = getEnrichedMetadata(a).priceRange.length;
        const bVal = getEnrichedMetadata(b).priceRange.length;
        return aVal - bVal;
      });
    }

    return list;
  }, [
    restaurants,
    activeLocation,
    searchQuery,
    selectedPrice,
    selectedCuisines,
    selectedRating,
    maxDistance,
    showOpenNowOnly,
    showFamilyFriendly,
    sortBy,
    userCoords,
  ]);

  // Extract Featured Partner: The highest rated verified restaurant
  const { featuredPartner, standardListings } = useMemo(() => {
    const featured = processedRestaurants.find((r) => r.authentic && r.rating >= 4.5) || processedRestaurants[0];
    
    return {
      featuredPartner: featured || null,
      standardListings: featured 
        ? processedRestaurants.filter((r) => r._id !== featured._id)
        : processedRestaurants,
    };
  }, [processedRestaurants]);

  // Stats Counters based on active filtered location list
  const stats = useMemo(() => {
    const filteredByCity = restaurants.filter((r) => (r.city || "Srinagar").toLowerCase() === activeLocation.toLowerCase());
    const total = filteredByCity.length;
    const verified = filteredByCity.filter((r) => r.authentic).length;
    const open = filteredByCity.filter((r) => getOpenStatus(r.openingHours).isOpen).length;

    return { total, verified, open };
  }, [restaurants, activeLocation]);

  return (
    <div className="relative min-h-screen bg-[#050505] text-white pt-24 pb-16">
      
      {/* Subtle global dark luxury glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.06),transparent_60%)] pointer-events-none" />
      <div className="absolute top-[20%] left-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_top_left,rgba(122,16,37,0.03),transparent_50%)] pointer-events-none" />

      <div className="page-shell max-w-7xl mx-auto px-4 md:px-8">
        
        {/* --- HERO SECTION --- */}
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 mb-8">
          {/* Top header row: Location dropdown and Guide Button */}
          <div className="flex items-center justify-between gap-4 w-full">
            {/* Header City Selector Dropdown */}
            <div className="relative inline-block" ref={locationMenuRef}>
              <button
                onClick={() => setShowLocationMenu(!showLocationMenu)}
                className="text-[var(--saffron)] text-[0.7rem] font-bold tracking-[0.25em] uppercase flex items-center gap-1 cursor-pointer hover:text-[var(--saffron-light)] transition-colors focus:outline-none"
              >
                RESTAURANTS IN {activeLocation}
                <ChevronDown className="w-3.5 h-3.5 mt-0.5" />
              </button>
              
              <AnimatePresence>
                {showLocationMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 mt-2 w-48 rounded-xl bg-[#0F0F0F] border border-white/10 shadow-2xl z-[55] overflow-hidden"
                  >
                    {["Srinagar", "Gulmarg", "Pahalgam", "Sonamarg"].map((city) => (
                      <button
                        key={city}
                        onClick={() => {
                          setActiveLocation(city);
                          setShowLocationMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${
                          activeLocation === city 
                            ? "bg-[var(--saffron)] text-black" 
                            : "text-white/80 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Srinagar Food Guide Button (Top Right, Big, White & Gold) */}
            <Link href="/restaurants/best-wazwan-srinagar" passHref legacyBehavior>
              <a className="h-11 sm:h-12 px-5 sm:px-6 rounded-full border border-[#C8A46A]/30 hover:border-[#C8A46A]/60 bg-white/90 hover:bg-white text-[#1A130A] text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-[0_4px_20px_rgba(200,164,106,0.15)] hover:scale-[1.02]">
                <Compass className="w-4 h-4 text-[#C8A46A]" />
                Srinagar Food Guide
                <ArrowRight className="w-4 h-4 ml-0.5 animate-pulse text-[#C8A46A]" />
              </a>
            </Link>
          </div>

          {/* Bottom row: Title on left, Search/Sort on right */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-xl">
              <h1 className="font-display font-medium text-[2rem] md:text-[3.5rem] text-white tracking-tight mt-1">
                Discover Authentic <br/>Wazwan Experiences
              </h1>

              {/* Feature tags */}
              <div className="flex flex-wrap gap-2.5 mt-5">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[var(--saffron)]/30 bg-black/60 text-[10px] font-bold text-[var(--saffron)]">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Authentic (Verified)</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-black/40 text-[10px] font-bold text-white/60">
                  <Compass className="w-3 h-3" />
                  <span>Local Favorites</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-black/40 text-[10px] font-bold text-white/60">
                  <Star className="w-3 h-3" />
                  <span>Top Rated</span>
                </div>
              </div>
            </div>

            {/* Luxury Search & Sort Area */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search restaurants, cuisines or locations..."
                  className="w-full h-11 pl-11 pr-4 bg-[#111111]/85 border border-white/10 rounded-full text-xs text-white placeholder-white/45 focus:outline-none focus:border-[var(--saffron)]/70 transition-all shadow-inner font-body"
                />
              </div>
              
              {/* Custom Sort Dropdown */}
              <div className="relative" ref={sortMenuRef}>
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="h-11 pl-5 pr-10 bg-[#111] border border-white/10 rounded-full text-xs font-bold text-white/80 focus:outline-none focus:border-[var(--saffron)]/50 cursor-pointer flex items-center justify-between gap-2 shadow-md hover:bg-[#161616] transition-colors min-w-[170px]"
                >
                  <span>{sortBy}</span>
                  <ChevronDown className="absolute right-4 top-4 w-3.5 h-3.5 text-white/40 pointer-events-none" />
                </button>
                
                <AnimatePresence>
                  {showSortMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0F0F0F] border border-white/10 shadow-2xl z-[55] overflow-hidden"
                    >
                      {[
                        "Sort by: Recommended",
                        "Rating: High to Low",
                        "Reviews: High to Low",
                        "Price: Low to High"
                      ].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setSortBy(opt);
                            setShowSortMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${
                            sortBy === opt 
                              ? "bg-[var(--saffron)] text-black" 
                              : "text-white/80 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* --- FILTER PILLS ROW --- */}
        <div className="flex items-center justify-between gap-4 pb-4 mb-6 w-full">
          <div className="flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full pb-2">
            {[
              { label: "All", tag: "All" },
              { label: "Wazwan", tag: "Wazwan" },
              { label: "Bakery", tag: "Bakery" },
              { label: "Fine Dining", tag: "Fine Dining" },
              { label: "Near Me", tag: "Near" },
              { label: "Top Rated", tag: "Top" },
              { label: "Open Now", tag: "Open" },
            ].map((pill, idx) => {
              const isActive = 
                pill.tag === "All" 
                  ? selectedCuisines.includes("All") && !showOpenNowOnly
                  : pill.tag === "Wazwan" 
                  ? selectedCuisines.includes("Wazwan")
                  : pill.tag === "Bakery"
                  ? selectedCuisines.includes("Bakery")
                  : pill.tag === "Fine Dining"
                  ? selectedPrice === "₹₹₹₹"
                  : pill.tag === "Near"
                  ? maxDistance <= 5
                  : pill.tag === "Top"
                  ? selectedRating === "4.5+"
                  : showOpenNowOnly;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (pill.tag === "All") {
                      handleClearAllFilters();
                    } else if (pill.tag === "Wazwan") {
                      handleCuisineToggle("Wazwan");
                    } else if (pill.tag === "Bakery") {
                      handleCuisineToggle("Bakery");
                    } else if (pill.tag === "Fine Dining") {
                      setSelectedPrice(selectedPrice === "₹₹₹₹" ? "All" : "₹₹₹₹");
                    } else if (pill.tag === "Near") {
                      setMaxDistance(maxDistance <= 5 ? 20 : 5);
                    } else if (pill.tag === "Top") {
                      setSelectedRating(selectedRating === "4.5+" ? "All" : "4.5+");
                    } else {
                      setShowOpenNowOnly(!showOpenNowOnly);
                    }
                  }}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border shrink-0 ${
                    isActive
                      ? "border-[var(--saffron)] bg-[var(--saffron)] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)] scale-[1.03]"
                      : "border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Toggle Sidebar filters on desktop, open Drawer on mobile */}
          <button 
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth >= 1024) {
                setShowDesktopFilters(!showDesktopFilters);
              } else {
                setMobileShowFilters(true);
              }
            }}
            className={`flex items-center gap-1.5 px-4 h-10 rounded-full border transition-all shrink-0 font-bold text-xs ${
              showDesktopFilters
                ? "bg-[var(--saffron-pale)] text-[var(--saffron)] border-[var(--saffron)]/40"
                : "border-white/10 bg-white/5 hover:border-[var(--saffron)]/40 hover:text-[var(--saffron)]"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>
        </div>

        {/* --- MAIN PAGE CONTENT --- */}
        <div className="flex gap-8 items-start">
          
          {/* 1. Left Sidebar Filters (Desktop only, toggle-able) */}
          {showDesktopFilters && (
            <div className="hidden lg:block w-[17rem] shrink-0 bg-[#0B0B0B]/70 border border-white/10 rounded-3xl p-6 backdrop-blur-xl sticky top-28 h-[calc(100vh-140px)] overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-3">
                <span className="text-sm font-bold uppercase tracking-wider text-white">Filters</span>
                <button 
                  onClick={handleClearAllFilters}
                  className="text-[10px] font-bold uppercase tracking-widest text-[var(--saffron)] hover:text-[var(--saffron-light)] transition-colors"
                >
                  Clear all
                </button>
              </div>

              {/* Cuisine categories */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3.5">Cuisine</h4>
                <div className="flex flex-col gap-2.5">
                  {["All Cuisines", "Wazwan", "Kashmiri", "Mughlai", "Indian"].map((cuisine) => {
                    const val = cuisine === "All Cuisines" ? "All" : cuisine;
                    const checked = selectedCuisines.includes(val);
                    return (
                      <label key={cuisine} className="flex items-center gap-2.5 text-xs text-white/80 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleCuisineToggle(val)}
                          className="w-4 h-4 rounded border-white/15 bg-black/40 text-[var(--saffron)] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="group-hover:text-white transition-colors">{cuisine}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price filters */}
              <div className="mb-6 border-t border-white/5 pt-5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3.5">Price Range</h4>
                <div className="grid grid-cols-5 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5">
                  {["All", "₹", "₹₹", "₹₹₹", "₹₹₹₹"].map((price) => (
                    <button
                      key={price}
                      onClick={() => setSelectedPrice(price)}
                      className={`h-7 rounded-lg text-[9px] font-bold transition-all ${
                        selectedPrice === price
                          ? "bg-[var(--saffron)] text-black"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {price}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating filters */}
              <div className="mb-6 border-t border-white/5 pt-5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3.5">Rating</h4>
                <div className="grid grid-cols-4 gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
                  {["All", "4.0+", "4.5+", "5.0"].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(rating)}
                      className={`h-7 rounded-lg text-[9px] font-bold transition-all ${
                        selectedRating === rating
                          ? "bg-[var(--saffron)] text-black"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance Slider */}
              <div className="mb-6 border-t border-white/5 pt-5">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                  <span>Distance</span>
                  <span className="text-[var(--saffron)]">{maxDistance === 20 ? "Any distance" : `${maxDistance} km`}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--saffron)]"
                />
                <div className="flex justify-between text-[9px] text-white/30 mt-1 font-bold">
                  <span>1km</span>
                  <span>20km+</span>
                </div>
              </div>

              {/* Switch Toggles */}
              <div className="border-t border-white/5 pt-5 flex flex-col gap-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1">More Filters</h4>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/80">Open Now</span>
                  <button
                    onClick={() => setShowOpenNowOnly(!showOpenNowOnly)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
                      showOpenNowOnly ? "bg-[var(--saffron)]" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-black transition-transform ${
                        showOpenNowOnly ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/80">Reservations</span>
                  <button
                    onClick={() => setShowReservations(!showReservations)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
                      showReservations ? "bg-[var(--saffron)]" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-black transition-transform ${
                        showReservations ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/80">Family Friendly</span>
                  <button
                    onClick={() => setShowFamilyFriendly(!showFamilyFriendly)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
                      showFamilyFriendly ? "bg-[var(--saffron)]" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-black transition-transform ${
                        showFamilyFriendly ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/80">Outdoor Seating</span>
                  <button
                    onClick={() => setShowOutdoorSeating(!showOutdoorSeating)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
                      showOutdoorSeating ? "bg-[var(--saffron)]" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-black transition-transform ${
                        showOutdoorSeating ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. Center Listings Block */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            {/* Header statistics info */}
            <StatsBar total={stats.total} verified={stats.verified} open={stats.open} />

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-white/40">
                <div className="w-10 h-10 border-b-2 border-[var(--saffron)] rounded-full animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest">Compiling luxury experiences...</span>
              </div>
            ) : processedRestaurants.length === 0 ? (
              <div className="border border-white/10 rounded-3xl bg-white/5 py-16 text-center px-6">
                <Info className="w-8 h-8 text-[var(--saffron)] mx-auto mb-3" />
                {activeLocation.toLowerCase() === "srinagar" ? (
                  <h3 className="text-lg font-bold text-white mb-2">No restaurants listed for Srinagar yet</h3>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-white mb-2">No Dining Options Match</h3>
                    <p className="text-xs text-white/60 max-w-sm mx-auto leading-relaxed">
                      Try clearing some filter metrics or searches to view all heritage dining spaces.
                    </p>
                    <button
                      onClick={handleClearAllFilters}
                      className="mt-4 rounded-full bg-white/10 hover:bg-white/15 px-5 py-2 text-xs font-bold text-white transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* 2a. Featured Partner Placement (Shown at top) */}
                {featuredPartner && (
                  <div>
                    <h3 className="text-xs font-black tracking-[0.25em] text-[var(--saffron)] uppercase mb-3.5">
                      Signature Experience
                    </h3>
                    <FeaturedPartnerCard
                      restaurant={featuredPartner}
                      userCoords={userCoords}
                      isHovered={hoveredRestaurantId === (featuredPartner._id || featuredPartner.slug)}
                      onMouseEnter={() => setHoveredRestaurantId(featuredPartner._id || featuredPartner.slug)}
                      onMouseLeave={() => setHoveredRestaurantId(null)}
                      isBookmarked={bookmarks.includes(featuredPartner._id || featuredPartner.slug)}
                      onToggleBookmark={(e) => handleToggleBookmark(featuredPartner._id || featuredPartner.slug, e)}
                      onTagClick={(cuisine, e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCuisineToggle(cuisine);
                      }}
                      onDishClick={(dish, e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSearchQuery(dish);
                      }}
                    />
                  </div>
                )}

                {/* 2b. Standard Listings */}
                {standardListings.length > 0 && (
                  <div className="flex flex-col gap-5">
                    <h3 className="text-xs font-black tracking-[0.25em] text-white/40 uppercase mb-1">
                      More Dining Rooms
                    </h3>
                    {standardListings.slice(0, visibleLimit).map((restaurant) => (
                      <LuxuryRestaurantCard
                        key={restaurant._id || restaurant.slug}
                        restaurant={restaurant}
                        userCoords={userCoords}
                        isHovered={hoveredRestaurantId === (restaurant._id || restaurant.slug)}
                        onMouseEnter={() => setHoveredRestaurantId(restaurant._id || restaurant.slug)}
                        onMouseLeave={() => setHoveredRestaurantId(null)}
                        isBookmarked={bookmarks.includes(restaurant._id || restaurant.slug)}
                        onToggleBookmark={(e) => handleToggleBookmark(restaurant._id || restaurant.slug, e)}
                        onTagClick={(cuisine, e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCuisineToggle(cuisine);
                        }}
                        onDishClick={(dish, e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSearchQuery(dish);
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* 2c. Load More Button */}
                {standardListings.length > visibleLimit && (
                  <button
                    onClick={() => setVisibleLimit((l) => l + 6)}
                    className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 hover:border-[var(--saffron)]/40 hover:bg-white/10 text-xs font-bold text-white transition-all flex items-center justify-center gap-2 mt-4 tracking-wider uppercase"
                  >
                    Load More Experiences
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>

          {/* 3. Right Column Map (Desktop only) */}
          <div className="hidden xl:block w-[380px] shrink-0 sticky top-28 h-[calc(100vh-140px)]">
            <SrinagarMiniMap
              restaurants={processedRestaurants}
              hoveredRestaurantId={hoveredRestaurantId}
              onRestaurantSelect={(r) => {
                setHoveredRestaurantId(r._id || r.slug);
                const el = document.getElementById(r._id || r.slug);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              activeLocation={activeLocation}
            />
          </div>
        </div>
      </div>

      {/* --- MOBILE DRAWERS AND NAVIGATION PILLS --- */}
      {/* Floating Map/List View Toggle for Mobile */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 block xl:hidden">
        <button
          onClick={() => setMobileViewMode(mobileViewMode === "list" ? "map" : "list")}
          className="flex items-center gap-2 rounded-full bg-black border border-white/15 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-2xl hover:scale-105 active:scale-95 transition-transform"
        >
          {mobileViewMode === "list" ? (
            <>
              <Compass className="w-4 h-4 text-[var(--saffron)] animate-spin" style={{ animationDuration: "12s" }} />
              Map View
            </>
          ) : (
            <>
              <SlidersHorizontal className="w-4 h-4 text-[var(--saffron)]" />
              List View
            </>
          )}
        </button>
      </div>

      {/* Mobile Map View Sheet Overlay */}
      {mobileViewMode === "map" && (
        <div className="fixed inset-0 top-[72px] bottom-[88px] z-30 block xl:hidden bg-black p-4">
          <SrinagarMiniMap
            restaurants={processedRestaurants}
            hoveredRestaurantId={hoveredRestaurantId}
            onRestaurantSelect={(r) => {
              setHoveredRestaurantId(r._id || r.slug);
              setMobileViewMode("list");
            }}
            activeLocation={activeLocation}
          />
        </div>
      )}

      {/* Mobile Filters Drawer Overlay */}
      <AnimatePresence>
        {mobileShowFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="w-full max-w-sm bg-[#0B0B0B] h-full flex flex-col p-6 shadow-2xl border-l border-white/10"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                <h3 className="text-base font-bold uppercase tracking-wider text-white">Filters</h3>
                <button
                  onClick={() => setMobileShowFilters(false)}
                  className="text-xs font-bold text-white/50 hover:text-white"
                >
                  Close
                </button>
              </div>

              {/* Scrollable filters wrapper */}
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-6 no-scrollbar">
                {/* Cuisine */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">Cuisine</h4>
                  <div className="flex flex-wrap gap-2">
                    {["All Cuisines", "Wazwan", "Kashmiri", "Mughlai", "Indian"].map((cuisine) => {
                      const val = cuisine === "All Cuisines" ? "All" : cuisine;
                      const isChecked = selectedCuisines.includes(val);
                      return (
                        <button
                          key={cuisine}
                          onClick={() => handleCuisineToggle(val)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            isChecked
                              ? "bg-[var(--saffron)] text-black border-[var(--saffron)]"
                              : "bg-white/5 text-white/60 border-white/5 hover:border-white/10"
                          }`}
                        >
                          {cuisine}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price range */}
                <div className="border-t border-white/5 pt-5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3.5">Price Range</h4>
                  <div className="grid grid-cols-5 gap-1.5 p-1 bg-black/40 rounded-xl border border-white/5">
                    {["All", "₹", "₹₹", "₹₹₹", "₹₹₹₹"].map((price) => (
                      <button
                        key={price}
                        onClick={() => setSelectedPrice(price)}
                        className={`h-7 rounded-lg text-[9px] font-bold transition-all ${
                          selectedPrice === price
                            ? "bg-[var(--saffron)] text-black"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        {price}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="border-t border-white/5 pt-5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3.5">Rating</h4>
                  <div className="grid grid-cols-4 gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
                    {["All", "4.0+", "4.5+", "5.0"].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setSelectedRating(rating)}
                        className={`h-7 rounded-lg text-[9px] font-bold transition-all ${
                          selectedRating === rating
                            ? "bg-[var(--saffron)] text-black"
                            : "text-white/60 hover:text-white"
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Distance range */}
                <div className="border-t border-white/5 pt-5">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                    <span>Distance</span>
                    <span className="text-[var(--saffron)]">{maxDistance} km</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--saffron)]"
                  />
                </div>

                {/* Switches */}
                <div className="border-t border-white/5 pt-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/80">Open Now</span>
                    <button
                      onClick={() => setShowOpenNowOnly(!showOpenNowOnly)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
                        showOpenNowOnly ? "bg-[var(--saffron)]" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-black transition-transform ${
                          showOpenNowOnly ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/80">Reservations</span>
                    <button
                      onClick={() => setShowReservations(!showReservations)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${
                        showReservations ? "bg-[var(--saffron)]" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-black transition-transform ${
                          showReservations ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom drawer buttons */}
              <div className="border-t border-white/5 pt-4 mt-6 flex gap-3">
                <button
                  onClick={handleClearAllFilters}
                  className="flex-1 h-11 rounded-full border border-white/10 text-xs font-bold hover:bg-white/5 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileShowFilters(false)}
                  className="flex-1 h-11 rounded-full bg-[var(--saffron)] text-black text-xs font-black shadow-[0_4px_15px_rgba(212,175,55,0.2)]"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import restaurantsData from "@/data/restaurants.json";

export default function RestaurantsPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white/50">
          <div className="w-10 h-10 border-b-2 border-[var(--saffron)] rounded-full animate-spin mb-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Loading restaurants page...</span>
        </div>
      }
    >
      <RestaurantsPageContent initialRestaurants={restaurantsData} />
    </Suspense>
  );
}
