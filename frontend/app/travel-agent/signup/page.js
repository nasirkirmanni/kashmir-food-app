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
    whatsapp: "",
    email: "",
    city: "",
    yearsInBusiness: "",
    website: "",
    instagramLink: "",
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
          whatsapp: formData.whatsapp,
          email: formData.email,
          city: formData.city,
          yearsInBusiness: parseInt(formData.yearsInBusiness),
          website: formData.website,
          instagramLink: formData.instagramLink,
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
    <div className="wazwan-shell min-h-screen flex flex-col items-center pt-32 pb-16 px-4">
      <div className="w-full max-w-[520px] mx-auto rounded-[24px] border border-white/10 bg-[#111111]/80 backdrop-blur-3xl p-8 sm:p-10 shadow-[0_0_80px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(255,255,255,0.02)] flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--saffron)]/5 to-transparent pointer-events-none rounded-[24px]" />
        
        <div className="text-center mb-8 relative z-10 flex flex-col items-center">
          <img src="/icon.png" alt="Wazwan Way Logo" className="h-14 w-auto mb-6 drop-shadow-[0_0_15px_rgba(200,164,106,0.3)]" />
          <h1 className="font-display text-3xl font-medium tracking-tight text-white mb-2">Register Your Agency</h1>
          <p className="text-[13px] leading-relaxed text-white/50 px-4">
            Create your agency account and start receiving travel enquiries.
          </p>
        </div>

        <div className="relative z-10">
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
            <form onSubmit={handleVerifySubmit} className="space-y-6">
              <div className="text-center">
                <p className="text-white/50 mb-6 text-sm">
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
                className="w-full rounded-full bg-[var(--saffron)] px-5 py-3.5 text-xs font-bold uppercase tracking-[0.1em] text-black shadow-[0_4px_14px_0_rgba(200,164,106,0.39)] hover:shadow-[0_6px_20px_rgba(200,164,106,0.23)] hover:bg-[var(--saffron)]/90 transition-all active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
              >
                {loading ? "Verifying..." : "Verify & Complete"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block text-left group">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.1em] text-white/50 group-focus-within:text-[var(--saffron)] transition-colors">Owner Name</span>
                  <input
                    type="text"
                    name="ownerName"
                    required
                    value={formData.ownerName}
                    onChange={handleChange}
                    className="w-full rounded-[14px] border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[var(--saffron)]/50 focus:bg-black/80 focus:ring-1 focus:ring-[var(--saffron)]/30 transition-all placeholder:text-white/20"
                    placeholder="Full Name"
                  />
                </label>

                <label className="block text-left group">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.1em] text-white/50 group-focus-within:text-[var(--saffron)] transition-colors">Agency Name</span>
                  <input
                    type="text"
                    name="agencyName"
                    required
                    value={formData.agencyName}
                    onChange={handleChange}
                    className="w-full rounded-[14px] border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[var(--saffron)]/50 focus:bg-black/80 focus:ring-1 focus:ring-[var(--saffron)]/30 transition-all placeholder:text-white/20"
                    placeholder="Agency Name"
                  />
                </label>
              </div>

              <label className="block text-left group">
                <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.1em] text-white/50 group-focus-within:text-[var(--saffron)] transition-colors">Email Address</span>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-[14px] border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[var(--saffron)]/50 focus:bg-black/80 focus:ring-1 focus:ring-[var(--saffron)]/30 transition-all placeholder:text-white/20"
                  placeholder="agency@example.com"
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block text-left group">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.1em] text-white/50 group-focus-within:text-[var(--saffron)] transition-colors">Password</span>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-[14px] border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[var(--saffron)]/50 focus:bg-black/80 focus:ring-1 focus:ring-[var(--saffron)]/30 transition-all placeholder:text-white/20"
                  />
                </label>

                <label className="block text-left group">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.1em] text-white/50 group-focus-within:text-[var(--saffron)] transition-colors">Confirm Password</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-[14px] border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[var(--saffron)]/50 focus:bg-black/80 focus:ring-1 focus:ring-[var(--saffron)]/30 transition-all placeholder:text-white/20"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block text-left group">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.1em] text-white/50 group-focus-within:text-[var(--saffron)] transition-colors">Contact Number</span>
                  <input
                    type="tel"
                    name="contactNumber"
                    required
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full rounded-[14px] border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[var(--saffron)]/50 focus:bg-black/80 focus:ring-1 focus:ring-[var(--saffron)]/30 transition-all placeholder:text-white/20"
                    placeholder="+91 9876543210"
                  />
                </label>

                <label className="block text-left group">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.1em] text-white/50 group-focus-within:text-[var(--saffron)] transition-colors">WhatsApp Number</span>
                  <input
                    type="tel"
                    name="whatsapp"
                    required
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className="w-full rounded-[14px] border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[var(--saffron)]/50 focus:bg-black/80 focus:ring-1 focus:ring-[var(--saffron)]/30 transition-all placeholder:text-white/20"
                    placeholder="+91 9876543210"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block text-left group">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.1em] text-white/50 group-focus-within:text-[var(--saffron)] transition-colors">City</span>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full rounded-[14px] border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[var(--saffron)]/50 focus:bg-black/80 focus:ring-1 focus:ring-[var(--saffron)]/30 transition-all placeholder:text-white/20"
                    placeholder="Srinagar"
                  />
                </label>

                <label className="block text-left group">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.1em] text-white/50 group-focus-within:text-[var(--saffron)] transition-colors">Years in Business</span>
                  <input
                    type="number"
                    name="yearsInBusiness"
                    required
                    min="0"
                    value={formData.yearsInBusiness}
                    onChange={handleChange}
                    className="w-full rounded-[14px] border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[var(--saffron)]/50 focus:bg-black/80 focus:ring-1 focus:ring-[var(--saffron)]/30 transition-all placeholder:text-white/20"
                    placeholder="5"
                  />
                </label>
              </div>

              <div className="space-y-4 pt-4 mt-6">
                <h3 className="text-white/50 font-medium text-xs uppercase tracking-widest mb-2">Online Presence (Optional)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-[var(--saffron)] transition-colors">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="Website URL"
                      className="w-full rounded-[14px] border border-white/10 bg-black/50 pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-[var(--saffron)]/50 focus:bg-black/80 focus:ring-1 focus:ring-[var(--saffron)]/30 transition-all placeholder:text-white/20"
                    />
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-white/40 group-focus-within:text-[var(--saffron)] transition-colors">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                    </div>
                    <input
                      type="url"
                      name="instagramLink"
                      value={formData.instagramLink}
                      onChange={handleChange}
                      placeholder="Instagram URL"
                      className="w-full rounded-[14px] border border-white/10 bg-black/50 pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-[var(--saffron)]/50 focus:bg-black/80 focus:ring-1 focus:ring-[var(--saffron)]/30 transition-all placeholder:text-white/20"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-full bg-[var(--saffron)] px-5 py-3.5 text-xs font-bold uppercase tracking-[0.1em] text-black shadow-[0_4px_14px_0_rgba(200,164,106,0.39)] hover:shadow-[0_6px_20px_rgba(200,164,106,0.23)] hover:bg-[var(--saffron)]/90 transition-all active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
              >
                {loading ? "Registering..." : "Register Agency"}
              </button>
            </form>
          )}
        </div>
        
        <div className="mt-8 relative z-10">
          <p className="text-center text-[13px] text-white/50">
            Already have an account?{" "}
            <Link href="/travel-agent/login" className="text-white font-medium hover:text-[var(--saffron)] transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
