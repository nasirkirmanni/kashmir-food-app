/**
 * How the Traditional Wazwan page (/dishes) groups, orders and frames the Wazwan
 * dishes. This is presentation only: dish records come from the catalogue
 * unchanged, and every fact the page states about service order is one the
 * site's sourced guides already make (the trami arrives with the first dishes,
 * the gravies follow one by one, gushtaba always comes last).
 */
import { resolveContentPhoto } from "./contentImages";

// The chapters of the meal, in the order it unfolds. A dish joins the chapter
// that lists its slug, otherwise the one that lists its catalogue courseType.
// Gushtaba is catalogued as a signature course but has a chapter of its own,
// because it is always served last.
export const WAZWAN_CHAPTERS = [
  {
    id: "the-trami",
    kicker: "Foundation",
    title: "On the trami",
    navLabel: "The trami",
    summary:
      "The first dishes arrive with the trami itself, laid on a mound of rice for four diners to share.",
    courseTypes: ["foundation"],
    layout: "pair",
    listTitle: "Also on the trami",
  },
  {
    id: "the-gravies",
    kicker: "Signature courses",
    title: "The gravies",
    navLabel: "The gravies",
    summary:
      "Then the wazas bring the meat courses to the trami one by one: pale, milky aab gosht and deep red rista among them.",
    courseTypes: ["signature"],
    layout: "gallery",
    listTitle: "More gravies",
  },
  {
    id: "alongside",
    kicker: "Vegetarian",
    title: "Alongside",
    navLabel: "Alongside",
    summary: "Vegetarian dishes of spinach, potatoes, paneer and mushrooms are served alongside the meats.",
    courseTypes: ["vegetarian"],
    layout: "plates",
  },
  {
    id: "the-last-course",
    kicker: "The finale",
    title: "The last course",
    navLabel: "Last course",
    summary: "Gushtaba always comes last.",
    slugs: ["gushtaba"],
    layout: "finale",
  },
];

// Dishes whose courseType no chapter claims still appear, just before the finale.
const MORE_DISHES_CHAPTER = {
  id: "more-dishes",
  kicker: "Also served",
  title: "More dishes",
  navLabel: "More",
  summary: "Other dishes from the Wazwan table.",
  layout: "list",
};

// Display order within each chapter. Slugs not listed follow, alphabetically.
const DISPLAY_ORDER = [
  "tabak-maaz", "seekh-kebab", "methi-maaz", "shami-kabab", "rice", "kashmiri-pulao", "muji-chetin",
  "rista", "rogan-josh", "aab-gosht", "daniwal-korma", "marchwangan-korma", "dani-phol", "waza-kokur", "yakhni",
  "waza-palak", "dum-oluv", "ruwangan-chaman", "wazwan-mushroom-guchhi-yakhni",
  "gushtaba",
];

// The seven dishes commonly listed as essential to a Wazwan; the "Kashmiri
// cuisine explained" guide gives the source.
export const ESSENTIAL_SLUGS = new Set([
  "tabak-maaz", "rista", "rogan-josh", "daniwal-korma", "aab-gosht", "marchwangan-korma", "gushtaba",
]);

// Framing for the photographs in use. The /images/scroll files are one series,
// each dish shot from above in its cooking pot, with a thin border baked into
// the file; `framed` draws them slightly oversized so the border is cropped.
export const DISH_PHOTOS = {
  "/images/scroll/KABAB.png": { framed: true, focal: "50% 66%", alt: "Seekh kebabs in a cooking pot, seen from above" },
  "/images/scroll/TABAKH.png": { framed: true, focal: "50% 64%", alt: "Tabak maaz ribs in a cooking pot, seen from above" },
  "/images/scroll/RISTA.png": { framed: true, focal: "50% 66%", alt: "Rista meatballs in red gravy in a cooking pot, seen from above" },
  "/images/scroll/ROGAN.png": { framed: true, focal: "50% 58%", alt: "Rogan josh in a cooking pot, seen from above" },
  "/images/scroll/AAB.png": { framed: true, focal: "50% 60%", alt: "Aab gosht, lamb in a pale milk gravy, in a cooking pot" },
  "/images/scroll/GUSHTABA.png": { framed: true, focal: "50% 62%", alt: "Gushtaba meatballs in yoghurt gravy in a cooking pot, seen from above" },
  "/images/dishes/mughal-marchwangan.jpg": { framed: false, focal: "50% 50%", alt: "Marchhwangan korma in a white bowl" },
};

const DIET_LABELS = { veg: "Vegetarian", "non-veg": "Non-vegetarian" };

export function dietLabel(foodType) {
  if (typeof foodType !== "string" || !foodType.trim()) return "";
  return DIET_LABELS[foodType.trim().toLowerCase()] || foodType.trim();
}

/**
 * "INR 430-790" → [{ label: "", amount: "INR 430–790" }]
 * "Single piece: INR 195-300 | Full plate: INR 650-900" → two labelled prices.
 */
export function formatPriceRange(priceRange) {
  if (typeof priceRange !== "string" || !priceRange.trim()) return [];
  return priceRange
    .split("|")
    .map((part) => {
      const text = part.trim().replace(/(\d)\s*-\s*(\d)/g, "$1–$2");
      const labelled = text.match(/^([^:]+):\s*(.+)$/);
      return labelled ? { label: labelled[1].trim(), amount: labelled[2].trim() } : { label: "", amount: text };
    })
    .filter((price) => price.amount);
}

function toEntry(dish) {
  const photoSrc = resolveContentPhoto(dish.image);
  const framing = photoSrc ? DISH_PHOTOS[photoSrc] : null;
  const slug = dish.slug || dish._id;
  return {
    key: dish._id || dish.slug,
    slug,
    name: dish.name,
    description: typeof dish.description === "string" ? dish.description.trim() : "",
    courseType: dish.courseType,
    diet: dietLabel(dish.foodType),
    spice: typeof dish.spiceLevel === "string" ? dish.spiceLevel.trim() : "",
    prices: formatPriceRange(dish.priceRange),
    href: `/dishes/${slug}`,
    essential: ESSENTIAL_SLUGS.has(dish.slug),
    photo: photoSrc
      ? {
          src: photoSrc,
          alt: framing?.alt || dish.name,
          focal: framing?.focal || "50% 50%",
          framed: Boolean(framing?.framed),
        }
      : null,
  };
}

function displayRank(slug) {
  const index = DISPLAY_ORDER.indexOf(slug);
  return index === -1 ? DISPLAY_ORDER.length : index;
}

/**
 * Groups dish records into the page's chapters. Empty chapters are dropped and
 * the rest are numbered 01, 02, … in order.
 */
export function arrangeWazwan(dishes = []) {
  const entries = dishes
    .filter((dish) => dish && dish.name && (dish.slug || dish._id))
    .map(toEntry)
    .sort((a, b) => displayRank(a.slug) - displayRank(b.slug) || a.name.localeCompare(b.name));

  const chapters = WAZWAN_CHAPTERS.map((chapter) => ({ ...chapter, dishes: [] }));
  const more = { ...MORE_DISHES_CHAPTER, dishes: [] };

  for (const entry of entries) {
    const target =
      chapters.find((chapter) => chapter.slugs?.includes(entry.slug)) ||
      chapters.find((chapter) => chapter.courseTypes?.includes(entry.courseType)) ||
      more;
    target.dishes.push(entry);
  }

  if (more.dishes.length) chapters.splice(chapters.length - 1, 0, more);

  return chapters
    .filter((chapter) => chapter.dishes.length)
    .map((chapter, index) => ({ ...chapter, number: String(index + 1).padStart(2, "0") }));
}

/**
 * The hero's visual index: the photographed dishes of the matching series, grouped
 * by chapter, so the strip reads from the trami to the last course.
 */
export function vesselIndex(chapters = []) {
  const stageNames = { "the-trami": "On the trami", "the-gravies": "The gravies", "the-last-course": "The last course" };
  return chapters
    .filter((chapter) => stageNames[chapter.id])
    .map((chapter) => ({
      id: chapter.id,
      stage: stageNames[chapter.id],
      dishes: chapter.dishes.filter((dish) => dish.photo?.framed),
    }))
    .filter((group) => group.dishes.length);
}
