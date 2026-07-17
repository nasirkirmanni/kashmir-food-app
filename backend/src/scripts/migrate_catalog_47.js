// One-off catalog migration (2026-07-17): reduce the dish catalog to the
// approved 47-dish set across 6 categories. Renames/moves preserve existing
// slugs, images, recipes and _ids by using updateOne (which skips the
// slug-regenerating pre('save') hook). One net-new dish (Shami Kabab) is
// added with a recipe. Orphaned Dish references are pruned from restaurants
// and from every kept dish's recipe.relatedDishes. Everything else is deleted.
//
// Reference scan (done separately) found dish refs ONLY in restaurants
// (linkedDishes) and recipe.relatedDishes — users/collections/trails/
// itineraries hold none. ExplorerEvents (immutable XP audit log) are left
// untouched by design.
//
// Run from backend/:  node src/scripts/migrate_catalog_47.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";
dotenv.config();

// slug -> desired { name, category }. Slugs are the stable key; names/categories
// are set without regenerating the slug. categoryType is left as-is.
const KEEP = [
  // ---- Wazwan (19 existing + Shami Kabab added below = 20) ----
  ["tabak-maaz", "Tabak Maaz", "Wazwan"],
  ["seekh-kebab", "Seekh Kebab", "Wazwan"],
  ["methi-maaz", "Methi Maaz", "Wazwan"],
  ["dani-phol", "Daeni Phoul", "Wazwan"],
  ["waza-kokur", "Waza Kokur", "Wazwan"],
  ["rista", "Rista", "Wazwan"],
  ["gushtaba", "Gushtaba", "Wazwan"],
  ["rogan-josh", "Rogan Josh", "Wazwan"],
  ["aab-gosht", "Aab Gosht", "Wazwan"],
  ["yakhni", "Yakhni", "Wazwan"],
  ["marchwangan-korma", "Marchhwangan Korma", "Wazwan"],
  ["daniwal-korma", "Dhaniwal Korma", "Wazwan"],
  ["waza-palak", "Waza Palak", "Wazwan"],
  ["ruwangan-chaman", "Ruwangan Chaman", "Wazwan"],
  ["dum-oluv", "Dum Aloo", "Wazwan"],
  ["muji-chetin", "Muji Chetin", "Wazwan"],
  ["rice", "Plain Steamed Rice", "Wazwan"],
  ["kashmiri-pulao", "Kashmiri Pulao", "Wazwan"],
  ["wazwan-mushroom-guchhi-yakhni", "Wazwan Mushroom", "Wazwan"],
  // ---- Kashmiri Cuisine (3) ----
  ["kabargah", "Kabargah", "Kashmiri Cuisine"],
  ["nadru-gaad", "Nadru Gaad", "Kashmiri Cuisine"],
  ["nadru-yakhni", "Nadru Yakhni", "Kashmiri Cuisine"],
  // ---- Bakery (6) ----
  ["bakerkhani", "Bakerkhani", "Bakery"],
  ["girda", "Girda", "Bakery"],
  ["kashmiri-kulcha", "Kashmiri Kulcha", "Bakery"],
  ["lavas", "Lavasa", "Bakery"],
  ["czochworu", "Czochworu", "Bakery"],
  ["sheermal", "Sheermal", "Bakery"],
  // ---- Street Food (7) ----
  ["nadur-monji", "Nadur Monji", "Street Food"],
  ["aloo-monji", "Aloo Monji", "Street Food"],
  ["kashmiri-harissa", "Harissa", "Street Food"],
  ["mutton-tujji", "Tujji", "Street Food"],
  ["basrakh", "Basrakh", "Street Food"],
  ["masala-tsot", "Masala Tsot", "Street Food"],
  ["tosha", "Tosha", "Street Food"],
  // ---- Desserts (6) ----
  ["phirni", "Phirni", "Desserts"],
  ["badam-phirni", "Badam Phirni", "Desserts"],
  ["saffron-phirni", "Saffron Phirni", "Desserts"],
  ["shufta", "Shufta", "Desserts"],
  ["walnut-halwa", "Walnut Halwa", "Desserts"],
  ["sheera", "Sheera", "Desserts"],
  // ---- Beverages (5) ----
  ["kashmiri-kahwa", "Kahwa", "Beverages"],
  ["cardamom-kahwa", "Cardamom Kahwa", "Beverages"],
  ["noon-chai", "Noon Chai", "Beverages"],
  ["kashmiri-lassi", "Kashmiri Lassi", "Beverages"],
  ["babribyol", "Babribyol", "Beverages"],
];

const NEW_DISH = {
  name: "Shami Kabab",
  slug: "shami-kabab",
  description:
    "Soft, spiced patties of finely minced mutton and chana dal, pan-seared in ghee until crusted outside and meltingly tender within.",
  fullDescription:
    "Shami Kabab is a griddle kabab of twice-ground mutton cooked down with split chana dal and whole spices, then pounded to a smooth paste, bound with egg, and shallow-fried into flat discs. In the Kashmiri kitchen it belongs to the kabab family served alongside the Wazwan, prized for a soft, almost creamy interior against a browned crust. The dal is not a filler but the dish's signature, giving the kabab its characteristic bind and gentle nuttiness.",
  history:
    "The shami kabab travelled into the subcontinent with Central Asian and Mughal cooks and settled across the north, Kashmir included, where kabab-making is a respected craft. The name is popularly tied to the Levant (‘Shaam’), and the dish's defining trick — simmering minced meat with chana dal until both collapse into one paste — made it a way to stretch and soften meat into an elegant, spoon-tender kabab fit for a feast.",
  touristTip:
    "Eat it hot off the griddle with a squeeze of lemon, sliced onions and a sharp mint or onion chutney; the best versions are soft enough to break with the side of a fork.",
  category: "Wazwan",
  categoryType: "wazwan",
  foodType: "Non-veg",
  image: "/images/dishes/dish-placeholder.webp",
  priceRange: "INR 200-400",
  popularityRating: 4.5,
  spiceLevel: "Medium",
  tags: ["kashmiri", "wazwan", "kabab", "non-veg"],
  authenticityScore: 4.4,
  touristFriendlinessScore: 4.6,
  luxuryScore: 3.5,
  recipe: {
    kashmiriName: "Shami Kabab",
    altSpellings: ["Shaami Kabab"],
    tradition: "Wazwan (Muslim)",
    intro:
      "Minced mutton simmered with chana dal and whole spices until dry, ground to a smooth paste, bound with egg and shallow-fried into soft, crusted patties. A kabab defined by the meeting of meat and dal.",
    significance:
      "Shami kabab sits in the kabab register of the Kashmiri table, cooked for guests and festive meals and sold at the valley's better kabab counters. Its identity is the two-stage method: a slow simmer that marries mutton and chana dal into one tender mass, then a hot ghee fry that sets a thin crust. Unlike the skewered seekh, it is a griddle kabab — flat, soft, and eaten with chutney and onions.",
    prepTimeMinutes: 30,
    cookTimeMinutes: 40,
    servings: "4",
    difficulty: "Moderate",
    ingredients: [
      "500 g mutton mince (leg), with a little fat",
      "100 g chana dal (split Bengal gram), soaked 1 hour",
      "1 onion, roughly chopped",
      "4 cloves garlic and 1 inch ginger",
      "3-4 dried Kashmiri chillies",
      "4 cloves, 4 green cardamoms, 1 black cardamom, 1 small cinnamon stick",
      "1 tsp cumin seeds",
      "1 tsp fennel powder",
      "Salt to taste",
      "1 egg, beaten, to bind",
      "A handful of chopped coriander and mint",
      "Ghee for shallow-frying",
    ],
    instructions: [
      "Put the mince, drained chana dal, onion, ginger, garlic, whole spices, cumin, fennel and salt in a heavy pot with just enough water to cover.",
      "Simmer, covered, until the meat and dal are completely soft and the water has all but evaporated, 30-35 minutes.",
      "Cool the mixture, pick out the whole spices, and grind it to a smooth, stiff paste with no free moisture.",
      "Work in the chopped coriander and mint and the beaten egg until the paste holds together firmly.",
      "With moist hands, shape the paste into flat discs about a centimetre thick.",
      "Heat ghee in a wide pan over medium heat and shallow-fry the kababs until deep golden and crusted on both sides, 3-4 minutes a side.",
      "Drain briefly and serve hot with lemon, onion rings and chutney.",
    ],
    wazaTips: [
      "Cook the mixture until truly dry before grinding — any moisture and the kababs fall apart in the pan.",
      "Chill the shaped kababs for 15 minutes before frying so they hold their form.",
    ],
    homeAdaptation:
      "Twice-minced lamb and ordinary chana dal reproduce this anywhere; a food processor grinds the cooked mixture in seconds.",
    commonMistakes: [
      "A wet paste, which spreads and breaks on the griddle.",
      "Frying on high heat, which colours the crust before the centre warms through.",
    ],
    servingSuggestions:
      "Serve as a starter or alongside the Wazwan with mint chutney, sliced onion and lemon.",
    relatedDishes: ["seekh-kebab", "tabak-maaz", "rogan-josh"],
  },
};

const run = async () => {
  await connectDB();
  const keepSlugs = new Set(KEEP.map(([s]) => s));
  keepSlugs.add(NEW_DISH.slug);

  const before = await Dish.find({}, "slug name category").lean();
  const report = { renamed: [], moved: [], deleted: [], refFixes: [] };

  // 1) Apply renames + category moves to kept dishes (updateOne skips the
  //    slug-regenerating pre-save hook, so slugs/_ids are preserved).
  for (const [slug, name, category] of KEEP) {
    const cur = before.find((d) => d.slug === slug);
    if (!cur) { console.error(`MISSING kept dish in DB: ${slug}`); process.exit(1); }
    const set = {};
    if (cur.name !== name) { set.name = name; report.renamed.push(`${cur.name} -> ${name} (${slug})`); }
    if (cur.category !== category) { set.category = category; report.moved.push(`${name}: ${cur.category} -> ${category}`); }
    if (Object.keys(set).length) await Dish.updateOne({ slug }, { $set: set });
  }

  // 2) Add the one net-new dish (save() validates + generates slug).
  const exists = await Dish.findOne({ slug: NEW_DISH.slug });
  if (!exists) { await new Dish(NEW_DISH).save(); console.log("added shami-kabab"); }

  // 3) Determine deletions = every dish whose slug is not in the keep set.
  const toDelete = before.filter((d) => !keepSlugs.has(d.slug));
  const delIds = toDelete.map((d) => d._id);
  report.deleted = toDelete.map((d) => `${d.name} (${d.slug})`);

  // 4) Referential integrity: pull deleted dish _ids out of restaurant.linkedDishes.
  const db = mongoose.connection.db;
  const restRes = await db.collection("restaurants").updateMany(
    { linkedDishes: { $in: delIds } },
    { $pull: { linkedDishes: { $in: delIds } } }
  );
  report.refFixes.push(`restaurants.linkedDishes: pulled orphaned refs from ${restRes.modifiedCount} restaurant(s)`);

  // 5) Referential integrity: prune recipe.relatedDishes on kept dishes to kept slugs.
  const kept = await Dish.find({ slug: { $in: [...keepSlugs] }, "recipe.relatedDishes.0": { $exists: true } }, "slug recipe.relatedDishes");
  let relFixed = 0;
  for (const d of kept) {
    const orig = d.recipe.relatedDishes || [];
    const filtered = orig.filter((s) => keepSlugs.has(s));
    if (filtered.length !== orig.length) {
      await Dish.updateOne({ slug: d.slug }, { $set: { "recipe.relatedDishes": filtered } });
      relFixed++;
    }
  }
  report.refFixes.push(`recipe.relatedDishes: pruned dangling slugs on ${relFixed} dish(es)`);

  // 6) Delete the non-catalog dishes.
  const delRes = await Dish.deleteMany({ _id: { $in: delIds } });
  console.log(`deleted ${delRes.deletedCount} dishes`);

  // 7) Validate.
  const after = await Dish.find({}, "slug name category").lean();
  const counts = {};
  for (const d of after) counts[d.category] = (counts[d.category] || 0) + 1;
  const slugs = after.map((d) => d.slug);
  const names = after.map((d) => d.name);
  const dupSlugs = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  const dupNames = names.filter((n, i) => names.indexOf(n) !== i);
  const orphanRest = await db.collection("restaurants").countDocuments({ linkedDishes: { $in: delIds } });

  console.log("\n===== REPORT =====");
  console.log("removed:", delRes.deletedCount);
  console.log("total remaining:", after.length);
  console.log("counts:", JSON.stringify(counts));
  console.log("renamed:\n  " + report.renamed.join("\n  "));
  console.log("moved:\n  " + report.moved.join("\n  "));
  console.log("refFixes:\n  " + report.refFixes.join("\n  "));
  console.log("duplicate slugs:", dupSlugs.length ? dupSlugs.join(", ") : "none");
  console.log("duplicate names:", dupNames.length ? dupNames.join(", ") : "none");
  console.log("orphaned restaurant refs remaining:", orphanRest);
  console.log("Cafes remaining:", counts["Cafes"] || 0, "| Luxury Dining remaining:", counts["Luxury Dining"] || 0);

  const ok =
    after.length === 47 &&
    counts["Wazwan"] === 20 && counts["Kashmiri Cuisine"] === 3 && counts["Bakery"] === 6 &&
    counts["Street Food"] === 7 && counts["Desserts"] === 6 && counts["Beverages"] === 5 &&
    !dupSlugs.length && !dupNames.length && !orphanRest && !counts["Cafes"] && !counts["Luxury Dining"];
  console.log("\nVALIDATION:", ok ? "PASS ✓" : "FAIL ✗");
  process.exit(ok ? 0 : 1);
};
run().catch((e) => { console.error(e); process.exit(1); });
