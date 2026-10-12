/**
 * Last-modified dates for the sitemap.
 *
 * Google uses a sitemap's <lastmod> only while it stays accurate, and counts a change to a page's
 * main content, structured data or links as significant. So each date comes from the content the
 * page shows (the same date its structured data gives, where it gives one) and never from the
 * build. A page with no reliable date gets none.
 */

import { dishNotesFor } from "../data/dishNotes";

// The last change shared by every dish page: on 12 October 2026 release 1 removed the FAQ
// structured data each one sent for questions it didn't show. Move this date only for a change
// that reaches every dish page; a change to one dish (a corrected text, a new photo) needs a
// date for that dish instead.
export const DISH_PAGES_REVISED = "2026-10-12";

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

function utcDay(year, monthIndex, day) {
  if (monthIndex < 0) return undefined;
  const date = new Date(Date.UTC(year, monthIndex, day));
  // Rejects days a month doesn't have, such as 31 September.
  return date.getUTCMonth() === monthIndex && date.getUTCDate() === day ? date : undefined;
}

/**
 * A date as the content writes it: "2026-10-11", "October 12, 2026", "12 October 2026" or a
 * database timestamp. Calendar dates are read as UTC days, so the result doesn't depend on the
 * machine's time zone. Returns undefined for anything else.
 */
export function parseContentDate(value) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  let match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return utcDay(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  match = text.match(/^([A-Za-z]+) (\d{1,2}), (\d{4})$/);
  if (match) return utcDay(Number(match[3]), MONTHS.indexOf(match[1].toLowerCase()), Number(match[2]));
  match = text.match(/^(\d{1,2}) ([A-Za-z]+) (\d{4})$/);
  if (match) return utcDay(Number(match[3]), MONTHS.indexOf(match[2].toLowerCase()), Number(match[1]));
  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
}

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
