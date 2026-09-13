/**
 * Hand-picked links between dish pages and the articles written about them.
 * Every target is an existing page; only add an article that is genuinely about
 * the dish (or, for the Wazwan guides, about the feast the dish belongs to).
 */

const BLOG = {
  roganJosh: { href: "/blog/rogan-josh-the-true-story", title: "Rogan Josh: The True Story Behind Kashmir's Most Famous Dish" },
  gushtaba: { href: "/blog/secrets-of-gushtaba", title: "Secrets of Gushtaba: The Royal Velvet Meatball" },
  gushtabaFinale: { href: "/blog/gushtaba", title: "Gushtaba: The Royal Finale of the Wazwan" },
  noonChai: { href: "/blog/noon-chai-pink-tea-kashmir", title: "Noon Chai: The Science, Culture, and Ritual Behind Kashmir's Pink Tea" },
  kahwaVsNoonChai: { href: "/blog/kahwa-vs-noon-chai", title: "Kahwa vs. Noon Chai: An Ancestral Tea Feud" },
  nadru: { href: "/blog/nadru-lotus-stem-kashmir", title: "Nadru (Lotus Stem): Kashmir's Most Loved Vegetable" },
  breads: { href: "/blog/kandur-wan-breads", title: "The Kandur-Wan Breads of Kashmir" },
};

const GUIDES = {
  whatIsWazwan: { href: "/kashmiri-food/wazwan/guide/what-is-wazwan", title: "What is Wazwan? The Complete Guide to Kashmir's Legendary Feast" },
  dishesExplained: { href: "/kashmiri-food/wazwan/guide/dishes-explained", title: "Wazwan Dishes Explained: The Saat Rang and Beyond" },
  vegetarian: { href: "/kashmiri-food/wazwan/guide/vegetarian-wazwan", title: "Vegetarian Wazwan: What to Expect and What to Order" },
};

const ARTICLES_BY_DISH = {
  "rogan-josh": [BLOG.roganJosh],
  gushtaba: [BLOG.gushtaba, BLOG.gushtabaFinale],
  "noon-chai": [BLOG.noonChai, BLOG.kahwaVsNoonChai],
  "kashmiri-kahwa": [BLOG.kahwaVsNoonChai],
  "cardamom-kahwa": [BLOG.kahwaVsNoonChai],
  "nadru-yakhni": [BLOG.nadru],
  girda: [BLOG.breads],
  lavas: [BLOG.breads],
  sheermal: [BLOG.breads],
  "kashmiri-kulcha": [BLOG.breads],
};

/** Articles to suggest on a dish page. */
export function relatedReadingForDish(dish) {
  if (!dish?.slug) return [];
  const links = [...(ARTICLES_BY_DISH[dish.slug] || [])];
  if (dish.category === "Wazwan") {
    links.push(GUIDES.dishesExplained, GUIDES.whatIsWazwan);
    if (dish.foodType === "Veg") links.push(GUIDES.vegetarian);
  }
  return links;
}

/** Dish slugs an article should link back to (the inverse of ARTICLES_BY_DISH). */
export function dishSlugsForArticle(href) {
  return Object.entries(ARTICLES_BY_DISH)
    .filter(([, links]) => links.some((link) => link.href === href))
    .map(([slug]) => slug);
}
