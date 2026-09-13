export const metadata = {
  title: "Privacy Policy",
  description: "How Wazwan Way collects, uses, and protects your personal information.",
  alternates: { canonical: "https://wazwanway.com/privacy" },
  openGraph: {
    title: "Privacy Policy | Wazwan Way",
    description: "How Wazwan Way collects, uses, and protects your personal information.",
    url: "https://wazwanway.com/privacy",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way" }],
  },
};

export default function PrivacyLayout({ children }) {
  return children;
}
