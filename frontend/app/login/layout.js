export const metadata = {
  alternates: { canonical: "https://wazwanway.com/login" },
  title: "Log In",
  description: "Log in to your Wazwan Way account to save your favorite Kashmiri dishes, review restaurants, and track your culinary journey.",
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    url: "https://wazwanway.com/login",
    siteName: "Wazwan Way",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way" }],
  },
};

export default function LoginLayout({ children }) {
  return children;
}
