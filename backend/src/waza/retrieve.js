/**
 * Chooses the passages of Wazwan Way's own content that an answer may be built from.
 *
 * Input: the question, what it is asking for (./intent.js) and the dishes, restaurants and places it
 * names. Output: a short ordered list of sources that fits the prompt budget, and an honest reading
 * of how well the site covers the question, so the model can be told when it has nothing to go on.
 */
import { estimateTokens, tokenize } from "./text.js";

// Which kinds of chunk each kind of question should lean on.
const TYPE_WEIGHTS = {
  recipe: { recipe: 2.2, dish: 1.2, story: 0.8, guide: 0.8, restaurant: 0.3, destination: 0.3, travel: 0.4, culture: 0.6 },
  restaurant: { restaurant: 2.0, guide: 1.15, story: 0.75, dish: 0.6, recipe: 0.25, destination: 0.5, travel: 0.6 },
  comparison: { guide: 1.5, dish: 1.35, wazwan: 1.2, story: 1.0, recipe: 0.5, restaurant: 0.4 },
  dish: { dish: 1.5, wazwan: 1.2, guide: 1.15, story: 1.0, recipe: 0.7, restaurant: 0.45 },
  wazwan: { wazwan: 1.6, guide: 1.3, etiquette: 1.3, story: 1.0, dish: 0.9, recipe: 0.4, restaurant: 0.6 },
  food: { story: 1.2, guide: 1.2, dish: 1.1, wazwan: 1.0, food: 1.0, recipe: 0.5, restaurant: 0.6 },
  travel: { destination: 1.7, travel: 1.4, story: 0.8, guide: 0.8, restaurant: 0.7, dish: 0.5, recipe: 0.2 },
  culture: { culture: 1.6, etiquette: 1.3, wazwan: 1.1, story: 1.0, guide: 1.0, recipe: 0.3, restaurant: 0.4 },
  about: { about: 3.0, story: 0.7, guide: 0.7, recipe: 0.2, restaurant: 0.5 },
  general: {},
};
// Sourced text first, then the site's own, then the unchecked notes.
const TIER_WEIGHTS = { verified: 1.25, site: 1.08, background: 0.72 };

// A word in the question that should also look for these (weaker than the word itself).
const EXPANSIONS = {
  winter: ["harissa", "chillai", "kalan", "hokh", "syun", "kangri", "cold"],
  cold: ["winter", "harissa", "kahwa"],
  summer: ["season"],
  breakfast: ["harissa", "girda", "tsot", "noon", "chai", "kandur", "bread"],
  bread: ["girda", "lavasa", "kulcha", "bakarkhani", "sheermal", "czochworu", "kandur", "tsot"],
  bakery: ["kandur", "bread", "girda", "bakarkhani"],
  tea: ["kahwa", "noon", "chai", "samovar"],
  drink: ["kahwa", "noon", "chai", "lassi"],
  dessert: ["phirni", "shufta", "halwa", "sweet"],
  sweet: ["phirni", "shufta", "halwa", "dessert"],
  vegetarian: ["nadru", "haakh", "chaman", "paneer", "dum", "oluv", "vegetable"],
  vegan: ["vegetarian", "haakh", "nadru"],
  spicy: ["chilli", "marchwangan", "hot", "spice"],
  hot: ["chilli", "marchwangan", "spicy"],
  mild: ["yakhni", "aab", "gosht", "yogurt", "milk"],
  kid: ["mild", "yakhni"],
  child: ["mild", "yakhni"],
  street: ["tujj", "masala", "tsot", "nadru", "monji", "khayam"],
  snack: ["street", "tujj", "kanti", "monji"],
  wedding: ["wazwan", "trami", "waza", "feast"],
  feast: ["wazwan", "trami"],
  meatball: ["rista", "gushtaba", "pounded"],
  rib: ["tabak", "maaz", "kabargah"],
  chicken: ["kokur"],
  fish: ["gaad"],
  lotus: ["nadru"],
  greens: ["haakh"],
  souvenir: ["saffron", "buy", "spice", "walnut", "almond"],
  gift: ["souvenir", "saffron", "buy"],
  saffron: ["pampore", "kong"],
  etiquette: ["trami", "manners", "guest", "hand"],
  order: ["served", "serving", "sequence", "trami", "last"],
  cost: ["price", "prices", "trami"],
  price: ["cost", "prices", "trami"],
  cheap: ["price", "budget", "thali", "plate"],
  budget: ["price", "thali", "plate"],
  best: ["named", "guide"],
  famous: ["known", "named"],
  history: ["origin", "century", "timur", "persian"],
  origin: ["history", "name", "word"],
  meaning: ["name", "word", "means"],
  healthy: ["calorie", "fat"],
  calorie: ["calories", "kcal", "fat"],
  pandit: ["hing", "asafoetida", "kabargah"],
  halal: ["muslim", "meat"],
};

// Words that say what kind of answer is wanted, not what it is about; they only add noise to a search.
const LOW_INFORMATION = new Set(["authentic", "best", "good", "great", "nice", "top", "famous", "popular", "real", "proper", "try", "eat", "eating", "find", "recommend", "suggest", "place", "thing", "kind", "type", "actually", "exactly", "kashmir"]);
// The entities worth anchoring a search on, by what is being asked.
const ANCHOR_KINDS = {
  recipe: ["dish"],
  dish: ["dish"],
  comparison: ["dish", "restaurant", "restaurant-topic"],
  restaurant: ["restaurant", "restaurant-topic", "dish"],
  wazwan: ["dish", "restaurant", "restaurant-topic"],
  food: ["dish", "destination"],
  travel: ["destination", "restaurant"],
  culture: ["dish", "destination"],
};
// Words that ask about the feast as a whole and name no part of it: "what makes Wazwan unique?",
// "tell me about Wazwan", "why does Wazwan matter in Kashmiri culture?".
const FEAST_AS_A_WHOLE = new Set(tokenize("wazwan kashmiri kashmir feast meal cuisine unique special different distinct makes made tell explain describe know learn introduce introduction overview basics important importance matter matters significance significant culture cultural tradition traditional famous about everything much really"));
const FEAST_OVERVIEW = ["wazwan:definition", "wazwan:the-wazas", "wazwan:in-kashmiri-life", "wazwan:how-many-dishes"];
// The same for the cuisine: "what is Kashmiri food like?", "what is special about Kashmiri cuisine?".
const FOOD_AS_A_WHOLE = new Set(tokenize("kashmiri kashmir food foods cuisine cooking kitchen unique special different distinct makes made tell explain describe know learn introduce introduction overview basics famous known about everything much really like typical traditional"));
const FOOD_OVERVIEW = ["story:kashmiri-cuisine-explained#kashmiri-cuisine-at-a-glance", "story:kashmiri-cuisine-explained#opening", "story:what-to-eat-in-kashmir#kashmiri-food-at-a-glance"];
// A trip plan needs somewhere to eat and something to eat as well as somewhere to go.
const TRIP_PLAN = ["directory:list", "wazwan:experience", "story:what-to-eat-in-kashmir#what-to-eat-in-kashmir-at-a-glance"];
// ... and, when it names no place, the four places most trips are built from (older notes, unchecked).
const TRIP_PLACES = ["background:places-in-kashmir-srinagar", "background:places-in-kashmir-gulmarg-meadow-of-flowers", "background:places-in-kashmir-pahalgam-valley-of-shepherds", "background:places-in-kashmir-sonamarg-meadow-of-gold"];
const OWN_PAGE = { dish: "dish:", restaurant: "restaurant:", destination: "destination:", "restaurant-topic": "restaurant-topic:" };

const pageOf = (chunk) => (chunk.url || chunk.id).replace(/#.*$/, "");

/**
 * @param {ReturnType<import("./knowledge.js").createKnowledge>} kb
 * @param {{ query: string, intent: string, entities?: object[], inherited?: object[], mode?: string, budgetTokens?: number, maxSources?: number }} request
 */
export function retrieve(kb, { query, intent, entities = [], inherited = [], context = "", mode = "chat", flags = {}, budgetTokens = 2600, maxSources = 8 }) {
  // Something plainly outside what Waza covers is given no sources: there is nothing to answer from.
  if (intent === "off_topic") return { sources: [], coverage: "none", closeness: 0, unknownTerms: [], usedTokens: 0, terms: [] };
  const wantsRecipe = intent === "recipe" || mode === "recipe";
  const named = [...entities, ...inherited.filter((entity) => !entities.some((own) => own.id === entity.id))];
  const anchors = ANCHOR_KINDS[wantsRecipe ? "recipe" : intent];
  const all = anchors ? named.filter((entity) => anchors.includes(entity.kind)) : named;
  const everyToken = tokenize(query);
  const informative = everyToken.filter((token) => !LOW_INFORMATION.has(token));
  const tokens = informative.length ? informative : everyToken;
  const terms = new Map();
  // A bare number says little about what is being asked; it counts, but lightly.
  for (const token of tokens) terms.set(token, Math.max(terms.get(token) || 0, /^\d+$/.test(token) ? 0.3 : 1));
  for (const token of tokens) for (const extra of EXPANSIONS[token] || []) if (!terms.has(extra)) terms.set(extra, 0.35);
  // A follow-up ("where can I eat it?") searches for the thing the conversation is about as well.
  for (const entity of inherited) for (const token of tokenize(entity.name)) if (!terms.has(token)) terms.set(token, 0.8);
  // ... and, when it names nothing itself ("how many dishes?"), for what the last question was about.
  if (context && !named.length) for (const token of tokenize(context)) if (!terms.has(token) && !LOW_INFORMATION.has(token)) terms.set(token, 0.6);

  const typeWeights = TYPE_WEIGHTS[wantsRecipe ? "recipe" : intent] || {};
  const ranked = kb.search({ terms, entityIds: all.map((entity) => entity.id), typeWeights, tierWeights: TIER_WEIGHTS, limit: 60, question: query });

  // The page a named dish or restaurant has to itself is always offered, whatever its score.
  const must = [];
  for (const entity of all.slice(0, 3)) {
    const slug = entity.id.split(":")[1];
    const recipe = wantsRecipe && entity.kind === "dish" ? kb.chunk(`recipe:${slug}`) : undefined;
    const own = recipe || kb.chunk(`${OWN_PAGE[entity.kind] || ""}${slug}`);
    if (own) must.push(own);
  }
  // "Where can I eat Wazwan?" with no place named: the directory's own list and summary answer it.
  const discovery = intent === "restaurant" && !all.some((entity) => entity.kind === "restaurant" || entity.kind === "restaurant-topic");
  if (discovery) for (const id of ["directory:list", "directory:faq-1", "directory:findings"]) if (kb.chunk(id)) must.push(kb.chunk(id));
  // A question about Waza or the site is answered from what the site says about itself.
  if (intent === "about") for (const id of ["about:wazwan-way", "about:sections"]) if (kb.chunk(id)) must.push(kb.chunk(id));
  // A short question about the feast in general starts from the definition; one that asks what the
  // feast is like as a whole gets the pages that describe it, not whichever passage shares a rare word.
  const overview = intent === "wazwan" && !all.length && tokens.every((token) => FEAST_AS_A_WHOLE.has(token));
  if (overview) for (const id of FEAST_OVERVIEW) if (kb.chunk(id)) must.push(kb.chunk(id));
  else if (intent === "wazwan" && tokens.length <= 2 && kb.chunk("wazwan:definition")) must.push(kb.chunk("wazwan:definition"));
  if (intent === "food" && !all.length && everyToken.length && everyToken.every((token) => FOOD_AS_A_WHOLE.has(token))) for (const id of FOOD_OVERVIEW) if (kb.chunk(id)) must.push(kb.chunk(id));
  // An article asked for by its title ("Tell me more about …", from the button under it).
  for (const chunk of kb.findPages(query).slice(0, 2)) must.push(chunk);
  if (flags.plan) for (const id of [...TRIP_PLAN, ...(named.some((entity) => entity.kind === "destination") ? [] : TRIP_PLACES)]) if (kb.chunk(id)) must.push(kb.chunk(id));
  const dishIds = new Set(all.filter((entity) => entity.kind === "dish").map((entity) => entity.id));

  const top = ranked[0]?.score || 0;
  const picked = [];
  const perPage = new Map();
  let used = 0;
  const take = (chunk, score) => {
    if (picked.some((source) => source.chunk.id === chunk.id)) return false;
    const cost = estimateTokens(chunk.text) + 30;
    if (picked.length && used + cost > budgetTokens) return false;
    picked.push({ chunk, score });
    used += cost;
    perPage.set(pageOf(chunk), (perPage.get(pageOf(chunk)) || 0) + 1);
    return true;
  };
  for (const chunk of must) take(chunk, top || 1);
  for (const { chunk, score } of ranked) {
    if (picked.length >= maxSources) break;
    // Past the first few, a passage has to be reasonably close to the best one to be worth its tokens.
    if (picked.length >= 3 && score < top * 0.28) break;
    if ((perPage.get(pageOf(chunk)) || 0) >= (all.length ? 3 : 2)) continue;
    // A recipe is long; it is only worth the budget when a recipe was asked for, and then only the dish's own.
    if (chunk.type === "recipe" && !wantsRecipe && estimateTokens(chunk.text) > 500) continue;
    if (chunk.type === "recipe" && wantsRecipe && dishIds.size && !dishIds.has(chunk.ent?.[0])) continue;
    take(chunk, score);
  }

  // How well does the site cover this question?
  const vocabulary = kb.vocabulary(tokens);
  const ideal = tokens.reduce((sum, token) => sum + kb.idf(token) * 2.4 * (terms.get(token) || 1), 0) || 1;
  const closeness = Math.min(1, top / ideal);
  const best = picked[0]?.chunk;
  let coverage = "none";
  if (picked.length && (must.length || closeness >= 0.34)) coverage = "strong";
  else if (picked.length && closeness >= 0.16) coverage = "partial";
  if (coverage === "strong" && vocabulary.share < 0.6 && !must.length) coverage = "partial";
  if (best && best.tier === "background" && coverage === "strong" && !picked.some((source) => source.chunk.tier !== "background")) coverage = "background";

  return {
    sources: picked.map((source, i) => ({ n: i + 1, ...source })),
    coverage,
    closeness: Number(closeness.toFixed(3)),
    unknownTerms: vocabulary.unknown.filter((term) => term.length > 3 && !/^\d+$/.test(term)),
    usedTokens: used,
    terms: [...terms.keys()],
  };
}
