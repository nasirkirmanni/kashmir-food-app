/**
 * Answers that need no model: a greeting, a thank-you, a goodbye, and a recipe the site has already
 * written out. They cost nothing, arrive at once and cannot be wrong in a new way. Anything that
 * needs judgement goes to the model.
 */

const SMALLTALK = {
  greeting: "Salaam! I'm Waza AI, Wazwan Way's guide to Kashmiri food. Ask me about a dish, how a Wazwan is served, where to eat it in Srinagar, or what to try on a trip to Kashmir.",
  thanks: "You're welcome. If you'd like to go further, I can tell you about another dish, a recipe, or where to eat Wazwan in Srinagar.",
  farewell: "Khuda hafiz! Come back whenever you'd like to talk about Kashmiri food.",
};

export const smalltalkReply = (kind) => SMALLTALK[kind] || SMALLTALK.greeting;

/**
 * The site's written recipe for a dish, laid out for the chat. The chunk's text is already the
 * recipe in plain lines (frontend/lib/wazaKnowledge.js recipeText); this only adds Markdown.
 * @returns {string|null} null when the chunk is not a recipe this can lay out
 */
export function recipeReply(recipeChunk, dishName) {
  if (!recipeChunk?.text) return null;
  const lead = [];
  const sections = [];
  let current = null;
  for (const line of recipeChunk.text.split("\n").map((raw) => raw.trim()).filter(Boolean)) {
    if (/^Recipe for .+, as written on Wazwan Way\.$/.test(line)) continue;
    const heading = /^(Ingredients|Method|Waza tips|Tips|Common mistakes):$/.exec(line);
    const inline = /^(At home|Serving|About this recipe):\s+(.+)$/.exec(line);
    if (heading) {
      current = { label: heading[1], lines: [] };
      sections.push(current);
    } else if (inline) {
      sections.push({ label: inline[1], inline: inline[2] });
      current = null;
    } else if (current) current.lines.push(line);
    else lead.push(line);
  }
  const has = (label) => sections.some((section) => section.label === label && section.lines?.length);
  if (!has("Ingredients") || !has("Method")) return null;
  const out = [`**${dishName}**, from Wazwan Way's written recipe [S1].`, ...lead];
  for (const section of sections) out.push(section.inline ? `**${section.label}:** ${section.inline}` : `### ${section.label}\n${section.lines.join("\n")}`);
  return out.join("\n\n");
}

/** When a recipe was asked for and the site has none: say so, and say what it does have. */
export function noRecipeReply(dishName, dishChunk) {
  const lead = `Wazwan Way doesn't have a written recipe for **${dishName}** yet, and I won't make one up.`;
  if (!dishChunk?.text) return lead;
  const about = dishChunk.text
    .split(/\n+/)
    .slice(1)
    .filter((line) => line && !/^Tip:/.test(line))
    .slice(0, 2)
    .join(" ");
  return about ? `${lead}\n\nWhat the site does say about it [S1]: ${about}` : lead;
}
