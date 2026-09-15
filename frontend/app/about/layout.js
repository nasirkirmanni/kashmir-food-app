export const metadata = {
  title: "About Us | Our Story",
  description:
    "Wazwan Way is a guide to Kashmir's culinary heritage — authentic dishes, where to eat, recipes and food culture, for travellers and food lovers.",
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
