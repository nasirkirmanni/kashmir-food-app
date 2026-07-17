// Itinerary Builder — Travel Matrix (T1)
//
// Curated road legs between the atlas hubs, used by the planning engine (T2) to
// sequence a day plan by minimizing travel time and to surface "best time to
// leave" guidance. Deterministic and free — no live routing API.
//
// Design:
//   - Curated legs are authored once, keyed "a__b" by atlas slug. Lookup is
//     direction-agnostic (a__b === b__a).
//   - Any pair without a curated leg falls back to a haversine estimate scaled
//     by ROAD_FACTOR (straight-line rarely equals mountain road distance), with
//     an average hill-road speed. The result is flagged `estimated: true` so the
//     UI/engine can present curated vs estimated differently.
//   - Same-slug legs return a zero leg.
//
// Swappable later: replace getTravelLeg's fallback with a Google Directions call
// behind the same signature without touching the engine.

import { atlasBySlug } from "./destinationsAtlas.js";

const ROAD_FACTOR = 1.4; // straight-line km -> approx road km in hilly terrain
const AVG_ROAD_KMH = 32; // conservative average incl. stops/terrain

const key = (a, b) => [a, b].sort().join("__");

// Curated legs: { km, minutes, road } keyed by sorted slug pair.
// minutes reflect realistic drive time incl. terrain, not km/AVG_ROAD_KMH.
export const curatedLegs = {
  // --- From Srinagar (central hub) ---
  [key("srinagar", "gulmarg")]: { km: 50, minutes: 90, road: "Good" },
  [key("srinagar", "sonamarg")]: { km: 80, minutes: 150, road: "Good" },
  [key("srinagar", "pahalgam")]: { km: 90, minutes: 150, road: "Good" },
  [key("srinagar", "doodhpathri")]: { km: 42, minutes: 90, road: "Fair" },
  [key("srinagar", "yusmarg")]: { km: 47, minutes: 105, road: "Fair" },
  [key("srinagar", "gurez-valley")]: { km: 123, minutes: 300, road: "Difficult" },
  [key("srinagar", "manasbal-lake")]: { km: 30, minutes: 60, road: "Good" },
  [key("srinagar", "wular-lake")]: { km: 55, minutes: 95, road: "Good" },
  [key("srinagar", "dachigam")]: { km: 22, minutes: 45, road: "Good" },
  [key("srinagar", "aharbal")]: { km: 75, minutes: 135, road: "Fair" },
  [key("srinagar", "bangus-valley")]: { km: 115, minutes: 270, road: "Difficult" },
  [key("srinagar", "lolab-valley")]: { km: 105, minutes: 240, road: "Fair" },
  [key("srinagar", "dal-lake")]: { km: 4, minutes: 15, road: "Good" },
  [key("srinagar", "nigeen-lake")]: { km: 6, minutes: 18, road: "Good" },
  [key("srinagar", "mughal-gardens")]: { km: 9, minutes: 25, road: "Good" },

  // --- Between major stay hubs ---
  [key("gulmarg", "pahalgam")]: { km: 140, minutes: 240, road: "Good" },
  [key("gulmarg", "sonamarg")]: { km: 125, minutes: 210, road: "Good" },
  [key("sonamarg", "pahalgam")]: { km: 165, minutes: 300, road: "Good" },

  // --- Pahalgam cluster (day sights off the stay hub) ---
  [key("pahalgam", "betaab-valley")]: { km: 15, minutes: 30, road: "Good" },
  [key("pahalgam", "aru-valley")]: { km: 12, minutes: 30, road: "Fair" },
  [key("pahalgam", "chandanwari")]: { km: 16, minutes: 40, road: "Fair" },

  // --- Sonamarg + Gulmarg clusters ---
  [key("sonamarg", "thajiwas-glacier")]: { km: 3, minutes: 15, road: "Pony/Walk" },
  [key("gulmarg", "drung-waterfall")]: { km: 8, minutes: 25, road: "Fair" },

  // --- Frontier cluster ---
  [key("bangus-valley", "lolab-valley")]: { km: 40, minutes: 105, road: "Fair" },
};

/**
 * Great-circle distance in km between two {lat,lng} points.
 */
export function haversineKm(a, b) {
  if (!a || !b || a.lat == null || b.lat == null) return null;
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Travel leg between two atlas slugs, direction-agnostic.
 * @returns {{ km:number, minutes:number, road:string, estimated:boolean }}
 *          Zero leg for identical slugs; estimated leg (haversine x ROAD_FACTOR)
 *          when no curated value exists; null if either slug is unknown.
 */
export function getTravelLeg(aSlug, bSlug) {
  if (aSlug === bSlug) {
    return { km: 0, minutes: 0, road: "—", estimated: false };
  }

  const curated = curatedLegs[key(aSlug, bSlug)];
  if (curated) {
    return { ...curated, estimated: false };
  }

  const a = atlasBySlug[aSlug];
  const b = atlasBySlug[bSlug];
  if (!a || !b) return null;

  const straight = haversineKm(a.coordinates, b.coordinates);
  if (straight == null) return null;

  const km = Math.round(straight * ROAD_FACTOR);
  const minutes = Math.round((km / AVG_ROAD_KMH) * 60);
  return { km, minutes, road: "Estimated", estimated: true };
}
