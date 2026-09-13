#!/usr/bin/env node
/**
 * Refreshes frontend/{dishes,restaurants,destinations}-static-ids.json from the
 * live API — no database credentials needed.
 *
 * These files seed generateStaticParams and are the sitemap's fallback if the API
 * is unreachable during a build, so they must match the live catalogue. (A stale
 * copy is how 42 removed dishes stayed in the sitemap as 404s.) The command fails
 * without writing anything if any list can't be fetched or comes back empty.
 *
 * Usage (from frontend/): node scripts/sync-static-ids.mjs [apiBase]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FRONTEND_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API_BASE = (process.argv[2] || process.env.SITEMAP_API_URL || "https://api.wazwanway.com").replace(/\/+$/, "");
const COLLECTIONS = [
  ["dishes", "dishes-static-ids.json"],
  ["restaurants", "restaurants-static-ids.json"],
  ["destinations", "destinations-static-ids.json"],
];

async function fetchList(resource) {
  const res = await fetch(`${API_BASE}/api/${resource}`, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`${resource}: HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error(`${resource}: empty or unexpected response`);
  return data
    .filter((item) => item && item.slug)
    .map((item) => ({ id: String(item._id), slug: item.slug, ...(item.updatedAt ? { updatedAt: item.updatedAt } : {}) }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

const results = await Promise.all(COLLECTIONS.map(async ([resource, file]) => [file, await fetchList(resource)]));
for (const [file, entries] of results) {
  const target = path.join(FRONTEND_DIR, file);
  const before = fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, "utf8")).length : 0;
  fs.writeFileSync(target, `${JSON.stringify(entries, null, 2)}\n`);
  console.log(`${file}: ${before} → ${entries.length} entries`);
}
