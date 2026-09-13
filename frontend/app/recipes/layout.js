export const metadata = {
  title: "Authentic Kashmiri Recipes | Wazwan Cooking",
  description:
    "Discover step-by-step authentic recipes for traditional Kashmiri dishes like Rogan Josh, Rista, Gushtaba, Yakhni, and more from expert chefs.",
  alternates: { canonical: "https://wazwanway.com/recipes" },
  openGraph: {
    title: "Secret Kashmiri Recipes | Learn Authentic Wazwan Cooking",
    description:
      "Discover step-by-step authentic recipes for traditional Kashmiri dishes like Rogan Josh, Rista, Gushtaba, Yakhni, and more.",
    url: "https://wazwanway.com/recipes",
    images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: "Wazwan Way" }],
  },
};

export default function RecipesLayout({ children }) {
  return children;
}
