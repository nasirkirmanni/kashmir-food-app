export const metadata = {
  title: "About Us | The Story Behind Wazwan Way",
  description:
    "Wazwan Way is a premium guide to Kashmir's culinary heritage — authentic dishes, trusted restaurants, recipes, and food culture, curated for travellers and food lovers.",
  alternates: { canonical: "https://wazwanway.com/about" },
  openGraph: {
    title: "About Us | Wazwan Way",
    description: "The story behind Wazwan Way — a premium guide to Kashmir's culinary heritage.",
    url: "https://wazwanway.com/about",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way" }],
  },
};

export default function AboutLayout({ children }) {
  return children;
}
