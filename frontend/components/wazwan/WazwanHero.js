import Image from "next/image";
import BackLink from "./BackLink";
import DishPhoto from "./DishPhoto";
import styles from "./wazwan.module.css";

export default function WazwanHero({ total, index }) {
  const photographed = index.reduce((sum, group) => sum + group.dishes.length, 0);

  return (
    <header id="top" className={styles.hero}>
      <div className={styles.heroStage}>
        <div className={styles.heroMedia}>
          <Image
            src="/images/kashmiri-food/hero.webp"
            alt="Men pounding meat by hand with wooden mallets on stone slabs"
            fill
            priority
            sizes="100vw"
            className={styles.heroImage}
          />
          <div className={styles.heroShade} aria-hidden="true" />
          <p className={styles.heroCaption}>Pounding meat by hand</p>
        </div>

        <BackLink className={styles.back} arrowClassName={styles.backArrow} />

        <div className={styles.heroContent}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroTitleBlock}>
              <p className={`${styles.label} ${styles.heroEyebrow}`}>The royal feast of Kashmir</p>
              <h1 className={styles.heroTitle}>
                <span className={styles.heroTitleSmall}>Traditional</span>
                <span className={styles.heroTitleLarge}>Wazwan</span>
              </h1>
            </div>
            <div className={styles.heroAside}>
              <p className={styles.heroDek}>
                Kashmir’s formal feast, traditionally cooked through the night by teams of wazas and shared by
                four diners from a copper trami. Here are its {total} dishes, arranged as the meal unfolds.
              </p>
            </div>
            <dl className={styles.heroFacts}>
              <div>
                <dt>Dishes here</dt>
                <dd>{total}</dd>
              </div>
              <div>
                <dt>Diners per trami</dt>
                <dd>4</dd>
              </div>
              <div>
                <dt>Courses</dt>
                <dd>Up to 36</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {index.length ? (
        <nav aria-label="Photographed dishes, from the trami to the last course" className={styles.index}>
          <div className={styles.container}>
            <div className={styles.indexHead}>
              <p className={styles.label}>From the trami to the last course</p>
              <p className={styles.indexNote}>
                {photographed} of the {total} dishes, photographed in the pot
              </p>
            </div>
            <ol className={styles.indexGroups} style={{ "--ww-count": photographed }}>
              {index.map((group) => (
                <li key={group.id} className={styles.indexGroup} style={{ "--ww-span": group.dishes.length }}>
                  <span className={`${styles.label} ${styles.indexStage}`}>{group.stage}</span>
                  <ol className={styles.indexDishes}>
                    {group.dishes.map((dish) => (
                      <li key={dish.key}>
                        <a href={`#dish-${dish.slug}`} className={`${styles.indexLink} ${styles.hoverable}`}>
                          <DishPhoto dish={dish} variant="index" sizes="(min-width: 768px) 16vw, 42vw" />
                          <span className={styles.indexName}>{dish.name}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </li>
              ))}
            </ol>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
