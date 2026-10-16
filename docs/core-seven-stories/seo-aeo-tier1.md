# Core seven: SEO and AEO, tier 1

_Built 17 October 2026 on branch `seo/core-seven-tier1` (off `df25a08`, release 13). Owner's instruction: "go ahead with tier 1". Not deployed until the owner approves the push._

## Why

An audit of the live site on 17 October 2026 found the seven stories indexable and well cited, but at the edge of the site:

- No links to them from `/`, `/kashmiri-food`, `/dishes` or any of the Wazwan guides; only `/blog` and the seven dish pages linked them.
- No breadcrumbs, no table of contents, no anchored sections, no short answer or fact table near the top.
- Thin structured data: no entity (`about`/`mentions`), no series, no word count; `timeRequired` was "22 min read" rather than a duration; `article:published_time` was "October 15, 2026" rather than an ISO date; local builds dated articles a day early (time zone).
- `/blog` shipped every post's full text to the browser (a 444 KB script; 282 kB first-load JS).

## What changed

**Story pages (`app/blog/[slug]/page.js`)**
- Visible breadcrumbs with BreadcrumbList schema: Home › Journal › The core seven › Dish (other posts: Home › Journal › Post).
- "The core seven · N of 7" badge beside the category; previous/next story navigation and "All seven stories" at the foot (`components/blog/SeriesNav.js`).
- A fact box after the opening paragraphs (`components/blog/StoryGlance.js`): a one-paragraph answer and a two-column HTML table. Its lines live in `data/coreSevenFacts.js`; every line restates something the story sources, and figures carry their source inline (SKIMS 2012 for calories, the GI Registry for status, Wikipedia for Scoville units, *Meat Science* 1994 for rista's fat).
- A folded "In this story" list of anchored sections on posts with six or more sections (`components/blog/StoryContents.js`); every `<h2>` now carries an id (`lib/storyStructure.js`).
- "Updated October 17, 2026" in the byline of the seven (they gained the fact box and corrections), matching `dateModified` and the sitemap.
- Article schema: `about` (the dish, with its Wikipedia and Wikidata identities where they exist; marchwangan korma has none, its title redirects to Wazwan), `mentions` (Wazwan; Kashmiri red chilli for rista, rogan josh and marchwangan korma), `isPartOf` (CreativeWorkSeries "The Core Seven"), `position`, `wordCount`, `timeRequired` as `PT22M`, and the owner's photo first in `image` for daniwal korma.
- Open Graph: ISO `published_time` and `modified_time`; the daniwal korma story shares the owner's photograph; the hero image's real size (1024 × 1024) is declared.

**Series page `/blog/core-seven`** (`app/blog/core-seven/page.js`): why these seven (Wikipedia citing *The Hindu*, the Roli cookbook, M. Saleem Beg), the seven stories in serving order with one-line summaries and read times, and how they were researched. CollectionPage + ItemList (matching the visible list) + BreadcrumbList.

**Links into the stories**
- `/kashmiri-food`: a sentence in the Wazwan chapter with one descriptive link per story, and a "Read the seven stories" button.
- `/dishes`: "Read the story" beside "View dish" on each of the seven (lifted above the stretched dish link; hit-tested on desktop and phone), including the gushtaba finale.
- Every Wazwan guide: the stories it names (`stories` in `data/wazwanGuides.js`) and the series page in its Related Articles (`lib/guideRelated.js`).
- `/blog`: a "The core seven" band above the grid.
- Sitemap and `llms.txt`: the series page.

**`/blog` performance**: the page is now a server component that sends only card fields to the client grid (`app/blog/BlogIndexClient.js`). The page script fell from 444 KB to 8 KB; first-load JS from 282 kB to 145 kB.

**Dates**: `lib/contentDate.js` reads written dates as UTC calendar days; the sitemap and the schema builders both use it.

## Corrections made to the live stories in the same release

1. **Aab gosht, "one piece per diner"**: no source supported it. The SKIMS 2012 study recorded "1 large piece" per trami of four. The body and FAQ now say so, with the citation.
2. **Rista, "heaviest of the mutton dishes"**: wrong, the kebabs (740 per diner) are mutton too. Now "the heaviest of the dishes served in a gravy", with the kebabs and the whole chicken named as heavier.
3. **Tabak maaz, "less only than the rista, the gushtaba, the kebabs and the whole chicken"**: the tomato paneer (369) also edged it (367). Rewritten against the table.
4. **GI status**: the registry was re-checked on 17 October 2026 (1336, 1337 and 1295 all still at pre-examination); the three stories that state it now give that date.

## Not done (needs the owner)

- Photographs. The five `/images/scroll/*.png` pot photographs (tabak maaz, rista, rogan josh, aab gosht, gushtaba) look like one staged series and their source is not recorded; the marchwangan photo came from mughaldarbar.in (commit `6ce1229`). Neither is used on the stories until the owner confirms rights. Note: the gushtaba pot photo shows a golden broth, not the white yakhni its alt text describes.
- Search Console indexing requests; an IndexNow ping (the key file is live); an About/methodology page with real names.

## Maintaining it

- Adding or renaming a story: `data/coreSevenSeries.js` (order must match `ESSENTIAL_ORDER`; titles must match `blogPosts.js`; tests check both) and `data/coreSevenFacts.js`.
- A fact-box line must restate something the story itself sources. Re-check GI status before changing `GI_CHECKED`.
- Tests: `lib/coreSeven.test.js`, `lib/storyStructure.test.js`, `lib/guideRelated.test.js`, `lib/contentDate.test.js`.
