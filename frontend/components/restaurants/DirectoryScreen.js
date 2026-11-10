"use client";

import Link from "next/link";
import DirectoryBrowser from "./DirectoryBrowser";
import styles from "./restaurants.module.css";
import { EVIDENCE, FORMATS, PLACE_TYPES, RESTAURANTS } from "@/data/srinagarRestaurants";
import { CHECKED_LABEL, DIRECTORY_PATH, directoryCards, neighbourhoods } from "@/lib/srinagarRestaurants";

/**
 * The Restaurants screen of the phone swipe deck (components/MobileSwipeContainer.js), shown when a
 * visitor swipes over from another tab. It is a client-only copy, so it carries no h1 and no
 * structured data of its own; the full directory, with prices, neighbourhoods and sources, is a tap away.
 */
const CARDS = directoryCards();
const AREAS = neighbourhoods().map((area) => ({ name: area.name, count: area.places.length }));
const TYPES = PLACE_TYPES.map(({ id, label }) => ({ id, label }));

export default function DirectoryScreen() {
  return (
    <div className={styles.page}>
      <div className={`${styles.container} ${styles.hero}`}>
        <p className={styles.eyebrow}>Srinagar · checked {CHECKED_LABEL}</p>
        <h2 className={styles.title}>Wazwan restaurants in Srinagar</h2>
        <p className={styles.lede}>
          {RESTAURANTS.length} places where the evidence says you can eat Wazwan, each with its address, phone, dishes and dated
          prices.{" "}
          <Link href={DIRECTORY_PATH} prefetch={false} className={styles.link}>
            Open the full directory
          </Link>
        </p>
      </div>
      <DirectoryBrowser cards={CARDS} types={TYPES} formats={FORMATS} areas={AREAS} evidence={EVIDENCE} />
    </div>
  );
}
