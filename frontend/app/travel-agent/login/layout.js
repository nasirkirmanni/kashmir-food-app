export const metadata = {
  title: "Travel Agent Login",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://wazwanway.com/travel-agent/login" },
  openGraph: {
    type: "website",
    url: "https://wazwanway.com/travel-agent/login",
    siteName: "Wazwan Way",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way" }],
  },
};

export default function TravelAgentLoginLayout({ children }) {
  return children;
}
