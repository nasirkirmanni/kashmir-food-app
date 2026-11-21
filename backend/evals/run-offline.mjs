/**
 * Measures everything about Waza AI that does not need a model: how each question is read, whether
 * the right passages are fetched for it, whether the site is correctly judged to cover it, and how
 * long that takes. Deterministic, free, and run on every change.
 *
 *   node evals/run-offline.mjs            # summary, and every miss
 *   node evals/run-offline.mjs --json     # also writes evals/reports/offline.json
 *   node evals/run-offline.mjs --strict   # exit 1 if a threshold is missed (for CI)
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { knowledge } from "../src/waza/knowledge.js";
import { plan } from "../src/waza/plan.js";
import { HOLDOUT } from "./holdout.mjs";
import { HOLDOUT_2 } from "./holdout2.mjs";
import { QUESTIONS } from "./questions.mjs";

export const THRESHOLDS = { intent: 0.95, sources: 0.95, coverage: 0.93, direct: 1, flags: 1 };

const asList = (value) => (Array.isArray(value) ? value : [value]);
export const toMessages = (item) => (item.turns ? item.turns.map((turn) => (turn.user !== undefined ? { role: "user", content: turn.user } : { role: "assistant", content: turn.assistant })) : [{ role: "user", content: item.question }]);

export function runOffline(kb = knowledge(), questions = QUESTIONS) {
  const rows = [];
  for (const item of questions) {
    const messages = toMessages(item);
    const started = performance.now();
    const planned = plan(kb, { messages });
    const ms = performance.now() - started;
    const expect = item.expect;
    const sources = (planned.direct ? planned.direct.sources : planned.retrieval.sources).map((source) => source.chunk.id);
    const coverage = planned.direct ? planned.direct.coverage : planned.retrieval.coverage;
    const firstHit = expect.sources ? sources.findIndex((id) => expect.sources.some((prefix) => id.startsWith(prefix))) : -1;
    const checks = {
      intent: asList(expect.intent).includes(planned.intent),
      flags: (expect.flags || []).every((flag) => planned.flags?.[flag]),
      direct: expect.direct === undefined ? null : Boolean(planned.direct) === expect.direct,
      sources: expect.sources ? firstHit !== -1 : null,
      coverage: expect.coverage ? asList(expect.coverage).includes(coverage) : null,
    };
    rows.push({ id: item.id, category: item.category, question: messages[messages.length - 1].content, intent: planned.intent, expectedIntent: expect.intent, coverage, expectedCoverage: expect.coverage, direct: Boolean(planned.direct), rank: firstHit === -1 ? null : firstHit + 1, sources, unknown: planned.retrieval?.unknownTerms || [], ms, checks });
  }
  const rate = (key, list = rows) => {
    const judged = list.filter((row) => row.checks[key] !== null);
    return { passed: judged.filter((row) => row.checks[key]).length, of: judged.length, rate: judged.length ? judged.filter((row) => row.checks[key]).length / judged.length : 1 };
  };
  const ranked = rows.filter((row) => row.checks.sources !== null);
  const timings = rows.map((row) => row.ms).sort((a, b) => a - b);
  const summary = {
    questions: rows.length,
    index: { version: kb.meta.version, chunks: kb.meta.chunks },
    intent: rate("intent"),
    flags: rate("flags"),
    direct: rate("direct"),
    sources: rate("sources"),
    coverage: rate("coverage"),
    sourceAtRank1: ranked.filter((row) => row.rank === 1).length / ranked.length,
    sourceInTop3: ranked.filter((row) => row.rank && row.rank <= 3).length / ranked.length,
    meanReciprocalRank: ranked.reduce((sum, row) => sum + (row.rank ? 1 / row.rank : 0), 0) / ranked.length,
    planMs: { median: timings[Math.floor(timings.length / 2)], p95: timings[Math.floor(timings.length * 0.95)], max: timings[timings.length - 1] },
    byCategory: Object.fromEntries([...new Set(rows.map((row) => row.category))].map((category) => {
      const list = rows.filter((row) => row.category === category);
      return [category, { n: list.length, intent: rate("intent", list).rate, sources: rate("sources", list).rate, coverage: rate("coverage", list).rate }];
    })),
  };
  return { rows, summary };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const second = process.argv.includes("--holdout2");
  const held = second || process.argv.includes("--holdout");
  const { rows, summary } = runOffline(knowledge(), second ? HOLDOUT_2 : held ? HOLDOUT : QUESTIONS);
  const pct = (value) => `${(value * 100).toFixed(1)}%`;
  const line = (label, result) => console.log(`${label.padEnd(34)} ${String(result.passed).padStart(3)}/${String(result.of).padEnd(3)} ${pct(result.rate)}`);
  console.log(`Waza AI offline evaluation, ${second ? "second held-out set (first-run scores kept in reports/offline-holdout2-first-run.json; tuned on since)" : held ? "first held-out set (first-run scores kept in reports/offline-holdout-first-run.json; tuned on since)" : "main set (used while tuning)"}: ${summary.questions} questions, index ${summary.index.version} (${summary.index.chunks} chunks)\n`);
  line("question read as intended", summary.intent);
  line("flags raised", summary.flags);
  line("answered without a model when it should", summary.direct);
  line("an expected passage was fetched", summary.sources);
  line("coverage judged as expected", summary.coverage);
  console.log(`${"expected passage ranked first".padEnd(34)}         ${pct(summary.sourceAtRank1)}`);
  console.log(`${"expected passage in the top 3".padEnd(34)}         ${pct(summary.sourceInTop3)}`);
  console.log(`${"mean reciprocal rank".padEnd(34)}         ${summary.meanReciprocalRank.toFixed(3)}`);
  console.log(`${"time to read and fetch".padEnd(34)}         median ${summary.planMs.median.toFixed(2)} ms, p95 ${summary.planMs.p95.toFixed(2)} ms, max ${summary.planMs.max.toFixed(2)} ms`);
  console.log("\nby category:");
  for (const [category, result] of Object.entries(summary.byCategory)) console.log(`  ${category.padEnd(12)} n=${String(result.n).padEnd(3)} intent ${pct(result.intent).padStart(6)}  sources ${pct(result.sources).padStart(6)}  coverage ${pct(result.coverage).padStart(6)}`);
  const misses = rows.filter((row) => Object.values(row.checks).some((value) => value === false));
  console.log(`\n${misses.length} question(s) with a miss:`);
  for (const row of misses) {
    const failed = Object.entries(row.checks).filter(([, value]) => value === false).map(([key]) => key);
    console.log(`  ${row.id} [${failed.join(", ")}] "${row.question}"\n      read as ${row.intent} (wanted ${JSON.stringify(row.expectedIntent)}); coverage ${row.coverage} (wanted ${JSON.stringify(row.expectedCoverage)}); unknown: ${row.unknown.join(",") || "-"}\n      fetched: ${row.sources.slice(0, 6).join(" | ")}`);
  }
  if (process.argv.includes("--json")) {
    const out = fileURLToPath(new URL(second ? "./reports/offline-holdout2.json" : held ? "./reports/offline-holdout.json" : "./reports/offline.json", import.meta.url));
    mkdirSync(fileURLToPath(new URL("./reports/", import.meta.url)), { recursive: true });
    writeFileSync(out, `${JSON.stringify({ summary, rows }, null, 1)}\n`);
    console.log(`\nwrote ${out}`);
  }
  const failed = Object.entries(THRESHOLDS).filter(([key, minimum]) => summary[key].rate < minimum);
  if (process.argv.includes("--strict") && failed.length && !held) {
    console.error(`\nbelow threshold: ${failed.map(([key, minimum]) => `${key} ${pct(summary[key].rate)} < ${pct(minimum)}`).join(", ")}`);
    process.exit(1);
  }
}
