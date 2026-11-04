import { STILL_KASHMIR_PLAN, STILL_KASHMIR_SITE } from "../lib/stillKashmir";

/**
 * What Still Kashmir says about itself on stillkashmir.com, for the Visit Kashmir page (app/still-kashmir).
 * Every line here is the agency's own, quoted from its home page as published on the date below, and each
 * link goes to the page on its site that the line came from. Nothing here is Wazwan Way's own claim, so
 * when the agency's site changes, update these lines from it rather than rewriting them.
 */
export const STILL_KASHMIR_CHECKED = "5 November 2026";

const at = (path) => `${STILL_KASHMIR_SITE}${path}`;

export const STILL_KASHMIR_TAGLINE = "Private journeys through the Kashmir valley.";

export const STILL_KASHMIR_WAYS_INTRO = "Choose what draws you to Kashmir. Every journey can be shaped around you.";

export const STILL_KASHMIR_WAYS = [
  { title: "Curated Journeys", line: "Our signature Kashmir itineraries — planned, tested and fully arranged.", href: at("/journeys/curated-journeys") },
  { title: "Honeymoon & Couples", line: "Kashmir for two — slower days, private moments, a night on the water.", href: at("/journeys/honeymoon-couples") },
  { title: "Offbeat Kashmir", line: "Gurez, Lolab and Keran open in May; Doodhpathri and Yusmarg are snow days from Srinagar.", href: at("/journeys/offbeat-kashmir") },
  { title: "Experiences & Activities", line: "Ski lessons, the Gulmarg Gondola, old-city walks and a wazwan: over thirty experiences.", href: at("/experiences") },
  { title: "Weddings", line: "Your wedding in Kashmir — planned and managed end to end.", href: at("/journeys/weddings") },
  { title: "Corporate Travel", line: "Offsites, retreats and incentive trips — handled for your team from arrival to departure.", href: at("/journeys/corporate-travel") },
  { title: "Snow & Ski in Gulmarg", line: "Learn to ski on Gulmarg’s slopes, or take the gondola above the clouds.", href: at("/experiences#items-adventure") },
  { title: "Plan My Own Journey", line: "Not sure yet? Tell us when you’d like to come, and we’ll suggest a journey.", href: STILL_KASHMIR_PLAN },
];

export const STILL_KASHMIR_PROMISE =
  "No coach tours, no fixed departures. A private chauffeur, a dedicated concierge and a journey shaped entirely around you.";

export const STILL_KASHMIR_INCLUDES = [
  { title: "Private car & chauffeur", line: "Your own car and chauffeur for the whole journey, on your schedule." },
  { title: "Private concierge", line: "One dedicated concierge from arrival to departure, reachable day and night." },
  { title: "Handpicked stays", line: "Hotels, heritage houses and lakeside suites, each inspected by our team." },
  { title: "Every detail arranged", line: "Transfers, permits and reservations handled before you land." },
];

export const STILL_KASHMIR_JOURNEYS_HREF = at("/packages");

// The drive times the agency gives from Srinagar, nearest first.
export const STILL_KASHMIR_DRIVES = {
  from: { name: "Srinagar", note: "30 min from the airport", href: at("/destinations/srinagar") },
  places: [
    { name: "Yusmarg", time: "1.5 h", href: at("/destinations/yusmarg") },
    { name: "Doodhpathri", time: "1.5 h", href: at("/destinations/doodhpathri") },
    { name: "Gulmarg", time: "2 h", href: at("/destinations/gulmarg") },
    { name: "Sonamarg", time: "2.5 h", href: at("/destinations/sonamarg") },
    { name: "Pahalgam", time: "2.5 h", href: at("/destinations/pahalgam") },
    { name: "Gurez Valley", time: "5–6 h", href: at("/destinations/gurez") },
  ],
};

export const STILL_KASHMIR_CONTACT = {
  whatsapp: { label: "+91 70066 54379", href: "https://wa.me/917006654379" },
  call: { label: "+91 70066 54379", href: "tel:+917006654379" },
  email: "hello@stillkashmir.com",
  office: "Natipora, Srinagar, Jammu & Kashmir",
  hours: "Daily 09:00 – 21:00",
};
