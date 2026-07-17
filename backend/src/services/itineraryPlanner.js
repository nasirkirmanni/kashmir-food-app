// Itinerary Builder — Planning Engine (T2)
//
// Pure, deterministic rules/scoring engine. `generateItinerary(preferences,
// catalog)` -> a structured plan object (shape mirrors the Itinerary schema in
// T3). No DB, no Express, no Math.random, no Date.now — same input yields the
// same output, so it can power BOTH personalized itineraries and canonical
// SSR/ISR pages, and be unit-tested without infrastructure.
//
// Pipeline: normalize -> filter (hard constraints) -> score (soft) -> select
// stay hubs -> cluster by base town -> sequence (min travel via matrix) ->
// allocate days -> attach stops/meals/stay/costs/advisories.
//
// `catalog` is optional { restaurants, dishes } from the DB; when omitted the
// engine falls back to generic culinary suggestions so it stays pure/testable.

import { destinationsAtlas, atlasBySlug, getAtlasNode } from "../data/destinationsAtlas.js";
import { getTravelLeg } from "../data/travelMatrix.js";

const ANCHOR_SLUG = "srinagar"; // near-universal arrival base

const PACE = {
  relaxed: { stopsPerDay: 2, daysPerHub: 3, maxDriveMin: 180 },
  balanced: { stopsPerDay: 3, daysPerHub: 2, maxDriveMin: 240 },
  packed: { stopsPerDay: 4, daysPerHub: 1.5, maxDriveMin: 360 },
};

const COST_PER_DAY = { Budget: 2000, "Mid-Range": 5000, Premium: 10000, Luxury: 25000 };

// Nodes effectively closed / inadvisable in deep winter.
const WINTER_CLOSED = new Set([
  "sonamarg", "thajiwas-glacier", "gurez-valley", "bangus-valley",
  "lolab-valley", "chandanwari", "aru-valley",
]);

// Remote frontier nodes that need multiple days and are unsuitable for a short
// trip or for parties with young kids / seniors.
const REMOTE_MULTIDAY = new Set(["gurez-valley", "bangus-valley"]);

const TREK_WEIGHT = { None: 0, Easy: 1, Moderate: 2, Hard: 3, Expert: 4 };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text = "") {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-");
}

function monthToSeason(monthIndex /* 0-11 */) {
  // Kashmir: spring Mar-May, summer Jun-Aug, autumn Sep-Nov, winter Dec-Feb
  if (monthIndex >= 2 && monthIndex <= 4) return "spring";
  if (monthIndex >= 5 && monthIndex <= 7) return "summer";
  if (monthIndex >= 8 && monthIndex <= 10) return "autumn";
  return "winter";
}

function intersection(a = [], b = []) {
  const set = new Set(b);
  return a.filter((x) => set.has(x));
}

// Intake interest labels -> atlas activity tags (mostly 1:1; a few aliases).
function mapInterestsToTags(interests = []) {
  const ALIAS = {
    "hidden gems": "hidden_gems",
    "local villages": "villages",
    "winter sports": "winter_sports",
    "spiritual places": "spiritual",
    "road trips": "road_trips",
  };
  return interests.map((i) => {
    const key = i.toString().toLowerCase();
    return ALIAS[key] || key.replace(/\s+/g, "_");
  });
}

function normalizeBudget(tier) {
  if (!tier) return "Mid-Range";
  const t = tier.toString().toLowerCase();
  if (t.startsWith("budget")) return "Budget";
  if (t.startsWith("lux")) return "Luxury";
  if (t.startsWith("prem")) return "Premium";
  return "Mid-Range";
}

function budgetAligned(nodeLevel, tier) {
  const map = {
    Budget: ["Free", "Budget"],
    "Mid-Range": ["Free", "Budget", "Moderate"],
    Premium: ["Moderate", "Expensive"],
    Luxury: ["Moderate", "Expensive"],
  };
  return (map[tier] || []).includes(nodeLevel);
}

function normalizePreferences(prefs = {}) {
  const p = { ...prefs };

  // Length: explicit lengthDays, else derived from dates, else 5.
  let lengthDays = parseInt(p.lengthDays, 10);
  if (!lengthDays && p.startDate && p.endDate) {
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    const diff = Math.round((end - start) / 86400000) + 1;
    if (diff > 0) lengthDays = diff;
  }
  lengthDays = Math.min(Math.max(lengthDays || 5, 1), 21);

  // Season: explicit, else from startDate month, else summer.
  let season = p.season && p.season.toString().toLowerCase();
  if (!["spring", "summer", "autumn", "winter"].includes(season)) {
    if (p.startDate) season = monthToSeason(new Date(p.startDate).getMonth());
    else season = "summer";
  }

  const pace = ["relaxed", "balanced", "packed"].includes(p.pace) ? p.pace : "balanced";
  const travelers = {
    adults: Math.max(0, parseInt(p.travelers?.adults, 10) || (p.travelers ? 0 : 2)),
    children: Math.max(0, parseInt(p.travelers?.children, 10) || 0),
    seniors: Math.max(0, parseInt(p.travelers?.seniors, 10) || 0),
  };
  if (travelers.adults + travelers.children + travelers.seniors === 0) travelers.adults = 2;

  return {
    lengthDays,
    season,
    pace,
    travelers,
    hasKids: travelers.children > 0,
    hasSeniors: travelers.seniors > 0,
    style: (p.style || []).map((s) => s.toString().toLowerCase()),
    interestTags: mapInterestsToTags(p.interests || []),
    accommodation: (p.accommodation || []).map((a) => a.toString().toLowerCase()),
    transport: (p.transport || "private cab").toString().toLowerCase(),
    food: (p.food || []).map((f) => f.toString().toLowerCase()),
    budgetTier: normalizeBudget(p.budgetTier || p.budget),
    arrivalSlug: p.arrivalCity ? slugify(p.arrivalCity) : ANCHOR_SLUG,
    originCity: p.originCity || null,
  };
}

// ---------------------------------------------------------------------------
// Filter + score
// ---------------------------------------------------------------------------

function isExcluded(node, ctx) {
  // Hard seasonal closure.
  if (ctx.season === "winter" && WINTER_CLOSED.has(node.slug)) return true;
  // Remote multi-day nodes don't fit short trips.
  if (REMOTE_MULTIDAY.has(node.slug) && ctx.lengthDays < 5) return true;
  // Remote frontier with young kids or seniors is inadvisable.
  if (REMOTE_MULTIDAY.has(node.slug) && (ctx.hasKids || ctx.hasSeniors)) return true;
  return false;
}

function scoreNode(node, ctx) {
  let score = 0;

  // Interest matches (strongest signal).
  score += 3 * intersection(node.activities, ctx.interestTags).length;

  // Style weighting.
  const trek = TREK_WEIGHT[node.trekkingDifficulty] || 0;
  for (const style of ctx.style) {
    if (style.includes("lux")) score += node.luxuryScore * 2;
    else if (style.includes("budget") || style.includes("backpack"))
      score += (5 - node.luxuryScore) + node.authenticityScore * 0.5;
    else if (style.includes("family")) score += node.touristFriendlinessScore * 2 + (node.familyFriendly ? 2 : -2);
    else if (style.includes("adventure")) score += trek * 2 + (node.activities.includes("trekking") ? 2 : 0);
    else if (style.includes("photo")) score += node.photographyScore * 0.6;
    else if (style.includes("honeymoon")) score += node.luxuryScore * 1.2 + node.authenticityScore * 0.8;
    else if (style.includes("friend")) score += node.touristFriendlinessScore + (node.activities.includes("road_trips") ? 1 : 0);
    else if (style.includes("solo")) score += node.authenticityScore * 1.5 + (5 - node.luxuryScore) * 0.5;
  }

  // Budget alignment.
  if (budgetAligned(node.budgetLevel, ctx.budgetTier)) score += 2;

  // Season alignment.
  if (node.bestSeasons.includes(ctx.season)) score += 4;
  else score -= 3;

  // Party suitability (soft).
  if (ctx.hasSeniors && !node.elderlyFriendly) score -= 4;
  if (ctx.hasKids && !node.familyFriendly) score -= 3;

  // Hidden-gem seekers prefer low crowds.
  if (ctx.interestTags.includes("hidden_gems") && node.crowdLevel === "Low") score += 2;

  return score;
}

// ---------------------------------------------------------------------------
// Select + cluster + sequence
// ---------------------------------------------------------------------------

function hubSlugForTown(town) {
  const direct = getAtlasNode(slugify(town));
  return direct ? direct.slug : null;
}

// Choose the stay towns to visit and the attractions under each.
function buildClusters(ctx) {
  const scored = destinationsAtlas
    .filter((n) => !isExcluded(n, ctx))
    .map((n) => ({ node: n, score: scoreNode(n, ctx) }))
    // deterministic: score desc, then slug asc as tiebreaker
    .sort((a, b) => b.score - a.score || (a.node.slug < b.node.slug ? -1 : 1));

  // Group everything selectable by base town.
  const byTown = new Map();
  for (const { node, score } of scored) {
    if (!byTown.has(node.baseTown)) byTown.set(node.baseTown, []);
    byTown.get(node.baseTown).push({ node, score });
  }

  // Rank towns by their best-scoring member.
  const townRank = [...byTown.entries()]
    .map(([town, members]) => ({
      town,
      members,
      best: Math.max(...members.map((m) => m.score)),
      hubSlug: hubSlugForTown(town) || members[0].node.slug,
    }))
    .sort((a, b) => b.best - a.best || (a.town < b.town ? -1 : 1));

  // How many stay towns can we reasonably cover?
  const pace = PACE[ctx.pace];
  const maxTowns = Math.max(1, Math.min(townRank.length, Math.floor(ctx.lengthDays / (pace.daysPerHub >= 2 ? 2 : 1)) || 1));

  let chosen = townRank.slice(0, maxTowns);

  // Always anchor on the arrival base (Srinagar) if it isn't already chosen.
  const anchorTown = getAtlasNode(ctx.arrivalSlug)?.baseTown || "Srinagar";
  if (!chosen.some((c) => c.town === anchorTown)) {
    const anchor = townRank.find((t) => t.town === anchorTown);
    if (anchor) {
      chosen.pop();
      chosen.unshift(anchor);
    }
  }

  return chosen;
}

// Greedy nearest-neighbour ordering of hub towns, starting at the arrival base.
function sequenceClusters(clusters, ctx) {
  if (clusters.length <= 1) return clusters;
  const startSlug = getAtlasNode(ctx.arrivalSlug) ? ctx.arrivalSlug : ANCHOR_SLUG;

  const remaining = [...clusters];
  const ordered = [];

  // Start from the cluster containing the anchor if present, else the top one.
  let currentIdx = remaining.findIndex((c) => c.hubSlug === startSlug);
  if (currentIdx === -1) currentIdx = 0;
  let current = remaining.splice(currentIdx, 1)[0];
  ordered.push(current);

  while (remaining.length) {
    let bestIdx = 0;
    let bestMinutes = Infinity;
    remaining.forEach((c, i) => {
      const leg = getTravelLeg(current.hubSlug, c.hubSlug);
      const minutes = leg ? leg.minutes : Infinity;
      if (minutes < bestMinutes) {
        bestMinutes = minutes;
        bestIdx = i;
      }
    });
    current = remaining.splice(bestIdx, 1)[0];
    ordered.push(current);
  }
  return ordered;
}

// Distribute total days across sequenced clusters (min 1 each), weighted by
// number of attractions, then trim/pad to hit lengthDays exactly.
function allocateDays(clusters, ctx) {
  const n = clusters.length;
  const alloc = clusters.map(() => 1);
  let remaining = ctx.lengthDays - n;

  if (remaining < 0) {
    // Too many clusters for the trip length: keep the top `lengthDays` clusters.
    return clusters.slice(0, ctx.lengthDays).map((c) => ({ cluster: c, days: 1 }));
  }

  // Weight extra days by attraction count (capped so a cluster isn't overloaded).
  const weights = clusters.map((c) => c.members.length);
  let i = 0;
  let guard = 0;
  while (remaining > 0 && guard < 1000) {
    const idx = i % n;
    const cap = Math.max(1, Math.ceil(weights[idx] / (PACE[ctx.pace].stopsPerDay - 1 || 1)));
    if (alloc[idx] < cap + 1) {
      alloc[idx] += 1;
      remaining -= 1;
    }
    i += 1;
    guard += 1;
  }
  // If capacity capped everything, dump the rest on the anchor (first) cluster.
  if (remaining > 0) alloc[0] += remaining;

  return clusters.map((c, idx) => ({ cluster: c, days: alloc[idx] }));
}

// ---------------------------------------------------------------------------
// Culinary + cost + packing
// ---------------------------------------------------------------------------

function pickMeals(hubTown, ctx, catalog, dayIndex) {
  const restaurants = catalog?.restaurants || [];
  const dishes = catalog?.dishes || [];

  const localR = restaurants.filter(
    (r) => (r.city || "").toLowerCase() === hubTown.toLowerCase()
  );
  const pool = localR.length ? localR : restaurants;

  const sortedR = [...pool].sort((a, b) => {
    let sa = a.rating || 4, sb = b.rating || 4;
    if (ctx.budgetTier === "Luxury") { if (a.priceLevel === "Luxury") sa += 3; if (b.priceLevel === "Luxury") sb += 3; }
    if (ctx.budgetTier === "Budget") { if (a.priceLevel === "Budget") sa += 3; if (b.priceLevel === "Budget") sb += 3; }
    if (ctx.food.some((f) => f.includes("wazwan"))) { sa += (a.authenticityScore || 4) * 0.5; sb += (b.authenticityScore || 4) * 0.5; }
    return sb - sa || ((a.name || "") < (b.name || "") ? -1 : 1);
  });

  const restaurant = sortedR[0] || null;

  // Dish selection honours veg/non-veg / wazwan / street food preferences.
  const wantsVeg = ctx.food.some((f) => f.includes("veg") && !f.includes("non"));
  const wantsStreet = ctx.food.some((f) => f.includes("street"));
  let dishPool = dishes;
  if (wantsVeg) dishPool = dishes.filter((d) => (d.foodType || "").toLowerCase().includes("veg") && !(d.foodType || "").toLowerCase().includes("non"));
  else if (wantsStreet) dishPool = dishes.filter((d) => (d.category || "").toLowerCase().includes("street"));
  if (!dishPool.length) dishPool = dishes;

  const dish = dishPool.length ? dishPool[dayIndex % dishPool.length] : null;

  const DEFAULT_DISH = wantsVeg ? "Nadru Yakhni" : "Rogan Josh";
  return [
    {
      type: "lunch",
      suggestion: restaurant ? restaurant.name : "Local traditional eatery",
      restaurantSlug: restaurant ? (restaurant.slug || restaurant._id || null) : null,
    },
    {
      type: "dinner",
      suggestion: dish ? `${dish.name}` : `Wazwan dinner — try ${DEFAULT_DISH}`,
      dishName: dish ? dish.name : DEFAULT_DISH,
      dishSlug: dish ? (dish.slug || dish._id || null) : null,
    },
  ];
}

function personEquivalent(t) {
  return t.adults + t.seniors + t.children * 0.6 || 1;
}

function estimateCost(ctx) {
  const perDay = COST_PER_DAY[ctx.budgetTier] || COST_PER_DAY["Mid-Range"];
  const people = personEquivalent(ctx.travelers);
  const total = Math.round(perDay * ctx.lengthDays * people);
  return {
    currency: "INR",
    perPersonPerDay: perDay,
    total,
    breakdown: {
      stay: Math.round(total * 0.45),
      transport: Math.round(total * 0.2),
      food: Math.round(total * 0.2),
      activities: Math.round(total * 0.15),
    },
  };
}

function packingTips(ctx) {
  const tips = ["Valid photo ID (mandatory at checkpoints)", "Comfortable walking shoes", "Sunscreen and lip balm (high-altitude sun)"];
  if (ctx.season === "winter") tips.push("Heavy thermals, gloves, and snow boots", "Moisturizer for dry cold");
  if (ctx.season === "summer") tips.push("Light layers — warm days, cool evenings");
  if (ctx.season === "autumn") tips.push("A warm jacket for crisp evenings");
  if (ctx.season === "spring") tips.push("A light waterproof — spring showers are common");
  if (ctx.interestTags.includes("trekking")) tips.push("Trekking shoes and a daypack");
  if (ctx.interestTags.includes("photography")) tips.push("Extra camera batteries (cold drains them fast)");
  return tips;
}

// ---------------------------------------------------------------------------
// Day assembly
// ---------------------------------------------------------------------------

const SLOTS = [
  { label: "Morning", start: "09:00" },
  { label: "Afternoon", start: "13:00" },
  { label: "Evening", start: "17:00" },
  { label: "Late", start: "19:00" },
];

function buildDays(sequenced, ctx, catalog) {
  const days = [];
  let dayNumber = 0;
  let prevHubSlug = null;
  const regionsCovered = new Set();
  const tripAdvisories = new Set();

  sequenced.forEach(({ cluster, days: clusterDays }, clusterIdx) => {
    // Attractions for this town, best first (the hub's own node included).
    const attractions = cluster.members.map((m) => m.node);
    regionsCovered.add(attractions[0].region);

    // Split attractions across the cluster's allotted days.
    const perDay = Math.max(1, Math.ceil(attractions.length / clusterDays));

    for (let d = 0; d < clusterDays; d++) {
      dayNumber += 1;
      const slice = attractions.slice(d * perDay, d * perDay + Math.min(perDay, PACE[ctx.pace].stopsPerDay));
      const dayStops = (slice.length ? slice : [attractions[0]]).map((node, i) => {
        if (node.travelAdvisory) tripAdvisories.add(`${node.name}: ${node.travelAdvisory}`);
        const slot = SLOTS[Math.min(i, SLOTS.length - 1)];
        return {
          slug: node.slug,
          name: node.name,
          activity: node.summary,
          timeOfDay: slot.label,
          startTime: slot.start,
          estVisitHours: node.estimatedVisitHours,
          note: node.activities.slice(0, 3).join(", "),
        };
      });

      // Travel leg only on the FIRST day in a new cluster (base change).
      let travelFromPrev = null;
      if (d === 0 && prevHubSlug && prevHubSlug !== cluster.hubSlug) {
        const leg = getTravelLeg(prevHubSlug, cluster.hubSlug);
        if (leg) {
          travelFromPrev = { fromSlug: prevHubSlug, toSlug: cluster.hubSlug, ...leg };
        }
      }

      // Best-time-to-leave heuristic: long onward drive -> leave early.
      const nextCluster = sequenced[clusterIdx + 1];
      let bestTimeToLeave = null;
      if (d === clusterDays - 1 && nextCluster) {
        const onward = getTravelLeg(cluster.hubSlug, nextCluster.cluster.hubSlug);
        if (onward) bestTimeToLeave = onward.minutes >= 180 ? "Leave by 08:00 — long mountain drive ahead" : "Leave by 10:00";
      }

      const stayType = pickStayType(cluster.hubSlug, ctx);

      days.push({
        dayNumber,
        title: `Day ${dayNumber}: ${cluster.town}${d === 0 && travelFromPrev ? ` (from ${getAtlasNode(prevHubSlug)?.name || "previous base"})` : ""}`,
        baseTown: cluster.town,
        summary: dayStops.map((s) => s.name).join(" · "),
        travelFromPrev,
        bestTimeToLeave,
        stops: dayStops,
        meals: pickMeals(cluster.town, ctx, catalog, dayNumber - 1),
        stay: { area: cluster.town, type: stayType, priceTier: ctx.budgetTier },
        advisories: dayStops.filter((s) => atlasBySlug[s.slug]?.travelAdvisory).map((s) => `${s.name}: ${atlasBySlug[s.slug].travelAdvisory}`),
      });
    }

    prevHubSlug = cluster.hubSlug;
  });

  return { days, regionsCovered: [...regionsCovered], tripAdvisories: [...tripAdvisories] };
}

function pickStayType(hubSlug, ctx) {
  const node = getAtlasNode(hubSlug);
  const onWater = node && (node.activities.includes("shikara") || node.slug === "dal-lake" || node.slug === "nigeen-lake" || node.baseTown === "Srinagar");
  if (ctx.accommodation.some((a) => a.includes("houseboat")) && onWater) return "Houseboat";
  if (ctx.accommodation.length) {
    const first = ctx.accommodation[0];
    if (first.includes("luxury")) return "Luxury hotel";
    if (first.includes("boutique")) return "Boutique hotel";
    if (first.includes("resort")) return "Resort";
    if (first.includes("homestay")) return "Homestay";
    if (first.includes("budget")) return "Budget hotel";
  }
  // Infer from budget tier.
  return { Luxury: "Luxury resort", Premium: "Boutique hotel", "Mid-Range": "Comfort hotel", Budget: "Budget stay" }[ctx.budgetTier];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a structured Kashmir itinerary from traveler preferences.
 * @param {object} preferences  intake snapshot (partial is OK; sensible defaults applied)
 * @param {object} [catalog]    optional { restaurants, dishes } from the DB
 * @returns {object} structured plan (see module header / Itinerary schema)
 */
export function generateItinerary(preferences = {}, catalog = {}) {
  const ctx = normalizePreferences(preferences);

  const clusters = buildClusters(ctx);
  const sequenced = sequenceClusters(clusters, ctx);
  const allocated = allocateDays(sequenced, ctx);
  const { days, regionsCovered, tripAdvisories } = buildDays(allocated, ctx, catalog);

  const cost = estimateCost(ctx);
  const partyLabel = ctx.hasKids ? "Family" : ctx.hasSeniors ? "Family" : ctx.travelers.adults === 1 ? "Solo Traveler" : ctx.travelers.adults === 2 ? "Couple" : "Group";
  const seasonLabel = ctx.season.charAt(0).toUpperCase() + ctx.season.slice(1);

  return {
    title: `${days.length}-Day ${seasonLabel} Kashmir Itinerary for a ${partyLabel}`,
    summary: `A ${ctx.pace} ${days.length}-day plan across ${regionsCovered.join(", ")} Kashmir, tuned for ${ctx.budgetTier.toLowerCase()} travel.`,
    lengthDays: days.length,
    season: ctx.season,
    pace: ctx.pace,
    budgetTier: ctx.budgetTier,
    travelers: ctx.travelers,
    regionsCovered,
    advisories: tripAdvisories,
    packingTips: packingTips(ctx),
    estimatedCost: cost,
    days,
    // Echo the normalized preferences so callers can persist the exact snapshot
    // that produced this plan (enables deterministic regenerate-on-claim, T6).
    normalizedPreferences: {
      lengthDays: ctx.lengthDays, season: ctx.season, pace: ctx.pace,
      travelers: ctx.travelers, style: ctx.style, interests: ctx.interestTags,
      accommodation: ctx.accommodation, transport: ctx.transport, food: ctx.food,
      budgetTier: ctx.budgetTier, arrivalSlug: ctx.arrivalSlug,
    },
  };
}

export const _internals = {
  normalizePreferences, scoreNode, isExcluded, buildClusters, sequenceClusters,
  allocateDays, monthToSeason, mapInterestsToTags,
};
