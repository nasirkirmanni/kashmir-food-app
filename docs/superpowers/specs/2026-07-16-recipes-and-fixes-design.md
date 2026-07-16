# Recipes Expansion, Recipes-Page Rebuild & Mobile Bug Fixes — Design

**Date:** 2026-07-16 · **Status:** approved design, pending implementation plan
**Approach:** three sequenced sub-projects — A (bugs) first, B (content) in parallel, C (UX) last.

## Context

The recipe system (model, dish-page section, Recipe/FAQ schema, seeder) is live with 27 recipes
across 89 dishes. The `/recipes` page predates it: it filters to a hardcoded list of 10 dish
names, shows fabricated metadata, and mixes written-recipe navigation with a Waza AI drafting
modal unpredictably. Bakery (0/6), street food (0/5 non-bread), and beverages (2/4) have no
written recipes. Several mobile defects were reported in the kashmiri-food section and auth
pages.

## Sub-project A — Bug fixes (first release)

Diagnose-before-fix for each; every fix verified on Playwright mobile emulation before and
after deploy, then a drift comparison.

| # | Defect | Leading hypothesis | Fix direction |
|---|---|---|---|
| A1 | Kashmiri-food dish thumbnails don't load (mobile + desktop) | Stale image paths in the static `dishes.json` mirror (out of sync with the catalog); secondary: `/placeholder-dish.jpg` fallback 404s; tertiary: zero-height `fill` container | Reproduce with network capture; regenerate the static mirror as part of the fix regardless (it is verifiably stale) |
| A2 | Wazwan dish strip won't scroll horizontally on phones | `MobileSwipeContainer` owns horizontal gestures (`touch-action: pan-y` + swipe handler) and starves inner horizontal scrollers | Gesture guard: swipe handler ignores touches starting inside `[data-h-scroll]` elements; strip gets `touch-action: pan-x`. Future-proofs all mobile carousels |
| A3 | "Explore Recipe" on mobile still opens Waza AI | Dish-page button fixed & deployed 2026-07-16 (probable stale client cache); the remaining genuine instance is `/recipes`' hardcoded rows without recipes | Verify dish page live; the `/recipes` instance is eliminated by sub-project C |
| A5 | Duplicate dish docs: "Syoon" vs "Syun" | Variant spellings of the same dish (same pattern as the merged razma-goagji/rajma-t-gogji pair) | Verify both docs; if duplicates, merge with reference re-pointing + 301 redirect (reuse merge_duplicate_dishes.js pattern); if genuinely distinct, document and leave |
| A4 | Login/signup slow on mobile, UI renders broken | Double render: on mobile the login UI mounts both as the route and inside swipe-screen 5 (logged-out state), doubling hydration on the heaviest-JS pages; secondary: route-scoped CSS timing | Mobile performance trace first; fix accordingly (likely: don't mount the route copy inside the swipe screen context, or defer the inactive copy) with before/after traces as the acceptance evidence |

## Sub-project B — Recipe content (parallel with A)

**Scope: 14 dishes** — bakery 6 (Girda, Kulcha, Lavas, Bakerkhani, Czochworu, Sheermal),
street food 5 (Mutton Tujji, Masala Tsot, Aloo Monji, Basrakh, Suji Halwa), beverages 2
(Kashmiri Lassi, Babribyol), plus **Guchhi Yakhni ("Waza Mushrooms")** — Kashmir's wild morels
(kanaguchhi) in waza-style yogurt-fennel gravy. The catalog already contains a
"Wazwaan Mushroom" dish (no recipe): the guchhi recipe **attaches to that existing
document**, whose name is normalized to "Waza Mushroom (Guchhi)". Renaming regenerates the
slug via the pre-save hook, so the old `wazwaan-mushroom` slug gets a 301 redirect and the
static snapshots are regenerated. No new dish document; no interim-image question.

- Pipeline: the existing recipe SPEC and research-agent process (multi-source corroboration,
  modern measurements + traditional cues, sourcing notes, disagreement flags). Two agents:
  breads+street food; beverages+guchhi.
- Bread recipes carry a substantial **home-oven adaptation** (kandur tandoor work translated
  honestly).
- **Editorial gate:** REVIEW.md addendum with flags; nothing seeds until the owner approves.
  Prior archive decisions stand (Shufta et al. stay archived; Kabargah stays folded into
  Tabak Maaz).
- Post-seed: dish pages/schema/sitemap update automatically; regenerate `*-static-ids.json`
  and the `dishes.json` static mirror.
- End state: ~41/89 dishes with written recipes; all owner-named categories fully covered.

## Sub-project C — Recipes page rebuild + Explore-all (final release)

**`/recipes` (mobile + desktop):**
- List **all dishes** (drop the hardcoded 10-name filter). Search retained.
- **Filter chips** under search: All · Wazwan · Street Food · Bakery · Beverages · Home
  Kitchen. Mapping: `categoryType` for wazwan/bakery/beverage; `category === "Street Food"`
  for the street chip (breads appear under both Street Food and Bakery, intentionally);
  Home Kitchen = `categoryType === "kashmiri_cuisine"` minus street food.
- **Real metadata**: prep+cook minutes and servings from `recipe.*` when present; the
  hardcoded "45 mins / 4 Servings" placeholders are removed (no fabricated values).
- **Two legible row states**: with recipe → gold `RECIPE` tag, title + arrow navigate to
  `/dishes/<slug>#recipe` (never Waza AI); without → muted `ASK WAZA AI` tag, arrow opens the
  existing AI modal. Rows upgrade automatically as recipes are seeded.
- Aesthetic: existing design system (pill chips, mono uppercase micro-labels, gold active
  state, hairline borders). No new tokens, colors, or type styles.
- Note: the dish-list API already exposes a lightweight `recipe.difficulty` marker; C may
  additionally need `recipe.prepTimeMinutes/cookTimeMinutes/servings` in the list projection —
  extend the projection, not the payload with full recipes.

**Kashmiri-food wazwan strip:** final tile "Explore all N →" (same card dimensions, gold
hairline outline) linking to `/dishes`; renders on mobile and desktop.

## Verification (every release)

Playwright checks per feature (chips filter correctly; recipe rows hit `#recipe`; AI rows open
the modal; strip end-card navigates; thumbnails load; strip scrolls under touch emulation;
auth pages trace clean) → production build → deploy → Cloudflare purge → live re-check →
drift comparison against stored baselines.

## Out of scope

The ~40 remaining home-cuisine recipes (future round); archived recipes; H-11 design
decisions; any change to the Today's Table cover ledger.
