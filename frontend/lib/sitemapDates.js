/**
 * Last-modified dates for the sitemap.
 *
 * Google uses a sitemap's <lastmod> only while it stays accurate, and counts a change to a page's
 * main content, structured data or links as significant. So each date comes from the content the
 * page shows (the same date its structured data gives, where it gives one) and never from the
 * build. A page with no reliable date gets none.
 */

import { dishNotesFor } from "../data/dishNotes";
import { DIRECTORY_UPDATED } from "../data/srinagarRestaurants";
import { parseContentDate } from "./contentDate";
import { WAZWAN_NEARBY_DESTINATIONS, restaurantsForDish } from "./srinagarRestaurants";

// The last change shared by every dish page: on 12 October 2026 release 1 removed the FAQ
// structured data each one sent for questions it didn't show. Move this date only for a change
// that reaches every dish page; a change to one dish (a corrected text, a new photo) needs a
// date for that dish instead.
export const DISH_PAGES_REVISED = "2026-10-12";

// Parsing lives in lib/contentDate.js so the structured-data builders read dates the same way.
export { parseContentDate };

/** The latest valid date among `values`, as YYYY-MM-DD, or undefined when there is none. */
export function latestContentDate(...values) {
  const times = values.map(parseContentDate).filter(Boolean).map((date) => date.getTime());
  return times.length ? new Date(Math.max(...times)).toISOString().slice(0, 10) : undefined;
}

/**
 * A dish page: its record, its recipe review, its sourced notes, the Srinagar directory if the page
 * lists restaurants from it, or the last change to every dish page.
 */
export function dishLastModified(dish) {
  return latestContentDate(
    dish?.updatedAt,
    dish?.recipe?.reviewedAt,
    dishNotesFor(dish?.slug)?.reviewed,
    restaurantsForDish(dish?.slug).length ? DIRECTORY_UPDATED : undefined,
    DISH_PAGES_REVISED
  );
}

/**
 * A destination page, given its sanitized record: a written profile brings the date it was checked,
 * and a page with a Wazwan block (components/restaurants/WazwanNearby.js) the directory's date.
 */
export function destinationLastModified(destination) {
  return latestContentDate(
    destination?.updatedAt,
    destination?.sourcesChecked,
    WAZWAN_NEARBY_DESTINATIONS.includes(destination?.slug) ? DIRECTORY_UPDATED : undefined
  );
}

/** A guide or blog post: its "updated" date, or its publication date. */
export function articleLastModified(article) {
  return latestContentDate(article?.date, article?.updatedDate);
}
