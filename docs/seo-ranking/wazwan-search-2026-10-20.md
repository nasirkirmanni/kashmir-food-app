# Ranking for "wazwan": the search landscape on 20 October 2026, and release 17

_Owner's brief, 20 October 2026: "Continue with seo and aeo boosting. Research the wazwan space see how we can rank 1." Nothing here guarantees a position. Search volumes and difficulty scores are not available to us and none are given._

## How this was checked, and its limits

- **Google results** were read through Startpage, which shows Google's web results without the CAPTCHA Google serves to our browser: once with no region (from Australia) and once with Startpage's India (EN) region filter. The region filter only approximates google.co.in, and Startpage shows web results only: no AI Overview, images, videos panel or recipe cards. Search Console counts positions inside those, so its averages can be better than what's below.
- **Bing** (India) was read once for "wazwan", and then showed a "solve the challenge" page, which we left alone.
- **A US web search tool** (not Google) was used for a first pass and an index check.
- **Ten ranking pages** were fetched and compared with /dishes and the home page (raw files in the session scratchpad, `serp-teardown/`).
- Search Console wasn't available: the last data is the owner's screenshots to 9 October ("wazwan" average position 9.6, 3,091 impressions, 2 clicks).

## Who ranks

**"wazwan", Google via Startpage, no region (Australia):** 1 Wikipedia · 2 YouTube ("Wazwan: The Royal Feast!") · 3 Al Jazeera (Reuters photo story, 30 Sep 2026) · 4 Lin's Food · 5 SBS · 6 Sanjeev Kapoor · 7 Sahapedia · 8 Al Jazeera · **9 wazwanway.com (the home page)** · 10–11 Instagram. Page 2 has no wazwanway.com URL.

**India (EN) region filter:** wazwanway.com is not in the top 11 for "wazwan", "what is wazwan", "wazwan dishes" or "wazwan dishes list". Wikipedia is first for all four; the rest are Al Jazeera, YouTube, Sahapedia, Instagram, the Budgam district site, Hamiast, Dream Valley Travels, Travel Nerve Kashmir, Lin's Food, Sanjeev Kapoor, ScienceDirect, TripAdvisor.

**Bing, India, "wazwan":** Wikipedia, Via Kashmir (two pages), Hamiast, Koshur Dude, Kashmirica, Kashmir Online, Sanjeev Kapoor, War4u, a restaurant site. Not wazwanway.com.

**Long tail, India (EN) region filter:**

| Query | wazwanway.com | Top of the page |
|---|---|---|
| wazwan gi tag | **#1** (/dishes) | then GKToday, Kashmiril, The Kashmir Monitor |
| waza meaning kashmir | **#2** (the waza guide) | Wikipedia first |
| rista vs gushtaba | #5 (/dishes/rista, not the guide) | Facebook, Instagram, Lin's Food, YouTube |
| wazwan serving order | not in top 10 | Via Kashmir, CN Traveller, Wikipedia, Dilbaro |
| what is trami wazwan | not in top 10 | Instagram, Sahapedia, Dilbaro, Facebook, Xogul |
| history of wazwan | not in top 10 | Sahapedia, Wikipedia, Slurrp, Al Jazeera |
| wazwan calories | not in top 10 | ResearchGate, Facebook, Instagram, Khushal-e-Kashmir, JMS SKIMS (the paper) |
| gushtaba / rista kashmiri / tabak maaz / daniwal korma / marchwangan korma | not in top 10 | YouTube, Wikipedia, Instagram, recipe sites, NDTV Food |

**Index check:** Google has /dishes indexed now (it was "Discovered – currently not indexed" on 12 October). Google shows its title as "Kashmir's Traditional Feast, Dish by Dish - Wazwan Way", dropping our leading "Wazwan:" as if it repeated the site name. The US search tool's index still had the guide merged on 12 October and the old "Kashmiri Dishes" title, and none of the seven stories.

## What the ranking pages have (and don't)

- **Video and social take up to half of each first page** (YouTube, Instagram, Facebook, Quora, Reddit, Pinterest). None of the ten text pages embeds a video, and wazwanway.com has none.
- **Eight of ten define Wazwan within about 35 words.** /dishes did so about 105 words in, after the stats and photo strips; its line under the title didn't use the word Wazwan.
- **Six explain the name near the top;** /dishes only in its FAQ, about 1,950 words in.
- **Seven show a date and three name a writer;** /dishes shows "Checked on" only at the foot of the page.
- **First-hand material:** Sahapedia has 14 credited photographs of wazas at work and quotes two by name; Asia Media Centre interviews a restaurant owner; Lin's Food's author ate a wedding Wazwan. Ours quotes a waza only through Reuters, and no photo is credited.
- **Where /dishes is already ahead:** the longest list in serving order (19 to 20 dishes; Wikipedia's 17 are not in order), 14 named sources where eight of the ten name none, a sourced dish count (7 to 36) where most give an unsourced 36, and documented-versus-told history.
- **Our own pages split the answer:** the home page also answers "What is Wazwan?" with its own serving list, and Google ranks the home page, not /dishes.

## Why we aren't first, in order of weight

1. **Authority.** Wikipedia is first for every query, everywhere we looked, and the rest of the first page is long-established publishers, a government site, and older commercial sites. The domain was registered on 9 June 2026, and the 11 October diagnosis found no mention of the site elsewhere and no Wikipedia links to it (see the authority section of `../seo-fixes-progress.md` for what was planned). On-page work can't close that gap by itself.
2. **The format Google shows.** For "wazwan" and every dish name, a third to a half of the first page is video and social posts. Without video, those places aren't open to us.
3. **Two of our pages answer the same question,** and Google picks the home page, whose title is about Kashmiri cuisine in general.
4. **Freshness of the newest pages.** /dishes has only just been indexed; the seven stories went live on 15 October and the series page on 17 October. Rankings for new pages take weeks to settle.
5. **Smaller on-page gaps** on /dishes (title rewrite, definition position, name meaning), fixed in release 17.

## Release 17 (built 20 October 2026, branch `seo/rank-wazwan`)

- **/dishes:** the title no longer starts "Wazwan:" ("Kashmiri Wazwan: The Feast and Its Dishes, in Serving Order"); the line under the title now opens "Wazwan is Kashmir's formal feast…", 27 words after the H1; In brief explains the name (*waz*, cook; *wan*, usually given as shop); Article schema names Wazwan with its Wikidata identity (Q4102393) and mentions the seven essential dishes as entities. The funeral figure was attributed to a restaurateur; Asia Media Centre doesn't attribute that paragraph to her, so it is now credited to the article.
- **New guide:** [How Many Calories Are in a Wazwan?](/kashmiri-food/wazwan/guide/wazwan-calories), from the 2012 SKIMS paper (PDF re-read in full on 20 October), the June 2026 *Kashmir Reader* advisory (re-read), and two gushtaba fat studies. It targets a query whose first page is a PDF, ResearchGate and social posts. Linked from seven dish pages, the rista and gushtaba stories, the guides index, the sitemap, llms.txt and llms-full.txt.
- **How Wazwan Is Served:** title and headings use the words people search with ("Serving Order", "What is a trami?", "The serving order").
- **Corrections in the stories:** the SKIMS team was called "three doctors"; the byline is two physicians and an M.Sc. researcher, so it's now "three researchers", and "SKIMS doctors" in five FAQ answers is "SKIMS researchers". Several lines said the doctors "weighed" the dishes; the paper says the vasta waza recorded his ingredients and the calories were calculated from those, so those lines now say counted or recorded. The series FAQ is corrected the same way.
- **llms.txt** now lists the Wazwan vs Mughlai guide, which had been missing since June, and the new guide.
- **Tests:** 157 (a new `lib/wazwanGuides.test.js` checks the calorie table against the paper's totals, that llms.txt lists every Wazwan guide, and that the /dishes title doesn't open on "Wazwan:").

Dates were not moved on /dishes or the serving guide: the edits are small, and dateModified should only move for real content changes.

## What would move "wazwan" itself (for the owner)

1. **Video.** A short film of a real Wazwan being cooked and served, on YouTube under the site's name, embedded on /dishes. It is the one format on the first page that no text competitor has. Only real footage, credited.
2. **Links from Kashmir and from food writing.** Pitch the core-seven stories and the calories guide to Kashmir Life, Greater Kashmir, Kashmir Observer, The Kashmir Walla and Kashmir Reader, and to the researchers and writers they cite. Ask Sahapedia how to contribute. Never place links on Wikipedia ourselves.
3. **Bing Webmaster Tools** (ChatGPT search draws on Bing): verify the site, submit the sitemap, and check how many pages Bing has indexed. We couldn't check this from here.
4. **Search Console:** for the query "wazwan", the Pages tab (home page or /dishes?) and Search appearance; URL Inspection for /dishes and the new guide; Request indexing for the new guide after release 17.
5. **First-hand material:** credited photographs and a named waza or two, quoted directly. Sahapedia does this and ranks for it.
6. **Decide the home page's role.** It keeps answering "What is Wazwan?", so Google keeps choosing it. Options: leave it (the home page is where Google is sending people); or let the home page hand off more clearly to /dishes. Any visible change there needs the owner's say, since the phone home page is to stay as it is.

## How to measure

Re-run these same Startpage searches (no region and India) and compare with the tables above; read Search Console for "wazwan", "wazwan dishes", "what is wazwan" and "wazwan calories" around 9 November and again in late November; re-run the Profound report and compare with the September baseline (10.3%, ChatGPT and Perplexity 0%).
