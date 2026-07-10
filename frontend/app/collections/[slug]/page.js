import React from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Navigation, Mountain, CheckCircle, Clock } from "lucide-react";
import { notFound } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://kashmir-food-app-api.onrender.com";

async function getCollection(slug) {
  try {
    const res = await fetch(`${API_BASE}/api/collections/${slug}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Failed to fetch collection");
    }
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function CollectionPage({ params }) {
  const collection = await getCollection(params.slug);

  if (!collection) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--profile-bg)] text-[var(--profile-text)] font-sans flex flex-col items-center">
      <div className="w-full max-w-6xl relative overflow-hidden px-6 md:px-12 pt-16 pb-[120px]">
        
        {/* Navigation */}
        <Link 
          href="/explore" 
          className="inline-flex items-center gap-2 text-[var(--profile-gold-dim)] hover:text-[var(--profile-gold)] transition-colors mb-12 text-sm uppercase tracking-widest font-semibold"
        >
          <ArrowLeft size={16} />
          Back to Explore
        </Link>

        {/* Hero Section */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-3 px-3 py-1.5 bg-[#0A0705]/80 backdrop-blur-md border border-[#D4A55A]/20 rounded-full mb-6">
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-[#E0C097]">
              {collection.items?.length || 0} Locations
            </span>
          </div>
          
          <h1 className="font-serif italic font-normal text-[40px] md:text-[56px] leading-[1.1] tracking-[0.3px] text-[var(--profile-gold)] mb-4" style={{fontFamily: "'Cormorant Garamond', serif"}}>
            {collection.name}
          </h1>
          
          <p className="text-[16px] md:text-[18px] text-[var(--profile-text-muted)] max-w-2xl leading-relaxed">
            {collection.description}
          </p>
        </div>

        {/* Places Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {collection.items && collection.items.map((itemObj, index) => {
            const place = itemObj.item;
            if (!place) return null; // Safe check
            
            // Get correct image field depending on model type
            const image = place.coverImage || place.image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop";
            
            // Determine route based on itemType
            let routePrefix = "destinations";
            if (itemObj.itemType === "Trail") routePrefix = "trails";
            if (itemObj.itemType === "Restaurant") routePrefix = "restaurants";
            if (itemObj.itemType === "Dish") routePrefix = "dishes";

            return (
              <Link
                key={index}
                href={`/${routePrefix}/${place.slug || place._id}`}
                style={{ transition: 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 300ms ease' }}
                className="group/card relative flex flex-col aspect-[4/5] rounded-[20px] overflow-hidden block z-10 will-change-transform backface-hidden transform-gpu shadow-[0_10px_40px_rgba(20,15,10,0.5)] border border-[#D4A55A]/20 hover:scale-[1.04] hover:-translate-y-2 hover:z-30 hover:shadow-[0_20px_60px_-15px_rgba(212,165,90,0.4)] cursor-pointer"
              >
                {/* Background Image */}
                <div className="absolute inset-0 w-full h-full">
                  <img 
                    src={image} 
                    alt={place.name || place.title}
                    className="w-full h-full object-cover transition-all duration-[700ms] ease-[cubic-bezier(0.25,1,0.5,1)] opacity-80 group-hover/card:brightness-[1.08] group-hover/card:saturate-[1.1] group-hover/card:contrast-[1.05] group-hover/card:opacity-100 will-change-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0705] via-[#0A0705]/60 to-transparent pointer-events-none transition-colors duration-500 group-hover/card:from-[#0A0705]/95 group-hover/card:via-[#0A0705]/60" />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end z-10">
                  
                  {/* Location Area / Pin */}
                  {(place.area || place.location) && (
                    <div className="flex items-center gap-1.5 text-[var(--profile-gold-dim)] mb-2">
                      <MapPin size={14} className="text-[var(--profile-gold)]" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider">
                        {place.area || place.location}
                      </span>
                    </div>
                  )}
                  
                  <h3 
                    className="text-[24px] md:text-[28px] font-serif font-normal text-[var(--profile-gold)] leading-tight drop-shadow-md mb-2"
                    style={{fontFamily: "'Cormorant Garamond', serif"}}
                  >
                    {place.name || place.title}
                  </h3>

                  <p className="text-white/80 text-[13px] font-light leading-relaxed line-clamp-2 drop-shadow-sm mb-3">
                    {place.shortDescription || place.description}
                  </p>

                  {itemObj.note && (
                    <div className="mt-2 pt-3 border-t border-[var(--profile-gold)]/20">
                      <p className="text-[11px] text-[var(--profile-gold-dim)] italic tracking-wide">
                        {itemObj.note}
                      </p>
                    </div>
                  )}

                  {/* Badges for Trails/Restaurants etc */}
                  <div className="flex gap-3 mt-4">
                    {place.difficulty && (
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#E0C097]/70">
                        <Mountain size={12} /> {place.difficulty}
                      </div>
                    )}
                    {place.estimatedDuration && (
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#E0C097]/70">
                        <Clock size={12} /> {place.estimatedDuration}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
