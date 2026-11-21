/**
 * Waza's API keys: where they come from, which of them share a quota, and which are fit to use
 * right now.
 *
 * Keys come only from environment variables. A provider takes one key or a list:
 *
 *   GEMINI_API_KEY=AIza…                                  one key
 *   GEMINI_API_KEYS=main=AIza…,main=AIza…,second=AIza…    several
 *
 * In the list, the name before "=" is the key's QUOTA DOMAIN: the account or project whose limits it
 * draws on. Two keys with the same name share one allowance, and are treated as one when it runs
 * out. Keys given no name are all put in the domain "default", because that is the safe assumption:
 * with every provider here, a second key from the same account or project adds no capacity
 * (Google: "Rate limits are applied per project, not per API key"; OpenRouter: "Making additional
 * accounts or API keys will not affect your rate limits"). Name two domains only where there really
 * are two separately billed accounts or projects.
 *
 * What a failure does (the kinds are in ./providers/errors.js):
 *   a key the provider rejects      that key is set aside, and looked at again much later
 *   no credit, or a quota used up   every key of that domain is rested (for that model, if a quota)
 *   a rate limit                    the domain is rested for as long as the provider asked
 * A key is never printed: it is known in logs and diagnostics by an id such as "gemini:main:1" and
 * the first eight characters of its SHA-256.
 */
import { createHash } from "node:crypto";
import { PROVIDERS } from "./providers/index.js";

const DOMAIN_NAME = /^[A-Za-z0-9_.-]{1,40}$/;
// OpenRouter marks a model variant that is free of charge with this ending. Such a model has its
// own small daily allowance and does not draw on the account's credit.
const FREE_MODEL = (model) => /:free$/i.test(String(model || ""));
const MINUTE = 60_000;

/** @returns {{ providers: Record<string, object>, credentials: { id: string, provider: string, domain: string, key: string, fingerprint: string }[] }} */
export function parseCredentials(env = process.env) {
  const providers = {};
  const credentials = [];
  for (const [name, spec] of Object.entries(PROVIDERS)) {
    const baseURL = String(env[spec.baseVar] || spec.baseURL || "").trim();
    providers[name] = { name, label: spec.label, adapter: spec.adapter, dialect: spec.dialect, baseURL, headers: spec.headers || {}, quotaDomain: spec.quotaDomain };
    const entries = [];
    for (const item of String(env[spec.keysVar] || "").split(",")) {
      const text = item.trim();
      if (!text) continue;
      const cut = text.indexOf("=");
      const named = cut > 0 && DOMAIN_NAME.test(text.slice(0, cut).trim());
      entries.push({ domain: named ? text.slice(0, cut).trim() : "default", key: (named ? text.slice(cut + 1) : text).trim() });
    }
    for (const variable of spec.keyVars) if (String(env[variable] || "").trim()) entries.push({ domain: "default", key: String(env[variable]).trim() });
    // A provider with no address cannot be called (the custom one has none until it is given one).
    if (spec.adapter === "openai" && !baseURL) continue;
    const seen = new Set();
    const counts = {};
    for (const { domain, key } of entries) {
      if (!key || seen.has(key)) continue;
      seen.add(key);
      counts[domain] = (counts[domain] || 0) + 1;
      credentials.push({ id: `${name}:${domain}:${counts[domain]}`, provider: name, domain, key, fingerprint: createHash("sha256").update(key).digest("hex").slice(0, 8) });
    }
  }
  return { providers, credentials };
}

/**
 * Which keys are fit to use, kept up to date by what happens to each call.
 * @param {{ id: string, provider: string, domain: string, key: string, fingerprint: string }[]} credentials
 */
export function createCredentialPool(credentials, { invalidRecheckMs = 30 * MINUTE, quotaCooldownMs = 15 * MINUTE, creditsCooldownMs = 30 * MINUTE, rateLimitCooldownMs = 5_000, maxCooldownMs = 6 * 60 * MINUTE, costsNothing = FREE_MODEL } = {}, now = Date.now) {
  const keys = new Map(credentials.map((credential) => [credential.id, { uses: 0, failures: 0, setAsideUntil: 0, reason: null, strikes: 0, lastFailure: null }]));
  const rests = new Map(); // "provider|domain|model" or "provider|domain|*"  →  { until, kind, strikes }
  const restKey = (credential, model) => `${credential.provider}|${credential.domain}|${model}`;
  const grow = (base, strikes) => Math.min(maxCooldownMs, base * 2 ** Math.min(10, strikes));

  const blockOf = (credential, model) => {
    const own = keys.get(credential.id);
    if (own.setAsideUntil > now()) return { reason: own.reason, until: own.setAsideUntil };
    for (const scope of ["*", model]) {
      const rest = rests.get(restKey(credential, scope));
      if (!rest || rest.until <= now()) continue;
      // An account with no credit is rested for every model that costs money, and only those.
      if (scope === "*" && rest.kind === "credits" && costsNothing(model)) continue;
      return { reason: rest.kind, until: rest.until };
    }
    return null;
  };

  return {
    /** The keys of a provider that may be used for a model now, in the order they were given, and why the others may not. */
    eligible(provider, model) {
      const ready = [];
      const blocked = [];
      for (const credential of credentials) {
        if (credential.provider !== provider) continue;
        const block = blockOf(credential, model);
        if (block) blocked.push({ id: credential.id, ...block });
        else ready.push(credential);
      }
      return { ready, blocked };
    },

    /** Records how a call with this key went. `error` is a ProviderError, or null for an answer. */
    report(credential, model, error) {
      const own = keys.get(credential.id);
      if (!own) return;
      own.uses += 1;
      if (!error) {
        own.strikes = 0;
        own.reason = null;
        rests.delete(restKey(credential, model));
        return;
      }
      if (error.kind === "aborted") return;
      own.failures += 1;
      own.lastFailure = { kind: error.kind, status: error.status ?? null, at: now(), model, detail: error.detail || null };
      if (error.scope === "credential") {
        // The provider does not accept this key. Asking again soon would only be refused again.
        own.setAsideUntil = now() + grow(invalidRecheckMs, own.strikes);
        own.reason = error.kind === "auth" ? "invalid" : "denied";
        own.strikes += 1;
        return;
      }
      if (error.scope !== "domain") return;
      // Everything drawing on the same allowance is rested together. No credit covers every model;
      // a quota or a rate limit is counted per model.
      const key = restKey(credential, error.kind === "credits" ? "*" : model);
      const strikes = rests.get(key)?.strikes || 0;
      const base = error.kind === "credits" ? creditsCooldownMs : error.kind === "quota" ? quotaCooldownMs : rateLimitCooldownMs;
      // The provider's own figure is taken as given; without one the rest grows each time it is not enough.
      const wait = error.retryAfterMs !== undefined ? Math.min(maxCooldownMs, Math.max(1_000, error.retryAfterMs)) : grow(base, strikes);
      rests.set(key, { until: now() + wait, kind: error.kind, strikes: strikes + 1 });
    },

    /** When the first key of a provider (or of any) will be usable again; null if one is usable now or none exists. */
    nextReadyAt(provider, model) {
      let soonest = null;
      for (const credential of credentials) {
        if (provider && credential.provider !== provider) continue;
        const block = blockOf(credential, model || "*");
        if (!block) return null;
        soonest = soonest === null ? block.until : Math.min(soonest, block.until);
      }
      return soonest;
    },

    /** For the owner's diagnostics: every key by id and fingerprint, never the key. */
    snapshot() {
      const time = now();
      return credentials.map((credential) => {
        const own = keys.get(credential.id);
        const resting = [...rests].filter(([key, rest]) => key.startsWith(`${credential.provider}|${credential.domain}|`) && rest.until > time).map(([key, rest]) => ({ model: key.split("|")[2], reason: rest.kind, until: new Date(rest.until).toISOString() }));
        const setAside = own.setAsideUntil > time;
        return {
          id: credential.id,
          provider: credential.provider,
          quotaDomain: credential.domain,
          fingerprint: credential.fingerprint,
          state: setAside ? own.reason : resting.length ? "resting" : "ready",
          ...(setAside ? { until: new Date(own.setAsideUntil).toISOString() } : {}),
          resting,
          uses: own.uses,
          failures: own.failures,
          // `said` is the provider's own account of it (with anything key-like removed): which limit, which model.
          lastFailure: own.lastFailure ? { kind: own.lastFailure.kind, status: own.lastFailure.status, at: new Date(own.lastFailure.at).toISOString(), model: own.lastFailure.model, said: own.lastFailure.detail } : null,
        };
      });
    },
    size: credentials.length,
    list: () => credentials,
  };
}
