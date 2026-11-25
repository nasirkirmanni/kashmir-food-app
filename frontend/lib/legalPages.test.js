import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import PrivacyPage from "../app/privacy/page";
import TermsPage from "../app/terms/page";

// The terms and the privacy policy each say when their wording last changed. That date is written
// into the page by hand when the wording changes. It is never worked out when the page is drawn:
// the terms once printed `new Date()`, which told every visitor the terms had changed that very
// day, and gave the server's copy (the day of the build, in UTC) and the browser's copy (the
// visitor's own day) different text, which React reports as a hydration error and answers by
// drawing the whole page again.

const PAGES = [
  ["terms", TermsPage],
  ["privacy policy", PrivacyPage],
];
const MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December";
const DATED = new RegExp(`Last updated: (?:${MONTHS}) \\d{1,2}, \\d{4}<`, "i");

const draw = (Page) => renderToStaticMarkup(createElement(Page));

describe("the dates on the legal pages", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(PAGES)("the %s reads the same whichever day it is drawn", (_name, Page) => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-22T13:00:00Z"));
    const first = draw(Page);
    vi.setSystemTime(new Date("2031-03-05T01:00:00Z"));
    expect(draw(Page)).toBe(first);
  });

  it.each(PAGES)("the %s gives its date written out in full", (_name, Page) => {
    expect(draw(Page)).toMatch(DATED);
  });
});
