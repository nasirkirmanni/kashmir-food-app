export const metadata = {
  title: "Contact Us | Get in Touch",
  description:
    "Contact the Wazwan Way team — questions about Kashmiri food, restaurant listings, partnerships, or travel planning help.",
  alternates: { canonical: "https://wazwanway.com/contact" },
  openGraph: {
    title: "Contact Us | Wazwan Way",
    description: "Get in touch with the Wazwan Way team.",
    url: "https://wazwanway.com/contact",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way" }],
  },
};

export default function ContactLayout({ children }) {
  return children;
}
