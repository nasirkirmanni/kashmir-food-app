import styles from "./dishPage.module.css";
import { WAZA_SERIES } from "@/data/recipeRevisions";

/**
 * Who a rewritten recipe is based on (data/recipeRevisions.js): the credit, what we changed, and
 * links to the video, the reel where we have it, and her profile. Shown under the recipe on the
 * dish page; the Recipe markup names the same work as `isBasedOn`.
 */
export default function RecipeSource({ source }) {
  if (!source?.url) return null;
  return (
    <aside className={styles.recipeSource} aria-labelledby="recipe-source-heading">
      <h3 id="recipe-source-heading" className={styles.eyebrow}>
        Where this recipe comes from
      </h3>
      <p>
        {source.credit} {WAZA_SERIES.author} is the {WAZA_SERIES.about}.
      </p>
      {source.note ? <p>{source.note}</p> : null}
      <ul>
        <li>
          <a href={source.url} rel="noopener">
            Watch “{source.title}” on YouTube ({source.publishedLabel})
          </a>
        </li>
        {source.reel ? (
          <li>
            <a href={source.reel} rel="noopener">
              The same recipe as an Instagram reel
            </a>
          </li>
        ) : null}
        <li>
          <a href={WAZA_SERIES.instagram} rel="noopener">
            {WAZA_SERIES.author} on Instagram, {WAZA_SERIES.instagramHandle}
          </a>
        </li>
        {(source.also || []).map((link) => (
          <li key={link.url}>
            <a href={link.url} rel="noopener">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
