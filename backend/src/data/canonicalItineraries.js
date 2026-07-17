// Canonical Itineraries — SEO preset definitions (T9)
//
// The 8 approved high-intent itineraries. Each is ONLY a `preferences` preset +
// SEO metadata — there is NO hardcoded itinerary content. The same rules engine
// (services/itineraryPlanner.js) generates the day-by-day plan on request, so
// canonical and personalized itineraries always come from one engine.
//
// Served publicly (GET, cacheable) and rendered as indexable /itineraries/[slug]
// pages. Order controls listing order.

export const canonicalItineraries = [
  {
    slug: "3-day-kashmir-itinerary",
    seoTitle: "3 Day Kashmir Itinerary — A Perfect Short Trip",
    seoDescription:
      "A ready-made 3 day Kashmir itinerary: Srinagar's Dal Lake, Mughal gardens and authentic Wazwan, with day-by-day timings, stays and costs.",
    blurb: "Srinagar, Dal Lake and Mughal gardens — the essential short escape.",
    preferences: {
      lengthDays: 3, season: "summer", pace: "balanced",
      style: ["family"], interests: ["lakes", "gardens", "food"],
      budgetTier: "Mid-Range", travelers: { adults: 2 },
    },
  },
  {
    slug: "5-day-kashmir-itinerary",
    seoTitle: "5 Day Kashmir Itinerary — Srinagar, Gulmarg & Pahalgam",
    seoDescription:
      "The classic 5 day Kashmir itinerary covering Srinagar, Gulmarg and Pahalgam — daily routes, travel times, where to eat Wazwan, stays and a cost estimate.",
    blurb: "The classic loop: Srinagar, Gulmarg and Pahalgam in five days.",
    preferences: {
      lengthDays: 5, season: "summer", pace: "balanced",
      style: ["family", "photography"], interests: ["mountains", "lakes", "meadows", "gardens", "food"],
      budgetTier: "Premium", travelers: { adults: 2 },
    },
  },
  {
    slug: "7-day-kashmir-itinerary",
    seoTitle: "7 Day Kashmir Itinerary — The Complete Valley Tour",
    seoDescription:
      "A relaxed 7 day Kashmir itinerary across Srinagar, Gulmarg, Pahalgam and Sonamarg with hidden gems, Wazwan stops, timings, stays and estimated costs.",
    blurb: "A week across the valley, from Dal Lake to alpine meadows.",
    preferences: {
      lengthDays: 7, season: "summer", pace: "relaxed",
      style: ["photography"], interests: ["mountains", "lakes", "meadows", "hidden gems", "food"],
      budgetTier: "Premium", travelers: { adults: 2 },
    },
  },
  {
    slug: "kashmir-honeymoon-itinerary",
    seoTitle: "Kashmir Honeymoon Itinerary — Romantic Gulmarg & Pahalgam",
    seoDescription:
      "A romantic Kashmir honeymoon itinerary: a Dal Lake houseboat, Gulmarg's meadows and Pahalgam's valleys, with luxury stays, Wazwan dining and costs.",
    blurb: "Houseboats, gondolas and quiet valleys — a romantic escape.",
    preferences: {
      lengthDays: 6, season: "summer", pace: "balanced",
      style: ["honeymoon", "luxury"], interests: ["lakes", "meadows", "gardens"],
      accommodation: ["houseboats", "luxury hotels"], budgetTier: "Luxury", travelers: { adults: 2 },
    },
  },
  {
    slug: "family-kashmir-trip-5-days",
    seoTitle: "Family Kashmir Trip — 5 Day Itinerary With Kids",
    seoDescription:
      "A family-friendly 5 day Kashmir itinerary with easy, safe routes, kid-friendly sights, comfortable stays and Wazwan the whole family will love.",
    blurb: "Easy, safe and unforgettable — Kashmir with the whole family.",
    preferences: {
      lengthDays: 5, season: "summer", pace: "relaxed",
      style: ["family"], interests: ["lakes", "gardens", "meadows", "food"],
      budgetTier: "Mid-Range", travelers: { adults: 2, children: 2 },
    },
  },
  {
    slug: "kashmir-winter-snow-itinerary",
    seoTitle: "Kashmir Winter Itinerary — Snow, Gulmarg & Skiing",
    seoDescription:
      "A 5 day Kashmir winter itinerary built around Gulmarg's snow and skiing, snowy Srinagar and warming Harissa, with timings, stays and cost estimates.",
    blurb: "Snow, the Gulmarg gondola and warm Harissa mornings.",
    preferences: {
      lengthDays: 5, season: "winter", pace: "balanced",
      style: ["adventure", "photography"], interests: ["winter sports", "mountains", "food"],
      budgetTier: "Premium", travelers: { adults: 2 },
    },
  },
  {
    slug: "kashmir-adventure-trekking-itinerary",
    seoTitle: "Kashmir Adventure & Trekking Itinerary — 6 Days",
    seoDescription:
      "A 6 day Kashmir adventure itinerary with treks and alpine meadows around Aru, Sonamarg and Pahalgam, plus routes, timings, camps and estimated costs.",
    blurb: "Meadows, glaciers and trails for the active traveler.",
    preferences: {
      lengthDays: 6, season: "summer", pace: "packed",
      style: ["adventure"], interests: ["trekking", "mountains", "meadows", "road trips"],
      budgetTier: "Mid-Range", travelers: { adults: 2 },
    },
  },
  {
    slug: "kashmir-food-trail-wazwan-itinerary",
    seoTitle: "Kashmir Food Trail — A 4 Day Wazwan & Street Food Itinerary",
    seoDescription:
      "A 4 day Kashmir food itinerary through Srinagar's Old City — Wazwan feasts, Kandur bakeries, street food and Kahwa — with the best places to eat and costs.",
    blurb: "Old City bakeries, street grills and a full Wazwan trami.",
    preferences: {
      lengthDays: 4, season: "autumn", pace: "balanced",
      style: ["family"], interests: ["food", "wazwan", "culture", "shopping"],
      food: ["wazwan lover", "street food"], budgetTier: "Premium", travelers: { adults: 2 },
    },
  },
];

export const canonicalBySlug = Object.freeze(
  canonicalItineraries.reduce((acc, c) => {
    acc[c.slug] = c;
    return acc;
  }, {})
);
