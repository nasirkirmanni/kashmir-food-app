// /dishes is the site's main page for Wazwan: what it is, its dishes in serving order, who cooks
// it and where it comes from. Its structured data is in app/dishes/page.js, so it describes only
// what that page shows (dish pages below this layout carry their own Recipe data).
export const metadata = {
  // An object title passes the brand template down to dish pages; a plain string
  // would reset it for everything below this layout. `default` is the hub's title.
  title: {
    default: "Wazwan: Kashmir's Traditional Feast, Dish by Dish",
    template: "%s | Wazwan Way",
  },
  description:
    "Wazwan is Kashmir's traditional multi-course feast. What it is, who cooks it, how it's served on a copper trami, its dishes in serving order and its history.",
  alternates: { canonical: "https://wazwanway.com/dishes" },
  openGraph: {
    title: "Wazwan: Kashmir's Traditional Feast, Dish by Dish | Wazwan Way",
    description:
      "Kashmir's multi-course feast, cooked by wazas and shared four to a copper trami: its dishes in serving order, the cooks and the history.",
    url: "https://wazwanway.com/dishes",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "A traditional Kashmiri Wazwan" }],
  },
  twitter: {
    title: "Wazwan: Kashmir's Traditional Feast | Wazwan Way",
    description: "Kashmir's multi-course feast: its dishes in serving order, the wazas who cook it and where it comes from.",
    images: ["/wazwan-hero.jpg"],
  },
};

export default function DishesLayout({ children }) {
  return children;
}
