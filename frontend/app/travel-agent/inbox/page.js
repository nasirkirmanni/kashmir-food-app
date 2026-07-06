"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { request } from "@/lib/api";
import Link from "next/link";

export default function AgencyInbox() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || (user.role !== "agent" && !user.isAdmin)) {
      router.push("/");
      return;
    }

    fetchInquiries();
  }, [user, authLoading, router]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const data = await request("/travel-agencies/dashboard");
      setInquiries(data.inquiries || []);
    } catch (err) {
      setError(err.message || "Failed to load inbox");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="bg-[#0e0d0b] text-white min-h-screen flex items-center justify-center pt-20 pb-16">
        <div className="text-white/60">Loading Inbox...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#0e0d0b] text-white min-h-screen pt-28 pb-16 px-4 md:px-12 font-body relative overflow-x-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Navigation & Header */}
        <div className="mb-10">
          <Link 
            href="/travel-agent/dashboard"
            className="inline-flex items-center gap-2 text-white/50 hover:text-[var(--saffron)] text-sm font-bold uppercase tracking-widest transition-colors group mb-6"
          >
            <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Dashboard
          </Link>
          
          <div className="flex justify-between items-end border-b border-white/10 pb-6">
            <div>
              <span className="text-[var(--saffron)] text-sm font-bold uppercase tracking-[0.25em] mb-2 block">Travel Partner Portal</span>
              <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-white">Agency Inbox</h1>
              <p className="text-white/50 mt-3 text-lg">View and manage booking inquiries from tourists.</p>
            </div>
            <div className="hidden sm:block">
              <div className="bg-[var(--saffron)]/10 border border-[var(--saffron)]/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Total Leads</span>
                <span className="text-3xl font-display text-[var(--saffron)]">{inquiries.length}</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Inbox Content */}
        {inquiries.length === 0 ? (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm shadow-[0_0_50px_rgba(255,255,255,0.02)]">
            <div className="text-6xl mb-4 opacity-50">📬</div>
            <h3 className="text-2xl font-display text-white mb-2">No Inquiries Yet</h3>
            <p className="text-white/40 max-w-md mx-auto">
              When tourists plan their trip and select your agency, their booking requests will appear right here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {inquiries.map((inquiry, index) => (
              <div 
                key={inquiry._id} 
                className="bg-black/40 border border-white/10 hover:border-[var(--saffron)]/30 transition-colors rounded-3xl p-6 md:p-8 relative overflow-hidden group shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(212,175,55,0.1)]"
              >
                {/* Decorative side accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[var(--saffron)] to-[var(--saffron)]/20 opacity-50 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 pb-6 border-b border-white/5">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-[var(--saffron)] text-black font-bold uppercase tracking-widest text-[0.65rem] px-2 py-1 rounded-md">New Lead</span>
                      <h3 className="text-2xl font-display text-white">{inquiry.touristName}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[var(--saffron)] text-sm">
                      <a href={`mailto:${inquiry.email}`} className="hover:text-white transition-colors flex items-center gap-2">
                        <span>✉</span> {inquiry.email}
                      </a>
                      <a href={`tel:${inquiry.phone}`} className="hover:text-white transition-colors flex items-center gap-2">
                        <span>📞</span> {inquiry.phone}
                      </a>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Received</span>
                    <div className="text-white/80 font-mono mt-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                      {new Date(inquiry.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <span className="text-white/40 block text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2">
                      <span className="text-lg">👥</span> Party
                    </span>
                    <span className="text-white/90 text-sm leading-relaxed">{inquiry.travelParty}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2">
                      <span className="text-lg">📅</span> Dates
                    </span>
                    <span className="text-white/90 text-sm leading-relaxed">{inquiry.season}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2">
                      <span className="text-lg">⏱️</span> Duration
                    </span>
                    <span className="text-white/90 text-sm leading-relaxed">{inquiry.duration} Days</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2">
                      <span className="text-lg">💰</span> Budget
                    </span>
                    <span className="text-white/90 text-sm leading-relaxed">{inquiry.budget}</span>
                  </div>
                </div>
                
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.05),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.05),transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.03),transparent_60%)] pointer-events-none" />
    </div>
  );
}
