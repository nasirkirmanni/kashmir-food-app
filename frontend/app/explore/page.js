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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://kashmir-food-app-api.onrender.com";

async function getExploreData() {
  try {
    const res = await fetch(`${API_BASE}/api/explore`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) throw new Error("Failed to fetch data");
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const metadata = {
  title: "Explore Kashmir | Hidden Gems & Trails",
  description: "Discover the best hidden gems, scenic drives, picnic spots, and food trails across Kashmir."
};

export default async function ExplorePage() {
  const data = await getExploreData();

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] text-white flex items-center justify-center">
        <p>Failed to load explore data.</p>
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
