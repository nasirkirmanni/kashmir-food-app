# D. Content quality audit

_Prepared 14 September 2026, after all ten drafts were written and fact-checked. The automated checks come from `audit_drafts.py`; its full output is in `audit-report.md`. Everything else is an editorial review._

## Summary

**Automated checks.** All ten drafts pass:
- **Length and structure:** 1,528–2,178 words of article body, and six FAQs each.
- **Titles and descriptions:**
  - meta titles are 60 characters or fewer with " | Wazwan Way";
  - meta descriptions fit the site's 158-character limit.
- **Keyword placement:** each primary keyword appears in the title, meta title, description, first 100 words and at least one H2.
- **Headings and markup:** no body contains an H1, and none contains characters that would break `blogPosts.js`.
- **Links:** every internal link points to a live page (checked against the 141-URL sitemap) or to another draft.

**Fact-checking.** Fact-checking during the audit corrected or softened 12 claims, listed in section 3. Where sources still disagree, the drafts say so.

**Before any post goes live:**
1. Template changes, so tables render and links to unpublished posts don't 404.
2. Fixes to existing pages that the new posts contradict.
3. A Kashmiri Pandit community review of blog 8.

**Publish first:** 1 *What to Eat in Kashmir*, 2 *Kashmiri Street Food*, 3 *Kashmiri Winter Food* (see section 10).

## Automated check results (final run)

| # | Post | Body words | FAQs | Existing pages linked | Meta title (with suffix) | Meta description |
|---|---|---|---|---|---|---|
| 1 | What to Eat in Kashmir | 1,850 | 6 | 7 | 58 | 155 |
| 2 | Kashmiri Street Food | 1,822 | 6 | 10 | 58 | 156 |
| 3 | Kashmiri Winter Food | 1,697 | 6 | 6 | 54 | 147 |
| 4 | Kashmiri Cuisine Explained | 2,178 | 6 | 9 | 57 | 155 |
| 5 | Kashmiri Breakfast | 1,602 | 6 | 11 | 58 | 152 |
| 6 | Is Kashmiri Food Spicy? | 1,566 | 6 | 8 | 51 | 150 |
| 7 | Vegetarian Food in Kashmir | 1,571 | 6 | 9 | 52 | 142 |
| 8 | Kashmiri Pandit Food | 1,755 | 6 | 9 | 53 | 153 |
| 9 | What to Buy in Kashmir | 1,698 | 6 | 5 | 60 | 143 |
| 10 | Kashmiri Sweets and Desserts | 1,528 | 6 | 12 | 54 | 149 |

The first pass found seven problems, all now fixed:
- three drafts under 1,500 words;
- one description over 158 characters;
- one undated price;
- one unattributed percentage (listed twice by the first version of the script).

It also found five sentences repeated word for word across drafts, which have been rewritten.

## 1. Is each blog meaningfully different?

Yes. Each post answers a different searcher question, and the closest neighbours are separated by scope:

| Post | The question it answers | What only this post does | Closest neighbour, and how they're kept apart |
|---|---|---|---|
| 1 What to eat | "What should I eat on my trip?" | Organises Kashmiri food by meal and season for first-timers | Post 4. Post 1 tells travellers what to order and when; post 4 explains the cuisine |
| 2 Street food | "Where and when do I eat street food in Srinagar?" | Places, times of day, a one-day plan and hygiene advice | Post 1's short street-food section, which links here |
| 3 Winter food | "What does Kashmir eat in winter?" | The chilla calendar, harissa hours and a hokh syun name table | Post 2's harissa section, kept short and linking here |
| 4 Cuisine explained | "What is Kashmiri cuisine?" | History, the two kitchens, spices, techniques, where Wazwan fits | The 19 Wazwan guides, which it links to rather than repeats |
| 5 Breakfast | "What do Kashmiris eat for breakfast?" | The morning ritual, from kandur to noon chai | /blog/kandur-wan-breads, which covers the breads themselves |
| 6 Is it spicy? | "Will Kashmiri food be too hot for me?" | A dish-by-dish heat guide and a comparison with Punjabi cooking | /blog/kashmiri-red-chili, which covers the chilli |
| 7 Vegetarian | "Can I eat vegetarian, or Jain, in Kashmir?" | How to order, and which dishes Jain travellers should avoid | The vegetarian-wazwan guide, which covers Wazwan only |
| 8 Pandit food | "What is Kashmiri Pandit food?" | Meat customs, the flavour base, festival food, a comparison with Wazwan | Post 4 (overview) and post 7 (vegetable dishes) |
| 9 What to buy | "What food should I buy, and how do I check it?" | GI and IIKSTC checks, walnut types, almond imports, label checks | /blog/pampore-kashmiri-saffron, which tells the saffron story |
| 10 Sweets | "Which sweets are genuinely Kashmiri?" | When to find each sweet, and which "Kashmiri" sweets aren't | The three phirni dish pages |

The text-overlap check agrees:
- **Between drafts:** the most similar pair (4 and 6) shares 26 eight-word sequences, a Jaccard similarity of 0.007. These are short factual phrases about chilli and colourings.
- **Against existing blog posts:** no draft shares more than one eight-word sequence with any of them.

## 2. Cannibalisation

### Between the new drafts

Every primary keyword is unique, and no draft's title contains another draft's primary keyword. The script flagged two deliberate long-tail overlaps:
- Post 3 lists *what to eat in kashmir in winter* as a secondary keyword.
- Post 7 lists *what to eat in kashmir vegetarian* as a secondary keyword.

Both are narrower versions of post 1's primary keyword. Post 1 links to posts 3 and 7 with descriptive anchors, which signals that they're the specialist pages.

Keep both, but check Search Console after 6–8 weeks. If post 1 ranks for the winter or vegetarian variants instead of the specialist posts, strengthen those links.

### Against existing WazwanWay pages

| New post | Existing page | Risk | What to do |
|---|---|---|---|
| 2 Street food | /kashmiri-food/street-food, titled "Kashmiri Street Food: Tujji, Harissa & More" (about 450 words, generic shared H1) | **High:** same head term | Before publishing post 2, give the hub its own H1 and make it the dish directory. Link it to post 2 for places and times. If both pages stall on page two of results, consolidate them. |
| 2 Street food | /restaurants/best-wazwan-srinagar (has a Khayam Chowk section) | Low to moderate: that page targets "best food in Srinagar" | Link each way; keep place-and-time detail in post 2 |
| 5 Breakfast | /blog/kandur-wan-breads (about 370 words) | Moderate: the breads overlap | Post 5 targets the meal. Add a link from the bread post; if it stays thin, merge it into post 5 with a 301 redirect |
| 7 Vegetarian | /kashmiri-food/wazwan/guide/vegetarian-wazwan | Moderate | Post 7 keeps its Wazwan section short and links to the guide |
| 9 What to buy | /blog/pampore-kashmiri-saffron | Low to moderate | Post 9 covers buying and checking; link both ways |
| 10 Sweets | /dishes/phirni, /dishes/badam-phirni, /dishes/saffron-phirni | These three pages already overlap each other | Post 10 links only to phirni and saffron-phirni. Consolidate the three pages, or give each a distinct angle |
| 4 Cuisine explained | /dishes and the rogan-josh-explained guide | Low: a word match only, different intent | None |

## 3. Accuracy

### How the facts were checked

- **Sourcing.** Every factual claim in an article body is either attributed in the text or listed in that draft's editor-only fact-check sources. The sources include:
  - Wikipedia;
  - Government of J&K pages (District Budgam, JKTDC);
  - Incredible India and the USDA;
  - Kashmiri media (Kashmir Life, Greater Kashmir, The Kashmir Monitor, Daily Excelsior);
  - national media and archives (PARI, Sahapedia, Outlook, The Tribune, ETV Bharat).
- **Conflicts** between sources are stated in the text, not resolved silently.
- **Nothing invented.** There are no search volumes, rankings, awards, reviews or undated prices. Prices appear only with a date and a source (Batte Gali in 2023, hokh syun in 2024). The audit script flags undated prices and unattributed percentages.
- **Dish descriptions** follow reference sources, not WazwanWay's own dish pages, because several of those pages make unsourced claims.

### Claims corrected during the audit

1. **Tabak maaz (post 1).** "Simmered in milk, then fried until crisp" is now "simmered until tender, then fried". Wikipedia's articles disagree on milk or yogurt, and none says crisp.
2. **Rista (posts 1 and 4).** It was described as pounded mutton, but Wikipedia confirms pounding only for gushtaba. Rista is now described by its red gravy.
3. **Ratanjot vs mawal (posts 4 and 8).** The tables implied a clean Pandit/Muslim split in red colourings. Wikipedia's Wazwan article says rista is coloured with alkanet, so the split is now described for rogan josh only, with that caveat.
4. **Momos, thukpa and butter tea (posts 1 and 4).** "Tibetan and Ladakhi" became "Tibetan and wider Himalayan traditions", with sources. None of the Wikipedia articles places these dishes in the Kashmir Valley.
5. **Halal (post 1).** An unsourced statement that meat in the Valley is typically halal was removed.
6. **Kahwa (post 1).** "Often offered to guests" is now "commonly served after Wazwan and family dinners", which is what Wikipedia says.
7. **Noon chai and rogan josh (post 1).** "Buttery" was removed from the noon chai description. "Colour-rich rather than fiery" was softened, because a Pandit writer says Pandit rogan josh should look fiery.
8. **Ramadan phirni (post 1).** "Sold only in Ramadan in parts of the old city" is now "some makers", since only one family's practice is documented.
9. **"Best-known" claims** were softened for Khayam Chowk (posts 1 and 2), phirni (posts 1 and 10), harissa (post 3) and Ahdoo's (post 10).
10. **Content calendar (B).** B mentioned an autumn almond and saffron harvest, but only the autumn walnut harvest is sourced, so B now says only that.
11. **Wedding menu limits (posts 4 and 7).** The 2017 report couldn't be read, because its publisher blocked access. The drafts cite the figures reported by Gulf News in 2018 (seven non-vegetarian dishes, seven vegetarian and two sweets). They also mention a 1960s guest limit, reported by Outlook India.
12. **Batte Gali prices (post 2) and the almond share (post 9)** now carry their date and source on the same line.

### Uncertainties the drafts state openly

- **Chillai Kalan's end date:** 29 January (Wikipedia) or 31 January (Kashmir Life).
- **When hokh syun is dried:** three sources give three different periods.
- **Harissa:**
  - origin traditions (Shah-i-Hamdan, the Mughals, a Persian link);
  - shops' claimed ages;
  - overnight cooking in a *mathh* vs a 24-hour underground oven.
- **Phirni:** ground rice or semolina, and whether the Aali Kadal family has sold Ramadan phirni for 45 or 61 years.
- **Kashmiri chilli heat:** the Spices Board figure of 1,000–2,000 SHU vs consumer tests of branded powders.
- **Meat preferences:** lamb vs young goat.
- **Meat at Pandit weddings:** WeddingWire India and Outlook Traveller disagree.
- **Mushqbudji rice GI date:** July 2023 or February 2022. Confirm with the GI Registry.
- **Khetsimavas:** its source is flagged as needing citations, so it's described as tradition.
- **Ver masala:** recipes vary, so it's described in general terms.

**A weakness to note.** Wikipedia is the most-cited source, and several of its claims have no citation of their own. The drafts attribute those claims rather than stating them flatly. Replacing the key Wikipedia citations with primary sources, such as books, government records or named experts, would make the posts more authoritative.

### Must be verified before publishing

- Blog 8: review by a Kashmiri Pandit cook or community member.
- **Places:** that Khayam Chowk, the Hazratbal stalls and Batte Gali (post 2) and Krishna Dhaba (post 7) are still operating as described.
- **This year's dates:**
  - harissa season (posts 2, 3 and 5);
  - Ramadan (posts 1 and 10);
  - Herath (posts 3 and 8).
- **Post 9:** the FSSAI labelling requirement, which was confirmed only through summaries of the regulation.
- **Posts 4 and 9:** the Mushqbudji GI date.

## 4. Usefulness for real searchers

Each post gives searchers something the ranking pages reviewed in the research don't:

| Post | Practical value |
|---|---|
| 1 | What to eat, organised by meal and season, plus a list of dishes that aren't Kashmiri |
| 2 | Named places and times, a street-food day plan, and hygiene advice tied to a dated incident |
| 3 | A calendar of the three chillas, harissa hours, and a table of hokh syun names |
| 4 | A sourced comparison of the two kitchens, the spice cabinet, and myths corrected with sources |
| 5 | A table of which bread is eaten when, and how visitors can eat a local breakfast |
| 6 | A dish-by-dish heat guide, with ordering advice for people who avoid heat and people who want it |
| 7 | What to ask when ordering, and root-vegetable guidance for Jain travellers |
| 8 | Meat customs, with sources; festival food; a Pandit vs Wazwan comparison |
| 9 | GI and IIKSTC checks, walnut types, the almond import reality, and label checks |
| 10 | Which sweets are genuinely Kashmiri, and when to find each one |

## 5. Does the writing sound natural?

**Mostly yes:**
- Each post answers the question first, in plain British English with short paragraphs.
- Uncertain claims are named as uncertain.
- No section exists to pad the word count. The three drafts that fell short of 1,500 words each gained a sourced section, not filler:
  - post 6: red and white gravies;
  - post 7: vegetarian food at celebrations;
  - post 10: sweet drinks.

**Two honest weaknesses:**
- **Dense in places.** The drafts lean heavily on bullet lists and in-text attributions such as "according to Wikipedia". That helps scanning and trust, but it can feel dense. Before publishing, an editor should turn some lists back into prose, especially in posts 4 and 8, and move some attributions to the end of paragraphs.
- **No first-hand experience.** Adding a WazwanWay team member's own observations, and owned photos, would make the posts more distinctive and strengthen the "experience" part of Google's E-E-A-T criteria.

## 6. Repetition

- **Across drafts:** no sentence of 10 or more words repeats word for word, and overlap between any two drafts is below 1%.
- **Deliberate repeats:** a few core facts, such as harissa hours, the noon chai method and when masala tsot is sold, appear in three or four posts, because each post has to stand alone. Each repeat is kept to a line or two, with a link to the post that covers the topic fully.
- **Within a draft:** the intro and FAQ restate key points on purpose, because FAQ answers are often quoted on their own.

## 7. Titles and meta titles

| Post | Title (H1) | Meta title | Characters with suffix |
|---|---|---|---|
| 1 | What to Eat in Kashmir: A First-Timer's Guide to the Valley's Food | What to Eat in Kashmir: A First-Timer's Guide | 58 |
| 2 | Kashmiri Street Food: What to Eat in Srinagar, Where and When | Kashmiri Street Food: What to Eat in Srinagar | 58 |
| 3 | Kashmiri Winter Food: Harissa, Hokh Syun and Eating Through Chillai Kalan | Kashmiri Winter Food: Harissa & Hokh Syun | 54 |
| 4 | Kashmiri Cuisine Explained: Two Kitchens, Everyday Food and the Wazwan Feast | Kashmiri Cuisine: Dishes, Spices and History | 57 |
| 5 | Kashmiri Breakfast: Noon Chai, the Kandur and What Kashmir Eats in the Morning | Kashmiri Breakfast: Noon Chai & Kandur Breads | 58 |
| 6 | Is Kashmiri Food Spicy? Colour, Heat and How It Differs From North Indian Food | Is Kashmiri Food Spicy? Colour vs Heat | 51 |
| 7 | Vegetarian Food in Kashmir: What to Eat and How to Order | Vegetarian Food in Kashmir: What to Eat | 52 |
| 8 | Kashmiri Pandit Food: Dishes, Customs and How It Differs From Wazwan | Kashmiri Pandit Food: Dishes and Customs | 53 |
| 9 | What to Buy in Kashmir: A Food Lover's Guide to Saffron, Walnuts, Almonds and More | What to Buy in Kashmir: Saffron, Walnuts & More | 60 |
| 10 | Kashmiri Sweets and Desserts: What's Genuinely Kashmiri and When to Find It | Kashmiri Sweets and Desserts: What to Try | 54 |

- Every meta title starts with the primary keyword.
- No title uses "best", "ultimate" or a year, and none promises more than the post delivers.
- All ten H1s exceed 60 characters with the suffix, so each needs a `SEARCH_TITLES` entry. The entries are in the README.
- Post 9's meta title is exactly at the 60-character limit.

## 8. Are the internal links realistic?

- **Existing pages.** The drafts link to 86 existing pages in total, counted once per post. All 86 were checked against the live sitemap, and none is broken. Anchors describe the destination.
- **Other new posts.** Each draft links to two to five of the other new posts. Those links will 404 until their targets are live. The README gives a small template change that shows them as plain text until then, and a manual alternative.
- **Inbound links.** Each draft lists links to add from existing pages once it's live. Two of those, the kandur-wan-breads link and the street-food hub fix, should happen before publishing.
- **Pages to fix first.** Some linked pages contain claims the new posts contradict, notably the Timur origin story on what-is-wazwan and three history pages. Fix those pages before publishing the posts that link to them (README, "Existing pages to fix").

## 9. Does each blog support WazwanWay's purpose?

Each post sends readers deeper into the site, towards its dish pages, Wazwan guides and trip planning, rather than ending at the article.

| Post | Main CTA | Supporting links |
|---|---|---|
| 1 | /dishes | Food Trail itinerary; What is Wazwan? |
| 2 | Food Trail itinerary | Street-food dish pages; the Srinagar food guide |
| 3 | Winter itinerary | Harissa dish page |
| 4 | /dishes | Wazwan guides; spice posts |
| 5 | Bakery hub (/kashmiri-food/bakery) | Food Trail itinerary; bread dish pages |
| 6 | /dishes | Spice and chilli posts |
| 7 | /dishes | Vegetarian Wazwan guide |
| 8 | /dishes | /contact, inviting families to share their customs |
| 9 | /recipes | Saffron post |
| 10 | /dishes | Street-food guide |

None of the posts sells anything or makes restaurant "best" claims, which fits the site's editorial role.

## 10. Which three to publish first

1. **What to Eat in Kashmir** (publish by 22 September).
   - **Why first:** it has the broadest demand, and the competing pages are shallow and often wrong. It's also the hub the other posts link to.
   - **Blocker:** the template changes for tables and links to unpublished posts.
2. **Kashmiri Street Food** (25 September).
   - **Why next:** competition is low to moderate, and no competitor gives places and times.
   - **Blockers:** first sort out the /kashmiri-food/street-food hub (its own H1, positioned as the dish directory), and confirm the named places are still operating.
3. **Kashmiri Winter Food** (29 September).
   - **Why now:** it's seasonal. It needs to be indexed before the harissa season starts in October and Chillai Kalan begins on 21 December, and competition is low.
   - **Blocker:** align the /dishes/kashmiri-harissa page's season and origin claims with this post.

**Why not the pillar first?** Post 4 should follow as fourth, as planned. Publishing it means first attributing the Timur story on four existing pages, or the site will contradict itself. Post 8 waits for its community review, whatever its calendar slot.

## Pre-publish checklist

- [ ] **Template:**
  - [ ] tables render (`remark-gfm`);
  - [ ] guard for links to unpublished posts;
  - [ ] `SEARCH_TITLES` entries;
  - [ ] `excerpt` field;
  - [ ] "Travel & Food Guides" category;
  - [ ] optionally, FAQ schema and per-post share images.
- [ ] Existing-page fixes from the README table.
- [ ] Time-sensitive facts verified (each draft's "Before publishing" notes).
- [ ] Blog 8 community review completed and credited with permission.
- [ ] Owned or licensed photography for each featured image.
- [ ] Search Console connected, to request indexing and track the primary keywords.
