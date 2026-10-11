import { describe, expect, it } from "vitest";
import { stripLeadingTitle } from "./markdownTitle";

describe("stripLeadingTitle", () => {
  it("drops an opening heading that repeats the page title", () => {
    const markdown = "\n# Best Kashmiri Food Guides\n\nFirst paragraph.";
    expect(stripLeadingTitle(markdown, "Best  kashmiri food guides")).toBe("\nFirst paragraph.");
  });

  it("keeps an opening heading that says something else", () => {
    const markdown = "# A different heading\n\nText.";
    expect(stripLeadingTitle(markdown, "Best Kashmiri Food Guides")).toBe(markdown);
  });

  it("leaves later headings alone", () => {
    const markdown = "Intro.\n\n# Best Kashmiri Food Guides\n";
    expect(stripLeadingTitle(markdown, "Best Kashmiri Food Guides")).toBe(markdown);
  });

  it("handles missing content", () => {
    expect(stripLeadingTitle(undefined, "Title")).toBe("");
  });
});
