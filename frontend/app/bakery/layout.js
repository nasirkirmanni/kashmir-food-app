export const metadata = {
  title: "Kashmiri Bakery | Traditional Breads & Bakarkhani",
  description:
    "Kashmir's bakery tradition — czot, girda, bakarkhani, and the morning kandur-wan ritual of fresh bread and noon chai.",
  alternates: { canonical: "https://wazwanway.com/bakery" },
  openGraph: {
    title: "Kashmiri Bakery | Traditional Breads & Bakarkhani",
    description: "Kashmir's bakery tradition — czot, girda, bakarkhani, and the morning kandur-wan ritual of fresh bread and noon chai.",
    url: "https://wazwanway.com/bakery",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way" }],
  },
};

export default function BakeryLayout({ children }) {
  return children;
}
