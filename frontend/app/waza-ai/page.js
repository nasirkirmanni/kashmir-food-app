import WazaAIPage from "@/components/WazaAIPage";

export const metadata = {
  alternates: { canonical: "https://wazwanway.com/waza-ai" },
  title: "Waza AI: Chat With a Kashmiri Food Guide",
  description: "Chat with Waza AI, your premium Kashmiri food guide, to learn about dishes, recipes, and restaurants.",
  openGraph: {
    type: "website",
    url: "https://wazwanway.com/waza-ai",
    siteName: "Wazwan Way",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way" }],
  },
};

export default function WazaAIPageRoute() {
  return <WazaAIPage />;
}
