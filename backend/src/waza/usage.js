/**
 * What Waza AI used today: how many questions, how many of them a model answered, the tokens, and
 * an estimate of the cost (./pricing.js). Held in memory and, when a database is given, added to
 * one small document a day, so that the figures and the daily budget outlast a restart.
 *
 * The cost is an ESTIMATE from list prices. It is there to show the trend and to stop a runaway
 * day; the provider's invoice is the truth. An answer from a model with no listed price adds to
 * `unpricedAnswers` and nothing to the cost.
 */
import { estimateCost } from "./pricing.js";

const dayOf = (ms) => new Date(ms).toISOString().slice(0, 10);
const fresh = (day) => ({ day, requests: 0, answered: 0, failed: 0, withoutModel: 0, promptTokens: 0, completionTokens: 0, estimatedCostUsd: 0, unpricedAnswers: 0, failovers: 0, byModel: {} });
// A model name may hold dots and slashes; MongoDB reads a dot in a field name as a path.
const fieldOf = (route) => route.replace(/\./g, "_");

export function createUsageLedger({ backend = null, prices = new Map(), now = Date.now, onError = () => {} } = {}) {
  let today = fresh(dayOf(now()));
  let restored = !backend;
  const roll = () => {
    const day = dayOf(now());
    if (today.day !== day) today = fresh(day);
    return today;
  };

  return {
    /** Adds today's stored figures to what has been counted since the process started. Safe to call more than once. */
    async restore() {
      if (restored) return;
      restored = true;
      try {
        const stored = await backend.load(dayOf(now()));
        if (!stored) return;
        const current = roll();
        for (const name of ["requests", "answered", "failed", "withoutModel", "promptTokens", "completionTokens", "estimatedCostUsd", "unpricedAnswers", "failovers"]) current[name] += Number(stored[name]) || 0;
        for (const [model, figures] of Object.entries(stored.byModel || {})) {
          const mine = (current.byModel[model] ||= { answers: 0, promptTokens: 0, completionTokens: 0, estimatedCostUsd: 0 });
          for (const name of Object.keys(mine)) mine[name] += Number(figures?.[name]) || 0;
        }
      } catch (error) {
        onError("restore", error);
      }
    },

    /**
     * @param {{ outcome: "answered" | "failed" | "direct" | "cached", route?: string | null, promptTokens?: number, completionTokens?: number, failover?: boolean }} entry
     * @returns {{ costUsd: number | null }}  null when no model was paid for, or its price is not known
     */
    record({ outcome, route = null, promptTokens = 0, completionTokens = 0, failover = false }) {
      const current = roll();
      const increments = { requests: 1 };
      let costUsd = null;
      if (outcome === "answered") {
        increments.answered = 1;
        increments.promptTokens = promptTokens;
        increments.completionTokens = completionTokens;
        costUsd = route ? estimateCost(prices, route, { promptTokens, completionTokens }, new Date(now())) : null;
        if (costUsd === null) increments.unpricedAnswers = 1;
        else increments.estimatedCostUsd = costUsd;
        if (route) {
          const field = fieldOf(route);
          increments[`byModel.${field}.answers`] = 1;
          increments[`byModel.${field}.promptTokens`] = promptTokens;
          increments[`byModel.${field}.completionTokens`] = completionTokens;
          increments[`byModel.${field}.estimatedCostUsd`] = costUsd || 0;
        }
      } else if (outcome === "failed") increments.failed = 1;
      else increments.withoutModel = 1;
      if (failover) increments.failovers = 1;

      for (const [path, amount] of Object.entries(increments)) {
        const parts = path.split(".");
        if (parts.length === 1) current[path] += amount;
        else {
          const model = (current.byModel[parts[1]] ||= { answers: 0, promptTokens: 0, completionTokens: 0, estimatedCostUsd: 0 });
          model[parts[2]] += amount;
        }
      }
      // The database copy is a convenience; an answer never waits on it or fails with it.
      if (backend) Promise.resolve().then(() => backend.add(current.day, increments)).catch((error) => onError("add", error));
      return { costUsd };
    },

    today: () => structuredClone(roll()),

    /** Whether today's estimated spend has reached the limit (0 or less means no limit). */
    overBudget: (limitUsd) => limitUsd > 0 && roll().estimatedCostUsd >= limitUsd,

    /** The last few days as stored, newest first; today's live figures when there is no database. */
    async recent(days = 7) {
      if (!backend) return [roll()];
      try {
        return (await backend.recent(days)).map(({ _id, createdAt, updatedAt, ...figures }) => ({ day: _id, ...figures }));
      } catch (error) {
        onError("recent", error);
        return [roll()];
      }
    },
  };
}
