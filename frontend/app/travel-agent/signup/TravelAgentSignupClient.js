"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { request, endpoints } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import AgencyPitchPanel from "@/components/AgencyPitchPanel";
import OtpInput from "@/components/OtpInput";
import "./travel-agent-signup.css";

export default function TravelAgentSignupClient() {
  const router = useRouter();
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    ownerName: "",
    agencyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
    whatsappNumber: "",
    city: "",
    yearsInBusiness: "",
    facebookUsername: "",
    instagramUsername: ""
  });

  const [files, setFiles] = useState({
    logo: null,
    coverArt: null
  });

  const [logoDataUrl, setLogoDataUrl] = useState(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Submission State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // OTP State
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles({ ...files, logo: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoDataUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles({ ...files, coverArt: file });
    }
  };

  const validateStep = (step) => {
    setError("");
    if (step === 1) {
      if (!formData.ownerName.trim()) return "Owner Name is required.";
      if (!formData.agencyName.trim()) return "Agency Name is required.";
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Valid Email is required.";
      if (!formData.password || formData.password.length < 6) return "Password must be at least 6 characters.";
      if (formData.password !== formData.confirmPassword) return "Passwords do not match.";
    } else if (step === 2) {
      if (!formData.contactNumber.trim()) return "Contact Number is required.";
      if (!formData.whatsappNumber.trim()) return "WhatsApp Number is required.";
      if (!formData.city.trim()) return "City is required.";
      if (!formData.yearsInBusiness || isNaN(formData.yearsInBusiness)) return "Valid Years in Business is required.";
    }
    return null;
  };

  const goToStep = (step) => {
    if (step > currentStep) {
      // Validate all previous steps
      for (let i = currentStep; i < step; i++) {
        const err = validateStep(i);
        if (err) {
          setError(err);
          return;
        }
      }
    }
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const err = validateStep(3);
    if (err) {
      setError(err);
      return;
    }

    setError("");
    setLoading(true);

    const fd = new FormData();
    fd.append("ownerName", formData.ownerName);
    fd.append("agencyName", formData.agencyName);
    fd.append("email", formData.email);
    fd.append("password", formData.password);
    fd.append("phoneNumber", formData.contactNumber); // Backend expects phoneNumber for the User model
    fd.append("contactNumber", formData.contactNumber);
    fd.append("whatsapp", formData.whatsappNumber);
    fd.append("city", formData.city);
    fd.append("yearsInBusiness", formData.yearsInBusiness);
    if (formData.facebookUsername) fd.append("facebookUsername", formData.facebookUsername);
    if (formData.instagramUsername) fd.append("instagramUsername", formData.instagramUsername);
    
    if (files.logo) fd.append("logo", files.logo);
    if (files.coverArt) fd.append("coverArt", files.coverArt);

    try {
      const data = await request("/travel-agencies/register", {
        method: "POST",
        body: fd
      });
      
      if (data.requiresOtp) {
        setVerifiedEmail(data.email);
        setIsOtpStep(true);
        setSuccess("OTP sent to your email!");
        setResendCooldown(60);
      } else {
        router.push("/travel-agent/login?registered=success");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!otp || otp.length < 6) {
      setError("Please enter a valid 6-digit OTP.");
      setLoading(false);
      return;
    }

    try {
      const payload = { email: verifiedEmail, otp };
      const data = await request(endpoints.verify, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      login(data);
      router.push("/travel-agent/dashboard");
    } catch (err) {
      setError(err.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setSuccess("");
    try {
      await request("/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email: verifiedEmail })
      });
      setSuccess("A new OTP has been sent to your email.");
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || "Failed to resend OTP.");
    }
  };

  return (
    <div className="layout bg-[var(--charcoal-950)] text-[var(--ivory)] font-body min-h-screen">
      <AgencyPitchPanel 
        currentStep={isOtpStep ? 3 : currentStep}
        agencyName={formData.agencyName}
        ownerName={formData.ownerName}
        city={formData.city}
        yearsInBusiness={formData.yearsInBusiness}
        logoDataUrl={logoDataUrl}
      />

      <div className="form-panel">
        <div className="form-wrap">
          {!isOtpStep ? (
            <>
              <div className="form-eyebrow">Register Your Agency</div>
              <h2 className="form-title">Start receiving enquiries</h2>
              <p className="form-desc">Three short steps. Takes about two minutes.</p>

              <div className="stepper">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="step-seg">
                    <div 
                      className="step-seg-fill" 
                      style={{ width: step <= currentStep ? '100%' : '0%' }}
                    ></div>
                  </div>
                ))}
              </div>
              <div className="step-label">
                <span className={currentStep >= 1 ? 'current' : ''}>Basics</span>
                <span className={currentStep >= 2 ? 'current' : ''}>Contact</span>
                <span className={currentStep >= 3 ? 'current' : ''}>Branding</span>
              </div>

              {error && (
                <div className="mt-6 p-4 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/30 text-[var(--error)] text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={currentStep === 3 ? handleRegister : (e) => { e.preventDefault(); goToStep(currentStep + 1); }}>
                
                {/* STEP 1 */}
                <div className={`form-step ${currentStep === 1 ? 'active' : ''}`}>
                  <div className="field-row">
                    <div className="field">
                      <input type="text" placeholder=" " name="ownerName" id="ownerName" autoComplete="name" value={formData.ownerName} onChange={handleChange} data-hasvalue={!!formData.ownerName} />
                      <label htmlFor="ownerName">Owner Name</label>
                      <div className="underline"></div>
                    </div>
                    <div className="field">
                      <input type="text" placeholder=" " name="agencyName" id="agencyName" autoComplete="organization" value={formData.agencyName} onChange={handleChange} data-hasvalue={!!formData.agencyName} />
                      <label htmlFor="agencyName">Agency Name</label>
                      <div className="underline"></div>
                    </div>
                  </div>
                  <div className="field">
                    <input type="email" placeholder=" " name="email" id="email" autoComplete="email" value={formData.email} onChange={handleChange} data-hasvalue={!!formData.email} />
                    <label htmlFor="email">Email Address</label>
                    <div className="underline"></div>
                  </div>
                  <div className="field-row">
                    <div className="field pw">
                      <input type={showPassword ? "text" : "password"} placeholder=" " name="password" id="password" autoComplete="new-password" value={formData.password} onChange={handleChange} data-hasvalue={!!formData.password} />
                      <label htmlFor="password">Password</label>
                      <div className="underline"></div>
                      <button type="button" className={`pw-toggle ${showPassword ? 'active' : ''}`} onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                    </div>
                    <div className="field pw">
                      <input type={showConfirmPassword ? "text" : "password"} placeholder=" " name="confirmPassword" id="confirmPassword" autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} data-hasvalue={!!formData.confirmPassword} />
                      <label htmlFor="confirmPassword">Confirm Password</label>
                      <div className="underline"></div>
                      <button type="button" className={`pw-toggle ${showConfirmPassword ? 'active' : ''}`} onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label="Toggle confirm password">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                    </div>
                  </div>
                  <div className="step-nav">
                    <button type="button" className="btn-continue" onClick={() => goToStep(2)}>Continue →</button>
                  </div>
                </div>

                {/* STEP 2 */}
                <div className={`form-step ${currentStep === 2 ? 'active' : ''}`}>
                  <div className="field-row">
                    <div className="field">
                      <input type="tel" placeholder=" " name="contactNumber" id="contactNumber" autoComplete="tel" value={formData.contactNumber} onChange={handleChange} data-hasvalue={!!formData.contactNumber} />
                      <label htmlFor="contactNumber">Contact Number</label>
                      <div className="underline"></div>
                    </div>
                    <div className="field">
                      <input type="tel" placeholder=" " name="whatsappNumber" id="whatsappNumber" autoComplete="tel" value={formData.whatsappNumber} onChange={handleChange} data-hasvalue={!!formData.whatsappNumber} />
                      <label htmlFor="whatsappNumber">WhatsApp Number</label>
                      <div className="underline"></div>
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <input type="text" placeholder=" " name="city" id="city" autoComplete="address-level2" value={formData.city} onChange={handleChange} data-hasvalue={!!formData.city} />
                      <label htmlFor="city">City</label>
                      <div className="underline"></div>
                    </div>
                    <div className="field">
                      <input type="number" placeholder=" " name="yearsInBusiness" id="yearsInBusiness" min="0" value={formData.yearsInBusiness} onChange={handleChange} data-hasvalue={!!formData.yearsInBusiness} />
                      <label htmlFor="yearsInBusiness">Years in Business</label>
                      <div className="underline"></div>
                    </div>
                  </div>
                  <div className="step-nav">
                    <button type="button" className="btn-back" onClick={() => goToStep(1)}>← Back</button>
                    <button type="button" className="btn-continue" onClick={() => goToStep(3)}>Continue →</button>
                  </div>
                </div>

                {/* STEP 3 */}
                <div className={`form-step ${currentStep === 3 ? 'active' : ''}`}>
                  <div className="social-field">
                    <span className="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.5 9.9v-7H7.9V12h2.6V9.8c0-2.6 1.5-4 3.9-4 1.1 0 2.3.2 2.3.2v2.5h-1.3c-1.3 0-1.7.8-1.7 1.6V12h2.9l-.5 2.9h-2.4v7A10 10 0 0 0 22 12z"/></svg></span>
                    <input type="text" placeholder="Facebook page URL (optional)" name="facebookUsername" value={formData.facebookUsername} onChange={handleChange} />
                  </div>
                  <div className="social-field">
                    <span className="icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg></span>
                    <input type="text" placeholder="Instagram username (optional)" name="instagramUsername" value={formData.instagramUsername} onChange={handleChange} />
                  </div>

                  <div className="file-field">
                    <span className="file-field-label">Agency Logo <span className="field-optional-tag">(optional)</span></span>
                    <label className="file-drop">
                      <span className="file-drop-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 16V4M12 4l-4 4M12 4l4 4"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>
                      </span>
                      <span className="file-drop-text">
                        {files.logo ? <span><b>{files.logo.name}</b> uploaded</span> : <span><b>Upload logo</b> — shows in your preview card</span>}
                      </span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                  </div>

                  <div className="file-field">
                    <span className="file-field-label">Cover Art <span className="field-optional-tag">(optional)</span></span>
                    <label className="file-drop">
                      <span className="file-drop-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 16V4M12 4l-4 4M12 4l4 4"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>
                      </span>
                      <span className="file-drop-text">
                        {files.coverArt ? <span><b>{files.coverArt.name}</b> uploaded</span> : <span><b>Upload cover art</b> — used on your listing banner</span>}
                      </span>
                      <input type="file" accept="image/*" onChange={handleCoverUpload} />
                    </label>
                  </div>

                  <div className="step-nav">
                    <button type="button" className="btn-back" onClick={() => goToStep(2)}>← Back</button>
                    <button type="submit" className="btn-submit" disabled={loading}>
                      {loading ? "Registering..." : "Register Agency"}
                    </button>
                  </div>
                  <div className="reassure-line">No fees to apply now — if approved, our team will reach out about next steps.</div>
                </div>

              </form>

              <div className="signin-line">Already have an account? <a href="/travel-agent/login">Sign In</a></div>
            </>
          ) : (
            <div className="w-full flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <span className="text-[var(--saffron)] text-xs font-bold uppercase tracking-widest mb-4 block">Email Verification</span>
                <h2 className="text-3xl font-display font-medium text-white mb-3">Check your inbox</h2>
                <p className="text-white/60 text-sm leading-relaxed">
                  We've sent a 6-digit verification code to <span className="text-white font-medium">{verifiedEmail}</span>.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/30 text-[var(--error)] text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-8">
                <div className="flex justify-center w-full">
                  <OtpInput length={6} value={otp} onChange={setOtp} />
                </div>
                
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-4 rounded-full bg-[var(--saffron)] text-black font-bold uppercase tracking-widest text-xs transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                >
                  {loading ? "Verifying..." : "Verify & Continue"}
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-white/50">
                Didn't receive the code?{" "}
                <button 
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0}
                  className={`font-medium transition-colors ${resendCooldown > 0 ? 'text-white/30 cursor-not-allowed' : 'text-white hover:text-[var(--saffron)]'}`}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
