#!/usr/bin/env node
/**
 * Writes lib/generated/content-image-manifest.json: the exact-case list of files
 * in the public folders that database-driven content (dishes, destinations,
 * restaurants) points into. lib/contentImages.js uses it to swap a missing file
 * for a verified alternative or an honest placeholder instead of a broken image.
 *
 * Runs automatically before `npm run dev` and `npm run build`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FRONTEND_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = path.join(FRONTEND_DIR, "public");
const OUTPUT = path.join(FRONTEND_DIR, "lib/generated/content-image-manifest.json");
const DIRECTORIES = ["/images/dishes/", "/images/destinations/", "/images/restaurants/"];

const files = [];
for (const dir of DIRECTORIES) {
  const abs = path.join(PUBLIC_DIR, dir);
  if (!fs.existsSync(abs)) continue;
  // readdirSync returns names with their real case, even on case-insensitive disks.
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (entry.isFile() && !entry.name.startsWith(".")) files.push(`${dir}${entry.name}`);
  }
}
files.sort();

const next = `${JSON.stringify({ directories: DIRECTORIES, files }, null, 2)}\n`;
const current = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, "utf8") : "";
if (current !== next) {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, next);
  console.log(`content-image-manifest: wrote ${files.length} files`);
}
