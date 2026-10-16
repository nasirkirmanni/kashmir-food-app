/**
 * Last-modified dates for the sitemap.
 *
 * Google uses a sitemap's <lastmod> only while it stays accurate, and counts a change to a page's
 * main content, structured data or links as significant. So each date comes from the content the
 * page shows (the same date its structured data gives, where it gives one) and never from the
 * build. A page with no reliable date gets none.
 */

import { dishNotesFor } from "../data/dishNotes";
import { parseContentDate } from "./contentDate";

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

/** A dish page: its record, its recipe review, its sourced notes, or the last change to every dish page. */
export function dishLastModified(dish) {
  return latestContentDate(
    dish?.updatedAt,
    dish?.recipe?.reviewedAt,
    dishNotesFor(dish?.slug)?.reviewed,
    DISH_PAGES_REVISED
  );
}

/** A destination page, given its sanitized record: a written profile brings the date it was checked. */
export function destinationLastModified(destination) {
  return latestContentDate(destination?.updatedAt, destination?.sourcesChecked);
}

/** A guide or blog post: its "updated" date, or its publication date. */
export function articleLastModified(article) {
  return latestContentDate(article?.date, article?.updatedDate);
}
