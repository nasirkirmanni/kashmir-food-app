import { z } from 'zod';

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

export const paginationSchema = z.object({
  page: z.string().optional().transform(val => {
    if (!val) return 1;
    const parsed = parseInt(val, 10);
    return isNaN(parsed) || parsed < 1 ? 1 : parsed;
  }),
  limit: z.string().optional().transform(val => {
    if (!val) return 10;
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed < 1) return 10;
    return parsed > 100 ? 100 : parsed;
  }),
  sort: z.string().optional().transform(val => val ? val.trim() : undefined)
}).strip();
