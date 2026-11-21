/**
 * Waza AI's knowledge: the index built from the site's content (frontend/lib/wazaKnowledge.js,
 * written to ../Knowledge/waza-index.json) and the search over it.
 *
 * Search is BM25 over each chunk's title and text, using the same tokeniser the builder used
 * (./text.js), plus recognition of the dishes, restaurants and places a question names. The corpus
 * is about a thousand chunks, so everything is held in memory and a search takes a few
 * milliseconds; no database or outside service is involved, which is why retrieval cannot fail at
 * request time.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tokenize, words } from "./text.js";

// Words that carry a question's grammar, not its subject; ignored when comparing it with a title.
const TITLE_FILLER = new Set(["i", "me", "my", "we", "you", "your", "the", "a", "an", "to", "do", "doe", "did", "can", "could", "should", "would", "will", "pleas", "is", "are", "was", "it", "of", "for", "and"]);
const K1 = 1.4;
const B = 0.72;
const TITLE_WEIGHT = 3;
export const DEFAULT_INDEX_PATH = fileURLToPath(new URL("../Knowledge/waza-index.json", import.meta.url));

export function loadIndex(path = DEFAULT_INDEX_PATH) {
  const index = JSON.parse(readFileSync(path, "utf8"));
  if (!index?.meta || !Array.isArray(index.chunks) || !Array.isArray(index.entities)) throw new Error("Waza knowledge index is malformed");
  if (index.meta.format !== 1) throw new Error(`Waza knowledge index format ${index.meta.format} is not supported`);
  return index;
}

export function createKnowledge(index) {
  const chunks = index.chunks;
  const byId = new Map(chunks.map((chunk, i) => [chunk.id, i]));
  const entities = new Map(index.entities.map((entity) => [entity.id, entity]));

  // ── BM25 postings
  const postings = new Map(); // term -> [docIndex, weightedTf][]
  const lengths = new Float64Array(chunks.length);
  chunks.forEach((chunk, doc) => {
    const tf = new Map();
    for (const token of tokenize(chunk.title)) tf.set(token, (tf.get(token) || 0) + TITLE_WEIGHT);
    for (const token of tokenize(chunk.text)) tf.set(token, (tf.get(token) || 0) + 1);
    let length = 0;
    for (const [term, count] of tf) {
      length += count;
      if (!postings.has(term)) postings.set(term, []);
      postings.get(term).push([doc, count]);
    }
    lengths[doc] = length;
  });
  const averageLength = lengths.reduce((sum, n) => sum + n, 0) / Math.max(1, chunks.length);
  // Each chunk's title as a set of words, to recognise a question that is nearly the title itself
  // ("What is Wazwan?" and the FAQ entry of that name).
  const contentWords = (text) => new Set(words(text).filter((word) => !TITLE_FILLER.has(word)));
  const titleWords = chunks.map((chunk) => [...new Set([chunk.title, ...chunk.title.split(": ")])].map(contentWords).filter((set) => set.size >= 2));
  const idf = (term) => {
    const df = postings.get(term)?.length || 0;
    return Math.log(1 + (chunks.length - df + 0.5) / (df + 0.5));
  };

  // ── entities named in a text
  const phraseStarts = new Map(); // first word -> [{ tokens, entity }]
  for (const entity of index.entities) {
    for (const phrase of entity.phrases || []) {
      const tokens = phrase.split(" ");
      if (!phraseStarts.has(tokens[0])) phraseStarts.set(tokens[0], []);
      phraseStarts.get(tokens[0]).push({ tokens, entity });
    }
  }
  for (const list of phraseStarts.values()) list.sort((a, b) => b.tokens.length - a.tokens.length);
  const chunksByEntity = new Map();
  chunks.forEach((chunk, doc) => {
    for (const id of chunk.ent || []) {
      if (!chunksByEntity.has(id)) chunksByEntity.set(id, []);
      chunksByEntity.get(id).push(doc);
    }
  });

  // A strict entity's own name, as a phrase. Its other names ("Chinar restaurant", "LaLiT Grand
  // Palace") are distinctive as they stand and need no capitals.
  const ownPhrase = new Map(index.entities.filter((entity) => entity.strict).map((entity) => [entity.id, words(entity.name).join(" ")]));

  /**
   * The dishes, restaurants and places a text names, longest name first, each once, in order of
   * appearance. A "strict" name (one that is also an everyday phrase, such as the restaurants called
   * Authentic Wazwan and The Chinar) counts only when the text writes it as a name, with capitals,
   * and never when the next word shows the everyday meaning ("the Chinar tree").
   */
  function findEntities(text) {
    const tokens = words(text);
    const found = [];
    const seen = new Set();
    for (let i = 0; i < tokens.length; i++) {
      const candidates = phraseStarts.get(tokens[i]);
      if (!candidates) continue;
      for (const { tokens: phrase, entity } of candidates) {
        if (!phrase.every((token, j) => tokens[i + j] === token)) continue;
        if (entity.strict && phrase.join(" ") === ownPhrase.get(entity.id) && !writtenAsName(text, entity.name)) continue;
        if (entity.notBefore?.includes(tokens[i + phrase.length])) continue;
        if (!seen.has(entity.id)) {
          seen.add(entity.id);
          found.push(entity);
        }
        i += phrase.length - 1;
        break;
      }
    }
    return found;
  }

  // ── articles named by their title ("Tell me more about Rista vs Gushtaba: The Twin Meatballs …")
  const pageTitles = [];
  for (const chunk of chunks) {
    const head = /^((?:guide|story):[^#]+)#(?:summary|opening)$/.exec(chunk.id);
    if (!head || !chunk.page) continue;
    let page = pageTitles.find((entry) => entry.prefix === head[1]);
    if (!page) {
      // The whole title, and the part before a colon when that is a name in itself.
      const titles = [chunk.page, chunk.page.split(/[:–—]/)[0]].map((title) => words(title)).filter((tokens) => tokens.length >= 3);
      if (!titles.length) continue;
      page = { prefix: head[1], titles, chunks: [] };
      pageTitles.push(page);
    }
    page.chunks.push(chunk);
  }
  /** The articles a text names by title: their opening passages, summary first. */
  function findPages(text) {
    const tokens = words(text);
    const found = [];
    for (const page of pageTitles) {
      const named = page.titles.some((title) => tokens.some((_, i) => title.every((token, j) => tokens[i + j] === token)));
      if (named) found.push(...[...page.chunks].sort((a, b) => Number(b.id.endsWith("#summary")) - Number(a.id.endsWith("#summary"))));
    }
    return found;
  }

  /**
   * @param {{ terms: Map<string, number>, entityIds?: string[], typeWeights?: Record<string, number>, tierWeights?: Record<string, number>, limit?: number }} query
   * @returns {{ chunk: object, score: number, doc: number }[]} best first
   */
  function search({ terms, entityIds = [], typeWeights = {}, tierWeights = {}, limit = 30, question = "" }) {
    const scores = new Map();
    for (const [term, weight] of terms) {
      const list = postings.get(term);
      if (!list) continue;
      const termIdf = idf(term);
      for (const [doc, tf] of list) {
        const norm = tf + K1 * (1 - B + (B * lengths[doc]) / averageLength);
        scores.set(doc, (scores.get(doc) || 0) + weight * termIdf * ((tf * (K1 + 1)) / norm));
      }
    }
    let top = 0;
    for (const value of scores.values()) if (value > top) top = value;
    const base = top || 1;
    // A chunk whose title is the question, give or take a word, almost certainly answers it.
    const asked = contentWords(question);
    if (asked.size >= 2) {
      for (const doc of scores.keys()) {
        let overlap = 0;
        for (const title of titleWords[doc]) {
          let shared = 0;
          for (const word of asked) if (title.has(word)) shared++;
          overlap = Math.max(overlap, shared / (asked.size + title.size - shared));
        }
        if (overlap >= 0.6) scores.set(doc, scores.get(doc) + base * (overlap >= 0.85 ? 0.9 : 0.4));
      }
    }
    // A chunk about a dish, restaurant or place the question names is lifted; its own page most of all.
    for (const id of entityIds) {
      for (const doc of chunksByEntity.get(id) || []) {
        const own = chunks[doc].ent?.[0] === id;
        scores.set(doc, (scores.get(doc) || 0) + base * (own ? 0.55 : 0.12));
      }
    }
    const ranked = [];
    for (const [doc, raw] of scores) {
      const chunk = chunks[doc];
      const score = raw * (typeWeights[chunk.type] ?? 1) * (tierWeights[chunk.tier] ?? 1);
      if (score > 0) ranked.push({ chunk, score, doc });
    }
    ranked.sort((a, b) => b.score - a.score || a.doc - b.doc);
    return ranked.slice(0, limit);
  }

  /** How much of a question the corpus can speak to: the share of its (idf-weighted) terms found at all. */
  function vocabulary(termList) {
    const unknown = [];
    let known = 0;
    let total = 0;
    for (const term of new Set(termList)) {
      const weight = Math.max(0.5, idf(term));
      total += weight;
      if (postings.has(term)) known += weight;
      else unknown.push(term);
    }
    return { share: total ? known / total : 0, unknown };
  }

  return {
    meta: index.meta,
    size: chunks.length,
    chunk: (id) => (byId.has(id) ? chunks[byId.get(id)] : undefined),
    entity: (id) => entities.get(id),
    entities: () => [...entities.values()],
    chunksFor: (entityId) => (chunksByEntity.get(entityId) || []).map((doc) => chunks[doc]),
    findEntities,
    findPages,
    search,
    vocabulary,
    idf,
    has: (term) => postings.has(term),
  };
}

function writtenAsName(text, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  return new RegExp(`(^|[^A-Za-z])${escaped}([^A-Za-z]|$)`).test(text);
}

let shared = null;
/** The knowledge loaded once for the process. */
export function knowledge() {
  if (!shared) shared = createKnowledge(loadIndex());
  return shared;
}
