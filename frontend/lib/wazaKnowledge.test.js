import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import destinations from "../data/destinations.json";
import { blogPosts } from "../data/blogPosts";
import { RESTAURANTS } from "../data/srinagarRestaurants";
import { wazwanGuides } from "../data/wazwanGuides";
import { addedDishes } from "./addedDishes";
import { backgroundChunks, buildWazaKnowledge, markdownSections, packParagraphs, plainMarkdown } from "./wazaKnowledge";

const at = (path) => fileURLToPath(new URL(path, import.meta.url));
const committed = JSON.parse(readFileSync(at("../../backend/src/Knowledge/waza-index.json"), "utf8"));
const snapshot = JSON.parse(readFileSync(at("../../backend/src/Knowledge/sources/dishes.snapshot.json"), "utf8"));
const background = readFileSync(at("../../backend/src/Knowledge/kashmir-knowledge-base.md"), "utf8");
const built = buildWazaKnowledge({ dishRecords: snapshot.dishes, destinations, backgroundMarkdown: background });
const byId = new Map(built.chunks.map((chunk) => [chunk.id, chunk]));

describe("Waza AI's knowledge index", () => {
  it("is up to date: the committed file is what the site's content builds today", () => {
    // If this fails, a story, guide, recipe, dish text or directory profile changed. Run
    //   npx vite-node scripts/build-waza-knowledge.mjs
    // in frontend/ and commit backend/src/Knowledge/waza-index.json with the change.
    expect(committed.meta.version).toBe(built.meta.version);
    expect(committed.chunks.length).toBe(built.chunks.length);
    expect(committed.meta.format).toBe(1);
  });

  it("covers every dish, restaurant, story, guide and destination the site has", () => {
    for (const dish of [...snapshot.dishes, ...addedDishes()]) expect(byId.has(`dish:${dish.slug}`), dish.slug).toBe(true);
    for (const dish of addedDishes()) expect(byId.has(`recipe:${dish.slug}`), dish.slug).toBe(true);
    for (const place of RESTAURANTS) expect(byId.has(`restaurant:${place.slug}`), place.slug).toBe(true);
    for (const post of blogPosts) expect(built.chunks.some((chunk) => chunk.id.startsWith(`story:${post.slug}#`)), post.slug).toBe(true);
    for (const guide of wazwanGuides) expect(built.chunks.some((chunk) => chunk.id.startsWith(`guide:${guide.slug}#`)), guide.slug).toBe(true);
    for (const place of destinations) expect(byId.has(`destination:${place.slug}`), place.slug).toBe(true);
    expect(built.entities.filter((entity) => entity.kind === "dish").length).toBe(snapshot.dishes.length + addedDishes().length);
    expect(built.entities.filter((entity) => entity.kind === "restaurant").length).toBe(RESTAURANTS.length);
  });

  it("gives every chunk an id, a kind, a trust tier and text, and links only into the site", () => {
    const ids = new Set();
    for (const chunk of built.chunks) {
      expect(ids.has(chunk.id), chunk.id).toBe(false);
      ids.add(chunk.id);
      expect(["verified", "site", "background"], chunk.id).toContain(chunk.tier);
      expect(chunk.title.length, chunk.id).toBeGreaterThan(2);
      expect(chunk.text.split(/\s+/).length, chunk.id).toBeGreaterThanOrEqual(5);
      expect(chunk.url === "" || chunk.url.startsWith("/"), chunk.id).toBe(true);
      // Nothing left of the Markdown or of the directory's citation marks.
      expect(chunk.text, chunk.id).not.toMatch(/\[\[|\]\]|\]\(|undefined|\bnull\b/);
      for (const source of chunk.sources) expect(source.url, chunk.id).toMatch(/^https?:\/\//);
      // The older notes are never passed off as a page of the site.
      if (chunk.tier === "background") expect(chunk.url, chunk.id).toBe("");
    }
  });

  it("marks sourced text as verified and the older notes as background", () => {
    expect(byId.get("restaurant:ahdoos").tier).toBe("verified");
    expect(byId.get("restaurant:ahdoos").sources.length).toBeGreaterThan(2);
    expect(byId.get("wazwan:definition").tier).toBe("verified");
    expect(byId.get("dish:rista").tier).toBe("site");
    expect(byId.get("recipe:rista").tier).toBe("site");
    expect(built.chunks.filter((chunk) => chunk.id.startsWith("story:rogan-josh-history#")).every((chunk) => chunk.tier === "verified")).toBe(true);
    expect(built.chunks.filter((chunk) => chunk.id.startsWith("background:")).every((chunk) => chunk.tier === "background")).toBe(true);
    expect(built.meta.byTier.verified).toBeGreaterThan(built.meta.byTier.background);
  });

  it("leaves out what nothing sources, and the placeholder text", () => {
    const all = JSON.stringify(built);
    // Stored price ranges, popularity and the three "scores" never reach Waza.
    expect(/INR \d+-\d+|authenticityScore|popularityRating|luxuryScore|Authenticity \d|Tourist Friendliness/.test(all)).toBe(false);
    expect(/A breathtaking destination in|Scenic Point|renowned culinary offering from Kashmir/.test(all)).toBe(false);
    // The older notes' instructions to the old bot, and its made-up relationships, are not knowledge.
    expect(/Bot Routing|program the bot|ficin/i.test(all)).toBe(false);
    // The restaurant directory states every time that Google's figure is Google's.
    expect(byId.get("restaurant:ahdoos").text).toContain("that is Google's figure, not Wazwan Way's rating");
    expect(byId.get("restaurant:ahdoos").text).toContain("Wazwan Way has not phoned or visited");
  });

  it("names no one it should not", () => {
    // The recipes' source asked not to be named (data/recipeRevisions.js).
    const name = new RegExp([["ruk", "hsa+r"], ["master", "chef"], ["dr\\.? ", "say", "eed"], ["say", "eed's"]].map((parts) => parts.join("")).join("|"), "i");
    const all = JSON.stringify(built);
    expect(name.test(all)).toBe(false);
    // No video or reel is linked. (A restaurant's own Instagram page, cited by the directory, is a
    // different thing and stays.) Checked with booleans so a failure does not print the whole index.
    expect(/youtube\.com|youtu\.be|instagram\.com\/reel/.test(all)).toBe(false);
  });

  it("recognises dishes and places by the names people use, without mistaking everyday words for them", () => {
    const phrases = (id) => built.entities.find((entity) => entity.id === id).phrases;
    expect(phrases("dish:noon-chai")).toEqual(expect.arrayContaining(["noon chai", "pink tea"]));
    expect(phrases("dish:gushtaba")).toContain("gushtaba");
    expect(phrases("rest:ahdoos")).toContain("ahdoo");
    expect(built.entities.find((entity) => entity.id === "rest:authentic-wazwan").strict).toBe(true);
    const all = built.entities.flatMap((entity) => entity.phrases);
    expect(new Set(all).size, "one owner per name").toBe(all.length);
    for (const generic of ["rice", "bread", "tripe", "trip", "palak", "korma", "kabab", "chutney"]) expect(all, generic).not.toContain(generic);
    for (const entity of built.entities) expect(entity.phrases.length, entity.id).toBeGreaterThan(0);
  });

  it("keeps a citation in the sentence and collects the link", () => {
    const { text, sources, internal } = plainMarkdown("The ribs are **boiled** first ([Scroll, from *Wazwaan*](https://scroll.in/food/945552/tabakh-maaz)). See our [recipe](/dishes/tabak-maaz#recipe).");
    expect(text).toBe("The ribs are boiled first (Scroll, from Wazwaan). See our recipe.");
    expect(sources).toEqual([{ label: "Scroll, from Wazwaan", url: "https://scroll.in/food/945552/tabakh-maaz" }]);
    expect(internal).toEqual(["/dishes/tabak-maaz"]);
  });

  it("cuts an article at its headings and into pieces a prompt can hold", () => {
    const sections = markdownSections("Opening words.\n\n## First\n\nBody one.\n\n### Detail\n\nBody two.\n\n## Sources\n\n- a");
    expect(sections.map((section) => section.heading)).toEqual(["", "First", "First: Detail", "Sources"]);
    const long = Array.from({ length: 12 }, (_, i) => `Paragraph ${i} ${"word ".repeat(60)}`).join("\n\n");
    const pieces = packParagraphs(long);
    expect(pieces.length).toBeGreaterThan(2);
    for (const piece of pieces) expect(piece.split(/\s+/).length).toBeLessThanOrEqual(370);
    const words = built.chunks.filter((chunk) => chunk.type === "story" || chunk.type === "guide").map((chunk) => chunk.text.split(/\s+/).length);
    expect(Math.max(...words)).toBeLessThanOrEqual(380);
  });

  it("takes the older notes one question at a time", () => {
    const chunks = backgroundChunks(background);
    const tulip = chunks.find((chunk) => chunk.id === "background:travel-questions-when-is-the-tulip-garden-open");
    expect(tulip).toBeDefined();
    expect(tulip.title).toBe("Travel questions: When is the Tulip Garden open?");
    expect(chunks.every((chunk) => chunk.tier === "background" && chunk.url === "")).toBe(true);
    // The sections the site now covers from sources are not carried over.
    expect(chunks.some((chunk) => /^background:(kashmiri-cuisine|wazwan|knowledge-graph|about)/.test(chunk.id))).toBe(false);
  });

  it("drops the older notes' lists of named businesses and fares, and their instructions to the old bot", () => {
    const chunks = backgroundChunks(background);
    const text = chunks.map((chunk) => `${chunk.id}\n${chunk.title}\n${chunk.text}`).join("\n");
    for (const name of ["Imran Cafeteria", "Shahee Darbar", "Mama Barbeque", "Lakme", "Frosty", "Dil Bahar", "Chai Jaai", "Lala Sheikh", "Deen Tea", "Mr. Irani", "Tempo Traveller"]) expect(text.includes(name), name).toBe(false);
    expect(/taxi-fares|shops-and-services|key-vendors|recommendation-rankings|comparison-table/.test(text)).toBe(false);
    expect(/Best overall|undisputed king|18% taxi fare|Bot Routing|your bot can/i.test(text)).toBe(false);
    // Dropping a sub-section must not run its text into its neighbour: the note on the old city's
    // bakers is its own chunk, with its own heading.
    const kandurs = chunks.find((chunk) => chunk.id === "background:tea-in-srinagar-3-the-raw-cultural-experience-downtown-kandurs");
    expect(kandurs.text).toMatch(/Noon Chai by the glass/);
    expect(kandurs.text).not.toMatch(/Best |Irani|Deen/);
    expect(chunks.find((chunk) => chunk.id === "background:street-food-tujj-core-knowledge-what-is-kashmiri-tujj")).toBeDefined();
  });

  it("does not take the chinar tree for the restaurant of that name", () => {
    const chinar = built.entities.find((entity) => entity.id === "rest:the-chinar");
    expect(chinar.strict).toBe(true);
    expect(chinar.notBefore).toEqual(expect.arrayContaining(["tree", "leaf"]));
    // The notes about the tree are not filed under the restaurant.
    const filed = built.chunks.filter((chunk) => chunk.tier === "background" && (chunk.ent || []).includes("rest:the-chinar"));
    expect(filed.map((chunk) => chunk.id)).toEqual([]);
  });
});
