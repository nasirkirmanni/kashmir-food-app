/**
 * Two or three questions a visitor might ask next, worked out from what was just asked. Built from
 * the site's own records, so a suggestion never names a dish or a place the site cannot answer about.
 */

// Dishes people ask about together.
const PAIRS = {
  rista: "gushtaba",
  gushtaba: "rista",
  "rogan-josh": "marchwangan-korma",
  "marchwangan-korma": "rogan-josh",
  yakhni: "aab-gosht",
  "aab-gosht": "yakhni",
  "tabak-maaz": "kabargah",
  kabargah: "tabak-maaz",
  "kashmiri-kahwa": "noon-chai",
  "noon-chai": "kashmiri-kahwa",
  "daniwal-korma": "rogan-josh",
  girda: "lavas",
  lavas: "girda",
};

const GENERAL = ["Which seven dishes are essential to a Wazwan?", "Where can I eat Wazwan in Srinagar?", "What should I eat in Kashmir in winter?", "How is a Wazwan served?"];

const same = (a, b) => a.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() === b.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/**
 * @param {{ intent: string, entities: object[], question: string, kb: object, asked?: string[] }} input
 * @returns {string[]} at most three
 */
export function suggest({ intent, entities = [], question, kb, asked = [] }) {
  const dish = entities.find((entity) => entity.kind === "dish");
  const place = entities.find((entity) => entity.kind === "restaurant" || entity.kind === "restaurant-topic");
  const destination = entities.find((entity) => entity.kind === "destination");
  const out = [];
  if (dish) {
    const slug = dish.id.split(":")[1];
    const pair = PAIRS[slug] && kb.entity(`dish:${PAIRS[slug]}`);
    if (intent !== "recipe" && dish.card?.hasRecipe) out.push(`How do I make ${dish.name}?`);
    if (intent === "recipe") out.push(`What is ${dish.name} served with?`);
    if (pair && intent !== "comparison") out.push(`How is ${dish.name} different from ${pair.name}?`);
    if (dish.card?.category === "Wazwan") out.push(`Where does ${dish.name} come in the Wazwan?`);
    out.push(`Where can I eat ${dish.name} in Srinagar?`);
  } else if (place) {
    out.push(`What do the sources say ${place.name} serves?`, "How much does a Wazwan cost in Srinagar?", "Which other restaurants in Srinagar serve Wazwan?");
  } else if (intent === "restaurant") {
    out.push("Which restaurant sells a full trami for four?", "How much does a Wazwan cost in Srinagar?", "What should I order at a Wazwan restaurant?");
  } else if (destination) {
    out.push(`What should I eat in ${destination.name}?`, `When is the best time to visit ${destination.name}?`, "Where can I eat Wazwan in Srinagar?");
  } else if (intent === "wazwan") {
    out.push("Which seven dishes are essential to a Wazwan?", "How is a Wazwan served?", "Why does gushtaba come last?");
  } else if (intent === "culture") {
    out.push("What are the manners at a Wazwan?", "What is a trami?", "What food should I buy in Kashmir to take home?");
  } else if (intent === "travel") {
    out.push("What should I eat in Kashmir in winter?", "Where can I eat Wazwan in Srinagar?", "Is Kashmiri food spicy?");
  } else out.push(...GENERAL);
  const seen = [question, ...asked];
  return [...new Set(out)].filter((suggestion) => !seen.some((earlier) => same(earlier, suggestion))).slice(0, 3);
}

/** The cards for the dishes and places an answer names, limited to those it was given sources for. */
export function cardsFor({ answer, entities, sources, kb, limit = 3 }) {
  const allowed = new Set(sources.flatMap((source) => source.chunk.ent || []));
  const named = kb.findEntities(answer).filter((entity) => entity.card && (allowed.has(entity.id) || entities.some((asked) => asked.id === entity.id)));
  // What was asked about comes first, then what the answer went on to name.
  const ordered = [...entities.filter((entity) => entity.card && named.some((found) => found.id === entity.id)), ...named];
  const out = [];
  for (const entity of ordered) if (!out.some((card) => card.url === entity.card.url)) out.push({ id: entity.id, ...entity.card });
  return out.slice(0, limit);
}
