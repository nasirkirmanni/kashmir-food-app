"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { endpoints, request } from "@/lib/api";
import OtpInput from "./OtpInput";

export default function ForgotPasswordForm() {
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // modes: "email" | "otp" | "newPassword"
  const [currentView, setCurrentView] = useState("email");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await request(endpoints.forgotPassword, {
        method: "POST",
        body: JSON.stringify({ email })
      });

      setSuccess(data.message);
      setCurrentView("otp");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await request(endpoints.verifyResetOtp, {
        method: "POST",
        body: JSON.stringify({ email, otp })
      });

      setSuccess("Reset code verified! Please set a secure new password.");
      setCurrentView("newPassword");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await request(endpoints.resetPassword, {
        method: "POST",
        body: JSON.stringify({ email, otp, newPassword })
      });

      router.push("/login?reset=success");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  if (currentView === "newPassword") {
    return (
      <form onSubmit={handleResetSubmit} className="rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="space-y-6 text-center">
          <h3 className="font-display text-2xl text-white mb-2">Create New Password</h3>
          <p className="text-sm text-white/60 mb-6">
            Please enter a strong password for <span className="text-[var(--saffron)]">{email}</span>
          </p>

          <label className="block text-left">
            <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">New Password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white outline-none focus:border-[var(--saffron)] transition-colors"
              required
            />
          </label>

          <label className="block text-left">
            <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white outline-none focus:border-[var(--saffron)] transition-colors"
              required
            />
          </label>

          {error && <p className="text-sm text-red-400 p-3 bg-red-400/10 border border-red-400/20 rounded-lg text-left">{error}</p>}
          {success && <p className="text-sm text-green-400 p-3 bg-green-400/10 border border-green-400/20 rounded-lg text-left">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-full bg-[var(--saffron)] px-5 py-4 text-sm font-bold uppercase tracking-[0.15em] text-black shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? "Resetting..." : "Save New Password"}
          </button>
        </div>
      </form>
    );
  }

  if (currentView === "otp") {
    return (
      <form onSubmit={handleOtpSubmit} className="rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="space-y-6 text-center">
          <h3 className="font-display text-2xl text-white mb-2">Check your email</h3>
          <p className="text-sm text-white/60 mb-6">
            We sent a password reset code to <span className="text-[var(--saffron)]">{email}</span>
          </p>

          <label className="block text-left mb-6">
            <span className="mb-3 block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)] text-center">Reset Code</span>
            <OtpInput value={otp} onChange={setOtp} />
          </label>

          {error && <p className="text-sm text-red-400 p-3 bg-red-400/10 border border-red-400/20 rounded-lg text-left">{error}</p>}
          {success && <p className="text-sm text-green-400 p-3 bg-green-400/10 border border-green-400/20 rounded-lg text-left">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-full bg-[var(--saffron)] px-5 py-4 text-sm font-bold uppercase tracking-[0.15em] text-black shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleEmailSubmit} className="rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <div className="space-y-6">
        <label className="block">
          <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Email Address</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
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
          {loading ? "Please wait..." : "Send Reset Code"}
        </button>
        
        <div className="text-center pt-2">
          <a href="/login" className="text-sm text-white/40 hover:text-white transition-colors">
            Return to Login
          </a>
        </div>
      </div>
    </form>
  );
}
