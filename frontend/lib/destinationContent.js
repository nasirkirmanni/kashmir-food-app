/**
 * Filters seed-script placeholder content out of destination records.
 *
 * backend/src/scripts/upsertSeed.js gave twenty destinations without written copy
 * a template description ("A breathtaking destination in … famous for its natural
 * landscapes and local hospitality."), a template full description, and three
 * invented attractions per place ("Gulmarg Scenic Point", "Historic Local Market
 * in Gulmarg", "Traditional Food Street of Gulmarg"). None of that describes a
 * real place, so it is removed before a destination is displayed, described in
 * metadata or emitted as structured data. Real stored fields are kept.
 */

const GENERATED_DESTINATION_TEXT = [
  /^A breathtaking destination in .+ famous for its natural landscapes and local hospitality\.?$/i,
  /stands as a premier tourist attraction in the Kashmir valley\. Located in .+, it offers visitors spectacular panoramic views/i,
];

const GENERATED_ATTRACTION = /^(?:.+ Scenic Point|Historic Local Market in .+|Traditional Food Street of .+)$/i;

export function isGeneratedDestinationText(text) {
  return typeof text === "string" && GENERATED_DESTINATION_TEXT.some((pattern) => pattern.test(text.trim()));
}

export function isGeneratedAttraction(attraction) {
  return typeof attraction === "string" && GENERATED_ATTRACTION.test(attraction.trim());
}

function realText(value) {
  return typeof value === "string" && value.trim() && !isGeneratedDestinationText(value) ? value.trim() : "";
}

function realList(values) {
  return Array.isArray(values)
    ? values.filter((v) => typeof v === "string" && v.trim()).map((v) => v.trim())
    : [];
}

/** Returns a copy of the destination with generated placeholder content removed. */
export function sanitizeDestination(destination) {
  if (!destination) return destination;
  return {
    ...destination,
    description: realText(destination.description),
    fullDescription: realText(destination.fullDescription),
    attractions: realList(destination.attractions).filter((a) => !isGeneratedAttraction(a)),
  };
}

/**
 * Whether a (sanitized) destination has any written, place-specific content beyond
 * its name, location and season. Pages without it are too thin to index.
 */
export function hasWrittenDestinationContent(destination) {
  if (!destination) return false;
  return Boolean(
    destination.description ||
      destination.fullDescription ||
      destination.attractions?.length ||
      realList(destination.activities).length ||
      realText(destination.travelAdvisory)
  );
}
