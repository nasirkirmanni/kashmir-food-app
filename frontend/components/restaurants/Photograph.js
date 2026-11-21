import Image from "next/image";
import styles from "./restaurants.module.css";

/**
 * One photograph (data/restaurantPhotos.js) with its caption and the credit its licence asks for:
 * who took it, where it is published, the licence, and whether we changed it. The frame decides the
 * shape (`frameClassName`); without one the picture keeps its own.
 */
export function PhotoCredit({ credit }) {
  if (credit.permission) {
    return (
      <span className={styles.plateCredit}>
        Photo: {credit.author}. {credit.permission}
      </span>
    );
  }
  return (
    <span className={styles.plateCredit}>
      Photo: {credit.author},{" "}
      <a href={credit.sourceUrl} rel="noopener">
        {credit.source}
      </a>
      ,{" "}
      <a href={credit.licence.url} rel="noopener license">
        {credit.licence.name}
      </a>
      {credit.changes ? `, ${credit.changes}` : ""}.
    </span>
  );
}

export default function Photograph({ photo, sizes = "100vw", priority = false, className = "", frameClassName = "" }) {
  return (
    <figure className={[styles.plate, className].filter(Boolean).join(" ")} data-plate="">
      <div className={[styles.plateFrame, frameClassName].filter(Boolean).join(" ")}>
        <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes={sizes} priority={priority} quality={80} />
      </div>
      <figcaption className={styles.plateCaption}>
        {photo.caption} <PhotoCredit credit={photo.credit} />
      </figcaption>
    </figure>
  );
}
