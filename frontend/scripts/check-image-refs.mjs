#!/usr/bin/env node
/**
 * Fails when source code or data references a local public asset (image or
 * video) that does not exist at exactly that path.
 *
 * Paths are compared case-sensitively against the real directory listing, the
 * way Vercel's Linux builders resolve them — a reference that only works on a
 * case-insensitive macOS disk (e.g. /images/destinations vs /images/Destinations)
 * is reported as missing.
 *
 * Usage (from frontend/):
 *   node scripts/check-image-refs.mjs                 # frontend sources
 *   node scripts/check-image-refs.mjs --with-backend  # also backend seed data
 *   node scripts/check-image-refs.mjs --json          # machine-readable report
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FRONTEND_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = path.join(FRONTEND_DIR, "public");
const FRONTEND_SCAN_DIRS = ["app", "components", "context", "data", "hooks", "lib"].map((d) =>
  path.join(FRONTEND_DIR, d)
);
const BACKEND_SCAN_DIRS = [path.resolve(FRONTEND_DIR, "../backend/src/data")];
const SCAN_EXTENSIONS = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".json", ".css"]);
const ASSET_EXTENSIONS = "avif|webp|png|jpe?g|gif|svg|ico|mp4|webm";

// A root-relative asset path inside quotes, backticks or url(...).
const ASSET_REF = new RegExp(
  String.raw`(?<=["'\`(]\s*)(\/(?!\/)[^"'\`()\s<>{}$]*?\.(?:${ASSET_EXTENSIONS}))(?=[?#"'\`)\s])`,
  "gi"
);

const args = new Set(process.argv.slice(2));

function walk(dir, onFile) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, onFile);
    else onFile(full);
  }
}

// Exact-case set of every file under public/, as URL paths.
const publicFiles = new Set();
walk(PUBLIC_DIR, (file) => {
  publicFiles.add(`/${path.relative(PUBLIC_DIR, file).split(path.sep).join("/")}`);
});
const publicFilesLower = new Map([...publicFiles].map((p) => [p.toLowerCase(), p]));

const scanDirs = [...FRONTEND_SCAN_DIRS, ...(args.has("--with-backend") ? BACKEND_SCAN_DIRS : [])];
const missing = new Map(); // path -> { suggestion, refs: [file:line] }
let referenceCount = 0;

for (const dir of scanDirs) {
  walk(dir, (file) => {
    if (!SCAN_EXTENSIONS.has(path.extname(file))) return;
    if (/\.test\.[jt]sx?$/.test(file)) return;
    const lines = fs.readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      // Skip comment lines (JSDoc examples like "/images/dishes/rogan-josh.jpg").
      if (/^\s*(\*|\/\/|\/\*)/.test(line)) return;
      for (const match of line.matchAll(ASSET_REF)) {
        // Object keys (e.g. the stored-path → replacement map in lib/contentImages.js)
        // name paths that are known to be missing; only their values must exist.
        if (line.slice(match.index + match[1].length, match.index + match[1].length + 2) === '":') continue;
        let ref = match[1];
        try {
          ref = decodeURI(ref);
        } catch {
          /* keep the raw path */
        }
        referenceCount += 1;
        if (publicFiles.has(ref)) continue;
        const entry = missing.get(ref) || { suggestion: publicFilesLower.get(ref.toLowerCase()) || null, refs: [] };
        entry.refs.push(`${path.relative(path.resolve(FRONTEND_DIR, ".."), file)}:${i + 1}`);
        missing.set(ref, entry);
      }
    });
  });
}

if (args.has("--json")) {
  console.log(JSON.stringify({ referenceCount, missing: Object.fromEntries(missing) }, null, 2));
} else if (missing.size === 0) {
  console.log(`✓ check-image-refs: all ${referenceCount} local asset references resolve (case-sensitive).`);
} else {
  console.error(`✗ check-image-refs: ${missing.size} referenced local asset(s) do not exist (case-sensitive):\n`);
  for (const [ref, { suggestion, refs }] of [...missing].sort()) {
    console.error(`  ${ref}${suggestion ? `   (case mismatch — file is ${suggestion})` : ""}`);
    refs.slice(0, 5).forEach((r) => console.error(`      referenced at ${r}`));
    if (refs.length > 5) console.error(`      …and ${refs.length - 5} more`);
  }
  console.error("\nAdd the file under frontend/public, fix the path's case, or point the reference at an existing asset.");
}
process.exitCode = missing.size === 0 ? 0 : 1;
