export const metadata = {
  alternates: { canonical: "https://wazwanway.com/list-restaurant" },
  title: "List Your Kashmiri Restaurant",
  description: "Are you a restaurant owner in Kashmir serving authentic Wazwan? List your business on Wazwan Way to reach culinary travelers.",
  openGraph: {
    type: "website",
    url: "https://wazwanway.com/list-restaurant",
    siteName: "Wazwan Way",
    images: [{ url: "/wazwan-hero.jpg", width: 1024, height: 1024, alt: "Wazwan Way" }],
  },
};

export default function ListRestaurantLayout({ children }) {
  return children;
}
