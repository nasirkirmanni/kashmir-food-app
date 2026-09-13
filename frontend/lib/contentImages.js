/**
 * Resolves image paths stored on content records (dishes, destinations) to files
 * that actually exist in /public.
 *
 * The catalogue in the database still points some records at image files that
 * were never added to the repo. Rather than rendering a broken image — or a
 * stock feast photo that misrepresents the dish — a missing file resolves to:
 *   1. a verified photo of the same subject stored under another path, or
 *   2. a plainly-illustrated placeholder (never presented as a photograph).
 *
 * The file list comes from lib/generated/content-image-manifest.json, regenerated
 * by scripts/generate-content-image-manifest.mjs before every dev/build run.
 */
import manifest from "./generated/content-image-manifest.json";

export const DISH_PLACEHOLDER = "/images/dishes/dish-placeholder.webp";
export const DESTINATION_PLACEHOLDER = "/images/destinations/destination-placeholder.webp";

// Stored paths whose file is missing but where a photo of the same dish or place
// exists elsewhere in /public (each checked by eye against its subject).
export const IMAGE_ALIASES = {
  "/images/dishes/aab-gosht.jpg": "/images/scroll/AAB.png",
  "/images/dishes/gushtaba.jpg": "/images/scroll/GUSHTABA.png",
  "/images/dishes/rista.jpg": "/images/scroll/RISTA.png",
  "/images/dishes/rogan-josh.webp": "/images/scroll/ROGAN.png",
  "/images/dishes/seekh-kabab.webp": "/images/scroll/KABAB.png",
  "/images/dishes/tabak-maaz.jpg": "/images/scroll/TABAKH.png",
  "/images/destinations/tarsar-marsar.jpg": "/images/tarsarmarsar.png",
};

const PLACEHOLDERS = [
  ["/images/dishes/", DISH_PLACEHOLDER],
  ["/images/destinations/", DESTINATION_PLACEHOLDER],
];

const existingFiles = new Set(manifest.files);

function stripQuery(src) {
  return src.split(/[?#]/)[0];
}

/** The placeholder for a content image path, or null if its folder has none. */
export function placeholderFor(src) {
  if (typeof src !== "string") return null;
  const match = PLACEHOLDERS.find(([dir]) => src.startsWith(dir));
  return match ? match[1] : null;
}

/** True when `src` is one of the illustrated placeholders (not a real photo). */
export function isPlaceholderImage(src) {
  if (typeof src !== "string") return false;
  const path = stripQuery(src);
  return path === DISH_PLACEHOLDER || path === DESTINATION_PLACEHOLDER;
}

/**
 * Returns `src` when it exists (or isn't a tracked local content image), a verified
 * alternative photo when one is known, and otherwise the folder's placeholder.
 */
export function resolveContentImage(src) {
  if (typeof src !== "string" || !src.startsWith("/") || src.startsWith("//")) return src;
  const path = stripQuery(src);
  if (IMAGE_ALIASES[path]) return IMAGE_ALIASES[path];
  const tracked = manifest.directories.some((dir) => path.startsWith(dir));
  if (!tracked || existingFiles.has(path)) return src;
  return placeholderFor(path) ?? src;
}

/** Like resolveContentImage, but null when only a placeholder is available. */
export function resolveContentPhoto(src) {
  const resolved = resolveContentImage(src);
  return resolved && !isPlaceholderImage(resolved) ? resolved : null;
}
