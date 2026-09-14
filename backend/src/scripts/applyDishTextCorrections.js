// Applies the dish text corrections in frontend/data/dishTextCorrections.json to the live catalog.
//
// Usage (run from backend/, with MONGODB_URI in the environment or backend/.env):
//   node src/scripts/applyDishTextCorrections.js           Dry run: prints every change it would make, writes nothing.
//   node src/scripts/applyDishTextCorrections.js --apply   Backs up the affected dishes, then makes the changes.
//
// Each correction replaces one piece of text that the sources don't support, in one field of one
// dish (matched by slug). The site already shows the corrected text, because
// frontend/lib/dishContent.js applies the same file when it displays a dish; this brings the
// database into line, so the API and anything else that reads the catalog agree with the page.
//
// Safety: a field is changed only while it still contains the text being corrected. --apply first
// writes the affected dishes, as read, to src/scripts/backups/<timestamp>.json (MongoDB Extended
// JSON), then updates each dish only if its fields still hold the values that were read, then
// re-checks. Running it again finds nothing to change. It needs the full repository checkout,
// because it reads frontend/data next to backend/.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";

dotenv.config();

const USAGE = "Usage: node src/scripts/applyDishTextCorrections.js [--apply]";
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const CORRECTIONS_FILE = path.resolve(SCRIPT_DIR, "../../../frontend/data/dishTextCorrections.json");
const BACKUP_DIR = path.join(SCRIPT_DIR, "backups");

function readField(doc, field) {
  return field.split(".").reduce((value, key) => (value == null ? undefined : value[key]), doc);
}

async function buildPlans(corrections) {
  const plans = [];
  const notices = [];
  for (const [slug, fixes] of Object.entries(corrections)) {
    const doc = await Dish.findOne({ slug }).lean();
    if (!doc) {
      notices.push(`${slug}: no dish has this slug`);
      continue;
    }
    const plan = { doc, set: {}, expected: {} };
    for (const { field, from, to } of fixes) {
      const original = readField(doc, field);
      const current = plan.set[field] ?? original;
      if (typeof current !== "string" || !current.includes(from)) continue;
      plan.set[field] = current.replace(from, () => to);
      plan.expected[field] = original;
    }
    plans.push(plan);
  }
  return { plans, notices };
}

function printPlans(plans, notices) {
  for (const plan of plans) {
    const fields = Object.keys(plan.set);
    if (!fields.length) {
      console.log(`\n${plan.doc.slug}: already corrected`);
      continue;
    }
    console.log(`\n${plan.doc.slug} (${plan.doc.name})`);
    for (const field of fields) {
      console.log(`  ${field}\n    before: ${plan.expected[field]}\n    after:  ${plan.set[field]}`);
    }
  }
  for (const notice of notices) console.log(`\nNote: ${notice}`);
}

function writeBackup(plans) {
  const EJSON = mongoose.mongo?.BSON?.EJSON;
  const serialize = (value) => (EJSON ? EJSON.stringify(value, null, 2, { relaxed: true }) : JSON.stringify(value, null, 2));
  const createdAt = new Date().toISOString();
  const payload = {
    script: "applyDishTextCorrections.js",
    createdAt,
    database: mongoose.connection.name,
    format: EJSON ? "MongoDB Extended JSON (relaxed)" : "JSON",
    documents: plans.map((plan) => ({ collection: Dish.collection.collectionName, before: plan.doc, set: plan.set })),
  };
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const file = path.join(BACKUP_DIR, `dish-text-corrections-${createdAt.replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(file, serialize(payload));
  return file;
}

async function run() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--apply")) {
    console.error(USAGE);
    process.exit(1);
  }
  const apply = args.includes("--apply");
  const corrections = JSON.parse(fs.readFileSync(CORRECTIONS_FILE, "utf8"));

  await connectDB();
  console.log(apply ? "APPLY: changes are written after a backup." : "DRY RUN: nothing will be written.");

  const { plans, notices } = await buildPlans(corrections);
  printPlans(plans, notices);
  const changing = plans.filter((plan) => Object.keys(plan.set).length);
  if (!changing.length) {
    console.log("\nNothing to change.");
    return;
  }
  if (!apply) {
    console.log(`\nDry run: ${changing.length} dish(es) would change. Re-run with --apply to write them.`);
    return;
  }

  const backupFile = writeBackup(changing);
  console.log(`\nBackup of ${changing.length} dish(es) written to ${backupFile}`);

  const skipped = [];
  for (const plan of changing) {
    // The filter repeats the values that were read, so a dish edited in the meantime is skipped
    // rather than overwritten.
    const result = await Dish.updateOne({ _id: plan.doc._id, ...plan.expected }, { $set: plan.set });
    if (result.matchedCount !== 1) skipped.push(plan);
  }
  console.log(`Updated ${changing.length - skipped.length} dish(es).`);
  if (skipped.length) {
    console.log(`Skipped ${skipped.length} dish(es) that changed after they were read: ${skipped.map((plan) => plan.doc.slug).join(", ")}`);
    process.exitCode = 1;
  }

  const remaining = (await buildPlans(corrections)).plans.filter((plan) => Object.keys(plan.set).length);
  if (remaining.length) {
    console.log(`Re-check: ${remaining.length} dish(es) still need changes; run the script again.`);
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
    console.error("Dish text corrections failed:", error?.message || error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
