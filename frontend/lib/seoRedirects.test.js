import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import redirects from "../seo-redirects.json";
import { blogPosts } from "../data/blogPosts";
import { wazwanGuides } from "../data/wazwanGuides";

// Pages merged into another page answer with a permanent redirect (seo-redirects.json, wired up in
// next.config.js). Nothing on the site may keep pointing at an old address: a link to a redirect
// costs a hop, and a sitemap entry for one tells search engines to index a page that no longer exists.

const FRONTEND = join(__dirname, "..");
const SCANNED = ["app", "components", "data", "lib"];
const SCANNED_FILES = ["public/llms.txt"];
const sources = new Set(redirects.map((r) => r.source));

function filesUnder(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return filesUnder(path);
    return /\.(js|jsx|mjs|json)$/.test(name) && !/\.test\.js$/.test(name) ? [path] : [];
  });
}

describe("seo-redirects.json", () => {
  it("lists each old address once, as a site path", () => {
    expect(sources.size).toBe(redirects.length);
    for (const { source, destination } of redirects) {
      expect(source).toMatch(/^\/[a-z0-9-/]+$/);
      expect(destination).toMatch(/^\/[a-z0-9-/]*$/);
      expect(destination).not.toBe(source);
    }
  });

  it("never sends a redirect to another redirect", () => {
    for (const { destination } of redirects) expect(sources.has(destination)).toBe(false);
  });

  it("removes merged pages from the content that renders pages and the sitemap", () => {
    const rendered = [
      ...blogPosts.map((post) => `/blog/${post.slug}`),
      ...wazwanGuides.map((guide) => `/kashmiri-food/${guide.category}/guide/${guide.slug}`),
    ];
    expect(rendered.filter((path) => sources.has(path))).toEqual([]);
  });

  it("leaves no link on the site pointing at an old address", () => {
    const stale = [];
    const files = [...SCANNED.flatMap((dir) => filesUnder(join(FRONTEND, dir))), ...SCANNED_FILES.map((f) => join(FRONTEND, f))];
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const source of sources) {
        // The path as a whole link target: quoted, in a markdown link, or with https://wazwanway.com.
        const pattern = new RegExp(`(["'\`(]|wazwanway\\.com)${source.replace(/[/-]/g, "\\$&")}(?=["'\`)#?\\s])`);
        if (pattern.test(text)) stale.push(`${relative(FRONTEND, file)} -> ${source}`);
      }
    }
    expect(stale).toEqual([]);
  });
});
