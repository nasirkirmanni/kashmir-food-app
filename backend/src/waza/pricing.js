/**
 * What an answer is estimated to cost. Used for the daily usage figures and the optional budget;
 * never for billing. The provider's invoice is what is owed: these are the list prices on the dates
 * given, and an account may pay something else (free tiers, discounts, a price change not yet
 * entered here).
 *
 * WAZA_PRICES overrides or adds prices, in US dollars per million tokens, input then output:
 *   WAZA_PRICES=openrouter:google/gemini-3.8-flash=0.825/4.125,openai:some-model=0.5/2
 */

// Each entry: [input, output, source]. A second entry with `from` takes over on that date.
const LIST = {
  // Google's price list, read 21 November 2026. Gemini 3.8 Flash doubles on 1 January 2027.
  "gemini:gemini-3.8-flash": [
    { input: 0.75, output: 3.75 },
    { from: "2027-01-01", input: 1.5, output: 7.5 },
  ],
  "gemini:gemini-3.6-flash": [
    { input: 0.75, output: 3.75 },
    { from: "2027-01-01", input: 1.5, output: 7.5 },
  ],
  "gemini:gemini-3.5-flash-lite": [{ input: 0.3, output: 2.5 }],
  "gemini:gemini-3.1-flash-lite": [{ input: 0.25, output: 1.5 }],
  // OpenRouter's model list, read 21 November 2026.
  "openrouter:google/gemini-3.8-flash": [{ input: 0.825, output: 4.125 }],
  "openrouter:google/gemini-3.5-flash-lite": [{ input: 0.3, output: 2.5 }],
  "openrouter:anthropic/claude-haiku-5.5": [{ input: 0.1, output: 0.5 }],
  // Anthropic's price list (prompts up to 100,000 tokens), as of 3 November 2026.
  "anthropic:claude-haiku-5-5": [{ input: 0.1, output: 0.5 }],
};

export function loadPrices(env = process.env) {
  const prices = new Map(Object.entries(LIST));
  for (const item of String(env.WAZA_PRICES || "").split(",")) {
    const match = /^\s*([^=\s]+)\s*=\s*([\d.]+)\s*\/\s*([\d.]+)\s*$/.exec(item);
    if (match) prices.set(match[1], [{ input: Number(match[2]), output: Number(match[3]) }]);
  }
  return prices;
}

/**
 * @param {Map<string, object[]>} prices
 * @param {string} route  "provider:model"
 * @param {{ promptTokens?: number, completionTokens?: number }} usage
 * @returns {number | null} US dollars, or null when the price of that model is not known (never a guess)
 */
export function estimateCost(prices, route, { promptTokens = 0, completionTokens = 0 } = {}, at = new Date()) {
  const steps = prices.get(route);
  if (!steps?.length) return null;
  const day = at.toISOString().slice(0, 10);
  const price = [...steps].reverse().find((step) => !step.from || step.from <= day) || steps[0];
  return (promptTokens * price.input + completionTokens * price.output) / 1_000_000;
}
