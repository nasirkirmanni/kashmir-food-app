"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { request } from "@/lib/api";

export default function TravelAgentDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  
  const [agency, setAgency] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState({ thumbnail: false, cover: false });
  
  const [formData, setFormData] = useState({});
  const [needsListing, setNeedsListing] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push("/travel-agent/login");
      return;
    }

    if (user.role !== "agent" && !user.isAdmin) {
      router.push("/");
      return;
    }

    fetchDashboard();
  }, [user, authLoading, router]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await request("/travel-agencies/dashboard");
      setAgency(data.agency);
      setMetrics(data.metrics);
      setInquiries(data.inquiries || []);
      setFormData({
        agencyName: data.agency.agencyName || "",
        email: data.agency.email || "",
        contactNumber: data.agency.contactNumber || "",
        whatsapp: data.agency.whatsapp || "",
        city: data.agency.city || "",
        yearsInBusiness: data.agency.yearsInBusiness || "",
        address: data.agency.address || "",
        state: data.agency.state || "",
        country: data.agency.country || "",
        description: data.agency.description || "",
        thumbnailUrl: data.agency.thumbnailUrl || "",
        coverImageUrl: data.agency.coverImageUrl || "",
        licenseNumber: data.agency.licenseNumber || "",
        whyChooseUs: data.agency.whyChooseUs || ""
      });
      if (data.agency.verificationStatus === 'incomplete') {
        const requiredFields = ['agencyName', 'email', 'contactNumber', 'whatsapp', 'city', 'yearsInBusiness', 'thumbnailUrl', 'coverImageUrl', 'whyChooseUs'];
        const isMissingRequired = requiredFields.some(field => !data.agency[field]);
        if (isMissingRequired) {
          setIsEditing(true);
        }
      }
    } catch (err) {
      if (err.message === "Travel agency not found" || err.message?.includes("not found")) {
        setNeedsListing(true);
        return;
      }
      setError(err.message || "Failed to load dashboard details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      await request("/travel-agencies/me", {
        method: "PUT",
        body: JSON.stringify(formData)
      });
      await fetchDashboard();
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update profile");
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [field]: true }));
    setError(null);

    const fd = new FormData();
    fd.append('image', file);

    try {
      const data = await request("/upload", {
        method: "POST",
        body: fd
      });
      
      const newUrl = data.image;
      
      const updatedFormData = {
        ...formData,
        [field === 'thumbnail' ? 'thumbnailUrl' : 'coverImageUrl']: newUrl
      };
      
      setFormData(updatedFormData);
      
      // Auto-save the profile when an image is uploaded to persist it immediately
      await request("/travel-agencies/me", {
        method: "PUT",
        body: JSON.stringify(updatedFormData)
      });
      
      if (agency) {
        setAgency(prev => ({
          ...prev,
          [field === 'thumbnail' ? 'thumbnailUrl' : 'coverImageUrl']: newUrl
        }));
      }

    } catch (err) {
      setError(err.message || "Image upload failed");
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  if (authLoading || loading) {
    return (
      <div className="wazwan-shell min-h-screen flex flex-col items-center justify-center pt-20">
        <div className="text-red-400 mb-4">{error}</div>
        <button onClick={fetchDashboard} className="text-[var(--saffron)] hover:underline">Try Again</button>
      </div>
    );
  }

  if (needsListing) {
    return (
      <div className="wazwan-shell h-[100dvh] overflow-hidden flex flex-col items-center justify-center p-4">
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl z-10 relative">
          <div className="w-16 h-16 mx-auto bg-[var(--saffron)]/10 rounded-full flex items-center justify-center mb-4 border border-[var(--saffron)]/20">
            <svg className="w-8 h-8 text-[var(--saffron)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl font-display font-medium text-white mb-2 tracking-tight">Agency Not Listed</h2>
          <p className="text-white/60 mb-6 text-sm leading-relaxed">
            You do not have a travel agency listed with Wazwan Way. List your agency to access your dashboard.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => router.push('/list-agency')} 
              className="w-full bg-[var(--saffron)] text-black font-bold uppercase tracking-widest text-xs py-3 px-6 rounded-full hover:scale-105 transition-transform"
            >
              List Agency Now
            </button>
            <button 
              onClick={() => router.back()} 
              className="w-full bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-xs py-3 px-6 rounded-full hover:bg-white/10 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!agency) return null;

  // Calculate profile completion
  const requiredFields = ['agencyName', 'email', 'contactNumber', 'whatsapp', 'city', 'yearsInBusiness', 'thumbnailUrl', 'coverImageUrl', 'whyChooseUs'];
  const filledFields = requiredFields.filter(field => agency && agency[field]);
  const profileCompletionPercentage = Math.round((filledFields.length / requiredFields.length) * 100);
  const isProfileComplete = profileCompletionPercentage === 100;

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
              
              {!isProfileComplete && agency.verificationStatus === 'incomplete' && !isEditing && (
                <div className="rounded-2xl border border-[var(--saffron)]/30 bg-[var(--saffron)]/10 p-6 backdrop-blur-md flex items-center justify-between">
                  <div>
                    <h3 className="text-[var(--saffron)] font-bold mb-1">Complete Your Profile</h3>
                    <p className="text-white/70 text-sm">You are {profileCompletionPercentage}% complete.</p>
                  </div>
                  <button onClick={() => setIsEditing(true)} className="bg-[var(--saffron)] text-black px-4 py-2 rounded-lg font-bold text-sm hover:brightness-110">
                    Complete Profile
                  </button>
                </div>
              )}

              {isEditing ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
                  <h2 className="text-2xl font-display font-medium text-white mb-6">Complete Agency Profile</h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Agency Name * (Required)</label>
                        <input type="text" value={formData.agencyName} onChange={e => setFormData({...formData, agencyName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)]" placeholder="Agency Name" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Email Address * (Required)</label>
                        <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)]" placeholder="agency@example.com" required />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Phone Number * (Required)</label>
                        <input type="tel" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)]" placeholder="+91..." required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">WhatsApp Number * (Required)</label>
                        <input type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)]" placeholder="+91..." required />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">City * (Required)</label>
                        <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)]" placeholder="City" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Years in Business * (Required)</label>
                        <input type="number" min="0" value={formData.yearsInBusiness} onChange={e => setFormData({...formData, yearsInBusiness: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)]" placeholder="Years" required />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Address (Optional)</label>
                      <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)]" placeholder="Agency Full Address" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">State (Optional)</label>
                        <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)]" placeholder="Jammu and Kashmir" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Country (Optional)</label>
                        <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)]" placeholder="India" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Description (Optional)</label>
                      <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white h-24 focus:outline-none focus:border-[var(--saffron)]" placeholder="Tell travelers about your agency..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">Why Choose Us * (Required)</label>
                      <textarea value={formData.whyChooseUs} maxLength={500} onChange={e => setFormData({...formData, whyChooseUs: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white h-24 focus:outline-none focus:border-[var(--saffron)]" placeholder="Highlight what makes your agency unique (Max 500 characters)..." />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-white/80">Agency Logo * (Required)</label>
                        <div className="relative border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:border-[var(--saffron)] transition-colors">
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumbnail')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          <div className="text-white/60 text-sm flex flex-col items-center">
                            <span className="mb-2">📁 {uploading.thumbnail ? 'Uploading...' : 'Click or Drag Logo'}</span>
                            {formData.thumbnailUrl && <img src={formData.thumbnailUrl} alt="Logo Preview" className="h-12 object-contain mt-2 rounded" />}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-white/80">Cover Image * (Required)</label>
                        <div className="relative border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:border-[var(--saffron)] transition-colors">
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'cover')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          <div className="text-white/60 text-sm flex flex-col items-center">
                            <span className="mb-2">📁 {uploading.cover ? 'Uploading...' : 'Click or Drag Cover'}</span>
                            {formData.coverImageUrl && <img src={formData.coverImageUrl} alt="Cover Preview" className="h-12 object-cover mt-2 rounded w-full" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <label className="block text-sm font-medium text-white/80 mb-2">License Number (Optional)</label>
                      <input type="text" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)]" placeholder="Optional" />
                    </div>
                    
                    <div className="pt-4 border-t border-white/10 mt-6">
                      <div className="p-4 mb-2 rounded-xl bg-[var(--saffron)]/10 border border-[var(--saffron)]/20 flex items-start gap-3">
                        <div className="text-[var(--saffron)] mt-0.5">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed">
                          <strong className="text-white">Listing Fee Notice:</strong> If your agency is approved, our team will contact you regarding a registration fee of <strong className="text-[var(--saffron)]">₹5999 per month</strong> to keep your listing active on Wazwan Way.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                      <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 text-white/60 hover:text-white font-medium text-sm">Cancel</button>
                      <button type="submit" disabled={uploading.thumbnail || uploading.cover} className="bg-[var(--saffron)] text-black px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-xs hover:brightness-110 disabled:opacity-50">
                        Submit Listing
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      {agency.thumbnailUrl && <img src={agency.thumbnailUrl} alt="Logo" className="w-12 h-12 rounded-lg object-cover border border-white/10" />}
                      <div>
                        <h2 className="text-2xl font-display font-medium text-white mb-1">{agency.agencyName}</h2>
                        <p className="text-white/60 text-sm">Owner: {agency.ownerName}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      agency.verificationStatus === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                      agency.verificationStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 
                      agency.verificationStatus === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      'bg-slate-500/20 text-slate-400 border-slate-500/30'
                    }`}>
                      {agency.verificationStatus === 'approved' ? 'Listed Active' : 
                       agency.verificationStatus === 'pending' ? 'Approval Pending' : 
                       agency.verificationStatus === 'rejected' ? 'Rejected' : 'Incomplete'}
                    </div>
                  </div>

                  <div className="space-y-5 text-sm">
                    <div className="flex flex-col">
                      <span className="text-white/40 uppercase tracking-widest text-[0.65rem] font-bold mb-1">Contact Details</span>
                      <span className="text-white">{agency.contactNumber} &bull; {agency.email}</span>
                      {agency.whatsapp && <span className="text-white/70">WhatsApp: {agency.whatsapp}</span>}
                    </div>
                    <div className="flex flex-col pt-4 border-t border-white/10">
                      <span className="text-white/40 uppercase tracking-widest text-[0.65rem] font-bold mb-1">Location</span>
                      <span className="text-white">{agency.city}{agency.state ? `, ${agency.state}` : ''}{agency.country ? `, ${agency.country}` : ''}</span>
                      {agency.address && <span className="text-white/70">{agency.address}</span>}
                    </div>
                    <div className="flex flex-col pt-4 border-t border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/40 uppercase tracking-widest text-[0.65rem] font-bold">Agency Description</span>
                        <button onClick={() => setIsEditing(true)} className="text-[var(--saffron)] text-xs font-semibold hover:underline">
                          {agency.description ? "Edit" : "Add Description"}
                        </button>
                      </div>
                      <p className="text-white/80 leading-relaxed">{agency.description || "No description provided."}</p>
                    </div>
                    {agency.whyChooseUs && (
                      <div className="flex flex-col pt-4 border-t border-white/10">
                        <span className="text-white/40 uppercase tracking-widest text-[0.65rem] font-bold mb-2">Why Choose Us</span>
                        <p className="text-[var(--saffron)] leading-relaxed italic">"{agency.whyChooseUs}"</p>
                      </div>
                    )}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <button onClick={() => setIsEditing(true)} className="text-[var(--saffron)] text-sm font-semibold hover:underline">
                        Edit Profile Details
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
                <button onClick={() => router.push('/travel-agent/inbox')} className="wazwan-btn-primary px-6 py-2 text-xs uppercase tracking-widest rounded-full hover:scale-105 transition-transform">
                  View Inbox
                </button>
              </div>
            </div>

            <div className="space-y-6">
               <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                  <h3 className="text-white/70 font-bold uppercase tracking-widest text-xs mb-4 flex items-center justify-between">
                    <span>Profile Status</span>
                    <span className="text-white font-mono">{profileCompletionPercentage}%</span>
                  </h3>
                  
                  <div className="w-full bg-black/50 rounded-full h-1.5 mb-6 overflow-hidden">
                    <div className="bg-[var(--saffron)] h-1.5 rounded-full transition-all duration-500" style={{ width: `${profileCompletionPercentage}%` }}></div>
                  </div>

                  <p className="text-white/60 text-sm leading-relaxed mb-6">
                    {agency.verificationStatus === 'approved' 
                      ? "Your agency is active and live on Wazwan Way. Travelers can now discover and book with you."
                      : agency.verificationStatus === 'pending'
                      ? "Your profile is under review by our team. We'll notify you once it's approved."
                      : agency.verificationStatus === 'rejected'
                      ? "Your profile requires updates before it can be listed. Please review our feedback."
                      : "Complete all required fields in your profile to submit your agency for review and listing."}
                  </p>

                  {agency.verificationStatus !== 'approved' && (
                    <div className="mb-6 p-4 rounded-xl bg-[var(--saffron)]/10 border border-[var(--saffron)]/20 flex items-start gap-3">
                      <div className="text-[var(--saffron)] mt-0.5">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-white/80 leading-relaxed">
                        <strong className="text-white">Listing Fee:</strong> If your agency is approved for listing, our team will contact you regarding a registration fee of <strong className="text-[var(--saffron)]">₹5999 per month</strong> to keep your listing active on Wazwan Way.
                      </p>
                    </div>
                  )}


                  {agency.verificationStatus === 'rejected' && (
                    <button 
                      onClick={handleSubmitForReview}
                      disabled={!isProfileComplete}
                      className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors bg-[var(--saffron)] text-black hover:brightness-110"
                    >
                      Resubmit Profile
                    </button>
                  )}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
