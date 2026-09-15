import Image from "next/image";
import styles from "./wazwan.module.css";

/**
 * A dish photograph, or where the catalogue has none, the empty vessel: engraved
 * rings with the dish's name, so a missing photo reads as part of the page rather
 * than a broken image or a stock icon.
 */
export default function DishPhoto({ dish, sizes, priority = false, variant = "feature", className = "" }) {
  const frameClass = [styles.frame, styles[`frame_${variant}`], className].filter(Boolean).join(" ");

  if (!dish.photo) {
    return (
      <div className={`${frameClass} ${styles.vessel}`} role="img" aria-label={`${dish.name}, not yet photographed`}>
        <svg className={styles.vesselRings} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
          <circle cx="100" cy="100" r="97" className={styles.ringFaint} />
          <circle cx="100" cy="100" r="86" />
          <circle cx="100" cy="100" r="73" className={styles.ringDash} />
          <circle cx="100" cy="100" r="46" className={styles.ringFaint} />
        </svg>
        {variant === "thumb" ? (
          <span className={styles.vesselInitial} aria-hidden="true">
            {dish.name.charAt(0)}
          </span>
        ) : (
          <>
            <span className={`${styles.vesselInitial} ${styles.vesselInitialAlt}`} aria-hidden="true">
              {dish.name.charAt(0)}
            </span>
            <span className={styles.vesselName} aria-hidden="true">
              {dish.name}
            </span>
            <span className={styles.vesselNote} aria-hidden="true">
              Not yet photographed
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={frameClass}>
      <Image
        src={dish.photo.src}
        alt={dish.photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={dish.photo.framed ? `${styles.photoImg} ${styles.photoFramed}` : styles.photoImg}
        style={{ objectPosition: dish.photo.focal }}
      />
    </div>
  );
}
