import BookingFlowClient from "./BookingFlowClient";

export const metadata = {
  title: "Plan Your Trip | Wazwan Way",
  robots: { index: false, follow: false }, // private booking flow
};

export default function BookItineraryPage({ params }) {
  return <BookingFlowClient itineraryId={params.id} />;
}
