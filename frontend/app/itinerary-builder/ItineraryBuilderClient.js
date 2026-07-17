"use client";

// Itinerary Builder — route orchestrator (T5 + T6)
//
// Flow: intake (StepFlow) -> generate (full plan, guest-safe) -> gate on VIEW
// (guests must sign in to see the result; generation already happened) -> claim
// (regenerate-from-preferences + persist) -> owned URL /my-itineraries/[id].
// Includes loading, error, and empty states. Mobile-first, premium, accessible.

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { request, endpoints } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import StepFlow from "@/components/itineraryBuilder/StepFlow";
import { ItineraryArtifactSkeleton } from "@/components/itineraryBuilder/ItineraryArtifact";
import AuthRequiredModal from "@/components/AuthRequiredModal";
import { itineraryIntakeSchema, answersToPreferences, initialAnswers } from "@/data/itineraryIntakeSchema";
import "./itinerary-builder.css";

const GOLD = "#C8A46A";
const STORAGE_KEY = "wazwan_itinerary_prefs";

export default function ItineraryBuilderClient() {
  const router = useRouter();
  const { user } = useAuth();
  const [phase, setPhase] = useState("intake"); // intake | generating | ready | claiming | error
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const prefsRef = useRef(null);

  const claim = useCallback(
    async (prefs) => {
      setPhase("claiming");
      try {
        const { itinerary } = await request(endpoints.claimItinerary, {
          method: "POST",
          body: JSON.stringify(prefs || prefsRef.current),
        });
        try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
        router.push(`/my-itineraries/${itinerary._id}`);
      } catch (e) {
        setError("We couldn't save your itinerary. Please try again.");
        setPhase("error");
      }
    },
    [router]
  );

  const generate = useCallback(
    async (prefs) => {
      setPhase("generating");
      setError(null);
      try {
        const { plan } = await request(endpoints.generateItinerary, {
          method: "POST",
          body: JSON.stringify(prefs),
        });
        if (!plan || !Array.isArray(plan.days) || plan.days.length === 0) {
          throw new Error("empty");
        }
        prefsRef.current = prefs;
        try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch {}
        setPlan(plan);
        // Generation is complete regardless of auth. Logged-in users go straight
        // to claim; guests see a gated "ready" teaser (view requires sign-in).
        if (user) claim(prefs);
        else setPhase("ready");
      } catch (e) {
        setError(
          e?.message === "empty"
            ? "We couldn't shape a trip from those choices. Try widening your interests, season, or trip length."
            : "Something went wrong building your itinerary. Please try again."
        );
        setPhase("error");
      }
    },
    [user, claim]
  );

  const handleComplete = (answers) => generate(answersToPreferences(answers));
  const onAuthSuccess = () => { setShowAuth(false); claim(prefsRef.current); };

  return (
    <div className="ib-shell min-h-[100dvh] bg-[#0A0A0A] text-white px-4 pt-24 pb-32">
      <div className="ib-ambient" aria-hidden="true" />

      <div className="relative z-10">
        {/* Wordmark */}
        <div className="max-w-xl mx-auto mb-6 flex items-center justify-between">
          <span
            className="text-[0.62rem] uppercase tracking-[0.25em] text-white/50"
            style={{ fontFamily: "var(--font-jetbrains-mono, monospace)" }}
          >
            Wazwan Way · Itinerary Builder
          </span>
        </div>

        {phase === "intake" && (
          <StepFlow
            schema={itineraryIntakeSchema}
            initial={initialAnswers()}
            onComplete={handleComplete}
            onExit={() => router.push("/plan")}
          />
        )}

        {(phase === "generating" || phase === "claiming") && (
          <div className="max-w-2xl mx-auto">
            <p
              className="text-center text-[0.7rem] uppercase tracking-[0.2em] text-white/50 mb-6"
              style={{ fontFamily: "var(--font-jetbrains-mono, monospace)" }}
            >
              {phase === "claiming" ? "Saving your itinerary…" : "Crafting your Kashmir itinerary…"}
            </p>
            <ItineraryArtifactSkeleton />
          </div>
        )}

        {phase === "ready" && plan && (
          <GateTeaser plan={plan} onView={() => setShowAuth(true)} onRestart={() => setPhase("intake")} />
        )}

        {phase === "error" && (
          <div className="max-w-md mx-auto text-center pt-10" role="alert">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full border border-white/15 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6" className="w-6 h-6">
                <path d="M12 9v4m0 4h.01M10.3 3.9l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-white/70 text-sm mb-6">{error}</p>
            <button
              onClick={() => setPhase("intake")}
              className="min-h-[48px] px-7 rounded-full text-xs font-bold uppercase tracking-widest text-black"
              style={{ background: GOLD, fontFamily: "var(--font-jetbrains-mono, monospace)" }}
            >
              Adjust my trip
            </button>
          </div>
        )}
      </div>

      {showAuth && (
        <AuthRequiredModal
          onClose={() => setShowAuth(false)}
          onSuccess={onAuthSuccess}
          titleLine1="Your itinerary"
          titleLine2="is ready"
          message={"Create a free account (or sign in) to view and save your personalized Kashmir itinerary."}
        />
      )}
    </div>
  );
}

// Locked teaser shown to guests: reveals the shape of the plan (day count,
// regions, cost) but gates the day-by-day detail behind sign-in.
function GateTeaser({ plan, onView, onRestart }) {
  const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
  return (
    <div className="max-w-md mx-auto text-center pt-4">
      <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center" style={{ background: "rgba(200,164,106,0.12)", border: `1px solid ${GOLD}55` }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" className="w-7 h-7">
          <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      </div>
      <p className="text-[0.62rem] uppercase tracking-[0.2em] mb-2" style={{ color: GOLD, fontFamily: "var(--font-jetbrains-mono, monospace)" }}>
        Ready to view
      </p>
      <h1 className="text-2xl sm:text-3xl font-medium leading-tight mb-3" style={{ fontFamily: "var(--font-bodoni, serif)" }}>
        {plan.title}
      </h1>

      <div className="flex items-center justify-center gap-2 flex-wrap mb-6 text-[0.62rem] uppercase tracking-wider text-white/55">
        <span className="bg-white/[0.05] border border-white/10 rounded-full px-2.5 py-1">{plan.lengthDays} days</span>
        <span className="bg-white/[0.05] border border-white/10 rounded-full px-2.5 py-1">{plan.regionsCovered?.join(" · ")}</span>
        {plan.estimatedCost?.total ? (
          <span className="bg-white/[0.05] border border-white/10 rounded-full px-2.5 py-1">~{inr.format(plan.estimatedCost.total)}</span>
        ) : null}
      </div>

      <button
        onClick={onView}
        className="w-full min-h-[52px] rounded-full text-black font-bold text-sm uppercase tracking-widest mb-3"
        style={{ background: GOLD, fontFamily: "var(--font-jetbrains-mono, monospace)", boxShadow: "0 10px 40px rgba(200,164,106,0.3)" }}
      >
        View my itinerary
      </button>
      <button onClick={onRestart} className="text-white/40 hover:text-white/70 text-xs underline underline-offset-4 transition-colors">
        Start over
      </button>
    </div>
  );
}
