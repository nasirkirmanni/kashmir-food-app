export const metadata = {
  alternates: { canonical: "https://wazwanway.com/list-restaurant" },
  title: "List Your Kashmiri Restaurant",
  description: "Serve Wazwan or Kashmiri food? E-mail your restaurant's details and photos to hello@wazwanway.com and we'll review it for a listing on Wazwan Way.",
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
