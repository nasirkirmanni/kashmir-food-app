/**
 * Lays a recipe revision (data/recipeRevisions.js) over a dish's stored recipe.
 *
 * Kept out of lib/dishContent.js on purpose: that file is bundled into the browser (search, the
 * dish page), and the revisions are long. The server applies a revision before it renders a dish
 * (app/dishes/[slug]/page.js), so the browser receives the revised record; the dish page loads
 * this module only if it has to fetch a dish itself.
 */
import { recipeRevisionFor } from "../data/recipeRevisions";

/**
 * What the revision gives replaces the stored recipe's fields; the rest stays. The recipe then
 * carries the date it was revised and the work it is based on (`basedOn`), which the page credits
 * and the Recipe markup names. A dish without a stored recipe, or without a revision, comes back
 * as it was. Applying it twice changes nothing more.
 */
export function applyRecipeRevision(dish) {
  const revision = recipeRevisionFor(dish?.slug);
  if (!revision || !dish.recipe) return dish;
  return { ...dish, recipe: { ...dish.recipe, ...revision.recipe, reviewedAt: revision.revised, basedOn: revision.source } };
}
