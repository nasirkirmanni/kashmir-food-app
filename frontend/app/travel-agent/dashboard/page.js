"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { request } from "@/lib/api";

export default function TravelAgentDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  const [agency, setAgency] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push("/travel-agent/login");
      return;
    }

    if (user.role !== "travel_agent" && !user.isAdmin) {
      router.push("/");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const data = await request("/travel-agencies/dashboard");
        setAgency(data.agency);
        setMetrics(data.metrics);
      } catch (err) {
        setError(err.message || "Failed to load dashboard details");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="wazwan-shell min-h-screen flex items-center justify-center pt-20 pb-16">
        <div className="text-white/60">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="wazwan-shell min-h-screen pt-28 pb-16 px-4 md:px-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
          <div>
            <span className="place-eyebrow mb-2 block">Travel Partner Portal</span>
            <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-white">Agency Dashboard</h1>
          </div>
          <button 
            onClick={logout}
            className="text-sm font-semibold uppercase tracking-widest text-[var(--saffron)] hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {agency && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-display font-medium text-white mb-1">{agency.agencyName}</h2>
                    <p className="text-white/60 text-sm">Owner: {agency.ownerName}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${agency.isListed ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                    {agency.isListed ? 'Listed Active' : 'Unlisted'}
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-white/40 uppercase tracking-widest text-[0.65rem] font-bold mb-1">Contact Details</span>
                    <span className="text-white">{agency.contactNumber} &bull; {agency.email}</span>
                  </div>
                  <div className="flex flex-col pt-4 border-t border-white/10">
                    <span className="text-white/40 uppercase tracking-widest text-[0.65rem] font-bold mb-2">Agency Description</span>
                    <p className="text-white/80 leading-relaxed">{agency.description || "No description provided."}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[var(--saffron)]/30 bg-[var(--saffron)]/10 p-6 backdrop-blur-md">
                  <div className="flex flex-col">
                    <span className="text-[var(--saffron)] text-sm font-bold uppercase tracking-widest mb-1">Total Inquiries</span>
                    <span className="text-4xl font-display text-white">{metrics?.totalInquiries || 0}</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                  <div className="flex flex-col">
                    <span className="text-white/60 text-sm font-bold uppercase tracking-widest mb-1">Total Bookings</span>
                    <span className="text-4xl font-display text-white">{metrics?.totalBookings || 0}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-display text-white mb-1">Trip Inquiries</h3>
                  <p className="text-white/50 text-xs">Manage requests from travelers.</p>
                </div>
                <button className="wazwan-btn-primary px-6 py-2 text-xs uppercase tracking-widest rounded-full cursor-not-allowed opacity-50">
                  View Inbox
                </button>
              </div>
            </div>

            <div className="space-y-6">
               <div className="rounded-2xl border border-[var(--saffron)]/30 bg-[var(--saffron)]/5 p-6 backdrop-blur-md">
                  <h3 className="text-[var(--saffron)] font-bold uppercase tracking-widest text-xs mb-3">Partner Status</h3>
                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    Your agency is currently available as an option when users plan their trip. 
                    Travelers can select your agency to arrange their itinerary.
                  </p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
