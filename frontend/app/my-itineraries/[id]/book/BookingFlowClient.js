"use client";

// Booking flow (Phase 2 — Parts 8–11): traveler details -> operator selection
// -> review + consent -> confirmation. Mobile-first, premium, accessible.
// Feeds the existing TravelAgencyInquiry pipeline via POST /itineraries/:id/book.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { request, endpoints } from "@/lib/api";

const GOLD = "#C8A46A";
const inr = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const STEPS = ["Your details", "Choose an operator", "Review", "Confirmed"];

const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export default function BookingFlowClient({ itineraryId }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [itinerary, setItinerary] = useState(null);
  const [operators, setOperators] = useState(null); // null = loading
  const [selectedOp, setSelectedOp] = useState(null);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [traveler, setTraveler] = useState({
    name: "", email: "", phone: "", whatsapp: "",
    country: "", state: "", city: "", arrivalDate: "",
    groupSize: { adults: 2, children: 0, seniors: 0 }, specialRequests: "",
  });

  useEffect(() => {
    let alive = true;
    request(endpoints.itinerary(itineraryId))
      .then(({ itinerary }) => {
        if (!alive) return;
        setItinerary(itinerary);
        const t = itinerary?.generated?.travelers || itinerary?.preferences?.travelers;
        if (t) setTraveler((prev) => ({ ...prev, groupSize: { adults: t.adults || 2, children: t.children || 0, seniors: t.seniors || 0 } }));
      })
      .catch(() => {});
    request(endpoints.operators)
      .then(({ operators }) => alive && setOperators(operators || []))
      .catch(() => alive && setOperators([]));
    return () => { alive = false; };
  }, [itineraryId]);

  const estimatedPrice = itinerary?.generated?.estimatedCost?.total || null;
  const detailsValid = traveler.name.trim() && emailOk(traveler.email) && traveler.phone.trim().length >= 5;

  const set = (k, v) => setTraveler((p) => ({ ...p, [k]: v }));
  const setGroup = (k, v) => setTraveler((p) => ({ ...p, groupSize: { ...p.groupSize, [k]: v } }));

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await request(endpoints.bookItinerary(itineraryId), {
        method: "POST",
        body: JSON.stringify({ agencyId: selectedOp._id, traveler, consent: true }),
      });
      setResult(res);
      setStep(3);
    } catch (e) {
      setError(e?.message || "We couldn't submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white px-4 pt-24 pb-32" style={{ paddingBottom: "calc(8rem + env(safe-area-inset-bottom))" }}>
      <div className="max-w-xl mx-auto">
        {/* Progress */}
        {step < 3 && (
          <div className="mb-6" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={3} aria-label={`Step ${step + 1} of 3`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD, fontFamily: "var(--font-jetbrains-mono, monospace)" }}>
                Step {step + 1} of 3 · {STEPS[step]}
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ background: GOLD, width: `${((step + 1) / 3) * 100}%` }} />
            </div>
          </div>
        )}

        {/* Step 0 — traveler details (Part 8) */}
        {step === 0 && (
          <div>
            <h1 className="text-2xl sm:text-3xl font-medium leading-tight mb-1" style={{ fontFamily: "var(--font-bodoni, serif)" }}>Where should we send your plan?</h1>
            <p className="text-white/55 text-sm mb-6">An operator will reach out with a tailored quote. Your details are shared only with the operator you choose.</p>
            <div className="grid grid-cols-1 gap-3">
              <Field label="Full name" required value={traveler.name} onChange={(v) => set("name", v)} autoComplete="name" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Email" required type="email" value={traveler.email} onChange={(v) => set("email", v)} autoComplete="email" inputMode="email" />
                <Field label="Mobile" required type="tel" value={traveler.phone} onChange={(v) => set("phone", v)} autoComplete="tel" inputMode="tel" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="WhatsApp (optional)" type="tel" value={traveler.whatsapp} onChange={(v) => set("whatsapp", v)} inputMode="tel" />
                <Field label="Arrival date (optional)" type="date" value={traveler.arrivalDate} onChange={(v) => set("arrivalDate", v)} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Country" value={traveler.country} onChange={(v) => set("country", v)} autoComplete="country-name" />
                <Field label="State" value={traveler.state} onChange={(v) => set("state", v)} />
                <Field label="City" value={traveler.city} onChange={(v) => set("city", v)} />
              </div>
              {/* group size */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-[0.6rem] uppercase tracking-widest text-white/50 mb-2" style={{ fontFamily: "var(--font-jetbrains-mono, monospace)" }}>Travellers</div>
                <div className="flex gap-4">
                  {["adults", "children", "seniors"].map((k) => (
                    <label key={k} className="flex-1">
                      <span className="text-[0.62rem] text-white/50 capitalize">{k}</span>
                      <input type="number" min={0} max={30} value={traveler.groupSize[k]} onChange={(e) => setGroup(k, Math.max(0, parseInt(e.target.value || "0", 10)))}
                        className="mt-1 w-full min-h-[44px] rounded-lg border border-white/10 bg-black/30 px-3 text-white text-sm [color-scheme:dark]" />
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-[0.62rem] uppercase tracking-widest text-white/50" style={{ fontFamily: "var(--font-jetbrains-mono, monospace)" }}>Special requests (optional)</span>
                <textarea rows={3} maxLength={1000} value={traveler.specialRequests} onChange={(e) => set("specialRequests", e.target.value)}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-white text-sm resize-none" placeholder="Dietary needs, accessibility, must-sees…" />
              </label>
            </div>
            <Nav onBack={() => router.push(`/my-itineraries/${itineraryId}`)} backLabel="← Itinerary" onNext={() => setStep(1)} nextDisabled={!detailsValid} nextLabel="Continue →" />
          </div>
        )}

        {/* Step 1 — operator selection (Part 9) */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl sm:text-3xl font-medium leading-tight mb-1" style={{ fontFamily: "var(--font-bodoni, serif)" }}>Choose a local operator</h1>
            <p className="text-white/55 text-sm mb-6">Vetted Kashmir travel operators who can arrange your trip.</p>
            {operators === null ? (
              <div className="space-y-3">{[0, 1].map((i) => <div key={i} className="h-28 rounded-2xl bg-white/[0.04] animate-pulse" />)}</div>
            ) : operators.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-white/60 text-sm">
                We're onboarding vetted operators right now. Submit your details and our team will match you with one directly.
              </div>
            ) : (
              <div className="space-y-3">
                {operators.map((op) => {
                  const active = selectedOp?._id === op._id;
                  return (
                    <button key={op._id} type="button" onClick={() => setSelectedOp(op)} aria-pressed={active}
                      className={`w-full text-left rounded-2xl border p-4 transition-all ${active ? "border-transparent" : "border-white/10 bg-white/[0.03] hover:border-white/25"}`}
                      style={active ? { background: "rgba(200,164,106,0.1)", borderColor: GOLD } : undefined}>
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white/[0.06] border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                          {op.thumbnailUrl ? <img src={op.thumbnailUrl} alt="" className="w-full h-full object-cover" /> : <span className="text-lg" style={{ color: GOLD, fontFamily: "var(--font-bodoni,serif)" }}>{op.agencyName?.[0]}</span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-white truncate" style={{ fontFamily: "var(--font-bodoni, serif)" }}>{op.agencyName}</span>
                            <span className="text-[0.7rem] shrink-0" style={{ color: GOLD }}>★ {op.rating?.toFixed(1)}{op.reviewCount ? ` (${op.reviewCount})` : ""}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1 text-[0.58rem] uppercase tracking-wider text-white/45">
                            {op.yearsInBusiness ? <span className="rounded bg-white/[0.06] px-1.5 py-0.5">{op.yearsInBusiness}+ yrs</span> : null}
                            {(op.languages || []).slice(0, 3).map((l) => <span key={l} className="rounded bg-white/[0.06] px-1.5 py-0.5">{l}</span>)}
                            {(op.specializations || op.qualities || []).slice(0, 2).map((s) => <span key={s} className="rounded bg-white/[0.06] px-1.5 py-0.5">{s}</span>)}
                          </div>
                          {op.description || op.whyChooseUs ? <p className="text-[0.72rem] text-white/55 mt-2 line-clamp-2">{op.description || op.whyChooseUs}</p> : null}
                          {op.startingPrice ? <div className="text-[0.7rem] text-white/70 mt-2">From <span style={{ color: GOLD }}>{inr(op.startingPrice)}</span>/person</div> : null}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            <Nav onBack={() => setStep(0)} onNext={() => setStep(2)} nextDisabled={!selectedOp} nextLabel="Review →" />
          </div>
        )}

        {/* Step 2 — review + consent (Part 10) */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl sm:text-3xl font-medium leading-tight mb-5" style={{ fontFamily: "var(--font-bodoni, serif)" }}>Review your request</h1>
            <div className="space-y-3">
              <ReviewCard title="Itinerary">
                <div className="text-sm text-white">{itinerary?.title || "Your itinerary"}</div>
                <div className="text-[0.72rem] text-white/50">{itinerary?.generated?.lengthDays} days · {itinerary?.generated?.regionsCovered?.join(" · ")}</div>
              </ReviewCard>
              <ReviewCard title="Operator">
                <div className="text-sm text-white">{selectedOp?.agencyName}</div>
                <div className="text-[0.72rem] text-white/50">★ {selectedOp?.rating?.toFixed(1)}{selectedOp?.reviewCount ? ` (${selectedOp.reviewCount} reviews)` : ""}</div>
              </ReviewCard>
              <ReviewCard title="Traveller">
                <div className="text-sm text-white">{traveler.name}</div>
                <div className="text-[0.72rem] text-white/50">{traveler.email} · {traveler.phone}</div>
                <div className="text-[0.72rem] text-white/50">{traveler.groupSize.adults} adults{traveler.groupSize.children ? `, ${traveler.groupSize.children} children` : ""}{traveler.groupSize.seniors ? `, ${traveler.groupSize.seniors} seniors` : ""}{traveler.arrivalDate ? ` · arriving ${traveler.arrivalDate}` : ""}</div>
              </ReviewCard>
              {estimatedPrice ? (
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="text-[0.62rem] uppercase tracking-widest text-white/50" style={{ fontFamily: "var(--font-jetbrains-mono, monospace)" }}>Estimated price</span>
                  <span className="text-xl font-medium" style={{ color: GOLD, fontFamily: "var(--font-bodoni, serif)" }}>{inr(estimatedPrice)}</span>
                </div>
              ) : null}
              <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 cursor-pointer">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0" style={{ accentColor: GOLD }} />
                <span className="text-[0.78rem] text-white/70">I agree to share my contact details with <strong className="text-white">{selectedOp?.agencyName}</strong> so they can send me a quote. See our <a href="/privacy" className="underline" style={{ color: GOLD }}>privacy policy</a>.</span>
              </label>
              {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
            </div>
            <Nav onBack={() => setStep(1)} onNext={submit} nextDisabled={!consent || submitting} nextLabel={submitting ? "Sending…" : `Confirm with ${selectedOp?.agencyName?.split(" ")[0] || "operator"} →`} />
          </div>
        )}

        {/* Step 3 — confirmation (Part 11) */}
        {step === 3 && result && (
          <div className="text-center pt-6">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center" style={{ background: "rgba(200,164,106,0.12)", border: `1px solid ${GOLD}55` }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" className="w-7 h-7"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium leading-tight mb-2" style={{ fontFamily: "var(--font-bodoni, serif)" }}>Request sent!</h1>
            <p className="text-white/60 text-sm mb-5 max-w-sm mx-auto">
              <strong className="text-white">{result.operator?.name}</strong> has your itinerary and details, and will reach out {result.expectedResponseTime}.
            </p>
            <div className="inline-flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-4 mb-6">
              <span className="text-[0.58rem] uppercase tracking-widest text-white/45" style={{ fontFamily: "var(--font-jetbrains-mono, monospace)" }}>Reference</span>
              <span className="text-xl font-medium tracking-wider" style={{ color: GOLD, fontFamily: "var(--font-jetbrains-mono, monospace)" }}>{result.referenceId}</span>
            </div>
            <div className="text-left max-w-sm mx-auto mb-8">
              <div className="text-[0.62rem] uppercase tracking-widest text-white/45 mb-2" style={{ fontFamily: "var(--font-jetbrains-mono, monospace)" }}>What's next</div>
              <ul className="space-y-1.5 text-[0.8rem] text-white/65">
                <li>• The operator reviews your plan and prepares a quote.</li>
                <li>• They'll contact you by phone/email {result.expectedResponseTime}.</li>
                <li>• You finalise dates, stays and price directly with them.</li>
              </ul>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => router.push("/")} className="min-h-[48px] px-6 rounded-full text-xs font-semibold uppercase tracking-widest text-white/70 border border-white/15 hover:border-white/30" style={{ fontFamily: "var(--font-jetbrains-mono, monospace)" }}>Back to home</button>
              <button onClick={() => router.push(`/my-itineraries/${itineraryId}`)} className="min-h-[48px] px-6 rounded-full text-xs font-bold uppercase tracking-widest text-black" style={{ background: GOLD, fontFamily: "var(--font-jetbrains-mono, monospace)" }}>View my itinerary</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, required, value, onChange, type = "text", ...rest }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[0.62rem] uppercase tracking-widest text-white/50" style={{ fontFamily: "var(--font-jetbrains-mono, monospace)" }}>
        {label}{required ? <span style={{ color: GOLD }}> *</span> : null}
      </span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="min-h-[44px] rounded-xl border border-white/10 bg-white/[0.03] px-3 text-white text-sm [color-scheme:dark]" {...rest} />
    </label>
  );
}

function ReviewCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="text-[0.58rem] uppercase tracking-widest text-white/45 mb-1.5" style={{ fontFamily: "var(--font-jetbrains-mono, monospace)" }}>{title}</div>
      {children}
    </div>
  );
}

function Nav({ onBack, onNext, nextDisabled, nextLabel, backLabel = "← Back" }) {
  return (
    <div className="flex items-center justify-between gap-3 mt-8 pt-5 border-t border-white/10">
      <button type="button" onClick={onBack} className="min-h-[44px] px-5 rounded-full text-xs font-semibold uppercase tracking-widest text-white/70 border border-white/15 hover:border-white/30" style={{ fontFamily: "var(--font-jetbrains-mono, monospace)" }}>{backLabel}</button>
      <button type="button" onClick={onNext} disabled={nextDisabled} className="min-h-[44px] px-6 rounded-full text-xs font-bold uppercase tracking-widest text-black disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: GOLD, fontFamily: "var(--font-jetbrains-mono, monospace)" }}>{nextLabel}</button>
    </div>
  );
}
