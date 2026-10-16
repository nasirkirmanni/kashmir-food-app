import { describe, expect, it } from "vitest";
import { blogPosts } from "../data/blogPosts";
import { stripLeadingTitle } from "./markdownTitle";
import {
  countWords,
  headingId,
  nodeText,
  plainHeadingText,
  readMinutes,
  sectionHeadings,
  splitIntro,
} from "./storyStructure";

describe("headingId", () => {
  it("makes a plain, stable anchor from a heading", () => {
    expect(headingId("What gushtaba is")).toBe("what-gushtaba-is");
    expect(headingId("Shir and āb: two Persian words, two Kashmiri liquids")).toBe(
      "shir-and-ab-two-persian-words-two-kashmiri-liquids"
    );
    expect(headingId("What the sources agree on, and don't")).toBe("what-the-sources-agree-on-and-dont");
    expect(headingId("The name: ghee, heat, or red?")).toBe("the-name-ghee-heat-or-red");
  });
});

describe("sectionHeadings", () => {
  it("lists the ## sections in order, outside code fences, as the reader sees them", () => {
    const markdown = [
      "Opening paragraph.",
      "",
      "## The *name*, and [the titles](/x)",
      "### Not a section",
      "```",
      "## Not a heading either",
      "```",
      "## Frequently asked questions",
    ].join("\n");
    expect(sectionHeadings(markdown)).toEqual([
      { text: "The name, and the titles", id: "the-name-and-the-titles" },
      { text: "Frequently asked questions", id: "frequently-asked-questions" },
    ]);
  });

  it("gives every blog post distinct section anchors", () => {
    for (const post of blogPosts) {
      const ids = sectionHeadings(post.content).map((h) => h.id);
      expect(new Set(ids).size, post.slug).toBe(ids.length);
      expect(ids.includes("at-a-glance"), post.slug).toBe(false);
    }
  });
});

describe("nodeText", () => {
  it("reads a rendered heading's text through nested inline markup", () => {
    const node = {
      type: "element",
      tagName: "h2",
      children: [
        { type: "text", value: "The " },
        { type: "element", tagName: "em", children: [{ type: "text", value: "name" }] },
        { type: "text", value: ", and the titles" },
      ],
    };
    expect(headingId(nodeText(node))).toBe(headingId(plainHeadingText("The *name*, and the titles")));
  });
});

describe("splitIntro", () => {
  it("splits at the first section", () => {
    const { intro, rest } = splitIntro("Lede.\n\nMore lede.\n\n## First\n\nBody.\n\n## Second");
    expect(intro).toBe("Lede.\n\nMore lede.\n\n");
    expect(rest).toBe("## First\n\nBody.\n\n## Second");
  });

  it("leaves a post that opens with a section without an intro", () => {
    expect(splitIntro("## First\n\nBody.")).toEqual({ intro: "", rest: "## First\n\nBody." });
    expect(splitIntro("No sections at all.")).toEqual({ intro: "No sections at all.", rest: "" });
  });
});

describe("countWords", () => {
  it("doesn't count link targets as words", () => {
    expect(countWords("A [source](https://example.com/a-long-path) says āb.")).toBe(4);
  });

  it("agrees with the read time on each core-seven story", () => {
    const stories = blogPosts.filter((post) => post.category === "Heritage Cookery" && post.updatedDate === "October 17, 2026");
    expect(stories).toHaveLength(7);
    for (const post of stories) {
      const minutes = readMinutes(countWords(stripLeadingTitle(post.content, post.title)));
      expect(post.readTime, post.slug).toBe(`${minutes} min read`);
      expect(minutes, post.slug).toBeGreaterThanOrEqual(20);
    }
  });
});
