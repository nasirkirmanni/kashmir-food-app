import styles from "./dishPage.module.css";

/**
 * A line for the cook under a recipe (data/recipeRevisions.js, data/addedDishes.js): what kind of
 * version it is, or something about its quantities. It never says where a recipe came from; see the
 * note at the top of data/recipeRevisions.js.
 */
export default function RecipeNote({ note }) {
  if (!note) return null;
  return (
    <aside className={styles.recipeNote} aria-labelledby="recipe-note-heading">
      <h3 id="recipe-note-heading" className={styles.eyebrow}>
        About this recipe
      </h3>
      <p>{note}</p>
    </aside>
  );
}
