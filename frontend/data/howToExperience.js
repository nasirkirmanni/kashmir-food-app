/**
 * The visitor guide at /how-to-experience: six things to know before sitting at the trami, then
 * the manners of the trami itself.
 *
 * The six essentials keep the page's original wording. The notes on the trami follow
 * /kashmiri-food/wazwan/guide/how-wazwan-is-served, which cites its sources, and the serving
 * order follows the homepage film (data/homeChapters.js), which follows the same guide. Photos
 * are described by what they show, never more.
 */

export const SERVED_GUIDE = "/kashmiri-food/wazwan/guide/how-wazwan-is-served";

export const HERO_PHOTO = {
  src: "/redesign/img/ritual-elder.webp",
  alt: "Hands reaching in from every side of a copper trami of rice, kebabs and rista",
  caption: "Hands from every side of one trami.",
  position: "42% 55%",
};

export const ESSENTIALS = [
  {
    id: "book-in-advance",
    title: "Book in Advance",
    text: "A full Wazwan is often prepared overnight, so call ahead if you want the ceremonial feast experience rather than a standard menu order.",
    why: "Most kitchens need a headcount, not a card number — booking is really about giving the kitchen lead time.",
    photos: [
      {
        src: "/images/kashmiri-food/wazwan.webp",
        alt: "Cooks tending a row of large pots over a wood fire, one ladling liquid into a pot",
        caption: "Pots over a wood fire.",
        position: "58% 50%",
      },
    ],
    link: { href: "/restaurants", label: "Find a Wazwan restaurant" },
  },
  {
    id: "come-hungry-come-many",
    title: "Come Hungry, Come Many",
    text: "Wazwan is best enjoyed in a group. The shared trami experience makes the meal feel cultural, social, and complete.",
    why: "Four to a trami is traditional — fewer guests means more courses go untouched.",
    photos: [
      {
        src: "/images/kashmiri-food/trami-wheel.webp",
        alt: "Guests seated cross-legged on a carpet, eating with their hands from a shared trami",
        caption: "Guests seated around a shared trami.",
        position: "44% 60%",
      },
    ],
    link: { href: SERVED_GUIDE, label: "How Wazwan is served" },
  },
  {
    id: "start-with-the-classics",
    title: "Start with the Classics",
    text: "If you are new to Kashmiri food, begin with Rogan Josh, Gushtaba, Rista, and Tabak Maaz before branching into rarer specialties.",
    why: "These four give you the full range of Wazwan's textures before anything more adventurous.",
    // Shown as four photographs, one per dish, each linking to its page.
    dishes: ["rogan-josh", "gushtaba", "rista", "tabak-maaz"],
    link: { href: "/dishes", label: "Every dish, in serving order" },
  },
  {
    id: "respect-the-finale",
    title: "Respect the Finale",
    text: "Dishes like Gushtaba are traditionally served at the end of a Wazwan, so knowing the order makes the experience far more immersive.",
    why: "Save room — Gushtaba closing the feast is, quite literally, the whole point.",
    photos: [
      {
        src: "/redesign/img/ritual-tashnaer.webp",
        alt: "Water poured from an engraved copper ewer over a guest's cupped hands, into a copper basin",
        caption: "The tash-t-naer, which comes round again once the meal is over.",
        position: "72% 50%",
      },
    ],
    link: { href: "/dishes/gushtaba", label: "Gushtaba, the last course" },
  },
  {
    id: "ask-about-authenticity",
    title: "Ask About Authenticity",
    text: "Some restaurants are polished for tourists, while others preserve older cooking styles. Use the authenticity notes in the app.",
    why: "A place proud of its history will usually tell you, unprompted — it's worth asking if it doesn't.",
    photos: [
      {
        src: "/images/kashmiri-food/hero.webp",
        alt: "A row of cooks in white sitting on the ground, pounding meat on flat stones with wooden mallets",
        caption: "Wazas pounding meat on flat stones.",
        position: "40% 50%",
      },
    ],
    link: { href: "/restaurants", label: "See the restaurant notes" },
  },
  {
    id: "pair-food-with-the-place",
    title: "Pair Food with the Place",
    text: "A Dal Lake setting, an old city dining hall, and a heritage restaurant each create a very different mood around the same dish.",
    why: "Same recipe, different room — the setting changes what the dish means.",
    photos: [
      {
        src: "/redesign/img/amb-dusk.webp",
        alt: "A boatman in a striped shawl paddling a small wooden boat across a lake, houseboats and mountains behind",
        position: "50% 62%",
      },
      {
        src: "/redesign/img/interior-mughal-darbar.webp",
        alt: "A restaurant dining room with painted murals, arches, chandeliers and tables laid with folded white napkins",
        position: "40% 50%",
      },
    ],
    link: { href: "/restaurants/best-wazwan-srinagar", label: "Where to eat in Srinagar" },
  },
];

// The manners of the trami, as /kashmiri-food/wazwan/guide/how-wazwan-is-served sets them out.
export const TRAMI_NOTES = [
  {
    id: "seated",
    title: "Seated at the trami",
    lines: [
      "Guests traditionally sit cross-legged on a dastarkhwan, a long white cloth spread over carpets.",
      "They are grouped in fours, and each four shares one trami. Eat from your own quarter.",
    ],
  },
  {
    id: "order",
    title: "The order of serving",
    lines: [
      "The trami usually arrives under its copper cover, the sarposh, with seekh kebabs and tabak maaz on the rice.",
      "The wazas serve the other courses in turn, usually four pieces at a time. Yakhni comes near the end; gushtaba is the last course.",
    ],
  },
  {
    id: "respectfully",
    title: "Eating respectfully",
    lines: [
      "The tash-t-naer, a copper basin and ewer, comes round first: water is poured over each guest's hands.",
      "Wait until all four are seated; the eldest usually says the opening prayer and begins. Wazwan is eaten by hand, by custom the right hand.",
    ],
  },
  {
    id: "expect",
    title: "What to expect",
    lines: [
      "A full Wazwan runs anywhere from seven to 36 dishes; restaurant sets are much smaller.",
      "The eldest shares out the gushtaba. Hosts often urge extra helpings, and leftovers usually go home with the guests.",
    ],
  },
];

export const FURTHER_READING = [
  { href: "/dishes", label: "The dishes, in serving order" },
  { href: SERVED_GUIDE, label: "How Wazwan is served" },
  { href: "/kashmiri-food/wazwan/guide/cost-guide", label: "What it costs" },
  { href: "/kashmiri-food/wazwan/guide/vegetarian-wazwan", label: "Vegetarian Wazwan" },
];

// The Waza AI demo's sample exchanges, unchanged from the original page.
export const WAZA_SAMPLES = [
  { name: "STREET FOOD", items: [
    { q: "Four of us, and it's pouring outside.", a: [{ text: "Kahwa first, then " }, { text: "Nadru Monje", em: true }, { text: " — hot lotus-stem fritters are made for this weather." }] },
    { q: "Something quick, we only have 20 minutes.", a: [{ text: "Try " }, { text: "Tujji", em: true }, { text: " — skewered mutton, off the grill in minutes." }] },
    { q: "I don't eat spicy food at all.", a: [{ text: "Go for a plain " }, { text: "Lavasa", em: true }, { text: " — soft flatbread from the kandur, gentle on the palate." }] },
    { q: "Anything vegetarian from a street stall?", a: [{ text: "Masala Tsot", em: true }, { text: " — lavasa wrapped round spiced white peas and chutney." }] },
  ] },
  { name: "WAZWAN FEAST", items: [
    { q: "We're six people, first time trying Wazwan.", a: [{ text: "Book a full trami — " }, { text: "seekh kebab", em: true }, { text: " and " }, { text: "tabak maaz", em: true }, { text: " arrive on it first." }] },
    { q: "What comes right before Gushtaba?", a: [{ text: "Yakhni", em: true }, { text: " — mutton in a yogurt and fennel gravy, usually just before the finale." }] },
    { q: "Is there a vegetarian trami option?", a: [{ text: "Ask for the " }, { text: "Vegetarian Wazwan", em: true }, { text: " — built around paneer and lotus stem." }] },
    { q: "How many courses should we expect?", a: [{ text: "Anywhere from " }, { text: "seven to 36", em: true }, { text: " dishes; restaurant sets are much smaller." }] },
    { q: "What's the etiquette at the trami?", a: [{ text: "Wait for the eldest guest — " }, { text: "they", em: true }, { text: " eat first, by tradition." }] },
  ] },
  { name: "KAHWA & SWEETS", items: [
    { q: "What's a good after-dinner drink?", a: [{ text: "Kahwa", em: true }, { text: " — saffron and cinnamon green tea, served from a samovar." }] },
    { q: "Anything sweet to finish the meal?", a: [{ text: "Phirni", em: true }, { text: " — chilled pudding of ground rice or semolina, set in clay bowls." }] },
    { q: "Is Kahwa served with anything?", a: [{ text: "Usually with " }, { text: "Kulcha", em: true }, { text: " or " }, { text: "Bakarkhani", em: true }, { text: " bread on the side." }] },
  ] },
  { name: "SPICE LEVEL", items: [
    { q: "I want the boldest dish on the menu.", a: [{ text: "Rista", em: true }, { text: " — minced mutton balls in a fiery red Kashmiri chili gravy." }] },
    { q: "Something rich but not too spicy?", a: [{ text: "Gushtaba", em: true }, { text: " — pounded meatballs in a mild yogurt curry." }] },
    { q: "What's the mildest dish available?", a: [{ text: "Aab Gosht", em: true }, { text: " — mutton in a mild milk gravy, scented with fennel and cardamom." }] },
    { q: "Can the kitchen adjust spice for me?", a: [{ text: "Ask when you " }, { text: "order", em: true }, { text: " — many kitchens can tone it down." }] },
  ] },
];
