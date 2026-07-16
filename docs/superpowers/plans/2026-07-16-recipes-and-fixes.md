# Recipes Expansion, /recipes Rebuild & Mobile Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix four reported mobile/UI defects, add 14 researched recipes (bakery/street food/beverages + guchhi on the existing Wazwaan Mushroom dish), and rebuild `/recipes` as an all-dishes library with category filter chips.

**Architecture:** Three sequenced releases. Phase A: diagnose-first bug fixes (each defect has a leading hypothesis with concrete fix code; if reproduction contradicts it, stop and report before coding). Phase B: the established recipe-research pipeline (agents → flags → **owner editorial gate** → seed). Phase C: `/recipes` page rebuild consuming Phase B data, plus the kashmiri-food Explore-all strip card.

**Tech Stack:** Next.js 14 (App Router, JS), Express + Mongoose 8, Playwright (python) for verification, vitest for pure-logic tests.

## Global Constraints

- Design system only: gold `#C8A46A`/CSS vars, mono uppercase micro-labels, hairline `var(--border)`; **no new colors, tokens, or type styles** (spec §C).
- Respect `prefers-reduced-motion` on any added motion/scroll behavior.
- Production deploy = push to `main` (Vercel + Render auto-deploy). **After every deploy the owner must Purge Everything in Cloudflare** — pause and ask.
- Local production builds require the backend running: `cd backend && RATE_LIMIT_PUBLIC_MAX=100000 npm start` (background), and `frontend/.env.local` points API at `http://localhost:5000`.
- Prior editorial decisions stand: archived recipes stay archived; Kabargah stays folded into Tabak Maaz; Today's Table cover LEDGER unchanged (spec: out of scope).
- Phase B recipes must NOT seed before the owner approves the review file (spec §B editorial gate).
- All Playwright verification scripts go in the session scratchpad, not the repo.
- Commit format: conventional commits ending with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

## Phase A — Bug fixes (release 1)

### Task A1: Kashmiri-food dish thumbnails

**Files:**
- Create: `backend/src/scripts/export_dishes_mirror.js`
- Modify: `frontend/data/dishes.json` (regenerated output)
- Possibly modify: `frontend/app/kashmiri-food/KashmiriFoodClient.js:106-120` (only if Step 2 confirms hypothesis 2 or 3)

**Interfaces:**
- Produces: `frontend/data/dishes.json` — array of dish objects `{_id, slug, name, image, description, category, categoryType, courseType, foodType, ...}` regenerated from the live DB. Consumed by `app/layout.js` (`pickCoverDishes`), `app/recipes/page.js`, `KashmiriFoodClient.js`. **Shape must remain an array of full dish objects.**

- [ ] **Step 1: Reproduce with network capture** — run against production:

```python
# scratchpad/diag_thumbnails.py
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_context(viewport={"width":390,"height":844}, is_mobile=True).new_page()
    failures = []
    pg.on("response", lambda r: failures.append((r.status, r.url)) if r.status >= 400 and ("image" in r.request.resource_type or "/images/" in r.url) else None)
    pg.goto("https://wazwanway.com/kashmiri-food", wait_until="networkidle", timeout=90000)
    pg.wait_for_timeout(4000)
    pg.evaluate("window.scrollTo(0, document.body.scrollHeight/2)")
    pg.wait_for_timeout(3000)
    broken = pg.evaluate("""() => [...document.querySelectorAll('img')].filter(i => i.complete && i.naturalWidth === 0).map(i => i.currentSrc || i.src)""")
    print("HTTP failures:", failures[:15])
    print("Broken <img> elements:", broken[:15])
    b.close()
```

Run: `python scratchpad/diag_thumbnails.py`
Expected: a non-empty list identifying WHICH images fail and WHY (404 paths vs zero-naturalWidth with 200s).

- [ ] **Step 2: Classify the cause.** If failing URLs are `/images/dishes/...` 404s whose slugs/names don't match the current catalog → hypothesis 1 (stale mirror): continue to Step 3. If `/placeholder-dish.jpg` 404s → also Step 3 (the regen fixes sources) plus replace the fallback constant with `/wazwan-hero.jpg` (a file that exists) at `KashmiriFoodClient.js:106`. If images return 200 but naturalWidth 0 → zero-height `fill` container: STOP, report findings, and propose the specific container fix before coding.

- [ ] **Step 3: Write the mirror export script**

```javascript
// backend/src/scripts/export_dishes_mirror.js
// Regenerates frontend/data/dishes.json from the live DB. The mirror feeds
// the homepage cover ledger, /recipes fallback data, and kashmiri-food strips
// — keep it a plain array of full dish objects.
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";

dotenv.config();

const run = async () => {
  await connectDB();
  const dishes = await Dish.find({}).lean();
  const out = path.join("..", "frontend", "data", "dishes.json");
  fs.writeFileSync(out, JSON.stringify(dishes, null, 1));
  console.log(`Wrote ${dishes.length} dishes to ${out}`);
  process.exit(0);
};
run().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 4: Run it and sanity-check the shape**

Run: `cd backend && node src/scripts/export_dishes_mirror.js`
Expected: `Wrote 89 dishes to ..\frontend\data\dishes.json`
Then: `cd ../frontend && node -e "const d=require('./data/dishes.json'); console.log(d.length, d[0].slug, d[0].image, typeof d[0].categoryType)"`
Expected: `89 <slug> /images/... string`

- [ ] **Step 5: Verify the homepage cover still works** (dishes.json feeds `pickCoverDishes`)

Run: `cd frontend && node -e "const {pickCoverDishes}=require('./lib/dailyTable.js'); const d=require('./data/dishes.json'); const c=pickCoverDishes(d); console.log('cover dishes:', c.length); if(c.length<8) process.exit(1)"`
Expected: `cover dishes: >= 8` (ledger slugs still resolve)

- [ ] **Step 6: Re-run Step 1's script against a local prod build** (`npm run build && npx next start -p 3100`, point script at `http://localhost:3100/kashmiri-food`)
Expected: `HTTP failures: []` and `Broken <img> elements: []`

- [ ] **Step 7: Commit**

```bash
git add backend/src/scripts/export_dishes_mirror.js frontend/data/dishes.json
git commit -m "fix(kashmiri-food): regenerate stale dishes.json mirror; add mirror export script"
```

### Task A2: Wazwan dish strip horizontal scroll on phones

**Files:**
- Modify: `frontend/components/MobileSwipeContainer.js` (touch handlers — locate `touchstart`/`onTouchStart` logic)
- Modify: `frontend/app/kashmiri-food/KashmiriFoodClient.js` (add `data-h-scroll` to the horizontal dish strip containers)
- Modify: `frontend/app/kashmiri-food/kashmiri.css` (strip gets `touch-action: pan-x`)

**Interfaces:**
- Produces: convention — any element with `data-h-scroll` (self or ancestor) is exempt from swipe-screen gesture capture. Task C4's Explore-all card lives inside such a strip and relies on this.

- [ ] **Step 1: Reproduce.** Playwright touch emulation on production `/kashmiri-food` (mobile context as in A1 Step 1): locate the wazwan strip element, perform `pg.mouse`-based horizontal drag / `pg.touchscreen` swipe over it, read `element.scrollLeft` before/after.

```python
# scratchpad/diag_strip.py — core assertion
strip = pg.locator("[class*=strip], .waza-row, [class*=scroll]").first  # adjust selector after inspecting DOM
before = strip.evaluate("el => el.scrollLeft")
box = strip.bounding_box()
pg.touchscreen.tap(box["x"]+300, box["y"]+40)  # then dispatch touchmove sequence left
# use pg.evaluate to dispatch TouchEvents with clientX 300->60 in 6 steps
after = strip.evaluate("el => el.scrollLeft")
print("scrollLeft moved:", before, "->", after)
```

Expected (bug confirmed): `scrollLeft` unchanged after horizontal touch drag.

- [ ] **Step 2: Find the gesture capture in `MobileSwipeContainer.js`.** Grep: `grep -n "touchstart\|onTouchStart\|touchmove\|preventDefault" components/MobileSwipeContainer.js`. Read the handler.

- [ ] **Step 3: Add the exemption guard at the top of the touch-start handler**

```javascript
// Inside the swipe container's touch-start handler, before any state is set:
const inHorizontalScroller = e.target.closest?.("[data-h-scroll]");
if (inHorizontalScroller) return; // inner carousels own their own gestures
```

(Exact insertion point depends on Step 2's reading — the guard must run before the handler records the touch as a potential screen-swipe. If the handler also listens to `touchmove`, apply the same guard there or gate via a ref set in touch-start.)

- [ ] **Step 4: Tag the strips and set touch-action.** In `KashmiriFoodClient.js`, add `data-h-scroll` to each horizontally scrolling dish-strip container element. In `kashmiri.css`:

```css
[data-h-scroll] {
  touch-action: pan-x;
  -webkit-overflow-scrolling: touch;
}
```

- [ ] **Step 5: Re-run Step 1's script against local build.** Expected: `scrollLeft` increases; ALSO verify screen-swiping still works when the gesture starts OUTSIDE the strip (swipe on the hero area still changes screens).

- [ ] **Step 6: Commit**

```bash
git add frontend/components/MobileSwipeContainer.js frontend/app/kashmiri-food/KashmiriFoodClient.js frontend/app/kashmiri-food/kashmiri.css
git commit -m "fix(mobile): let horizontal dish strips scroll — exempt data-h-scroll from swipe capture"
```

### Task A3: Verify Explore-Recipe behavior (no code expected)

**Files:** none (verification only; findings recorded in the release notes)

- [ ] **Step 1:** Playwright, live production, mobile context: `/dishes/rogan-josh` → click "Explore Recipe" → assert `#recipe` section scrolled into view AND no element containing "finding the best secret recipe" appears. (This was fixed 2026-07-16; confirm it held.)
- [ ] **Step 2:** Same check on a Phase-B-relevant dish WITHOUT a recipe (e.g. `/dishes/ghee-batta`): clicking Explore Recipe SHOULD open the Waza AI modal (current intended fallback until C ships).
- [ ] **Step 3:** If Step 1 fails: diagnose (cached bundle? different mobile code path?) — STOP and report before fixing.

### Task A4: Login/signup mobile performance + broken UI

**Files:**
- Likely modify: `frontend/components/MobileSwipeContainer.js` (screen-5 mount policy) — conditional on trace findings
- Possibly modify: `frontend/app/login/LoginClient.js`, `frontend/app/signup/*` (defer heavy imports)

- [ ] **Step 1: Trace.** Playwright mobile context with CDP 4× CPU throttle (pattern exists in `scratchpad/measure_cwv.py`): load production `/login`; capture (a) time-to-interactive proxy (`loadEventEnd`), (b) long tasks total, (c) whether TWO login form trees exist in the DOM: `pg.evaluate("document.querySelectorAll('form').length")` and `pg.evaluate("document.querySelectorAll('[class*=login], [id*=login]').length")`, (d) console errors, (e) screenshot for the "UI not loading properly" symptom.
- [ ] **Step 2: Confirm or kill the double-mount hypothesis.** The swipe container's screen 5 renders `user ? <ProfilePage/> : <LoginPage/>` while the `/login` ROUTE renders LoginClient in the overlay — if the DOM shows both, that's the confirmed cause.
- [ ] **Step 3 (if confirmed): mount screen 5 lazily.** In `MobileSwipeContainer.js`, screen 5 already uses `shouldMount(4)`; verify whether `/login` route visits force-mount it. Fix: when the current pathname is `/login` or `/signup`, skip rendering the swipe-screen login copy (the overlay copy is the real one):

```javascript
const authRoute = pathname === "/login" || pathname === "/signup";
// screen 5:
{shouldMount(4) && !authRoute ? (user ? <ProfilePage /> : <LoginPage />) : null}
```

- [ ] **Step 4 (broken-UI symptom):** compare the Step 1 screenshot against the desktop login; if route CSS is missing/late, check that `app/login/` route CSS is imported by the page (not only by the swipe-screen copy) and fix the import location.
- [ ] **Step 5: Re-trace after fix.** Acceptance: single login DOM tree; `loadEventEnd` improves measurably (record before/after numbers in the commit message); screenshot renders correctly.
- [ ] **Step 6: Commit** with before/after numbers.

```bash
git add -A frontend
git commit -m "fix(auth): single login tree on mobile — skip swipe-screen copy on auth routes (loadEvent X.Xs -> Y.Ys)"
```

### Task A5: Syoon vs Syun duplicate

**Files:**
- Create: none (extend `MERGES` in existing `backend/src/scripts/merge_duplicate_dishes.js`)
- Modify: `backend/src/scripts/merge_duplicate_dishes.js:20-24` (MERGES array), `frontend/next.config.js` (redirect)

- [ ] **Step 1: Inspect both docs**

Run: `curl -s "http://localhost:5000/api/dishes" | python -c "import json,sys; d=json.load(sys.stdin); [print(json.dumps({k:x[k] for k in ('name','slug','description','category','categoryType','image')},indent=1)) for x in d if x['slug'] in ('syoon','syun')]"`

- [ ] **Step 2: Decide.** Same dish (both garlic-chive/allium green preparation with near-identical descriptions) → merge, keeping the doc with the better description/image; different dishes → document in release notes and stop this task.
- [ ] **Step 3 (if merging): update MERGES** to contain ONLY the new pair (comment out the completed 2026-07 entries):

```javascript
const MERGES = [
  // 2026-07-16 batch already executed: tsoek-wangangan, rajma-t-gogji, kabab
  ["<loser-slug>", "<winner-slug>", ["description", "image"]],
];
```

- [ ] **Step 4: Run** `node src/scripts/merge_duplicate_dishes.js` → backup written, one merge logged. Then `node src/scripts/exportIds.js` and `node src/scripts/export_dishes_mirror.js` (Task A1's script).
- [ ] **Step 5: Add the 301** in `next.config.js` redirects, matching the existing merged-slug block: `{ source: '/dishes/<loser-slug>', permanent: true, destination: '/dishes/<winner-slug>' }`.
- [ ] **Step 6: Commit**

```bash
git add backend/src/scripts/merge_duplicate_dishes.js frontend/next.config.js frontend/dishes-static-ids.json frontend/data/dishes.json
git commit -m "fix(catalog): merge syoon/syun duplicate with 301 redirect"
```

### Task A6: Phase A release

- [ ] **Step 1:** `cd frontend && rm -rf .next/cache/fetch-cache && npm run build` (backend running per Global Constraints). Expected: BUILD_OK, zero fetch errors.
- [ ] **Step 2:** Local `next start -p 3100` → re-run diag scripts A1/A2 against localhost → all green.
- [ ] **Step 3:** `git push origin main`; wait for Vercel Ready (`npx vercel ls kashmir-food-app`).
- [ ] **Step 4:** **PAUSE — ask the owner to Purge Everything in Cloudflare.**
- [ ] **Step 5:** Re-run A1/A2/A3 diagnostics against production; run drift comparison (`drift_baseline.py` re-capture for `/kashmiri-food`, `/login`).
- [ ] **Step 6:** Report Phase A results to the owner before starting Phase C implementation (Phase B runs in parallel from Task B1).

---

## Phase B — Recipe content (runs in parallel with Phase A)

### Task B1: Launch research agents

**Files:** none in repo (agents write to session scratchpad)

**Interfaces:**
- Consumes: the recipe spec at `<scratchpad>/recipes/SPEC.md` (exists from the prior round; if the session scratchpad rotated, recreate it from `recipes-draft/recipes.json`'s field shape — every field of a recipe object, sourcing/flagging rules, strict-JSON output contract).
- Produces: `<scratchpad>/recipes/batch-breads-street.json` and `<scratchpad>/recipes/batch-bev-guchhi.json` — `{recipes:[...], notes}` per the SPEC shape.

- [ ] **Step 1:** Verify/recreate SPEC.md in the scratchpad (same 20-field recipe object, sourcing rules, flags contract as the live 27).
- [ ] **Step 2:** Dispatch agent 1 (general-purpose, background): breads + street food — Girda, Kashmiri Kulcha, Lavas, Bakerkhani, Czochworu, Sheermal, Mutton Tujji, Masala Tsot, Aloo Monji, Basrakh, Suji Halwa (11). Prompt must include: SPEC path; slugSuggestions matching catalog slugs exactly (`girda, kashmiri-kulcha, lavas, bakerkhani, czochworu, sheermal, mutton-tujji, masala-tsot, aloo-monji, basrakh, suji-halwa`); breads require a substantial home-oven adaptation section (kandur tandoor honestly translated); corroborate 2–3 sources each via WebSearch; output file path.
- [ ] **Step 3:** Dispatch agent 2: beverages + guchhi — Kashmiri Lassi (`kashmiri-lassi`), Babribyol (`babribyol`), Guchhi Yakhni (`wazwaan-mushroom` — will attach to the existing dish; entry's englishName "Waza Mushroom (Guchhi)"; kanaguchhi morels in waza-style yogurt-fennel gravy; note guchhi's price/foraging significance with sourced claims only).
- [ ] **Step 4:** On completion: validate both JSONs (parse, required fields non-empty, slugs match catalog, difficulty enum) with the validation script pattern from the prior round.

### Task B2: Compile review addendum — OWNER GATE

**Files:**
- Modify: `recipes-draft/recipes.json` (append 14 entries), `recipes-draft/REVIEW.md` (append addendum section)

- [ ] **Step 1:** Merge both batches into `recipes-draft/recipes.json` (dedupe check vs existing 27 slugs; zero collisions expected).
- [ ] **Step 2:** Regenerate REVIEW.md addendum (same generator as prior round: full recipes + ⚑ flags inline).
- [ ] **Step 3:** **STOP. Present the addendum to the owner:** counts, flag summary by type, dishes with merges/judgment calls. **Do not proceed to B3 until the owner approves (in full or with edits).**

### Task B3: Guchhi attachment + rename (after owner approval)

**Files:**
- Create: `backend/src/scripts/rename_wazwaan_mushroom.js`
- Modify: `frontend/next.config.js` (redirect for the old slug)

- [ ] **Step 1: Rename script**

```javascript
// backend/src/scripts/rename_wazwaan_mushroom.js
// Normalizes the dish name; pre-save hook regenerates the slug.
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";
dotenv.config();
const run = async () => {
  await connectDB();
  const dish = await Dish.findOne({ slug: "wazwaan-mushroom" });
  if (!dish) { console.log("already renamed or missing"); process.exit(0); }
  dish.name = "Waza Mushroom (Guchhi)";
  await dish.save(); // slug becomes waza-mushroom-guchhi
  console.log("renamed:", dish.slug);
  process.exit(0);
};
run().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2:** Run it. Expected: `renamed: waza-mushroom-guchhi`. Verify: `curl -s localhost:5000/api/dishes/waza-mushroom-guchhi | python -c "import json,sys; print(json.load(sys.stdin)['name'])"` → `Waza Mushroom (Guchhi)`.
- [ ] **Step 3:** Ensure the guchhi recipe entry's `slugSuggestion` is updated to `waza-mushroom-guchhi` in `recipes-draft/recipes.json`.
- [ ] **Step 4:** Add redirect `{ source: '/dishes/wazwaan-mushroom', permanent: true, destination: '/dishes/waza-mushroom-guchhi' }` to `next.config.js`.
- [ ] **Step 5: Commit** (`fix(catalog): normalize Waza Mushroom (Guchhi) name + redirect`).

### Task B4: Seed + release

- [ ] **Step 1:** `cd backend && node src/scripts/seed_recipes.js ../recipes-draft/recipes.json --dry-run` → expect `41/41` ok (27 reseeded idempotently + 14 new), 0 MISS, holds unchanged.
- [ ] **Step 2:** Real seed run. Spot-check: `curl -s localhost:5000/api/dishes/girda | python -c "import json,sys; d=json.load(sys.stdin); print(len(d['recipe']['instructions']))"` → > 0.
- [ ] **Step 3:** `node src/scripts/exportIds.js && node src/scripts/export_dishes_mirror.js`.
- [ ] **Step 4:** Frontend clean build; verify built `dishes/girda.html` contains "How to make" + Recipe JSON-LD with `recipeIngredient`.
- [ ] **Step 5:** Commit snapshots + push; **PAUSE for owner purge**; verify live (`/dishes/girda`, `/dishes/waza-mushroom-guchhi`); IndexNow re-submit sitemap URLs; drift re-baseline touched pages.

---

## Phase C — /recipes rebuild + Explore-all (release 3; starts after A ships and B2 gate passes)

### Task C1: Category chip mapping (pure logic + test)

**Files:**
- Create: `frontend/lib/recipeFilters.js`
- Test: `frontend/lib/recipeFilters.test.js`

**Interfaces:**
- Produces: `CHIPS` (array of `{key, label}`) and `dishMatchesChip(dish, chipKey) -> boolean`. Consumed by Task C2.

- [ ] **Step 1: Write the failing test**

```javascript
// frontend/lib/recipeFilters.test.js
import { describe, it, expect } from "vitest";
import { CHIPS, dishMatchesChip } from "./recipeFilters";

const mk = (categoryType, category) => ({ categoryType, category });

describe("dishMatchesChip", () => {
  it("all matches everything", () => {
    expect(dishMatchesChip(mk("bakery", "Street Food"), "all")).toBe(true);
  });
  it("wazwan chip = categoryType wazwan", () => {
    expect(dishMatchesChip(mk("wazwan", "Wazwan"), "wazwan")).toBe(true);
    expect(dishMatchesChip(mk("kashmiri_cuisine", "Wazwan"), "wazwan")).toBe(false);
  });
  it("street chip = category Street Food regardless of categoryType", () => {
    expect(dishMatchesChip(mk("bakery", "Street Food"), "street")).toBe(true);
    expect(dishMatchesChip(mk("kashmiri_cuisine", "Street Food"), "street")).toBe(true);
    expect(dishMatchesChip(mk("kashmiri_cuisine", "Budget Eats"), "street")).toBe(false);
  });
  it("bakery chip = categoryType bakery (breads appear under street AND bakery)", () => {
    expect(dishMatchesChip(mk("bakery", "Street Food"), "bakery")).toBe(true);
  });
  it("beverages chip = categoryType beverage", () => {
    expect(dishMatchesChip(mk("beverage", "Cafes"), "beverages")).toBe(true);
  });
  it("home chip = kashmiri_cuisine minus street food", () => {
    expect(dishMatchesChip(mk("kashmiri_cuisine", "Budget Eats"), "home")).toBe(true);
    expect(dishMatchesChip(mk("kashmiri_cuisine", "Street Food"), "home")).toBe(false);
  });
  it("CHIPS exposes six options in order", () => {
    expect(CHIPS.map((c) => c.key)).toEqual(["all", "wazwan", "street", "bakery", "beverages", "home"]);
  });
});
```

- [ ] **Step 2: Run to verify failure** — `cd frontend && npx vitest run lib/recipeFilters.test.js` → FAIL (module not found).
- [ ] **Step 3: Implement**

```javascript
// frontend/lib/recipeFilters.js
export const CHIPS = [
  { key: "all", label: "All" },
  { key: "wazwan", label: "Wazwan" },
  { key: "street", label: "Street Food" },
  { key: "bakery", label: "Bakery" },
  { key: "beverages", label: "Beverages" },
  { key: "home", label: "Home Kitchen" },
];

export function dishMatchesChip(dish, chipKey) {
  switch (chipKey) {
    case "all":
      return true;
    case "wazwan":
      return dish.categoryType === "wazwan";
    case "street":
      return dish.category === "Street Food";
    case "bakery":
      return dish.categoryType === "bakery";
    case "beverages":
      return dish.categoryType === "beverage";
    case "home":
      return dish.categoryType === "kashmiri_cuisine" && dish.category !== "Street Food";
    default:
      return true;
  }
}
```

- [ ] **Step 4: Run to verify pass** — same command → 7 passed.
- [ ] **Step 5: Commit** (`feat(recipes): category chip mapping with tests`).

### Task C2: Extend dish-list projection (backend)

**Files:**
- Modify: `backend/src/routes/dishRoutes.js:26` and `:67` (the two `.select(...)` calls)

**Interfaces:**
- Produces: list responses additionally carry `recipe.prepTimeMinutes`, `recipe.cookTimeMinutes`, `recipe.servings` (alongside existing `recipe.difficulty`). Consumed by Task C3's metadata row.

- [ ] **Step 1:** In both selects, replace `recipe.difficulty` with `recipe.difficulty recipe.prepTimeMinutes recipe.cookTimeMinutes recipe.servings`.
- [ ] **Step 2:** Restart local backend; verify: `curl -s "localhost:5000/api/dishes" | python -c "import json,sys; d=[x for x in json.load(sys.stdin) if x.get('recipe')][0]; print(sorted(d['recipe'].keys()))"` → includes the four fields (full `ingredients`/`instructions` still absent).
- [ ] **Step 3: Commit** (`feat(api): expose recipe time/servings markers in dish lists`).

### Task C3: Rebuild `/recipes`

**Files:**
- Modify: `frontend/app/recipes/page.js` (list source, chips row, row states, metadata; the Waza AI modal machinery stays)

**Interfaces:**
- Consumes: `CHIPS`/`dishMatchesChip` (C1); `dish.recipe.{difficulty,prepTimeMinutes,cookTimeMinutes,servings}` (C2); `handleExploreRecipe` (existing, unchanged).

- [ ] **Step 1: Delete the hardcoded filter.** Remove the `coreDishNames` array (lines ~52-63) and replace `filteredDishes`:

```javascript
const [activeChip, setActiveChip] = useState("all");

const filteredDishes = dishes.filter(
  (dish) =>
    dishMatchesChip(dish, activeChip) &&
    dish.name.toLowerCase().includes(searchQuery.toLowerCase())
);
```

with imports: `import { CHIPS, dishMatchesChip } from "@/lib/recipeFilters";`

- [ ] **Step 2: Chip row** — insert directly under the search input container:

```jsx
<div className="flex gap-2 overflow-x-auto px-4 pb-1 -mx-1 scrollbar-none" data-h-scroll>
  {CHIPS.map((c) => (
    <button
      key={c.key}
      onClick={() => setActiveChip(c.key)}
      className={`shrink-0 rounded-full border px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.15em] transition-colors ${
        activeChip === c.key
          ? "border-[var(--saffron)] bg-[var(--saffron)] text-black"
          : "border-white/15 text-white/60 hover:border-white/30 hover:text-white"
      }`}
    >
      {c.label}
    </button>
  ))}
</div>
```

- [ ] **Step 3: Real metadata row.** Replace the hardcoded `{dish.time || "45 mins"}` / `{dish.servings || "4 Servings"}` block: render the clock item only when `dish.recipe?.prepTimeMinutes || dish.recipe?.cookTimeMinutes` (text: `${(dish.recipe.prepTimeMinutes||0)+(dish.recipe.cookTimeMinutes||0)} mins`), servings item only when `dish.recipe?.servings` (text: `Serves ${dish.recipe.servings}`), spice item stays as-is (real field). Delete fabricated fallbacks.

- [ ] **Step 4: Row state tag.** Next to the category label line, add:

```jsx
{dish.recipe ? (
  <span className="ml-3 rounded-full border border-[var(--saffron)]/40 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Recipe</span>
) : (
  <span className="ml-3 rounded-full border border-white/10 px-2 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.15em] text-white/35">Ask Waza AI</span>
)}
```

- [ ] **Step 5: Arrow/title behavior** is already conditional on `dish.recipe` (shipped earlier); verify the conditions read `dish.recipe` (truthy) — no change expected.
- [ ] **Step 6: Empty state** — when `filteredDishes.length === 0` with a chip active, message: `No {chip label} recipes match your search.` (reuse the existing empty-state div).
- [ ] **Step 7: Build + Playwright check** (local): each chip filters (assert row counts differ and every visible row matches the chip predicate via DOM dataset), recipe rows navigate to `#recipe`, non-recipe rows open the modal, search composes with chips.
- [ ] **Step 8: Commit** (`feat(recipes): all-dishes library with category chips and honest row states`).

### Task C4: Explore-all strip card (kashmiri-food)

**Files:**
- Modify: `frontend/app/kashmiri-food/KashmiriFoodClient.js` (wazwan strip render)

- [ ] **Step 1:** Locate the wazwan dish-strip `.map(...)` in `KashmiriFoodClient.js`; append after the mapped cards, inside the same scroll container:

```jsx
<Link
  href="/dishes"
  className="shrink-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--gold)]/40 bg-white/[0.03] hover:border-[var(--gold)] transition-colors"
  style={{ width: "var(--dish-card-w, 160px)", minHeight: "var(--dish-card-h, 200px)" }}
>
  <span className="text-[var(--gold)] text-2xl">→</span>
  <span className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[var(--ivory)]/80 text-center px-3">
    Explore all {wazwanDishes.length}
  </span>
</Link>
```

(Match the actual card class/dimensions used by sibling cards after reading the strip markup — reuse the same width class the real cards use rather than the CSS-var fallback if one exists; kashmiri.css tokens: `--gold`, `--ivory`.)

- [ ] **Step 2:** Build + Playwright: scroll the strip to its end (A2 made this possible on touch), assert the card is visible and navigates to `/dishes`. Desktop viewport too.
- [ ] **Step 3: Commit** (`feat(kashmiri-food): Explore-all card at end of wazwan strip`).

### Task C5: Phase C release

- [ ] **Step 1:** `npx vitest run` (all frontend tests) + full clean build with backend running → green.
- [ ] **Step 2:** Push; wait Vercel Ready; **PAUSE for owner purge**.
- [ ] **Step 3:** Live Playwright suite: chips, both row behaviors, strip card, thumbnails (A1 regression), strip scroll (A2 regression).
- [ ] **Step 4:** Drift re-baseline `/recipes` + `/kashmiri-food`; IndexNow ping for `/recipes`.
- [ ] **Step 5:** Final report to owner: what shipped per phase, verification evidence, before/after login numbers (A4), any deviations from spec.
