export const metadata = {
  title: "Saved Favorites",
  description: "Your saved Kashmiri dishes, restaurants, and scenic routes on Wazwan Way.",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://wazwanway.com/favorites" },
  openGraph: {
    type: "website",
    url: "https://wazwanway.com/favorites",
    siteName: "Wazwan Way",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way" }],
  },
};

export default function FavoritesLayout({ children }) {
  return children;
}
