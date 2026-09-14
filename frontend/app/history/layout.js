export const metadata = {
  title: "History of Wazwan | Kashmir's Royal Feast",
  description:
    "The history of Wazwan, Kashmir's royal feast: the Timur legend, the Waza chefs, the Traami tradition and the 36-course ceremony.",
  alternates: { canonical: "https://wazwanway.com/history" },
  openGraph: {
    title: "History of Wazwan | Wazwan Way",
    description: "Discover the history of Wazwan, Kashmir's royal feast — from the Timur legend to the Waza chefs who cook it today.",
    url: "https://wazwanway.com/history",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "History of Kashmiri Wazwan" }],
  },
  twitter: {
    title: "History of Wazwan | Wazwan Way",
    description: "Kashmir's royal culinary heritage — the Timur legend, the Waza chefs, the Traami, the 36-course feast.",
    images: ["/wazwan-hero.jpg"],
  },
};

export default function HistoryLayout({ children }) {
  return children;
}
