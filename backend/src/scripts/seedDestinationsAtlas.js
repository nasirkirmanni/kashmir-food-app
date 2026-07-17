// Itinerary Builder — Atlas enrichment seed (T1)
//
// ADDITIVE. Mirrors the planning fields from data/destinationsAtlas.js onto
// EXISTING Destination documents (matched by slug, then by name) so the public
// catalog and the planning engine agree on coordinates/region/activities.
//
// Guarantees:
//   - Never deletes or wipes any collection.
//   - Never creates new Destination docs (avoids polluting the catalog with
//     thin day-visit attractions like Betaab/Thajiwas). The atlas module itself
//     remains the engine's source of truth for those nodes.
//   - Only fills the new planning fields; leaves editorial fields untouched.
//
// Run:  node src/scripts/seedDestinationsAtlas.js
//
// Note: this connects to the real MongoDB in MONGODB_URI, same as other seeds.

import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Destination } from "../models/Destination.js";
import { destinationsAtlas } from "../data/destinationsAtlas.js";

dotenv.config();

const PLANNING_FIELDS = [
  "coordinates",
  "region",
  "baseTown",
  "activities",
  "openingHours",
  "travelAdvisory",
];

const NEVER_TOUCHED = [
  "name", "description", "fullDescription", "image", "location", "slug",
  "tags", "attractions", "metrics", "authenticityScore",
  "touristFriendlinessScore", "luxuryScore", "bestTimeToVisit",
];

async function run() {
  const DRY_RUN = process.argv.includes("--dry-run");
  await connectDB();
  console.log(DRY_RUN ? "\n[atlas] DRY RUN — no writes will be made.\n" : "\n[atlas] LIVE run.\n");

  const updated = [];   // { key, changes: [field...] }
  const unchanged = []; // matched but already had all planning data
  const unmatched = []; // atlas node with no catalog doc

  for (const node of destinationsAtlas) {
    // Match existing catalog doc by slug first, then case-insensitive name.
    let doc = await Destination.findOne({ slug: node.slug });
    if (!doc) {
      doc = await Destination.findOne({
        name: new RegExp(`^${node.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      });
    }

    if (!doc) {
      // Atlas node has no catalog counterpart — expected for sub-attractions.
      // The engine still uses it via the atlas module; we just can't mirror it.
      unmatched.push(node.slug);
      continue;
    }

    // POPULATE-IF-MISSING ONLY. Every write is guarded on the field currently
    // being empty/unset, so no existing value is ever overwritten and no
    // curated editorial field is touched. Idempotent (safe to re-run).
    const changes = [];
    const hasCoords = doc.coordinates && doc.coordinates.lat != null && doc.coordinates.lng != null;
    if (!hasCoords) { doc.coordinates = node.coordinates; changes.push("coordinates"); }
    if (!doc.region) { doc.region = node.region; changes.push("region"); }
    if (!doc.baseTown) { doc.baseTown = node.baseTown; changes.push("baseTown"); }
    if (!doc.activities || doc.activities.length === 0) { doc.activities = node.activities; changes.push("activities"); }
    if ((!doc.openingHours || doc.openingHours.trim() === "") && node.openingHours) { doc.openingHours = node.openingHours; changes.push("openingHours"); }
    if ((!doc.travelAdvisory || doc.travelAdvisory.trim() === "") && node.travelAdvisory) { doc.travelAdvisory = node.travelAdvisory; changes.push("travelAdvisory"); }
    if ((!doc.bestSeasons || doc.bestSeasons.length === 0) && node.bestSeasons) { doc.bestSeasons = node.bestSeasons; changes.push("bestSeasons"); }

    if (changes.length === 0) {
      unchanged.push(doc.slug || doc.name);
      continue;
    }

    if (!DRY_RUN) {
      const slugBefore = doc.slug;
      await doc.save();
      // Safety assertion: name is never modified, so the model's pre-save hook
      // must not have rewritten the slug.
      if (doc.slug !== slugBefore) {
        console.warn(`[atlas] WARNING: slug changed for "${doc.name}" (${slugBefore} -> ${doc.slug})`);
      }
    }
    updated.push({ key: doc.slug || doc.name, changes });
  }

  // ---- Report ----
  console.log(`[atlas] ${DRY_RUN ? "WOULD UPDATE" : "Updated"} ${updated.length} destination document(s):`);
  for (const u of updated) console.log(`   • ${u.key}: +${u.changes.join(", +")}`);

  console.log(`\n[atlas] ${unchanged.length} matched but already complete (no change):`);
  console.log("   " + (unchanged.join(", ") || "(none)"));

  console.log(`\n[atlas] ${unmatched.length} atlas node(s) with no catalog document — engine uses the atlas module directly (NOT an error):`);
  console.log("   " + (unmatched.join(", ") || "(none)"));

  console.log(`\n[atlas] Only ever written (populate-if-missing): ${PLANNING_FIELDS.join(", ")}, bestSeasons`);
  console.log(`[atlas] Never touched: ${NEVER_TOUCHED.join(", ")}`);

  await mongoose.disconnect();
  console.log(`\n[atlas] Done. Additive only — no fields overwritten, no collections wiped.${DRY_RUN ? " (dry run)" : ""}`);
}

run().catch(async (err) => {
  console.error("[atlas] Seed failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
