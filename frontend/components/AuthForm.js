"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { endpoints, request } from "@/lib/api";
import OtpInput from "./OtpInput";

export default function AuthForm({ mode: initialMode = "login" }) {
  const router = useRouter();
  const { login } = useAuth();
  
  // form state
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  
  // modes: "input" or "verify"
  const [currentView, setCurrentView] = useState("input");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInitialSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const path = mode === "login" ? endpoints.login : endpoints.signup;
      const payload = mode === "login" ? { email: form.email, password: form.password } : form;

      const data = await request(path, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (data.requiresOtp) {
        // Switch to OTP verification view
        setCurrentView("verify");
      } else {
        // Old flow fallback (just in case)
        login(data);
        router.push("/");
      }
    } catch (submitError) {
      if (submitError.message.includes("verify your email")) {
        setCurrentView("verify");
      } else {
        setError(submitError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await request(endpoints.verify, {
        method: "POST",
        body: JSON.stringify({ email: form.email, otp })
      });

      login(data);
      router.push("/");
    } catch (submitError) {
      setError(submitError.message);
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
            We sent a 6-digit verification code to <span className="text-[var(--saffron)]">{form.email}</span>
          </p>

          <label className="block text-left mb-6">
            <span className="mb-3 block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)] text-center">Verification Code</span>
            <OtpInput value={otp} onChange={setOtp} />
          </label>

          {error && <p className="text-sm text-red-400 p-3 bg-red-400/10 border border-red-400/20 rounded-lg text-left">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-full bg-[var(--saffron)] px-5 py-4 text-sm font-bold uppercase tracking-[0.15em] text-black shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? "Verifying..." : "Verify & Login"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleInitialSubmit} className="rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <div className="space-y-6">
        {mode === "signup" && (
          <label className="block">
            <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Full name</span>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white outline-none focus:border-[var(--saffron)] transition-colors"
              required
            />
          </label>
        )}

        <label className="block">
          <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white outline-none focus:border-[var(--saffron)] transition-colors"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 flex justify-between items-center text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">
            <span>Password</span>
            {mode === "login" && (
              <a href="/forgot-password" className="text-white/40 hover:text-white transition-colors normal-case tracking-normal font-normal">
                Forgot password?
              </a>
            )}
          </span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white outline-none focus:border-[var(--saffron)] transition-colors"
            required
          />
        </label>

        {error && <p className="text-sm text-red-400 p-3 bg-red-400/10 border border-red-400/20 rounded-lg">{error}</p>}

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
