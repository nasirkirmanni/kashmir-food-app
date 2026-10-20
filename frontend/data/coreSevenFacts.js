/**
 * The fact box at the top of each core-seven story, and the entities its structured data
 * names. Every line restates something the story itself sources (the ledgers are in
 * docs/core-seven-stories/research); numbers carry their source inline so the box can be quoted
 * on its own. Server-only: the story pages and the series page import it, client code doesn't.
 */

const SKIMS = "https://www.jmsskims.org/index.php/jms/article/view/153";
const GI = (n) => `https://search.ipindia.gov.in/GIRPublicSearch/Application/Details/${n}`;
const CHILLI = "https://en.wikipedia.org/wiki/Kashmiri_red_chilli";
const WP = (title) => `https://en.wikipedia.org/wiki/${title}`;
const WD = (id) => `https://www.wikidata.org/wiki/${id}`;
const SITE = "https://wazwanway.com";

// Checked on the Geographical Indications Registry on this date; all three were at
// pre-examination.
export const GI_CHECKED = "17 October 2026";

import { coreSevenStoryForDish } from "./coreSevenSeries";

const thing = (name, dish, sameAs = []) => ({
  "@type": "Thing",
  name,
  url: `${SITE}/dishes/${dish}`,
  ...(sameAs.length ? { sameAs } : {}),
});

export const WAZWAN_ENTITY = {
  "@type": "Thing",
  name: "Wazwan",
  sameAs: [WP("Wazwan"), WD("Q4102393")],
};
const CHILLI_ENTITY = {
  "@type": "Thing",
  name: "Kashmiri red chilli",
  sameAs: [WP("Kashmiri_red_chilli"), WD("Q108030809")],
};

export const CORE_SEVEN_FACTS = {
  "tabak-maaz-ribs-cooked-twice": {
    summary:
      "The ribs on the rice when the trami arrives: why they are boiled and then fried in ghee, what a plate has to do with the name, and where Kashmir's sheep now come from.",
    answer:
      "Tabak maaz is lamb ribs cooked twice: simmered with spices until the bones loosen, then fried in ghee until reddish brown. It is served dry, on the rice, as one of the first dishes of a Wazwan.",
    glance: [
      ["Name", "Plate-meat: *tabakh* is a large dish, plate or tray and *māz* is meat, in Grierson's dictionary of Kashmiri"],
      ["In the feast", "First: on the trami when it arrives, with seekh kebabs, methi maaz and chicken, before any gravy"],
      ["Meat", "The rib cage, cut into rectangles with the fat left on"],
      ["Cooking", "Boiled (in water in the wazas' published recipe; milk or yogurt in other accounts), then fried in ghee until reddish brown"],
      ["Portion", "Two to four pieces to a trami of four"],
      ["Calories", `About 1,470 per trami, 367 per diner, at one Srinagar wedding ([SKIMS, 2012](${SKIMS}))`],
      ["Pandit name", "Kabargah"],
      ["GI status", `Application 1336, "Tabakmaaz (Meat Products) of Kashmir", filed 8 August 2024; at pre-examination when we checked on ${GI_CHECKED} ([GI Registry](${GI(1336)}))`],
    ],
    about: thing("Tabak maaz", "tabak-maaz", [WP("Tabak_maaz"), WD("Q130470549")]),
    mentions: [WAZWAN_ENTITY],
    photo: null,
  },
  "rista-pounded-meatballs": {
    summary:
      "The red meatball that opens the gravies: how wazas pound it from mutton killed that morning, what Srinagar's meat scientists found, and what turns the gravy red.",
    answer:
      "Rista is a ball of mutton pounded with fat, about 80 to 100 g, boiled and then cooked in a red gravy of Kashmiri chilli, mawal, saffron and fennel. It is the first gravy served at a Wazwan.",
    glance: [
      ["In the feast", "First of the gravies, after the dishes that arrive on the trami"],
      ["Meat", "Leg meat, pounded on a stone within the hour of slaughter, with fresh fat"],
      ["Fat", "20% lamb fat was the optimum in a 1994 study of rista ([*Meat Science*](https://doi.org/10.1016/0309-1740(94)90052-3))"],
      ["Colour", "Kashmiri chilli, mawal (the dried cockscomb flower) and saffron; alkanet in some accounts; no tomato"],
      ["Heat", `Usually mild: Kashmiri chilli rates about 1,000 to 2,000 Scoville units ([Wikipedia](${CHILLI}))`],
      ["Portion", "One per diner, four to a trami; about 80 to 100 g each"],
      ["Calories", `About 1,814 per trami, 454 per diner, the most of any dish served in a gravy at one Srinagar wedding ([SKIMS, 2012](${SKIMS}))`],
    ],
    about: thing("Rista", "rista", [WP("Riste_(dish)"), WD("Q135831053")]),
    mentions: [WAZWAN_ENTITY, CHILLI_ENTITY],
    photo: null,
  },
  "rogan-josh-history": {
    summary:
      "Kashmir's most famous dish: what the name may mean, what is documented about where it came from, the three things that make it red, and how it turned tomato-red abroad.",
    answer:
      "Rogan josh is mutton or goat, usually on the bone, braised in a red gravy coloured with Kashmiri chilli and mawal, the dried cockscomb flower, or with ratan jot in some Kashmiri Pandit kitchens. Rogan josh cooked in Kashmir has no tomato.",
    glance: [
      ["Name", "Uncertain: *roghan* is ghee or oil in Persian, and Grierson's dictionary glosses Kashmiri *rōgan* as clarified butter; another reading takes it as \"red\""],
      ["In the feast", "Early among the gravies, after rista"],
      ["Meat", "On the bone, from the lower ribs, lower back, chest, neck and shoulder, in pieces of about 70 to 80 g"],
      ["Colour", "Kashmiri chilli and mawal (the dried cockscomb flower); ratan jot (alkanet root) in some Pandit kitchens; saffron in some; never tomato"],
      ["Heat", `Usually medium: Kashmiri chilli rates about 1,000 to 2,000 Scoville units ([Wikipedia](${CHILLI}))`],
      ["Portion", "Four pieces to a trami of four"],
      ["Calories", `About 1,322 per trami, 331 per diner, at one Srinagar wedding ([SKIMS, 2012](${SKIMS}))`],
      ["Two versions", "Kashmiri Muslim, with praan, garlic, mawal and ghee; Kashmiri Pandit, with no onion or garlic, and asafoetida, curd, dry ginger, fennel and mustard oil"],
    ],
    about: thing("Rogan josh", "rogan-josh", [WP("Rogan_josh"), WD("Q1135831")]),
    mentions: [WAZWAN_ENTITY, CHILLI_ENTITY],
    photo: null,
  },
  "aab-gosht-milk-curry": {
    summary:
      "The Wazwan's milk curry: ten litres of milk reduced to one, a Persian name that means meat broth, and why the milk, not the mutton, is the local ingredient.",
    answer:
      "Aab gosht is mutton, usually a large piece, boiled and then cooked in milk reduced with fennel, cardamom, cloves, cinnamon, ginger, shallot and garlic. It is mild and pale, and comes late in a Wazwan.",
    glance: [
      ["Name", "Persian for meat broth (*āb*, water, and *gūsht*, meat); in Kashmiri, *dodhe maaz*, milk-meat"],
      ["In the feast", "Late, among the pale dishes, before yakhni and gushtaba"],
      ["Meat", "A large piece: tail, shoulder, shank, lower back or ribs, depending on the account"],
      ["Milk", "Ten litres of cow's milk reduced to one, in a waza's account; home recipes use full-cream milk powder"],
      ["Portion", "One large piece to a trami of four, at the wedding a medical team recorded in 2012"],
      ["Calories", `About 934 per trami, 234 per diner; only the single piece of dani was lighter at one Srinagar wedding ([SKIMS, 2012](${SKIMS}))`],
      ["Heat", "None: no chilli, tomato or turmeric in any account we have read"],
      ["Not to be confused with", "Iran's *abgoosht*, or dizi, a stew of lamb, chickpeas and beans"],
    ],
    about: thing("Aab gosht", "aab-gosht", [WP("Aab_gosh"), WD("Q135983909")]),
    mentions: [WAZWAN_ENTITY],
    photo: null,
  },
  "daniwal-korma-coriander": {
    summary:
      "The green dish between the red ones: a cool-season herb at an autumn feast, a korma unlike the Mughal kind, and the coriander seed that stays out of the pot.",
    answer:
      "Daniwal korma is mutton on the bone braised in a yogurt gravy with praan and garlic and finished with a great deal of fresh coriander. It is mild, and it is served in the middle of a Wazwan.",
    glance: [
      ["Name", "*Dāñĕwal* is the coriander leaf in Grierson's dictionary of Kashmiri; korma is a braise"],
      ["In the feast", "In the middle: after rogan josh and before marchwangan korma, in one account"],
      ["Meat", "On the bone, from the bony portions of the carcass"],
      ["Base", "Yogurt and stock, with praan (the Kashmiri shallot) and garlic roasted golden"],
      ["Herb", "Fresh coriander leaf, not the seed, added at the end"],
      ["Heat", "None: no chilli in any account; the one that names a colour calls the gravy white"],
      ["Calories", `No published figure: it was not among the dishes counted in the one study ([SKIMS, 2012](${SKIMS}))`],
    ],
    about: thing("Daniwal korma", "daniwal-korma", [WP("Daniwal_korme"), WD("Q136297320")]),
    mentions: [WAZWAN_ENTITY],
    // The owner's photograph of the dish (added in release 9, used on /dishes/daniwal-korma).
    photo: {
      src: "/images/dishes/daniwal-korma.jpg",
      width: 1200,
      height: 1034,
      alt: "Daniwal korma: mutton in a coriander gravy, in a white bowl topped with fresh coriander leaves",
    },
  },
  "marchwangan-korma-chilli": {
    summary:
      "The Wazwan's one fiery dish, made with a mild chilli: the string of chillies in its name, the pepper Kashmir used before the chilli came, and the Valley's application to protect its long chilli.",
    answer:
      "Marchwangan korma is mutton, in smaller pieces than rogan josh, braised in a thick gravy built on Kashmiri red chilli. It is the hottest dish of a Wazwan, by the quantity of chilli rather than its strength.",
    glance: [
      ["Name", "Chilli-braise: *marʦ* is the red chilli in Grierson's dictionary of Kashmiri, and korma a braise"],
      ["In the feast", "In the middle of the meat courses; the last hot dish before the pale ones"],
      ["Meat", "Mutton in smaller pieces than rogan josh, from the bony portions"],
      ["Heat", `The hottest on the trami: Kashmiri chilli is mild, about 1,000 to 2,000 Scoville units ([Wikipedia](${CHILLI})), but the dish uses a great deal of it, by one estimate three-quarters of the feast's chilli`],
      ["Portion", "Four to six pieces to a trami of four"],
      ["Calories", `About 1,059 per trami, 265 per diner, at one Srinagar wedding ([SKIMS, 2012](${SKIMS}))`],
      ["Served with", "Muji chetin, the radish-and-curd chutney, in the same run of courses"],
      ["The chilli's GI", `Application 1295, "Kashmiri Long Chilli", filed 26 June 2024; at pre-examination when we checked on ${GI_CHECKED} ([GI Registry](${GI(1295)}))`],
    ],
    // No Wikipedia or Wikidata entry of its own: "Marchwangan korma" redirects to Wazwan.
    about: thing("Marchwangan korma", "marchwangan-korma"),
    mentions: [WAZWAN_ENTITY, CHILLI_ENTITY],
    photo: null,
  },
  "gushtaba-last-dish-of-wazwan": {
    summary:
      "The meatball that closes every Wazwan: the dish of kings in the dictionary, the hour between slaughter and pounding, what the laboratory found, and the Soviet leader in the story.",
    answer:
      "Gushtaba is a large ball of mutton pounded with fat, boiled, and cooked in yakhni, a white gravy of yogurt and mutton broth scented with cardamom, fennel, dry ginger and dried mint. It is served last.",
    glance: [
      ["Name", "*Gusht-āba*, \"a rich soup of pounded or minced meat\", in Grierson's dictionary of Kashmiri; also called the Dish of Kings"],
      ["In the feast", "Last of the meat dishes; dessert and kahwa follow"],
      ["Meat", "Leg meat, pounded on a stone within the hour of slaughter, with fresh fat"],
      ["Gravy", "Yakhni: yogurt and mutton broth with cardamom, cinnamon, fennel, dry ginger, cloves and dried mint; no chilli or turmeric"],
      ["Portion", "One to a trami of four, divided by the eldest: 200 to 400 g in one account, 500 to 750 g weighed at one wedding"],
      ["Calories", `About 1,787 per trami, 447 per diner, at one Srinagar wedding ([SKIMS, 2012](${SKIMS}))`],
      ["GI status", `Application 1337, "Goshtaba (Meat Products) of Kashmir", filed 8 August 2024; at pre-examination when we checked on ${GI_CHECKED} ([GI Registry](${GI(1337)}))`],
    ],
    about: thing("Gushtaba", "gushtaba", [WP("Goshtaab"), WD("Q16573500")]),
    mentions: [WAZWAN_ENTITY],
    photo: null,
  },
};

/**
 * The dish as an entity for its own page's Recipe schema: its identity elsewhere, and the story
 * about it (Thing.subjectOf). Only the seven essentials have one.
 */
export function dishEntity(dishSlug) {
  const story = coreSevenStoryForDish(dishSlug);
  const facts = story && CORE_SEVEN_FACTS[story.slug];
  if (!facts) return null;
  return {
    ...facts.about,
    subjectOf: { "@type": "Article", headline: story.title, url: `${SITE}${story.href}` },
  };
}

/** The questions the series page answers, shown on the page and sent as FAQPage schema. */
export const CORE_SEVEN_HUB_FAQ = [
  {
    question: "What are the seven essential dishes of a Wazwan?",
    answer:
      "Tabak maaz, rista, rogan josh, aab gosht, daniwal korma, marchwangan korma and gushtaba. Three different sources name the same seven: Wikipedia, citing The Hindu; the Waza family's cookbook, published by Roli Books; and the former tourism director M. Saleem Beg in the Daily Excelsior.",
  },
  {
    question: "Were these the original seven dishes of the Wazwan?",
    answer:
      "No one can show that. The feast is often said to have begun as a seven-dish meal, and a 74-year-old waza told Reuters in 2026 that there were only seven mutton dishes in his forefathers' time, but no document names which seven. The stories treat the claim as a tradition, not a record.",
  },
  {
    question: "In what order are the seven served?",
    answer:
      "Tabak maaz is on the trami when it arrives; rista opens the gravies; rogan josh, daniwal korma and marchwangan korma follow in the middle of the meal; aab gosht comes among the pale dishes; gushtaba is last. Kitchens vary in the middle of the feast, and the stories say where the accounts differ.",
  },
  {
    question: "How were the stories researched?",
    answer:
      "From sources that could be read and checked: Grierson's Dictionary of the Kashmiri Language, Walter Lawrence's The Valley of Kashmir (1895), Kashmiri cookbooks including the Waza family's own, a 2012 study by researchers at the Sher-i-Kashmir Institute of Medical Sciences that counted the calories in a wedding feast, food-science papers from Srinagar's universities, government figures, the Geographical Indications Registry and reporting from Kashmir. Each story lists its sources, and sources that could not be read are not cited as if they had been.",
  },
];
