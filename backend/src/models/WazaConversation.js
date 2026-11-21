import mongoose from "mongoose";

/**
 * A conversation with Waza AI, kept by the site so that it does not depend on any model provider's
 * memory or on one browser tab: it survives a restart of the API, a change of model in the middle,
 * and a visitor coming back days later. Read and written only through src/waza/conversations.js.
 *
 * The id is made by the visitor's browser (a random UUID) and is the only thing that opens an
 * anonymous conversation, so it is never put in a URL. A signed-in visitor's conversation also
 * carries their user id, and only they can open it.
 *
 * Conversations are deleted automatically: `expiresAt` moves forward each time one is used, and
 * MongoDB removes the document once that time has passed (WAZA_CONVERSATION_DAYS, 30 by default).
 */
const messageSchema = new mongoose.Schema(
  {
    // "<request id>:q" for the visitor's question, "<request id>:a" for the answer to it.
    id: { type: String, required: true },
    requestId: { type: String, required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, default: "" },
    // An answer is "pending" while it is being written and "complete" only when the model finished it.
    status: { type: String, enum: ["complete", "pending", "partial", "failed", "stopped"], default: "complete" },
    // Which model wrote it, and what the page needs to show it again (sources, cards, notices).
    model: { type: String, default: null },
    meta: { type: mongoose.Schema.Types.Mixed, default: null },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const wazaConversationSchema = new mongoose.Schema(
  {
    _id: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    messages: { type: [messageSchema], default: [] },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, versionKey: false, minimize: false }
);

wazaConversationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const WazaConversation = mongoose.models.WazaConversation || mongoose.model("WazaConversation", wazaConversationSchema);
