/**
 * Dates as the content writes them, read without the machine's time zone.
 *
 * "October 15, 2026" passed to `new Date()` is local midnight, so a build running ahead of UTC
 * (Sydney, say) turned it into 2026-10-14 once converted with toISOString. Calendar dates here are
 * read as UTC days instead, so every machine gives the same answer.
 */

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

/** A content date as YYYY-MM-DD, or undefined when it can't be read. */
export function isoDay(value) {
  const date = parseContentDate(value);
  return date ? date.toISOString().slice(0, 10) : undefined;
}
