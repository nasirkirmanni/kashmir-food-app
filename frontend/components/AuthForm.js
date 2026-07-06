"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { endpoints, request } from "@/lib/api";
import Link from "next/link";
import OtpInput from "./OtpInput";

export default function AuthForm({ mode = "login", redirectPath = "/" }) {
  const router = useRouter();
  const { login } = useAuth();
  
  // form state
  const [form, setForm] = useState({ name: "", email: "", phoneNumber: "", password: "", confirmPassword: "" });
  const [otp, setOtp] = useState("");
  
  // views: "input" or "verify"
  const [currentView, setCurrentView] = useState("input");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Verification state tracking
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleInitialSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (mode === "signup" && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const path = mode === "login" ? endpoints.login : endpoints.signup;
      
      let payload;
      if (mode === "login") {
        payload = { email: form.email, password: form.password };
      } else {
        payload = {
          name: form.name,
          email: form.email,
          phoneNumber: form.phoneNumber,
          password: form.password
        };
      }

      const data = await request(path, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (data.requiresOtp) {
        setVerifiedEmail(data.email || form.email);
        setCurrentView("verify");
      } else {
        login(data);
        router.push(redirectPath);
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (event) => {
    event.preventDefault();
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
      router.push(redirectPath);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await request(endpoints.resendOtp, {
        method: "POST",
        body: JSON.stringify({
          email: verifiedEmail,
          method: "email",
          flow: "verification"
        })
      });
      setSuccess("Verification code resent successfully!");
      setResendCooldown(30);
    } catch (resendError) {
      setError(resendError.message);
    } finally {
      setLoading(false);
    }
  };

  if (currentView === "verify") {
    return (
      <form onSubmit={handleVerifySubmit} className="rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="space-y-6 text-center">
          <h3 className="font-display text-2xl text-white mb-2">Check your email</h3>
          <p className="text-sm text-white/60 mb-6">
            We sent a 6-digit verification code to your email:{" "}
            <span className="text-[var(--saffron)]">{verifiedEmail}</span>
            <button
              type="button"
              onClick={() => {
                setCurrentView("input");
                setError("");
                setSuccess("");
              }}
              className="mt-2 block mx-auto text-xs font-bold uppercase tracking-wider text-[var(--saffron)] hover:text-white transition-colors underline"
            >
              Edit Email
            </button>
          </p>

          <label className="block text-left mb-6">
            <span className="mb-3 block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)] text-center">Verification Code</span>
            <OtpInput value={otp} onChange={setOtp} />
          </label>

          {error && <p className="text-sm text-red-400 p-3 bg-red-400/10 border border-red-400/20 rounded-lg text-left">{error}</p>}
          {success && <p className="text-sm text-green-400 p-3 bg-green-400/10 border border-green-400/20 rounded-lg text-left">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[var(--saffron)] px-5 py-4 text-sm font-bold uppercase tracking-[0.15em] text-black shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? "Verifying..." : "Verify & Login"}
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || loading}
              className="text-xs font-bold uppercase tracking-wider text-[var(--saffron)] hover:text-white transition-colors disabled:opacity-50"
            >
              {resendCooldown > 0
                ? `Resend Code in ${resendCooldown}s`
                : "Resend Code via Email"}
            </button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleInitialSubmit} className="w-full max-w-[460px] mx-auto rounded-[24px] border border-white/10 bg-[#111111]/80 backdrop-blur-3xl p-8 sm:p-10 shadow-[0_0_80px_rgba(0,0,0,0.8),inset_0_0_20px_rgba(255,255,255,0.02)] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--saffron)]/5 to-transparent pointer-events-none rounded-[24px]" />
      
      <div className="text-center mb-8 relative z-10 flex flex-col items-center">
        <img src="/icon.png" alt="Wazwan Way Logo" className="h-14 w-auto mb-6 drop-shadow-[0_0_15px_rgba(200,164,106,0.3)]" />
        <h1 className="font-display text-3xl font-medium tracking-tight text-white mb-2">
          {mode === "login" ? "Welcome Back" : "Create Your Account"}
        </h1>
        <p className="text-[13px] leading-relaxed text-white/50 px-4">
          {mode === "login"
            ? "Sign in to continue your Kashmir journey."
            : "Join Wazwan Way to save favourites, build itineraries and discover authentic Kashmir."}
        </p>
      </div>

      <div className="space-y-5 relative z-10">
        {mode === "signup" ? (
          /* Signup: Full Name, Email, Phone Number, Password, Confirm Password */
          <>
            <label className="block text-left group">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.1em] text-white/50 group-focus-within:text-[var(--saffron)] transition-colors">Full name</span>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="w-full rounded-[14px] border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[var(--saffron)]/50 focus:bg-black/80 focus:ring-1 focus:ring-[var(--saffron)]/30 transition-all placeholder:text-white/20"
                required
              />
            </label>

            <label className="block text-left group">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.1em] text-white/50 group-focus-within:text-[var(--saffron)] transition-colors">Email Address</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="w-full rounded-[14px] border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[var(--saffron)]/50 focus:bg-black/80 focus:ring-1 focus:ring-[var(--saffron)]/30 transition-all placeholder:text-white/20"
                required
              />
            </label>

            <label className="block text-left group">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.1em] text-white/50 group-focus-within:text-[var(--saffron)] transition-colors">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="w-full rounded-[14px] border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[var(--saffron)]/50 focus:bg-black/80 focus:ring-1 focus:ring-[var(--saffron)]/30 transition-all placeholder:text-white/20"
                required
              />
            </label>

            <label className="block text-left group">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.1em] text-white/50 group-focus-within:text-[var(--saffron)] transition-colors">Confirm Password</span>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                className="w-full rounded-[14px] border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[var(--saffron)]/50 focus:bg-black/80 focus:ring-1 focus:ring-[var(--saffron)]/30 transition-all placeholder:text-white/20"
                required
              />
            </label>
          </>
        ) : (
          /* Login: Email & Password only */
          <>
            <label className="block text-left group">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.1em] text-white/50 group-focus-within:text-[var(--saffron)] transition-colors">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="w-full rounded-[14px] border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[var(--saffron)]/50 focus:bg-black/80 focus:ring-1 focus:ring-[var(--saffron)]/30 transition-all placeholder:text-white/20"
                required
              />
            </label>

            <label className="block text-left group">
              <span className="mb-1.5 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.1em] text-white/50 group-focus-within:text-[var(--saffron)] transition-colors">
                <span>Password</span>
              </span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="w-full rounded-[14px] border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-[var(--saffron)]/50 focus:bg-black/80 focus:ring-1 focus:ring-[var(--saffron)]/30 transition-all placeholder:text-white/20"
                required
              />
            </label>
          </>
        )}

        {error && <p className="text-sm text-red-400 p-3 bg-red-400/10 border border-red-400/20 rounded-lg text-left">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-[var(--saffron)] px-5 py-3.5 text-xs font-bold uppercase tracking-[0.1em] text-black shadow-[0_4px_14px_0_rgba(200,164,106,0.39)] hover:shadow-[0_6px_20px_rgba(200,164,106,0.23)] hover:bg-[var(--saffron)]/90 transition-all active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
        >
          {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        {mode === "login" && (
          <div className="text-center mt-4">
            <a href="/forgot-password" className="text-[11px] font-medium text-white/40 hover:text-white transition-colors normal-case">
              Forgot Password?
            </a>
          </div>
        )}
      </div>

      <div className="mt-8 relative z-10">
        <p className="text-center text-[13px] text-white/50">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <Link href={mode === "login" ? "/signup" : "/login"} className="text-white font-medium hover:text-[var(--saffron)] transition-colors">
            {mode === "login" ? "Create Account" : "Sign In"}
          </Link>
        </p>
      </div>

      {mode === "signup" && (
        <>
          <div className="mt-6 flex items-center gap-4 before:h-px before:flex-1 before:bg-white/10 after:h-px after:flex-1 after:bg-white/10 relative z-10">
            <span className="text-[10px] uppercase tracking-widest font-bold text-white/20">OR</span>
          </div>

          <div className="mt-6 text-center flex flex-col items-center gap-1.5 relative z-10">
            <p className="text-[11px] text-white/40">Own a travel agency?</p>
            <Link 
              href="/travel-agent/signup" 
              className="inline-flex items-center gap-1.5 text-white/80 font-medium hover:text-[var(--saffron)] transition-colors group text-[13px]"
            >
              Register as a Travel Agency
              <svg 
                className="w-3.5 h-3.5 transform transition-transform group-hover:translate-x-1 text-[var(--saffron)]" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </>
      )}
    </form>
  );
}
