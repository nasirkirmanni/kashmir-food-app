"use client";

import { useCallback, useEffect, useState } from "react";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import { endpoints, request } from "@/lib/api";
import styles from "./restaurants.module.css";

/**
 * Reviews by Wazwan Way members, for the venues that have a database record. Loaded after the page,
 * so the profile's facts never wait on the API; members' ratings stay out of the structured data.
 */
export default function RestaurantReviews({ restaurantId, name }) {
  const [reviews, setReviews] = useState(null);

  const load = useCallback(() => {
    return request(endpoints.restaurant(restaurantId))
      .then((record) => setReviews(Array.isArray(record?.reviews) ? record.reviews : []))
      .catch(() => setReviews([]));
  }, [restaurantId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className={`${styles.container} ${styles.section}`} aria-labelledby="member-reviews">
      <div className={styles.sectionHead}>
        <h2 className={styles.h2} id="member-reviews">
          Reviews from Wazwan Way members
        </h2>
        <p className={styles.text}>What members have written about {name}, separate from the sourced facts above.</p>
      </div>
      <div className={styles.stack}>
        {reviews === null ? <p className={styles.statusText}>Loading reviews…</p> : <ReviewList reviews={reviews} />}
        <ReviewForm restaurantId={restaurantId} onSuccess={load} />
      </div>
    </section>
  );
}
