import { Fragment } from "react";
import Link from "next/link";
import { citedParts } from "@/lib/srinagarRestaurants";
import styles from "./restaurants.module.css";

/** Research text with its [[citations]] turned into links to the sources, inline where they stand. */
export default function Cited({ text, place = null }) {
  return citedParts(text, place).map((part, i) =>
    part.link ? (
      <Link key={i} href={part.link.href} prefetch={false} className={styles.link}>
        {part.link.text}
      </Link>
    ) : part.cite ? (
      <a key={i} href={part.cite.url} className={styles.cite} target="_blank" rel="noopener noreferrer">
        {part.cite.label}
      </a>
    ) : (
      <Fragment key={i}>{part.text}</Fragment>
    )
  );
}
