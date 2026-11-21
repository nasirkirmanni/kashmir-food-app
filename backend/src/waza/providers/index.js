/**
 * The providers Waza can talk to, and the single door to all of them. Nothing outside this folder
 * knows how any one provider is called: the rest of the code asks for "this provider, this model,
 * this key" and gets the same stream of events and the same kinds of failure back.
 *
 * Adding a provider that speaks the OpenAI chat API is one entry in PROVIDERS. One that does not
 * needs an adapter with the same two functions (streamChat, checkKey), as ./anthropic.js has.
 */
import * as anthropic from "./anthropic.js";
import * as openaiCompatible from "./openaiCompatible.js";

export { ProviderError, redact } from "./errors.js";

/**
 * For each provider: the environment variables its keys and address come from, how it is spoken to,
 * and what a quota domain means there (shown in the diagnostics, to remind whoever adds a key).
 */
export const PROVIDERS = {
  gemini: {
    label: "Google Gemini API",
    adapter: "openai",
    dialect: "gemini",
    keyVars: ["GEMINI_API_KEY", "GOOGLE_API_KEY"],
    keysVar: "GEMINI_API_KEYS",
    baseVar: "GEMINI_BASE_URL",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    quotaDomain: "a Google Cloud project: rate limits are per project, not per key",
  },
  openrouter: {
    label: "OpenRouter",
    adapter: "openai",
    dialect: "openrouter",
    keyVars: ["OPENROUTER_API_KEY"],
    keysVar: "OPENROUTER_API_KEYS",
    baseVar: "OPENROUTER_BASE_URL",
    baseURL: "https://openrouter.ai/api/v1",
    headers: { "HTTP-Referer": "https://wazwanway.com", "X-Title": "Wazwan Way" },
    quotaDomain: "an OpenRouter account: extra keys or accounts do not raise its limits",
  },
  anthropic: {
    label: "Anthropic",
    adapter: "anthropic",
    keyVars: ["ANTHROPIC_API_KEY"],
    keysVar: "ANTHROPIC_API_KEYS",
    baseVar: "ANTHROPIC_BASE_URL",
    baseURL: "",
    quotaDomain: "an Anthropic organization (or a workspace with its own limits)",
  },
  openai: {
    label: "OpenAI",
    adapter: "openai",
    dialect: "openai",
    keyVars: ["OPENAI_API_KEY"],
    keysVar: "OPENAI_API_KEYS",
    baseVar: "OPENAI_BASE_URL",
    baseURL: "https://api.openai.com/v1",
    quotaDomain: "an OpenAI organization or project",
  },
  // Two more that speak the OpenAI chat API. Neither has a model in the default order: a model is
  // put there once it has been run against the question set with a real key (see the docs).
  mistral: {
    label: "Mistral",
    adapter: "openai",
    dialect: "plain",
    keyVars: ["MISTRAL_API_KEY"],
    keysVar: "MISTRAL_API_KEYS",
    baseVar: "MISTRAL_BASE_URL",
    baseURL: "https://api.mistral.ai/v1",
    quotaDomain: "a Mistral organization (its limits are shown in its console)",
  },
  groq: {
    label: "Groq",
    adapter: "openai",
    dialect: "plain",
    keyVars: ["GROQ_API_KEY"],
    keysVar: "GROQ_API_KEYS",
    baseVar: "GROQ_BASE_URL",
    baseURL: "https://api.groq.com/openai/v1",
    quotaDomain: "a Groq organization: its limits apply to the organization, not to a user or key",
  },
  // Any other endpoint that speaks the OpenAI chat API.
  custom: {
    label: "Custom endpoint",
    adapter: "openai",
    dialect: "plain",
    keyVars: ["WAZA_CUSTOM_API_KEY"],
    keysVar: "WAZA_CUSTOM_API_KEYS",
    baseVar: "WAZA_CUSTOM_BASE_URL",
    baseURL: "",
    quotaDomain: "whatever the endpoint counts against",
  },
};

const ADAPTERS = { openai: openaiCompatible, anthropic };

/**
 * @param {{ provider: { name: string, adapter: string, dialect?: string, baseURL: string, headers?: object },
 *           credential: { key: string }, model: string, messages: object[], maxTokens: number, temperature?: number,
 *           effort?: string, lean?: boolean, signal?: AbortSignal, timeouts: object, fetchImpl?: typeof fetch }} call
 */
export function streamChat({ provider, credential, ...call }) {
  return ADAPTERS[provider.adapter].streamChat({ ...call, apiKey: credential.key, baseURL: provider.baseURL, headers: provider.headers, dialect: provider.dialect });
}

/** Whether a provider accepts a key, found out without generating anything. Never returns the key. */
export function checkKey({ provider, credential, fetchImpl }) {
  return ADAPTERS[provider.adapter].checkKey({ apiKey: credential.key, baseURL: provider.baseURL, headers: provider.headers, dialect: provider.dialect, fetchImpl });
}
