import { DishFeature, DishPlate, DishRow } from "./DishParts";
import styles from "./wazwan.module.css";

function ChapterHeader({ chapter, titleId }) {
  const count = chapter.dishes.length;
  return (
    <header className={styles.chapterHeader} data-reveal>
      <span className={styles.chapterNumber} aria-hidden="true">
        {chapter.number}
      </span>
      <div className={styles.chapterHeading}>
        <p className={styles.label}>
          {chapter.kicker}
          <span className={styles.labelDivider} aria-hidden="true" />
          {count} {count === 1 ? "dish" : "dishes"}
        </p>
        <h2 id={titleId} className={styles.chapterTitle}>
          {chapter.title}
        </h2>
      </div>
      <p className={styles.chapterSummary}>{chapter.summary}</p>
    </header>
  );
}

function DishList({ title, dishes }) {
  return (
    <div className={styles.listBlock}>
      {title ? <p className={`${styles.label} ${styles.listTitle}`}>{title}</p> : null}
      <ul className={styles.list}>
        {dishes.map((dish) => (
          <DishRow key={dish.key} dish={dish} />
        ))}
      </ul>
    </div>
  );
}

// Photographed dishes lead each chapter at a size that suits how many there are;
// dishes without a photograph follow as a list, so the page never repeats an
// empty frame.
function ChapterBody({ chapter }) {
  if (chapter.layout === "plates") {
    return (
      <ul className={styles.plates}>
        {chapter.dishes.map((dish) => (
          <DishPlate key={dish.key} dish={dish} />
        ))}
      </ul>
    );
  }

  const photographed = chapter.dishes.filter((dish) => dish.photo?.framed);
  const others = chapter.dishes.filter((dish) => !dish.photo?.framed);
  if (!photographed.length) return <DishList dishes={chapter.dishes} />;

  const asGallery = chapter.layout === "gallery" || photographed.length > 2;
  return (
    <>
      <div className={asGallery ? styles.gallery : styles.pair}>
        {photographed.map((dish, index) => {
          const lead = !asGallery && index === 0;
          return (
            <DishFeature
              key={dish.key}
              dish={dish}
              variant={lead ? "feature" : "portrait"}
              sizes={
                asGallery
                  ? "(min-width: 1024px) 30vw, (min-width: 768px) 46vw, 100vw"
                  : lead
                    ? "(min-width: 768px) 56vw, 100vw"
                    : "(min-width: 1024px) 32vw, (min-width: 768px) 40vw, 100vw"
              }
            />
          );
        })}
      </div>
      {others.length ? <DishList title={chapter.listTitle} dishes={others} /> : null}
    </>
  );
}

export default function Chapter({ chapter }) {
  const titleId = `${chapter.id}-title`;
  const className = chapter.layout === "plates" ? `${styles.chapter} ${styles.chapterBand}` : styles.chapter;
  return (
    <section id={chapter.id} aria-labelledby={titleId} className={className}>
      <div className={styles.container}>
        <ChapterHeader chapter={chapter} titleId={titleId} />
        <ChapterBody chapter={chapter} />
      </div>
    </section>
  );
}
