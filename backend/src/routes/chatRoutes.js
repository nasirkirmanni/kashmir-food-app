import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Dish } from "../models/Dish.js";
import { Restaurant } from "../models/Restaurant.js";
import { Destination } from "../models/Destination.js";

const router = express.Router();

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        reply: "I am missing my GEMINI_API_KEY on the server. Please ensure it is set in your backend .env file."
      });
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
  * When users ask "Tell me about Kashmiri food" or general questions about Kashmiri cuisine, you must use all categories (wazwan, kashmiri_cuisine, bakery, beverage) to present a complete, rich picture of the region's culinary culture.`;

    // Dynamic context retrieval from database based on message queries
    let contextString = "";
    try {
      const lastMessage = messages[messages.length - 1]?.content || "";
      const queryWords = lastMessage.toLowerCase().split(/\s+/);

      // Search destinations
      const dests = await Destination.find({}, "name location description bestTimeToVisit authenticityScore touristFriendlinessScore luxuryScore").lean();
      const matchedDests = dests.filter(d => 
        queryWords.some(word => d.name.toLowerCase().includes(word) || d.location.toLowerCase().includes(word))
      );
      
      const finalDests = matchedDests.length > 0 ? matchedDests : (
        lastMessage.toLowerCase().match(/(visit|place|destination|tourism|travel|kashmir|go to|stay|hotel)/)
        ? dests.slice(0, 8) : []
      );

      if (finalDests.length > 0) {
        contextString += "\n\nKASHMIR DESTINATIONS:\n" + finalDests.map(d => 
          `- Name: ${d.name}\n  Location: ${d.location}\n  Description: ${d.description}\n  Best Time to Visit: ${d.bestTimeToVisit}\n  Scores: Authenticity: ${d.authenticityScore}/5, Tourist Friendliness: ${d.touristFriendlinessScore}/5, Luxury: ${d.luxuryScore}/5`
        ).join("\n");
      }

      // Search restaurants
      const rests = await Restaurant.find({}, "name location city rating priceLevel authentic authenticityScore touristFriendlinessScore luxuryScore").lean();
      const matchedRests = rests.filter(r => 
        queryWords.some(word => r.name.toLowerCase().includes(word) || r.city.toLowerCase().includes(word))
      );
      
      const finalRests = matchedRests.length > 0 ? matchedRests : (
        lastMessage.toLowerCase().match(/(eat|restaurant|dine|dining|food joint|place to eat|cafe|dhaba|recommend)/)
        ? rests.slice(0, 8) : []
      );

      if (finalRests.length > 0) {
        contextString += "\n\nRESTAURANTS:\n" + finalRests.map(r => 
          `- Name: ${r.name}\n  Location: ${r.location}, ${r.city}\n  Rating: ${r.rating}/5, Price: ${r.priceLevel}\n  Scores: Authenticity: ${r.authenticityScore}/5, Tourist Friendliness: ${r.touristFriendlinessScore}/5, Luxury: ${r.luxuryScore}/5`
        ).join("\n");
      }

      // Search dishes with categoryType filtering
      const dishes = await Dish.find({}, "name description category categoryType foodType authenticityScore touristFriendlinessScore luxuryScore").lean();
      
      let filteredDishes = dishes;
      const lowerLastMessage = lastMessage.toLowerCase();
      const isWazwanQuery = lowerLastMessage.includes("what is wazwan") || 
                            lowerLastMessage.includes("wazwan only") ||
                            (lowerLastMessage.includes("wazwan") && !lowerLastMessage.includes("kashmiri food") && !lowerLastMessage.includes("kashmiri cuisine"));
      
      if (isWazwanQuery) {
        filteredDishes = dishes.filter(d => d.categoryType === "wazwan");
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

    // Map the messages to the format Gemini expects
    const geminiMessages = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" : msg.role,
      parts: [{ text: msg.content }]
    }));

    // Calling Gemini Flash Lite
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt + (contextString ? "\n\nCRITICAL CONTEXT FROM DATABASE (Prioritize this data over general knowledge):\n" + contextString : "") }]
        },
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API Error:", errorData);
      
      if (response.status === 429) {
         return res.json({ reply: "I am experiencing high traffic right now and hit a rate limit. Please try again in a moment." });
      } else if (response.status === 503) {
         return res.json({ reply: "The kitchen is a bit overloaded at the moment (Gemini API 503 Error). Please try again in a few seconds." });
      }
      
      return res.status(500).json({ error: "Failed to communicate with Gemini" });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I could not process that request.";

    return res.json({ reply });
  })
);

export default router;
