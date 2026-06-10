export const metadata = {
  title: "Kashmiri Dishes | Explore Wazwan Cuisine",
  description:
    "Explore signature Kashmiri dishes from the royal Wazwan table — Rogan Josh, Gushtaba, Rista, Tabak Maaz and more. Discover history, spice levels, and where to taste them.",
  alternates: { canonical: "https://wazwanway.com/dishes" },
  openGraph: {
    title: "Kashmiri Dishes | Explore Wazwan Cuisine | Wazwan Way",
    description: "Explore the full menu of authentic Kashmiri Wazwan dishes with history, spice levels, and restaurant recommendations.",
    url: "https://wazwanway.com/dishes",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Kashmiri Wazwan Dishes" }],
  },
  twitter: {
    title: "Kashmiri Dishes | Wazwan Way",
    description: "Explore authentic Kashmiri Wazwan dishes — Rogan Josh, Gushtaba, Rista and more.",
    images: ["/wazwan-hero.jpg"],
  },
};

export default function DishesLayout({ children }) {
  return children;
}
