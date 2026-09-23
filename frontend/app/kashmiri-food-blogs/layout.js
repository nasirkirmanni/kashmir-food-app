export const metadata = {
  title: {
    default: "Kashmiri Food Blogs | Deep Guides to Kashmir's Dishes",
    template: "%s | Wazwan Way",
  },
  description:
    "Comprehensive guides to every important Kashmiri dish — from the royal Wazwan feast to everyday Valley food. History, ingredients, preparation, and where to eat.",
  alternates: { canonical: "https://wazwanway.com/kashmiri-food-blogs" },
  openGraph: {
    title: "Kashmiri Food Blogs | Deep Guides to Kashmir's Dishes",
    description:
      "Comprehensive guides to every important Kashmiri dish — from the royal Wazwan feast to everyday Valley food.",
    url: "https://wazwanway.com/kashmiri-food-blogs",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way — Kashmiri Food Blogs" }],
  },
};

export default function KashmirifoodBlogsLayout({ children }) {
  return children;
}
