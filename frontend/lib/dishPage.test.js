import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CORE_SEVEN_SERIES } from "../data/coreSevenSeries";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("dish page on phones", () => {
  // Comments explain what the page avoids, so match against the rules only.
  const css = read("../components/dish/dishPage.module.css").replace(/\/\*[\s\S]*?\*\//g, "");

  it("stays flat: no backdrop blur, which stuttered on phones when stacked down a long page", () => {
    expect(css).not.toMatch(/backdrop-filter/);
    expect(css).not.toMatch(/box-shadow/);
  });

  it("only uses hover states where a pointer can hover", () => {
    const outside = css.split("@media (hover: hover) and (pointer: fine)")[0];
    expect(outside).not.toMatch(/:hover/);
  });

  it("gives tap targets at least 44px and keeps the page clear of the floating tab bar", () => {
    expect(css).toMatch(/\.iconButton \{[^}]*width: 44px;[^}]*height: 44px;/);
    expect(css).toMatch(/\.ingredient \{[^}]*min-height: 48px;/);
    expect(css).toMatch(/padding-bottom: calc\(120px \+ env\(safe-area-inset-bottom\)\)/);
  });
});

describe("/dishes on phones", () => {
  const css = read("../components/wazwan/wazwan.module.css");

  it("zooms dish photos on hover only where a pointer can hover", () => {
    const hoverZoom = css.indexOf(".hoverable:hover .photoImg");
    const gate = css.lastIndexOf("@media (hover: hover) and (pointer: fine)", hoverZoom);
    expect(hoverZoom).toBeGreaterThan(-1);
    expect(gate).toBeGreaterThan(-1);
    expect(hoverZoom - gate).toBeLessThan(200);
  });
});

describe("core seven places in the meal", () => {
  it("read as phrases, since they label the dish pages and the series page", () => {
    for (const story of CORE_SEVEN_SERIES) {
      expect(story.place.split(/\s+/).length, story.dish).toBeGreaterThan(1);
    }
  });
});
