"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { endpoints, request } from "@/lib/api";
import OtpInput from "./OtpInput";

export default function AuthForm({ mode = "login" }) {
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
        router.push("/");
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
      router.push("/");
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
    <form onSubmit={handleInitialSubmit} className="rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <div className="space-y-6">
        {mode === "signup" ? (
          /* Signup: Full Name, Email, Phone Number, Password, Confirm Password */
          <>
            <label className="block text-left">
              <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Full name</span>
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white outline-none focus:border-[var(--saffron)] transition-colors"
                required
              />
            </label>

            <label className="block text-left">
              <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Email Address</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white outline-none focus:border-[var(--saffron)] transition-colors"
                required
              />
            </label>

            <label className="block text-left">
              <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Phone Number</span>
              <input
                type="tel"
                placeholder="+91 99999 99999"
                value={form.phoneNumber}
                onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white outline-none focus:border-[var(--saffron)] transition-colors"
                required
              />
            </label>

            <label className="block text-left">
              <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white outline-none focus:border-[var(--saffron)] transition-colors"
                required
              />
            </label>

            <label className="block text-left">
              <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Confirm Password</span>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white outline-none focus:border-[var(--saffron)] transition-colors"
                required
              />
            </label>
          </>
        ) : (
          /* Login: Email & Password only */
          <>
            <label className="block text-left">
              <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Email Address</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white outline-none focus:border-[var(--saffron)] transition-colors"
                required
              />
            </label>

            <label className="block text-left">
              <span className="mb-2 flex justify-between items-center text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">
                <span>Password</span>
                <a href="/forgot-password" className="text-white/40 hover:text-white transition-colors normal-case tracking-normal font-normal">
                  Forgot password?
                </a>
              </span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white outline-none focus:border-[var(--saffron)] transition-colors"
                required
              />
            </label>
          </>
        )}

        {error && <p className="text-sm text-red-400 p-3 bg-red-400/10 border border-red-400/20 rounded-lg text-left">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-full bg-[var(--saffron)] px-5 py-4 text-sm font-bold uppercase tracking-[0.15em] text-black shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
        >
          {loading ? "Please wait..." : mode === "login" ? "Login to WazwanWay" : "Create Account"}
        </button>
      </div>
    </form>
  );
}
