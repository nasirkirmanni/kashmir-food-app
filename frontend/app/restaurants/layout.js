import { RESTAURANTS } from "@/data/srinagarRestaurants";

const PLACES = RESTAURANTS.length;
// The site's root template adds " | Wazwan Way" to this one too.
const TITLE = `Srinagar Wazwan Restaurants: ${PLACES} Places, Sourced`;
const DESCRIPTION = `${PLACES} places in Srinagar with evidence that they serve Wazwan: addresses, phones, hours, dishes and dated prices, every fact sourced. Checked 10 Nov 2026.`;

export const metadata = {
  // An object title passes the brand template down to restaurant pages; a plain
  // string would reset it for everything below this layout. `default` is the hub's title.
  title: {
    default: TITLE,
    template: "%s | Wazwan Way",
  },
  description: DESCRIPTION,
  alternates: { canonical: "https://wazwanway.com/restaurants" },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: "https://wazwanway.com/restaurants",
    siteName: "Wazwan Way",
    images: [{ url: "/wazwan-hero.jpg", width: 1024, height: 1024, alt: "Wazwan Way" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/wazwan-hero.jpg"],
  },
};

export default function RestaurantsLayout({ children }) {
  return children;
}
