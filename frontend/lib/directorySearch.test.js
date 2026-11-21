import { describe, expect, it } from "vitest";
import { FORMATS, PLACE_TYPES, RESTAURANTS } from "../data/srinagarRestaurants";
import { DIRECTORY_SORTS, EMPTY_FILTERS, filterCards, filtersToSearch, fold, hasFilters, inPlace, searchToFilters, sortCards } from "./directorySearch";
import {
  STREETS,
  directoryCards,
  namedDishes,
  nearbyHeading,
  neighbourhoods,
  notFound,
  relatedRestaurants,
  sameStreet,
  streetLinkLabel,
  streetOf,
  streets,
} from "./srinagarRestaurants";

const cards = directoryCards();
const find = (patch) => filterCards(cards, { ...EMPTY_FILTERS, ...patch });
const slugs = (list) => list.map((card) => card.slug);
const ALLOWED = {
  formats: FORMATS.map((format) => format.id),
  types: PLACE_TYPES.map((type) => type.id),
  areas: neighbourhoods().map((area) => area.name),
};

describe("the directory's streets", () => {
  it("give every place exactly one chapter, and leave none empty", () => {
    const chapters = streets();
    expect(chapters.map((street) => street.id)).toEqual(STREETS.map((street) => street.id));
    const placed = chapters.flatMap((street) => street.places.map((place) => place.slug));
    expect(placed.length).toBe(RESTAURANTS.length);
    expect(new Set(placed).size).toBe(RESTAURANTS.length);
    for (const street of chapters) expect(street.places.length, street.id).toBeGreaterThan(0);
  });

  it("group by what the records say: the two roads, the old city, and the rest", () => {
    const by = Object.fromEntries(streets().map((street) => [street.id, street.places.map((place) => place.slug)]));
    expect(by["residency-road"]).toEqual(expect.arrayContaining(["ahdoos", "mughal-darbar-upstairs", "mughal-darbar-ground-floor", "kareema"]));
    expect(by["boulevard-road"]).toEqual(expect.arrayContaining(["shamyana", "stream-restaurant"]));
    expect(by["old-city"]).toEqual(expect.arrayContaining(["jj-foods", "lazeez-wazwan", "shahi-pakwaan", "turk-wazwan"]));
    // A place the records put in the old city says so in its own area, or sits in a neighbourhood the research places there.
    for (const place of RESTAURANTS) {
      if (/old city/i.test(place.area)) expect(streetOf(place).id, place.slug).toBe("old-city");
    }
    for (const place of RESTAURANTS) {
      if (streetOf(place).id === "elsewhere") {
        for (const name of place.neighbourhoods) expect(STREETS.some((street) => street.neighbourhoods?.includes(name)), `${place.slug} ${name}`).toBe(false);
      }
    }
  });

  it("open each chapter with counts taken from the records, and cite what they state", () => {
    for (const street of streets()) {
      expect(street.intro.length, street.id).toBeGreaterThan(40);
      expect(street.intro, street.id).not.toMatch(/\bundefined\b|NaN/);
    }
    const residency = streets().find((street) => street.id === "residency-road");
    expect(residency.intro).toMatch(/^Six places/);
    expect(residency.places.length).toBe(6);
    expect(residency.intro).toContain("[[kl25]]");
    const elsewhere = streets().find((street) => street.id === "elsewhere");
    expect(elsewhere.intro).toContain(`${elsewhere.places.filter((place) => place.type === "hotels").length === 4 ? "Four" : "__"} of them are hotel restaurants`);
  });

  it("name a place's neighbours on the same street, never the place itself", () => {
    const ahdoos = RESTAURANTS.find((place) => place.slug === "ahdoos");
    const near = sameStreet(ahdoos).map((other) => other.slug);
    expect(near).toContain("kareema");
    expect(near).not.toContain("ahdoos");
    expect(nearbyHeading(ahdoos)).toBe("Also on Residency Road");
    expect(streetLinkLabel(ahdoos)).toBe("Everything on Residency Road");
  });

  it("call only a shared neighbourhood near, once a place is outside the named streets", () => {
    for (const place of RESTAURANTS.filter((candidate) => streetOf(candidate).id === "elsewhere")) {
      const near = sameStreet(place);
      for (const other of near) {
        const record = RESTAURANTS.find((candidate) => candidate.slug === other.slug);
        expect(record.neighbourhoods.some((name) => place.neighbourhoods.includes(name)), `${place.slug} and ${other.slug}`).toBe(true);
      }
      expect(Boolean(nearbyHeading(place)), place.slug).toBe(near.length > 0);
    }
  });

  it("send a profile on to the same kind of place elsewhere, never to a neighbour it already lists", () => {
    for (const place of RESTAURANTS) {
      const near = new Set(sameStreet(place).map((other) => other.slug));
      const onward = relatedRestaurants(place);
      expect(onward.length, place.slug).toBeLessThanOrEqual(3);
      for (const other of onward) {
        expect(near.has(other.slug), `${place.slug} repeats ${other.slug}`).toBe(false);
        expect(other.slug).not.toBe(place.slug);
        expect(RESTAURANTS.find((candidate) => candidate.slug === other.slug).type).toBe(place.type);
      }
    }
  });

  it("say on for a road and in for a neighbourhood", () => {
    expect(inPlace("Residency Road")).toBe("on Residency Road");
    expect(inPlace("Gupkar Road")).toBe("on Gupkar Road");
    expect(inPlace("Jhelum riverfront")).toBe("on the Jhelum riverfront");
    expect(inPlace("Rajbagh")).toBe("in Rajbagh");
  });
});

describe("what a row leaves unsaid", () => {
  it("turns every empty answer in the records into one line, and prints none of them as a fact", () => {
    for (const place of RESTAURANTS) {
      const card = cards.find((candidate) => candidate.slug === place.slug);
      // A bare refusal ("Not listed", "No prices found") is an empty answer. One that goes on to say
      // something ("Not listed; reviews mention lamb") is a fact, and prints.
      const bare = (value) => /^(No|Not)\b[^;,]*$/.test(value);
      if (bare(place.dishesNamed)) expect(card.dishesNamed, place.slug).toBeNull();
      else expect(card.dishesNamed, place.slug).toBe(place.dishesNamed);
      if (bare(place.price)) expect(card.price, place.slug).toBeNull();
      else expect(card.price, place.slug).toBe(place.price);
      const gaps = [card.dishesNamed === null, card.price === null, !place.google].filter(Boolean).length;
      if (gaps === 0) expect(card.notFound, place.slug).toBeNull();
      else expect(card.notFound.split(", ").length, place.slug).toBe(gaps);
      expect(card.notFound).toBe(notFound(place));
    }
    const none = RESTAURANTS.find((place) => place.slug === "takht-e-sulaiman");
    if (none && !none.google) expect(notFound(none)).toMatch(/no Google listing used\.$/);
  });
});

describe("finding a place", () => {
  it("matches a name, a street, a neighbourhood, a dish and a way of serving", () => {
    expect(slugs(find({ query: "ahdoos" }))).toEqual(["ahdoos"]);
    expect(slugs(find({ query: "Ahdoo’s" }))).toEqual(["ahdoos"]);
    expect(find({ query: "boulevard" }).length).toBe(4);
    expect(find({ query: "old city" }).length).toBe(6);
    expect(slugs(find({ query: "wazpora" }))).toEqual(expect.arrayContaining(["jj-foods", "lazeez-wazwan"]));
    expect(find({ query: "trami" }).length).toBe(cards.filter((card) => card.formats.some((format) => format.id === "trami")).length);
    for (const dish of namedDishes(6)) {
      const found = slugs(find({ query: dish.words }));
      for (const place of RESTAURANTS.filter((p) => p.dishes.includes(dish.slug))) expect(found, `${dish.words} ${place.slug}`).toContain(place.slug);
    }
  });

  it("needs every word typed, ignores case and accents, and finds nothing for nonsense", () => {
    expect(slugs(find({ query: "  MUGHAL   upstairs " }))).toEqual(["mughal-darbar-upstairs"]);
    expect(find({ query: "hotel residency road" }).length).toBeGreaterThan(0);
    expect(find({ query: "zzzz" })).toEqual([]);
    expect(fold("Crème  Brûlée ")).toBe("creme brulee");
  });

  it("applies the filters together", () => {
    const trami = find({ formats: ["trami"] });
    const tramiAndPlate = find({ formats: ["trami", "plate"] });
    expect(tramiAndPlate.length).toBeLessThanOrEqual(trami.length);
    for (const card of tramiAndPlate) expect(card.formats.map((format) => format.id)).toEqual(expect.arrayContaining(["trami", "plate"]));
    const strongHotels = find({ type: "hotels", strong: true });
    for (const card of strongHotels) {
      expect(card.type).toBe("hotels");
      expect(card.strong).toBe(true);
    }
    expect(find({ area: "Residency Road", query: "mughal" }).length).toBe(2);
    expect(hasFilters(EMPTY_FILTERS)).toBe(false);
    expect(hasFilters({ ...EMPTY_FILTERS, query: "  " })).toBe(false);
    expect(hasFilters({ ...EMPTY_FILTERS, strong: true })).toBe(true);
  });

  it("sorts by name and by Google's figures, and leaves the research's order alone otherwise", () => {
    expect(sortCards(cards, "street")).toBe(cards);
    const byName = sortCards(cards, "name").map((card) => card.name);
    expect(byName).toEqual([...byName].sort((a, b) => a.localeCompare(b)));
    const byReviews = sortCards(cards, "reviews").map((card) => card.google?.reviews || 0);
    expect(byReviews).toEqual([...byReviews].sort((a, b) => b - a));
    const byRating = sortCards(cards, "rating").map((card) => card.google?.rating || 0);
    expect(byRating).toEqual([...byRating].sort((a, b) => b - a));
    expect(sortCards(cards, "rating").length).toBe(cards.length);
    expect(DIRECTORY_SORTS.map((option) => option.id)).toEqual(["street", "name", "reviews", "rating"]);
  });

  it("keeps the view in the address and reads it back, dropping what it does not know", () => {
    const filters = { query: "rista", formats: ["trami", "plate"], type: "wazwan", area: "Wazpora", strong: true };
    const search = filtersToSearch(filters, "name");
    expect(search).toBe("q=rista&format=trami%2Cplate&type=wazwan&area=Wazpora&strong=1&sort=name");
    expect(searchToFilters(`?${search}`, ALLOWED)).toEqual({ filters, sort: "name" });
    expect(filtersToSearch(EMPTY_FILTERS, "street")).toBe("");
    const odd = searchToFilters("?format=trami,bogus,trami&type=<script>&area=Nowhere&sort=price&strong=yes&q=" + "x".repeat(200), ALLOWED);
    expect(odd.filters.formats).toEqual(["trami"]);
    expect(odd.filters.type).toBe("all");
    expect(odd.filters.area).toBe("all");
    expect(odd.filters.strong).toBe(false);
    expect(odd.filters.query.length).toBe(80);
    expect(odd.sort).toBe("street");
    // An address from the page as it was before (?sort=type) still opens the default view.
    expect(searchToFilters("?sort=type", ALLOWED).sort).toBe("street");
  });
});
