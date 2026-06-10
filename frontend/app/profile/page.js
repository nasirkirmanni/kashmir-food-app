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
      const updatedUser = await request(endpoints.profile, {
        method: "PUT",
        body: JSON.stringify(formData)
      });
      
      setSuccess("Profile updated successfully!");
      
      // Update local storage and context if necessary, 
      // but reloading is an easy way to refresh context for now
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // or a loader

  return (
    <div className="min-h-screen pt-28 pb-32 px-6 page-shell flex flex-col items-center">
      <div className="w-full max-w-md">
        <h1 className="font-display text-4xl text-white mb-2 text-center">My Profile</h1>
        <p className="text-sm text-white/60 text-center mb-8">
          Manage your personal details and contact information.
        </p>

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
                {!user.phoneNumber && <span className="text-red-400 normal-case tracking-normal font-normal">*Required for orders</span>}
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
                {!user.address && <span className="text-red-400 normal-case tracking-normal font-normal">*Required for orders</span>}
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

        <Link
          href="/favorites"
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-[var(--saffron)]/30 bg-[var(--saffron)]/10 px-5 py-4 text-sm font-bold uppercase tracking-[0.15em] text-[var(--saffron)] transition-all hover:bg-[var(--saffron)]/20 active:scale-95"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          View Saved Dishes
        </Link>

        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="mt-8 w-full rounded-full border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm font-bold uppercase tracking-[0.15em] text-red-400 transition-colors hover:bg-red-500/20 active:bg-red-500/30"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
