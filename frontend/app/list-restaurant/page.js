"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { endpoints, request } from "@/lib/api";

export default function ListRestaurantPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    restaurantName: "",
    ownerName: "",
    phoneNumber: "",
    location: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await request(endpoints.restaurantLeads(), {
        method: "POST",
        body: JSON.stringify(formData)
      });
      setSuccess(true);
      setFormData({
        restaurantName: "",
        ownerName: "",
        phoneNumber: "",
        location: "",
        description: "",
      });
    } catch (error) {
      alert(error.message || "Failed to submit partner request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-32 px-6 page-shell flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="mb-10 text-center">
          <span className="text-[var(--saffron)] font-bold tracking-[0.2em] uppercase text-[0.65rem] mb-3 block">Partner With Us</span>
          <h1 className="font-display text-4xl md:text-5xl text-white mb-4">List Your Restaurant</h1>
          <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-lg mx-auto">
            Join the Wazwan Way platform and showcase your authentic Kashmiri cuisine to thousands of food enthusiasts and travelers.
          </p>
        </div>

        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-500/10 border border-green-500/30 rounded-[32px] p-10 text-center shadow-[0_0_50px_rgba(34,197,94,0.1)] backdrop-blur-md"
          >
            <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display text-3xl text-white mb-4">Request Submitted!</h2>
            <p className="text-white/60 mb-8 max-w-sm mx-auto">
              Thank you for your interest in joining Wazwan Way. Our team will review your details and contact you shortly.
            </p>
            <button 
              onClick={() => setSuccess(false)}
              className="inline-flex rounded-full bg-[var(--saffron)] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-black shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-transform hover:scale-[1.02] active:scale-95"
            >
              Submit Another
            </button>
          </motion.div>
        ) : (
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit} 
            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 sm:p-10 shadow-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Restaurant Name */}
              <label className="block text-left col-span-1 md:col-span-2">
                <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Restaurant Name *</span>
                <input
                  type="text"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleChange}
                  placeholder="e.g. Ahdoos Restaurant"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--saffron)] transition-colors shadow-inner"
                />
              </label>

              {/* Owner Name */}
              <label className="block text-left">
                <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Owner Name *</span>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--saffron)] transition-colors shadow-inner"
                />
              </label>

              {/* Phone Number */}
              <label className="block text-left">
                <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Contact Number *</span>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+91 99999 99999"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--saffron)] transition-colors shadow-inner"
                />
              </label>

              {/* Location */}
              <label className="block text-left col-span-1 md:col-span-2">
                <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Location / Address *</span>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Residency Road, Srinagar..."
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--saffron)] transition-colors shadow-inner"
                />
              </label>

              {/* Description */}
              <label className="block text-left col-span-1 md:col-span-2">
                <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Restaurant Description</span>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us about your specialties, history, and what makes your Wazwan unique..."
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--saffron)] transition-colors resize-none shadow-inner"
                />
              </label>

              {/* Image Upload */}
              <label className="block text-left col-span-1 md:col-span-2">
                <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Restaurant Images (Optional)</span>
                <div className="w-full rounded-2xl border border-dashed border-white/20 bg-black/20 hover:bg-black/40 px-5 py-8 flex flex-col items-center justify-center transition-colors cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-white/10 transition-colors">
                    <svg className="w-6 h-6 text-[var(--saffron)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">Click to upload photos</span>
                  <span className="text-[0.6rem] text-white/30 mt-1">JPG, PNG up to 5MB</span>
                  <input type="file" className="hidden" multiple accept="image/*" />
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[var(--saffron)] px-5 py-4 text-sm font-bold uppercase tracking-[0.2em] text-black shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100 mt-2"
            >
              {loading ? "Submitting Request..." : "Submit Listing"}
            </button>
            <p className="text-center text-[0.65rem] text-white/40 mt-4">
              By submitting, you agree to our terms of service and privacy policy.
            </p>
          </motion.form>
        )}
      </div>
    </div>
  );
}
