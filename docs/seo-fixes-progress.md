# SEO audit fixes — progress & handoff

Started 2026-09-13 from `main` at `2482421`. Work lives on branch **`seo/audit-fixes-2026-09-13`**.
Source of truth for the issues: the SEO audit action plan (score 51/100, 2026-09-13).

**Status: IN PROGRESS (resumed after the usage limit reset) — not yet fully built/verified. Do NOT merge or push to `main` until the
"Remaining steps" below are done and the production build + rendered-HTML checks pass.**

The owner authorized: fix everything code-level, test it, and push. Not authorized: Cloudflare purges,
DB writes, sitemap submissions, external dashboards.

## Rules followed (keep following them)
- No fabricated content: no invented attractions, authors, credentials, dates, ratings, review counts,
  opening hours, geo data, social profiles or photos. Remove generated junk; don't replace it with new junk.
- Preserve visual design and functionality; verify every change in a real `next build` before calling it fixed.
- Commit to the branch; production deploy (push to `main`) only after verification.

## Completed (implemented; the hero/swipe fix was verified in a production build)
1. **Duplicate rendering (Critical A)** — `frontend/components/MobileSwipeContainer.js` rewritten. Server HTML and
   desktop render `children` once; on mobile tab routes the swipe deck is added after hydration, the route's own
   page fills its slot (found via `useSelectedLayoutSegments()` — swipes change the URL via `pushState` only),
   other screens are client-only copies mounted on demand (neighbours only after first interaction).
   `MobileNav.js` finds screens by `data-screen-index`; `globals.css` adds `.swipe-route-screen`.
   Verified (build of this change vs. baseline): every route 1 `<h1>` (was 4), JSON-LD no longer duplicated,
   homepage-hero markup gone from other routes, HTML −60–85%, no repeated body text.
2. **Homepage heading/media** — single sr-only H1 in `HomePageHero.js` (mobile "The Wazwan." → `<p>`, removed
   desktop sr-only H1 in `hero/ScrollVideoHero.js`); cover video only after home screen shown; 15 MB scrub video
   `preload="metadata"` until engagement; `hooks/useScrollScrubVideo.js` rAF loop IntersectionObserver-gated;
   layout/page pass trimmed dish/restaurant props; decorative home background layers desktop-only;
   new `components/home/HomeIntro.js` (plain-language intro, "What is Wazwan?", CTAs to /dishes, /restaurants, /itineraries).
3. **Broken images (Critical B)** — `public/images/Destinations` → `destinations` (git mv); capitalised refs updated;
   `lib/contentImages.js` + generated `lib/generated/content-image-manifest.json` resolve missing stored paths to
   verified photos (by eye: `/images/scroll/{GUSHTABA,ROGAN,RISTA,TABAKH,KABAB,AAB}.png`, `/images/tarsarmarsar.png`)
   or illustrated placeholders (`/images/dishes/dish-placeholder.webp`, new `/images/destinations/destination-placeholder.webp`);
   wired into `lib/imageUtils.resolveImageUrl`, `ImageWithSkeleton` (placeholder-aware fallback + honest alt),
   JSON-LD (no placeholder as `image`), OG images, KashmiriFoodClient, recipes. `data/dishes.json` and
   `data/destinations.json` store resolved paths. New `scripts/check-image-refs.mjs` (case-sensitive) runs in
   `prebuild`; `scripts/generate-content-image-manifest.mjs` runs in `predev`/`prebuild`; `npm run check:images`.
   Checker passes (299 refs). Vitest 51/51 (new `lib/seoContent.test.js`).
4. **Destination placeholders (Critical C)** — `lib/destinationContent.js` strips the seed generator's template
   description/fullDescription and invented attractions ("X Scenic Point", "Historic Local Market in X",
   "Traditional Food Street of X"). `DestinationDetailClient.js` shows real stored planning fields (travel advisory,
   activities, base town, hours, metrics) and an honest "no full guide yet" note; `destinations/[slug]/page.js`
   uses sanitized metadata and `noindex, follow` for records with no written content (7 of 25 today:
   achabal, daksum, kokernag, pari-mahal, shalimar-bagh, sinthan-top, verinag). Hub `destinations/page.js`
   sanitized + accurate copy. `data/destinations.json` regenerated from the live API (25 records).
5. **Redirects (Critical D)** — removed `/dishes/syoon`, `/dishes/tsoek-wangangan`, `/dishes/rajma-t-gogji`
   (targets 404; no live equivalent) from `next.config.js`; kept `wazwaan-mushroom` and `kabab` (live targets).
6. **Fabricated "Waza AI Authority Scores" removed** from dish, restaurant, destination detail and destination hub —
   they were computed from the character codes of each name in `backend/src/scripts/upsertSeed.js`.
7. **Restaurants hub fabrications removed** (`app/restaurants/page.js`): hashed review counts, hashed/default
   distances, "Open Now" without hours, default "Must try" dishes, default tags/rating/description; counter uses
   real data; `data/restaurants.json` regenerated (4 records).
8. **Dish boilerplate** — `lib/dishContent.js` drops the 13 templated dishes' generic description/fullDescription/
   history/touristTip (uses real `recipe.intro`); dish titles use accurate category labels; meta descriptions via
   `lib/metaText.js`; `DishDetailClient` hides empty sections, adds "Further reading" (`data/relatedReading.js`,
   links checked against article text).
9. **JSON-LD** — Article: no fake `/author/*` URLs, no build-date fallback, team bylines as Organization;
   Recipe: real `createdAt`/`reviewedAt`/`updatedAt` dates, photo-only image; TouristDestination: `includesAttraction`
   from real attractions only (no misused `touristType`, no count-less rating); Restaurant `priceRange` on the ₹ scale;
   Organization `sameAs` = the Facebook/X profiles linked in `components/Footer.js`.
10. **Sitemap (High F)** — `app/sitemap.js`: live API catalogue with hourly `revalidate`, logged fallback to
    `*-static-ids.json`, thin destinations and empty guide hubs excluded, added /etiquette, /how-to-experience, /plan,
    /trekking-camping, /restaurants/best-wazwan-srinagar, `lastModified` from real `updatedAt`/blog dates.
    `scripts/sync-static-ids.mjs` refreshes the ID files from the API (run; 47/4/25).
11. **Crawl/index** — `robots.js` no longer blocks /favorites and /profile (they get noindex metadata);
    `next.config.js` sends `X-Robots-Tag: noindex` on any host other than (www.)wazwanway.com (vercel.app, previews).
12. **Links** — footer adds Destinations, Itineraries, Explore, History, List Your Restaurant, Terms; itineraries hub
    has a static fallback list; `ItineraryArtifact` accepts a `title` override.
13. **Fonts** — removed unused Instrument Serif, `preload: false` for route-specific faces, removed the CSP-blocked
    Google Fonts `@import` from `globals.css`.
14. `CLAUDE.md` documents the new architecture, scripts and content-integrity rules.

## In progress when the session was interrupted (helper agents; verify their files — may be partial)
- **Media agent** — owns `frontend/scripts/optimize-route-images.mjs`, derived WebP files under
  `public/images/optimized/scenic-drives/` and `public/images/trekking-camping/`, `data/scenicDrivesData.js`,
  `app/scenic-drives/[slug]/RouteDetailClient.js`, `components/trekking-camping/{TrekCampHero,CloseSection,DestinationSection}.js`,
  `components/home/TheRoads.js`. Goal: optimized WebP derivatives (keep originals), srcset/lazy loading,
  `<source type="image/webp">` for trekking JPEGs, IO-gated rAF loop + metadata preload in TheRoads.
- **Backend agent** — owns `backend/src/scripts/upsertSeed.js`, `backend/updateSeedDataLocal.js`,
  `backend/src/data/seedData.js`, `backend/src/data/exploreSeedData.js` (image paths), list endpoints in
  `backend/src/routes/{dish,destination,restaurant}Routes.js` (add `updatedAt`), new
  `backend/src/scripts/cleanupSeoPlaceholders.js` (dry-run default, `--apply` with JSON backup), and the template
  attraction fallback in `frontend/app/custom-trip/page.js`. Must not touch any database.
- **Metadata agent** — owns metadata exports/layouts under `frontend/app/` (not app/layout.js, app/page.js,
  sitemap.js, robots.js, dishes/[slug]/page.js, destinations/[slug]/page.js, destinations/page.js,
  restaurants/page.js, explore/ExploreClient.js) and new `frontend/scripts/check-metadata.mjs`. Goals: one
  "Wazwan Way" per title (nested layouts must pass the `%s | Wazwan Way` template down), strip "| WazwanWay",
  noindex /favorites /profile /login /signup, self-canonical /itinerary-builder, og:image on /recipes /privacy /terms,
  fix /blog/gushtaba canonical, noindex empty guide hubs, set openGraph.url where canonical exists.

## Remaining steps (in order)
1. Confirm the three agents' work is complete and correct (read their files; finish anything partial).
2. Queued edits that touch the metadata agent's files (do after it finishes):
   - `app/itineraries/[slug]/page.js`: pass `title={data.meta.seoTitle.replace(/ —.*$/, "")}` to `ItineraryArtifact`
     (fixes the honeymoon/trekking duplicate H1 "6-Day Summer Kashmir Itinerary for a Couple").
   - `app/blog/[slug]/page.js`: add a "Dishes in this article" link block using `dishSlugsForArticle()` from `data/relatedReading.js`.
   - `app/explore/page.js`: server-rendered links to destinations with written content (from `data/destinations.json`
     + `hasWrittenDestinationContent`) — /explore currently has zero `<a href>` to destination pages.
3. From `frontend/`: `npx vitest run`, `node scripts/check-image-refs.mjs`, `npm run build` (must pass incl. prebuild).
4. `npx next start -p 3100`, then verify rendered HTML for: /, /dishes, /dishes/rogan-josh, /dishes/gushtaba,
   /dishes/cardamom-kahwa, /destinations, /destinations/gulmarg, /destinations/achabal (noindex), /restaurants,
   /recipes, /itineraries, /itineraries/kashmir-honeymoon-itinerary, /about, /login, /signup, /favorites,
   /sitemap.xml, /robots.txt — one H1, no duplicate JSON-LD, correct canonical/robots, no broken images;
   `node scripts/check-metadata.mjs http://localhost:3100 --sitemap`; `curl -sI -H "Host: kashmir-food-app.vercel.app" localhost:3100/` shows `X-Robots-Tag: noindex`.
5. Mobile check in a browser at 375px: tab swipe between /, /restaurants, /waza-ai, /kashmiri-food, /profile;
   bottom nav; a dish page and back; desktop hero scrub on `/`.
6. Commit on the branch, push the branch, check the Vercel preview, then merge to `main` and push (production).
7. After deploy: owner purges Cloudflare cache (sitemap.xml/robots.txt/HTML) — see manual actions.

## Manual actions for the owner (cannot be done from code)
- **Cloudflare**: Caching → Configuration → Purge Everything (or `/sitemap.xml`, `/robots.txt`); add a Cache Rule so
  sitemap.xml, robots.txt and HTML bypass the edge cache or "Use cache-control header if present".
- **Database**: after deploy, run `node src/scripts/cleanupSeoPlaceholders.js` (dry run) then with `--apply` from
  `backend/` with production `MONGODB_URI`, once the backend agent's script is reviewed.
- **Content**: real photos for 26 dishes and 7 destinations now on placeholders; written guides (named attractions,
  how to get there) for the 7 noindexed destinations; author bios/credentials for blog bylines.
- **Search Console / Bing**: resubmit `https://wazwanway.com/sitemap.xml` after the Cloudflare purge.
- **Authority**: tourism listings, partner restaurant links, Google Business Profiles, publications.

## Progress log
- **Backup** `15f7a7d` pushed to `origin/seo/audit-fixes-2026-09-13` before the usage limit hit.
- **Backend agent: finished** (included in `15f7a7d`). Seed generator no longer invents text/attractions/scores/tags;
  seed data cleaned; dish list endpoint selects `updatedAt`; new `backend/src/scripts/cleanupSeoPlaceholders.js`
  (dry run default, `--apply` writes a JSON backup first; tested against fake models). It found a 14th partly
  templated dish (seekh-kebab: real description, template fullDescription/history/touristTip).
  Its notes: `upsertSeed.js` is out of date with the 47-dish catalogue (re-running it would recreate removed dishes) —
  recommend retiring it; `restaurant-art.png` is referenced 12× in backend seed data but doesn't exist.
- **After resume:** Dish/Destination models no longer require the text fields the cleanup empties (default `""`);
  `.gitignore` ignores `backend/src/scripts/backups/`; `frontend/data/dishes.json` cleaned for all 14 templated dishes
  (description = real recipe intro from the API); `custom-trip/page.js` filters generated attractions
  (that route permanently redirects to /itinerary-builder, so this is defensive).
- **Metadata and media agents** were cut off by the limit almost immediately and were resumed from their transcripts.
- **Media agent: finished.** `scripts/optimize-route-images.mjs` made 29 WebP derivatives (originals kept);
  /scenic-drives/srinagar-to-doodhpathri images 15.3 MB → 0.56 MB (hero 8.2 MB → 225 KB); trekking pages −45–49%;
  TheRoads loop IO-gated and video preload metadata→auto near viewport. All earlier branch commits built on Vercel.
- **Metadata agent: finished.** Hub layouts pass `%s | Wazwan Way` down; every touched title has the brand once and
  ≤60 chars; utility pages (login, signup, forgot-password, favorites, profile) noindex; empty guide hubs noindex;
  og:url = canonical; og:image on recipes/privacy/terms; `/blog/gushtaba` canonical fixed; new `scripts/check-metadata.mjs`.
- **Queued edits: done.** /explore server-rendered destination links (`components/explore/DestinationIndex.js`);
  blog posts + /blog/gushtaba "Dishes in this article" (`components/RelatedDishLinks.js`); blog descriptions from each
  post's opening paragraph (`markdownSummary`); restaurant guide no longer repeats its H1 from markdown; canonical
  itineraries use their own name as H1; root twitter title/description removed so pages fill their own; fallback
  branches get twitter tags; noindex layouts for /admin, /travel-agent/dashboard, /travel-agent/inbox;
  /waza-ai has a server-rendered H1.
- **Now:** final local build + 44-route HTML verification + metadata check running; then mobile swipe test,
  merge to `main`, production verification.
