"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, MapPin, Phone, Mail, Star, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { partnersData } from "@/lib/partnersData";

export default function SelectTourPartnerPage() {
  const router = useRouter();

  const [guestLead, setGuestLead] = useState(null);

  useEffect(() => {
    // Read the guest lead data if it exists
    const leadData = sessionStorage.getItem("waza_guest_lead");
    if (leadData) {
      try {
        setGuestLead(JSON.parse(leadData));
      } catch (e) {
        console.error("Failed to parse guest lead", e);
      }
    }
  }, []);

  const handleSelectPartner = (partnerId) => {
    // In the future, this would save the selected partner to the booking in the DB
    if (guestLead) {
      alert(`Quote requested from partner! We've sent your itinerary and contact info (${guestLead.email}) to them.`);
      // Clear after successful submission
      sessionStorage.removeItem("waza_guest_lead");
    } else {
      alert("Partner selected! Your itinerary has been sent to them. They will contact you shortly.");
    }
    router.push("/");
  };

  return (
    <div className="wazwan-shell min-h-screen pt-32 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-6 border border-green-500/30">
            <CheckCircle size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-display text-white mb-4">
            {guestLead ? `Thanks, ${guestLead.name}!` : "Itinerary Confirmed!"}
          </h1>
          <p className="text-white/60 text-lg">Your custom Waza AI itinerary is ready. Select a verified local partner to fulfill your trip.</p>
        </div>

        <div className="grid gap-6">
          {partnersData.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 hover:border-[var(--saffron)]/50 transition-colors shadow-lg group relative overflow-hidden"
            >
              {/* Highlight gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--saffron)]/0 via-[var(--saffron)]/5 to-[var(--saffron)]/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              
              {/* Agency Logo / Image */}
              <div className="w-24 h-24 rounded-full bg-black/40 border border-white/10 overflow-hidden shrink-0 relative flex items-center justify-center">
                <ShieldCheck size={32} className="text-white/20 absolute" />
              </div>

              {/* Agency Details */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-display text-white">{partner.name}</h3>
                      {partner.verified && (
                        <span className="bg-blue-500/20 text-blue-400 p-1 rounded text-xs" title="Verified Partner">
                          <ShieldCheck size={16} />
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
                      <span className="flex items-center gap-1"><MapPin size={14} /> {partner.location}</span>
                      <span className="flex items-center gap-1 text-[var(--saffron)]"><Star size={14} className="fill-[var(--saffron)]" /> {partner.rating} ({partner.reviews} reviews)</span>
                    </div>
                  </div>
                  <div className="bg-black/40 px-4 py-1.5 rounded-full border border-white/5 text-sm text-white/70 whitespace-nowrap self-start">
                    {partner.priceLabel}
                  </div>
                </div>

                <p className="text-white/80 leading-relaxed mb-6">{partner.description}</p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => handleSelectPartner(partner.id)} className="bg-gradient-to-r from-[var(--saffron)] to-[#e8c35e] text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform text-sm shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                    Select Partner
                  </button>
                  <Link href={`/tour-partner/${partner.id}`} className="border border-white/20 bg-transparent text-white hover:bg-white/10 px-8 py-3 rounded-full font-bold uppercase tracking-widest transition-colors text-sm text-center">
                    View Profile
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
