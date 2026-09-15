import Link from "next/link";
import DishPhoto from "./DishPhoto";
import styles from "./wazwan.module.css";

/** Diet, spice and price, as a labelled grid or a single inline line. */
export function DishMeta({ dish, inline = false }) {
  const items = [];
  if (dish.diet) items.push({ term: "Diet", value: dish.diet, hideTerm: inline });
  if (dish.spice) items.push({ term: "Spice", value: dish.spice });
  for (const price of dish.prices) {
    items.push({ term: price.label || "Price", value: price.amount, hideTerm: inline && !price.label });
  }
  if (!items.length) return null;

  return (
    <dl className={inline ? styles.metaInline : styles.meta}>
      {items.map((item) => (
        <div key={`${item.term}-${item.value}`}>
          <dt className={item.hideTerm ? "sr-only" : undefined}>{item.term}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The dish's one link, stretched over its whole entry. */
export function DishLink({ dish }) {
  return (
    <Link href={dish.href} className={`${styles.cta} ${styles.stretched}`}>
      <span className={styles.ctaLabel}>View dish</span>
      <span className="sr-only">: {dish.name}</span>
      <span className={styles.ctaArrow} aria-hidden="true">
        →
      </span>
    </Link>
  );
}

function EssentialMark({ className = "" }) {
  return <p className={`${styles.label} ${styles.essential} ${className}`}>Essential</p>;
}

/** A photographed dish, given room: image first, then the text. */
export function DishFeature({ dish, variant = "feature", sizes }) {
  return (
    <article id={`dish-${dish.slug}`} className={`${styles.feature} ${styles.hoverable}`} data-reveal>
      <DishPhoto dish={dish} variant={variant} sizes={sizes} />
      <div className={styles.featureBody}>
        {dish.essential ? <EssentialMark /> : null}
        <h3 className={styles.featureName}>{dish.name}</h3>
        {dish.description ? <p className={styles.featureText}>{dish.description}</p> : null}
        <DishMeta dish={dish} />
        <DishLink dish={dish} />
      </div>
    </article>
  );
}

/** A compact entry for the chapter's list. */
export function DishRow({ dish }) {
  return (
    <li id={`dish-${dish.slug}`} className={`${styles.row} ${styles.hoverable}`} data-reveal>
      <DishPhoto dish={dish} variant="thumb" sizes="96px" />
      <div className={styles.rowBody}>
        {dish.essential ? <EssentialMark className={styles.rowEssential} /> : null}
        <h3 className={styles.rowName}>{dish.name}</h3>
        {dish.description ? <p className={styles.rowText}>{dish.description}</p> : null}
        <DishMeta dish={dish} inline />
        <DishLink dish={dish} />
      </div>
    </li>
  );
}

/** A plate in an evenly spaced row, for a calmer chapter. */
export function DishPlate({ dish }) {
  return (
    <li id={`dish-${dish.slug}`} className={`${styles.plateCard} ${styles.hoverable}`} data-reveal>
      <DishPhoto
        dish={dish}
        variant="plate"
        sizes="(min-width: 1024px) 22vw, (min-width: 420px) 45vw, 90vw"
      />
      <div className={styles.plateBody}>
        {dish.essential ? <EssentialMark className={styles.rowEssential} /> : null}
        <h3 className={styles.plateName}>{dish.name}</h3>
        {dish.description ? <p className={styles.rowText}>{dish.description}</p> : null}
        <DishMeta dish={dish} inline />
        <DishLink dish={dish} />
      </div>
    </li>
  );
}
