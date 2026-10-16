import { describe, expect, it } from "vitest";
import { isoDay, parseContentDate } from "./contentDate";
import { buildArticleSchema } from "../components/JsonLd";

describe("isoDay", () => {
  it("reads written dates as calendar days, whatever the machine's time zone", () => {
    expect(isoDay("October 15, 2026")).toBe("2026-10-15");
    expect(isoDay("15 October 2026")).toBe("2026-10-15");
    expect(isoDay("2026-10-15")).toBe("2026-10-15");
    expect(parseContentDate("October 15, 2026").getUTCHours()).toBe(0);
    expect(isoDay("soon")).toBeUndefined();
    expect(isoDay(undefined)).toBeUndefined();
  });
});

describe("buildArticleSchema", () => {
  const base = {
    title: "Rista: The Meatball Pounded on a Stone",
    description: "x",
    author: "Wazwan Way Team",
    datePublished: "October 15, 2026",
    dateModified: "October 17, 2026",
    path: "/blog/rista-pounded-meatballs",
    readTime: "22 min read",
  };

  it("dates the article by its own calendar days and gives the read time as a duration", () => {
    const schema = buildArticleSchema(base);
    expect(schema.datePublished).toBe("2026-10-15");
    expect(schema.dateModified).toBe("2026-10-17");
    expect(schema.timeRequired).toBe("PT22M");
    expect(schema.about).toBeUndefined();
    expect(schema.isPartOf).toBeUndefined();
  });

  it("carries the dish, the series and the length when given them", () => {
    const schema = buildArticleSchema({
      ...base,
      image: ["/images/dishes/daniwal-korma.jpg", "/wazwan-hero.jpg"],
      about: { "@type": "Thing", name: "Rista" },
      mentions: [{ "@type": "Thing", name: "Wazwan" }],
      isPartOf: { "@type": "CreativeWorkSeries", name: "The Core Seven" },
      position: 2,
      wordCount: 5045,
    });
    expect(schema.image).toEqual([
      "https://wazwanway.com/images/dishes/daniwal-korma.jpg",
      "https://wazwanway.com/wazwan-hero.jpg",
    ]);
    expect(schema).toMatchObject({
      about: { name: "Rista" },
      mentions: [{ name: "Wazwan" }],
      isPartOf: { name: "The Core Seven" },
      position: 2,
      wordCount: 5045,
    });
  });
});
