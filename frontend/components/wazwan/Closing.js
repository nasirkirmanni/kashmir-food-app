import Image from "next/image";
import Link from "next/link";
import DishPhoto from "./DishPhoto";
import { DishMeta } from "./DishParts";
import styles from "./wazwan.module.css";

/** A full-width photograph between chapters. */
export function Interlude({ src, alt, caption, focal = "50% 50%" }) {
  return (
    <figure className={styles.interlude}>
      <div className={styles.interludeMedia}>
        <Image src={src} alt={alt} fill sizes="100vw" className={styles.interludeImage} style={{ objectPosition: focal }} />
      </div>
      <figcaption className={`${styles.container} ${styles.interludeCaption}`}>
        <span className={styles.label}>{caption}</span>
      </figcaption>
    </figure>
  );
}

/** The final chapter: the one dish that always ends the meal. */
export function LastCourse({ chapter }) {
  const [dish] = chapter.dishes;
  const titleId = `${chapter.id}-title`;

  return (
    <section id={chapter.id} aria-labelledby={titleId} className={styles.finale}>
      <div className={`${styles.container} ${styles.finaleGrid}`}>
        <div className={`${styles.finaleMedia} ${styles.hoverable}`} data-reveal>
          <DishPhoto dish={dish} variant="finale" sizes="(min-width: 1024px) 48vw, 100vw" />
        </div>
        <article id={`dish-${dish.slug}`} className={styles.finaleBody} data-reveal>
          <div className={styles.finaleKicker}>
            <span className={styles.finaleNumber} aria-hidden="true">
              {chapter.number}
            </span>
            <p className={styles.label}>{chapter.title}</p>
          </div>
          <h2 id={titleId} className={styles.finaleTitle}>
            {dish.name}
          </h2>
          <p className={styles.finaleLead}>{chapter.summary}</p>
          {dish.essential ? <p className={`${styles.label} ${styles.essential}`}>Essential</p> : null}
          {dish.description ? <p className={styles.featureText}>{dish.description}</p> : null}
          <DishMeta dish={dish} />
          <Link href={dish.href} className={styles.ctaButton}>
            View {dish.name}
            <span className={styles.ctaArrow} aria-hidden="true">
              →
            </span>
          </Link>
        </article>
      </div>
    </section>
  );
}

const NEXT_READS = [
  { href: "/etiquette", kicker: "Etiquette", title: "The 7 unwritten rules", text: "How to eat from the trami." },
  { href: "/kashmiri-food/wazwan/guide", kicker: "Guidebook", title: "Guides to the feast", text: "The dishes, what they cost and how the feast is served." },
  { href: "/kashmiri-food", kicker: "Beyond the Wazwan", title: "All Kashmiri food", text: "Bakery, drinks and street food." },
];

export function Coda() {
  return (
    <section aria-labelledby="coda-title" className={styles.coda}>
      <div className={styles.container}>
        <h2 id="coda-title" className={styles.codaTitle}>
          Continue
        </h2>
        <ul className={styles.codaList}>
          {NEXT_READS.map((item) => (
            <li key={item.href} className={styles.codaItem}>
              <Link href={item.href} className={styles.codaLink}>
                <span className={styles.label}>{item.kicker}</span>
                <span className={styles.codaLinkTitle}>
                  {item.title}
                  <span className={styles.ctaArrow} aria-hidden="true">
                    →
                  </span>
                </span>
                <span className={styles.codaLinkText}>{item.text}</span>
              </Link>
            </li>
          ))}
        </ul>
        <a href="#top" className={styles.backToTop}>
          <span aria-hidden="true">↑</span> Back to top
        </a>
      </div>
    </section>
  );
}
