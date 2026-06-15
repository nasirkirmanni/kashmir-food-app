const promptText = `I want you to act as an expert Kashmir Trip Planner. 
Here are my trip details:
- Number of People: 2
- Travel Dates: 5 days
- Vibe / Interests: Adventure
- Budget: Under ₹10K
- Extras: Snow trek

You MUST return the response strictly in JSON format matching the following structure exactly (do not wrap in markdown tags like \\\`\\\`\\\`json):
{
  "title": "A catchy title for the trip",
  "summary": { "duration": "...", "budget": "...", "groupSize": "..." },
  "days": [
    {
      "dayNumber": 1,
      "title": "Day Title",
      "activities": [
        { "timeOfDay": "Morning", "description": "...", "isFoodHighlight": false }
      ]
    }
  ]
}`;
fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages: [{ role: 'user', content: promptText }] })
}).then(r => r.text()).then(console.log).catch(console.error);
