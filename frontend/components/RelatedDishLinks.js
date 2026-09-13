import Link from "next/link";
import dishesData from "@/data/dishes.json";
import { dishSlugsForArticle } from "@/data/relatedReading";

/**
 * "Dishes in this article" — links an article back to the dish pages it is about,
 * using the same hand-checked map that dish pages use to link to the article.
 */
export default function RelatedDishLinks({ articlePath }) {
  const dishes = dishSlugsForArticle(articlePath)
    .map((slug) => dishesData.find((dish) => dish.slug === slug))
    .filter(Boolean);

  if (dishes.length === 0) return null;

  return (
    <aside aria-labelledby="related-dishes-heading" className="border-t border-white/10 pt-8 pb-4">
      <h2 id="related-dishes-heading" className="font-display text-2xl text-white">
        Dishes in this article
      </h2>
      <ul className="mt-4 flex flex-wrap gap-3">
        {dishes.map((dish) => (
          <li key={dish.slug}>
            <Link
              href={`/dishes/${dish.slug}`}
              prefetch={false}
              className="inline-flex rounded-full border border-white/15 px-4 py-2 text-sm text-[var(--saffron)] transition-colors hover:border-[var(--saffron)]"
            >
              {dish.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
