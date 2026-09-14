# SEO audit fixes — handoff

**Status: DONE — live on production.** Branch `seo/audit-fixes-2026-09-13` (last commit `2423543`) was merged to `main`
as `50b7366` and deployed by Vercel on 2026-09-14 at 00:09 AEST (2026-09-13 14:09 UTC). Render redeployed the API from
the same commit: the live `/api/dishes` list returns `updatedAt`, which only this merge adds. Production was re-checked on
2026-09-14 between 00:10 and 00:45 AEST (see "Verification").

Work started 2026-09-13 from `main` at `2482421`. It follows the SEO audit action plan of 2026-09-13 (health score 51/100).

## Rules followed
- No fabricated content: no invented attractions, authors, credentials, dates, ratings, review counts, opening hours,
  geo data, social profiles or photos. Generated filler was removed, not replaced with new filler.
- Visual design and functionality preserved. Every change was checked in a real `next build`, then again on production.
- No Cloudflare purges, database writes, sitemap submissions or dashboard changes. Those are listed under "Manual actions".

## Verification (production, 2026-09-14)
- All 141 sitemap URLs return 200, and every Cloudflare edge copy of them comes from the new build.
- `node frontend/scripts/check-metadata.mjs https://wazwanway.com --sitemap` checked 141 pages: 0 errors and 2 warnings
  (short descriptions on `/terms` and `/destinations/srinagar`).
- Exactly one `<h1>` on `/`, `/dishes/rogan-josh`, `/destinations/gulmarg` and `/blog/secrets-of-gushtaba`.
- Redirects:
  - `/dishes/kabab` → 308 to `/dishes/seekh-kebab`.
  - `/dishes/wazwaan-mushroom` → 308 to `/dishes/wazwan-mushroom-guchhi-yakhni`.
  - `/dishes/syoon` → 404.
- `robots.txt` disallows only `/admin` and `/api/`. `/login`, `/profile`, `/favorites` and the 7 thin destinations send
  `noindex, follow`.
- `kashmir-food-app.vercel.app` sends `X-Robots-Tag: noindex`; `wazwanway.com` doesn't.
- Cloudflare, after the new cache rule (01:06 AEST): pages, the sitemap and `robots.txt` revalidate with Vercel on every
  request; images, video and scripts stay cached.
- Headless Chrome on production:
  - Desktop hero: only the video's metadata loads on arrival, the hero pins and scrubs 0 → 10.01 s, and there's one H1.
  - At 375 px: the swipe deck mounts after load, a swipe opens `/restaurants` and the tab bar opens `/kashmiri-food`.
  - Dish page: content is visible (opacity 1), and ItemList, Recipe, FAQPage and BreadcrumbList each appear once. No
    broken images.
- Local: `npx vitest run` passed 52/52, `scripts/check-image-refs.mjs` passed 333 references, and `npm run build` passes.

## 1. Completed

### A. Duplicate page rendering (Critical) — verified live
- **Issue:** On phones, the swipe container put every tab screen into each page's HTML. That meant four H1s per page,
  repeated JSON-LD and homepage hero markup on every route.
- **Changed:**
  - Pages now render once, on the server and on desktop.
  - On phones the swipe deck is added after load, and the current page fills its own slot.
  - Other screens mount only when visited; neighbouring screens mount after the first touch.
- **Files:** `frontend/components/MobileSwipeContainer.js`, `components/MobileNav.js`, `app/globals.css`.
- **Verified:**
  - Build vs. baseline: 1 H1 per route (was 4), no repeated JSON-LD, HTML 60–85% smaller.
  - Production: the H1 counts and the swipe/tab navigation listed above.

### Homepage hero, heading and video — verified live
- **Issue:** Several things slowed or hid the homepage:
  - It had several H1s.
  - The 15 MB scroll video downloaded on arrival.
  - Its animation loop kept running off-screen.
  - The server HTML started at opacity 0.
- **Changed:**
  - One H1.
  - The video loads metadata only, until the visitor scrolls, taps or presses a key.
  - The loop runs only while the hero is near the viewport.
  - Server HTML is visible before JavaScript runs.
  - New intro section ("About Wazwan Way", "What is Wazwan?") links to dishes, restaurants and itineraries.
- **Files:** `components/HomePageHero.js`, `components/hero/ScrollVideoHero.js`, `hooks/useScrollScrubVideo.js`,
  `app/template.js`, `app/page.js`, `app/layout.js`, `components/home/HomeIntro.js`.
- **Verified:** Headless Chrome on production at 1440×900 confirmed the metadata-only preload, the pin and scrub, and the
  single H1. On the dish page the H1 has opacity 1.

### B. Broken images (Critical) — verified live
- **Issue:** Some image paths pointed at files that don't exist: a capitalised `Destinations` folder on a case-sensitive
  host, and missing dish photos.
- **Changed:**
  - Folder renamed to `destinations`, with references updated.
  - A generated manifest resolves missing paths to a verified photo of the same subject (7 aliases, each checked by eye)
    or to a labelled placeholder.
  - A case-sensitive reference check runs before every build, so a broken path now fails the build.
- **Files:** `lib/contentImages.js`, `lib/generated/content-image-manifest.json`,
  `scripts/generate-content-image-manifest.mjs`, `scripts/check-image-refs.mjs`, `package.json`, `lib/imageUtils.js`,
  `components/ImageWithSkeleton.js`, `public/images/destinations/`, `data/dishes.json`, `data/destinations.json`. Also image
  references in the history, etiquette, things-to-do, recipes, blog and visit-kashmir pages.
- **Verified:**
  - 333 references pass the check, and 52/52 unit tests pass.
  - Production HTML checks and headless Chrome found no broken images.

### C. Placeholder destination content (Critical) — verified live
- **Issue:** Destination pages carried text from the seed generator ("A breathtaking destination in …"). They also had
  invented attractions ("<Name> Scenic Point", "Historic Local Market in <Name>") and "authority scores" derived from the
  name.
- **Changed:**
  - Template text and invented attractions are stripped.
  - Pages show only real stored details, plus a plain "no full guide yet" note.
  - Records with no written content are `noindex, follow` and left out of the sitemap.
  - Scores removed.
- **Files:** `lib/destinationContent.js`, `components/DestinationDetailClient.js`, `app/destinations/[slug]/page.js`,
  `app/destinations/page.js`, `data/destinations.json`.
- **Verified on production:**
  - The 7 thin destinations send `noindex, follow` and are absent from the sitemap.
  - The other 18 are indexable and listed.
  - No score text appears.

### D. Redirects to missing pages (Critical) — verified live
- **Issue:** `/dishes/syoon`, `/dishes/tsoek-wangangan` and `/dishes/rajma-t-gogji` redirected to dishes that no longer
  exist.
- **Changed:** Those three redirects were removed, so the URLs return 404. The two redirects with live targets were kept.
- **Files:** `frontend/next.config.js`.
- **Verified:** Production redirect results are listed above.

### Invented scores and restaurant details — verified live
- **Issue:** "Waza AI Authority Scores" were computed from the letters of each name. The restaurants hub also showed
  invented details:
  - hashed review counts and distances
  - "Open Now" with no hours behind it
  - default dishes, tags and ratings
- **Changed:** All removed. Distance appears only with real coordinates, and open status only with real hours.
- **Files:** `components/DishDetailClient.js`, `components/RestaurantDetailClient.js`, `components/DestinationDetailClient.js`,
  `app/restaurants/page.js`, `app/destinations/page.js`, `data/restaurants.json`.
- **Verified:** On production, the word "authority" doesn't appear on dish, destination or restaurant pages, or on either
  hub.

### Dish boilerplate — verified live
- **Issue:** 14 dishes had generated description, full description, history and tip text.
- **Changed:**
  - Template text dropped; the real recipe intro is used where one exists.
  - Empty sections hidden.
  - Titles use accurate category labels.
  - "Further reading" links only to articles that discuss the dish.
- **Files:** `lib/dishContent.js`, `lib/metaText.js`, `components/DishDetailClient.js`, `data/relatedReading.js`,
  `app/dishes/[slug]/page.js`, `data/dishes.json`.
- **Verified:** Unit tests cover the sanitizers. On production, "Further reading" is in the server HTML of
  `/dishes/rogan-josh`.

### E. Media weight — verified live
- **Changed:**
  - 29 WebP versions of route photos (originals kept).
  - Responsive `srcset` and lazy loading.
  - WebP sources for trekking photos.
  - The off-screen animation loop in `TheRoads` pauses.
- **Files:** `scripts/optimize-route-images.mjs`, `data/scenicDrivesData.js`, `app/scenic-drives/[slug]/RouteDetailClient.js`,
  `components/trekking-camping/`, `components/home/TheRoads.js`.
- **Verified:**
  - `/scenic-drives/srinagar-to-doodhpathri` images went from 15.3 MB to 0.56 MB (hero 8.2 MB → 225 KB).
  - Trekking pages are 45–49% lighter.
  - The WebP hero returns 200 on production.

### F. Sitemap — verified live
- **Issue:** The sitemap was a static list. It included 404 dish URLs and thin pages, missed real pages, and had no real
  last-modified dates.
- **Changed:**
  - Built from the live API and refreshed hourly. If the API fails, it falls back to the committed ID files and logs it.
  - Thin destinations and empty guide hubs are excluded.
  - Added `/etiquette`, `/how-to-experience`, `/plan`, `/trekking-camping` and `/restaurants/best-wazwan-srinagar`.
  - `lastmod` comes from real `updatedAt` and article dates.
- **Files:** `app/sitemap.js`, `scripts/sync-static-ids.mjs`, `*-static-ids.json`, `backend/src/routes/dishRoutes.js`.
- **Verified:** On production, all 141 URLs return 200. `lastmod` is present on all 47 dishes, 18 destinations, 4 restaurants
  and 13 articles.

### G. Internal links — verified live
- **Changed:**
  - Footer links to Destinations, Itineraries, Explore, History, List Your Restaurant and Terms.
  - A crawlable destination index on `/explore`.
  - "Dishes in this article" on blog posts.
  - "Further reading" on dish pages.
  - A fallback list on `/itineraries`.
- **Files:** `components/Footer.js`, `components/explore/DestinationIndex.js`, `app/explore/`, `components/RelatedDishLinks.js`,
  `app/blog/[slug]/page.js`, `app/blog/gushtaba/page.js`, `app/itineraries/page.js`.
- **Verified in production server HTML:**
  - All six footer links are on `/`.
  - `/explore` has 18 destination links.
  - `/blog/secrets-of-gushtaba` links to `/dishes/gushtaba`.

### H. Utility pages and the vercel.app host — verified live
- **Changed:**
  - `robots.txt` blocks only `/admin` and `/api/`, so Google can see the noindex on `/favorites` and `/profile`.
  - Noindex on login, signup, forgot-password, favorites, profile, admin and the travel-agent dashboard and inbox.
  - `X-Robots-Tag: noindex` on every host except (www.)wazwanway.com.
- **Files:** `app/robots.js`, `next.config.js`, and the layouts under `app/login`, `signup`, `forgot-password`, `favorites`,
  `profile`, `admin`, `travel-agent/dashboard` and `travel-agent/inbox`.
- **Verified:** Production results are listed above.

### I. Structured data and E-E-A-T signals — verified live
- **Changed:**
  - Articles no longer link to non-existent `/author` pages or fall back to the build date. Team bylines are marked up as
    the Organization.
  - Recipes use real created, reviewed and updated dates, and include an `image` only when a real photo exists.
  - Destinations list only real attractions.
  - Restaurant `priceRange` uses the ₹ scale.
  - Organization `sameAs` uses the Facebook and X profiles linked in the footer.
- **Files:** `components/JsonLd.js` and the pages that call it.
- **Verified:** The production dish page has ItemList, Recipe, FAQPage and BreadcrumbList, each once, all valid JSON.

### J. Titles, descriptions and headings — verified live
- **Changed:**
  - "Wazwan Way" appears once per title, and the stray "| WazwanWay" is gone.
  - Descriptions are cut at a sentence or word boundary.
  - `og:url` matches the canonical URL.
  - Missing `og:image` and Twitter tags added.
  - `/blog/gushtaba` canonical fixed.
  - Duplicate H1s from markdown removed on guides, the restaurant guide and itineraries.
  - Server-rendered H1 on `/waza-ai`.
- **Files:** layouts and metadata under `frontend/app/`, `app/kashmiri-food/[[...slug]]/page.js`,
  `app/itineraries/[slug]/page.js`, `components/itineraryBuilder/ItineraryArtifact.js`, `components/WazaAIPage.js`,
  `lib/metaText.js`, `scripts/check-metadata.mjs`.
- **Verified:** `check-metadata.mjs` against production: 141 pages, 0 errors, 2 warnings.

### Fonts — verified in build
- **Changed:**
  - Removed the unused Instrument Serif.
  - Route-specific faces are no longer preloaded on every page.
  - Removed a Google Fonts `@import` that the site's CSP blocked.
- **Files:** `app/layout.js`, `app/globals.css`.
- **Verified:** The production build passes. No separate performance measurement was taken.

### Backend and seed data — live; cleanup script not run
- **Changed:**
  - Seed scripts no longer invent text, attractions, scores or tags, and the seed data was cleaned.
  - Dish and destination models accept empty text fields.
  - The dish list endpoint returns `updatedAt`.
  - New `cleanupSeoPlaceholders.js`, which does a dry run by default and backs up before `--apply`.
- **Files:** `backend/src/scripts/upsertSeed.js`, `backend/updateSeedDataLocal.js`, `backend/src/data/seedData.js`,
  `backend/src/data/exploreSeedData.js`, `backend/src/models/Dish.js`, `backend/src/models/Destination.js`,
  `backend/src/scripts/cleanupSeoPlaceholders.js`, `.gitignore`.
- **Verified:** Render runs this code. The cleanup script was tested against mock models only; it hasn't been run on the
  real database.

## 2. Partially completed
1. **Photos.** 39 of 47 dishes and 7 of 25 destinations show a labelled placeholder (lists below).
   - Their Recipe markup has no `image`, and Google requires one for recipe rich results.
   - Search Console will therefore report those recipes as invalid ("Missing field 'image'") until real photos exist.
   - A generic photo would misrepresent the dish, so none was used.
2. **Thin destinations.** achabal, daksum, kokernag, pari-mahal, shalimar-bagh, sinthan-top and verinag are `noindex` and
   left out of the sitemap. No code change is needed to bring them back:
   - Once a record has a real description, attractions, activities or travel advisory, the page becomes indexable.
   - The sitemap picks it up within an hour.
3. **Database.** The generated text is still stored until the cleanup script runs.
   - The name-derived score fields stay stored even after it runs, because the script doesn't touch them.
   - The site no longer shows either.
   - Anything that reads them from the API may still repeat them, including Waza AI chat and the itinerary planner.
   - Deleting the scores or replacing them with real assessments is your decision.
4. **Restaurant details.** Clove and Shamyana have no phone number or opening hours. Restaurant records have no
   latitude/longitude field, only a Google Maps search string, so distances can't be shown.
5. **Authors.** Articles are bylined to the Wazwan Way team and marked up as the Organization. There are no named authors,
   bios or credentials.
6. **Social profiles.** Organization `sameAs` uses the footer's Facebook profile (id 61590712421415) and
   https://x.com/wazwanway. Please confirm both are yours and active.
7. **Overlapping pages.** Both need an editorial decision: merge and redirect, or rewrite so they differ.
   - `/blog/gushtaba` and `/blog/secrets-of-gushtaba` cover the same dish.
   - `/kashmiri-food/{wazwan,bakery,beverages,street-food}` repeat the hub's content.
8. **Pages without their own metadata.** `/collections/[slug]`, `/trails/[slug]` and `/tour-partner/[id]`. None are in the
   sitemap.
9. **`/signup` H1.** It's typed in by JavaScript. The page is noindex, so the impact is low.
10. **Two metadata warnings.** Short descriptions on `/terms` (46 characters) and `/destinations/srinagar` (69). They need
    real copy, not padding.
11. **Backend leftovers.**
    - `backend/src/scripts/upsertSeed.js` is out of date with the 47-dish catalogue. Re-running it would recreate removed
      dishes, so retire it.
    - `restaurant-art.png` is referenced 12 times in backend seed data but doesn't exist.
    - `backend/src/validations/dishValidations.js` still requires a `description` and `fullDescription` of at least 10
      characters whenever they're sent. An admin form that submits every field won't save a cleaned dish until it has a
      real full description.
12. **Real devices.** The desktop scroll-scrub hero and the mobile swipe deck were tested in headless Chrome on production,
    not on physical devices.

## 3. Manual actions for the owner

### Cloudflare — done on 2026-09-14
**What was wrong:** the zone's only Cache Rule, **Cache HTML pages**, caches almost every GET request (not `/api/`) with its
own Edge TTL and ignores Vercel's `Cache-Control: public, max-age=0, must-revalidate`. Cloudflare was serving homepage
copies up to 43 minutes old, so after a deploy visitors and Googlebot could get the previous version of a page, the sitemap
or `robots.txt`. The same rule keeps images, the hero video and scripts cached (Vercel also sends `max-age=0` for files in
`public/`), so it was left in place.

**What the owner added** (Caching → Cache Rules → Create rule, then Purge Everything):
- **Name:** Pages follow Vercel headers
- **Custom filter expression:**
  `(not (http.request.uri.path contains ".") and not starts_with(http.request.uri.path, "/api/")) or http.request.uri.path eq "/sitemap.xml" or http.request.uri.path eq "/robots.txt"`
  (the editor rejected `http.request.uri.path.extension eq ""` as an invalid value)
- **Cache eligibility:** Eligible for cache. **Edge TTL:** Use cache-control header if present, bypass cache if not.
  Browser TTL not set.
- **Place at:** Last. When several Cache Rules match, the last one wins.

**Verified at 01:06 AEST:**
- `/`, `/dishes/rogan-josh`, `/destinations/gulmarg`, `/login`, `/sitemap.xml` and `/robots.txt` return `MISS`, then
  `REVALIDATED` on repeat requests, never `HIT`.
- `/wazwan-hero.jpg`, `/redesign/hero.mp4`, `/images/scroll/ROGAN.png` and a `/_next/static` chunk return `MISS`, then `HIT`.
- One H1 on the home and dish pages; 141 sitemap URLs.

**Going forward:**
- Deploys no longer need a purge.
- Keep "Pages follow Vercel headers" below any new Cache Rule that could match pages.
- A page route containing a dot would still be edge-cached by the first rule; add it to the expression if one is created.
- To undo, disable the rule in Caching → Cache Rules.

### Google Search Console and Bing
**Google Search Console** (the wazwanway.com property):
1. **Submit the sitemap.** Indexing → Sitemaps → enter `sitemap.xml` → Submit. Success: status "Success" and about 141
   discovered pages.
2. **Test key URLs.** In URL Inspection, run "Test live URL" on each of these:
   - `https://wazwanway.com/`
   - `/dishes/rogan-josh`
   - `/destinations/gulmarg`
   - `/blog/secrets-of-gushtaba`
   - `/restaurants`

   Success: "URL is available to Google", the tested HTML shows the content with one `<h1>`, and the dish shows Recipe and
   Breadcrumb items. Then click "Request indexing" on each; there's a daily limit.
3. **Watch Indexing → Pages over the next 2–6 weeks.** These entries are expected:
   - *Excluded by 'noindex' tag:* login, signup, forgot-password, favorites and profile, the admin and travel-agent pages, the
     7 thin destinations, and empty guide hubs.
   - *Not found (404):* `/dishes/syoon`, `/dishes/tsoek-wangangan` and `/dishes/rajma-t-gogji`. That's correct; no action
     needed.
   - *Page with redirect:* `/dishes/kabab`, `/dishes/wazwaan-mushroom`, `/custom-trip` and `/kashmiri-food?tab=…`.
   - *Duplicate without user-selected canonical:* watch for the `/kashmiri-food/{category}` pages.
   - Any `kashmir-food-app.vercel.app` URLs should drop out.
4. **Check Enhancements → Recipes.** Expect "Missing field 'image'" for the 39 dishes without photos. Each clears once a
   real photo is added; then click "Validate fix".
   - Breadcrumbs should be valid.
   - FAQPage markup is valid, but Google shows FAQ rich results only for a small set of authoritative sites, so don't
     expect them.

**Bing Webmaster Tools:** go to Sitemaps → Submit sitemap and enter `https://wazwanway.com/sitemap.xml`, or import the site
from Search Console. Then run URL Inspection on the same five URLs.

### Database cleanup (production MongoDB)
Render already runs the backend from `50b7366`, so the models accept the emptied fields. Run the script from this
repository checkout; it reads `frontend/public` and `frontend/lib/contentImages.js`. The production `MONGODB_URI` must be
in the environment or in `backend/.env`.

```bash
cd ~/Desktop/kashmir-food-app/backend
npm install                                          # first time only
node src/scripts/cleanupSeoPlaceholders.js           # dry run: prints every change, writes nothing
node src/scripts/cleanupSeoPlaceholders.js --apply   # backs up affected documents to src/scripts/backups/, then applies
node src/scripts/cleanupSeoPlaceholders.js           # should now report nothing to change
```

**Success:**
- The dry run lists template text, invented attractions and missing image paths.
- `--apply` writes the backup first.
- The final dry run finds nothing.

Keep the git-ignored backup until you've checked the site and Waza AI; for example, ask it about Achabal.

### Content and images
**Photos.** Only use photos you own or have rights to.
- **Dishes (39):**
  - dani-phol (Daeni Phoul)
  - daniwal-korma (Dhaniwal Korma)
  - dum-oluv (Dum Aloo)
  - kashmiri-pulao
  - methi-maaz
  - muji-chetin
  - rice (Plain Steamed Rice)
  - ruwangan-chaman
  - shami-kabab
  - waza-kokur
  - waza-palak
  - wazwan-mushroom-guchhi-yakhni
  - yakhni
  - nadru-gaad
  - nadru-yakhni
  - bakerkhani
  - czochworu
  - girda
  - kashmiri-kulcha
  - lavas (Lavasa)
  - sheermal
  - aloo-monji
  - basrakh
  - kashmiri-harissa
  - masala-tsot
  - nadur-monji
  - tosha
  - mutton-tujji
  - badam-phirni
  - phirni
  - saffron-phirni
  - sheera
  - shufta
  - walnut-halwa
  - babribyol
  - cardamom-kahwa
  - kashmiri-kahwa
  - kashmiri-lassi
  - noon-chai
- **Destinations (7):** aharbal-waterfall, astanmarg, chatpal, harwan, manasbal-lake, shalimar-bagh, sinthan-top.
- **How to add a photo:**
  - Either put the file in `frontend/public/images/dishes/` or `destinations/` (exact letter case), point the record's
    `image` at it, and deploy.
  - Or use an https URL on an image host already allowed in `next.config.js`, such as `res.cloudinary.com`.
  - Either way, refresh `frontend/data/dishes.json` or `destinations.json` so listings built from those files match.
  - Don't rely on `/api/upload` for permanent photos. It writes to the Render server's own disk, which is wiped on
    redeploy unless a persistent disk is attached.

**Written guides** for achabal, daksum, kokernag, pari-mahal, shalimar-bagh, sinthan-top and verinag. Cover what the place
is, named attractions, how to get there, the best season and practical tips, written by people who have been.

**Authors.** If real people write or review the articles, add their names, short bios and relevant experience. The bylines
and author markup can then be added.

**Social profiles.** Confirm the Facebook profile (`profile.php?id=61590712421415`) and `x.com/wazwanway`. Send any other
official profiles to add to the footer and the schema.

**Restaurants.** Add a phone number and opening hours for Clove and Shamyana. If you want distances, add verified
latitude/longitude for all four restaurants; that needs a small schema change.

**Editorial.**
- Decide on the gushtaba article overlap and the `/kashmiri-food/{category}` pages.
- Write fuller descriptions for `/terms` and `/destinations/srinagar`.

### Authority and backlinks (off-site; code can't create these)
- Ask the restaurants on the site (Ahdoos, Mughal Darbar, Shamyana, Clove) to link to their Wazwan Way pages.
- Ask travel agents and tour partners on the travel-agent portal to link to the itineraries they recommend.
- Pitch the original articles to food and travel writers, Kashmir travel blogs and local publications, for example
  `/blog/dying-art-of-the-waza`, `/blog/rogan-josh-the-true-story` and `/blog/noon-chai-pink-tea-kashmir`.
- List Wazwan Way in tourism and food directories where it genuinely qualifies.
- A Google Business Profile only makes sense if Wazwan Way has a real address where it meets customers in person.
  Online-only businesses aren't eligible.
- Avoid paid links, link networks and bulk directory submissions.

### Production verification commands
All of these passed on 2026-09-14, 00:10–00:45 AEST.

```bash
# Every sitemap URL returns 200. Expected: no output (takes about a minute)
curl -s https://wazwanway.com/sitemap.xml | grep -o '<loc>[^<]*' | sed 's/<loc>//' | while read -r u; do printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' "$u")" "$u"; done | grep -v '^200 '

# Sitemap size. Expected: 141 today; it changes as content is added or noindexed
curl -s https://wazwanway.com/sitemap.xml | grep -o '<loc>' | wc -l

# Redirects. Expected: "HTTP/2 308" + "location: /dishes/seekh-kebab", then 404
curl -sI https://wazwanway.com/dishes/kabab | grep -iE '^(HTTP|location)'
curl -s -o /dev/null -w '%{http_code}\n' https://wazwanway.com/dishes/syoon

# One H1 per page. Expected: h1=1 for each
for p in / /dishes/rogan-josh /destinations/gulmarg /blog/secrets-of-gushtaba; do printf '%s h1=%s\n' "$p" "$(curl -s "https://wazwanway.com$p" | grep -o '<h1' | wc -l | tr -d ' ')"; done

# robots.txt. Expected: Disallow /admin and /api/ only, plus the Sitemap line
curl -s https://wazwanway.com/robots.txt

# Only wazwanway.com is indexable. Expected: "x-robots-tag: noindex", then 0
curl -sI https://kashmir-food-app.vercel.app/ | grep -i '^x-robots-tag'
curl -sI https://wazwanway.com/ | grep -ci '^x-robots-tag'

# Thin destination and utility pages. Expected: noindex, follow
curl -s https://wazwanway.com/destinations/achabal | grep -o '<meta name="robots"[^>]*>'
curl -s https://wazwanway.com/login | grep -o '<meta name="robots"[^>]*>'

# Titles, descriptions, canonicals, H1s and JSON-LD on every sitemap page. Expected: "0 error(s)" (run from the repo root)
node frontend/scripts/check-metadata.mjs https://wazwanway.com --sitemap

# Cloudflare edge cache for the sitemap. Expected: MISS or REVALIDATED, never HIT
curl -sI https://wazwanway.com/sitemap.xml | grep -iE '^(cf-cache-status|age)'
```

## 4. Recommended order
1. **Today, right after the deploy:**
   - Run the verification commands.
   - Submit the sitemap in Search Console and Bing.
   - Inspect the five key URLs and request indexing.

   Cloudflare is set up (2026-09-14), so deploys no longer need a purge.
2. **This week, manual configuration:**
   - Cloudflare cache rules: done on 2026-09-14.
   - Database cleanup: dry run, then apply, then re-run.
   - Check the site on a real phone and in a desktop browser.
3. **Weeks 1–4, content and images:**
   - Photos for the 39 dishes and 7 destinations. Start with the dishes that already get Search Console impressions.
   - Guides for the 7 noindexed destinations.
   - Phone and hours for Clove and Shamyana.
   - Confirm the social profiles.
   - Add real author bios.
   - Decide on the overlapping pages.
4. **Weeks 2–6, Search Console and indexing:**
   - Watch the Pages, Sitemaps and Recipes reports.
   - Re-inspect pages as they gain photos or guides.
5. **Ongoing:** authority building, as described above.
6. **About 6 weeks out:** re-run `/claude-seo:seo-audit wazwanway.com`, compare with the 51/100 baseline, and include
   Search Console data.

## History
- **2026-09-13:**
  - Fixes started from `2482421`.
  - Backup `15f7a7d` pushed before the usage limit; work resumed after the reset.
- **Before merge:**
  - Helper agents (backend, media, metadata) finished, and the queued edits were done.
  - The local build, the 44-route HTML check, the metadata check and headless mobile/desktop tests passed.
- **2026-09-14, 00:09 AEST:** merged to `main` as `50b7366`, deployed, and verified on production.
- **2026-09-14, 01:00 AEST:** the owner added the Cloudflare Cache Rule "Pages follow Vercel headers" and purged the cache;
  verified at 01:06.
