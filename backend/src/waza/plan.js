/**
 * Everything Waza works out about a question before any model is involved: what is being asked,
 * which dishes and places it names, whether the site's own text already answers it, and which
 * passages a model should be shown if not. Pure and synchronous, so the service, the tests and the
 * evaluation all read a question in exactly the same way.
 */
import { noRecipeReply, recipeReply, smalltalkReply } from "./direct.js";
import { classify } from "./intent.js";
import { retrieve } from "./retrieve.js";

function entitiesOfConversation(kb, messages) {
  // What the conversation was about before this message: the visitor's last question first, then
  // what the last answer named.
  const earlier = messages.slice(0, -1);
  const lastUser = [...earlier].reverse().find((message) => message.role === "user");
  const lastAnswer = [...earlier].reverse().find((message) => message.role === "assistant");
  const found = [...(lastUser ? kb.findEntities(lastUser.content) : []), ...(lastAnswer ? kb.findEntities(lastAnswer.content).slice(0, 3) : [])];
  return found.filter((entity, i) => found.findIndex((other) => other.id === entity.id) === i).slice(0, 4);
}

/**
 * @param {object} kb  from ./knowledge.js
 * @param {{ messages: {role: string, content: string}[], mode?: "chat"|"recipe", dish?: string, contextTokens?: number }} request
 */
export function plan(kb, { messages, mode = "chat", dish, contextTokens = 2600 }) {
  const question = messages[messages.length - 1].content.trim();
  const pageDish = typeof dish === "string" ? kb.entity(`dish:${dish}`) : undefined;
  const named = kb.findEntities(question);
  const entities = pageDish && !named.some((entity) => entity.id === pageDish.id) ? [pageDish, ...named] : named;
  const previous = messages.length > 1 ? entitiesOfConversation(kb, messages) : [];
  const lastQuestion = messages.length > 1 ? [...messages.slice(0, -1)].reverse().find((message) => message.role === "user")?.content || "" : "";
  const previousIntent = lastQuestion ? classify(lastQuestion, { entities: kb.findEntities(lastQuestion) }).intent : null;
  const analysis = classify(question, { entities, previousEntities: previous, previousIntent, hasHistory: messages.length > 1 });
  const intent = mode === "recipe" ? "recipe" : analysis.intent;
  const inherited = analysis.inherited || [];
  const base = { question, mode, intent, flags: analysis.flags, entities, inherited, about: [...entities, ...inherited], pageDish, followUp: Boolean(analysis.followUp) };

  // A greeting or a thank-you needs no sources and no model.
  if (analysis.intent === "smalltalk" && mode === "chat") {
    return { ...base, direct: { kind: "smalltalk", text: smalltalkReply(analysis.smalltalk), sources: [], coverage: "none" } };
  }

  // A recipe the site has written out is given as written; where it has none, that is said.
  const dishes = entities.filter((entity) => entity.kind === "dish");
  if ((mode === "recipe" || analysis.plainRecipe) && dishes.length === 1) {
    const slug = dishes[0].id.split(":")[1];
    const recipe = kb.chunk(`recipe:${slug}`);
    const dishChunk = kb.chunk(`dish:${slug}`);
    const text = recipe ? recipeReply(recipe, dishes[0].name) : noRecipeReply(dishes[0].name, dishChunk);
    const source = recipe || dishChunk;
    if (text && source) return { ...base, direct: { kind: recipe ? "recipe" : "no_recipe", text, sources: [{ n: 1, chunk: source }], coverage: recipe ? "strong" : "partial" } };
  }

  return { ...base, direct: null, retrieval: retrieve(kb, { query: question, intent, entities, inherited, context: analysis.followUp ? lastQuestion : "", mode, flags: analysis.flags, budgetTokens: contextTokens }) };
}
