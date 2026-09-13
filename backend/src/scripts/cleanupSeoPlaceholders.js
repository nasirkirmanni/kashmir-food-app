// SEO content-integrity cleanup for the live catalog.
//
// Usage (run from backend/, with MONGODB_URI in the environment or backend/.env):
//   node src/scripts/cleanupSeoPlaceholders.js           Dry run: prints every change it would make, writes nothing.
//   node src/scripts/cleanupSeoPlaceholders.js --apply   Backs up the affected documents, then makes the changes.
//
// It removes placeholder copy that earlier seed scripts generated and repoints image paths
// whose file is not in frontend/public. No other field is ever written (Mongoose also sets
// updatedAt on the documents it changes).
//
//   Destinations  description and fullDescription produced by the old upsertSeed.js templates
//                 ("A breathtaking destination in … famous for its natural landscapes and local
//                 hospitality." / "<Name> stands as a premier tourist attraction in the Kashmir
//                 valley. …") are unset. The invented attractions "<Name> Scenic Point",
//                 "Historic Local Market in <Name>" and "Traditional Food Street of <Name>" are
//                 removed from `attractions`; every other attraction is kept.
//   Dishes        description, fullDescription, history and touristTip holding the generated
//                 boilerplate ("A traditional Kashmiri veg dish prepared in the authentic …
//                 style.", "<Name> is a renowned culinary offering from Kashmir. …", "The history
//                 of <Name> stretches back generations, …", "When ordering <Name>, pair it with
//                 warm steamed rice …") are unset, except that description becomes the dish's
//                 hand-written recipe.intro when it has one.
//   Images        A dish or destination `image` with no file at exactly that path in
//                 frontend/public (Vercel is case-sensitive) is set to, in order of preference:
//                 the same file under its real letter case, a verified photo of the same subject
//                 (IMAGE_ALIASES in frontend/lib/contentImages.js), or the folder's placeholder.
//                 Missing restaurant images are listed but not changed (there is no placeholder).
//
// Safety: a field is only changed when it is the template text in full; template wording
// mixed with other text is reported and left for a person to edit. --apply first writes the
// affected documents, as read, to src/scripts/backups/<timestamp>.json (MongoDB Extended JSON),
// then updates each document only if it still holds the values that were read, then re-checks.
// Running it again finds nothing to change. It needs the full repository checkout, because it
// reads frontend/public and frontend/lib/contentImages.js next to backend/.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";
import { Destination } from "../models/Destination.js";
import { Restaurant } from "../models/Restaurant.js";

dotenv.config();

const USAGE = "Usage: node src/scripts/cleanupSeoPlaceholders.js [--apply]";
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = path.resolve(SCRIPT_DIR, "../../../frontend");
const PUBLIC_DIR = path.join(FRONTEND_DIR, "public");
const CONTENT_IMAGES_FILE = path.join(FRONTEND_DIR, "lib", "contentImages.js");
const BACKUP_DIR = path.join(SCRIPT_DIR, "backups");

const PLACEHOLDERS = [
  ["/images/dishes/", "/images/dishes/dish-placeholder.webp"],
  ["/images/destinations/", "/images/destinations/destination-placeholder.webp"],
];

// Copy of IMAGE_ALIASES in frontend/lib/contentImages.js: stored paths whose file is missing,
// mapped to a photo of the same dish or place. The run stops if the two maps differ.
const IMAGE_ALIASES = {
  "/images/dishes/aab-gosht.jpg": "/images/scroll/AAB.png",
  "/images/dishes/gushtaba.jpg": "/images/scroll/GUSHTABA.png",
  "/images/dishes/rista.jpg": "/images/scroll/RISTA.png",
  "/images/dishes/rogan-josh.webp": "/images/scroll/ROGAN.png",
  "/images/dishes/seekh-kabab.webp": "/images/scroll/KABAB.png",
  "/images/dishes/tabak-maaz.jpg": "/images/scroll/TABAKH.png",
  "/images/destinations/tarsar-marsar.jpg": "/images/tarsarmarsar.png",
};

// The generated texts in full. Only the name, location, category and veg/non-veg vary.
const DESTINATION_TEMPLATES = {
  description: /^A breathtaking destination in .+ famous for its natural landscapes and local hospitality\.$/,
  fullDescription:
    /^.+ stands as a premier tourist attraction in the Kashmir valley\. Located in .+, it offers visitors spectacular panoramic views, rich cultural landmarks, and a serene getaway\. Renowned for its unique atmosphere, it continues to welcome travelers from around the world looking to explore the natural wonder and traditional Kashmiri lifestyle\.$/,
};

const DISH_TEMPLATES = {
  description: /^A traditional Kashmiri (?:veg|non-veg) dish prepared in the authentic .+ style\.$/,
  fullDescription:
    /^.+ is a renowned culinary offering from Kashmir\. Made with traditional spices and cooking methods, this (?:veg|non-veg) item delivers the deep flavor profile typical of .+ cuisine\. Perfectly seasoned with spices such as fennel, ginger, and saffron, it represents the rich culinary heritage of the valley\.$/,
  history:
    /^The history of .+ stretches back generations, drawing deep influences from local traditions and Central Asian culinary pathways\. Historically prepared by master chefs \(Wazas\) or passed down through domestic households, it has become a true staple of Kashmiri dining\. It symbolizes hospitality and celebration, gracing tables during weddings, festivals, and family gatherings\.$/,
  touristTip:
    /^When ordering .+, pair it with warm steamed rice or traditional local bread like Lavas\. Ask your hosts about the specific spices used to enhance the flavor\.$/,
};

// A phrase from each template, to catch template wording mixed with other text.
const TEMPLATE_PHRASES = {
  description: /famous for its natural landscapes and local hospitality|dish prepared in the authentic .+ style/,
  fullDescription: /stands as a premier tourist attraction in the Kashmir valley|is a renowned culinary offering from Kashmir/,
  history: /drawing deep influences from local traditions and Central Asian culinary pathways/,
  touristTip: /pair it with warm steamed rice or traditional local bread like Lavas/,
};

const GENERATED_ATTRACTIONS = [
  /^(.+) Scenic Point$/,
  /^Historic Local Market in (.+)$/,
  /^Traditional Food Street of (.+)$/,
];

function listPublicFiles() {
  const files = new Set();
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) files.add(`/${path.relative(PUBLIC_DIR, full).split(path.sep).join("/")}`);
    }
  };
  walk(PUBLIC_DIR);
  return files;
}

// Runs before connecting, so a missing frontend checkout or a drifted alias map stops the
// script before it can read or write the database.
function loadImageIndex() {
  for (const required of [PUBLIC_DIR, CONTENT_IMAGES_FILE]) {
    if (!fs.existsSync(required)) {
      throw new Error(`${required} not found. Run this from the full repository checkout (backend/ next to frontend/).`);
    }
  }
  const aliasBlock = fs.readFileSync(CONTENT_IMAGES_FILE, "utf8").match(/IMAGE_ALIASES\s*=\s*\{([\s\S]*?)\};/);
  const frontendAliases = aliasBlock
    ? [...aliasBlock[1].matchAll(/"([^"]+)"\s*:\s*"([^"]+)"/g)].map(([, from, to]) => `${from} -> ${to}`).sort()
    : [];
  const scriptAliases = Object.entries(IMAGE_ALIASES).map(([from, to]) => `${from} -> ${to}`).sort();
  if (JSON.stringify(frontendAliases) !== JSON.stringify(scriptAliases)) {
    throw new Error("IMAGE_ALIASES here no longer matches frontend/lib/contentImages.js. Update the copy in this script first.");
  }
  const files = listPublicFiles();
  for (const [, placeholder] of PLACEHOLDERS) {
    if (!files.has(placeholder)) throw new Error(`Placeholder ${placeholder} is missing from frontend/public.`);
  }
  return { files, byLowerCase: new Map([...files].map((file) => [file.toLowerCase(), file])) };
}

// What a local image path should become when its file is missing; null when it is fine.
function planImage(src, images) {
  if (typeof src !== "string" || !src.startsWith("/") || src.startsWith("//")) return null;
  const filePath = src.split(/[?#]/)[0];
  if (images.files.has(filePath)) return null;
  const sameFile = images.byLowerCase.get(filePath.toLowerCase());
  if (sameFile) return { to: sameFile, reason: "same file, real letter case" };
  const alias = IMAGE_ALIASES[filePath];
  if (alias && images.files.has(alias)) return { to: alias, reason: "verified photo of the same subject" };
  const placeholder = PLACEHOLDERS.find(([dir]) => filePath.toLowerCase().startsWith(dir));
  if (placeholder) return { to: placeholder[1], reason: "placeholder, no photo on file" };
  return { to: null, reason: "missing, and this folder has no placeholder" };
}

// Names used by generated attractions: the destination's own name, plus any name that shows
// up in all three generated shapes (a place renamed after seeding). Other entries are real.
function generatedAttractionNames(attractions, name) {
  const found = GENERATED_ATTRACTIONS.map(
    (pattern) => new Set(attractions.map((a) => (typeof a === "string" ? a.trim().match(pattern)?.[1] : undefined)).filter(Boolean))
  );
  const names = new Set(typeof name === "string" && name.trim() ? [name.trim()] : []);
  for (const candidate of found[0]) {
    if (found[1].has(candidate) && found[2].has(candidate)) names.add(candidate);
  }
  return names;
}

function isGeneratedAttraction(attraction, names) {
  if (typeof attraction !== "string") return false;
  return GENERATED_ATTRACTIONS.some((pattern) => {
    const match = attraction.trim().match(pattern);
    return Boolean(match) && names.has(match[1]);
  });
}

function newPlan(kind, model, doc) {
  // expected: the values read for every field being changed (used to guard the update).
  return { kind, model, doc, set: {}, unset: {}, expected: {}, changes: [], warnings: [] };
}

function planTextFields(plan, templates) {
  const { doc } = plan;
  for (const [field, template] of Object.entries(templates)) {
    const value = doc[field];
    if (typeof value !== "string") continue;
    if (!template.test(value.trim())) {
      if (TEMPLATE_PHRASES[field].test(value)) {
        plan.warnings.push(`${field} mixes template wording with other text; left unchanged, edit it by hand`);
      }
      continue;
    }
    plan.expected[field] = value;
    const intro = plan.kind === "dish" && field === "description" && typeof doc.recipe?.intro === "string" ? doc.recipe.intro.trim() : "";
    if (intro) {
      plan.set[field] = intro;
      plan.changes.push({ field, action: "set", from: value, to: intro, note: "from recipe.intro" });
    } else {
      plan.unset[field] = "";
      plan.changes.push({ field, action: "unset", from: value });
      if (plan.kind === "dish" && field === "description") {
        plan.warnings.push("description will be unset and there is no recipe.intro to use instead; it needs written copy");
      }
    }
  }
}

function planImageField(plan, images) {
  const change = planImage(plan.doc.image, images);
  if (!change) return;
  if (!change.to) {
    plan.warnings.push(`image ${plan.doc.image} is ${change.reason}; left unchanged`);
    return;
  }
  plan.expected.image = plan.doc.image;
  plan.set.image = change.to;
  plan.changes.push({ field: "image", action: "set", from: plan.doc.image, to: change.to, note: change.reason });
}

function planDestination(doc, images) {
  const plan = newPlan("destination", Destination, doc);
  planTextFields(plan, DESTINATION_TEMPLATES);
  if (Array.isArray(doc.attractions)) {
    const names = generatedAttractionNames(doc.attractions, doc.name);
    const kept = doc.attractions.filter((attraction) => !isGeneratedAttraction(attraction, names));
    if (kept.length !== doc.attractions.length) {
      plan.expected.attractions = doc.attractions;
      plan.set.attractions = kept;
      plan.changes.push({
        field: "attractions",
        action: "set",
        from: doc.attractions,
        to: kept,
        note: `${doc.attractions.length - kept.length} generated removed`,
      });
    }
  }
  planImageField(plan, images);
  return plan;
}

function planDish(doc, images) {
  const plan = newPlan("dish", Dish, doc);
  planTextFields(plan, DISH_TEMPLATES);
  planImageField(plan, images);
  return plan;
}

async function buildPlans(images) {
  const byName = (a, b) => String(a.name).localeCompare(String(b.name));
  const [destinations, dishes, restaurants] = await Promise.all([
    Destination.find({}).lean(),
    Dish.find({}).lean(),
    Restaurant.find({}, { name: 1, slug: 1, image: 1 }).lean(),
  ]);
  const plans = [
    ...destinations.sort(byName).map((doc) => planDestination(doc, images)),
    ...dishes.sort(byName).map((doc) => planDish(doc, images)),
  ];
  const notices = restaurants
    .filter((restaurant) => planImage(restaurant.image, images))
    .map((restaurant) => `restaurant "${restaurant.name}": image ${restaurant.image} is not in frontend/public; left unchanged (no restaurant placeholder)`);
  return { plans, notices };
}

function quote(value, max = 0) {
  const text = JSON.stringify(value);
  return max && text.length > max ? `${text.slice(0, max - 2)}…"` : text;
}

function printPlans(plans, notices) {
  for (const [kind, heading] of [["destination", "Destinations"], ["dish", "Dishes"]]) {
    const changing = plans.filter((plan) => plan.kind === kind && plan.changes.length);
    console.log(`\n${heading}: ${changing.length} to change`);
    for (const { doc, changes } of changing) {
      console.log(`\n  ${doc.name} (${doc.slug || "no slug"}, _id ${doc._id})`);
      for (const change of changes) {
        const note = change.note ? ` (${change.note})` : "";
        if (change.action === "unset") {
          console.log(`    unset ${change.field}\n      was ${quote(change.from, 120)}`);
        } else {
          const fromMax = change.field === "image" || change.field === "attractions" ? 0 : 120;
          console.log(`    set ${change.field}${note}\n      was ${quote(change.from, fromMax)}\n      now ${quote(change.to)}`);
        }
      }
    }
  }
  const review = [...plans.flatMap((plan) => plan.warnings.map((warning) => `${plan.kind} "${plan.doc.name}": ${warning}`)), ...notices];
  if (review.length) {
    console.log("\nFor review:");
    for (const line of review) console.log(`  - ${line}`);
  }
}

function writeBackup(plans) {
  const EJSON = mongoose.mongo?.BSON?.EJSON;
  const serialize = (value) => (EJSON ? EJSON.stringify(value, null, 2, { relaxed: true }) : JSON.stringify(value, null, 2));
  const parse = (text) => (EJSON ? EJSON.parse(text) : JSON.parse(text));
  const createdAt = new Date().toISOString();
  const payload = {
    script: "cleanupSeoPlaceholders.js",
    createdAt,
    database: mongoose.connection.name,
    format: EJSON ? "MongoDB Extended JSON (relaxed)" : "JSON",
    documents: plans.map((plan) => ({
      collection: plan.model.collection?.collectionName ?? plan.kind,
      before: plan.doc,
      set: plan.set,
      unset: Object.keys(plan.unset),
    })),
  };
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const file = path.join(BACKUP_DIR, `${createdAt.replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(file, `${serialize(payload)}\n`, { flag: "wx" });
  const readBack = parse(fs.readFileSync(file, "utf8"));
  if (readBack.documents?.length !== plans.length) {
    throw new Error(`Backup ${file} could not be read back; nothing was changed.`);
  }
  return file;
}

async function run() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--apply")) {
    console.error(USAGE);
    process.exit(1);
  }
  const apply = args.includes("--apply");
  const images = loadImageIndex();

  await connectDB();
  console.log(apply ? "APPLY: changes are written after a backup." : "DRY RUN: nothing will be written.");

  const { plans, notices } = await buildPlans(images);
  const changing = plans.filter((plan) => plan.changes.length);
  printPlans(plans, notices);

  if (!changing.length) {
    console.log("\nNothing to change.");
    return;
  }
  const fieldCount = changing.reduce((sum, plan) => sum + plan.changes.length, 0);
  if (!apply) {
    console.log(`\nDry run: ${fieldCount} field change(s) across ${changing.length} document(s). Re-run with --apply to write them.`);
    return;
  }

  const backupFile = writeBackup(changing);
  console.log(`\nBackup of ${changing.length} document(s) written to ${backupFile}`);

  const skipped = [];
  for (const plan of changing) {
    const update = {};
    if (Object.keys(plan.set).length) update.$set = plan.set;
    if (Object.keys(plan.unset).length) update.$unset = plan.unset;
    // The filter repeats the values that were read, so a document edited in the meantime is
    // skipped rather than overwritten. Validators stay off (the updateOne default): the schema
    // marks these text fields required, and removing the generated text is the point.
    const result = await plan.model.updateOne({ _id: plan.doc._id, ...plan.expected }, update);
    if (result.matchedCount !== 1) skipped.push(plan);
  }
  console.log(`Updated ${changing.length - skipped.length} document(s), ${fieldCount} field change(s) planned.`);
  if (skipped.length) {
    console.log(`Skipped ${skipped.length} document(s) that changed after they were read: ${skipped.map((plan) => plan.doc.name).join(", ")}`);
    process.exitCode = 1;
  }

  const remaining = (await buildPlans(images)).plans.filter((plan) => plan.changes.length);
  if (remaining.length) {
    console.log(`Re-check: ${remaining.length} document(s) still need changes; run the script again.`);
    process.exitCode = 1;
  } else {
    console.log("Re-check: nothing left to change.");
  }
}

run()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(process.exitCode ?? 0);
  })
  .catch(async (error) => {
    console.error("SEO placeholder cleanup failed:", error?.message || error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
