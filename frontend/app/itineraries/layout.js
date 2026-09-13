export const metadata = {
  // An object title passes the brand template down to itinerary pages; a plain
  // string would reset it for everything below this layout. `default` is the hub's title.
  title: {
    default: "Kashmir Itineraries | Curated Trip Plans",
    template: "%s | Wazwan Way",
  },
  description:
    "Curated Kashmir itineraries combining destinations, food stops, and scenic drives — ready-made plans for every trip length.",
  alternates: { canonical: "https://wazwanway.com/itineraries" },
  openGraph: {
    title: "Kashmir Itineraries | Curated Trip Plans",
    description: "Curated Kashmir itineraries combining destinations, food stops, and scenic drives — ready-made plans for every trip length.",
    url: "https://wazwanway.com/itineraries",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way" }],
  },
};

export default function ItinerariesLayout({ children }) {
  return children;
}
