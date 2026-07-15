export const metadata = {
  title: "Rare Destinations | Offbeat Kashmir Travel Guide",
  description:
    "Explore Kashmir beyond the postcards — hidden valleys, alpine lakes, and offbeat destinations like Gurez, Bangus, Lolab, and Doodhpathri, with practical travel metrics for each.",
  alternates: { canonical: "https://wazwanway.com/destinations" },
  openGraph: {
    title: "Rare Destinations | Wazwan Way",
    description: "Hidden valleys, alpine lakes, and offbeat Kashmir destinations with practical travel guidance.",
    url: "https://wazwanway.com/destinations",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Rare Kashmir Destinations" }],
  },
};

export default function DestinationsLayout({ children }) {
  return children;
}
