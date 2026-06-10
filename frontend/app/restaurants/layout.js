export const metadata = {
  title: "Kashmiri Restaurants | Find Wazwan Dining in Kashmir",
  description:
    "Discover the best authentic Kashmiri restaurants in Srinagar, Gulmarg, Pahalgam, and Sonamarg. Find curated dining venues serving traditional Wazwan cuisine.",
  alternates: { canonical: "https://wazwanway.com/restaurants" },
  openGraph: {
    title: "Kashmiri Restaurants | Wazwan Way",
    description: "Find the best authentic Kashmiri restaurants across Kashmir — Srinagar, Gulmarg, Pahalgam, and Sonamarg.",
    url: "https://wazwanway.com/restaurants",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Kashmiri Restaurants" }],
  },
  twitter: {
    title: "Kashmiri Restaurants | Wazwan Way",
    description: "Find the best authentic Kashmiri restaurants across Kashmir.",
    images: ["/wazwan-hero.jpg"],
  },
};

export default function RestaurantsLayout({ children }) {
  return children;
}
