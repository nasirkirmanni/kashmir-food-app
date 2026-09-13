#!/usr/bin/env node
/**
 * Writes WebP derivatives beside the local route photography. The original
 * JPEGs are only read — never overwritten, moved or deleted.
 *
 *   public/images/optimized/scenic-drives/<name>.jpg
 *     → <name>-1920.webp + <name>-1080.webp   srcset pair for app/scenic-drives/[slug]
 *   public/images/trekking-camping/<name>.jpg
 *     → <name>.webp (max 1920px wide)          <source type="image/webp"> siblings
 *
 * Never upscales. Idempotent: an output at least as new as its source is kept
 * (pass --force to re-encode, e.g. after changing WEBP_OPTIONS). Prints the
 * before/after bytes of every file.
 *
 * Usage (from frontend/):
 *   node scripts/optimize-route-images.mjs
 *   node scripts/optimize-route-images.mjs --force
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const FRONTEND_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WEBP_OPTIONS = { quality: 75, effort: 6 };
const JOBS = [
  {
    dir: "public/images/optimized/scenic-drives",
    // Referenced with 1080w / 1920w srcset descriptors, so a narrower source is flagged.
    srcset: true,
    outputs: [
      { suffix: "-1920", width: 1920 },
      { suffix: "-1080", width: 1080 },
    ],
  },
  {
    dir: "public/images/trekking-camping",
    outputs: [{ suffix: "", width: 1920 }],
  },
];

const force = process.argv.includes("--force");
const bytes = (n) => `${n.toLocaleString("en-US")} B`;
const change = (after, before) => `${(((after - before) / before) * 100).toFixed(1)}%`;

sharp.cache(false);

// Encode to a temp file, then rename into place, so an interrupted run never
// leaves a partial output that a later run would treat as up to date.
async function encode(src, out, width) {
  const tmp = `${out}.${process.pid}.tmp`;
  try {
    const { data, info } = await sharp(src)
      .rotate() // apply EXIF orientation before the metadata is dropped
      .resize({ width, withoutEnlargement: true })
      .webp(WEBP_OPTIONS)
      .toBuffer({ resolveWithObject: true });
    fs.writeFileSync(tmp, data);
    fs.renameSync(tmp, out);
    return info;
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}

let failures = 0;

for (const job of JOBS) {
  const dir = path.join(FRONTEND_DIR, job.dir);
  if (!fs.existsSync(dir)) {
    console.error(`✗ ${job.dir}/ does not exist`);
    failures += 1;
    continue;
  }
  const sources = fs.readdirSync(dir).filter((name) => /\.jpe?g$/i.test(name)).sort();
  const totals = { source: 0, outputs: job.outputs.map(() => 0) };
  console.log(`\n${job.dir}/ — ${sources.length} JPEG`);

  for (const name of sources) {
    const src = path.join(dir, name);
    const srcStat = fs.statSync(src);
    totals.source += srcStat.size;
    console.log(`  ${name}  ${bytes(srcStat.size)}`);

    for (const [i, { suffix, width }] of job.outputs.entries()) {
      const outName = `${name.replace(/\.jpe?g$/i, "")}${suffix}.webp`;
      const out = path.join(dir, outName);
      try {
        let note = "up to date";
        if (force || !fs.existsSync(out) || fs.statSync(out).mtimeMs < srcStat.mtimeMs) {
          const info = await encode(src, out, width);
          note = `wrote ${info.width}x${info.height}`;
          if (job.srcset && info.width < width) note += `  ⚠ source narrower than ${width}px (not upscaled)`;
        }
        const size = fs.statSync(out).size;
        totals.outputs[i] += size;
        const warn = size >= srcStat.size ? "  ⚠ not smaller than the JPEG" : "";
        console.log(`    → ${outName}  ${bytes(size)} (${change(size, srcStat.size)})  ${note}${warn}`);
      } catch (err) {
        failures += 1;
        console.error(`    ✗ ${outName}: ${err.message}`);
      }
    }
  }

  for (const [i, { suffix }] of job.outputs.entries()) {
    const label = suffix ? `*${suffix}.webp` : "*.webp";
    console.log(
      `  total ${label}: ${bytes(totals.source)} → ${bytes(totals.outputs[i])} (${change(totals.outputs[i], totals.source)})`
    );
  }
}

process.exitCode = failures ? 1 : 0;
