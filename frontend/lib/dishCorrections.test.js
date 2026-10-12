import { describe, expect, it } from "vitest";
import { correctText } from "./dishContent";
import DISH_TEXT_CORRECTIONS from "../data/dishTextCorrections.json";

describe("correctText", () => {
  it("replaces text in a string field and leaves other strings alone", () => {
    expect(correctText("served in the middle courses", "in the middle courses", "late")).toBe("served late");
    const untouched = "no match here";
    expect(correctText(untouched, "middle", "late")).toBe(untouched);
  });

  it("corrects matching items in a list and drops items left empty", () => {
    const tips = ["Prick the potatoes.", "One potato per guest is traditional.", "Use mustard oil."];
    expect(correctText(tips, "One potato per guest is traditional.", "")).toEqual(["Prick the potatoes.", "Use mustard oil."]);
    expect(correctText(tips, "mustard oil", "ghee")).toEqual(["Prick the potatoes.", "One potato per guest is traditional.", "Use ghee."]);
    expect(correctText(tips, "absent", "x")).toBe(tips);
  });

  it("ignores values that aren't text", () => {
    expect(correctText(undefined, "a", "b")).toBeUndefined();
    expect(correctText(4.8, "4", "5")).toBe(4.8);
  });
});

describe("dishTextCorrections.json", () => {
  it("only lists real changes to known fields", () => {
    const FIELD = /^(name|description|fullDescription|history|touristTip|category|spiceLevel|image|recipe\.[a-zA-Z]+)$/;
    for (const [slug, corrections] of Object.entries(DISH_TEXT_CORRECTIONS)) {
      for (const { field, from, to } of corrections) {
        expect(field, slug).toMatch(FIELD);
        expect(typeof from === "string" && from.length > 0, `${slug} ${field}`).toBe(true);
        expect(typeof to, `${slug} ${field}`).toBe("string");
        expect(from, `${slug} ${field}`).not.toBe(to);
      }
    }
  });
});
