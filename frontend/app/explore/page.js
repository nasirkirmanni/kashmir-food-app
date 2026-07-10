import { Suspense } from "react";
import CarouselSection from "@/components/explore/CarouselSection";
import ExploreHero from "@/components/explore/ExploreHero";
import StickyMobileNav from "@/components/StickyMobileNav";
import { Calendar } from "lucide-react";

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
    currentSeason
  } = data;

  return (
    <div className="min-h-screen bg-[#171311] text-white font-body pb-32 relative" id="explore-content">
      
      {/* Back button for mobile */}
      <StickyMobileNav />

      {/* Fixed immersive background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#3A2818]/50 via-[#171311]/90 to-[#171311]" />
        <div className="absolute top-[40%] left-[-20%] w-[70%] h-[500px] bg-[#4A3520]/15 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-[-10%] w-[60%] h-[600px] bg-[#2A1D12]/50 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10">
        <ExploreHero />
        
        {/* Soft mist overlay bridging hero and content */}
        <div className="absolute w-full h-96 bg-gradient-to-b from-[#171311] via-[#171311]/50 to-transparent pointer-events-none -mt-48 z-0" />
        
        <div className="relative z-10 pt-12 md:pt-20">

      <main className="mx-auto flex flex-col gap-10 md:gap-16 pt-8 md:pt-12 pb-12">
        
        {/* Featured Collections */}
        <CarouselSection 
          title="Featured Collections" 
          subtitle="Curated experiences handpicked by local experts."
          items={collections}
          cardType="collection"
          iconName="Star"
        />

        {/* Hidden Gems */}
        <CarouselSection 
          title="Hidden Gems" 
          subtitle="Untouched destinations far away from the tourist crowds."
          items={hiddenGems}
          cardType="destination"
          iconName="Mountain"
        />

        {/* Photography */}
        <CarouselSection 
          title="Photography Spots" 
          subtitle="The most majestic landscapes for your lens."
          items={photographySpots}
          cardType="destination"
          iconName="Camera"
        />

        {/* Scenic Drives */}
        <CarouselSection 
          title="Scenic Drives" 
          subtitle="Unforgettable road trips through winding valleys and passes."
          items={scenicDrives}
          cardType="trail"
          iconName="Car"
        />

        {/* Food Trails */}
        <CarouselSection 
          title="Food Trails" 
          subtitle="A journey through authentic street food and traditional wazwan."
          items={foodTrails}
          cardType="trail"
          iconName="UtensilsCrossed"
        />

        {/* Nature Escapes */}
        <CarouselSection 
          title="Nature Escapes" 
          subtitle="Lose yourself in lush pine forests and serene alpine meadows."
          items={natureEscapes}
          cardType="destination"
          iconName="Trees"
        />

        {/* Picnic Spots */}
        <CarouselSection 
          title="Sunday Picnic Spots" 
          subtitle="Perfect places for a relaxing day out with family and friends."
          items={picnicSpots}
          cardType="destination"
          iconName="Tent"
        />

        {/* Seasonal */}
        <CarouselSection 
          title={`Best in ${currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)}`}
          subtitle="Destinations that come alive during this time of year."
          items={seasonalExperiences}
          cardType="destination"
          iconName="Leaf"
        />

        {/* My Itineraries Placeholder */}
        <div className="px-6 md:px-12 py-16 md:py-24 max-w-[1600px] mx-auto w-full">
          <div className="bg-[#111111] border border-white/5 rounded-[32px] p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8A46A]/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
            
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 text-[#C8A46A]">
              <Calendar strokeWidth={1.5} size={32} />
            </div>
            
            <h2 className="text-[28px] md:text-[40px] font-display text-white mb-4">My Itineraries</h2>
            <p className="text-white/50 text-[14px] md:text-[16px] mb-10 max-w-xl mx-auto leading-relaxed">
              Save your favorite destinations, scenic trails, and curated collections to build your perfect Kashmir itinerary.
            </p>
            <button className="bg-transparent border border-white/20 text-white font-bold tracking-widest uppercase text-[11px] px-8 py-4 rounded-full hover:bg-white/5 transition-all">
              View Saved Items
            </button>
          </div>
        </div>

        {/* AI Trip Planner Placeholder */}
        <div className="px-6 md:px-12 pb-24 max-w-[1600px] mx-auto w-full">
          <div className="relative overflow-hidden rounded-[32px] border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A0B0F] via-[#120F16] to-[#0D1A1E]" />
            <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
            
            <div className="relative z-10 p-10 md:p-20 flex flex-col items-center text-center">
              <span className="inline-block border border-crimson/50 text-[#E24A6B] bg-[#7A1025]/10 backdrop-blur-sm px-5 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-8">
                Coming Soon
              </span>
              
              <h2 className="text-[32px] md:text-[56px] font-display text-white mb-6 leading-tight">Waza AI Trip Planner</h2>
              
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 max-w-2xl mx-auto mb-10 text-left">
                <p className="text-white/80 font-body text-[15px] italic">
                  "We're five friends. Our budget is ₹3000. We want to see hidden alpine lakes and eat traditional wazwan."
                </p>
              </div>
              
              <p className="text-white/60 max-w-2xl mx-auto text-[15px] md:text-[17px] leading-relaxed">
                Soon, our AI will instantly generate the perfect itinerary for your exact mood, budget, and group size. It's like having a local Kashmiri expert in your pocket.
              </p>
            </div>
          </div>
        </div>

      </main>
      </div>
    </div>
  );
}
