import ItineraryBuilderClient from "./ItineraryBuilderClient";

export const metadata = {
  title: "Kashmir Itinerary Builder",
  description:
    "Build a personalized Kashmir itinerary — destinations, Wazwan, stays, transport, and day-by-day timings tuned to your travel style, season, and budget.",
  // Personalized tool: not for indexing. Canonical itineraries (Phase 1.5) are
  // the indexable surface.
  robots: { index: false, follow: false },
  alternates: { canonical: "https://wazwanway.com/itinerary-builder" },
  openGraph: {
    type: "website",
    url: "https://wazwanway.com/itinerary-builder",
    siteName: "Wazwan Way",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way" }],
  },
};

export default function ItineraryBuilderPage() {
  return <ItineraryBuilderClient />;
}
