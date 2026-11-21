import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import styles from "./restaurants.module.css";

const count = (n) => n.toLocaleString("en-IN");

/**
 * One place in the directory, as a ruled row: its name, where it is and what the research found on
 * the left; how the Wazwan is served, what it costs, Google's figure and how we know on the right.
 * The whole row opens the profile. A fact the research did not find is not printed as a fact: the
 * row says what is missing once, in one quiet line. On phones the row is cut to what decides a visit:
 * the formats without their detail, the price, Google's figure and the tags; the dishes and the detail
 * are on the profile. Takes a card from lib/srinagarRestaurants.js directoryCards(), so it renders the
 * same on the server and in the browser.
 */
export default function PlaceRow({ card, evidence, heading: Heading = "h3" }) {
  return (
    <li className={styles.row}>
      <div className={styles.rowHead}>
        <Heading className={styles.rowName}>
          <Link href={card.href} prefetch={false} className={styles.rowLink}>
            {card.name}
          </Link>
        </Heading>
        <p className={styles.rowArea}>
          {card.area} · {card.kind}
        </p>
        {card.status ? (
          <div className={styles.rowFlags}>
            <span className={styles.status}>{card.status}</span>
          </div>
        ) : null}
        <p className={styles.rowSummary}>{card.summary}</p>
      </div>
      <dl className={styles.rowFacts}>
        {card.formats.length ? (
          <div>
            <dt>Served</dt>
            <dd>
              <ul className={styles.formats}>
                {card.formats.map((format) => (
                  <li key={format.id}>
                    <span className={styles.formatLabel}>{format.label}</span>
                    {format.value.toLowerCase() === format.label.toLowerCase() ? null : (
                      <span className={styles.formatValue}>: {format.value}</span>
                    )}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
        {card.dishesNamed ? (
          <div className={styles.factWide}>
            <dt>Dishes</dt>
            <dd>{card.dishesNamed}</dd>
          </div>
        ) : null}
        {card.price ? (
          <div>
            <dt>Price</dt>
            <dd>{card.price}</dd>
          </div>
        ) : null}
        {card.google ? (
          <div>
            <dt>Google</dt>
            <dd className={styles.google}>
              <b>{card.google.rating.toFixed(1)}</b> from {count(card.google.reviews)} reviews
            </dd>
          </div>
        ) : null}
        <div>
          <dt>Known from</dt>
          <dd>
            <span className={styles.badges}>
              {card.evidence.map((id) => (
                <span key={id} className={`${styles.badge} ${styles[`ev-${id}`]}`} title={evidence[id].description}>
                  {evidence[id].label}
                </span>
              ))}
            </span>
          </dd>
        </div>
        {card.notFound ? (
          <div className={styles.rowAbsent}>
            <dt className={styles.srOnly}>Not found</dt>
            <dd>{card.notFound}</dd>
          </div>
        ) : null}
      </dl>
      <ArrowUpRight className={styles.rowArrow} aria-hidden="true" />
    </li>
  );
}
