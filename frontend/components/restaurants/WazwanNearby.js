import Link from "next/link";
import styles from "./restaurants.module.css";
import { RESTAURANTS } from "@/data/srinagarRestaurants";
import { DIRECTORY_PATH, restaurantBySlug, restaurantPath } from "@/lib/srinagarRestaurants";

/**
 * Where to eat Wazwan from a destination page: Srinagar itself, and Shalimar Bagh, which has a Wazwan
 * restaurant beside it. Server-rendered under the destination's own content; other destinations get nothing.
 */
const NEARBY = {
  srinagar: {
    title: "Where to eat Wazwan in Srinagar",
    text: `The directory lists ${RESTAURANTS.length} restaurants, hotel restaurants and delivery kitchens in the city that serve Wazwan, from the old names on Residency Road to the waza families' restaurants in Wazpora, each with its sources.`,
    slugs: ["ahdoos", "mughal-darbar-upstairs", "kareema", "jj-foods", "salam-e-wazwan", "firdaus"],
  },
  "shalimar-bagh": {
    title: "Wazwan beside the garden",
    text: "Salam e Wazwan is a first-floor Wazwan restaurant beside Shalimar Bagh, with floor seating and a Wazwan thali on its Google menu.",
    slugs: ["salam-e-wazwan"],
  },
};

export default function WazwanNearby({ destinationSlug }) {
  const block = NEARBY[destinationSlug];
  if (!block) return null;
  return (
    <div className={`${styles.page} ${styles.band}`}>
      <section className={`${styles.container} ${styles.section}`} aria-labelledby="wazwan-nearby">
        <div className={styles.sectionHead}>
          <p className={styles.eyebrow}>Eat here</p>
          <h2 className={styles.h2} id="wazwan-nearby">
            {block.title}
          </h2>
          <p className={styles.text}>{block.text}</p>
        </div>
        <ul className={styles.related}>
          {block.slugs.map((slug) => {
            const place = restaurantBySlug(slug);
            return (
              <li key={slug}>
                <Link href={restaurantPath(slug)} prefetch={false}>
                  <span className={styles.relatedName}>{place.name}</span>
                  <span className={styles.relatedMeta}>{place.area}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <Link href={DIRECTORY_PATH} prefetch={false}>
              <span className={styles.relatedName}>All Wazwan restaurants in Srinagar</span>
              <span className={styles.relatedMeta}>Search by name, neighbourhood or dish</span>
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
