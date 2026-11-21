/**
 * The MongoDB side of the conversation store and the usage ledger (./conversations.js, ./usage.js).
 * Kept apart so that nothing else in src/waza imports mongoose, and the tests can run without a
 * database. Each operation is a single statement, so none needs a transaction.
 */
import { WazaConversation } from "../models/WazaConversation.js";
import { WazaUsage } from "../models/WazaUsage.js";

export function createMongoConversationBackend(Model = WazaConversation) {
  return {
    find: (id) => Model.findById(id).lean().exec(),

    async appendTurn(id, userId, messages, { max, expiresAt }) {
      try {
        // Matches only when this request id is not in the conversation yet. When it is, nothing
        // matches, the upsert tries to create a second document with the same _id, and MongoDB
        // refuses it: that refusal is how a repeated request is recognised, in one atomic step.
        await Model.updateOne(
          { _id: id, "messages.requestId": { $ne: messages[0].requestId } },
          { $push: { messages: { $each: messages, $slice: -max } }, $set: { expiresAt }, $setOnInsert: { userId: userId || null } },
          { upsert: true, setDefaultsOnInsert: true }
        ).exec();
        return "appended";
      } catch (error) {
        if (error?.code === 11000) return "duplicate";
        throw error;
      }
    },

    async updateMessage(id, messageId, fields, expiresAt) {
      const set = { expiresAt };
      for (const [name, value] of Object.entries(fields)) set[`messages.$.${name}`] = value;
      const result = await Model.updateOne({ _id: id, "messages.id": messageId }, { $set: set }).exec();
      return result.matchedCount > 0;
    },

    async claim(id, userId) {
      await Model.updateOne({ _id: id, userId: null }, { $set: { userId } }).exec();
    },
  };
}

export function createMongoUsageBackend(Model = WazaUsage) {
  return {
    load: (day) => Model.findById(day).lean().exec(),
    async add(day, increments) {
      await Model.updateOne({ _id: day }, { $inc: increments }, { upsert: true, setDefaultsOnInsert: true }).exec();
    },
    recent: (days) => Model.find({}).sort({ _id: -1 }).limit(days).lean().exec(),
  };
}
