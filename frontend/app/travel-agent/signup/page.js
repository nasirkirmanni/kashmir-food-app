"use client";

import Link from "next/link";
import { useState } from "react";
import { endpoints, request } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import OtpInput from "@/components/OtpInput";

export default function TravelAgentSignupPage() {
  const [formData, setFormData] = useState({
    agencyName: "",
    ownerName: "",
    contactNumber: "",
    email: "",
    description: "",
    instagramLink: "",
    facebookLink: "",
    googleReviewLink: "",
    thumbnailUrl: "",
    rating: "",
    qualities: "",
    features: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth(); // or directly use the token depending on how AuthContext works. Assuming `login` fetches /me and we can just reload or trigger it.

  const [currentView, setCurrentView] = useState("input");
  const [otp, setOtp] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const data = await request("/travel-agencies/register", {
        method: "POST",
        body: JSON.stringify({
          agencyName: formData.agencyName,
          ownerName: formData.ownerName,
          contactNumber: formData.contactNumber,
          email: formData.email,
          description: formData.description,
          instagramLink: formData.instagramLink,
          facebookLink: formData.facebookLink,
          googleReviewLink: formData.googleReviewLink,
          thumbnailUrl: formData.thumbnailUrl,
          rating: formData.rating ? parseFloat(formData.rating) : 4.5,
          qualities: formData.qualities.split(",").map(q => q.trim()).filter(Boolean),
          features: formData.features.split(",").map(f => f.trim()).filter(Boolean),
          password: formData.password,
          phoneNumber: formData.contactNumber, // map contactNumber to user's phone
        }),
      });

      if (data.requiresOtp) {
        setVerifiedEmail(data.email || formData.email);
        setCurrentView("verify");
        setSuccess("OTP sent to your email!");
      } else {
        router.push("/travel-agent/login?registered=success");
      }
    } catch (err) {
      setError(err.message || "Failed to register travel agency");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = { email: verifiedEmail, otp };

      const data = await request(endpoints.verify, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      login(data);
      router.push("/travel-agent/dashboard");
    } catch (submitError) {
      setError(submitError.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wazwan-shell min-h-screen flex items-center justify-center pt-20 pb-16">
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

          {currentView === "verify" ? (
            <form onSubmit={handleVerifySubmit} className="space-y-8">
              <div className="text-center">
                <p className="text-white/80 mb-6">
                  We sent a 6-digit verification code to your email:
                  <br />
                  <span className="text-[var(--saffron)] font-medium">{verifiedEmail}</span>
                </p>
                <div className="flex justify-center mb-6">
                  <OtpInput value={otp} onChange={setOtp} />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full wazwan-btn-primary rounded-xl px-8 py-4 text-sm uppercase tracking-widest font-bold disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Complete Listing"}
              </button>
            </form>
          ) : (
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)] transition-colors"
                    placeholder="agency@example.com"
                  />
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
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </div>
                  <input
                    type="url"
                    name="instagramLink"
                    value={formData.instagramLink}
                    onChange={handleChange}
                    placeholder="Instagram Link"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)] transition-colors placeholder:text-white/40"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <input
                    type="url"
                    name="facebookLink"
                    value={formData.facebookLink}
                    onChange={handleChange}
                    placeholder="Facebook Link"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)] transition-colors placeholder:text-white/40"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <input
                    type="url"
                    name="googleReviewLink"
                    value={formData.googleReviewLink}
                    onChange={handleChange}
                    placeholder="Google Review URL"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)] transition-colors placeholder:text-white/40"
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


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)] transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    minLength={6}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--saffron)] transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full wazwan-btn-primary rounded-xl px-8 py-4 text-sm uppercase tracking-widest font-bold disabled:opacity-50"
              >
                {loading ? "Registering..." : "List Agency & Register"}
              </button>
            </form>
          )}
        </div>
        
        <p className="mt-8 text-center text-sm text-white/60">
          Already listed?{" "}
          <Link href="/travel-agent/login" className="text-[var(--saffron)] font-medium hover:underline transition-all">
            Log in to Dashboard
          </Link>
        </p>
      </section>
    </div>
  );
}
