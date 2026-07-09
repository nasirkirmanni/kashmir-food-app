import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Dish } from "../models/Dish.js";
import { Restaurant } from "../models/Restaurant.js";
import { Destination } from "../models/Destination.js";
import { optionalAuth } from "../middleware/auth.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { openrouter } from "../config/openrouter.js";
import rateLimit from "express-rate-limit";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TTFT_TIMEOUT_MS = 4000;

// ─── KNOWLEDGE BASE ───────────────────────────────────────────────────────────
// Loaded once at startup. Never re-read from disk per request.
const KASHMIR_KNOWLEDGE_BASE = fs.readFileSync(
  path.join(__dirname, "../Knowledge/kashmir-knowledge-base.md"),
  "utf-8"
);

// Split KB into sections at startup
const parsedKBSections = new Map();
const kbParts = KASHMIR_KNOWLEDGE_BASE.split(/^## /m);
for (let i = 1; i < kbParts.length; i++) {
  const sectionText = "## " + kbParts[i];
  const firstLine = sectionText.split("\n")[0].toLowerCase();
  
  let slug = "";
  if (firstLine.includes("cuisine")) slug = "cuisine";
  else if (firstLine.includes("wazwan") && !firstLine.includes("about")) slug = "wazwan";
  else if (firstLine.includes("culture") && !firstLine.includes("tea")) slug = "culture";
  else if (firstLine.includes("tourism")) slug = "tourism";
  else if (firstLine.includes("handicrafts")) slug = "handicrafts";
  else if (firstLine.includes("history")) slug = "history";
  else if (firstLine.includes("phrases")) slug = "phrases";
  else if (firstLine.includes("faq")) slug = "faq";
  else if (firstLine.includes("insider")) slug = "insider";
  else if (firstLine.includes("knowledge graph")) slug = "knowledge_graph";
  else if (firstLine.includes("about")) slug = "about_creator";
  else if (firstLine.includes("urban")) slug = "urban_essentials";
  else if (firstLine.includes("tujj")) slug = "tujj";
  else if (firstLine.includes("tea")) slug = "tea_culture";
  else if (firstLine.includes("transportation")) slug = "transportation";
  
  if (slug) {
    parsedKBSections.set(slug, sectionText.trim());
  }
}

const KB_KEYWORD_MAP = {
  cuisine: ["food", "cuisine", "dish", "eat", "meal", "recipe"],
  wazwan: ["wazwan", "feast", "gushtaba", "rista", "tabak", "yakhni", "royal"],
  culture: ["culture", "tradition", "festival", "pheran", "dress"],
  tourism: ["visit", "place", "destination", "garden", "lake", "gulmarg", "pahalgam", "sonmarg", "tulip"],
  handicrafts: ["shawl", "pashmina", "carpet", "papier", "handicraft", "souvenir", "artisan"],
  history: ["history", "timeline", "century", "empire", "ruler", "dynasty"],
  phrases: ["phrase", "language", "koshur", "translate", "say", "word"],
  faq: [],
  insider: ["insider", "secret", "hidden", "tip", "local only"],
  knowledge_graph: [],
  about_creator: ["founder", "creator", "owner", "nasir", "who made", "about you", "who owns", "team", "ceo", "run", "behind", "develop", "who is", "head"],
  urban_essentials: ["salon", "haircut", "barber", "ice cream", "dessert", "sweet"],
  tujj: ["tujj", "barbeque", "bbq", "seekh", "khayam", "makai"],
  tea_culture: ["tea", "kahwa", "noon chai", "chai", "samovar"],
  transportation: ["taxi", "fare", "transport", "cab", "auto", "ride"]
};

// ─── STATIC SYSTEM PROMPT CORE ────────────────────────────────────────────────
// Built ONCE at server startup, not on every request.
// Dynamic parts (date, context) are appended at request time, keeping this
// immutable portion out of the per-request hot path.
const SYSTEM_PROMPT_CORE = `You are Waza AI, the Kashmiri food and culture assistant for Wazwan Way. Be warm, knowledgeable, and concise.

CONTINUITY INSTRUCTION: If the user's message is short, a reaction, or uses pronouns/vague references ('it', 'that', 'there', 'really?', 'how far'), resolve it against the subject of the immediately preceding assistant turn before answering. Do not default to a generic Kashmir overview when the recent conversation already establishes a specific topic.

SCOPE: Kashmiri cuisine, Wazwan dishes, recipes, restaurants, culture, tourism.

FORMATTING — always use Markdown. Never write walls of text.

Recipe format:
# Recipe Name | Brief intro | ## Ingredients (bullets) | ## Instructions (numbered) | ## Times (Prep/Cook/Total) | ## Servings | ## Waza AI Tip

Restaurant format:
# Name | ## Why Visit | ## Signature Dishes | ## Location | ## Best For | ## Scores (Authenticity X/5, Tourist Friendliness X/5, Luxury X/5)

Dish format:
# Name | ## What Is It? | ## Flavor Profile | ## Cultural Significance | ## Scores (same)

Destination format:
# Name | ## Overview | ## Key Attractions | ## Best Time to Visit | ## Scores (same)

RULES:
- You must answer ONLY using the retrieved knowledge provided to you.
- NEVER invent or assume facts, names, organizations, founders, owners, or historical information.
- If the retrieved context does not contain the answer, clearly state: "I couldn't find reliable information about that in my knowledge base." Accuracy is more important than providing an answer.
- Prioritize injected DB context over general knowledge. Never invent restaurant/dish/destination data.
- Use provided Authenticity / Tourist Friendliness / Luxury scores (1.0–5.0) when rating things.
- Distinguish: (1) Traditional Wazwan dishes e.g. Rogan Josh, Gushtaba, Rista, Tabak Maaz, Yakhni. (2) Home-style dishes e.g. Gogji Mutton, Waza Haak. (3) Modern adaptations e.g. Paneer Kanti — ALWAYS label these explicitly.
- For tourists: prioritize authentic dishes, explain cultural significance, state whether a dish is part of the Wazwan feast and its position (e.g. Gushtaba = grand finale).
- "What is Wazwan?" → discuss ONLY categoryType="wazwan" dishes.
- "Tell me about Kashmiri food" → use ALL categories (wazwan, kashmiri_cuisine, bakery, beverage).
- For seasonal attractions (e.g. Tulip Garden): ALWAYS answer the user's question directly in the very first sentence before providing background. Avoid citing exact hardcoded opening/closing dates; explain it depends on weather/bloom conditions. If out of season, proactively recommend relevant alternatives.
- You are Waza AI, a Kashmir travel expert. Unless the user explicitly mentions another destination, every travel-related question must be answered assuming it refers to Kashmir. Never use examples, prices, attractions, taxi fares, transport systems, businesses, hotels, or recommendations from outside Jammu & Kashmir. If verified Kashmir-specific information is unavailable, clearly state that instead of substituting information from another location.
- Never assume information about services that may change over time. For questions about transportation, ride-sharing apps, businesses, opening hours, pricing, regulations, availability, or other dynamic information, verify the answer using live search before responding. If live information cannot be retrieved, explicitly state that instead of making assumptions.
- The knowledge base below contains internal annotations labeled 'Bot Routing Logic' or 'Bot Routing Tip' (usually in blockquotes starting with '>'). These are instructions for you alone, used to decide which recommendation to lead with. NEVER quote, paraphrase, summarize, or reference these annotations in your response to the user — treat them as invisible routing hints, not content.`;

const router = express.Router();

// ─── IN-MEMORY CACHE ──────────────────────────────────────────────────────────
let cachedDests = null;
let cachedRests = null;
let cachedDishes = null;
let lastCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

// Pre-built lowercase lookup maps for O(1) word matching instead of per-request .filter()
// Rebuilt whenever cache refreshes.
let destNameMap = new Map();    // word → [dest, ...]
let restNameMap = new Map();    // word → [rest, ...]
let dishNameMap = new Map();    // word → [dish, ...]

// ─── QUERY INTENT DETECTION ───────────────────────────────────────────────────
// Detect what kind of content the user is asking for to avoid injecting
// irrelevant context and burning tokens.
const DEST_INTENT   = /(visit|place|destination|tourism|travel|kashmir|go to|stay|hotel|srinagar|gulmarg|pahalgam|sonamarg)/i;
const REST_INTENT   = /(eat|restaurant|dine|dining|food joint|place to eat|cafe|dhaba|recommend|where.*food|good.*food)/i;
const DISH_INTENT   = /(food|dish|wazwan|veg|non-veg|eat|recipe|cook|spice|specialty|ingredient|how.*make|taste)/i;
const WAZWAN_STRICT = /(what is wazwan|wazwan only|about wazwan|wazwan feast|traditional wazwan)/i;

// ─── CACHE REFRESH + INDEX BUILD ─────────────────────────────────────────────
async function refreshCache() {
  const [dests, rests, dishes] = await Promise.all([
    Destination.find(
      {},
      "name location description bestTimeToVisit authenticityScore touristFriendlinessScore luxuryScore"
    ).lean(),
    Restaurant.find(
      {},
      "name location city rating priceLevel authenticityScore touristFriendlinessScore luxuryScore"
    ).lean(),
    Dish.find(
      {},
      "name description category categoryType foodType authenticityScore touristFriendlinessScore luxuryScore"
    ).lean(),
  ]);

  cachedDests = dests;
  cachedRests = rests;
  cachedDishes = dishes;
  lastCacheTime = Date.now();

  // Build inverted word → record maps for fast lookup
  destNameMap = new Map();
  for (const d of dests) {
    for (const word of `${d.name} ${d.location}`.toLowerCase().split(/\s+/)) {
      if (word.length > 2) {
        if (!destNameMap.has(word)) destNameMap.set(word, []);
        destNameMap.get(word).push(d);
      }
    }
  }

  restNameMap = new Map();
  for (const r of rests) {
    for (const word of `${r.name} ${r.city}`.toLowerCase().split(/\s+/)) {
      if (word.length > 2) {
        if (!restNameMap.has(word)) restNameMap.set(word, []);
        restNameMap.get(word).push(r);
      }
    }
  }

  dishNameMap = new Map();
  for (const d of dishes) {
    for (const word of `${d.name} ${d.category}`.toLowerCase().split(/\s+/)) {
      if (word.length > 2) {
        if (!dishNameMap.has(word)) dishNameMap.set(word, []);
        dishNameMap.get(word).push(d);
      }
    }
  }
}

// ─── FAST LOOKUP via inverted index ───────────────────────────────────────────
function lookupByWords(wordMap, queryWords) {
  const seen = new Set();
  const results = [];
  for (const word of queryWords) {
    const matches = wordMap.get(word) || [];
    for (const item of matches) {
      const id = item._id?.toString() || item.name;
      if (!seen.has(id)) {
        seen.add(id);
        results.push(item);
      }
    }
  }
  return results;
}

// ─── CONTEXT SERIALIZERS (compact format = fewer tokens) ──────────────────────
function serializeDest(d) {
  return `**${d.name}** (${d.location}) — ${d.description} | Best time: ${d.bestTimeToVisit} | Auth: ${d.authenticityScore}/5, TF: ${d.touristFriendlinessScore}/5, Lux: ${d.luxuryScore}/5`;
}
function serializeRest(r) {
  return `**${r.name}** (${r.city}) — Rating: ${r.rating}/5, Price: ${r.priceLevel} | Auth: ${r.authenticityScore}/5, TF: ${r.touristFriendlinessScore}/5, Lux: ${r.luxuryScore}/5`;
}
function serializeDish(d) {
  return `**${d.name}** [${d.categoryType}/${d.foodType}] — ${d.description} | Auth: ${d.authenticityScore}/5, TF: ${d.touristFriendlinessScore}/5, Lux: ${d.luxuryScore}/5`;
}

// ─── MODEL CONFIG ─────────────────────────────────────────────────────────────
// PRIMARY: nemotron-3-ultra-550b — free, 1M context, strong multi-step reasoning, MoE architecture.
// FALLBACK 1: llama-3.1-8b — extremely fast, good for scoped domains.
// FALLBACK 2: qwen3-32b — original model, still available if others fail.
// REMOVE :free tags when you have budget — free tier adds queue latency.
const MODELS = [
  "meta-llama/llama-3.1-8b-instruct",      // ~100–250ms TTFT, blazing fast streaming
  "nvidia/nemotron-3-ultra-550b-a55b:free", // Strong reasoning but very slow word-by-word streaming
  "qwen/qwen3-32b",                        // original fallback — slower but proven
];

// ─── HISTORY WINDOW ───────────────────────────────────────────────────────────
// Keep only the last N turns. Beyond 6 turns, older context rarely helps a food chatbot
// but linearly increases the token count the model must process before writing token 1.
const MAX_HISTORY_TURNS = 6; // 3 user + 3 assistant

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per window (here, per minute)
  standardHeaders: true,
  legacyHeaders: false,
  message: { reply: "Too many messages sent. Please wait a minute and try again." } // Return JSON matching the frontend's expected format
});

router.post(
  "/",
  chatLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { messages } = req.body;
    const reqId = crypto.randomUUID().slice(0, 8);
    const reqStartTime = Date.now();
    console.log(`[WazaAI:${reqId}] Request started`);

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array" });
    }

    // ── Guest Limit Check ───────────────────────────────────────────────────
    if (!req.user) {
      const isRecipeExplore = req.body.isRecipeExplore === true;
      let isTripPlanner = req.body.isTripPlanner === true;
      if (!isTripPlanner && messages && messages.length > 0) {
        const lastMsg = messages[messages.length - 1]?.content || "";
        if (lastMsg.includes("act as an expert Kashmir Trip Planner")) {
          isTripPlanner = true;
        }
      }
      
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 86400 * 1000 // 24 hours in milliseconds
      };

      if (!isTripPlanner) {
        if (isRecipeExplore) {
          const recipeCount = parseInt(req.cookies.waza_guest_recipe_count || '0', 10);
          if (recipeCount >= 2) {
            console.log(`[WazaAI:${reqId}] Guest recipe limit reached. Returning 401.`);
            return res.status(401).json({
              requiresAuth: true,
              message: "Sign in to continue exploring secret recipes."
            });
          }
          res.cookie('waza_guest_recipe_count', (recipeCount + 1).toString(), cookieOptions);
        } else {
          const guestCount = parseInt(req.cookies.waza_guest_chat_count || '0', 10);
          if (guestCount >= 1) {
            console.log(`[WazaAI:${reqId}] Guest chat limit reached. Returning 401.`);
            return res.status(401).json({
              requiresAuth: true,
              message: "Sign in to continue chatting with Waza AI"
            });
          }
          res.cookie('waza_guest_chat_count', (guestCount + 1).toString(), cookieOptions);
        }
      }
    }

    // ── SSE headers set immediately so browser starts listening ─────────────
    // Set these AFTER the guest limit check so we don't open a stream if rejected.
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    // Disable Nginx/proxy buffering so chunks reach the browser instantly
    res.setHeader("X-Accel-Buffering", "no");

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      res.write(`data: ${JSON.stringify({ reply: "Missing OPENROUTER_API_KEY on server." })}\n\n`);
      return res.end();
    }

    // ── Cache refresh (async, non-blocking for hits) ─────────────────────────
    // On a cache MISS this awaits. On a HIT (99% of requests) this is instant.
    if (!cachedDests || Date.now() - lastCacheTime > CACHE_TTL) {
      try {
        console.time(`[WazaAI:${reqId}] Cache refresh`);
        await refreshCache();
        console.timeEnd(`[WazaAI:${reqId}] Cache refresh`);
      } catch (dbErr) {
        console.error(`[WazaAI:${reqId}] Cache refresh failed:`, dbErr);
        // Proceed without DB context rather than failing entirely
      }
    }

    // ── Query analysis (all synchronous, ~0ms) ───────────────────────────────
    const lastMessage = messages[messages.length - 1]?.content || "";
    const prevMessage = messages.length > 1 ? messages[messages.length - 2]?.content || "" : "";
    const lowerMsg = (prevMessage + " " + lastMessage).toLowerCase();
    const queryWords = lowerMsg.split(/\s+/).filter(w => w.length > 2);
    const isWazwanStrict = WAZWAN_STRICT.test(lowerMsg);

    const DYNAMIC_INTENT = /\b(uber|ola|rapido|taxi|cab|fare|price|cost|open|close|time|hour|available|availability|weather)\b/i;
    const isDynamic = DYNAMIC_INTENT.test(lowerMsg);

    // ── Context retrieval via inverted index (~0–2ms) ─────────────────────────
    let contextString = "";

    // Destinations
    if (DEST_INTENT.test(lowerMsg)) {
      let dests = lookupByWords(destNameMap, queryWords);
      if (dests.length === 0) dests = cachedDests?.slice(0, 5) ?? [];
      if (dests.length > 0) {
        contextString += "\nDESTINATIONS:\n" + dests.slice(0, 6).map(serializeDest).join("\n");
      }
    }

    // Restaurants
    if (REST_INTENT.test(lowerMsg)) {
      let rests = lookupByWords(restNameMap, queryWords);
      if (rests.length === 0) rests = cachedRests?.slice(0, 5) ?? [];
      if (rests.length > 0) {
        contextString += "\nRESTAURANTS:\n" + rests.slice(0, 6).map(serializeRest).join("\n");
      }
    }

    // Dishes — with Wazwan strict mode
    if (DISH_INTENT.test(lowerMsg) || isWazwanStrict) {
      const dishPool = isWazwanStrict
        ? (cachedDishes?.filter(d => d.categoryType === "wazwan") ?? [])
        : (cachedDishes ?? []);

      // For strict Wazwan queries, build a temporary map of only wazwan dishes
      let dishes;
      if (isWazwanStrict) {
        // Simple filter from pool since we can't pre-build a wazwan-only map efficiently
        dishes = dishPool.filter(d =>
          queryWords.some(w => d.name.toLowerCase().includes(w) || d.category.toLowerCase().includes(w))
        );
        if (dishes.length === 0) dishes = dishPool.slice(0, 8);
      } else {
        dishes = lookupByWords(dishNameMap, queryWords);
        if (dishes.length === 0) dishes = dishPool.slice(0, 8);
      }

      if (dishes.length > 0) {
        contextString += "\nDISHES:\n" + dishes.slice(0, 10).map(serializeDish).join("\n");
      }
    }

    // ── KB Section Retrieval ──────────────────────────────────────────────────
    let scoredSections = [];
    for (const [slug, keywords] of Object.entries(KB_KEYWORD_MAP)) {
      if (slug === 'faq' || slug === 'knowledge_graph') continue;
      
      let score = 0;
      for (const kw of keywords) {
        // use word boundaries so "eat" doesn't match "great"
        if (new RegExp("\\b" + kw + "\\b", "i").test(lowerMsg)) score++;
      }
      if (score > 0) {
        scoredSections.push({ slug, score });
      }
    }
    
    // Sort descending by score
    scoredSections.sort((a, b) => b.score - a.score);
    
    let injectedSections = [];
    if (scoredSections.length > 0) {
      for (let i = 0; i < Math.min(5, scoredSections.length); i++) {
        injectedSections.push(parsedKBSections.get(scoredSections[i].slug));
      }
      if (scoredSections.length < 5) {
        if (!scoredSections.find(s => s.slug === "faq")) injectedSections.push(parsedKBSections.get("faq"));
      }
    } else {
      injectedSections.push(parsedKBSections.get("faq"));
      injectedSections.push(parsedKBSections.get("cuisine"));
    }
    
    injectedSections = injectedSections.filter(Boolean);
    
    const kbContextString = "\n\nKNOWLEDGE BASE (ground truth — prefer DB context if it conflicts for specific items):\n" + injectedSections.join("\n\n");

    // ── Build final system prompt ─────────────────────────────────────────────
    // Date injected here (not in the static core) so the core stays cacheable.
    const currentDateTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "short", // "short" vs "medium" saves ~10 tokens
    });

    const fullSystemPrompt =
      `Today: ${currentDateTime} IST\n\n` +
      SYSTEM_PROMPT_CORE +
      kbContextString +
      (contextString
        ? `\n\n--- DB CONTEXT (prioritize over general knowledge) ---\n${contextString}`
        : "");

    // ── History truncation ────────────────────────────────────────────────────
    // Keep only the last MAX_HISTORY_TURNS messages (alternating user/assistant).
    // Walk backward from the end, collect up to limit, preserve alternation.
    const rawMessages = messages.map(msg => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    }));

    // Pre-Generation Geographic Forcing
    // If the user's message is dynamic and lacks Kashmir-specific keywords, append " in Kashmir"
    // so the live web search tool doesn't fetch national/global results (e.g. Sikkim).
    if (rawMessages.length > 0) {
      const lastMsgObj = rawMessages[rawMessages.length - 1];
      if (lastMsgObj.role === "user") {
        const KASHMIR_KEYWORDS = /\b(kashmir|srinagar|gulmarg|pahalgam|sonamarg|jammu|gurez|yusmarg|doodhpathri|anantnag|baramulla|bandipora|kupwara|shopian|pulwama|budgam|kulgam|ganderbal|dal lake|nigeen)\b/i;
        if (!KASHMIR_KEYWORDS.test(lastMsgObj.content)) {
          lastMsgObj.content += " in Kashmir";
        }
      }
    }

    const truncated = [];
    let expectedRole = "user";
    for (let i = rawMessages.length - 1; i >= 0 && truncated.length < MAX_HISTORY_TURNS; i--) {
      if (rawMessages[i].role === expectedRole) {
        truncated.unshift(rawMessages[i]);
        expectedRole = expectedRole === "user" ? "assistant" : "user";
      }
    }

    const finalMessages = [
      { role: "system", content: fullSystemPrompt },
      ...truncated,
    ];

    // ── LLM call with model fallback ──────────────────────────────────────────
    let stream = null;
    let lastError = null;
    let winningModel = null;
    let firstChunk = null;
    let asyncIterator = null;

    for (const model of MODELS) {
      console.log(`[WazaAI:${reqId}] Attempting model ${model}...`);
      const attemptStartTime = Date.now();
      try {
        const requestPayload = {
          model,
          messages: finalMessages,
          stream: true,
          temperature: 0.3,   // Lower = faster sampling + more consistent structured output
          max_tokens: 1024,   // ⚡ KEY FIX: was 8192. Food answers rarely need >600 tokens.
                              // This is the single biggest latency lever after model choice.
                              // Increase to 1500 only if recipes are getting cut off.
        };

        if (isDynamic) {
          requestPayload.plugins = [{ id: "web", max_results: 5 }];
        }

        const rawStream = await openrouter.chat.completions.create(requestPayload);

        const iterator = rawStream[Symbol.asyncIterator]();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("TTFT Timeout")), TTFT_TIMEOUT_MS)
        );

        const chunkResult = await Promise.race([iterator.next(), timeoutPromise]);

        firstChunk = chunkResult;
        stream = rawStream;
        asyncIterator = iterator;
        winningModel = model;
        console.log(`[WazaAI:${reqId}] Model ${model} TTFT: ${Date.now() - attemptStartTime}ms`);
        break;
      } catch (err) {
        if (err.status === 404 || (err.message && err.message.includes("404"))) {
          console.error(`[WazaAI:${reqId}] Model ${model} failed with 404 (Dead/renamed slug) after ${Date.now() - attemptStartTime}ms:`, err.message);
        } else {
          console.warn(`[WazaAI:${reqId}] Model ${model} failed after ${Date.now() - attemptStartTime}ms:`, err.message);
        }
        lastError = err;
      }
    }

    if (!stream) {
      console.error(`[WazaAI:${reqId}] All models exhausted. Last error:`, lastError);
      res.write(
        `data: ${JSON.stringify({ reply: "All of our chef's kitchens are very busy right now. Please try again in a moment." })}\n\n`
      );
      res.end();
      console.log(`[WazaAI:${reqId}] Request finished in ${Date.now() - reqStartTime}ms`);
      return;
    }

    // ── Stream response back to client ───────────────────────────────────────
    let hasSentText = false;
    let cachedTokens = null;
    
    res.on("finish", () => {
      console.log(`[WazaAI:${reqId}] Request finished in ${Date.now() - reqStartTime}ms using ${winningModel}` + (cachedTokens != null ? ` (Cached tokens: ${cachedTokens})` : ""));
    });

    try {
      const processChunk = (chunk) => {
        if (!chunk.value) return;
        const text = chunk.value.choices?.[0]?.delta?.content || "";
        if (text) {
          hasSentText = true;
          res.write(`data: ${JSON.stringify({ reply: text })}\n\n`);
        }
        
        // TODO: OpenRouter supports Anthropic's explicit prompt caching.
        // If switching to Claude 3.5, wrap the SYSTEM_PROMPT_CORE in a message with:
        // { type: "text", text: fullSystemPrompt, cache_control: { type: "ephemeral" } }
        // For Gemini Flash/Llama via OpenRouter, caching is based on implicit prefix matching 
        // where supported. We log the usage stats below to empirically verify.
        
        if (chunk.value.usage?.prompt_tokens_details?.cached_tokens !== undefined) {
          cachedTokens = chunk.value.usage.prompt_tokens_details.cached_tokens;
        } else if (chunk.value.usage?.cached_tokens !== undefined) {
          cachedTokens = chunk.value.usage.cached_tokens;
        }
      };

      // Process the preserved first chunk
      processChunk(firstChunk);

      // Consume the rest of the iterator
      while (true) {
        const nextChunk = await asyncIterator.next();
        if (nextChunk.done) break;
        processChunk(nextChunk);
      }

      if (!hasSentText) {
        res.write(
          `data: ${JSON.stringify({
            reply: "I don't have enough information to answer that correctly. Ask me about Kashmiri food, recipes, restaurants, or destinations!",
          })}\n\n`
        );
      }
    } catch (err) {
      console.error(`[WazaAI:${reqId}] Stream error:`, err);
      res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
    } finally {
      res.end();
    }
  })
);

// ─── CACHE WARM-UP ON IMPORT ──────────────────────────────────────────────────
// Pre-load DB into memory when the server starts so the first user request
// never waits for a cold MongoDB fetch. Errors are non-fatal.
refreshCache().catch(err => console.warn("[WazaAI] Initial cache warm-up failed:", err.message));

export default router;
