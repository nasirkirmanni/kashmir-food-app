import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parentPath, recordPop, recordReplace, recordVisit, startTrail, trailCanGoBack } from "./backNavigation";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");

function sourceFiles(dirs) {
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(join(root, dir))) {
      const path = `${dir}/${name}`;
      if (statSync(join(root, path)).isDirectory()) walk(path);
      else if (/\.jsx?$/.test(name) && !name.endsWith(".test.js")) files.push(path);
    }
  };
  dirs.forEach(walk);
  return files;
}

describe("where Back goes for a visitor who arrived from another site", () => {
  it("goes up to the page above in the breadcrumb trail", () => {
    expect(parentPath("/dishes/tabak-maaz")).toBe("/dishes");
    expect(parentPath("/restaurants/ahdoos")).toBe("/restaurants");
    expect(parentPath("/restaurants/best-wazwan-srinagar")).toBe("/restaurants");
    expect(parentPath("/blog/nadru-lotus-stem-kashmir")).toBe("/blog");
    expect(parentPath("/blog/core-seven")).toBe("/blog");
    expect(parentPath("/blog/tabak-maaz-ribs-cooked-twice")).toBe("/blog/core-seven");
    expect(parentPath("/kashmiri-food/wazwan/guide/how-wazwan-is-served")).toBe("/kashmiri-food/wazwan/guide");
    expect(parentPath("/kashmiri-food/wazwan/guide")).toBe("/dishes");
    expect(parentPath("/kashmiri-food/bakery/guide")).toBe("/kashmiri-food/bakery");
    expect(parentPath("/kashmiri-food/bakery")).toBe("/kashmiri-food");
    expect(parentPath("/destinations/gulmarg")).toBe("/destinations");
    expect(parentPath("/my-itineraries/abc123")).toBe("/profile");
  });

  it("goes home from a top-level page, and nowhere from home", () => {
    expect(parentPath("/dishes")).toBe("/");
    expect(parentPath("/restaurants")).toBe("/");
    expect(parentPath("/about")).toBe("/");
    expect(parentPath("/")).toBeNull();
  });

  it("ignores a trailing slash, a query and a hash", () => {
    expect(parentPath("/dishes/rista/")).toBe("/dishes");
    expect(parentPath("/dishes/rista?from=search#recipe")).toBe("/dishes");
  });
});

describe("the trail kept where the browser has no Navigation API", () => {
  it("steps back through site pages and stops at the page the visitor arrived on", () => {
    let trail = startTrail("/dishes", false);
    expect(trailCanGoBack(trail)).toBe(false);
    trail = recordVisit(trail, "/dishes/rista");
    trail = recordVisit(trail, "/restaurants");
    expect(trailCanGoBack(trail)).toBe(true);
    trail = recordPop(trail, "/dishes/rista");
    expect(trail.index).toBe(1);
    trail = recordPop(trail, "/dishes");
    expect(trailCanGoBack(trail)).toBe(false);
    trail = recordPop(trail, "/dishes/rista");
    expect(trail.index).toBe(1);
  });

  it("counts a first page opened from another page of the site", () => {
    expect(trailCanGoBack(startTrail("/dishes", true))).toBe(true);
  });

  it("drops pages ahead on a new visit, and keeps a replaced page in its place", () => {
    let trail = startTrail("/blog", false);
    trail = recordVisit(trail, "/blog/core-seven");
    trail = recordPop(trail, "/blog");
    trail = recordVisit(trail, "/dishes");
    expect(trail.paths).toEqual(["/blog", "/dishes"]);
    trail = recordReplace(trail, "/");
    expect(trail).toMatchObject({ paths: ["/blog", "/"], index: 1 });
    expect(recordVisit(trail, "/")).toBe(trail);
  });

  it("assumes no site page behind one it lost track of", () => {
    const trail = recordPop(recordVisit(startTrail("/dishes", true), "/blog"), "/restaurants");
    expect(trailCanGoBack(trail)).toBe(false);
  });
});

describe("one Back control across the site", () => {
  it("is mounted for phones in the root layout and for desktop in the top bar, except on home", () => {
    expect(read("app/layout.js")).toMatch(/<FloatingBackButton \/>/);
    expect(read("components/Navbar.js")).toMatch(/pathname !== "\/" && <TopBarBackButton \/>/);
    expect(read("components/BackButton.js")).toMatch(/if \(pathname === "\/"\) return null;/);
  });

  it("is the only code that steps back through history, apart from the app's hardware back key", () => {
    const allowed = ["components/BackButton.js", "components/CapacitorListeners.js"];
    const others = sourceFiles(["app", "components", "context", "lib"])
      .filter((file) => !allowed.includes(file))
      .filter((file) => /router\.back\(|history\.back\(|history\.go\(-/.test(read(file)));
    expect(others).toEqual([]);
  });

  it("gives every bar that pins to the top of a phone screen a Back of its own", () => {
    const bars = sourceFiles(["app", "components"]).filter((file) => read(file).includes("data-back-bar"));
    expect(bars.length).toBeGreaterThan(0);
    for (const file of bars) {
      expect(read(file), file).toMatch(/<InlineBackButton|onClick=\{goBack\}/);
    }
  });

  it("floats flat, with a 44px target, and keeps hover states to pointers that hover", () => {
    const css = read("components/backButton.module.css").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(css).toMatch(/\.floating \{[^}]*width: 44px;[^}]*height: 44px;/);
    expect(css).not.toMatch(/backdrop-filter|box-shadow/);
    expect(css.split("@media (hover: hover) and (pointer: fine)")[0]).not.toMatch(/:hover/);
  });
});
