import Image from "next/image";
import { PHOTO_CREDITS } from "@/data/photoCredits";
import f from "../feast.module.css";

/**
 * A credited photograph in a circle, or `fallback` (a drawing, or nothing) while data/photoCredits.js has
 * no entry for the slot. The homepage's own photographs come only through here; the one other image in this
 * tree is each dish's photograph in the seven's vessel (FeastSeven.js), the one its dish page shows. Lazy,
 * never priority.
 */
export default function PhotoSlot({ slot, sizes, className = "", fallback = null }) {
  const c = PHOTO_CREDITS.find((credit) => credit.slot === slot);
  if (!c) return fallback;
  return (
    <figure className={`${f.photo} ${className}`}>
      <span className={f.photoFrame}><Image src={c.src} alt={c.alt} fill sizes={sizes} className={f.photoImg} /></span>
      <figcaption className={f.mono}>{[c.subject, c.place, c.month, c.photographer].join(" · ")}</figcaption>
    </figure>
  );
}
