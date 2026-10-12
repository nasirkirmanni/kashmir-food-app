import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DESTINATION_PROFILES } from "../data/destinationProfiles";
import { hasWrittenDestinationContent, sanitizeDestination } from "./destinationContent";

// Destination pages whose records hold only seed placeholders get a written, sourced profile. With
// it they have real content, so they're indexed and listed in the sitemap; text written in the
// database later must still win over the profile.

const slugs = new Set(
  JSON.parse(readFileSync(join(__dirname, "..", "destinations-static-ids.json"), "utf8")).map((d) => d.slug)
);

const placeholderRecord = (slug, name) => ({
  slug,
  name,
  location: "South Kashmir, Anantnag",
  description: `A breathtaking destination in South Kashmir, Anantnag famous for its natural landscapes and local hospitality.`,
  fullDescription: `${name} stands as a premier tourist attraction in the Kashmir valley. Located in South Kashmir, Anantnag, it offers visitors spectacular panoramic views, rich cultural landmarks, and a serene getaway.`,
  attractions: [`${name} Scenic Point`, `Historic Local Market in ${name}`, `Traditional Food Street of ${name}`],
});

describe("destination profiles", () => {
  it("belong to destinations that exist, and name their sources", () => {
    for (const [slug, profile] of Object.entries(DESTINATION_PROFILES)) {
      expect(slugs.has(slug), slug).toBe(true);
      expect(profile.description.length, slug).toBeGreaterThan(60);
      expect(profile.fullDescription.length, slug).toBeGreaterThan(profile.description.length);
      expect(Array.isArray(profile.attractions), slug).toBe(true);
      expect(profile.sources.length, slug).toBeGreaterThan(0);
      for (const source of profile.sources) expect(source.url, slug).toMatch(/^https:\/\//);
    }
  });

  it("fill a placeholder-only record, so the page is indexable and goes in the sitemap", () => {
    for (const slug of Object.keys(DESTINATION_PROFILES)) {
      const d = sanitizeDestination(placeholderRecord(slug, slug));
      expect(d.description, slug).toBe(DESTINATION_PROFILES[slug].description);
      expect(d.sources, slug).toBe(DESTINATION_PROFILES[slug].sources);
      expect(hasWrittenDestinationContent(d), slug).toBe(true);
    }
  });

  it("never replace text written in the database", () => {
    const written = { ...placeholderRecord("verinag", "Verinag"), description: "Our own description of Verinag." };
    const d = sanitizeDestination(written);
    expect(d.description).toBe("Our own description of Verinag.");
    expect(d.fullDescription).toBe("");
    expect(d.sources).toBeUndefined();
  });
});
