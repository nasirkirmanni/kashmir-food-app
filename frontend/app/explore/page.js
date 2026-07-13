import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import CinematicBackground from "@/components/explore/CinematicBackground";
import CarouselSection from "@/components/explore/CarouselSection";
import CollectionMarquee from "@/components/explore/CollectionMarquee";
import ExploreHero from "@/components/explore/ExploreHero";
import StickyMobileNav from "@/components/StickyMobileNav";
import { Calendar, Car, Clock, Compass, Mountain, ArrowRight } from "lucide-react";
import ExploreClient from "./ExploreClient";

const getApiBase = () => {
  if (typeof window === "undefined" && process.env.NEXT_PUBLIC_API_URL?.includes("localhost")) {
    return process.env.NEXT_PUBLIC_API_URL.replace("localhost", "127.0.0.1");
  }
  return process.env.NEXT_PUBLIC_API_URL || "https://kashmir-food-app-api.onrender.com";
};

async function getExploreData() {
  try {
    const res = await fetch(`${getApiBase()}/api/explore`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) throw new Error("Failed to fetch data, status: " + res.status);
    return { data: await res.json(), error: null };
  } catch (error) {
    console.error("Explore Fetch Error:", error.message || error);
    return { data: null, error: error.message || String(error) };
  }
}

export const metadata = {
  title: "Explore Kashmir | Hidden Gems & Trails",
  description: "Discover the best hidden gems, scenic drives, picnic spots, and food trails across Kashmir."
};

export default async function ExplorePage() {
  const { data, error } = await getExploreData();

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] text-white flex items-center justify-center flex-col p-4">
        <p>Failed to load explore data.</p>
        <pre className="text-red-500 mt-4 text-xs max-w-full overflow-auto">
          {error}
        </pre>
      </div>
    );
  }

  const {
    hiddenGems,
    picnicSpots,
    scenicDrives,
    photographySpots,
    foodTrails,
    natureEscapes,
    seasonalExperiences,
    collections,
    currentSeason,
    trekkingSpots
  } = data;

  return (
    <>
      <StickyMobileNav />
      <ExploreClient data={data} />
    </>
  );
}
