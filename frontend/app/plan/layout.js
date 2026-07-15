export const metadata = {
  title: "Plan Your Trip | Kashmir Travel Planner",
  description:
    "Plan your Kashmir trip — season guidance, destinations, food experiences, and practical travel information in one place.",
  alternates: { canonical: "https://wazwanway.com/plan" },
  openGraph: {
    title: "Plan Your Trip | Kashmir Travel Planner",
    description: "Plan your Kashmir trip — season guidance, destinations, food experiences, and practical travel information in one place.",
    url: "https://wazwanway.com/plan",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way" }],
  },
};

export default function PlanLayout({ children }) {
  return children;
}
