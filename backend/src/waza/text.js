/**
 * Text normalisation shared by the knowledge index builder (frontend/scripts/build-waza-knowledge.mjs)
 * and the retriever (./knowledge.js). Both must tokenise the same way, so the rules live here and
 * nowhere else. No dependencies.
 *
 * Kashmiri words reach us in many romanisations (gushtaba, goshtaba, gushtabeh; kahwa, kehwa,
 * qehwa). VARIANTS folds the spellings a visitor is likely to type into the one the site uses, at
 * the token level, so the index and the query meet.
 */

const DIACRITICS = /[̀-ͯ]/g;

/** Lower-case, strip accents, straighten quotes. */
export function fold(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(/[‘’ʼ`´]/g, "'")
    .replace(/[“”]/g, '"');
}

export const STOPWORDS = new Set(
  (
    "a an and are as at be been but by can could did do does for from had has have how i if in into is it its " +
    "me my of on or our so than that the their them then there these they this to was we were what when where " +
    "which who whom why will with would you your about tell please kindly some any also just very really much " +
    "many more most am im i'm do's whats what's hows how's is's give show want need know like get got let lets " +
    "should shall may might must ought dont don't doesnt doesn't isnt isn't arent aren't im ive i've id i'd ill i'll " +
    "here out up down over under again once only own same too s t d ll re ve " +
    "come comes came coming go goes going went take takes took put find look think tell say says said"
  ).split(/\s+/)
);

// variant token -> the site's spelling (one token, or several separated by a space)
export const VARIANTS = {
  // the feast and its people
  wazwaan: "wazwan", waazwan: "wazwan", wazvan: "wazwan", wazawan: "wazwan", wazwaans: "wazwan",
  wazas: "waza", waze: "waza", wazza: "waza", wouste: "vasta", wasta: "vasta", wusta: "vasta",
  traem: "trami", tream: "trami", trambi: "trami", traam: "trami", tramis: "trami", traami: "trami",
  sarposh: "sarposh", dastarkhan: "dastarkhwan", dastarkhawan: "dastarkhwan",
  // the core dishes
  goshtaba: "gushtaba", gushtabeh: "gushtaba", goshtabeh: "gushtaba", ghustaba: "gushtaba", goshtabe: "gushtaba",
  gushtabah: "gushtaba", gostaba: "gushtaba", gustaba: "gushtaba", gushtabas: "gushtaba",
  riste: "rista", ristay: "rista", ristas: "rista", rishta: "rista",
  roganjosh: "rogan josh", roghan: "rogan", roghanjosh: "rogan josh", ruganjosh: "rogan josh", rogun: "rogan",
  tabakh: "tabak", tabakmaaz: "tabak maaz", tabakhmaaz: "tabak maaz", maz: "maaz", maaz: "maaz", mauz: "maaz",
  kabargah: "kabargah", qabargah: "kabargah", kabargaah: "kabargah",
  aabgosh: "aab gosht", aabgosht: "aab gosht", abgosht: "aab gosht", abgosh: "aab gosht", gosh: "gosht", ghosht: "gosht",
  gosht: "gosht", ab: "aab",
  dhaniwal: "daniwal", danival: "daniwal", dhaniwaal: "daniwal", korme: "korma", qorma: "korma", kormas: "korma",
  marchewangan: "marchwangan", marchawangan: "marchwangan", mirchwangan: "marchwangan", martswangan: "marchwangan",
  marchwangun: "marchwangan", marchwagan: "marchwangan",
  yakhin: "yakhni", yakhean: "yakhni", yakhini: "yakhni", yakhnee: "yakhni",
  methi: "methi", maithi: "methi",
  // other dishes and ingredients
  kebab: "kabab", kebabs: "kabab", kababs: "kabab", kabob: "kabab", kebob: "kabab", seekh: "seekh", sheekh: "seekh",
  harisa: "harissa", hareesa: "harissa", harise: "harissa", hareese: "harissa",
  nadur: "nadru", nadir: "nadru", nadroo: "nadru", nader: "nadru", nadre: "nadru",
  haak: "haakh", hak: "haakh", haaq: "haakh", haakh: "haakh",
  tsaman: "chaman", tchaman: "chaman", chamman: "chaman", tsamun: "chaman",
  wangun: "wangan", wangen: "wangan", chok: "tchok", tsok: "tchok", tsokh: "tchok",
  olav: "oluv", aloo: "oluv", alu: "oluv", aaloo: "oluv", oluv: "oluv",
  kokur: "kokur", kukur: "kokur", kokar: "kokur",
  gaad: "gaad", gaade: "gaad", gad: "gaad",
  mujje: "muji", mujh: "muji", mooli: "muji", muj: "muji",
  tujji: "tujj", tuji: "tujj", tujje: "tujj", tujh: "tujj",
  phirin: "phirni", firni: "phirni", phirnee: "phirni", firin: "phirni",
  pulav: "pulao", pilaf: "pulao", pulaw: "pulao", pilau: "pulao", polav: "pulao",
  shabdaig: "shabdeg", shabdegh: "shabdeg",
  tehar: "teher", tahar: "teher", taher: "teher", tehri: "teher",
  // breads and tea
  lavas: "lavasa", lawasa: "lavasa", lavase: "lavasa", lawas: "lavasa",
  czot: "tsot", tchot: "tsot", chot: "tsot", tsoet: "tsot", tsochvor: "czochworu", chochwor: "czochworu",
  chochwur: "czochworu", tsochwor: "czochworu", czochwor: "czochworu", telvor: "czochworu",
  bakerkhani: "bakarkhani", baqarkhani: "bakarkhani", bakirkhani: "bakarkhani",
  shirmal: "sheermal", sheermaal: "sheermal", kulche: "kulcha", kulchas: "kulcha",
  kehwa: "kahwa", qehwa: "kahwa", kahva: "kahwa", kehva: "kahwa", qahwa: "kahwa", kahwah: "kahwa", kawa: "kahwa",
  nun: "noon", chay: "chai", chaai: "chai", cha: "chai", sheer: "sheer", namkeen: "noon",
  samavar: "samovar", samawar: "samovar", samovars: "samovar",
  // culture and places
  phiran: "pheran", feran: "pheran", pherans: "pheran", phirans: "pheran",
  kangir: "kangri", kanger: "kangri", kangdi: "kangri", kangris: "kangri",
  sonmarg: "sonamarg", sonemarg: "sonamarg", pehalgam: "pahalgam", phalgam: "pahalgam",
  shikaras: "shikara", shikhara: "shikara", houseboats: "houseboat",
  kashmiri: "kashmir", kashmiris: "kashmir", koshur: "koshur", kashur: "koshur",
  // common English plurals the light stemmer would get wrong
  dishes: "dish", recipes: "recipe", restaurants: "restaurant", spices: "spice", chillies: "chilli", chilies: "chilli",
  chili: "chilli", chile: "chilli", veg: "vegetarian", veggie: "vegetarian", vegetarians: "vegetarian",
  nonveg: "non vegetarian", eateries: "restaurant", eatery: "restaurant", cafes: "cafe", breads: "bread",
  desserts: "dessert", sweets: "sweet", drinks: "drink", teas: "tea", weddings: "wedding", meatballs: "meatball",
  yoghurt: "yogurt", curd: "yogurt", dahi: "yogurt", mutton: "mutton", lamb: "mutton", potatoes: "potato",
};

/**
 * A light stemmer: plurals, then the verb endings that separate "serve", "served" and "serving".
 * Deliberately crude; it only has to treat the index and the question alike. Kashmiri words are
 * handled by VARIANTS before they get here.
 */
export function stem(token) {
  if (token.length <= 3) return token;
  let word = token;
  if (word.endsWith("ies") && word.length > 4) word = `${word.slice(0, -3)}y`;
  else if (/(ches|shes|sses|xes|zes)$/.test(word)) word = word.slice(0, -2);
  else if (word.endsWith("s") && !word.endsWith("ss") && !word.endsWith("us") && !word.endsWith("is")) word = word.slice(0, -1);
  if (word.length >= 6 && word.endsWith("ing")) {
    word = word.slice(0, -3);
    if (/([b-df-hj-np-tv-z])\1$/.test(word)) word = word.slice(0, -1);
  } else if (word.length >= 5 && word.endsWith("ied")) word = `${word.slice(0, -3)}y`;
  else if (word.length >= 5 && word.endsWith("ed")) word = word.slice(0, -2);
  if (word.length >= 5 && word.endsWith("e") && !KEEP_E.has(word)) word = word.slice(0, -1);
  return word;
}

// Words that would collide with another word if their final "e" went: tripe is not a trip.
const KEEP_E = new Set(["tripe", "plane", "there", "where", "these", "those", "three"]);

/** Words of a text in order, folded and canonicalised. Stop words are kept (used for phrase matching). */
export function words(value) {
  const out = [];
  for (const raw of fold(value).replace(/[^a-z0-9']+/g, " ").split(" ")) {
    const token = raw.replace(/^'+|'+$/g, "").replace(/'s$/, "");
    if (!token) continue;
    const mapped = VARIANTS[token] ?? VARIANTS[token.replace(/'/g, "")];
    if (mapped) out.push(...mapped.split(" ").map(stem));
    else out.push(stem(token.replace(/'/g, "")));
  }
  return out;
}

/** Search terms of a text: words without stop words and single characters. */
export function tokenize(value) {
  return words(value).filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

/** The canonical phrase used to recognise an entity name inside a question. */
export function phraseKey(value) {
  return words(value).join(" ");
}

/** A rough token count for budgeting prompts (about 4 characters a token for English prose). */
export function estimateTokens(value) {
  return Math.ceil(String(value ?? "").length / 3.8);
}
