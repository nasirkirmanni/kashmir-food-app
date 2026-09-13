export const metadata = {
  // An object title passes the brand template down to the posts; a plain string
  // would reset it for everything below this layout. `default` is the hub's title.
  title: {
    default: "Journal | Kashmiri Food Stories & Guides",
    template: "%s | Wazwan Way",
  },
  description:
    "Long-form stories from Kashmir's food culture — saffron fields, bread traditions, spice blends, and the people behind the Wazwan.",
  alternates: { canonical: "https://wazwanway.com/blog" },
  openGraph: {
    title: "Journal | Kashmiri Food Stories & Guides",
    description: "Long-form stories from Kashmir's food culture — saffron fields, bread traditions, spice blends, and the people behind the Wazwan.",
    url: "https://wazwanway.com/blog",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way" }],
  },
};

export default function BlogLayout({ children }) {
  return children;
}
