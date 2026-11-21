/**
 * What Waza AI did, in numbers: how many questions, how they ended, how long they took, which model
 * answered and how many tokens it used. Nothing a visitor typed is kept or logged; a request is
 * identified by a random id only.
 */

const LATENCY_SAMPLES = 400;

export function createMetrics({ log = (line) => console.log(line) } = {}) {
  const startedAt = Date.now();
  const totals = { requests: 0, promptTokens: 0, completionTokens: 0, notices: 0, cacheHits: 0, direct: 0 };
  const byOutcome = {};
  const byIntent = {};
  const byModel = {};
  const failures = {};
  const firstText = [];
  const total = [];
  const push = (list, value) => {
    list.push(value);
    if (list.length > LATENCY_SAMPLES) list.shift();
  };
  const percentile = (list, p) => {
    if (!list.length) return null;
    const sorted = [...list].sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
  };
  return {
    /** @param {object} record  one finished request; see ./service.js for the fields */
    record(record) {
      totals.requests++;
      byOutcome[record.outcome] = (byOutcome[record.outcome] || 0) + 1;
      byIntent[record.intent] = (byIntent[record.intent] || 0) + 1;
      if (record.model) byModel[record.model] = (byModel[record.model] || 0) + 1;
      if (record.cache) totals.cacheHits++;
      if (record.direct) totals.direct++;
      totals.promptTokens += record.promptTokens || 0;
      totals.completionTokens += record.completionTokens || 0;
      totals.notices += record.notices || 0;
      for (const attempt of record.attempts || []) if (attempt.outcome !== "ok") failures[`${attempt.candidate}:${attempt.outcome}`] = (failures[`${attempt.candidate}:${attempt.outcome}`] || 0) + 1;
      if (record.outcome === "ok") {
        if (Number.isFinite(record.firstTextMs)) push(firstText, record.firstTextMs);
        if (Number.isFinite(record.totalMs)) push(total, record.totalMs);
      }
      log(JSON.stringify({ evt: "waza_chat", ...record }));
    },
    snapshot() {
      return {
        since: new Date(startedAt).toISOString(),
        ...totals,
        byOutcome,
        byIntent,
        byModel,
        failures,
        firstTextMs: { p50: percentile(firstText, 50), p95: percentile(firstText, 95) },
        totalMs: { p50: percentile(total, 50), p95: percentile(total, 95) },
      };
    },
  };
}
