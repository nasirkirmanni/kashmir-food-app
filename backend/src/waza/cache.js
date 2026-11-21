/**
 * A small answer cache. The same first question arrives again and again (the suggested chips, the
 * prompts on the dish pages), and an answer built from the same index version is as good the second
 * time, so it is kept for a few hours and replayed at once. Only complete, clean answers to
 * single-message questions are kept; nothing that names a visitor's own conversation.
 */
import { createHash } from "node:crypto";
import { phraseKey } from "./text.js";

export function createCache({ ttlMs, max, enabled = true }, now = Date.now) {
  const entries = new Map();
  let hits = 0;
  let misses = 0;
  return {
    key({ question, mode, dish, version }) {
      return createHash("sha1").update(`${version}|${mode || "chat"}|${dish || ""}|${phraseKey(question)}`).digest("hex");
    },
    get(key) {
      if (!enabled) return undefined;
      const entry = entries.get(key);
      if (!entry || now() - entry.at > ttlMs) {
        if (entry) entries.delete(key);
        misses++;
        return undefined;
      }
      // Most recently used goes to the back, so the front is what to drop first.
      entries.delete(key);
      entries.set(key, entry);
      hits++;
      return entry.value;
    },
    set(key, value) {
      if (!enabled) return;
      entries.delete(key);
      entries.set(key, { at: now(), value });
      while (entries.size > max) entries.delete(entries.keys().next().value);
    },
    stats: () => ({ size: entries.size, hits, misses }),
    clear: () => entries.clear(),
  };
}
