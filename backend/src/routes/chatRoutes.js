import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/admin.js";
import { aiChatLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";
import { cancelSchema, chatSchema, conversationParams } from "../validations/chatValidations.js";
import { loadConfig } from "../waza/config.js";
import { createConversationStore } from "../waza/conversations.js";
import { createMongoConversationBackend, createMongoUsageBackend } from "../waza/mongoBackends.js";
import { redact } from "../waza/providers/index.js";
import { createWazaService } from "../waza/service.js";
import { createUsageLedger } from "../waza/usage.js";

/**
 * Waza AI. The work is in ../waza (see service.js for the flow); this file puts it behind the
 * site's validation, sign-in and rate limit, and gives it the database for the two things it keeps:
 * conversations and the daily usage figures. The service is built on first use, so a missing or
 * malformed knowledge index fails the first question loudly instead of stopping the whole API from
 * starting.
 */
let service = null;
function waza() {
  if (service) return service;
  const config = loadConfig();
  // A database fault is logged, a few times a minute at most, and never reaches a visitor.
  let lastLogged = 0;
  const onError = (where) => (operation, error) => {
    if (Date.now() - lastLogged < 15_000) return;
    lastLogged = Date.now();
    console.warn(JSON.stringify({ evt: "waza_store_error", where, operation, error: redact(error?.message || String(error)).slice(0, 200) }));
  };
  const conversations = createConversationStore({
    backend: config.conversations.enabled ? createMongoConversationBackend() : null,
    retentionDays: config.conversations.retentionDays,
    maxMessages: config.conversations.maxMessages,
    onError: onError("conversations"),
  });
  const usage = createUsageLedger({ backend: createMongoUsageBackend(), prices: config.prices, onError: onError("usage") });
  service = createWazaService({ config, conversations, usage });
  return service;
}

/** For the server's shutdown: lets the answers being written finish. Does nothing if Waza was never used. */
export const drainWaza = (timeoutMs) => (service ? service.drain(timeoutMs) : Promise.resolve({ waitedFor: 0, stopped: 0 }));

const router = express.Router();

router.post(
  "/",
  validate({ body: chatSchema }),
  aiChatLimiter,
  asyncHandler((req, res) => waza().handle(req, res))
);

// The visitor pressed stop.
router.post("/cancel", validate({ body: cancelSchema }), (req, res) => waza().cancel(req, res));

// A conversation the site has kept, for a visitor coming back to it. The id is the visitor's own
// (and their account's, if they are signed in); it is never listed anywhere.
router.get("/conversations/:id", validate({ params: conversationParams }), asyncHandler((req, res) => waza().conversation(req, res)));

// Whether Waza can answer at all, for the page and for uptime checks. Says nothing of keys or models.
router.get("/status", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    res.json(waza().status());
  } catch {
    res.status(503).json({ ok: false, configured: false });
  }
});

// Models, keys (by id and fingerprint, never the key), failures, latency, tokens and estimated cost: for the owner.
router.get(
  "/diagnostics",
  protect,
  adminOnly,
  asyncHandler(async (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json(await waza().diagnostics());
  })
);

// Asks each provider whether it accepts each key, without generating anything.
router.post(
  "/diagnostics/check-keys",
  protect,
  adminOnly,
  asyncHandler(async (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json({ checkedAt: new Date().toISOString(), keys: await waza().checkKeys() });
  })
);

export default router;
