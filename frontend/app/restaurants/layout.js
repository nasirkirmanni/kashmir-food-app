export const metadata = {
  // An object title passes the brand template down to restaurant pages; a plain
  // string would reset it for everything below this layout. `default` is the hub's title.
  title: {
    default: "Kashmiri Restaurants | Wazwan Dining in Kashmir",
    template: "%s | Wazwan Way",
  },
  description:
    "Kashmiri restaurants in Srinagar that serve Wazwan, with where to find them and what to order, plus our guide to eating in the city.",
  alternates: { canonical: "https://wazwanway.com/restaurants" },
  openGraph: {
    title: "Kashmiri Restaurants | Wazwan Way",
    description: "Kashmiri restaurants in Srinagar that serve Wazwan, and what to order at each.",
    url: "https://wazwanway.com/restaurants",
    images: [{ url: "/wazwan-hero.jpg", width: 1024, height: 1024, alt: "Kashmiri Restaurants" }],
  },
  twitter: {
    title: "Kashmiri Restaurants | Wazwan Way",
    description: "Kashmiri restaurants in Srinagar that serve Wazwan.",
    images: ["/wazwan-hero.jpg"],
  },
};

export default function RestaurantsLayout({ children }) {
  return children;
}
