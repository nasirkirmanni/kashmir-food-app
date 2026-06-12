"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { endpoints, request } from "@/lib/api";
import { motion } from "framer-motion";
import Image from "next/image";

function getOptimizedImage(url, size = 800) {
  if (!url) return "/wazwan-hero.jpg";
  if (url.includes("/images/Destinations/")) {
    if (url.includes("/optimized/")) return url;
    return url.replace("/images/Destinations/", "/images/Destinations/optimized/").replace(/\.(jpg|jpeg|png)$/i, `-${size}.avif`);
  }
  return url;
}

export default function VisitKashmirPage() {
  const [destinations, setDestinations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    request(endpoints.destinations())
      .then((data) => {
        setDestinations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch destinations:", err);
        setError("Could not load destinations at this moment.");
        setLoading(false);
      });
  }, []);

  // Compute regions dynamically from destinations data
  const regions = useMemo(() => {
    const uniqueLocations = new Set();
    destinations.forEach((d) => {
      if (d.location) {
        // e.g. "North Kashmir, Baramulla" -> extract "North Kashmir"
        const cleanRegion = d.location.split(",")[0].trim();
        uniqueLocations.add(cleanRegion);
      }
    });
    return ["All", ...Array.from(uniqueLocations)];
  }, [destinations]);

  // Filtered destinations list
  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.location.toLowerCase().includes(searchQuery.toLowerCase());

      const regionPrefix = dest.location ? dest.location.split(",")[0].trim() : "";
      const matchesRegion = selectedRegion === "All" || regionPrefix === selectedRegion;

      return matchesSearch && matchesRegion;
    });
  }, [destinations, searchQuery, selectedRegion]);

  return (
    <div className="wazwan-shell relative min-h-screen pb-24">
      {/* Background radial gradient */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.06),transparent_60%)] pointer-events-none" />

      {/* Hero Section */}
      <section className="place-hero !grid-cols-1 md:!grid-cols-[1fr_auto] gap-8 items-center border-b border-white/5 pb-12">
        <div>
          <span className="place-eyebrow">Waza AI Travel Companion</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-medium tracking-tight mb-4 text-[#D4AF37]">
            Rare Destinations
          </h1>
          <p className="text-white/70 max-w-2xl text-base md:text-lg leading-relaxed">
            Explore Kashmir's most iconic valleys, pristine alpine lakes, and heritage sites. Fully audited for local culinary authenticity, tourist accessibility, and premium luxury accommodation.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href="/" className="wazwan-btn-ghost text-xs uppercase tracking-widest font-bold border border-white/10 px-6 py-3 rounded-full hover:border-white/30">
            &larr; Back to Home
          </Link>
          <Link href="/plan" className="wazwan-btn-primary rounded-full px-6 py-3 text-xs uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:scale-105 transition-transform">
            Visit kashmir
          </Link>
        </div>
      </section>

      {/* Rare destinations section header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h2 className="text-2xl md:text-3xl font-display font-medium text-white tracking-tight">
          Rare destinations
        </h2>
        <p className="text-white/45 text-xs md:text-sm mt-1">
          Discover handpicked, offbeat destinations audited for culture, friendliness, and luxury.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
          {/* Search box */}
          <div className="relative w-full lg:max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/40">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search valleys, lakes, destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 focus:border-[var(--saffron)] focus:ring-1 focus:ring-[var(--saffron)] rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-all"
            />
          </div>

          {/* Region Filter Buttons */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                  selectedRegion === region
                    ? "bg-[var(--saffron)] border-[var(--saffron)] text-black shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                    : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Destinations List Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {loading ? (
          <div className="py-24 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--saffron)] mx-auto mb-4"></div>
            <p className="text-white/60 tracking-wider uppercase text-xs font-semibold">Loading destinations...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center border border-white/10 rounded-2xl bg-white/5 max-w-lg mx-auto">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : filteredDestinations.length === 0 ? (
          <div className="py-20 text-center border border-white/10 rounded-2xl bg-white/5 max-w-lg mx-auto">
            <p className="text-white/50 text-sm">No destinations found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-8">
            {filteredDestinations.map((dest, idx) => (
              <motion.div
                key={dest._id || idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.3) }}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest.name + ", Kashmir")}`, "_blank");
                  }
                }}
                className="group flex flex-col rounded-xl md:rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden shadow-2xl hover:border-[var(--saffron)]/40 hover:shadow-[0_0_30px_rgba(212,175,55,0.08)] transition-all cursor-pointer md:cursor-default"
              >
                {/* Image top */}
                <div className="relative h-16 xs:h-20 sm:h-24 md:h-48 w-full overflow-hidden bg-black/40">
                  <Image
                    src={getOptimizedImage(dest.image, 800)}
                    alt={dest.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-transparent" />
                  <div className="absolute top-1 left-1 md:top-4 md:left-4 rounded bg-black/60 px-1 py-0.5 md:px-2 md:py-0.5 text-[8px] md:text-[0.6rem] font-bold uppercase tracking-widest text-[var(--saffron)] backdrop-blur-md">
                    {dest.location ? dest.location.split(",")[0] : "Destination"}
                  </div>
                </div>

                {/* Content */}
                <div className="p-2 md:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-[11px] xs:text-xs sm:text-sm md:text-2xl font-medium text-white mb-0.5 md:mb-2 group-hover:text-[var(--saffron)] transition-colors line-clamp-1 md:line-clamp-none">
                      {dest.name}
                    </h3>
                    <p className="hidden md:block text-white/60 text-sm leading-relaxed mb-4">
                      {dest.description}
                    </p>

                    {/* Meta Indicators */}
                    {dest.bestTimeToVisit && (
                      <div className="hidden md:flex items-center gap-2 mb-5 text-xs text-white/50 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 w-fit">
                        <svg className="w-3.5 h-3.5 text-[var(--saffron)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Best: {dest.bestTimeToVisit}</span>
                      </div>
                    )}

                    {/* Scores Panel */}
                    <div className="hidden md:block space-y-3 mb-6 bg-black/30 p-4 rounded-xl border border-white/5">
                      <div className="text-[0.62rem] font-bold uppercase tracking-wider text-[var(--saffron)] mb-2">
                        Waza AI Scores
                      </div>
                      
                      {/* Authenticity Score */}
                      <div>
                        <div className="flex justify-between text-[0.68rem] text-white/70 mb-1">
                          <span>Authentic Kashmiri Culture</span>
                          <span className="text-[var(--saffron)] font-bold">{dest.authenticityScore || "4.0"}/5</span>
                        </div>
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--saffron)] rounded-full" style={{ width: `${((dest.authenticityScore || 4.0) / 5) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Tourist Friendliness */}
                      <div>
                        <div className="flex justify-between text-[0.68rem] text-white/70 mb-1">
                          <span>Tourist Friendliness</span>
                          <span className="text-[var(--saffron)] font-bold">{dest.touristFriendlinessScore || "4.0"}/5</span>
                        </div>
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--saffron)] rounded-full" style={{ width: `${((dest.touristFriendlinessScore || 4.0) / 5) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Luxury */}
                      <div>
                        <div className="flex justify-between text-[0.68rem] text-white/70 mb-1">
                          <span>Luxury Accommodations</span>
                          <span className="text-[var(--saffron)] font-bold">{dest.luxuryScore || "3.0"}/5</span>
                        </div>
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--saffron)] rounded-full" style={{ width: `${((dest.luxuryScore || 3.0) / 5) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Attractions list */}
                    {dest.attractions && dest.attractions.length > 0 && (
                      <div className="hidden md:block mb-6">
                        <div className="text-[0.62rem] font-bold uppercase tracking-wider text-white/50 mb-2">
                          Key Attractions
                        </div>
                        <ul className="space-y-1.5">
                          {dest.attractions.map((att, aIdx) => (
                            <li key={aIdx} className="flex gap-2 items-start text-xs text-white/70 leading-normal">
                              <span className="text-[var(--saffron)] mt-0.5">•</span>
                              <span>{att}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="hidden md:flex pt-4 border-t border-white/5 gap-3">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        dest.name + ", Kashmir"
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-center bg-white/5 border border-white/10 hover:border-white/30 text-white/90 rounded-xl py-2.5 text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                      Locate on Map
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
