"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { endpoints, request } from "@/lib/api";
import OtpInput from "./OtpInput";

export default function ForgotPasswordForm() {
  const router = useRouter();
  
  // recoveryChannel: "email" | "phone" (channel where OTP is sent)
  const [recoveryChannel, setRecoveryChannel] = useState("email");
  
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // views: "input" | "otp" | "newPassword"
  const [currentView, setCurrentView] = useState("input");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Cooldown state for resending
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleEmailSubmit = async (event) => {
    event.preventDefault();
    if (recoveryChannel === "phone") {
      setError("Phone verification coming soon.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = { email, method: "email" };

      const data = await request(endpoints.forgotPassword, {
        method: "POST",
        body: JSON.stringify(payload)
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
      const payload = { email, otp };

      await request(endpoints.verifyResetOtp, {
        method: "POST",
        body: JSON.stringify(payload)
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
      const payload = { email, otp, newPassword };

      await request(endpoints.resetPassword, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      router.push("/login?reset=success");
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
      const payload = { email, method: "email", flow: "reset" };

      await request(endpoints.resendOtp, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setSuccess("Reset code resent successfully!");
      setResendCooldown(30);
    } catch (resendError) {
      setError(resendError.message);
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
            className="w-full rounded-full bg-[var(--saffron)] px-5 py-4 text-sm font-bold uppercase tracking-[0.15em] text-black shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
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
            We sent a password reset code to your registered email:{" "}
            <span className="text-[var(--saffron)]">{email}</span>
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
            className="w-full rounded-full bg-[var(--saffron)] px-5 py-4 text-sm font-bold uppercase tracking-[0.15em] text-black shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? "Verifying..." : "Verify Code"}
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
    <form onSubmit={handleEmailSubmit} className="rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <div className="space-y-6">
        <label className="block text-left">
          <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Email Address</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-white outline-none focus:border-[var(--saffron)] transition-colors"
            required
          />
        </label>

        {/* RECOVERY METHOD SELECTOR */}
        <div className="space-y-3 text-left">
          <span className="block text-[0.7rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Send Recovery Code via:</span>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setRecoveryChannel("email");
                setError("");
              }}
              className={`rounded-xl border p-4 text-center transition-all duration-300 ${
                recoveryChannel === "email"
                  ? "border-[var(--saffron)] bg-[var(--saffron)]/10 text-white"
                  : "border-white/10 bg-black/20 text-white/50 hover:border-white/20 hover:text-white"
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wider">Email Address</div>
              <div className="text-[0.6rem] mt-1 opacity-60">Fully functional</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setRecoveryChannel("phone");
                setError("Phone verification coming soon.");
              }}
              className={`relative overflow-hidden rounded-xl border p-4 text-center transition-all duration-300 ${
                recoveryChannel === "phone"
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                  : "border-white/10 bg-black/20 text-white/30 hover:border-white/20 hover:text-white"
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wider">SMS / Phone</div>
              <span className="absolute top-1 right-1 rounded bg-amber-500/20 px-1 py-0.5 text-[0.45rem] font-bold uppercase tracking-widest text-amber-400 border border-amber-500/30">
                Soon
              </span>
              <div className="text-[0.6rem] mt-1 opacity-60">Phone recovery placeholder</div>
            </button>
          </div>
        </div>

        {recoveryChannel === "phone" && (
          <p className="text-xs text-amber-400/90 p-3 bg-amber-400/5 border border-amber-400/15 rounded-xl text-left leading-relaxed">
            ⚠️ Phone verification is coming soon. Please select the <strong>Email Address</strong> option above to receive your recovery code.
          </p>
        )}

        {error && <p className="text-sm text-red-400 p-3 bg-red-400/10 border border-red-400/20 rounded-lg text-left">{error}</p>}

        <button
          type="submit"
          disabled={loading || recoveryChannel === "phone"}
          className="mt-4 w-full rounded-full bg-[var(--saffron)] px-5 py-4 text-sm font-bold uppercase tracking-[0.15em] text-black shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
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
