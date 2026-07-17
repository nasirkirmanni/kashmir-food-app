"use client";

// Owned itinerary view (T6). Fetches the persisted plan (owner-only) and renders
// the shared artifact. The "Plan this trip" CTA (Part 7) hands off to the
// existing tour-partner flow — Phase 2 wires the full booking pipeline.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { request, endpoints } from "@/lib/api";
import ItineraryArtifact, { ItineraryArtifactSkeleton } from "@/components/itineraryBuilder/ItineraryArtifact";

const GOLD = "#C8A46A";

export default function MyItineraryClient({ id }) {
  const router = useRouter();
  const [state, setState] = useState({ status: "loading", plan: null, error: null });

  useEffect(() => {
    let alive = true;
    request(endpoints.itinerary(id))
      .then(({ itinerary }) => {
        if (!alive) return;
        setState({ status: "ready", plan: itinerary.generated, error: null });
      })
      .catch((e) => {
        if (!alive) return;
        const msg = e?.status === 403 || e?.status === 401
          ? "Please sign in to view this itinerary."
          : "We couldn't find that itinerary.";
        setState({ status: "error", plan: null, error: msg });
      });
    return () => { alive = false; };
  }, [id]);

  const onPlanTrip = (e) => {
    e.preventDefault();
    router.push(`/my-itineraries/${id}/book`);
  };

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white px-4 pt-24 pb-32" style={{ paddingBottom: "calc(8rem + env(safe-area-inset-bottom))" }}>
      {state.status === "loading" && (
        <div className="max-w-2xl mx-auto"><ItineraryArtifactSkeleton /></div>
      )}

      {state.status === "error" && (
        <div className="max-w-md mx-auto text-center pt-16" role="alert">
          <p className="text-white/70 text-sm mb-6">{state.error}</p>
          <button
            onClick={() => router.push("/itinerary-builder")}
            className="min-h-[48px] px-7 rounded-full text-xs font-bold uppercase tracking-widest text-black"
            style={{ background: GOLD, fontFamily: "var(--font-jetbrains-mono, monospace)" }}
          >
            Build a new itinerary
          </button>
        </div>
      )}

      {state.status === "ready" && (
        <>
          <ItineraryArtifact plan={state.plan} onPlanTrip={onPlanTrip} planHref={`/my-itineraries/${id}/book`} />
          <div className="max-w-2xl mx-auto mt-6 flex items-center justify-center gap-4">
            <button onClick={() => router.push("/")} className="text-white/40 hover:text-white/70 text-xs underline underline-offset-4">Back to home</button>
            <button onClick={() => router.push("/itinerary-builder")} className="text-white/40 hover:text-white/70 text-xs underline underline-offset-4">Build another</button>
          </div>
        </>
      )}
    </div>
  );
}
