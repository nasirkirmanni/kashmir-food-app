/**
 * Checks on the way in and on the way out.
 *
 * In: is there a question at all, and is it small enough to answer.
 * Out: does the answer state anything specific (a price, a phone number, a time, a rating, a year)
 * that is not in the sources it was given. A model that has been told not to invent still sometimes
 * does; this catches the kinds of invention that do harm, after the fact, so the visitor is told
 * which details could not be checked instead of being left to trust them. A price, a phone number,
 * an opening time or a rating has to be in a source somebody checked: finding it only in the older
 * unchecked notes does not count.
 */
import { fold } from "./text.js";

export const LIMITS = { messageChars: 2000, messages: 40, totalChars: 24_000 };

/** @returns {{ ok: true } | { ok: false, code: string, message: string }} */
export function checkInput(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return { ok: false, code: "empty", message: "Ask me something about Kashmiri food, Wazwan or travelling in Kashmir." };
  const last = messages[messages.length - 1];
  if (last.role !== "user" || !String(last.content || "").trim()) return { ok: false, code: "empty", message: "I didn't catch a question there. What would you like to know?" };
  if (last.content.length > LIMITS.messageChars) return { ok: false, code: "too_long", message: `That message is too long for me (the limit is ${LIMITS.messageChars} characters). Could you shorten it?` };
  if (messages.length > LIMITS.messages || messages.reduce((sum, message) => sum + String(message.content || "").length, 0) > LIMITS.totalChars) {
    return { ok: false, code: "conversation_too_long", message: "This conversation has grown too long for me to follow. Please start a new one." };
  }
  // A message with no letters or digits in it is not a question.
  if (!/[\p{L}\p{N}]/u.test(last.content)) return { ok: false, code: "empty", message: "I didn't catch a question there. What would you like to know?" };
  return { ok: true };
}

const digits = (value) => value.replace(/[^\d]/g, "");
const FRACTIONS = { "½": ".5", "¼": ".25", "¾": ".75", "⅓": ".33", "⅔": ".67" };
// A source marker as models write them: [S2], and also several at once, [S1, S3] or [S1 and S3].
const MARKER = /\[\s*S\d+(?:\s*(?:,|;|&|and)\s*S?\d+)*\s*\]/gi;
/** The source numbers an answer cites, in the order it cites them (with repeats). */
export const markerNumbers = (text) => [...String(text || "").matchAll(MARKER)].flatMap((match) => [...match[0].matchAll(/\d+/g)].map((digits) => Number(digits[0])));

const normal = (text) =>
  fold(text)
    .replace(/[½¼¾⅓⅔]/g, (mark) => FRACTIONS[mark])
    .replace(/(\d),(\d{2,3})/g, "$1$2")
    .replace(/(\d),(\d{2,3})/g, "$1$2")
    .replace(/[‒-―]/g, "-")
    .replace(/\s+/g, " ");

const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// The number stands on its own in the text, not inside a longer one.
const standsAlone = (shown, number) => new RegExp(`(?<![\\d.])${escape(number)}(?![\\d])`).test(shown);
const UNIT_FAMILY = [/^(km|kilomet)/, /^(kg|kilo(?!met))/, /^(metre|meter)/, /^(feet|ft)/];

const CHECKS = [
  // Money: ₹6,200, Rs. 500, INR 430
  { type: "price", checked: true, pattern: /(?:₹|rs\.?|inr)\s?\d[\d.]*(?:\s?(?:lakh|crore|k)\b)?/gi, supported: (value, shown) => standsAlone(shown, value.match(/\d[\d.]*/)[0].replace(/\.$/, "")) },
  // Phone numbers: compared on their last eight digits, however they are spaced
  { type: "phone", checked: true, pattern: /(?:\+?91[\s-]?)?(?:\d[\s-]?){9,11}\d/g, supported: (value, shown) => digits(shown).includes(digits(value).slice(-8)) },
  // Clock times: 9 am, 12:30 pm
  {
    type: "time",
    checked: true,
    pattern: /\b\d{1,2}(?::\d{2})?\s?(?:am|pm|a\.m\.|p\.m\.)(?![a-z])/gi,
    supported: (value, shown) => {
      const time = value.replace(/[\s.]/g, "");
      const flat = shown.replace(/[\s.]/g, "");
      if (flat.includes(time)) return true;
      // "12–10 pm" in a source supports "12 pm": the first hour of a range takes the am or pm written after the second.
      const parts = /^(\d{1,2}(?::\d{2})?)(am|pm)$/.exec(time);
      return Boolean(parts && new RegExp(`(?<!\\d)${parts[1]}(?:-|to)\\d{1,2}(?::\\d{2})?${parts[2]}`).test(flat));
    },
  },
  // Ratings: 4.2/5, 4.5 stars, 4 out of 5
  { type: "rating", checked: true, pattern: /\b\d(?:\.\d)?\s?(?:\/\s?5|out of 5|stars?)\b/gi, supported: (value, shown) => standsAlone(shown, value.match(/\d(?:\.\d)?/)[0]) },
  // Years
  { type: "year", pattern: /\b(?:1[0-9]|20)\d{2}\b/g, supported: (value, shown) => standsAlone(shown, value) },
  // Distances and weights of the kind a travel or price claim leans on
  {
    type: "measure",
    pattern: /\b\d[\d.]*\s?(?:km|kilometres?|kilometers?|kg|kilos?|metres?|meters?|feet|ft)\b/gi,
    supported: (value, shown) => {
      const number = value.match(/\d[\d.]*/)[0].replace(/\.$/, "");
      const unit = value.slice(value.search(/[a-z]/));
      const family = UNIT_FAMILY.find((pattern) => pattern.test(unit));
      return new RegExp(`(?<![\\d.])${escape(number)}\\s?(?:${family ? family.source.replace(/^\^/, "") : escape(unit)})`).test(shown);
    },
  },
];

/**
 * @param {string} answer
 * @param {string | { all: string, checked: string }} grounds  everything the model was shown (the
 *   sources and the conversation); `checked` is the same without the unchecked background notes.
 *   A plain string is taken as both.
 * @returns {{ ok: boolean, unsupported: { type: string, value: string }[] }}
 */
export function verifyAnswer(answer, grounds) {
  const everything = normal(typeof grounds === "string" ? grounds : grounds.all);
  const checkedOnly = typeof grounds === "string" ? everything : normal(grounds.checked);
  const unsupported = [];
  const seen = new Set();
  const claimed = new Set();
  const text = normal(answer).replace(/\[\s*s\d+(?:\s*(?:,|;|&|and)\s*s?\d+)*\s*\]/g, " ");
  for (const check of CHECKS) {
    for (const found of text.matchAll(check.pattern)) {
      const value = found[0].trim();
      // A year inside a phone number, or digits already judged as a price, are not judged twice.
      const span = `${found.index}-${found.index + value.length}`;
      if ([...claimed].some((other) => overlaps(other, span))) continue;
      claimed.add(span);
      if (seen.has(`${check.type}:${value}`)) continue;
      seen.add(`${check.type}:${value}`);
      if (!check.supported(value, check.checked ? checkedOnly : everything)) unsupported.push({ type: check.type, value });
    }
  }
  return { ok: unsupported.length === 0, unsupported };
}

function overlaps(a, b) {
  const [a1, a2] = a.split("-").map(Number);
  const [b1, b2] = b.split("-").map(Number);
  return a1 < b2 && b1 < a2;
}

/** Source markers the answer uses that it was never given, e.g. [S9] when only eight sources exist. */
export function strayMarkers(answer, sourceCount) {
  const stray = new Set();
  for (const n of markerNumbers(answer)) if (n < 1 || n > sourceCount) stray.add(`[S${n}]`);
  return [...stray];
}

/** Which of the given sources the answer actually cites, in order of first use. */
export function citedSources(answer, sources) {
  const order = [];
  for (const n of markerNumbers(answer)) if (n >= 1 && n <= sources.length && !order.includes(n)) order.push(n);
  return order;
}

export function unsupportedNotice(unsupported) {
  const values = unsupported.slice(0, 5).map((item) => item.value);
  return `I couldn't check ${values.length === 1 ? "this detail" : "these details"} against Wazwan Way's pages: ${values.join(", ")}. Please confirm ${values.length === 1 ? "it" : "them"} before relying on ${values.length === 1 ? "it" : "them"}.`;
}
