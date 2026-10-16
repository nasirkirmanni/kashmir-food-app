/**
 * The core seven: one long-form story for each dish a Wazwan cannot do without.
 *
 * This file stays small because client components import it (the Kashmiri food page, the
 * /dishes entries, the Journal index). The fact boxes and structured-data entities, which only
 * the story pages need, live in data/coreSevenFacts.js.
 *
 * Order follows ESSENTIAL_ORDER in lib/wazwanSequence.js, the order the /dishes page serves the
 * seven; titles repeat the posts' own titles in data/blogPosts.js. Both are checked by tests.
 */

export const CORE_SEVEN_HUB = "/blog/core-seven";
export const CORE_SEVEN_NAME = "The core seven";
// The date the series page was published; the sitemap and the page's structured data use it.
export const CORE_SEVEN_PUBLISHED = "October 17, 2026";

export const CORE_SEVEN_SERIES = [
  {
    slug: "tabak-maaz-ribs-cooked-twice",
    dish: "tabak-maaz",
    name: "Tabak maaz",
    title: "Tabak Maaz: Ribs Cooked Twice, and the Plate in the Name",
    angle: "Ribs cooked twice, and the plate in the name",
    place: "First on the trami",
    linkText: "why tabak maaz is cooked twice",
  },
  {
    slug: "rista-pounded-meatballs",
    dish: "rista",
    name: "Rista",
    title: "Rista: The Meatball Pounded on a Stone",
    angle: "The meatball pounded on a stone",
    place: "First of the gravies",
    linkText: "how rista is pounded on a stone",
  },
  {
    slug: "rogan-josh-history",
    dish: "rogan-josh",
    name: "Rogan josh",
    title: "Rogan Josh: The History, the Name and the Red of Kashmir's Most Famous Dish",
    angle: "The history, the name and the red",
    place: "Early among the gravies",
    linkText: "where rogan josh gets its red",
  },
  {
    slug: "aab-gosht-milk-curry",
    dish: "aab-gosht",
    name: "Aab gosht",
    title: "Aab Gosht: The Milk Curry of the Wazwan",
    angle: "The milk curry of the Wazwan",
    place: "Late, among the pale dishes",
    linkText: "the ten litres of milk in aab gosht",
  },
  {
    slug: "daniwal-korma-coriander",
    dish: "daniwal-korma",
    name: "Daniwal korma",
    title: "Daniwal Korma: The Coriander Course",
    angle: "The coriander course",
    place: "In the middle of the meal",
    linkText: "the coriander of daniwal korma",
  },
  {
    slug: "marchwangan-korma-chilli",
    dish: "marchwangan-korma",
    name: "Marchwangan korma",
    title: "Marchwangan Korma: The Hottest Dish on the Trami",
    angle: "The hottest dish on the trami",
    place: "The last hot dish",
    linkText: "the chilli in marchwangan korma",
  },
  {
    slug: "gushtaba-last-dish-of-wazwan",
    dish: "gushtaba",
    name: "Gushtaba",
    title: "Gushtaba: Why the Wazwan Ends With a Meatball",
    angle: "Why the Wazwan ends with a meatball",
    place: "Last",
    linkText: "why the feast ends with gushtaba",
  },
].map((story, index) => ({ ...story, number: index + 1, href: `/blog/${story.slug}` }));

const BY_SLUG = new Map(CORE_SEVEN_SERIES.map((story) => [story.slug, story]));
const BY_DISH = new Map(CORE_SEVEN_SERIES.map((story) => [story.dish, story]));

/** The series entry for a blog post, or undefined when the post isn't one of the seven. */
export function coreSevenStory(slug) {
  return BY_SLUG.get(slug);
}

/** The story about a dish, by the dish's slug (as /dishes/<slug> uses it). */
export function coreSevenStoryForDish(dishSlug) {
  return BY_DISH.get(dishSlug);
}

/** The stories either side of this one in the series; the ends have only one neighbour. */
export function coreSevenNeighbours(slug) {
  const story = BY_SLUG.get(slug);
  if (!story) return { previous: undefined, next: undefined };
  return {
    previous: CORE_SEVEN_SERIES[story.number - 2],
    next: CORE_SEVEN_SERIES[story.number],
  };
}
