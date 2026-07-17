import ItineraryBuilderClient from "./ItineraryBuilderClient";

export const metadata = {
  title: "Itinerary Builder | Wazwan Way",
  description:
    "Build a personalized Kashmir itinerary — destinations, Wazwan, stays, transport, and day-by-day timings tuned to your travel style, season, and budget.",
  // Personalized tool: not for indexing. Canonical itineraries (Phase 1.5) are
  // the indexable surface.
  robots: { index: false, follow: false },
};

export default function ItineraryBuilderPage() {
  return <ItineraryBuilderClient />;
}
