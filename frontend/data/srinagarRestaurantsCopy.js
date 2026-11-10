/**
 * The /restaurants directory's own words: the findings at the top and the questions it answers.
 * Same rules as data/srinagarRestaurants.js: [[key]] cites a source ([[g:<slug>]] a place's Google
 * listing), [text](/path) links within the site, and nothing here goes beyond what that file records.
 */

export const DIRECTORY_FINDINGS = [
  {
    lead: "Only one restaurant publishes a full Wazwan price list.",
    text: "[Mughal Darbar (upstairs)](/restaurants/mughal-darbar-upstairs) sells a trami for four at ₹6,200, a one-person plate at ₹1,300 and a 10 kg majma at ₹10,000 on its own website, seen 10 Nov 2026 [[mdup]]. Elsewhere the prices are journalists' estimates for two, delivery-app figures or Google users' per-person ranges.",
  },
  {
    lead: "Most places sell Wazwan as a thali or by the plate.",
    text: "[Kareema](/restaurants/kareema), [JJ Foods](/restaurants/jj-foods), [Salam e Wazwan](/restaurants/salam-e-wazwan), [Dawat E Wazwan](/restaurants/dawat-e-wazwan), [Wazwan Stories](/restaurants/wazwan-stories), [Authentic Wazwan](/restaurants/authentic-wazwan) and [Wazwan Box](/restaurants/wazwan-box) all list a Wazwan thali. A trami for four with a stated size appears only at Mughal Darbar (upstairs) and on a Zomato listing in Rainawari.",
  },
  {
    lead: "Two different businesses trade as Mughal Darbar on Residency Road.",
    text: "The upstairs one has no Google listing; the ground-floor one holds the listing with 8,103 reviews. [See the two compared](/restaurants/mughal-darbar).",
  },
  {
    lead: "The old city has strong review evidence and little web presence.",
    text: "[Shahi Pakwaan](/restaurants/shahi-pakwaan) in Nowhatta has 86 Google reviews that mention Wazwan and no website. In Wazpora, [JJ Foods](/restaurants/jj-foods) and [Lazeez Wazwan](/restaurants/lazeez-wazwan) are run by waza families and were profiled by Greater Kashmir in 2026 [[gk26jan]].",
  },
  {
    lead: "Stream is not confirmed as a Wazwan restaurant.",
    text: "[Stream](/restaurants/stream-restaurant) has the most Google reviews here, 13,327, but only two June 2026 reviews mention a Wazwan thali.",
  },
  {
    lead: "Bismillah on Jawahar Nagar is now marked permanently closed on Google.",
    text: "So City recommended its trami and its sweet pulao with walnut chutney in 2018 [[socity18]].",
  },
];

/** The directory's questions; the counts come from the data so the answer can't drift from the list. */
export function directoryFaq({ places, strong, google, app, unconfirmed }) {
  return [
    {
      question: "Which restaurants in Srinagar serve Wazwan?",
      answer: `This directory lists ${places} places with evidence that they serve Wazwan: ${strong} on the restaurant's own menu or in the press, ${google} on Google's menus and reviews, ${app} on a delivery-app listing and ${unconfirmed} on a couple of reviews only. They include [Ahdoos](/restaurants/ahdoos), [Kareema](/restaurants/kareema) and the [two Mughal Darbars](/restaurants/mughal-darbar) on Residency Road, [JJ Foods](/restaurants/jj-foods) and [Lazeez Wazwan](/restaurants/lazeez-wazwan) in Wazpora, [Salam e Wazwan](/restaurants/salam-e-wazwan) in Shalimar and [Firdaus](/restaurants/firdaus) at the Radisson Collection.`,
    },
    {
      question: "Where can you get a full Wazwan trami for four in Srinagar?",
      answer:
        "[Mughal Darbar (upstairs)](/restaurants/mughal-darbar-upstairs) sells a Full Wazwan Trami for four at ₹6,200 on its website, seen on 10 Nov 2026 [[mdup]]. Google's menus show a Wazwan trami at [Mughal Darbar (ground floor)](/restaurants/mughal-darbar-ground-floor) [[g:mughal-darbar-ground-floor]] and a Wazwan Trami Thali at [Salam e Wazwan](/restaurants/salam-e-wazwan) [[g:salam-e-wazwan]], without prices, and [Taj Dal View](/restaurants/taj-dal-view) offers a bookable multi-course Wazwan Experience [[taj_exp]].",
    },
    {
      question: "Can one person order Wazwan at a restaurant?",
      answer:
        "Yes. Most places sell Wazwan as a thali or by the plate. Kareema's Wazwan thali was recommended by Outlook Traveller in 2022 [[ot22]]; JJ Foods, Salam e Wazwan, Dawat E Wazwan, Wazwan Stories and Authentic Wazwan list a Wazwan thali on Google; and Mughal Darbar (upstairs) sells a Wazwan Full Plate for one at ₹1,300 [[mdup]].",
    },
    {
      question: "How much does Wazwan cost at a restaurant in Srinagar?",
      answer:
        "The figures found run from a ₹200 mini Wazwan thali on Swiggy [[swiggy_dw]] to ₹6,200 for a trami for four [[mdup]]. In January 2024 Outlook Traveller put a meal for two at about ₹800 to ₹1,500 at the restaurants its city guide names [[ot24]], and Google users report paying ₹400 to ₹1,400 per person at most of the Wazwan places listed here. Every price on these pages carries its date.",
    },
    {
      question: "Which Srinagar restaurants deliver Wazwan?",
      answer:
        "Mughal Darbar (upstairs) delivers Wazwan packed in tins [[mdup]]. Google lists delivery for Ahdoos [[g:ahdoos]], JJ Foods [[g:jj-foods]], Salam e Wazwan [[g:salam-e-wazwan]] and Wazwan Stories [[g:wazwan-stories]], among others, and Wazwan Box sells Wazwan thalis through Zomato [[zom_box]], though Google warns it may be closed. Nobody here tested a delivery.",
    },
    {
      question: "Is Mughal Darbar upstairs or on the ground floor?",
      answer:
        "Both. Two separate businesses trade as Mughal Darbar a few steps apart on Residency Road, with different websites and phone numbers, and no source explains how they are related. [Mughal Darbar: two restaurants, one name](/restaurants/mughal-darbar) compares them.",
    },
    {
      question: "Which was the first restaurant in Kashmir to serve Wazwan?",
      answer:
        "Kashmir Life calls [Ahdoos](/restaurants/ahdoos) the first restaurant in the Valley to serve Wazwan [[kl25]]. It began as a bakery in 1918 [[kl25]] and had become a restaurant by the 1920s [[trib18]].",
    },
  ];
}

/** The two-Mughal-Darbars page's questions. */
export const MUGHAL_DARBAR_FAQ = [
  {
    question: "Is Mughal Darbar on Residency Road upstairs or on the ground floor?",
    answer:
      "Both: two separate businesses use the name a few steps apart on Residency Road. The upstairs restaurant runs mughal-darbar.com [[mdup]]; the ground-floor one, near the GPO in Munshi Bagh, runs mughaldarbar.in [[mdgf]] and holds the Google listing [[g:mughal-darbar-ground-floor]].",
  },
  {
    question: "Which Mughal Darbar is the original?",
    answer:
      "No source settles it. The upstairs restaurant's website says Haji Mohammad Ibrahim Mugloo founded it in 1984 [[mdup]], and Kashmir Life's 2018 obituary calls him the owner of Mughal Darbar on Residency Road [[kl18]]. Kashmir Life also profiles a Mughal Darbar founded in 1984 by Ghulam Qadir Grustoo, which added a bakery in 1992, without naming a floor [[kl25]]; the ground-floor business is the one that runs a bakery [[mdgf]].",
  },
  {
    question: "Which Mughal Darbar sells a Wazwan trami?",
    answer:
      "The upstairs restaurant sells a Full Wazwan Trami for four at ₹6,200 on its website, seen on 10 Nov 2026 [[mdup]]. Google's menu for the ground-floor restaurant shows a Wazwan trami, without a price [[g:mughal-darbar-ground-floor]].",
  },
  {
    question: "Which Mughal Darbar do the travel guides mean?",
    answer:
      "Most don't say. Outlook Traveller [[ot22]] [[ot24]], So City [[socity18]], a 2017 blog [[kiruba17]] and TravelCoffee [[tc26]] name Mughal Darbar without a floor. TravelTriangle [[tt24]], a 2018 blog [[moha18]] and a Lonely Planet snippet [[lp_md]] place it upstairs; Curly Tales gives the ground-floor address [[ct22]].",
  },
];
