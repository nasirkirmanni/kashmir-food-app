import { describe, expect, it } from "vitest";
import { WAZWAN_FAQ, WAZWAN_IN_BRIEF } from "../data/wazwanPillar";
import { blogPosts } from "../data/blogPosts";

// Markdown emphasis off, so the FAQ's plain answer can be compared with the definition's text.
const plain = (text) => text.replace(/\*\*?([^*]+)\*\*?/g, "$1").trim();

describe("the /dishes questions", () => {
  it("opens with What is Wazwan?, answered in the definition's own words", () => {
    const [first] = WAZWAN_FAQ;
    expect(first.question).toBe("What is Wazwan?");
    // The definition without its last sentence (the name, which the next answer explains).
    const definition = plain(WAZWAN_IN_BRIEF.definition);
    const withoutName = definition.slice(0, definition.lastIndexOf(" The name joins"));
    expect(first.answer).toBe(withoutName);
    expect(WAZWAN_FAQ[1].question).toBe("What does “Wazwan” mean?");
  });

  it("asks each question once", () => {
    const questions = WAZWAN_FAQ.map((item) => item.question);
    expect(new Set(questions).size).toBe(questions.length);
  });

  it("sends visitors to the restaurant directory and the Srinagar guide", () => {
    const visitors = WAZWAN_FAQ.find((item) => item.question === "Can visitors eat Wazwan?");
    expect(visitors.answer).toContain("](/restaurants)");
    expect(visitors.answer).toContain("](/restaurants/best-wazwan-srinagar)");
  });
});

describe("the Kashmiri cuisine explainer", () => {
  it("links the restaurant directory where it says where Wazwan fits", () => {
    const post = blogPosts.find((p) => p.slug === "kashmiri-cuisine-explained");
    const section = post.content.slice(post.content.indexOf("## Where Wazwan fits"), post.content.indexOf("## Five common mistakes"));
    expect(section).toContain("[directory of Srinagar restaurants that serve Wazwan](/restaurants)");
  });
});
