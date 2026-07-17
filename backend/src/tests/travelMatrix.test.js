// Pure unit tests for the travel matrix (T1). No DB connection.
// Run: node --test src/tests/travelMatrix.test.js

import { test } from "node:test";
import assert from "node:assert/strict";
import { getTravelLeg, haversineKm, curatedLegs } from "../data/travelMatrix.js";
import { destinationsAtlas, atlasBySlug } from "../data/destinationsAtlas.js";

test("identical slug returns a zero leg", () => {
  const leg = getTravelLeg("srinagar", "srinagar");
  assert.equal(leg.km, 0);
  assert.equal(leg.minutes, 0);
  assert.equal(leg.estimated, false);
});

test("curated leg is returned and is direction-agnostic", () => {
  const ab = getTravelLeg("srinagar", "gulmarg");
  const ba = getTravelLeg("gulmarg", "srinagar");
  assert.equal(ab.km, 50);
  assert.equal(ab.minutes, 90);
  assert.equal(ab.estimated, false);
  assert.deepEqual(ab, ba); // same leg regardless of order
});

test("uncurated pair falls back to a haversine estimate, flagged estimated", () => {
  // manasbal-lake <-> aharbal is not curated
  assert.equal(curatedLegs[["manasbal-lake", "aharbal"].sort().join("__")], undefined);
  const leg = getTravelLeg("manasbal-lake", "aharbal");
  assert.equal(leg.estimated, true);
  assert.equal(leg.road, "Estimated");
  assert.ok(leg.km > 0, "estimated km should be positive");
  assert.ok(leg.minutes > 0, "estimated minutes should be positive");
});

test("estimated km is at least the straight-line distance (road factor >= 1)", () => {
  const a = atlasBySlug["manasbal-lake"].coordinates;
  const b = atlasBySlug["aharbal"].coordinates;
  const straight = haversineKm(a, b);
  const leg = getTravelLeg("manasbal-lake", "aharbal");
  assert.ok(leg.km >= Math.round(straight), "road distance should not be shorter than straight line");
});

test("unknown slug returns null", () => {
  assert.equal(getTravelLeg("srinagar", "atlantis"), null);
  assert.equal(getTravelLeg("atlantis", "srinagar"), null);
});

test("haversine is ~0 for identical points and symmetric", () => {
  const p = { lat: 34.08, lng: 74.79 };
  assert.ok(haversineKm(p, p) < 1e-6);
  const q = { lat: 34.05, lng: 74.38 };
  assert.ok(Math.abs(haversineKm(p, q) - haversineKm(q, p)) < 1e-9);
});

test("every atlas node has coordinates and a known region", () => {
  const regions = new Set(["Central", "North", "South", "Frontier"]);
  for (const n of destinationsAtlas) {
    assert.ok(n.coordinates && typeof n.coordinates.lat === "number", `${n.slug} lat`);
    assert.ok(n.coordinates && typeof n.coordinates.lng === "number", `${n.slug} lng`);
    assert.ok(regions.has(n.region), `${n.slug} region`);
  }
});

test("every curated leg references real atlas slugs", () => {
  for (const k of Object.keys(curatedLegs)) {
    const [a, b] = k.split("__");
    assert.ok(atlasBySlug[a], `curated leg slug ${a} exists in atlas`);
    assert.ok(atlasBySlug[b], `curated leg slug ${b} exists in atlas`);
  }
});

test("atlas has the expected 21 hubs", () => {
  assert.equal(destinationsAtlas.length, 21);
});
