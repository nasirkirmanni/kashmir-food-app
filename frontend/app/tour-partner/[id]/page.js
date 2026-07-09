"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, MapPin, Star, ShieldCheck, Camera, Globe, Phone, Sparkles } from "lucide-react";
import { getPartnerById } from "@/lib/partnersData";
import { request } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

export default function TourPartnerProfilePage({ params }) {
  const router = useRouter();
  const [partner, setPartner] = useState(null);
  const [view, setView] = useState("profile"); // 'profile' | 'reconfirm' | 'success'
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmBooking = async () => {
    setIsConfirming(true);
    try {
      await request("/destinations/trip-query", {
        method: "POST",
        body: {
          userName: "Guest User",
          userEmail: "guest@example.com",
          userPhone: "N/A",
          itinerarySummary: {
            title: `Booking confirmed with partner: ${partner.name}`,
            summary: { totalEstCost: partner.priceLabel },
            spots: partner.uniqueSellingPoints
          },
          duration: "N/A",
          travelParty: "N/A",
          travelSeason: "N/A",
          budgetTier: "N/A"
        }
      });
    } catch (e) {
      console.error(e);
    }
    setIsConfirming(false);
    setView("success");
  };

  useEffect(() => {
    // In a real app this would be a server fetch
    // Unwrap the params properly using React.use() if this was a server component,
    // but in a client component we can just use params directly or via unwrapping.
    const fetchPartner = async () => {
      // simulate async resolving of params for Next.js 15+
      const resolvedParams = await params;
      const found = getPartnerById(resolvedParams.id);
      if (found) {
        setPartner(found);
      } else {
        router.push("/select-tour-partner");
      }
    };
    fetchPartner();
  }, [params, router]);

  if (!partner) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[var(--saffron)] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (view === "success") {
    return (
      <div className="wazwan-shell min-h-screen bg-green-600 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/kashmiri-floral-art.png')", backgroundSize: 'auto 100%' }}></div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-white text-green-600 rounded-full flex items-center justify-center mb-6 shadow-2xl">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-white mb-4">Booking Confirmed!</h1>
          <p className="text-green-100 text-[15px] mb-10 max-w-sm leading-relaxed">
            Your trip with <strong>{partner.name}</strong> has been successfully booked. They will reach out to you shortly to finalize details.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="bg-white text-green-700 px-8 py-3.5 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-xl text-sm"
          >
            Return to Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (view === "reconfirm") {
    return (
      <div className="wazwan-shell min-h-screen pb-16 relative flex items-center justify-center p-4">
        {/* Background Image / Hero */}
        <div className="absolute top-0 left-0 w-full h-[40vh] z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${partner.gallery?.[0] || partner.image})`, opacity: 0.4 }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0B]/40 via-[#0B0B0B]/80 to-[#0B0B0B]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md bg-black/60 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl text-center shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
        >
          <div className="w-16 h-16 mx-auto bg-[var(--saffron)]/10 text-[var(--saffron)] rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-3xl font-display text-white mb-3">Confirm Your Trip</h2>
          <p className="text-white/70 mb-8 leading-relaxed text-[15px]">
            You are about to lock in <strong>{partner.name}</strong> as your official local partner for this custom itinerary.
          </p>
          
          <div className="flex flex-col gap-4">
            <button 
              onClick={handleConfirmBooking}
              disabled={isConfirming}
              className="w-full bg-gradient-to-r from-[var(--saffron)] to-[#e8c35e] text-black py-4 rounded-2xl font-bold uppercase tracking-widest hover:scale-105 transition-transform text-[13px] shadow-[0_0_20px_rgba(212,175,55,0.2)] disabled:opacity-50"
            >
              {isConfirming ? "Confirming..." : "Confirm Booking"}
            </button>
            <button 
              onClick={() => setView("profile")}
              className="w-full border border-white/20 text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-white/5 transition-colors text-[13px]"
            >
              Go Back
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="wazwan-shell min-h-screen pb-16 relative">
      {/* Background Image / Hero */}
      <div className="absolute top-0 left-0 w-full h-[40vh] z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${partner.gallery?.[0] || partner.image})`, opacity: 0.4 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0B0B]/40 via-[#0B0B0B]/80 to-[#0B0B0B]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-20">
        {/* Navigation */}
        <Link href="/select-tour-partner" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-12">
          <ArrowLeft size={20} />
          <span className="font-bold tracking-widest uppercase text-xs">Back to Selection</span>
        </Link>

        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-12"
        >
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-black/60 border-2 border-[var(--saffron)] overflow-hidden shrink-0 shadow-[0_0_30px_rgba(212,175,55,0.2)] flex items-center justify-center relative">
            <ShieldCheck size={48} className="text-[var(--saffron)] opacity-50 absolute" />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-transparent" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl md:text-5xl font-display text-white">{partner.name}</h1>
              {partner.verified && (
                <div className="bg-green-500/20 text-green-400 p-1.5 rounded-full" title="Verified Partner">
                  <CheckCircle size={18} />
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-white/60 mb-4">
              <span className="flex items-center gap-1"><MapPin size={16} /> {partner.location}</span>
              <span className="flex items-center gap-1 text-[var(--saffron)]">
                <Star size={16} className="fill-[var(--saffron)]" /> {partner.rating} ({partner.reviews} reviews)
              </span>
            </div>
            
            <div className="inline-block bg-[var(--saffron)]/10 border border-[var(--saffron)]/30 text-[var(--saffron)] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
              {partner.priceLabel}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="md:col-span-2 space-y-8">
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md"
            >
              <h2 className="text-xl font-display text-[var(--saffron)] mb-4">About {partner.name}</h2>
              <p className="text-white/80 leading-relaxed text-[15px]">
                {partner.description}
              </p>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-[var(--saffron)]/10 to-black/40 border border-[var(--saffron)]/20 rounded-3xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden"
            >
              <Sparkles size={120} className="absolute -top-10 -right-10 text-[var(--saffron)] opacity-5" />
              <h2 className="text-xl font-display text-[var(--saffron)] mb-6 flex items-center gap-2">
                <Sparkles size={20} /> What Makes Us Unique
              </h2>
              <ul className="space-y-4 relative z-10">
                {partner.uniqueSellingPoints?.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--saffron)] shrink-0" />
                    <span className="text-white/90 leading-relaxed text-[15px]">{point}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          </div>

          {/* Sidebar / Contact Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
              <h3 className="text-[13px] uppercase tracking-widest font-bold text-white/50 mb-6 border-b border-white/10 pb-4">
                Contact & Socials
              </h3>
              
              <div className="space-y-5">
                <a 
                  href={`tel:${partner.social?.phone?.replace(/\s+/g, '')}`} 
                  className="flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[var(--saffron)] group-hover:text-[var(--saffron)] transition-colors">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-0.5">Phone</p>
                    <p className="text-sm text-white font-medium group-hover:text-[var(--saffron)] transition-colors">{partner.social?.phone}</p>
                  </div>
                </a>

                <a 
                  href={partner.social?.igLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[var(--saffron)] group-hover:text-[var(--saffron)] transition-colors">
                    <Camera size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-0.5">Instagram</p>
                    <p className="text-sm text-white font-medium group-hover:text-[var(--saffron)] transition-colors">{partner.social?.ig}</p>
                  </div>
                </a>

                <a 
                  href={partner.social?.fbLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[var(--saffron)] group-hover:text-[var(--saffron)] transition-colors">
                    <Globe size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-0.5">Facebook</p>
                    <p className="text-sm text-white font-medium group-hover:text-[var(--saffron)] transition-colors">{partner.social?.fb}</p>
                  </div>
                </a>
              </div>
            </div>
            
            <button 
              onClick={() => setView("reconfirm")} 
              className="w-full bg-gradient-to-r from-[var(--saffron)] to-[#e8c35e] text-black py-4 rounded-2xl font-bold uppercase tracking-widest hover:scale-105 transition-transform text-[13px] shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              Select This Partner
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
