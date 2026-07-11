"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import RouteDetailTemplate from "./routes/RouteDetailTemplate";

export default function TrailDetailClient({ initialTrail, params }) {
  const [trail, setTrail] = useState(initialTrail);
  const [loading, setLoading] = useState(!initialTrail);
  const [error, setError] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://kashmir-food-app-api.onrender.com";

  useEffect(() => {
    if (!trail && params?.slug) {
      fetch(`${API_BASE}/api/trails/${params.slug}`)
        .then((res) => {
          if (!res.ok) throw new Error("Trail not found");
          return res.json();
        })
        .then((data) => {
          setTrail(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch trail client-side:", err);
          setError("Could not load trail details.");
          setLoading(false);
        });
    }
  }, [trail, params?.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A08]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A24D]"></div>
      </div>
    );
  }

  if (error || !trail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0A08] text-center px-4">
        <h1 className="text-2xl text-white font-serif font-medium mb-4">{error || "Trail Not Found"}</h1>
        <Link href="/scenic-drives" className="text-[#C9A24D] hover:underline uppercase tracking-widest font-bold text-xs">
          &larr; Back to Route Atlas
        </Link>
      </div>
    );
  }

  const isRoute = trail.waypoints && trail.waypoints.length >= 2;

  if (isRoute) {
    return <RouteDetailTemplate trail={trail} heroImage={trail.coverImage} />;
  }

  return (
    <div className="min-h-screen flex flex-col px-6 text-center bg-[#0A0A08]">
      <div className="relative w-full h-[50vh] mt-[60px] mb-8">
        <img src={trail.coverImage || "/wazwan-hero.jpg"} alt={trail.title} className="w-full h-full object-cover rounded-xl" />
      </div>
      <h1 className="text-4xl text-white font-serif font-medium mb-4">{trail.title}</h1>
      <p className="text-[#8C8377] max-w-lg mx-auto">{trail.description}</p>
      
      <div className="mt-10">
        <Link href="/explore" className="text-[#C9A24D] hover:underline uppercase tracking-widest font-bold text-xs">
          &larr; Back to Explore
        </Link>
      </div>
    </div>
  );
}
