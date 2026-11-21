/**
 * Measures the answers themselves, with the real models: the part the offline evaluation cannot.
 * Each question in the set is put through Waza exactly as a visitor's would be (same retrieval,
 * same prompt, same checks, same failover), and the answer is judged by what a script can tell:
 *
 *   answered     an answer came back (not an error)
 *   says         it contains what a good answer to that question contains          (expect.say)
 *   never        it does not contain the invention that question invites           (expect.never)
 *   grounded     it states no price, phone number, time, rating, year or distance that its sources lack
 *   cites        it cites a source, and no source that was not given
 *   behaves      a question the site cannot answer is declined or said to be uncovered, not answered
 *
 * This spends money on your account: about 3,500 tokens in and 300 out per question.
 *
 *   node evals/run-online.mjs --limit 20              the first 20 questions of the main set
 *   node evals/run-online.mjs --set holdout           one of: main, holdout, holdout2, all
 *   node evals/run-online.mjs --category restaurant
 *   node evals/run-online.mjs --stand-in              no key, no cost: a scripted stand-in instead of
 *                                                     a model. Proves this script runs; its scores
 *                                                     say NOTHING about answer quality.
 *
 * Writes evals/reports/online-<set>-<date>.json with every answer, so they can be read as well as counted.
 */
import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadConfig } from "../src/waza/config.js";
import { estimateCost } from "../src/waza/pricing.js";
import { createWazaService } from "../src/waza/service.js";
import { createMetrics } from "../src/waza/metrics.js";
import { ask, fakeProvider, startApp } from "../src/tests/waza/helpers.js";
import { HOLDOUT } from "./holdout.mjs";
import { HOLDOUT_2 } from "./holdout2.mjs";
import { QUESTIONS } from "./questions.mjs";
import { toMessages } from "./run-offline.mjs";

const arg = (name, fallback) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : fallback);
const standIn = process.argv.includes("--stand-in");
const setName = arg("--set", "main");
const sets = { main: QUESTIONS, holdout: HOLDOUT, holdout2: HOLDOUT_2, all: [...QUESTIONS, ...HOLDOUT, ...HOLDOUT_2] };
let questions = sets[setName] || QUESTIONS;
if (arg("--category")) questions = questions.filter((item) => item.category === arg("--category"));
questions = questions.slice(0, Number(arg("--limit", questions.length)));

let provider = null;
let config;
if (standIn) {
  // An "answer" cut from the first passage it was handed. Enough to exercise every step of this script.
  provider = await fakeProvider(({ body }) => {
    const first = (body.messages[0]?.content.split("\nSOURCES\n")[1] || "").split("\n---\n")[0] || "";
    const text = first.slice(first.indexOf("\n") + 1).replace(/\n+/g, " ").split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
    return { text: text ? `${text} [S1]` : "Wazwan Way's pages do not cover that." };
  });
  config = loadConfig({ WAZA_MODELS: "custom:stand-in", WAZA_CUSTOM_API_KEY: "stand-in", WAZA_CUSTOM_BASE_URL: provider.url, WAZA_CACHE: "off" });
} else {
  config = loadConfig({ ...process.env, WAZA_CACHE: "off" });
  if (!config.models.length) {
    console.error("No model can be used: set OPENROUTER_API_KEY, GEMINI_API_KEY or ANTHROPIC_API_KEY (or run with --stand-in).");
    process.exit(2);
  }
}

const app = await startApp({ config, metrics: createMetrics({ log: () => {} }) });
void createWazaService;
const UNCOVERED = /do(es)? not cover|don't cover|doesn't cover|no (written )?(recipe|page|information|record)|not (something|a topic) (i|we|wazwan way) (cover|can help)|i (can only|only) help|can't help with|cannot help with|outside (what|my)|isn't something i cover|nothing on/i;
const rows = [];
let spent = 0;
for (const [i, item] of questions.entries()) {
  const messages = toMessages(item);
  const started = Date.now();
  const out = await ask(app.url, { messages }).catch((error) => ({ failed: String(error?.message || error) }));
  const text = out.text || "";
  const expect = item.expect;
  const sources = out.meta?.sources?.length || 0;
  const cited = [...text.matchAll(/\[S(\d+)\]/g)].map((match) => Number(match[1]));
  const usage = out.done?.usage || { promptTokens: 0, completionTokens: 0 };
  const cost = out.done && !out.done.direct && !out.done.cached ? estimateCost(config.prices, lineOf(out.done.model, config), usage) : 0;
  spent += cost || 0;
  const wantsNoAnswer = ["no-info", "decline", "refuse"].includes(expect.behave);
  const checks = {
    answered: Boolean(out.done && text.trim()),
    says: expect.say && out.done ? expect.say.every((pattern) => pattern.test(text)) : null,
    never: expect.never && out.done ? !expect.never.some((pattern) => pattern.test(text)) : null,
    grounded: out.done && !out.done.direct ? !(out.notices || []).some((notice) => notice.code === "unverified_details") : null,
    cites: out.done && !out.done.direct && sources && !wantsNoAnswer ? cited.length > 0 && cited.every((n) => n >= 1 && n <= sources) : null,
    behaves: wantsNoAnswer && out.done ? UNCOVERED.test(text) : null,
  };
  rows.push({ id: item.id, category: item.category, question: messages.at(-1).content, behave: expect.behave, intent: out.meta?.intent, coverage: out.meta?.coverage, model: out.done?.model || null, direct: Boolean(out.done?.direct), ms: Date.now() - started, firstTextMs: out.done?.timings?.firstTextMs ?? null, usage, costUsd: cost, error: out.error?.code || out.json?.error || out.failed || null, notices: (out.notices || []).map((notice) => notice.message), checks, answer: text });
  const marks = Object.entries(checks).map(([name, pass]) => (pass === null ? "" : `${pass ? "✓" : "✗"}${name}`)).filter(Boolean).join(" ");
  console.log(`${String(i + 1).padStart(3)}/${questions.length} ${item.id.padEnd(10)} ${marks}${out.error ? `  ERROR ${out.error.code}` : ""}`);
}

const rate = (name) => {
  const judged = rows.filter((row) => row.checks[name] !== null);
  const passed = judged.filter((row) => row.checks[name]).length;
  return { passed, of: judged.length, rate: judged.length ? passed / judged.length : null };
};
const times = rows.filter((row) => row.checks.answered && !row.direct).map((row) => row.ms).sort((a, b) => a - b);
const firsts = rows.filter((row) => row.firstTextMs !== null && !row.direct).map((row) => row.firstTextMs).sort((a, b) => a - b);
const at = (list, p) => (list.length ? list[Math.min(list.length - 1, Math.floor(list.length * p))] : null);
const summary = {
  set: setName,
  standIn,
  ranAt: new Date().toISOString(),
  models: config.models.map((model) => model.id),
  questions: rows.length,
  ...Object.fromEntries(["answered", "says", "never", "grounded", "cites", "behaves"].map((name) => [name, rate(name)])),
  answeredBy: rows.reduce((totals, row) => ({ ...totals, [row.direct ? "(the site's own text, no model)" : row.model || "(none)"]: (totals[row.direct ? "(the site's own text, no model)" : row.model || "(none)"] || 0) + 1 }), {}),
  totalMs: { median: at(times, 0.5), p95: at(times, 0.95) },
  firstTextMs: { median: at(firsts, 0.5), p95: at(firsts, 0.95) },
  estimatedCostUsd: Number(spent.toFixed(4)),
};
console.log(`\nWaza AI online evaluation, ${setName} set, ${rows.length} questions${standIn ? "  [STAND-IN MODEL: these figures do not measure answer quality]" : ""}`);
for (const name of ["answered", "says", "never", "grounded", "cites", "behaves"]) {
  const result = summary[name];
  if (result.of) console.log(`  ${name.padEnd(9)} ${String(result.passed).padStart(4)}/${String(result.of).padEnd(4)} ${(result.rate * 100).toFixed(1)}%`);
}
console.log(`  time to an answer   median ${summary.totalMs.median} ms, p95 ${summary.totalMs.p95} ms; first words median ${summary.firstTextMs.median} ms`);
console.log(`  estimated cost      $${summary.estimatedCostUsd} (list prices; your invoice is the truth)`);
const misses = rows.filter((row) => Object.values(row.checks).some((pass) => pass === false));
console.log(`\n${misses.length} question(s) with a miss${misses.length ? ":" : ""}`);
for (const row of misses.slice(0, 40)) console.log(`  ${row.id} [${Object.entries(row.checks).filter(([, pass]) => pass === false).map(([name]) => name).join(", ")}] ${JSON.stringify(row.question.slice(0, 80))}\n      ${JSON.stringify(row.answer.replace(/\s+/g, " ").slice(0, 200))}`);

const dir = fileURLToPath(new URL("./reports/", import.meta.url));
mkdirSync(dir, { recursive: true });
const file = `${dir}online-${setName}${standIn ? "-stand-in" : ""}-${summary.ranAt.slice(0, 10)}.json`;
writeFileSync(file, JSON.stringify({ summary, rows }, null, 1));
console.log(`\nEvery answer is in ${file}`);
await app.close();
await provider?.close();

/** The route ("provider:model") a served model name belongs to, for pricing. */
function lineOf(model, settings) {
  return settings.models.find((candidate) => candidate.model === model || candidate.id === model)?.id || model;
}
