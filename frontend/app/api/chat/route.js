import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { reply: "I am missing my GEMINI_API_KEY. Please ensure it is set in your .env.local file." },
        { status: 200 } // Send as normal reply so UI displays it gracefully
      );
    }

    const systemPrompt = `You are Waza AI, the official AI guide of Wazwan Way.

Your expertise includes:

* Kashmiri Wazwan dishes
* Kashmiri cuisine
* Ingredients
* Restaurant recommendations
* Kashmiri culinary traditions

You should answer naturally and conversationally.

If information about restaurants or dishes is provided in the request context, prioritize that information over general knowledge.

Do not invent restaurant data.`;

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
          maxOutputTokens: 2500,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      
      // Specific error handling
      if (response.status === 429) {
         return NextResponse.json({ reply: "I am experiencing high traffic right now and hit a rate limit. Please try again in a moment." }, { status: 200 });
      } else if (response.status === 503) {
         return NextResponse.json({ reply: "The kitchen is a bit overloaded at the moment (Gemini API 503 Error). Please try again in a few seconds." }, { status: 200 });
      }
      
      return NextResponse.json({ error: "Failed to communicate with Gemini" }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I could not process that request.";

    // Return in the exact format the existing Waza AI frontend expects
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

