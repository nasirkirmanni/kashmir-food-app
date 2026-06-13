"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { endpoints, request } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [savedCount, setSavedCount] = useState(0);
  
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    address: ""
  });

  useEffect(() => {
    // Redirect if not logged in
    if (user === null) {
      router.push("/login");
    } else if (user) {
      setFormData({
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || ""
      });
      
      // Fetch saved dishes count
      request(endpoints.favorites)
        .then((data) => setSavedCount(data.length || 0))
        .catch((err) => console.error("Failed to load favorites count", err));
    }
  }, [user, router]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      await request(endpoints.profile, {
        method: "PUT",
        body: JSON.stringify(formData)
      });
      
      setSuccess("Profile updated successfully!");
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) return null;

  // Generate initials for Avatar
  const initials = (user.name || "User").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div className="min-h-full pt-28 px-6 page-shell flex flex-col items-center mobile-safe-bottom">
      <div className="w-full max-w-md">
        
        {/* PROFILE HEADER & AVATAR */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-[var(--saffron)] to-amber-700 flex items-center justify-center text-3xl font-display font-medium text-black shadow-[0_0_40px_rgba(212,175,55,0.3)] mb-4 border-2 border-black">
            {initials}
          </div>
          <h1 className="font-display text-3xl text-white mb-1">{user.name || "Guest User"}</h1>
          <p className="text-sm text-white/50">{user.email}</p>
          
          <div className="mt-4 flex gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex flex-col items-center min-w-[120px]">
              <span className="text-[1.5rem] font-display text-[var(--saffron)]">{savedCount}</span>
              <span className="text-[0.6rem] font-bold uppercase tracking-widest text-white/40">Saved Dishes</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="space-y-4">
            <label className="block text-left">
              <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Email (Read Only)</span>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full rounded-xl border border-white/5 bg-black/20 px-4 py-3.5 text-white/50 outline-none cursor-not-allowed"
              />
            </label>

            <label className="block text-left">
              <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Full Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white outline-none focus:border-[var(--saffron)] transition-colors"
                required
              />
            </label>

            <label className="block text-left">
              <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)] flex justify-between">
                <span>Phone Number</span>
              </span>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+91 99999 99999"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white outline-none focus:border-[var(--saffron)] transition-colors"
              />
            </label>

            <label className="block text-left">
              <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)] flex justify-between">
                <span>Delivery Address</span>
              </span>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House No, Street, Landmark, City..."
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white outline-none focus:border-[var(--saffron)] transition-colors resize-none"
              />
            </label>
          </div>

          {error && <p className="text-sm text-red-400 p-3 bg-red-400/10 border border-red-400/20 rounded-lg">{error}</p>}
          {success && <p className="text-sm text-green-400 p-3 bg-green-400/10 border border-green-400/20 rounded-lg">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[var(--saffron)] px-5 py-4 text-sm font-bold uppercase tracking-[0.15em] text-black shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/favorites"
            className="flex w-full items-center justify-center gap-3 rounded-full border border-[var(--saffron)]/30 bg-[var(--saffron)]/10 px-5 py-4 text-sm font-bold uppercase tracking-[0.15em] text-[var(--saffron)] transition-all hover:bg-[var(--saffron)]/20 active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            View Saved Dishes
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-bold uppercase tracking-[0.15em] text-red-400 transition-all hover:bg-red-500/20 active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
