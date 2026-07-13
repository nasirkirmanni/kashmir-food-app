"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { endpoints, request } from "@/lib/api";
import Navbar from "@/components/Navbar";
import OtpInput from "@/components/OtpInput";
import AuthSealPanel from "@/components/AuthSealPanel";
import "./login.css";

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const [form, setForm] = useState({ email: "", password: "", rememberMe: false });
  const [showPw, setShowPw] = useState(false);
  
  const [currentView, setCurrentView] = useState("input"); // "input" or "verify"
  const [otp, setOtp] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isResetSuccess, setIsResetSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get("reset") === "success") {
      setIsResetSuccess(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const validateForm = () => {
    const errors = {};
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errors.email = "Valid email is required";
    if (!form.password) errors.password = "Password is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInitialSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsResetSuccess(false); // Clear the toast on new submit attempt
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        email: form.email,
        password: form.password,
        rememberMe: form.rememberMe
      };

      const data = await request(endpoints.login, {
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
      setError(submitError.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = { email: verifiedEmail, otp };

      const data = await request(endpoints.verify, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      login(data);
      router.push("/");
    } catch (submitError) {
      setError(submitError.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError("");
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
      setResendCooldown(30);
    } catch (resendError) {
      setError(resendError.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="layout">
        {/* ================= SEAL PANEL ================= */}
        <AuthSealPanel 
          tagline="Wazwan Way · Est. Kashmir"
          subText="Welcome back. Access your saved routes, itineraries, and Waza AI."
        />

        {/* ================= FORM PANEL ================= */}
        <div className="form-panel">
          <div className="form-wrap">
            {currentView === "input" ? (
              <>
                <div>
                  <div className="form-eyebrow">Welcome Back</div>
                  <h2 className="form-title">Sign in to your account</h2>
                  <p className="form-desc">Continue your Kashmir journey.</p>
                </div>

                {isResetSuccess && (
                  <div className="mt-4 p-3 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
                    Your password has been successfully reset. Please log in with your new password.
                  </div>
                )}

                <form onSubmit={handleInitialSubmit} noValidate>
                  <div className="field">
                    <input 
                      type="email" 
                      id="email" 
                      placeholder=" " 
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => { setForm({ ...form, email: e.target.value }); setFieldErrors({ ...fieldErrors, email: null }); }}
                      className={fieldErrors.email || error ? 'error' : ''}
                    />
                    <label htmlFor="email">Email Address</label>
                    <div className="underline"></div>
                    {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
                  </div>

                  <div className="field pw">
                    <input 
                      type={showPw ? 'text' : 'password'} 
                      id="password" 
                      placeholder=" " 
                      autoComplete="current-password"
                      value={form.password}
                      onChange={(e) => { setForm({ ...form, password: e.target.value }); setFieldErrors({ ...fieldErrors, password: null }); }}
                      className={fieldErrors.password || error ? 'error' : ''}
                    />
                    <label htmlFor="password">Password</label>
                    <div className="underline"></div>
                    <button type="button" className={`pw-toggle ${showPw ? 'active' : ''}`} onClick={() => setShowPw(!showPw)} aria-label="Show password">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
                  </div>

                  <div className="remember-row">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={form.rememberMe}
                        onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                      />
                      <span>Remember me</span>
                    </label>
                    <Link href="/forgot-password" className="forgot-link">Forgot Password?</Link>
                  </div>

                  {error && <div className="field-error" style={{ marginTop: '20px', fontSize: '0.85rem' }}>{error}</div>}

                  <button type="submit" className="btn-signin" disabled={loading}>
                    {loading ? "Please wait..." : "Sign In"}
                  </button>
                </form>

                <div className="signup-line">Don't have an account? <Link href="/signup">Sign Up</Link></div>
              </>
            ) : (
              <div className="otp-view">
                <h2 className="otp-title">Check your email</h2>
                <p className="otp-desc">
                  We sent a 6-digit verification code to your email:<br/>
                  <span className="otp-email">{verifiedEmail}</span>
                  <br/>
                  <button type="button" onClick={() => setCurrentView("input")} className="otp-edit-btn">Edit Email</button>
                </p>

                <form onSubmit={handleVerifySubmit} style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <OtpInput value={otp} onChange={setOtp} />
                  </div>
                  
                  {error && <div className="field-error" style={{ marginTop: '10px', marginBottom: '20px', fontSize: '0.85rem' }}>{error}</div>}

                  <button type="submit" className="btn-signin" disabled={loading}>
                    {loading ? "Verifying..." : "Verify & Login"}
                  </button>

                  <button type="button" className="otp-resend-btn" onClick={handleResendOtp} disabled={resendCooldown > 0 || loading}>
                    {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : "Resend Code via Email"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
