// Pure unit tests for the planning engine (T2). No DB connection.
// Run: node --test src/tests/itineraryPlanner.test.js

import { test } from "node:test";
import assert from "node:assert/strict";
import { generateItinerary, _internals } from "../services/itineraryPlanner.js";

const { normalizePreferences, isExcluded, monthToSeason } = _internals;
const nodeBySlug = (slugsInPlan, slug) => slugsInPlan.includes(slug);

function allStopSlugs(plan) {
  return plan.days.flatMap((d) => d.stops.map((s) => s.slug));
}

test("produces exactly the requested number of days", () => {
  for (const n of [3, 5, 7, 10]) {
    const plan = generateItinerary({ lengthDays: n });
    assert.equal(plan.days.length, n, `expected ${n} days`);
    assert.equal(plan.lengthDays, n);
    // day numbers are sequential 1..n
    assert.deepEqual(plan.days.map((d) => d.dayNumber), Array.from({ length: n }, (_, i) => i + 1));
  }
});

test("exact dates drive trip length and override the duration step (inclusive)", () => {
  // Aug 1 -> Aug 12 is a 12-day trip; must win over an explicit lengthDays: 5.
  const plan = generateItinerary({ lengthDays: 5, startDate: "2025-08-01", endDate: "2025-08-12" });
  assert.equal(plan.lengthDays, 12);
  assert.equal(plan.days.length, 12);
});

test("trip length is capped at 20 days (from dates or explicit)", () => {
  const fromDates = generateItinerary({ startDate: "2025-08-01", endDate: "2025-09-15" }); // ~46 days
  assert.equal(fromDates.days.length, 20);
  const fromExplicit = generateItinerary({ lengthDays: 25 });
  assert.equal(fromExplicit.days.length, 20);
});

test("supports long stays up to 20 days without breaking", () => {
  for (const n of [12, 15, 20]) {
    const plan = generateItinerary({ lengthDays: n, season: "summer", interests: ["mountains", "lakes", "meadows"] });
    assert.equal(plan.days.length, n, `expected ${n} days`);
    assert.deepEqual(plan.days.map((d) => d.dayNumber), Array.from({ length: n }, (_, i) => i + 1));
  }
});

test("anchors on Srinagar and the first day has no inbound travel leg", () => {
  const plan = generateItinerary({ lengthDays: 5, interests: ["lakes", "food"] });
  assert.equal(plan.days[0].baseTown, "Srinagar");
  assert.equal(plan.days[0].travelFromPrev, null);
});

test("is fully deterministic — same input yields identical output", () => {
  const prefs = { lengthDays: 6, season: "summer", style: ["family"], interests: ["mountains", "lakes"], budgetTier: "Premium", travelers: { adults: 2, children: 2, seniors: 0 } };
  const a = JSON.stringify(generateItinerary(prefs));
  const b = JSON.stringify(generateItinerary(prefs));
  assert.equal(a, b);
});

test("winter trips exclude snow-closed nodes (Sonamarg, Gurez, Chandanwari)", () => {
  const plan = generateItinerary({ lengthDays: 7, season: "winter", interests: ["mountains", "winter sports"] });
  const slugs = allStopSlugs(plan);
  for (const closed of ["sonamarg", "thajiwas-glacier", "gurez-valley", "chandanwari"]) {
    assert.ok(!nodeBySlug(slugs, closed), `${closed} must not appear in a winter plan`);
  }
});

test("winter favours Gulmarg (snow hub)", () => {
  const plan = generateItinerary({ lengthDays: 5, season: "winter", style: ["adventure"], interests: ["winter sports", "skiing"] });
  const towns = plan.days.map((d) => d.baseTown);
  assert.ok(towns.includes("Gulmarg"), "Gulmarg should be in a winter itinerary");
});

test("families with kids/seniors never get routed to remote frontier valleys", () => {
  const plan = generateItinerary({ lengthDays: 8, season: "summer", style: ["family"], interests: ["hidden gems", "villages"], travelers: { adults: 2, children: 2, seniors: 1 } });
  const slugs = allStopSlugs(plan);
  for (const remote of ["gurez-valley", "bangus-valley"]) {
    assert.ok(!nodeBySlug(slugs, remote), `${remote} unsuitable for family with kids/seniors`);
  }
});

test("short trips exclude multi-day frontier valleys", () => {
  const plan = generateItinerary({ lengthDays: 3, season: "summer", interests: ["hidden gems"] });
  const slugs = allStopSlugs(plan);
  assert.ok(!nodeBySlug(slugs, "gurez-valley"), "Gurez needs >=5 days");
});

test("cost scales with party size and budget tier", () => {
  const solo = generateItinerary({ lengthDays: 5, budgetTier: "Budget", travelers: { adults: 1 } });
  const family = generateItinerary({ lengthDays: 5, budgetTier: "Luxury", travelers: { adults: 2, children: 2 } });
  assert.ok(family.estimatedCost.total > solo.estimatedCost.total);
  assert.equal(solo.estimatedCost.currency, "INR");
  // breakdown parts sum to ~total (rounding tolerance)
  const b = family.estimatedCost.breakdown;
  assert.ok(Math.abs((b.stay + b.transport + b.food + b.activities) - family.estimatedCost.total) <= 4);
});

test("returns numeric costs (no pre-formatted currency strings — avoids the mojibake trap)", () => {
  const plan = generateItinerary({ lengthDays: 4 });
  assert.equal(typeof plan.estimatedCost.total, "number");
  assert.equal(typeof plan.estimatedCost.breakdown.stay, "number");
});

test("attaches meals from catalog when provided, generic otherwise", () => {
  const catalog = {
    restaurants: [{ name: "Ahdoos", slug: "ahdoos", city: "Srinagar", rating: 4.7, priceLevel: "Luxury", authenticityScore: 5 }],
    dishes: [{ name: "Gushtaba", slug: "gushtaba", category: "Wazwan", foodType: "Non-veg" }],
  };
  const withCat = generateItinerary({ lengthDays: 3, food: ["wazwan lover"] }, catalog);
  const day1Lunch = withCat.days[0].meals.find((m) => m.type === "lunch");
  assert.equal(day1Lunch.suggestion, "Ahdoos");
  assert.equal(day1Lunch.restaurantSlug, "ahdoos");

  const noCat = generateItinerary({ lengthDays: 3 });
  assert.ok(noCat.days[0].meals.length >= 1, "generic meals still present without a catalog");
});

test("vegetarian preference biases dinner dish selection", () => {
  const catalog = {
    restaurants: [],
    dishes: [
      { name: "Rogan Josh", slug: "rogan-josh", category: "Wazwan", foodType: "Non-veg" },
      { name: "Nadru Yakhni", slug: "nadru-yakhni", category: "Wazwan", foodType: "Veg" },
    ],
  };
  const veg = generateItinerary({ lengthDays: 2, food: ["vegetarian"] }, catalog);
  const dinner = veg.days[0].meals.find((m) => m.type === "dinner");
  assert.equal(dinner.dishName, "Nadru Yakhni");
});

test("packing tips adapt to season and activities", () => {
  const winter = generateItinerary({ lengthDays: 3, season: "winter" });
  assert.ok(winter.packingTips.some((t) => /snow boots|thermals/i.test(t)));
  const trek = generateItinerary({ lengthDays: 5, season: "summer", interests: ["trekking"] });
  assert.ok(trek.packingTips.some((t) => /trekking shoes/i.test(t)));
});

test("multi-hub trips add a travel leg when the base town changes", () => {
  const plan = generateItinerary({ lengthDays: 7, season: "summer", pace: "packed", interests: ["mountains", "meadows", "lakes"] });
  const legs = plan.days.filter((d) => d.travelFromPrev);
  assert.ok(legs.length >= 1, "expected at least one base-change travel leg");
  for (const d of legs) {
    assert.ok(d.travelFromPrev.minutes > 0 && d.travelFromPrev.km > 0);
  }
});

test("echoes normalized preferences for deterministic regenerate-on-claim", () => {
  const plan = generateItinerary({ lengthDays: 5, interests: ["hidden gems"], budgetTier: "premium" });
  assert.equal(plan.normalizedPreferences.budgetTier, "Premium");
  assert.ok(plan.normalizedPreferences.interests.includes("hidden_gems"));
});

test("helpers: season derivation and exclusion logic", () => {
  assert.equal(monthToSeason(0), "winter"); // Jan
  assert.equal(monthToSeason(6), "summer"); // Jul
  assert.equal(monthToSeason(9), "autumn"); // Oct
  const ctxWinter = normalizePreferences({ season: "winter", lengthDays: 5 });
  assert.equal(isExcluded({ slug: "sonamarg" }, ctxWinter), true);
});

test("handles empty/partial preferences without throwing", () => {
  assert.doesNotThrow(() => generateItinerary({}));
  const plan = generateItinerary({});
  assert.ok(plan.days.length >= 1 && plan.title);
});
