"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { endpoints, request } from "@/lib/api";
import { withoutRemovedDishes } from "@/lib/removedDishes";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import styles from "@/components/restaurants/restaurants.module.css";

/**
 * A restaurant that exists only as an older database record (Clove, today): one that has not been
 * through the research behind the Srinagar directory. The record's rating, price band, description
 * and picture have no source we can name, so the page prints none of them. It shows the name, where
 * the listing places it, a phone number or hours only if the record holds them, and says plainly
 * that the rest is not verified. Places in the directory render from their research record instead
 * (components/restaurants/RestaurantProfile.js).
 */

const DIRECTORY_PATH = "/restaurants";
const mapsUrl = (query) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
const telHref = (phone) => `tel:${phone.replace(/[^\d+]/g, "")}`;

// Only the name and where the listing places it: nothing unverified goes into structured data.
function listingSchema(restaurant) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    url: `https://wazwanway.com/restaurants/${restaurant.slug || restaurant._id}`,
    address: {
      "@type": "PostalAddress",
      ...(restaurant.location ? { streetAddress: restaurant.location } : {}),
      addressLocality: restaurant.city || "Srinagar",
      addressRegion: "Jammu and Kashmir",
      addressCountry: "IN",
    },
  };
}

function Shell({ children }) {
  return (
    <div className={styles.page}>
      <div className={`${styles.container} ${styles.profileHero}`}>{children}</div>
    </div>
  );
}

export default function RestaurantDetailClient({ initialRestaurant = null, otherRestaurants = [] }) {
  const params = useParams();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(initialRestaurant);
  const [loading, setLoading] = useState(!initialRestaurant);
  const [error, setError] = useState(null);

  const loadRestaurant = () => {
    if (!params.slug) return Promise.resolve();
    if (restaurant && (restaurant.slug === params.slug || restaurant._id === params.slug)) {
      if (params.slug.match(/^[0-9a-fA-F]{24}$/) && restaurant.slug) {
        router.replace(`/restaurants/${restaurant.slug}`);
      }
      return Promise.resolve();
    }
    setLoading(true);
    setError(null);
    return request(endpoints.restaurant(params.slug))
      .then((data) => {
        setRestaurant(data);
        if (params.slug.match(/^[0-9a-fA-F]{24}$/) && data.slug) {
          router.replace(`/restaurants/${data.slug}`);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch restaurant:", err);
        setError("We could not load this restaurant. The connection may have dropped.");
        setRestaurant(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRestaurant();
  }, [params.slug]);

  if (loading) {
    return (
      <Shell>
        <div className={styles.loading} role="status" aria-live="polite">
          <span className={styles.srOnly}>Loading the restaurant</span>
          <span className={`${styles.skeleton} ${styles.skeletonTitle}`} />
          <span className={`${styles.skeleton} ${styles.skeletonLine}`} />
          <span className={`${styles.skeleton} ${styles.skeletonLine}`} />
          <span className={`${styles.skeleton} ${styles.skeletonShort}`} />
        </div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <div className={styles.empty} role="alert">
          <p className={styles.emptyTitle}>{error}</p>
          <p className={styles.emptyText}>Try again, or go to the directory of Srinagar restaurants.</p>
          <div className={styles.emptyActions}>
            <button type="button" className={styles.button} onClick={loadRestaurant}>
              Try again
            </button>
            <Link href={DIRECTORY_PATH} prefetch={false} className={styles.buttonGhost}>
              All restaurants
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  if (!restaurant) {
    return (
      <Shell>
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>We have no restaurant at this address.</p>
          <p className={styles.emptyText}>It may have been renamed or removed. The directory lists every place we have a page for.</p>
          <div className={styles.emptyActions}>
            <Link href={DIRECTORY_PATH} prefetch={false} className={styles.button}>
              All restaurants
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  const where = restaurant.location || restaurant.city || "";
  const dishes = withoutRemovedDishes(restaurant.linkedDishes || []).filter((dish) => dish?.name);
  const mapQuery = restaurant.googleMapsQuery || restaurant.location;

  return (
    <div className={styles.page}>
      <JsonLd data={listingSchema(restaurant)} />

      <div className={`${styles.container} ${styles.profileHero}`}>
        <div className={styles.crumbs}>
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Restaurants", href: DIRECTORY_PATH },
              { name: restaurant.name, href: `/restaurants/${restaurant.slug || params.slug}` },
            ]}
          />
        </div>
      </div>

      <div className={styles.profileGrid}>
        <header className={`${styles.container} ${styles.profileHead}`}>
          <h1 className={styles.profileTitle}>{restaurant.name}</h1>
          <ul className={styles.profileMeta}>
            <li>Restaurant</li>
            {restaurant.city ? <li>{restaurant.city}</li> : null}
          </ul>
          <p className={styles.rowFlags}>
            <span className={styles.status}>Not re-checked</span>
          </p>
          <p className={styles.lede}>
            This page comes from an earlier version of Wazwan Way. {restaurant.name} has not been through the research behind our Srinagar
            directory, so we show only what the old listing gives as its name and location.
          </p>
          <div className={styles.actions}>
            {mapQuery ? (
              <a className={styles.button} href={mapsUrl(mapQuery)} target="_blank" rel="noopener noreferrer">
                <MapPin aria-hidden="true" /> Open in Google Maps
              </a>
            ) : null}
            <Link href={DIRECTORY_PATH} prefetch={false} className={styles.buttonGhost}>
              The sourced directory
            </Link>
          </div>
        </header>

        <div className={styles.profileSide}>
          <aside className={`${styles.container} ${styles.aside}`} aria-label={`${restaurant.name} at a glance`}>
            <dl className={styles.keyFacts}>
              <div>
                <dt>Listed at</dt>
                <dd>{where || <span className={styles.notVerified}>Not verified</span>}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  {restaurant.phoneNumber ? (
                    <a href={telHref(restaurant.phoneNumber)}>{restaurant.phoneNumber}</a>
                  ) : (
                    <span className={styles.notVerified}>Not verified</span>
                  )}
                  {restaurant.phoneNumber ? <span className={styles.small}>From the old listing, not re-checked</span> : null}
                </dd>
              </div>
              <div>
                <dt>Hours</dt>
                <dd>
                  {restaurant.openingHours || <span className={styles.notVerified}>Not verified</span>}
                  {restaurant.openingHours ? <span className={styles.small}>From the old listing, not re-checked</span> : null}
                </dd>
              </div>
              <div>
                <dt>Price</dt>
                <dd>
                  <span className={styles.notVerified}>Not verified</span>
                </dd>
              </div>
              <div>
                <dt>Checked</dt>
                <dd>
                  <span className={styles.notVerified}>Not re-checked</span>
                </dd>
              </div>
            </dl>
          </aside>
        </div>

        <div className={`${styles.container} ${styles.profileMain}`}>
        <section className={styles.section} aria-labelledby="not-verified">
          <div className={styles.sectionHead}>
            <h2 className={styles.h2} id="not-verified">
              What this page leaves out
            </h2>
            <p className={styles.text}>
              The old listing carried a rating, a price band, a description and a picture. None of them has a source we can name, so none is
              printed here. Nobody from Wazwan Way has phoned or visited {restaurant.name}.
            </p>
            <p className={styles.text}>
              If you run {restaurant.name}, you can{" "}
              <Link href="/list-restaurant" prefetch={false}>
                send us its details and photographs
              </Link>
              , and we will check them and build a full page.
            </p>
          </div>
        </section>

        {dishes.length ? (
          <section className={styles.section} aria-labelledby="listed-dishes">
            <div className={styles.sectionHead}>
              <h2 className={styles.h2} id="listed-dishes">
                Dishes the old listing named
              </h2>
              <p className={styles.text}>Not re-checked. Each links to the dish&apos;s own page.</p>
            </div>
            <ul className={styles.dishLinks}>
              {dishes.map((dish) => (
                <li key={dish._id || dish.slug || dish.name}>
                  {dish.slug ? (
                    <Link href={`/dishes/${dish.slug}`} prefetch={false} className={styles.dishLink}>
                      <span className={styles.dishName}>{dish.name}</span>
                    </Link>
                  ) : (
                    <span className={styles.dishLink}>
                      <span className={styles.dishName}>{dish.name}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        </div>
      </div>

      <section className={styles.closing} aria-labelledby="more-restaurants-title">
        <div className={`${styles.container} ${styles.closingInner}`}>
          <h2 className={styles.h2} id="more-restaurants-title">
            Restaurants we have checked
          </h2>
          <ul className={styles.related}>
            <li>
              <Link href={DIRECTORY_PATH} prefetch={false}>
                <span className={styles.relatedName}>Wazwan restaurants in Srinagar</span>
                <span className={styles.relatedMeta}>The directory, street by street, every fact sourced</span>
              </Link>
            </li>
            {otherRestaurants.map((other) => (
              <li key={other.slug}>
                <Link href={`/restaurants/${other.slug}`} prefetch={false}>
                  <span className={styles.relatedName}>{other.name}</span>
                  {other.city ? <span className={styles.relatedMeta}>{other.city}</span> : null}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/restaurants/best-wazwan-srinagar" prefetch={false}>
                <span className={styles.relatedName}>Where to eat Kashmiri food in Srinagar</span>
                <span className={styles.relatedMeta}>Bakeries, tea rooms and street food too</span>
              </Link>
            </li>
            <li>
              <Link href="/dishes" prefetch={false}>
                <span className={styles.relatedName}>Every Wazwan dish</span>
                <span className={styles.relatedMeta}>What each one is, and how it&apos;s made</span>
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
