import Link from "next/link";
import Arrow from "./Arrow";
import f from "../feast.module.css";

/**
 * An internal link with its label and the arrow, at least 44px tall. `srContext` adds words for screen
 * readers after the visible label ("The dish, Tabak maaz"). Never prefetched: the page has some 55 links.
 */
export default function ArrowLink({ href, className = "", srContext, children }) {
  return (
    <Link href={href} prefetch={false} className={`${f.arrowLink} ${className}`}>
      <span>{children}</span>
      {srContext ? <span className="sr-only">, {srContext}</span> : null}
      <Arrow className={f.arrow} />
    </Link>
  );
}
