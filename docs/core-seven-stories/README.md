# The core seven: a long-form story for each essential Wazwan dish

_Research and content plan, prepared 15 October 2026. Status: all seven stories are live: rogan josh and gushtaba on 15 October 2026 (releases 11 and 12), and tabak maaz, rista, aab gosht, daniwal korma and marchwangan korma with the expanded gushtaba the same day (release 13, merge `df25a08`), each at least a 20-minute read after a second research pass (Lawrence 1895, Grierson's feast and kitchen vocabulary, the SKIMS 2012 calorie study, the SKUAST and Kashmir University meat-science papers, the mutton-import record 2012 to 2026, the Spices Board GI register; see `research/sources.md`). Read times: 22, 27, 26, 22, 21, 20 and 20 minutes (rogan josh to marchwangan korma), words ÷ 230 with link URLs stripped. The Outlook Traveller byline is Benny Joshua. On 17 October 2026 the SEO and AEO tier 1 work (series page, fact boxes, breadcrumbs, contents, links from the rest of the site, richer structured data) and four corrections were built on branch `seo/core-seven-tier1`; see `seo-aeo-tier1.md`. That work went live on 17 October 2026 (release 14) and the follow-up (feed, full text for language models, citations, series FAQ) on 20 October 2026 (release 15); see `seo-aeo-release-15.md`._

## 1. The seven dishes, confirmed

The brief asked us to confirm the exact seven before writing. Three independent sources name the same seven, and they match the site's own `ESSENTIAL_ORDER` (`frontend/lib/wazwanSequence.js`) and the "Essential" marks on `/dishes`:

| In serving order | Site slug | Named as essential by |
|---|---|---|
| Tabak maaz | `tabak-maaz` | Wikipedia ("Seven dishes are a must for these occasions", citing *The Hindu*, 11 April 2012, and a Delhi restaurant menu); the Waza family's cookbook listing ("Seven dishes typically form an indispensable part of the feast"); M. Saleem Beg, *Daily Excelsior*, 2023 ("7 standard dishes that are must for Wazawan") |
| Rista | `rista` | same three |
| Rogan josh | `rogan-josh` | same three, plus *Dawn* 2014 ("among the seven permanent dishes in wazwan") |
| Aab gosht | `aab-gosht` | same three |
| Daniwal korma | `daniwal-korma` | Wikipedia and the Roli listing; Beg's list has "dhania kurma" |
| Marchwangan korma | `marchwangan-korma` | Wikipedia and the Roli listing; Beg's list has "mirchi korma" |
| Gushtaba | `gushtaba` | same three |

Caveats to keep in the articles:
- No source says these seven were *the original* Wazwan. Sahapedia says the feast "grew from a seven-dish meal", and the waza Ghulam Nabi Baba told Reuters there were "only seven mutton dishes" in his forefathers' time, but neither names them. The site already words this carefully on `/kashmiri-food` and `/dishes`; the stories must not harden it.
- One commercial glossary (a spice seller) swaps marchwangan korma for kahwa. We follow Wikipedia, the Waza family's book and Beg.
- Wikipedia's Wazwan page disagrees with itself on two of the seven: its body says marchwangan korma is chicken in a browned-onion sauce and daniwal korma is "roasted" lamb, while its list of Kashmiri dishes calls marchwangan korma "an extremely spicy lamb dish". Every other source has both as mutton. Say so where relevant rather than picking silently.

## 2. What the research found, and what it means for length

Full notes are in `research/sources.md` (every source, what it supports, and its caveats) and `research/0N-<dish>.md` (one fact ledger per dish, claim by claim). The short version:

| Dish | Depth the sources justify | Why |
|---|---|---|
| Rogan josh | **3,500 to 4,500 words** | Four dictionaries on the name, a food historian's account of its route (Collingham, via Wikipedia and *Dawn*), a Kashmir University Persian scholar's account of an earlier route, two cookbooks (the Waza family's and Kaul Kilam's), six first-hand accounts of cuts, three on colourings, and a documented restaurant history abroad |
| Gushtaba | 3,000 to 4,000 | Pounding described by seven sources incl. a cookbook; the yakhni by four; the GI application; "last dish" in nine; two named wazas quoted; Kashmir Life's Khrushchev folklore caption |
| Tabak maaz | 2,500 to 3,500 | The Waza family's published recipe; Kaul Kilam's two-method recipe (kabargah and tabaq maz between sealed clay plates); Grierson on *tabakh*; the GI application; milk-vs-water disagreement across five sources |
| Rista | 2,500 to 3,000 | Shares the pounding material with gushtaba; distinct on colour, "first served", one per diner, binders in home versions |
| Aab gosht | 2,000 to 2,500 | A waza's "ten litres of milk reduced to one"; the Persian *abgoosht* contrast; *Kashmir Life* on its Iranian origin as "poor man's food"; two local recipes |
| Daniwal korma | 1,500 to 2,000 | Grierson on *dāñĕwal*; korma's etymology; the chicken version; one glossary with colour ("white gravy"); Wikipedia stub |
| Marchwangan korma | 1,500 to 2,000 | Grierson on *marʦ* and strings of winter chillies; "three-quarters of the feast's chilli" (IANS); Kashmiri chilli's measured heat; smaller chunks than rogan josh (a waza, via *The Kashmir Walla*) |

**Total: roughly 17,000 to 22,000 sourced words across the seven, not 70,000.** The brief asks for about 10,000 words per dish "where the available research justifies that depth" and says to "prioritize genuine depth and storytelling over an arbitrary word count". The research does not justify 10,000 words for any of them; the only way to reach it would be padding or invention, and the brief forbids both. The target column above is the plan. If a new source appears (the Roli cookbook in full, the GI annexures, the *National Geographic Traveller* feature now offline), the relevant article can grow.

Sources we could not read, listed so no one assumes they were used: *The Hindu* (2012 "Wonders of the Wazwan", the citation behind Wikipedia's seven; 2018 "Slow food, Kashmiri style"); NDTV Food (the Waza Brothers' dhaniwal korma recipe); Gastro Obscura's "Meet the 'Devil Chefs' of Kashmir" (Safina Nabi, 2022); Prof Upendra Kaul's *Greater Kashmir* essay (December 2025); *National Geographic Traveller India*'s "The King's Feast" (link dead). The 2016 *Journal of Ethnic Foods* review's abstract was read; its full text (open access on ScienceDirect) could not be fetched from here. One Wikipedia citation is wrong: "Bhat (2015), *Journal of Ethnic Foods*" on the Tabak maaz page resolves to a paper on an Ethiopian beverage; don't use it.

## 3. Where the stories live and how they avoid competing with existing pages

**Page type:** blog posts in `frontend/data/blogPosts.js`, category **Heritage Cookery** (already in the `/blog` filter, so no code change). The blog template gives each post Article schema, FAQPage schema built from its visible FAQ section, GFM tables, and a short search title via `SEARCH_TITLES`. Guides under `/kashmiri-food/wazwan/guide/` would also work but have no FAQ schema.

**Division of labour with pages that already exist** (the site's earlier keyword research lists the head terms "gushtaba, rista, rogan josh" under *keywords to avoid*, because the dish pages target them):

| Page | Owns |
|---|---|
| `/dishes/<slug>` | The head term: what the dish is, the recipe, where to eat it, the short sourced "About" notes |
| `/dishes` | "wazwan", the feast as a whole, the seven as a set |
| The guides | the serving order, the wazas, the history of the feast, rista vs gushtaba, the GI applications |
| **The story** | the dish's own history, name, craft, colour, variations, and its people, at depth: the "how, why and what it represents" the brief asks for |

Each story links to its dish page in the first paragraph and is linked back from it through `frontend/data/relatedReading.js` ("The full story"). The story never repeats the recipe.

**Proposed addresses and the distinct intent each one targets** (the owner can rename before publication):

| Dish | Slug | Intent the story owns | Working title |
|---|---|---|---|
| Rogan josh | `/blog/rogan-josh-history` | rogan josh history, origin, meaning; why it is red; Kashmiri vs restaurant rogan josh | Rogan Josh: The History, the Name and the Red of Kashmir's Most Famous Dish |
| Gushtaba | `/blog/gushtaba-last-dish-of-wazwan` | why gushtaba is served last; how it is made; "king of dishes" | Gushtaba: Why the Wazwan Ends With a Meatball |
| Rista | `/blog/rista-pounded-meatballs` | how rista is made; why it is red; the pounding | Rista: The Meatball Pounded on a Stone |
| Tabak maaz | `/blog/tabak-maaz-ribs-cooked-twice` | tabak maaz meaning; tabak maaz vs kabargah; how it is cooked | Tabak Maaz: Ribs Cooked Twice |
| Aab gosht | `/blog/aab-gosht-milk-curry` | aab gosht meaning; the milk; Persian abgoosht vs Kashmiri aab gosht | Aab Gosht: The Milk Curry of the Wazwan |
| Daniwal korma | `/blog/daniwal-korma-coriander` | daniwal korma meaning; Kashmiri korma vs Mughlai korma | Daniwal Korma: The Coriander Course |
| Marchwangan korma | `/blog/marchwangan-korma-chilli` | marchwangan korma meaning; how hot it is; Kashmiri chilli | Marchwangan Korma: The Hottest Dish on the Trami |

## 4. The shape of each article

Not a fixed template; each dish gets the sections its material supports. The common spine:

1. **An opening scene** built only from documented detail (the 3 am start, the wood fire, the copper degs, the mallets on stone, the covered trami). No invented anecdotes, no imagined dialogue.
2. **Identity and name**, with every etymology attributed and uncertainty kept (Grierson's dictionary where it has the word).
3. **Where it comes from: what's documented and what's told**, in the Documented/Told manner already used on `/dishes`.
4. **Ingredients, colour and flavour**, naming the sources and their disagreements.
5. **How the wazas make it**, from the published recipes and the reported accounts, with the cookbook methods as evidence rather than instructions (the recipe stays on the dish page).
6. **The waza's craft** as it bears on this dish (fire, pots, hours, hierarchy, apprenticeship).
7. **Its place at the trami**: where it comes in the order, with the sources' disagreements.
8. **Variations and neighbours**: Kashmiri Muslim and Kashmiri Pandit versions, restaurant and overseas versions, and the dishes it is confused with.
9. **For a first-time visitor**: short and practical, linking to the restaurant guide and cost guide.
10. **Frequently asked questions** (visible; the template turns them into FAQPage schema).
11. **Further reading** (internal) and **Sources** (external, with dates).

**Style:** Documentary and encyclopaedia, not recipe blog. Every factual sentence names its source inline. Oral tradition is labelled as such. Where sources disagree, the article says so. House spellings: trami, waza, vasta waza, praan, mawal, ratan jot, gushtaba, rista, tabak maaz, aab gosht, daniwal korma, marchwangan korma. No made-up quotations; all quotations are from the sources listed, with the speaker's name and role.

**SEO, GEO and AEO:** a search title under 60 characters in `SEARCH_TITLES`; the `excerpt` as the meta description (under 160 characters); H2s that answer questions where that reads naturally; a one-paragraph definition near the top; the FAQ section; internal links to the dish page, `/dishes`, the relevant guides, the restaurant guide and the sources page; the story added to `public/llms.txt`. No search volumes, difficulty scores or ranking claims appear anywhere, because we have none.

**Images:** each draft lists the photographs it needs. The site has usable photos of the dishes themselves (`/images/scroll/*.png`, `/images/dishes/*`). What it lacks, and should commission or shoot: the wazas' kitchen (the vur), degs on a wood fire, the mallets and stone, dried mawal, strings of dried Kashmiri chillies, praan, a covered trami, hands at the trami. The three unlinked uploads in `frontend/public/images/agencies/` include a photograph of wazas at a row of degs; it can be used only if the owner confirms it is theirs. No stock photography presented as Kashmir, and no AI-generated images.

## 5. Order of work and validation

Order: rogan josh (the best-known dish and the best-sourced), gushtaba, tabak maaz, rista, aab gosht, daniwal korma, marchwangan korma.

For each article:
1. Write `research/0N-<dish>.md`: the fact ledger, claim by claim, with the source for each.
2. Write `drafts/0N-<dish>.md`: metadata table, article body, image list, fact-check list.
3. Add the post to `frontend/data/blogPosts.js`, its search title to `SEARCH_TITLES`, the dish-page link in `relatedReading.js`, and the line in `llms.txt`.
4. Run the tests and build; check the page on a phone-width and a desktop-width screenshot; confirm the FAQ schema matches the visible FAQ; confirm every internal link returns 200.
5. The owner reads the draft. Nothing is published without their approval.

## 6. What's in this folder

| File | What it is |
|---|---|
| `README.md` | This plan |
| `research/sources.md` | Every source read for the project, what it supports, its caveats, and the sources that could not be read |
| `research/0N-<dish>.md` | One fact ledger per dish, claim by claim (01 rogan josh to 07 marchwangan korma) |
| `drafts/0N-<dish>.md` | One article per dish, with metadata, images and fact-check list |
