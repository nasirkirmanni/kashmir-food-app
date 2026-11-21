import mongoose from "mongoose";

/**
 * One document a day (UTC) of what Waza AI did and what it is estimated to have cost: counts and
 * token totals only, nothing a visitor typed. Written through src/waza/usage.js, so that the
 * figures and the daily budget survive a restart of the API.
 */
const wazaUsageSchema = new mongoose.Schema(
  {
    _id: { type: String }, // "2026-11-21"
    requests: { type: Number, default: 0 },
    answered: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    withoutModel: { type: Number, default: 0 },
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    estimatedCostUsd: { type: Number, default: 0 },
    unpricedAnswers: { type: Number, default: 0 },
    failovers: { type: Number, default: 0 },
    byModel: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false, minimize: false }
);

export const WazaUsage = mongoose.models.WazaUsage || mongoose.model("WazaUsage", wazaUsageSchema);
