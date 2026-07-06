"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { request } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ListAgencyPage() {
  const { user, loading: authLoading, checkAuth } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    agencyName: "",
    ownerName: "",
    contactNumber: "",
    description: "",
    instagramLink: "",
    facebookLink: "",
    googleReviewLink: "",
    thumbnailUrl: "",
    rating: "",
    qualities: "",
    features: "",
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/list-agency");
    }
  }, [user, authLoading, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await request("/travel-agencies/list-agency", {
        method: "POST",
        body: JSON.stringify({
          agencyName: formData.agencyName,
          ownerName: formData.ownerName,
          contactNumber: formData.contactNumber,
          description: formData.description,
          instagramLink: formData.instagramLink,
          facebookLink: formData.facebookLink,
          googleReviewLink: formData.googleReviewLink,
          thumbnailUrl: formData.thumbnailUrl,
          rating: formData.rating ? parseFloat(formData.rating) : 4.5,
          qualities: formData.qualities ? formData.qualities.split(",").map(q => q.trim()).filter(Boolean) : [],
          features: formData.features ? formData.features.split(",").map(f => f.trim()).filter(Boolean) : [],
        }),
      });

      setSuccess("Your agency listing request has been submitted successfully!");
      
      // Update auth context so the user role updates if they became a travel_agent
      if (checkAuth) {
         await checkAuth();
      }

      setTimeout(() => {
        router.push("/profile");
      }, 2000);

    } catch (err) {
      setError(err.message || "Failed to submit agency listing request");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="wazwan-shell min-h-screen flex items-center justify-center pt-20 pb-16">
        <div className="text-white/60">Loading...</div>
      </div>
    );
  }

  return (
    <div className="wazwan-shell min-h-screen flex items-center justify-center pt-28 pb-16">
      <section className="w-full max-w-xl px-4">
        <div className="text-center mb-8">
          <span className="place-eyebrow mb-3 block">Travel Partner</span>
          <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-white mb-4">List Your Agency</h1>
          <p className="text-base leading-relaxed text-white/60">
            Partner with Wazwan Way to offer custom itineraries to travelers exploring Kashmir.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Agency Name</label>
                <input
                  type="text"
                  name="agencyName"
                  required
                  value={formData.agencyName}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)] transition-colors"
                  placeholder="E.g., Alpine Kashmir Tours"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Owner Name</label>
                <input
                  type="text"
                  name="ownerName"
                  required
                  value={formData.ownerName}
                  onChange={handleChange}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)] transition-colors"
                  placeholder="E.g., Tariq Ahmad"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                required
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)] transition-colors"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Short Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)] transition-colors resize-none"
                placeholder="Tell travelers what makes your agency unique..."
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10 mt-6">
              <h3 className="text-white font-medium text-sm mb-2">Social Profiles & Reviews (Optional)</h3>
              
              <div className="relative">
                <input
                  type="url"
                  name="instagramLink"
                  value={formData.instagramLink}
                  onChange={handleChange}
                  placeholder="Instagram Link"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)] transition-colors placeholder:text-white/40"
                />
              </div>

              <div className="relative">
                <input
                  type="url"
                  name="facebookLink"
                  value={formData.facebookLink}
                  onChange={handleChange}
                  placeholder="Facebook Link"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)] transition-colors placeholder:text-white/40"
                />
              </div>

              <div className="relative">
                <input
                  type="url"
                  name="googleReviewLink"
                  value={formData.googleReviewLink}
                  onChange={handleChange}
                  placeholder="Google Review URL"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)] transition-colors placeholder:text-white/40"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/10 mt-6">
              <h3 className="text-white font-medium text-sm mb-2">Agency Details (Optional)</h3>
              
              <input
                type="url"
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleChange}
                placeholder="Thumbnail Image URL (e.g. https://example.com/logo.jpg)"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)] transition-colors placeholder:text-white/40"
              />

              <input
                type="number"
                name="rating"
                min="1"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleChange}
                placeholder="Google Rating (e.g. 4.8)"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)] transition-colors placeholder:text-white/40"
              />

              <input
                type="text"
                name="qualities"
                value={formData.qualities}
                onChange={handleChange}
                placeholder="Qualities (comma separated, e.g. Luxury, Trusted, Fast Response)"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)] transition-colors placeholder:text-white/40"
              />

              <input
                type="text"
                name="features"
                value={formData.features}
                onChange={handleChange}
                placeholder="Unique Features (comma separated, e.g. Free Cancellation, 24/7 Support)"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)] transition-colors placeholder:text-white/40"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full wazwan-btn-primary rounded-xl px-8 py-4 text-sm uppercase tracking-widest font-bold disabled:opacity-50 mt-8"
            >
              {loading ? "Submitting..." : "Submit Agency Listing"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
