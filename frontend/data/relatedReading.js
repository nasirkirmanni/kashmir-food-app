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
  streetFood: { href: "/blog/kashmiri-street-food-srinagar", title: "Kashmiri Street Food: What to Eat in Srinagar, Where and When" },
  winterFood: { href: "/blog/kashmiri-winter-food", title: "Kashmiri Winter Food: Harissa, Hokh Syun and Eating Through Chillai Kalan" },
  breakfast: { href: "/blog/kashmiri-breakfast", title: "Kashmiri Breakfast: Noon Chai, the Kandur and What Kashmir Eats in the Morning" },
  spicy: { href: "/blog/is-kashmiri-food-spicy", title: "Is Kashmiri Food Spicy? Colour, Heat and How It Differs From North Indian Food" },
  vegetarianFood: { href: "/blog/vegetarian-food-in-kashmir", title: "Vegetarian Food in Kashmir: What to Eat and How to Order" },
  panditFood: { href: "/blog/kashmiri-pandit-food", title: "Kashmiri Pandit Food: Dishes, Customs and How It Differs From Wazwan" },
  whatToBuy: { href: "/blog/what-to-buy-in-kashmir-food-souvenirs", title: "What to Buy in Kashmir: A Food Lover's Guide to Saffron, Walnuts, Almonds and More" },
  sweets: { href: "/blog/kashmiri-sweets-desserts", title: "Kashmiri Sweets and Desserts: What's Genuinely Kashmiri and When to Find It" },
};

const GUIDES = {
  whatIsWazwan: { href: "/kashmiri-food/wazwan/guide/what-is-wazwan", title: "What is Wazwan? The Complete Guide to Kashmir's Legendary Feast" },
  dishesExplained: { href: "/kashmiri-food/wazwan/guide/dishes-explained", title: "Wazwan Dishes Explained: The Saat Rang and Beyond" },
  vegetarian: { href: "/kashmiri-food/wazwan/guide/vegetarian-wazwan", title: "Vegetarian Wazwan: What to Expect and What to Order" },
};

const ARTICLES_BY_DISH = {
  "rogan-josh": [BLOG.roganJosh, BLOG.spicy],
  gushtaba: [BLOG.gushtaba, BLOG.gushtabaFinale, BLOG.spicy],
  rista: [BLOG.spicy],
  "marchwangan-korma": [BLOG.spicy],
  "aab-gosht": [BLOG.spicy],
  "noon-chai": [BLOG.noonChai, BLOG.kahwaVsNoonChai, BLOG.breakfast],
  "kashmiri-kahwa": [BLOG.kahwaVsNoonChai, BLOG.whatToBuy],
  "cardamom-kahwa": [BLOG.kahwaVsNoonChai],
  "nadru-yakhni": [BLOG.nadru, BLOG.vegetarianFood],
  "dum-oluv": [BLOG.vegetarianFood],
  "ruwangan-chaman": [BLOG.vegetarianFood],
  girda: [BLOG.breads, BLOG.breakfast],
  lavas: [BLOG.breads, BLOG.breakfast],
  sheermal: [BLOG.breads],
  "kashmiri-kulcha": [BLOG.breads, BLOG.breakfast],
  czochworu: [BLOG.breakfast],
  bakerkhani: [BLOG.breakfast],
  "masala-tsot": [BLOG.streetFood],
  "mutton-tujji": [BLOG.streetFood],
  "seekh-kebab": [BLOG.streetFood],
  "nadur-monji": [BLOG.streetFood],
  "aloo-monji": [BLOG.streetFood],
  "kashmiri-harissa": [BLOG.winterFood],
  "nadru-gaad": [BLOG.winterFood],
  kabargah: [BLOG.panditFood],
  shufta: [BLOG.panditFood, BLOG.sweets],
  phirni: [BLOG.sweets],
  "saffron-phirni": [BLOG.sweets],
  basrakh: [BLOG.sweets],
  tosha: [BLOG.sweets],
  "walnut-halwa": [BLOG.sweets],
  sheera: [BLOG.sweets],
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
