import mongoose from "mongoose";

const explorerEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, required: true, index: true },
  entityType: { type: String },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  baseXP: { type: Number, default: 0 },
  multiplier: { type: Number, default: 1 },
  xpAwarded: { type: Number, default: 0 },
  source: { type: String },
  createdAt: { type: Date, default: Date.now }
});

explorerEventSchema.index({ userId: 1, action: 1, entityId: 1 });

export const ExplorerEvent = mongoose.model("ExplorerEvent", explorerEventSchema);
