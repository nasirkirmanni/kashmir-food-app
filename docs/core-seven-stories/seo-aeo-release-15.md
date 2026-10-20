# SEO and AEO, release 15

_Built 17 to 20 October 2026 on branch `seo/aeo-release-15` (off `60e0fa1`, release 14), after the owner said "go ahead with the indexnow ping. Do whatever you can in your capacity boost aeo seo" and then "Continue with seo and aeo boosting". Deployed 20 October 2026 (merge `4ef7a08`) after the owner said "push it to production"._

## Done before this release

- **IndexNow, 17 October 2026:** the 21 URLs changed by release 14 (the series page, the seven stories, /blog, /dishes, /kashmiri-food, the nine Wazwan guides and the sitemap) were submitted to `api.indexnow.org` with the site's key (`ff1f8dcf….txt`, live). Response: HTTP 200. IndexNow shares submissions with Bing, Yandex, Seznam and Naver; Google does not use it.

## What this release adds

**For answer engines and feed readers**
- `/llms-full.txt`: the full text of every Journal post (the core seven first) and every Wazwan guide as markdown, each with its URL, dates, read time and the sources it cites. Listed in `llms.txt`.
- `/blog/feed.xml`: an RSS 2.0 feed of the Journal, newest first, dates from the posts (never the build). Every page announces it with a `<link rel="alternate">` in the root layout's head (a page's own `alternates` metadata would otherwise replace a layout's).
- Article schema on every post with a "Sources" section now carries `citation`: one CreativeWork per source the page lists (30 to 51 per story), matching the visible list exactly. URLs with parentheses (a DOI, `Riste_(dish)`) are kept whole.
- The seven dish pages' Recipe schema gains `about`: the dish as an entity, with its Wikipedia and Wikidata identities where they exist and `subjectOf` its story.

**On the pages**
- `/blog/core-seven`: a visible FAQ (four questions: which seven, whether they were the original seven, the serving order, how the stories were researched) with matching FAQPage schema, and a visible "Published 17 October 2026 · Updated 20 October 2026" line matching `dateModified`.
- `/kashmiri-food/wazwan/guide` (the guides index): a "The core seven" block linking all seven stories and the series page.
- `/about`: a "How we research" section (citations inline, disagreements stated, unread sources never cited, corrections dated), linking the series page and the reading list.
- Desktop homepage, Act V credits: "Seven dishes, seven stories" in the Continue list. The documentary is desktop-only (`hidden md:block`); the phone homepage is unchanged.
- Wazwan guide pages: a visible breadcrumb (Home › Traditional Wazwan › Wazwan guides › short title) replaces "Back to Guide Index", and its BreadcrumbList schema now matches what readers see (before, the schema named a trail the page didn't show).
- Seven older posts link to the stories at a natural point, one sentence each: what to eat in Kashmir, Kashmiri cuisine explained, is Kashmiri food spicy, Kashmiri Pandit food, Kashmiri red chilli, fennel and dry ginger, and the sources page. Each shows "Updated October 20, 2026" (the day the edits were to go live; move it if the deploy is later).

**Corrections**
- The gushtaba pot photograph shows meatballs in a golden broth, not the white yogurt gravy its alt text described, on /dishes and in the desktop documentary. Both alt texts now describe what the photograph shows.

## Checks

151 tests (24 + 12 new across releases 14 and 15) and the production build pass. `scratchpad/tier1/verify15.py` and the release 14 checks pass against the local production build: citations equal the visible sources on all seven stories; dish-page entities; FAQ schema matches the visible questions; the feed parses as XML with 26 items; `llms-full.txt` holds every post and guide; one feed link on the home page, a story, a guide, /blog and a dish page; guide breadcrumbs visible equal schema; dates on the seven edited posts and the series page; no horizontal overflow at 375 and 1440 px; the series link is present but not visible on the phone homepage.

## After the deploy

- **Production, 20 October 2026:** `verify15.py` and the release 14 checks passed against wazwanway.com; Vercel reported the deployment complete.
- **IndexNow, 20 October 2026:** the 36 pages this release changed (the home page, the series page, /about, the guides index and the nine guides, the seven stories, the seven older posts, the seven dish pages, /dishes and /blog) were submitted with the site's key. Response: HTTP 200. `/blog/feed.xml` and `/llms-full.txt` were left out: neither is a page, and `llms-full.txt` repeats every article's text.
- **Release 16:** `/llms-full.txt` now sends `X-Robots-Tag: noindex` (`next.config.js`), so search engines are pointed at the articles rather than a copy of their text. `noindex` doesn't stop anyone fetching the file, and robots.txt still allows it, since a Disallow would hide the header from search engines and shut out tools that obey robots.txt. A test keeps it the only wazwanway.com path that asks not to be indexed. The feed stays indexable: it carries only titles and summaries.

## Still for the owner

- Search Console: request indexing for `/blog/core-seven` and the seven stories (the sitemap is already submitted there).
- Photographs for the stories (rights for the `/images/scroll` series are unconfirmed).
- Re-measure against the October Search Console and Profound baselines in four to six weeks.
