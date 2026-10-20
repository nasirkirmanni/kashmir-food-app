import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { wazwanGuides } from "../data/wazwanGuides";
import { metadata as dishesMetadata } from "../app/dishes/layout";

const guide = (slug) => wazwanGuides.find((g) => g.slug === slug);
const number = (text) => Number(String(text).replace(/[^0-9]/g, ""));

describe("How many calories are in a Wazwan?", () => {
  const { content } = guide("wazwan-calories");
  // The numbered rows of the table: | n | dish | per trami | per guest |
  const rows = [...content.matchAll(/^\| (\d+) \| (.+?) \| ([\d,]+) \| ([\d,]+) \|$/gm)].map((m) => ({
    n: Number(m[1]),
    dish: m[2],
    trami: number(m[3]),
    guest: number(m[4]),
  }));

  it("lists the paper's eleven dishes, in its serving order", () => {
    expect(rows.map((row) => row.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(rows[0].dish).toMatch(/Methi maaz/);
    expect(rows[10].dish).toMatch(/Gushtaba/);
  });

  it("gives each dish a fourth of its trami, as the paper does", () => {
    for (const row of rows) expect(Math.abs(row.guest - row.trami / 4), row.dish).toBeLessThanOrEqual(0.75);
  });

  it("adds up to the paper's totals (18,484 a trami, 4,621 a guest; 21,933 and 5,483 with rice)", () => {
    // The paper's averages are rounded, so the rows can miss its total by a calorie or two.
    expect(Math.abs(rows.reduce((sum, row) => sum + row.trami, 0) - 18484)).toBeLessThanOrEqual(2);
    expect(Math.abs(rows.reduce((sum, row) => sum + row.guest, 0) - 4621)).toBeLessThanOrEqual(2);
    expect(content).toContain("| | **The eleven dishes** | **18,484** | **4,621** |");
    expect(content).toContain("| | **With the rice** | **21,933** | **5,483** |");
  });
});

describe("llms.txt", () => {
  const llms = readFileSync(new URL("../public/llms.txt", import.meta.url), "utf8");

  it("lists every Wazwan guide", () => {
    for (const g of wazwanGuides.filter((item) => item.category === "wazwan")) {
      expect(llms, g.slug).toContain(`https://wazwanway.com/kashmiri-food/wazwan/guide/${g.slug})`);
    }
  });
});

describe("/dishes title", () => {
  it("names Wazwan without opening on it", () => {
    // Google dropped a leading "Wazwan:" as a repeat of the site name "Wazwan Way" (October 2026).
    const title = dishesMetadata.title.default;
    expect(title).toMatch(/Wazwan/);
    expect(title).not.toMatch(/^Wazwan\s*[:|–-]/);
    expect(`${title} | Wazwan Way`.length).toBeLessThanOrEqual(75);
  });
});
