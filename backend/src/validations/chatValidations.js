import { z } from 'zod';

// What the chat endpoint accepts. The conversation is the visitor's and the assistant's turns only:
// a "system" turn from a browser is not something the server takes instructions from.
//
// `mode: "recipe"` and `dish` come from the recipe button on a dish page. `isRecipeExplore` is the
// name the older page script uses for the same thing; it is accepted so those pages keep working.
//
// `conversationId` names the conversation the site keeps (made by the browser, random); with it the
// server answers from its own record and `messages` is only the fallback. `clientRequestId` names
// this one question, so that it is answered once however often it is sent, and `resumeFrom` asks
// for the events of that answer from the given number on, after a dropped connection.
const requestId = z.string().regex(/^[A-Za-z0-9_-]{6,64}$/, "Invalid request id");
const conversationId = z.string().regex(/^[A-Za-z0-9_-]{16,64}$/, "Invalid conversation id");

export const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(5000, "Message content is too long")
    }).strict()
  ).min(1, "At least one message is required").max(50, "Conversation too long"),
  mode: z.enum(['chat', 'recipe']).optional(),
  dish: z.string().regex(/^[a-z0-9-]{1,80}$/, "Invalid dish").optional(),
  isRecipeExplore: z.boolean().optional(),
  clientRequestId: requestId.optional(),
  conversationId: conversationId.optional(),
  resumeFrom: z.number().int().min(0).max(100000).optional()
}).strict();

export const cancelSchema = z.object({
  clientRequestId: requestId,
  conversationId: conversationId.optional()
}).strict();

export const conversationParams = z.object({ id: conversationId });
