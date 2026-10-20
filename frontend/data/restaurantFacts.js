/**
 * Sourced, dated facts for the three Srinagar Wazwan restaurant pages, rendered server-side
 * beneath the client UI (the database records carry none of this, so crawlers used to see
 * only the client shell). Same rule as the Srinagar guide (data/restaurantGuides.js): every
 * fact names its source, and every price carries the year it was reported. The facts restate
 * the guide; change both together.
 */

const WION_2018 = "https://www.wionews.com/india-news/bite-of-history-srinagars-iconic-restaurant-turns-100-36510";
const TRIBUNE_2018 = "https://www.tribuneindia.com/news/archive/jammu-kashmir/at-100-srinagar-bakery-looks-ahead-611519/";
const KASHMIR_LIFE_2025 = "https://kashmirlife.net/kashmir-breads-bakeries-vol-17-issue-01-386813/";
const OT_2022 = "https://www.outlooktraveller.com/experiences/food-and-drink/of-kashmiri-wazwan-and-more";
const OT_2024 = "https://www.outlooktraveller.com/destinations/india/city-guide-all-about-srinagar-the-land-of-lakes-and-gardens";
const SO_CITY_2018 = "https://so.city/srinagar/article/6-best-places-for-an-absolutely-delicious-wazwan-feast-in-srinagar";

export const RESTAURANT_FACTS = {
  ahdoos: {
    name: "Ahdoos",
    area: "Residency Road, central Srinagar",
    summary:
      "Ahdoos, on Residency Road in central Srinagar, began as a bakery in 1918 and is called the first restaurant in the Valley to serve Kashmiri Wazwan. A meal for two was about ₹1,500 in January 2024.",
    facts: [
      {
        text: "Ahdoos is on Residency Road in central Srinagar. It started as a bakery in 1918 and had become a restaurant by the 1920s.",
        refs: [
          { label: "WION, 2018", href: WION_2018 },
          { label: "The Tribune, 2018", href: TRIBUNE_2018 },
        ],
      },
      {
        text: "Kashmir Life's 2025 history of the Valley's bakeries calls it the first restaurant in the Valley to serve Kashmiri Wazwan.",
        refs: [{ label: "Kashmir Life, 2025", href: KASHMIR_LIFE_2025 }],
      },
      {
        text: "In January 2024, Outlook Traveller's Srinagar city guide put a meal for two at about ₹1,500.",
        refs: [{ label: "Outlook Traveller, 2024", href: OT_2024 }],
      },
    ],
  },
  "mughal-darbar": {
    name: "Mughal Darbar",
    area: "Residency Road, central Srinagar",
    summary:
      "Mughal Darbar, upstairs on Residency Road in Srinagar, dates to 1984. Outlook Traveller recommended its rista and gushtaba in 2022 and put a meal for two at about ₹1,000 in January 2024.",
    facts: [
      {
        text: "Mughal Darbar is upstairs on Residency Road in central Srinagar, and Kashmir Life dates it to 1984.",
        refs: [{ label: "Kashmir Life, 2025", href: KASHMIR_LIFE_2025 }],
      },
      {
        text: "Outlook Traveller recommended it for Wazwan in 2022, naming its rista and gushtaba.",
        refs: [{ label: "Outlook Traveller, 2022", href: OT_2022 }],
      },
      {
        text: "In January 2024, Outlook Traveller's Srinagar city guide put a meal for two at about ₹1,000.",
        refs: [{ label: "Outlook Traveller, 2024", href: OT_2024 }],
      },
    ],
  },
  shamyana: {
    name: "Shamyana",
    area: "Ghat No. 2, Boulevard Road, beside Dal Lake",
    summary:
      "Shamyana is at Ghat No. 2 on Boulevard Road, beside Dal Lake in Srinagar. Recommended for Wazwan by so.city in 2018 and Outlook Traveller in 2022; a meal for two was about ₹800 in January 2024.",
    facts: [
      {
        text: "Shamyana is at Ghat No. 2 on Boulevard Road, beside Dal Lake.",
        refs: [{ label: "so.city, 2018", href: SO_CITY_2018 }],
      },
      {
        text: "The city guide so.city recommended it for Wazwan in 2018, as did Outlook Traveller in 2022.",
        refs: [
          { label: "so.city, 2018", href: SO_CITY_2018 },
          { label: "Outlook Traveller, 2022", href: OT_2022 },
        ],
      },
      {
        text: "In January 2024, Outlook Traveller's Srinagar city guide put a meal for two at about ₹800.",
        refs: [{ label: "Outlook Traveller, 2024", href: OT_2024 }],
      },
    ],
  },
};
