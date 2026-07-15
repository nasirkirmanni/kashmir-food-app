/**
 * Today's Table — the mobile home's rotating daily cover.
 *
 * A curated ledger of cover-worthy dishes with editorial one-liners.
 * The pick is seeded by UTC day-of-year so server and client render the
 * same cover within a day (no hydration mismatch, no randomness) and the
 * cover changes every midnight UTC. Entries whose slug is missing from
 * the live dish data are skipped, so the ledger can lead the catalog.
 */

const LEDGER = [
  { slug: "rista", story: "Hand-pounded for hours, never minced. The meatball that tests a waza's arm." },
  { slug: "gushtaba", story: "The final course and the dish of respect — refusing it refuses the host." },
  { slug: "rogan-josh", story: "Crimson from cockscomb flower, not chilli. Kashmir's most copied, never equalled." },
  { slug: "tabak-maaz", story: "Ribs simmered soft in milk, then fried until they crackle." },
  { slug: "kashmiri-harissa", story: "Stirred since four in the morning in downtown Srinagar. Winter's slow answer." },
  { slug: "noon-chai", story: "Pink, salted, poured from a samovar. Kashmir's everyday ritual." },
  { slug: "nadru-yakhni", story: "Lotus stem from Dal Lake, cooked in yogurt and fennel." },
  { slug: "czochworu", story: "The sesame breakfast ring of old Srinagar, torn while still hot." },
  { slug: "girda", story: "The tandoor bread every Kashmiri morning begins with." },
  { slug: "sheermal", story: "Saffron-washed and faintly sweet — bread fit for shrines and feasts." },
  { slug: "mutton-tujj", story: "Skewers over willow charcoal, eaten standing at the river's edge." },
  { slug: "waza-kokur", story: "Chicken the wazwan way — burnished whole in its own masala." },
  { slug: "mughal-yakhni", story: "Lamb in whipped yogurt, perfumed with fennel and dried mint." },
  { slug: "kulcha", story: "Crumbly, salted, stamped by hand — the biscuit under every noon chai." },
];

/**
 * The minimal dish payload the mobile cover needs (slug/name/image of the
 * ledger dishes only, ~2KB) — lets a server layout pass cover data to the
 * client swipe container without shipping the whole catalog in the bundle.
 */
export function pickCoverDishes(dishes = []) {
  const wanted = new Set(LEDGER.map((entry) => entry.slug));
  return dishes
    .filter((dish) => wanted.has(dish.slug))
    .map(({ slug, name, image }) => ({ slug, name, image }));
}

function utcDayOfYear() {
  const now = new Date();
  const startOfYear = Date.UTC(now.getUTCFullYear(), 0, 0);
  return Math.floor((now.getTime() - startOfYear) / 86400000);
}

/**
 * @param {Array} dishes — the catalog (e.g. server-embedded dishes.json)
 * @returns {{ dish: object, story: string, edition: number } | null}
 */
export function getTodaysTable(dishes = []) {
  const bySlug = new Map(dishes.map((d) => [d.slug, d]));
  const available = LEDGER.filter((entry) => bySlug.has(entry.slug));
  if (available.length === 0) return null;

  const edition = utcDayOfYear();
  const entry = available[edition % available.length];
  return { dish: bySlug.get(entry.slug), story: entry.story, edition };
}

/** Seasonal picks for the guest thread — keyed by UTC month (0-11). */
export function getSeasonalThread() {
  const month = new Date().getUTCMonth();
  if (month === 11 || month <= 1) {
    return [
      { title: "Gulmarg powder", sub: "Ski season", href: "/explore" },
      { title: "Harissa mornings", sub: "Winter breakfast", href: "/dishes/kashmiri-harissa" },
      { title: "Frozen Dal walks", sub: "Rare & fleeting", href: "/explore" },
    ];
  }
  if (month <= 4) {
    return [
      { title: "Tulip bloom", sub: "Asia's largest garden", href: "/explore" },
      { title: "Almond blossom", sub: "Badamwari in flower", href: "/explore" },
      { title: "Pahalgam rivers", sub: "Snowmelt season", href: "/explore" },
    ];
  }
  if (month <= 7) {
    return [
      { title: "Pahalgam meadows", sub: "High summer", href: "/explore" },
      { title: "Shikara at dawn", sub: "Dal Lake, 5 AM", href: "/explore" },
      { title: "Sonamarg glaciers", sub: "Day-trip country", href: "/explore" },
    ];
  }
  return [
    { title: "Saffron harvest", sub: "Pampore in purple", href: "/explore" },
    { title: "Chinar gold", sub: "Autumn's show", href: "/explore" },
    { title: "Apple orchards", sub: "Picking season", href: "/explore" },
  ];
}
