import WazaAIPage from "@/components/WazaAIPage";
import AboutWaza from "@/components/AboutWaza";

export const metadata = {
  alternates: { canonical: "https://wazwanway.com/waza-ai" },
  title: "Waza AI: Chat With a Kashmiri Food Guide",
  description:
    "Waza is Wazwan Way's chat guide to Kashmiri food: ask about Wazwan dishes, recipes, Srinagar restaurants and Kashmir travel, answered from this site's pages.",
  openGraph: {
    type: "website",
    url: "https://wazwanway.com/waza-ai",
    siteName: "Wazwan Way",
    title: "Waza AI: Chat With a Kashmiri Food Guide",
    description:
      "Ask about Wazwan dishes, recipes, Srinagar restaurants and Kashmir travel; Waza answers from Wazwan Way's own catalogue.",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way" }],
  },
};

export default function WazaAIPageRoute() {
  return (
    <>
      <WazaAIPage />
      {/* Server-rendered: what Waza is, answers and won't do. On a phone the chat overlay
          covers it (scroll ends the chat), and on desktop the page hands over to the
          home-page popup; crawlers and no-JS readers get this text either way. */}
      <AboutWaza />
    </>
  );
}
