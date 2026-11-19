import styles from "./dishPage.module.css";
import { WAZA_SERIES } from "@/data/rukhsaarSayeed";

/**
 * Who a recipe, or a variation under it, is based on (data/recipeRevisions.js): the credit, what
 * we changed, and links to each video, the reel where we have it, and her profile. Shown under the
 * recipe on the dish page. The Recipe markup names the video as `isBasedOn` only where the recipe
 * itself is hers.
 */
export default function RecipeSource({ source, variations = [] }) {
  if (!source?.credit) return null;
  // The recipe's own video first, then each variation's.
  const videos = [source.url ? source : null, ...(variations || []).map((variation) => variation.source)].filter(Boolean);
  // One row a link: each video, then its reel where we have confirmed it.
  const links = videos.flatMap((video) => [
    { href: video.url, label: `Watch “${video.title}” on YouTube (${video.publishedLabel})` },
    ...(video.reel ? [{ href: video.reel, label: "The same recipe as an Instagram reel" }] : []),
  ]);
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
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href} rel="noopener">
              {link.label}
            </a>
          </li>
        ))}
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
