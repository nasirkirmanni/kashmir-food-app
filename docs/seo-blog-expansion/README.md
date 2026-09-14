# WazwanWay SEO blog expansion

_Prepared 14 September 2026. All ten posts were published together on 15 September 2026._

## Status

The posts went live at once, not on the staggered dates in `B-content-calendar.md`, so every link between them works from day one.

| Done in the release | Where |
|---|---|
| Tables render (`remark-gfm`) and scroll sideways on phones | `frontend/app/blog/[slug]/page.js` |
| FAQPage JSON-LD built from each post's visible FAQ section | `frontend/lib/markdownFaq.js` (with tests) |
| Short search titles, `excerpt` descriptions, "Travel & Food Guides" filter | `page.js`, `data/blogPosts.js`, `app/blog/page.js` |
| Dish pages link to the guides; each guide lists its dishes | `frontend/data/relatedReading.js` |
| The Timur origin story is presented as legend on what-is-wazwan, history-of-wazwan, `/history` and the complete history post | `data/wazwanGuides.js`, `app/history/`, `data/blogPosts.js` |
| vegetarian-wazwan no longer calls Kashmiri Pandit cooking primarily vegetarian | `data/wazwanGuides.js` |
| The kandur bread post links to the breakfast guide | `data/blogPosts.js` |

**Still open**
- Blog 08 (Kashmiri Pandit food) went live without the community review recommended below. Get one, and update the post if the reviewer suggests changes.
- The harissa dish page's season and origin claims live in the database, not the code.
- `/kashmiri-food/street-food` still shares the generic hub heading with the other food hub pages.
- Per-post share images need owned photography.
- Smaller notes on existing pages: the "world's finest" saffron title, the "fiery" rista wording, the shufta and phirni dish pages, and the basrakh and tosha category.
- Request indexing for the ten URLs in Search Console.

## What's in this folder

| File | What it is |
|---|---|
| `A-research-summary.md` | **A.** Keyword research, competitor analysis, content gaps, strategy and keywords to avoid |
| `B-content-calendar.md` | **B.** The 10 topics, publishing order and cross-links between the new posts |
| `blogs/01-…` to `blogs/10-…` | **C.** The 10 full drafts. Each has SEO metadata, the article, internal links, image ideas, a CTA and an editor-only list of fact-check sources |
| `D-content-quality-audit.md` | **D.** The content quality audit, including which three posts to publish first |
| `audit_drafts.py` | A re-runnable check of word counts, titles, descriptions, links, overlap and claims to review |
| `audit-report.md` | The latest output of `audit_drafts.py` |
| `research/` | SERP and competitor notes for each keyword cluster, plus the live sitemap paths and site inventory used to check links |

Re-run the checks after editing any draft:

```bash
python3 docs/seo-blog-expansion/audit_drafts.py
```

## Template changes (done on 15 September 2026, except share images)

Posts live in `frontend/data/blogPosts.js` and render through `frontend/app/blog/[slug]/page.js`.

1. **Make tables render.**
   - `react-markdown` 9 is installed without `remark-gfm`, so Markdown tables currently print as rows of pipes. Every draft has one to three tables.
   - Install `remark-gfm` (version 4 works with react-markdown 9) and pass `remarkPlugins={[remarkGfm]}` to `ReactMarkdown`.
   - Add `table`, `th` and `td` components, and wrap each table in an `overflow-x-auto` container so it scrolls on phones.
   - The alternative is to convert the tables to lists before publishing.
2. **Stop links to unpublished posts from breaking.** Not needed in the end, because all ten were published together. Keep this for future staggered releases. Two ways to handle it:
   - **In the template (recommended).** Add a check to the `a` component, so an internal link to a `/blog/…` path that isn't in `blogPosts` renders as plain text until that post exists:

     ```js
     const publishedPaths = new Set(blogPosts.map((p) => `/blog/${p.slug}`));
     // inside components={{ ... }}
     a: ({ node, href = "", children, ...props }) =>
       href.startsWith("/blog/") && !publishedPaths.has(href)
         ? <span>{children}</span>
         : <a href={href} className="text-[var(--saffron)] hover:text-amber-400 underline decoration-white/20 underline-offset-4" {...props}>{children}</a>,
     ```

   - **By hand.** Remove each link listed under "Links to new posts" in a draft, and add it back once the target post is live.
3. **Add FAQ schema.**
   - `buildFaqSchema()` already exists in `components/JsonLd.js`, but the blog template outputs only Article schema.
   - Build the FAQ list from each post's `## Frequently asked questions` section: each `###` heading is a question, and the text up to the next `###` is its answer, with Markdown stripped. The schema then always matches the visible text.
   - Since 2023, Google has limited FAQ rich results to well-known government and health websites, so don't expect a rich result. The markup is still accurate structured data for the page.
4. **Give each post its own share image.**
   - `page.js` uses `/wazwan-hero.jpg` for every post, in Open Graph, Twitter and Article schema.
   - Add an optional `image` field to posts, falling back to the hero image.
   - Each draft's image table suggests a featured image and alt text. Use owned or licensed photography only.
5. **Add the new category.**
   - The filter on `/blog` (`frontend/app/blog/page.js`) hard-codes five categories.
   - Drafts 01, 02, 03, 07 and 09 suggest a new category, **Travel & Food Guides**.
   - Add it to that array, or give those posts an existing category. Otherwise they'll only appear under "All".

## Adding a post

1. **Create the entry in `blogPosts.js`.**
   - Copy everything between `<!-- ARTICLE BODY START -->` and `<!-- ARTICLE BODY END -->` into `content`.
   - The body has no H1, because the template already renders `title` as the H1.
   - The audit also checks that the body has no backticks or `${`, which would break the template literal.
   - Fill the other fields from the draft's metadata table, for example:

   ```js
   {
     slug: "what-to-eat-in-kashmir",
     title: "What to Eat in Kashmir: A First-Timer's Guide to the Valley's Food",
     author: "WazwanWay Team",
     date: "September 22, 2026",
     category: "Travel & Food Guides",
     readTime: "10 min read",
     excerpt: "What to eat in Kashmir, from everyday rice and haakh to Wazwan, bakery breads, noon chai, street food and winter harissa, plus when and where to find each.",
     content: `...article body...`,
   },
   ```

   How the fields are used:
   - **`excerpt`** is the meta description, the card text on `/blog` and the Article schema description. All ten are within the site's 158-character limit.
   - **Byline:** a byline containing "Team" is published as the organisation in Article schema. Don't add named authors or credentials unless they're real and the person has agreed.
   - **`date`** uses the same "Month D, YYYY" format as the existing posts. The sitemap picks up `updatedDate || date` automatically.
   - **`readTime`** estimates from `audit-report.md`, at about 200 words a minute:

     | Draft | readTime |
     |---|---|
     | 01 | 10 min |
     | 02 | 10 min |
     | 03 | 9 min |
     | 04 | 11 min |
     | 05 | 9 min |
     | 06 | 8 min |
     | 07 | 8 min |
     | 08 | 9 min |
     | 09 | 9 min |
     | 10 | 8 min |

2. **Add the short search title to `SEARCH_TITLES` in `page.js`.** All ten post titles exceed 60 characters once " | Wazwan Way" is added.

   ```js
   "what-to-eat-in-kashmir": "What to Eat in Kashmir: A First-Timer's Guide",
   "kashmiri-street-food-srinagar": "Kashmiri Street Food: What to Eat in Srinagar",
   "kashmiri-winter-food": "Kashmiri Winter Food: Harissa & Hokh Syun",
   "kashmiri-cuisine-explained": "Kashmiri Cuisine: Dishes, Spices and History",
   "kashmiri-breakfast": "Kashmiri Breakfast: Noon Chai & Kandur Breads",
   "is-kashmiri-food-spicy": "Is Kashmiri Food Spicy? Colour vs Heat",
   "vegetarian-food-in-kashmir": "Vegetarian Food in Kashmir: What to Eat",
   "kashmiri-pandit-food": "Kashmiri Pandit Food: Dishes and Customs",
   "what-to-buy-in-kashmir-food-souvenirs": "What to Buy in Kashmir: Saffron, Walnuts & More",
   "kashmiri-sweets-desserts": "Kashmiri Sweets and Desserts: What to Try",
   ```

3. **Link dish pages back to the post in `frontend/data/relatedReading.js`.**
   - Add a `BLOG` entry for the post, then list it under the dishes it covers in `ARTICLES_BY_DISH`.
   - The dish pages will then show the article.
   - `RelatedDishLinks` will list those dishes at the end of the article automatically.

   | Post | Suggested `ARTICLES_BY_DISH` keys |
   |---|---|
   | Street food | masala-tsot, mutton-tujji, seekh-kebab, nadur-monji, aloo-monji |
   | Winter food | kashmiri-harissa, nadru-gaad |
   | Breakfast | girda, lavas, czochworu, kashmiri-kulcha, bakerkhani, noon-chai |
   | Is Kashmiri food spicy? | rogan-josh, rista, marchwangan-korma, aab-gosht, gushtaba |
   | Vegetarian food | nadru-yakhni, dum-oluv, ruwangan-chaman |
   | Pandit food | kabargah, shufta |
   | What to buy | kashmiri-kahwa |
   | Sweets | phirni, saffron-phirni, basrakh, tosha, walnut-halwa, sheera |
   | What to eat; Cuisine explained | None; these hubs already link out widely |

4. **Add inbound links from existing pages.** Each draft lists these under "Suggested inbound links".

## Existing pages to fix alongside the new posts

The new posts are more carefully sourced than some existing pages, so the site shouldn't contradict itself. `D-content-quality-audit.md` has the full list. The ones that block a particular post:

| Fix | Before publishing |
|---|---|
| `what-is-wazwan`, `/history`, `history-of-wazwan` and `complete-history-of-wazwan` present the Timur/Samarkand origin as fact. Attribute it as tradition. | 04 Cuisine explained |
| `/dishes/kashmiri-harissa`: align the season with PARI's October–March, and attribute the Central Asian origin claim. | 03 Winter food |
| `/kashmiri-food/street-food` renders the shared "definitive guide" H1. Give it its own H1, and link it to the new guide. | 02 Street food |
| `/blog/kandur-wan-breads`: add a link to the breakfast post. | 05 Breakfast |
| `/blog/pampore-kashmiri-saffron`: soften "world's finest", and add the GI tag and IIKSTC facts. | 09 What to buy |
| `/dishes/shufta` (honey, weddings), `/dishes/phirni` (rice only) and the basrakh/tosha "Street Food" category. | 10 Sweets |
| `vegetarian-wazwan` and `complete-history-of-wazwan`: check that their Pandit sections don't imply that Pandits are vegetarian. | 07 Vegetarian, 08 Pandit food |

## Sign-offs before publishing

- **Blog 08 (Kashmiri Pandit food)** must be reviewed by a Kashmiri Pandit cook or community member. Credit them only with their permission.
- **Time-sensitive facts.** Every draft ends with "Before publishing" checks in its fact-check sources. These cover the current year's harissa season, Ramadan and Herath dates, whether named places are still operating, and the current FSSAI labelling rules.
- **Publishing, committing and deploying** all need your go-ahead. Pushing to `main` deploys production.

## After each post goes live

1. Connect Google Search Console if it isn't already, and request indexing for the new URL.
2. Add the "Suggested inbound links" from existing pages. If you're linking by hand rather than using the template change above, also restore links in earlier posts that now point to this one.
3. Review impressions and average position for the post's primary keyword after 6–8 weeks. Refresh the winter and shopping posts before their seasons, as set out in `B-content-calendar.md`.
