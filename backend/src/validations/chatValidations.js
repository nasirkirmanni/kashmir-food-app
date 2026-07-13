import { z } from 'zod';

export const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1).max(5000, "Message content is too long")
    }).strict()
  ).min(1, "At least one message is required").max(50, "Conversation too long")
}).strict();
