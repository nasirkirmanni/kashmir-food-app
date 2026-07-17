"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { endpoints, request } from "@/lib/api";
import Navbar from "@/components/Navbar";
import OtpInput from "@/components/OtpInput";
import AuthSealPanel from "@/components/AuthSealPanel";
import "./signup.css";



export default function SignupClient() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "", terms: false });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [currentView, setCurrentView] = useState("input"); // "input" or "verify"
  const [otp, setOtp] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});



  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Full name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errors.email = "Valid email is required";

    // Phone is required (it's the account's unique identifier server-side).
    const phoneDigits = form.phone.replace(/\s+/g, "");
    if (!phoneDigits) {
      errors.phone = "Phone number is required";
    } else if (phoneDigits.length < 8) {
      errors.phone = "Enter a valid phone number";
    }

    // Password must satisfy the backend policy: 8+ chars with an uppercase,
    // lowercase, number, and special character (@$!%*?&). Keep this in sync
    // with backend signupSchema so users aren't rejected after submitting.
    const pw = form.password;
    if (pw.length < 8) {
      errors.password = "Must be at least 8 characters";
    } else if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/\d/.test(pw) || !/[@$!%*?&]/.test(pw)) {
      errors.password = "Add an uppercase, lowercase, number, and special character (@$!%*?&)";
    }

    if (form.password !== form.confirm) errors.confirm = "Passwords do not match";
    if (!form.terms) errors.terms = "You must agree to the Terms and Privacy Policy";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInitialSubmit = async (event) => {
    event.preventDefault();
    setError("");
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phoneNumber: form.phone,
        password: form.password
      };

      const data = await request(endpoints.signup, {
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
      setError(submitError.message || "An error occurred during signup.");
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
        <AuthSealPanel />

        {/* ================= FORM PANEL ================= */}
        <div className="form-panel">
          <div className="form-wrap">
            {currentView === "input" ? (
              <>
                <div>
                  <div className="form-eyebrow">Get Started</div>
                  <h2 className="form-title">Create your account</h2>
                  <p className="form-desc">Join Wazwan Way to save favourites, build itineraries, and discover authentic Kashmir.</p>
                </div>

                <form onSubmit={handleInitialSubmit} noValidate>
                  <div className="field">
                    <input 
                      type="text" 
                      id="fullname" 
                      placeholder=" " 
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => { setForm({ ...form, name: e.target.value }); setFieldErrors({ ...fieldErrors, name: null }); }}
                      className={fieldErrors.name ? 'error' : ''}
                    />
                    <label htmlFor="fullname">Full Name</label>
                    <div className="underline"></div>
                    {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
                  </div>

                  <div className="field">
                    <input 
                      type="email" 
                      id="email" 
                      placeholder=" " 
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => { setForm({ ...form, email: e.target.value }); setFieldErrors({ ...fieldErrors, email: null }); }}
                      className={fieldErrors.email ? 'error' : ''}
                    />
                    <label htmlFor="email">Email Address</label>
                    <div className="underline"></div>
                    {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
                  </div>

                  <div className="field">
                    <input 
                      type="tel" 
                      id="phone" 
                      placeholder=" " 
                      autoComplete="tel"
                      inputMode="tel"
                      value={form.phone}
                      onChange={(e) => { setForm({ ...form, phone: e.target.value }); setFieldErrors({ ...fieldErrors, phone: null }); }}
                      className={fieldErrors.phone ? 'error' : ''}
                    />
                    <label htmlFor="phone">Phone Number</label>
                    <div className="underline"></div>
                    {fieldErrors.phone && <div className="field-error">{fieldErrors.phone}</div>}
                  </div>

                  <div className="field pw">
                    <input 
                      type={showPw ? 'text' : 'password'} 
                      id="password" 
                      placeholder=" " 
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) => { setForm({ ...form, password: e.target.value }); setFieldErrors({ ...fieldErrors, password: null }); }}
                      className={fieldErrors.password ? 'error' : ''}
                    />
                    <label htmlFor="password">Password</label>
                    <div className="underline"></div>
                    <button type="button" className={`pw-toggle ${showPw ? 'active' : ''}`} onClick={() => setShowPw(!showPw)} aria-label="Show password">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    {fieldErrors.password 
                      ? <div className="field-error">{fieldErrors.password}</div> 
                      : <div className="field-hint">8+ chars with uppercase, lowercase, number &amp; special (@$!%*?&amp;).</div>}
                  </div>

                  <div className="field pw" style={{ marginTop: '26px' }}>
                    <input 
                      type={showConfirm ? 'text' : 'password'} 
                      id="confirm" 
                      placeholder=" " 
                      autoComplete="new-password"
                      value={form.confirm}
                      onChange={(e) => { setForm({ ...form, confirm: e.target.value }); setFieldErrors({ ...fieldErrors, confirm: null }); }}
                      className={fieldErrors.confirm ? 'error' : ''}
                    />
                    <label htmlFor="confirm">Confirm Password</label>
                    <div className="underline"></div>
                    <button type="button" className={`pw-toggle ${showConfirm ? 'active' : ''}`} onClick={() => setShowConfirm(!showConfirm)} aria-label="Show password">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    {fieldErrors.confirm && <div className="field-error">{fieldErrors.confirm}</div>}
                  </div>

                  <label className="terms-row">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      checked={form.terms}
                      onChange={(e) => { setForm({ ...form, terms: e.target.checked }); setFieldErrors({ ...fieldErrors, terms: null }); }}
                    />
                    <span>I agree to the <Link href="/terms">Terms and Conditions</Link> and <Link href="/privacy">Privacy Policy</Link>.</span>
                  </label>
                  {fieldErrors.terms && <div className="field-error" style={{ marginTop: '5px' }}>{fieldErrors.terms}</div>}

                  {error && <div className="field-error" style={{ marginTop: '20px', fontSize: '0.85rem' }}>{error}</div>}

                  <button type="submit" className="btn-create" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>
                </form>

                <div className="signin-line">Already have an account? <Link href="/login">Sign In</Link></div>

                <div className="divider">Or</div>
                <div className="agency-line">Own a travel agency? <Link href="/travel-agent/signup">Register as a Travel Agency →</Link></div>
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

                  <button type="submit" className="btn-create" disabled={loading}>
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
