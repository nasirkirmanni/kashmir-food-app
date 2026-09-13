export const metadata = {
  title: "Terms of Service",
  description: "The terms and conditions for using Wazwan Way.",
  alternates: { canonical: "https://wazwanway.com/terms" },
  openGraph: {
    title: "Terms of Service | Wazwan Way",
    description: "The terms and conditions for using Wazwan Way.",
    url: "https://wazwanway.com/terms",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way" }],
  },
};

export default function TermsLayout({ children }) {
  return children;
}
