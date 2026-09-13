import MyItineraryClient from "./MyItineraryClient";

export const metadata = {
  title: "My Itinerary",
  // Personalized/owned itineraries are private — never indexed.
  robots: { index: false, follow: false },
};

export default function MyItineraryPage({ params }) {
  return <MyItineraryClient id={params.id} />;
}
