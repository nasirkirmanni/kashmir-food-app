"use client";

import Image from "next/image";
import Link from "next/link";
import Cited from "./Cited";
import DirectoryBrowser from "./DirectoryBrowser";
import { PhotoCredit } from "./Photograph";
import styles from "./restaurants.module.css";
import { RESTAURANT_PHOTOS, SCENES } from "@/data/restaurantPhotos";
import { EVIDENCE, FORMATS, PLACE_TYPES, RESTAURANTS } from "@/data/srinagarRestaurants";
import { DIRECTORY_PATH, directoryCards, namedDishes, neighbourhoods, streets } from "@/lib/srinagarRestaurants";

/**
 * The Restaurants screen of the phone swipe deck (components/MobileSwipeContainer.js), shown when a
 * visitor swipes over from another tab. It is a client-only copy, so it carries no h1 and no
 * structured data of its own; the record behind the list (prices, Wazpora, sources) is a tap away
 * on the full page.
 */
const CARDS = directoryCards();
const AREAS = neighbourhoods().map((area) => ({ name: area.name, count: area.places.length }));
const TYPES = PLACE_TYPES.map(({ id, label }) => ({ id, label }));
const STREETS = streets().map((street) => ({ id: street.id, name: street.name, intro: <Cited text={street.intro} /> }));
const SUGGESTIONS = [...namedDishes(3).map((dish) => dish.words), "trami"];
const PHOTOS = {
  ahdoos: RESTAURANT_PHOTOS.ahdoos[0],
  mughalDarbar: RESTAURANT_PHOTOS["mughal-darbar"][0],
  boulevardRoad: SCENES.boulevardRoad,
  oldCity: SCENES.oldCity,
};

export default function DirectoryScreen() {
  const hero = SCENES.degsOnTheFire;
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroMedia}>
          <Image src={hero.src} alt={hero.alt} fill sizes="100vw" quality={80} />
        </div>
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={`${styles.container} ${styles.heroInner}`}>
          <h2 className={styles.title}>Wazwan restaurants in Srinagar</h2>
          <div className={styles.heroSide}>
            <p className={styles.heroDek}>
              {RESTAURANTS.length} places where the evidence says you can eat Wazwan, each with its address, phone, dishes and dated prices.{" "}
              <Link href={DIRECTORY_PATH} prefetch={false} className={styles.link}>
                Open the full directory
              </Link>
            </p>
            <p className={styles.heroCredit}>
              {hero.caption} <PhotoCredit credit={hero.credit} />
            </p>
          </div>
        </div>
      </div>
      <DirectoryBrowser
        cards={CARDS}
        streets={STREETS}
        photos={PHOTOS}
        types={TYPES}
        formats={FORMATS}
        areas={AREAS}
        evidence={EVIDENCE}
        suggestions={SUGGESTIONS}
        legendHref={`${DIRECTORY_PATH}#how-we-know`}
        wazporaHref={`${DIRECTORY_PATH}#wazpora`}
      />
    </div>
  );
}
