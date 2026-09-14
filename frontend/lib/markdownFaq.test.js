import { describe, expect, it } from "vitest";
import { faqsFromMarkdown } from "./markdownFaq";

describe("faqsFromMarkdown", () => {
  it("reads each ### question and its answer from the FAQ section only", () => {
    const markdown = [
      "## Before the FAQ",
      "",
      "### Not a question",
      "Ignored.",
      "",
      "## Frequently asked questions",
      "",
      "### Is Kashmiri food spicy?",
      "",
      "Mostly it's *aromatic*. See [our guide](/blog/is-kashmiri-food-spicy).",
      "",
      "### What should I order?",
      "",
      "Try these:",
      "- haakh",
      "- **nadru yakhni**",
      "- dum olav",
      "",
      "Ask how hot the kitchen makes them.",
      "",
      "## After the FAQ",
      "",
      "### Also not a question",
      "Ignored too.",
    ].join("\n");

    expect(faqsFromMarkdown(markdown)).toEqual([
      { question: "Is Kashmiri food spicy?", answer: "Mostly it's aromatic. See our guide." },
      {
        question: "What should I order?",
        answer: "Try these: haakh, nadru yakhni, dum olav. Ask how hot the kitchen makes them.",
      },
    ]);
  });

  it("keeps list items that already end in punctuation as written", () => {
    const markdown = "## Frequently asked questions\n\n### How?\n\n- choose busy stalls;\n- eat fried food hot.";
    expect(faqsFromMarkdown(markdown)).toEqual([
      { question: "How?", answer: "choose busy stalls; eat fried food hot." },
    ]);
  });

  it("returns no questions when there is no FAQ section", () => {
    expect(faqsFromMarkdown("## Intro\n\nJust an article.")).toEqual([]);
    expect(faqsFromMarkdown(undefined)).toEqual([]);
  });
});
