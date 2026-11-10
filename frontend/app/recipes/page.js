import Link from "next/link";
import dishesData from "@/data/dishes.json";
import JsonLd, { buildBreadcrumbSchema, buildSlugItemListSchema } from "@/components/JsonLd";
import RecipeBrowser from "@/components/recipes/RecipeBrowser";
import { buildRecipeIndex } from "@/lib/recipeIndex";
import styles from "./recipes.module.css";

/**
 * /recipes: every written recipe on the site as a cookbook index — on paper, in the site's Bodoni
 * and Inter, with the Wazwan dishes in serving order and the rest of the Kashmiri kitchen after
 * them. Each card carries the figures its recipe gives (prep, cook, serves, level) and opens the
 * recipe on the dish's own page. The list is rendered here on the server; the search box and
 * chips are the one client island (components/recipes/RecipeBrowser.js).
 */

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://kashmir-food-app-api.onrender.com").replace(/\/+$/, "");
const CANONICAL = "https://wazwanway.com/recipes";

// Regenerated at most hourly, so a recipe edited in the catalogue reaches the page without a redeploy.
export const revalidate = 3600;

async function fetchJson(path, timeout) {
  const res = await fetch(`${API_BASE}${path}`, { next: { revalidate }, signal: AbortSignal.timeout(timeout) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** The live catalogue, or the committed dishes.json snapshot when the API can't be reached. */
async function loadCatalogue() {
  try {
    const records = await fetchJson("/api/dishes", 20_000);
    if (!Array.isArray(records) || records.length === 0) throw new Error("empty response");
    return { dishes: records, live: true };
  } catch (err) {
    console.error(`[recipes] /api/dishes unavailable (${err.message}); using dishes.json`);
    return { dishes: dishesData, live: false };
  }
}

/**
 * Each dish's full record, for the timings the list leaves out. Six at a time; a miss leaves that
 * card on the dated snapshot (data/recipeMeta.json), so a slow backend never blanks a figure.
 */
async function loadDetails(dishes) {
  const queue = dishes.filter((dish) => dish?.slug).map((dish) => dish.slug);
  const details = {};
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      for (let slug = queue.shift(); slug; slug = queue.shift()) {
        try {
          details[slug] = await fetchJson(`/api/dishes/${slug}`, 8_000);
        } catch {
          // The snapshot's figures stand in for this card.
        }
      }
    })
  );
  return details;
}

async function loadIndex() {
  const { dishes, live } = await loadCatalogue();
  return buildRecipeIndex(dishes, live ? await loadDetails(dishes) : {});
}

export async function generateMetadata() {
  const { count } = await loadIndex();
  const title = `${count} Kashmiri Recipes, Written Step by Step`;
  const description = `${count} Kashmiri recipes with ingredients, steps and timings: the Wazwan dishes in serving order, then breads, street food, desserts and drinks.`;
  return {
    title,
    description,
    alternates: { canonical: CANONICAL },
    openGraph: {
      title,
      description,
      url: CANONICAL,
      images: [{ url: "/wazwan-hero.jpg", width: 1024, height: 1024, alt: "A traditional Kashmiri Wazwan" }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/wazwan-hero.jpg"] },
  };
}

export default async function RecipesPage() {
  const index = await loadIndex();
  const wazwanCount = index.sections.find((section) => section.key === "wazwan")?.cards.length || 0;
  const slugs = index.sections.flatMap((section) => section.cards.map((card) => card.slug));

  return (
    <div className={styles.page}>
      <span className={styles.barUnder} aria-hidden="true" />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", url: "https://wazwanway.com" },
          { name: "Recipes", url: CANONICAL },
        ])}
      />
      <JsonLd data={buildSlugItemListSchema("/dishes", slugs, "Kashmiri recipes on Wazwan Way")} />

      <header className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Recipes</p>
          <h1 className={styles.title}>Kashmiri recipes, written step by step</h1>
          <p className={styles.lede}>
            Every recipe on Wazwan Way, with its ingredients, steps and timings: the Wazwan dishes in the order
            they reach the trami, then the breads, street food, desserts and drinks of the Kashmiri kitchen.
          </p>
          <dl className={styles.facts}>
            <div className={styles.fact}>
              <dt>Recipes</dt>
              <dd>{index.count}</dd>
            </div>
            <div className={styles.fact}>
              <dt>From the Wazwan</dt>
              <dd>{wazwanCount}</dd>
            </div>
            <div className={styles.fact}>
              <dt>On each card</dt>
              <dd className={styles.factText}>Prep time, serves, level</dd>
            </div>
          </dl>
        </div>
      </header>

      <RecipeBrowser index={index} />

      <section className={styles.closing} aria-labelledby="recipes-closing">
        <div className={styles.container}>
          <h2 id="recipes-closing" className={styles.closingTitle}>
            Not finding a dish?
          </h2>
          <p className={styles.closingText}>
            Waza, the site&rsquo;s AI cook, answers questions about Kashmiri dishes, and the Wazwan page sets the
            feast out course by course.
          </p>
          <div className={styles.closingLinks}>
            <Link href="/waza-ai" className={styles.button}>
              Ask Waza
            </Link>
            <Link href="/dishes" className={styles.buttonGhost}>
              The Wazwan, course by course
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
