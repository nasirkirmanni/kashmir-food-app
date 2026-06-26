"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { endpoints, request } from "@/lib/api";

// Removed getOptimizedImage function as Next.js Image component automatically optimizes images.

export default function DestinationDetailClient({ initialDestination, params }) {
  const [destination, setDestination] = useState(initialDestination);
  const [loading, setLoading] = useState(!initialDestination);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!destination && params?.slug) {
      request(endpoints.destination(params.slug) + "?v=" + Date.now())
        .then((data) => {
          setDestination(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch destination:", err);
          setError("Could not load destination details.");
          setLoading(false);
        });
    }
  }, [destination, params?.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--saffron)]"></div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-transparent text-center px-4">
        <h1 className="text-2xl text-white font-display font-medium mb-4">{error || "Destination Not Found"}</h1>
        <Link href="/destinations" className="text-[var(--saffron)] hover:underline uppercase tracking-widest font-bold text-xs">
          &larr; Back to Destinations
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white overflow-hidden selection:bg-[var(--saffron)] selection:text-black">
      {/* Hero Image Section */}
      <div className="relative h-[50vh] min-h-[400px] w-full">
        <Image
          src={destination.image || "/wazwan-hero.jpg"}
          alt={destination.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/40 to-transparent" />
        
        {/* Back Navigation */}
        <div className="absolute top-8 left-4 md:left-8 z-20">
          <Link href="/destinations" className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-[var(--saffron)] hover:text-black hover:border-[var(--saffron)] transition-all">
            &larr; Back
          </Link>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="rounded-full border border-[var(--saffron)] bg-black/60 px-3 py-1 text-[0.6rem] md:text-xs font-bold uppercase tracking-widest text-[var(--saffron)] backdrop-blur-md">
                {destination.location ? destination.location.split(",")[0] : "Destination"}
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-medium tracking-tight text-white mb-2">
              {destination.name}
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl">
              {destination.location}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          <div className="md:col-span-2 space-y-12">
            <section>
              <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)] mb-4">About</h2>
              <p className="text-lg leading-relaxed text-white/80">
                {destination.description}
              </p>
            </section>

            {destination.attractions && destination.attractions.length > 0 && (
              <section>
                <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)] mb-6">Key Attractions</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {destination.attractions.map((att, aIdx) => (
                    <li key={aIdx} className="flex gap-3 items-start bg-white/5 border border-white/10 p-4 rounded-2xl">
                      <span className="text-[var(--saffron)] mt-0.5">•</span>
                      <span className="text-sm text-white/90 leading-relaxed">{att}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <div className="md:col-span-1 space-y-8">
            {/* Meta Info Box */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
              
              {/* Locate on Map Button */}
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(destination.name + ' Kashmir')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#c8a46a]/10 border border-[#c8a46a] text-[#c8a46a] rounded-xl py-4 font-bold uppercase tracking-widest text-xs hover:bg-[#c8a46a] hover:text-black transition-all mb-8 shadow-[0_0_20px_rgba(200,164,106,0.15)]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Locate on Map
              </a>
              {destination.bestTimeToVisit && (
                <div className="mb-6 pb-6 border-b border-white/10">
                  <div className="text-[0.6rem] font-bold uppercase tracking-widest text-white/50 mb-2">Best Time To Visit</div>
                  <div className="flex items-center gap-2 text-sm text-white/90 font-medium">
                    <svg className="w-5 h-5 text-[var(--saffron)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {destination.bestTimeToVisit}
                  </div>
                </div>
              )}

              {(destination.authenticityScore || destination.touristFriendlinessScore || destination.luxuryScore) && (
                <div className="space-y-5">
                  <div className="text-[0.6rem] font-bold uppercase tracking-widest text-[var(--saffron)] mb-4">Waza AI Scores</div>
                  
                  {destination.authenticityScore && (
                    <div>
                      <div className="flex justify-between text-xs text-white/70 mb-1.5 font-medium">
                        <span>Authenticity</span>
                        <span className="text-[var(--saffron)] font-bold">{destination.authenticityScore}/5</span>
                      </div>
                      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--saffron)] rounded-full" style={{ width: `${((destination.authenticityScore) / 5) * 100}%` }}></div>
                      </div>
                    </div>
                  )}

                  {destination.touristFriendlinessScore && (
                    <div>
                      <div className="flex justify-between text-xs text-white/70 mb-1.5 font-medium">
                        <span>Tourist Friendly</span>
                        <span className="text-[var(--saffron)] font-bold">{destination.touristFriendlinessScore}/5</span>
                      </div>
                      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--saffron)] rounded-full" style={{ width: `${((destination.touristFriendlinessScore) / 5) * 100}%` }}></div>
                      </div>
                    </div>
                  )}

                  {destination.luxuryScore && (
                    <div>
                      <div className="flex justify-between text-xs text-white/70 mb-1.5 font-medium">
                        <span>Luxury Focus</span>
                        <span className="text-[var(--saffron)] font-bold">{destination.luxuryScore}/5</span>
                      </div>
                      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--saffron)] rounded-full" style={{ width: `${((destination.luxuryScore) / 5) * 100}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                destination.name + ", Kashmir"
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex justify-center items-center gap-2 bg-[var(--saffron)] text-black rounded-full py-4 text-xs font-bold uppercase tracking-widest transition-transform hover:scale-105 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              Locate on Map &rarr;
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
