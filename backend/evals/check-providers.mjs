/**
 * Looks at Waza AI's model set-up as the server would see it, from the environment (or backend/.env):
 * which models would be tried and in what order, which keys exist and which account each draws on,
 * and whether each provider accepts each key. Asks no model anything unless told to.
 *
 *   node evals/check-providers.mjs            keys checked, nothing generated, nothing spent
 *   node evals/check-providers.mjs --live     also asks each model one short question (a few hundred
 *                                             tokens each, on your account)
 *
 * Keys are shown by id and fingerprint only.
 */
import "dotenv/config";
import { loadConfig } from "../src/waza/config.js";
import { createCredentialPool } from "../src/waza/credentials.js";
import { estimateCost } from "../src/waza/pricing.js";
import { checkKey, redact } from "../src/waza/providers/index.js";
import { runWithFailover } from "../src/waza/reliability.js";

const live = process.argv.includes("--live");
const config = loadConfig();
console.log(`Models, in the order they are tried (${config.models.length}):`);
for (const model of config.models) console.log(`  ${model.id}${model.effort ? `  (effort: ${model.effort})` : ""}${config.prices.has(model.id) ? "" : "  [no list price: its cost will not be estimated]"}`);
const skipped = config.configuredModels.filter((model) => !config.models.some((ready) => ready.id === model.id));
if (skipped.length) console.log(`  not used, no key for the provider: ${skipped.map((model) => model.id).join(", ")}`);
if (!config.models.length) console.log("  none: set OPENROUTER_API_KEY, GEMINI_API_KEY or ANTHROPIC_API_KEY (see docs/waza-ai/README.md)");

console.log(`\nKeys (${config.credentials.length}):`);
let bad = 0;
for (const credential of config.credentials) {
  const result = await checkKey({ provider: config.providers[credential.provider], credential });
  if (!result.ok) bad++;
  const extra = result.limitRemaining !== undefined && result.limitRemaining !== null ? `, ${result.limitRemaining} left of its limit` : "";
  console.log(`  ${credential.id.padEnd(26)} fingerprint ${credential.fingerprint}  quota domain "${credential.domain}"  →  ${result.ok ? `accepted${extra}` : `REFUSED (${result.kind}: ${result.detail})`}`);
}
const domains = new Map();
for (const credential of config.credentials) domains.set(`${credential.provider}/${credential.domain}`, (domains.get(`${credential.provider}/${credential.domain}`) || 0) + 1);
for (const [domain, count] of domains) if (count > 1) console.log(`  note: ${count} keys share the quota domain ${domain}. They are spares for one another, not extra capacity.`);

if (live) {
  console.log("\nOne short question to each model:");
  const messages = [{ role: "system", content: "Answer in one short sentence." }, { role: "user", content: "In one sentence, what is a samovar?" }];
  for (const candidate of config.models) {
    const started = Date.now();
    try {
      const result = await runWithFailover({ candidates: [candidate], config: { ...config, retry: { ...config.retry, perModel: 0 } }, pool: createCredentialPool(config.credentials, config.keys), messages, maxTokens: Math.min(600, config.maxOutputTokens), onText: () => {} });
      const usage = { promptTokens: result.usage?.prompt_tokens || 0, completionTokens: result.usage?.completion_tokens || 0 };
      const cost = estimateCost(config.prices, candidate.id, usage);
      console.log(`  ${candidate.id.padEnd(46)} ok in ${Date.now() - started} ms (first words after ${result.firstTextMs} ms), ${usage.promptTokens}+${usage.completionTokens} tokens${cost === null ? "" : `, about $${cost.toFixed(6)}`}\n      "${result.text.replace(/\s+/g, " ").slice(0, 140)}"`);
    } catch (error) {
      bad++;
      console.log(`  ${candidate.id.padEnd(46)} FAILED: ${error.kind}${error.status ? ` (HTTP ${error.status})` : ""} ${redact(error.message).slice(0, 120)}`);
    }
  }
} else {
  console.log("\nNothing was generated. Add --live to ask each model one short question.");
}
process.exit(bad ? 1 : 0);
