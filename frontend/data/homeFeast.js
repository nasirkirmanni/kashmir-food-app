import { STILL_KASHMIR_HREF, STILL_KASHMIR_SITE } from "../lib/stillKashmir";

/**
 * Editor data for the desktop homepage (components/home/feast).
 *
 * FEAST_ANCHORS and FEAST_LABELS are words written for this page: kickers, section titles, CTA labels
 * and their targets, screen-reader joiners and the five display words of the valley. They state no
 * facts; placeholders such as {wazwan} are filled from the data by lib/homeFeast.js.
 *
 * FEAST_QUOTED lines are copied word for word from the file named with each, because those files
 * write them inline. lib/homeFeast.test.js checks that each still appears there.
 */
export const FEAST_ANCHORS = [
  { id: "feast", label: "feast" },
  { id: "seven", label: "the seven" },
  { id: "library", label: "library" },
  { id: "tables", label: "tables" },
  { id: "valley", label: "valley" },
  { id: "plan", label: "plan" },
  { id: "ask", label: "ask" },
  { id: "journal", label: "journal" },
];

export const FEAST_LABELS = {
  strip: { label: "On this page" },
  name: {
    kicker: "Kashmiri food · The Wazwan · Srinagar · The valley",
    wordLead: "The",
    word: "Wazwan",
    search: "Search a dish or a restaurant",
    begin: { label: "Begin the feast", href: "/kashmiri-food" }, // label verbatim from HomePageHero.js
    doors: [
      { label: "Dishes", line: "{wazwan} Wazwan dishes, {essentialWord} essential", href: "/dishes" },
      { label: "Tables", line: "where the feast is served", href: "/restaurants" },
      { label: "Valley", line: "{places} places and the trips around them", href: "/destinations" },
    ],
  },
  legend: {
    title: "The feast in brief",
    sourcePrefix: "Source",
    sourcesHref: "/dishes#sources",
    sourceKeys: {
      "rather-2016": "Rather 2016",
      jktdc: "JKTDC",
      "wikipedia-wazwan": "Wikipedia",
      sahapedia: "Sahapedia",
      "jk-arts": "JK Arts",
    },
    cta: { label: "Read the full guide", href: "/dishes" },
  },
  seven: {
    titleLines: ["Seven courses,", "one trami."],
    dish: "The dish",
    story: "The story",
    accent: { "marchwangan-korma": "hottest" },
    cta: { label: "Read the seven, in order", href: "/blog/core-seven" },
  },
  line: { word: "Wazwan.", title: "and the valley around it.", anchors: ["library", "tables", "valley", "plan"] },
  library: {
    title: "The rest of the table.",
    totalCaption: "dishes in the catalogue",
    countSuffix: "dishes",
    essential: "essential",
    more: "more",
    rows: [
      { categoryType: "wazwan", word: "wazwan", href: "/dishes" },
      { categoryType: "kashmiri_cuisine", word: "street food and more", href: "/kashmiri-food#street" },
      { categoryType: "bakery", word: "bakery", href: "/kashmiri-food#bakery" },
      { categoryType: "beverage", word: "beverages", href: "/kashmiri-food#beverages" },
    ],
    links: [
      { label: "The {wazwan} Wazwan dishes", href: "/dishes" },
      { label: "Breads, tea and street food", href: "/kashmiri-food" },
    ],
  },
  tables: {
    title: "Where it is served.",
    kicker: "{countWord} restaurants with sourced facts",
    creditsPrefix: "Sources",
    links: [
      { label: "Read the Srinagar guide", href: "/restaurants/best-wazwan-srinagar" },
      { label: "All restaurants", href: "/restaurants" },
    ],
  },
  valley: {
    titleLines: ["Where it", "comes from."],
    fieldsKicker: "Ingredients",
    fields: [
      { word: "saffron", post: "pampore-kashmiri-saffron" },
      { word: "red chilli", post: "kashmiri-red-chili" },
      { word: "lotus stem", post: "nadru-lotus-stem-kashmir" },
      { word: "ver", post: "what-is-ver-masala" },
      { word: "fennel", post: "fennel-and-dry-ginger-wazwan" },
    ],
    placesKicker: "{placesWord} places with sourced profiles",
    sourcesCaption: "Sources: {publishers} · checked {checked}",
    links: [
      { label: "Explore Kashmir", href: "/explore" },
      { label: "Visit Kashmir", href: STILL_KASHMIR_HREF },
      { label: "stillkashmir.com", href: STILL_KASHMIR_SITE },
    ],
  },
  plan: {
    titleLines: ["Plan the days", "around the feast."],
    links: [
      { label: "Build my itinerary", href: "/itinerary-builder" },
      { label: "Ready-made trips", href: "/itineraries" },
    ],
  },
  ask: {
    kicker: "{series} · Waza AI",
    titleLines: ["Ask about", "the feast."],
    // Indexes into CORE_SEVEN_HUB_FAQ. [2] (the serving order) waits for the owner's ruling: it
    // contradicts the course numbers above it.
    faq: [0, 1],
    askThis: "Ask Waza about this",
    fieldLabel: "Ask your own question",
    submit: "Ask Waza",
    open: { label: "Open Waza AI", href: "/waza-ai" },
  },
  journal: {
    title: "The journal.",
    guidesTitle: "{guidesWord} guides",
    latestTitle: "Latest",
    latestCount: 3,
    latestSkip: ["kashmiri-food-sources"],
    updatedLabel: "Updated",
    links: [
      { label: "How the stories are researched", href: "/blog/kashmiri-food-sources" },
      { label: "All stories", href: "/blog" },
    ],
  },
};

export const FEAST_QUOTED = {
  nameLeadOne: { from: "components/HomePageHero.js", text: "Up to thirty-six courses, one copper trami — the feast Kashmir is known for." },
  nameLeadTwo: { from: "components/home/HomeIntro.js", text: "Wazwan Way covers the dishes of the Wazwan and everyday Kashmiri cooking, the Srinagar restaurants that serve them, and destinations and itineraries for planning a trip to the valley." },
  sevenKicker: { from: "components/wazwan/ServiceOrder.js", text: "Seven dishes are commonly listed as essential" },
  sevenLead: { from: "components/blog/SeriesNav.js", text: "One story for each dish a Wazwan cannot do without, in the order they come to the trami." },
  sevenCaveat: { from: "app/blog/core-seven/page.js", text: "Kitchens vary in the middle of the feast, as the stories explain." },
  planKicker: { from: "app/itineraries/page.js", text: "Ready-made Kashmir trips" },
  planCopy: { from: "app/itineraries/page.js", text: "Curated day-by-day plans for every kind of trip — with routes, Wazwan stops, stays and costs. Or build your own in minutes." },
  gateway: { from: "app/still-kashmir/page.js", text: "Still Kashmir is Wazwan Way's own travel agency, now live at stillkashmir.com." },
  journalLead: { from: "lib/journalFeed.js", text: "Long-form stories from Kashmir's food culture: the Wazwan feast and its dishes, breads, tea, spices and the people behind them." },
};
