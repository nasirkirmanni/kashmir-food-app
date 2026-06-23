import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Dish } from "../models/Dish.js";
import { Restaurant } from "../models/Restaurant.js";
import { Destination } from "../models/Destination.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { openrouter } from "../config/openrouter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KASHMIR_KNOWLEDGE_BASE = fs.readFileSync(
  path.join(__dirname, "../Knowledge/kashmir-knowledge-base.md"),
  "utf-8"
);

const router = express.Router();

let cachedDests = null;
let cachedRests = null;
let cachedDishes = null;
let lastCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.write(`data: ${JSON.stringify({ reply: "I am missing my OPENROUTER_API_KEY on the server. Please ensure it is set in your backend .env file." })}\n\n`);
      return res.end();
    }

    const currentDateTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "medium"
    });

    const systemPrompt = `You are Waza AI, the premium Kashmiri food and culture assistant for Wazwan Way.
The current date and time is ${currentDateTime} (Indian Standard Time).

You specialize in:

* Kashmiri cuisine
* Wazwan dishes
* Traditional recipes
* Kashmiri restaurants
* Kashmiri culture
* Kashmir tourism

FORMATTING RULES

Always use Markdown formatting.
Use headings, bullet lists, numbered lists, and paragraphs.
Never return large walls of text.

When responding with recipes, ALWAYS use the following format:

# Recipe Name
Brief introduction

## Ingredients
* ingredient
* ingredient

## Instructions
1. Step one
2. Step two

## Preparation Time
* Prep Time:
* Cook Time:
* Total Time:

## Servings
* Servings:

## Waza AI Tip
Helpful cooking tip.

When recommending restaurants, ALWAYS use:

# Restaurant Name
## Why Visit
## Signature Dishes
## Location
## Best For
## Ratings & Scores
* Authenticity Score: X.X/5
* Tourist Friendliness Score: X.X/5
* Luxury Score: X.X/5

When explaining a dish, ALWAYS use:

# Dish Name
## What Is It?
## Flavor Profile
## Cultural Significance
## Ratings & Scores
* Authenticity Score: X.X/5
* Tourist Friendliness Score: X.X/5
* Luxury Score: X.X/5

When explaining a Kashmir destination, ALWAYS use:

# Destination Name
## Overview
## Key Attractions
## Best Time to Visit
## Ratings & Scores
* Authenticity Score: X.X/5
* Tourist Friendliness Score: X.X/5
* Luxury Score: X.X/5

Additional Rules:
* Keep responses clean and structured.
* Use proper spacing between sections.
* Prefer lists over long paragraphs.
* Maintain a warm Kashmiri hospitality tone.
* If information about restaurants, destinations, or dishes is provided in the request context, prioritize that information over general knowledge.
* Do not invent restaurant, destination, or dish data.
* Utilize the Authenticity, Tourist Friendliness, and Luxury scores (rated 1.0 to 5.0) when answering inquiries about ratings, luxury, authenticity, or tourist friendliness.
* CULINARY AUTHENTICITY RULES:
  * When discussing dishes, prioritize dishes marked as authentic Kashmiri and those with the highest authenticity scores from the context.
  * Distinguish clearly between:
    1. Traditional Kashmiri dishes (e.g., Rogan Josh, Gushtaba, Rista, Tabak Maaz, Yakhni).
    2. Regional or home-style dishes (e.g., Gogji Mutton, Al-Hachh Mutton, Waza Haak).
    3. Modern restaurant adaptations (e.g., Paneer Kanti, Fish Kanti, Wazwaan Mushroom, Kashmiri Naan).
  * If a dish is classified as a modern restaurant adaptation, you MUST explicitly state this in your explanation. Never present restaurant-created adaptations as traditional Wazwan dishes.
* TOURIST RECOMMENDATION RULES:
  * When recommending dishes to tourists, prioritize core authentic dishes.
  * Always explain the cultural significance of the recommended dish.
  * Explicitly state whether the dish is part of the traditional Wazwan feast (and its role/position in the feast progression, such as Gushtaba being the grand finale) or if it is a daily home-style dish.
* WAZWAN & KASHMIRI FOOD RULES:
  * When users ask "What is Wazwan?" or ask about traditional Wazwan feasts, you must ONLY recommend/discuss dishes classified as categoryType = "wazwan". Do not mention or recommend everyday Kashmiri dishes, bakery items, or beverages in this context.
  * When users ask "Tell me about Kashmiri food" or general questions about Kashmiri cuisine, you must use all categories (wazwan, kashmiri_cuisine, bakery, beverage) to present a complete, rich picture of the region's culinary culture.

REFERENCE KNOWLEDGE BASE
Use the following as your factual reference for Kashmir cuisine, culture, history, handicrafts, destinations, and tourist FAQs. Treat this as ground truth and prefer it over general knowledge or assumptions. If the database context provided elsewhere in this prompt conflicts with this reference for a specific dish/restaurant/destination, prioritize the database context (it's more current), but otherwise rely on this knowledge base.

${KASHMIR_KNOWLEDGE_BASE}`;

    // Dynamic context retrieval from database based on message queries
    let contextString = "";
    try {
      const lastMessage = messages[messages.length - 1]?.content || "";
      const queryWords = lastMessage.toLowerCase().split(/\s+/);

      // Fetch or use cached data
      if (!cachedDests || Date.now() - lastCacheTime > CACHE_TTL) {
        const [dests, rests, dishes] = await Promise.all([
          Destination.find({}, "name location description bestTimeToVisit authenticityScore touristFriendlinessScore luxuryScore").lean(),
          Restaurant.find({}, "name location city rating priceLevel authentic authenticityScore touristFriendlinessScore luxuryScore").lean(),
          Dish.find({}, "name description category categoryType foodType authenticityScore touristFriendlinessScore luxuryScore").lean()
        ]);
        cachedDests = dests;
        cachedRests = rests;
        cachedDishes = dishes;
        lastCacheTime = Date.now();
      }

      // Search destinations
      const matchedDests = cachedDests.filter(d =>
        queryWords.some(word => d.name.toLowerCase().includes(word) || d.location.toLowerCase().includes(word))
      );

      const finalDests = matchedDests.length > 0 ? matchedDests : (
        lastMessage.toLowerCase().match(/(visit|place|destination|tourism|travel|kashmir|go to|stay|hotel)/)
          ? cachedDests.slice(0, 8) : []
      );

      if (finalDests.length > 0) {
        contextString += "\n\nKASHMIR DESTINATIONS:\n" + finalDests.map(d =>
          `- Name: ${d.name}\n  Location: ${d.location}\n  Description: ${d.description}\n  Best Time to Visit: ${d.bestTimeToVisit}\n  Scores: Authenticity: ${d.authenticityScore}/5, Tourist Friendliness: ${d.touristFriendlinessScore}/5, Luxury: ${d.luxuryScore}/5`
        ).join("\n");
      }

      // Search restaurants
      const matchedRests = cachedRests.filter(r =>
        queryWords.some(word => r.name.toLowerCase().includes(word) || r.city.toLowerCase().includes(word))
      );

      const finalRests = matchedRests.length > 0 ? matchedRests : (
        lastMessage.toLowerCase().match(/(eat|restaurant|dine|dining|food joint|place to eat|cafe|dhaba|recommend)/)
          ? cachedRests.slice(0, 8) : []
      );

      if (finalRests.length > 0) {
        contextString += "\n\nRESTAURANTS:\n" + finalRests.map(r =>
          `- Name: ${r.name}\n  Location: ${r.location}, ${r.city}\n  Rating: ${r.rating}/5, Price: ${r.priceLevel}\n  Scores: Authenticity: ${r.authenticityScore}/5, Tourist Friendliness: ${r.touristFriendlinessScore}/5, Luxury: ${r.luxuryScore}/5`
        ).join("\n");
      }

      // Search dishes with categoryType filtering
      let filteredDishes = cachedDishes;
      const lowerLastMessage = lastMessage.toLowerCase();
      const isWazwanQuery = lowerLastMessage.includes("what is wazwan") ||
        lowerLastMessage.includes("wazwan only") ||
        (lowerLastMessage.includes("wazwan") && !lowerLastMessage.includes("kashmiri food") && !lowerLastMessage.includes("kashmiri cuisine"));

      if (isWazwanQuery) {
        filteredDishes = cachedDishes.filter(d => d.categoryType === "wazwan");
      }

      const matchedDishes = filteredDishes.filter(d =>
        queryWords.some(word => d.name.toLowerCase().includes(word) || d.category.toLowerCase().includes(word))
      );

      const finalDishes = matchedDishes.length > 0 ? matchedDishes : (
        lowerLastMessage.match(/(food|dish|wazwan|veg|non-veg|eat|recipe|cook|spice|specialty)/)
          ? filteredDishes.slice(0, 10) : []
      );

      if (finalDishes.length > 0) {
        contextString += "\n\nDISHES:\n" + finalDishes.map(d =>
          `- Name: ${d.name}\n  Type: ${d.foodType}, Category: ${d.category}, categoryType: ${d.categoryType}\n  Description: ${d.description}\n  Scores: Authenticity: ${d.authenticityScore}/5, Tourist Friendliness: ${d.touristFriendlinessScore}/5, Luxury: ${d.luxuryScore}/5`
        ).join("\n");
      }
    } catch (dbErr) {
      console.error("Failed to inject DB context in chat:", dbErr);
    }

    // Map the messages to the format OpenRouter expects
    let validMessages = messages.map(msg => ({
      role: msg.role === "assistant" ? "assistant" : msg.role,
      content: msg.content
    }));

    // Filter to ensure strictly alternating user/assistant pattern starting with user
    const filteredMessages = [];
    let expectedRole = "user";
    
    // We iterate backwards to keep the most recent context
    for (let i = validMessages.length - 1; i >= 0; i--) {
      // If we find the expected role, add it to the front of our valid array
      if (validMessages[i].role === expectedRole) {
        filteredMessages.unshift(validMessages[i]);
        // Toggle the expected role
        expectedRole = expectedRole === "user" ? "assistant" : "user";
      }
    }

    // Prepend the system prompt and context as the first message
    filteredMessages.unshift({
      role: "system",
      content: systemPrompt + (contextString ? "\n\nCRITICAL CONTEXT FROM DATABASE (Prioritize this data over general knowledge):\n" + contextString : "")
    });

    // Model Fallback Pool: If one hits a rate limit (429) or fails, try the next
    const modelsToTry = [
      "qwen/qwen3-32b", // Primary Qwen model (tested and fast)
      "google/gemma-4-26b-a4b-it:free" // Fallback free model
    ];
    let stream = null;
    let lastErrorData = null;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for (const model of modelsToTry) {
      try {
        stream = await openrouter.chat.completions.create({
          model: model,
          messages: filteredMessages,
          stream: true,
          temperature: 0.7,
          max_tokens: 8192,
        });
        break; // Success! Break out of the fallback loop.
      } catch (err) {
        console.warn(`Model ${model} hit an error. Falling back... Error:`, err.message);
        lastErrorData = err;
        continue;
      }
    }

    if (!stream) {
      console.error("OpenRouter API Exhausted all models. Last Error:", lastErrorData);
      res.write(`data: ${JSON.stringify({ reply: "All of our chef's kitchens are experiencing exceptionally high traffic right now. Please try again in a minute." })}\n\n`);
      return res.end();
    }

    let hasSentText = false;
    try {
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          hasSentText = true;
          res.write(`data: ${JSON.stringify({ reply: text })}\n\n`);
        }
      }

      if (!hasSentText) {
        res.write(`data: ${JSON.stringify({ reply: "I'm sorry, I don't have enough information to answer that question correctly. Is there anything else about Kashmiri food, culture, or destinations I can help you with?" })}\n\n`);
      }
    } catch (err) {
      console.error("Stream reading error:", err);
      res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
    } finally {
      res.end();
    }
  })
);

export default router;
