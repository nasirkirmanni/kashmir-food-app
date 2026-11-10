import dishes from "../data/dishes.json";
import { SOURCES } from "../data/srinagarRestaurants";
import { dishEntity } from "../data/coreSevenFacts";
import { SITE, openingText, plainText, restaurantPath } from "./srinagarRestaurants";

/**
 * Schema.org markup for a Srinagar directory profile (components/restaurants/RestaurantProfile.js).
 * Only what the record holds: no rating (Google's figures are a third party's, shown on the page with
 * their date), no coordinates (the research has none), hours and telephone only from the place's own
 * listing or pages. Server-only: it reads the dish catalogue for names.
 */

const DISH_NAMES = new Map((Array.isArray(dishes) ? dishes : dishes.dishes || []).map((d) => [d.slug, d.name]));

export const dishName = (slug) => DISH_NAMES.get(slug) || slug;

const SRINAGAR = { "@type": "City", name: "Srinagar", sameAs: "https://en.wikipedia.org/wiki/Srinagar" };

const DAY_NAMES = { Mo: "Monday", Tu: "Tuesday", We: "Wednesday", Th: "Thursday", Fr: "Friday", Sa: "Saturday", Su: "Sunday" };
const DAY_ORDER = Object.keys(DAY_NAMES);

function expandDays(spec) {
  return spec.split(",").flatMap((part) => {
    const [from, to] = part.split("-");
    if (!to) return [DAY_NAMES[from]];
    return DAY_ORDER.slice(DAY_ORDER.indexOf(from), DAY_ORDER.indexOf(to) + 1).map((d) => DAY_NAMES[d]);
  });
}

/** Schema.org markup for the place: only what the record holds, never a rating or a guessed field. */
export function restaurantSchema(place) {
  const url = `${SITE}${restaurantPath(place.slug)}`;
  const own = (key) => SOURCES[key]?.url;
  const sameAs = place.links.map((link) => own(link.source)).filter(Boolean);
  const cuisine = place.status === "wazwan-unconfirmed" ? ["Kashmiri"] : ["Kashmiri", "Wazwan"];
  return {
    "@context": "https://schema.org",
    "@type": place.schemaType,
    "@id": `${url}#place`,
    name: place.name,
    ...(place.otherNames.length ? { alternateName: place.otherNames } : {}),
    url,
    mainEntityOfPage: url,
    description: plainText(openingText(place)),
    address: {
      "@type": "PostalAddress",
      ...(place.postalAddress || {}),
      addressLocality: "Srinagar",
      addressRegion: "Jammu and Kashmir",
      addressCountry: "IN",
    },
    ...(place.telephone ? { telephone: place.telephone } : {}),
    ...(place.schemaType === "Restaurant" ? { servesCuisine: cuisine } : {}),
    ...(place.openingHours.length
      ? {
          openingHoursSpecification: place.openingHours.map((h) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: expandDays(h.days),
            opens: h.opens,
            closes: h.closes,
          })),
        }
      : {}),
    ...(place.menuSource ? { hasMenu: own(place.menuSource) } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    // The hotel or mall a place sits in, and the city, as entities rather than strings.
    containedInPlace: place.containedIn
      ? { "@type": place.containedIn.type, name: place.containedIn.name, containedInPlace: SRINAGAR }
      : SRINAGAR,
    // This page names Wazwan and the dishes its sources name here, each with its page on the site.
    subjectOf: {
      "@type": "WebPage",
      url,
      mentions: [
        { "@type": "Thing", name: "Wazwan", url: `${SITE}/dishes`, sameAs: "https://en.wikipedia.org/wiki/Wazwan" },
        ...place.dishes.map((slug) => {
          const entity = dishEntity(slug);
          return {
            "@type": "Thing",
            name: dishName(slug),
            url: `${SITE}/dishes/${slug}`,
            ...(entity?.sameAs ? { sameAs: entity.sameAs } : {}),
          };
        }),
      ],
    },
  };
}
