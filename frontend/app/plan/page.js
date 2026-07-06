"use client";

import { useRouter } from "next/navigation";
import HeroSection from "@/components/visit-kashmir/HeroSection";
import DestinationsShowcase from "@/components/visit-kashmir/DestinationsShowcase";
import AuthenticWazwanShowcase from "@/components/visit-kashmir/AuthenticWazwanShowcase";
import ItineraryShowcase from "@/components/visit-kashmir/ItineraryShowcase";
import { TravelInfoGrid, TrustBar, BlogFAQSection, NewsletterBanner } from "@/components/visit-kashmir/InfoAndTrust";

export default function PlanTripPage() {
  const router = useRouter();

  const handlePlanClick = () => {
    router.push("/custom-trip");
  };

  return (
    <div className="bg-dark-900 text-white min-h-screen font-body overflow-x-hidden relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,99,0.03),transparent_50%)] pointer-events-none z-0" />

      <HeroSection 
        onPlanClick={handlePlanClick} 
        onWazaPlanClick={handlePlanClick} 
      />

      <DestinationsShowcase />
      <AuthenticWazwanShowcase />
      <ItineraryShowcase />
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-24 space-y-32 relative z-10">
        <TravelInfoGrid />
        <TrustBar />
        <BlogFAQSection />
        <NewsletterBanner />
      </div>
    </div>
  );
}
