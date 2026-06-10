export const metadata = {
  title: "History of Wazwan | Kashmir's Royal Culinary Heritage",
  description:
    "Discover the 700-year history of Wazwan — Kashmir's royal feast. Learn about the Waza chefs, the Traami tradition, the 36-course ceremony, and its Central Asian origins.",
  alternates: { canonical: "https://wazwanway.com/history" },
  openGraph: {
    title: "History of Wazwan | Wazwan Way",
    description: "Discover the 700-year history of Wazwan — Kashmir's royal feast tracing back to Timur and the Waza chefs of Samarkand.",
    url: "https://wazwanway.com/history",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "History of Kashmiri Wazwan" }],
  },
  twitter: {
    title: "History of Wazwan | Wazwan Way",
    description: "700 years of Kashmir's royal culinary heritage — the Waza chefs, the Traami, the 36-course feast.",
    images: ["/wazwan-hero.jpg"],
  },
};

export default function HistoryLayout({ children }) {
  return children;
}
