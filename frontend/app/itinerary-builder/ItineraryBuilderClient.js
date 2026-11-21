"use client";

// Itinerary Builder — route orchestrator.
//
// Flow: intake (StepFlow) -> generate (the API returns the full plan) -> the plan, shown here.
// Nothing is saved: the plan lives as long as this page is open, and the same answers always
// build the same plan. Includes loading, error and empty states. Mobile-first, accessible.

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { request, endpoints } from "@/lib/api";
import StepFlow from "@/components/itineraryBuilder/StepFlow";
import ItineraryArtifact, { ItineraryArtifactSkeleton } from "@/components/itineraryBuilder/ItineraryArtifact";
import { itineraryIntakeSchema, answersToPreferences, initialAnswers } from "@/data/itineraryIntakeSchema";
import { STILL_KASHMIR_HREF } from "@/lib/stillKashmir";
import "./itinerary-builder.css";

const GOLD = "#C8A46A";

export default function ItineraryBuilderClient() {
  const router = useRouter();
  const [phase, setPhase] = useState("intake"); // intake | generating | ready | error
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);

  const generate = useCallback(async (prefs) => {
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
      setPlan(plan);
      setPhase("ready");
      // The questions end well down the page; the plan starts at its top.
      window.scrollTo(0, 0);
    } catch (e) {
      setError(
        e?.message === "empty"
          ? "We couldn't shape a trip from those choices. Try widening your interests, season, or trip length."
          : "Something went wrong building your itinerary. Please try again."
      );
      setPhase("error");
    }
  }, []);

  const handleComplete = (answers) => generate(answersToPreferences(answers));
  // The plan's call to action leads to Still Kashmir, Wazwan Way's own travel agency.
  const onPlanTrip = (e) => {
    e.preventDefault();
    router.push(STILL_KASHMIR_HREF);
  };

  return (
    <div className="ib-shell min-h-[100dvh] bg-[#0A0A0A] text-white px-4 pt-24 pb-32" style={{ paddingBottom: "calc(8rem + env(safe-area-inset-bottom))" }}>
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
            onExit={() => router.push("/itineraries")}
          />
        )}

        {phase === "generating" && (
          <div className="max-w-2xl mx-auto">
            <p
              className="text-center text-[0.7rem] uppercase tracking-[0.2em] text-white/50 mb-6"
              style={{ fontFamily: "var(--font-jetbrains-mono, monospace)" }}
            >
              Crafting your Kashmir itinerary…
            </p>
            <ItineraryArtifactSkeleton />
          </div>
        )}

        {phase === "ready" && plan && (
          <>
            <ItineraryArtifact plan={plan} onPlanTrip={onPlanTrip} planHref={STILL_KASHMIR_HREF} planLabel="Plan with Still Kashmir" />
            <div className="max-w-2xl mx-auto mt-6 flex items-center justify-center gap-4">
              <button onClick={() => router.push("/")} className="min-h-[44px] text-white/40 hover:text-white/70 text-xs underline underline-offset-4">Back to home</button>
              <button onClick={() => setPhase("intake")} className="min-h-[44px] text-white/40 hover:text-white/70 text-xs underline underline-offset-4">Build another</button>
            </div>
          </>
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
    </div>
  );
}
