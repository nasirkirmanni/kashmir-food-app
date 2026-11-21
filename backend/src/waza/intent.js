/**
 * What a visitor is asking for, worked out from the words alone: no model call, so it costs
 * nothing, cannot fail, and behaves the same every time. The result decides which kinds of chunk
 * the retriever favours, how the answer should be shaped, and whether a model is needed at all.
 */
import { fold, tokenize, words } from "./text.js";

const any = (...parts) => new RegExp(parts.join("|"), "i");

const SMALLTALK = {
  greeting: /^(hi+|hello+|hey+|hiya|salaa?m|a?ssalam ?u? ?alaikum|assalamualaikum|namaste|namaskar|adaab|good (morning|afternoon|evening))( there| waza( ai)?)?[\s.!?,]*$/i,
  thanks: /^(thanks?( you)?( (a lot|so much|very much|a ton|a million))?|thank u|thx|ty|shukriya|shukran|jazak ?allah( khair)?|much appreciated|appreciate it|great|nice|awesome|perfect|cool|ok(ay)?|alright|got it|good job|wonderful|lovely|👍|👏|😊|🙏)[\s.!?,]*$/i,
  farewell: /^(bye+|goodbye|see (you|ya)( later)?|good ?night|khuda ?hafiz|allah ?hafiz|take care)[\s.!?,]*$/i,
};

const INJECTION = any(
  "ignore (all |any |the )?(previous|prior|above|earlier|your) (instructions|rules|prompts?)",
  "disregard (all |any |the )?(previous|prior|above|your) ",
  "forget (all |everything |your )(previous |prior )?(instructions|rules)",
  "(reveal|show|print|repeat|output|tell me|what (is|are)) (me )?(your|the) (system |hidden |initial |original )?(prompt|instructions|rules)",
  "system prompt",
  "developer mode",
  "\\bjailbreak",
  "\\bdan mode\\b",
  "you are now\\b",
  "\\bdan\\b.{0,30}\\b(no|without) (rules|restrictions|limits|filters)",
  "(no|without any|without) (rules|restrictions|filters|guidelines)\\b",
  "make up (a|an|some|the) (phone|number|address|price|fact|rating|review)",
  "pretend (to be|you are) (?!a (guest|tourist|visitor))",
  "act as (a|an) (?!guide|local|host|waza)",
  "\\bapi[ _-]?key\\b",
  "\\benv(ironment)? variables?\\b"
);

const RECIPE = any(
  "\\brecipe (for|of)\\b",
  "\\bingredients? (for|of|in)\\b",
  "how (do|can|should|would) (i|we|you|one) (make|cook|prepare)",
  "how to (make|cook|prepare)",
  "how (is|are) .{2,60} (made|cooked|prepared)",
  "steps? (to|for) (make|making|cook|cooking)",
  "(cooking|preparation) (method|steps|time)",
  "\\bmethod for\\b",
  "can i (make|cook) ",
  "(need|needed|require|required) (to|for) (make|making|cook|cooking|prepare|preparing)",
  "(want|like|going|plan|planning|trying) to (make|cook|prepare) ",
  "what goes into (making|cooking)"
);
// The word alone ("rista recipe", "what are the ingredients?") means a recipe only when a dish is in view.
const RECIPE_WORD = /\b(recipes?|ingredients?)\b/i;
// Questions asked from the stove: they are about a recipe when a dish is in view.
const COOKING = /\b(boil|boiling|simmer|simmering|fry|frying|roast|roasting|bake|baking|knead|marinate|marinating|soak|soaking|grind|grinding|whisk|pressure[- ]?cook\w*|substitute|swap|replace|instead of|leave out|skip the|without (an? |the )?(oven|grill|tandoor|shallots?|onions?|garlic|egg|ghee|mustard oil|pressure cooker)|how (long|much|many) (do|should|does|to) (i|we|you|it)?\s?(cook|boil|fry|simmer|soak|rest|need|use|add|take)|can i use|what can i use|how hot|what temperature)\b/i;
// A plain request for the recipe, with nothing else asked: answered from the written recipe itself.
const RECIPE_PLAIN = /^\s*(?:(?:please|can you|could you|kindly)\s+)?(?:(?:give|share|show|tell|send|provide|write)\s+)?(?:(?:me|us)\s+)?(?:(?:the|a|your)\s+)?(?:(?:full|complete|authentic|traditional|step[- ]by[- ]step)\s+)?(?:recipe\s+(?:for|of)|how\s+(?:do|can)\s+(?:i|we|you)\s+(?:make|cook|prepare)|how\s+to\s+(?:make|cook|prepare)|ingredients\s+(?:for|of))\s+|^[\w\s'-]{2,40}\s+recipe(?:\s+please)?\s*[?.!]*\s*$/i;

// With two dishes named, these words alone make it a comparison ("are X and Y the same bread?").
const COMPARISON_OF_TWO = /\b(same|both|either|differ\w*|better|alike|similar)\b/i;
const COMPARISON = any("\\bvs\\.?\\b", "\\bversus\\b", "difference(s)? between", "different (from|than)", "(the )?same (as|thing)", "\\bcompare(d)?\\b", "how (is|are|does) .{2,50} differ", "\\bor\\b.{0,40}\\?", "which (is|one is) (better|hotter|spicier|milder|richer|sweeter)");

const RESTAURANT = any(
  "\\brestaurants?\\b",
  "\\b(cafe|cafes|dhaba|eatery|eateries|hotel restaurant)\\b",
  "where (can|could|do|should|to|would) (i|we|you|one)? ?(eat|try|have|taste|get|find|order|buy)",
  "(place|places|spot|spots|somewhere) to (eat|dine|try)",
  "where (should|can|could|do|would) (i|we) go (for|to eat|to try|to have)",
  "\\b(dine|dining|book a table|reservation|takeaway|take ?away|deliver\\w*)\\b",
  "serv(e|es|ing|ed) wazwan",
  "(get|order|buy|have) (a |some |the )?wazwan",
  "(good|best|worth|famous|known|popular) (place |spot )?for (a |the )?(wazwan|kashmiri food|kabab|kebab|harissa|tujj)",
  "wazwan (in|near|around|at) ",
  "best .{0,30}(wazwan|food|kabab|harissa|kahwa|noon chai|tujj) (in|near|around)",
  "near me",
  "\\b(thali|trami for)\\b",
  "(good|nice|best|top|great|decent|cheap|cheapest) (place|places|spot|spots|restaurant|restaurants)",
  "(place|places|spot|spots) (for|to have|that|which|where) ",
  "which (place|places|restaurant|restaurants|hotel|hotels)",
  "(cook|cooks|make|makes|do|does) (a |the )?(good |proper |real )?wazwan (in|near|around|at)\\b"
);

// The ways of asking for somewhere to eat, as against merely mentioning restaurants.
const RESTAURANT_SEEKING = any("where (can|could|do|should|to|would)", "(place|places|spot|spots|somewhere) to (eat|dine|try)", "near me", "\\bbest\\b", "recommend", "which restaurant", "book a table", "deliver\\w*");

const TRAVEL = any(
  "\\b(visit|visiting|trip|itinerary|itineraries|travel|travell?ing|tour|touring|holiday|vacation|honeymoon|sightseeing)\\b",
  "\\b(stay|hotel|hotels|houseboat|houseboats|homestay|shikara|gondola|trek|trekking|camping|skiing|ski)\\b",
  "\\b(taxi|cab|fare|airport|flight|flights|train|bus|permit|sim card|atm)\\b",
  "\\b(weather|snow|snowfall|forecast|monsoon)\\b",
  "\\b(garden|gardens|tulip|lake|valley|meadow|waterfall|shrine|glacier|pass|national park|viewpoint)\\b",
  "best time to (visit|go|travel)",
  "how (many days|long (should|do) (i|we))",
  "how (do|can) (i|we) (reach|get to|go to)",
  "things to do"
);
// "Plan a 5-day Kashmir trip": an itinerary is travel, however many restaurants and dishes it lists.
const TRIP_PLAN = any("\\b(plan|planning|make|build|create|generate|suggest|draft|design)\\b.{0,40}\\b(trip|itinerary|tour|holiday|vacation)\\b", "\\b\\d+[- ]?(day|days|night|nights)\\b.{0,30}\\b(trip|itinerary|tour|plan|holiday|in kashmir|kashmir)\\b", "\\bitinerary\\b");
// Words that point at travel only when nothing about food is being asked.
const TRAVEL_WEAK = /\b(safe|safety|season|road|drive|driving|temperature)\b/i;

const CULTURE = any(
  "\\b(pheran|kangri|samovar|karakul|wanvun|rouf|santoor|rabab)\\b",
  "\\b(culture|cultural|tradition|traditions|traditional dress|custom|customs|etiquette|manners|hospitality)\\b",
  "\\b(festival|festivals|eid|herath|shivratri|navreh|nowruz|navroz|urs)\\b",
  "\\b(craft|crafts|artisan|artisans|handmade|handicraft|handicrafts|pashmina|shawl|shawls|carpet|carpets|papier|walnut wood|copperware|namda|sozni|kani)\\b",
  "\\b(language|koshur|phrase|phrases|how do you say|word for|translate|meaning of)\\b",
  "\\b(history|historical|origin|origins|dynasty|mughal|sultan|century)\\b",
  "\\b(souvenir|souvenirs|shopping|what to buy)\\b",
  "\\b(wedding|weddings|marriage)\\b"
);

const WAZWAN = /\b(wazwan|waza|vasta|trami|sarposh|dastarkhwan|feast|seven dishes|course|courses)\b/i;
const FOOD = /\b(food|cuisine|dish|dishes|eat|eating|ate|meal|meals|breakfast|lunch|dinner|snack|snacks|street food|drink|drinks|tea|teas|chai|bread|breads|baker|bakers|bakery|bakeries|kandur|dessert|desserts|sweet|sweets|spice|spices|spicy|mild|hot|vegetarian|vegan|halal|meat|mutton|chicken|fish|rice|saffron|chilli|chillies|taste|flavou?r|cook|cooked|cooking|menu|korma|kabab|kebab|chutney|pickle|masala|ingredient|ingredients)\b/i;
const KASHMIR = /\b(kashmir|srinagar|valley|gulmarg|pahalgam|sonamarg|dal lake|jammu|ladakh)\b/i;
const ABOUT = any("who (are|r) (you|u)", "what (are|can) you", "who (made|built|created|owns|founded|runs|is behind) (you|this|wazwan way|waza)", "\\b(founder|owner|creator)\\b.{0,30}\\b(wazwan way|waza ai|this (site|website|app)|you)\\b", "\\b(wazwan way|waza ai|your|this (site|website|app))('s)? (founder|owner|creator)\\b", "^(the )?(founder|owner|creator)\\??$", "about (wazwan way|waza ai|this (site|website|app))", "what is (wazwan way|waza ai)", "how (do|does) (you|waza ai|this) work", "where (do|does) (you|your|waza).{0,20}(information|data|answers|knowledge)");

// Facts that go stale: an answer may give them only from a dated source.
const DYNAMIC = /\b(price|prices|cost|costs|how much|rate|rates|fare|fares|fee|fees|ticket|tickets|open|opens|opening|closed|closes|closing|hours|timing|timings|phone|number|contact|address|rating|ratings|review|reviews|today|tonight|tomorrow|now|currently|current|latest|this (week|month|year)|weather|forecast|available|availability|booking|uber|ola|rapido)\b/i;

const SENSITIVE = /\b(militan|terror|curfew|protest|army|article 370|azadi|separatis|conflict|politic|election|loc\b|line of control|shelling|encounter|unrest|riot|bomb)\w*/i;
const HEALTH = /\b(allerg|diabet|pregnan|cholesterol|blood pressure|celiac|gluten|lactose|medicine|medical|doctor|symptom|weight loss|diet plan|calorie deficit|is it healthy|cure|treat(s|ment)?)\w*/i;

// Plainly something else. Only obvious cases: the model handles the borderline ones.
const OFF_TOPIC = any(
  "\\b(python|javascript|java|c\\+\\+|sql|html|css|code|coding|program|programming|algorithm|regex|debug)\\b",
  "\\b(stock|stocks|crypto|bitcoin|forex|invest|investment|loan|mortgage|tax return)\\b",
  "\\b(homework|essay|thesis|assignment|cover letter|resume|cv)\\b",
  "\\b(football|cricket score|ipl|world cup|nba|movie|netflix|song lyrics)\\b",
  "\\b(president|prime minister|elections?|vote|voting)\\b",
  "\\bsolve\\b.{0,40}\\b(equation|integral|math)\\b",
  "\\d+\\s*(times|plus|minus|multiplied by|divided by|x|\\*|\\+|/)\\s*\\d+",
  "\\b(calculate|square root|percent of)\\b",
  "\\b(write|compose) (me )?(a |an )?(poem|song|story|joke|email)\\b"
);

const FOLLOW_UP = /^(and|also|but|so|then|what about|how about|why|how|when|where|which|who|is it|is that|are they|does it|do they|can i|should i|tell me more|more|go on|continue|really|sure|yes|no|ok(ay)?)\b/i;
const PRONOUN = /\b(it|its|it's|that|this|they|them|those|these|there|one|ones|same|both|either|the (first|second|other|former|latter)( one)?)\b/i;

/**
 * @param {string} message  the visitor's latest message
 * @param {{ entities: object[], previousEntities?: object[], hasHistory?: boolean }} context
 */
export function classify(message, { entities = [], previousEntities = [], previousIntent = null, hasHistory = false } = {}) {
  const raw = String(message ?? "").trim();
  const folded = fold(raw);
  const tokens = tokenize(raw);
  // The patterns are tried on the words as typed and as the index spells them ("sweets" → "sweet").
  const text = `${folded}\n${words(raw).join(" ")}`;
  const flags = {
    injection: INJECTION.test(folded),
    dynamic: DYNAMIC.test(folded),
    sensitive: SENSITIVE.test(folded),
    health: HEALTH.test(folded),
    comparison: COMPARISON.test(folded) || (entities.filter((entity) => entity.kind === "dish").length >= 2 && COMPARISON_OF_TWO.test(folded)),
    nearMe: /\bnear (me|by|here)\b|\bnearby\b|\baround (me|here)\b/i.test(folded),
    plan: TRIP_PLAN.test(folded),
  };

  for (const [kind, pattern] of Object.entries(SMALLTALK)) {
    if (pattern.test(raw)) return { intent: "smalltalk", smalltalk: kind, flags, followUp: false, tokens };
  }

  const kinds = new Set(entities.map((entity) => entity.kind));
  const has = (kind) => kinds.has(kind);
  const restaurantEntity = has("restaurant") || has("restaurant-topic");
  // A short message that leans on what was said before: "and gushtaba?", "where can I eat it?"
  const followUp = hasHistory && (PRONOUN.test(folded) || FOLLOW_UP.test(folded) || tokens.length <= 3) && (entities.length === 0 || tokens.length <= 4);
  const inherited = followUp && entities.length === 0 ? previousEntities : [];
  const about = [...entities, ...inherited];
  const aboutKinds = new Set(about.map((entity) => entity.kind));
  const dishInView = aboutKinds.has("dish") || (followUp && previousIntent === "recipe");
  const food = FOOD.test(text);
  const feast = WAZWAN.test(text);
  const travel = TRAVEL.test(text);

  let intent;
  if (ABOUT.test(folded) && !RECIPE.test(folded) && !has("dish")) intent = "about";
  else if (RECIPE.test(folded) || ((RECIPE_WORD.test(folded) || COOKING.test(folded)) && dishInView)) intent = "recipe";
  else if (flags.plan) intent = "travel";
  // "Is restaurant Wazwan the same as a wedding's?" is about the feast, not a request for a table.
  else if ((RESTAURANT.test(text) || restaurantEntity) && !(flags.comparison && !restaurantEntity && feast && !RESTAURANT_SEEKING.test(text))) intent = "restaurant";
  else if (flags.comparison && about.filter((entity) => entity.kind === "dish").length >= 2) intent = "comparison";
  else if (has("dish")) intent = flags.comparison ? "comparison" : "dish";
  else if (travel || has("destination")) intent = food && !travel ? "food" : "travel";
  else if (CULTURE.test(text)) intent = feast && !/pheran|kangri|pashmina|shawl|carpet|language|phrase|festival/.test(folded) ? "wazwan" : "culture";
  else if (feast) intent = "wazwan";
  else if (inherited.length) intent = aboutKinds.has("restaurant") || aboutKinds.has("restaurant-topic") ? "restaurant" : aboutKinds.has("destination") ? "travel" : flags.comparison ? "comparison" : "dish";
  // A few words that only make sense as a continuation ("how many dishes?") keep the subject they continue.
  else if (followUp && tokens.length <= 3 && ["wazwan", "restaurant", "travel", "culture"].includes(previousIntent)) intent = previousIntent;
  else if (food) intent = "food";
  else if (TRAVEL_WEAK.test(folded)) intent = "travel";
  else if (followUp && previousIntent && !["smalltalk", "off_topic", "about"].includes(previousIntent)) intent = previousIntent === "recipe" ? "dish" : previousIntent;
  else if (OFF_TOPIC.test(folded) && !KASHMIR.test(folded)) intent = "off_topic";
  else intent = "general";

  // "Give me the recipe for rista": the written recipe answers it without a model. Anything more
  // specific ("with chicken instead", "how long do I boil it") is a question for the model.
  const dishes = entities.filter((entity) => entity.kind === "dish");
  let plainRecipe = false;
  if (intent === "recipe" && dishes.length === 1 && RECIPE_PLAIN.test(raw) && !flags.comparison) {
    const nameTokens = new Set(dishes[0].phrases.flatMap((phrase) => phrase.split(" ")));
    const rest = tokens.filter((token) => !nameTokens.has(token) && !RECIPE_FILLER.has(token));
    plainRecipe = rest.length === 0;
  }

  return { intent, flags, followUp, inherited, plainRecipe, tokens };
}

// Words that belong to asking for a recipe, not to what is being asked about it.
const RECIPE_FILLER = new Set(tokenize("recipe recipes make making cook cooking prepare preparing ingredient ingredients home step steps authentic traditional full complete share send provide write guide guided wazwan style Kashmiri proper properly best way easy simple method detailed minimal precise stepwise wise please kindly"));

export const INTENTS = ["smalltalk", "about", "recipe", "restaurant", "comparison", "dish", "wazwan", "food", "travel", "culture", "general", "off_topic"];
