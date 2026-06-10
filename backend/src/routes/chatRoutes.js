import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";

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

When explaining a dish, ALWAYS use:

# Dish Name
## What Is It?
## Ingredients
## Flavor Profile
## Cultural Significance

Additional Rules:
* Keep responses clean and structured.
* Use proper spacing between sections.
* Prefer lists over long paragraphs.
* Maintain a warm Kashmiri hospitality tone.
* If information about restaurants or dishes is provided in the request context, prioritize that information over general knowledge.
* Do not invent restaurant data.`;

    // Map the messages to the format Gemini expects
    const geminiMessages = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" : msg.role,
      parts: [{ text: msg.content }]
    }));

    // Calling Gemini Flash Lite
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
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
