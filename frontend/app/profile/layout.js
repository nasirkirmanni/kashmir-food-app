export const metadata = {
  title: "Your Profile",
  description: "Your Wazwan Way account profile and saved dishes.",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://wazwanway.com/profile" },
  openGraph: {
    type: "website",
    url: "https://wazwanway.com/profile",
    siteName: "Wazwan Way",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way" }],
  },
};

export default function ProfileLayout({ children }) {
  return children;
}
