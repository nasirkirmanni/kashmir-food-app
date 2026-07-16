import { z } from 'zod';
import { objectIdSchema, paginationSchema } from './common.js';

export const dishSearchQuerySchema = z.object({
  search: z.string().max(100).optional(),
  category: z.enum(["Wazwan", "Kashmiri Cuisine", "Bakery", "Street Food", "Desserts", "Beverages"]).optional(),
  foodType: z.enum(["Veg", "Non-veg"]).optional(),
  categoryType: z.enum(["wazwan", "kashmiri_cuisine", "bakery", "beverage"]).optional()
}).merge(paginationSchema).strip();

export const dishCreateSchema = z.object({
  name: z.string().min(2).max(100).transform(val => val.trim()),
  description: z.string().min(10).max(1000).transform(val => val.trim()),
  fullDescription: z.string().min(10).max(3000).transform(val => val.trim()),
  history: z.string().max(2000).transform(val => val.trim()),
  touristTip: z.string().max(500).transform(val => val.trim()),
  category: z.enum(["Wazwan", "Kashmiri Cuisine", "Bakery", "Street Food", "Desserts", "Beverages"]),
  categoryType: z.enum(["wazwan", "kashmiri_cuisine", "bakery", "beverage"]),
  courseType: z.enum(["foundation", "starter", "main", "finale", "dessert"]).optional(),
  foodType: z.enum(["Veg", "Non-veg"]),
  image: z.string().url().max(500),
  priceRange: z.string().max(50),
  popularityRating: z.number().min(0).max(5).optional(),
  spiceLevel: z.string().max(20).optional(),
  tags: z.array(z.string().max(50)).optional(),
  authenticityScore: z.number().min(1).max(5).optional(),
  touristFriendlinessScore: z.number().min(1).max(5).optional(),
  luxuryScore: z.number().min(1).max(5).optional(),
  slug: z.string().max(100).optional()
}).strict();

export const dishUpdateSchema = dishCreateSchema.partial().strict();

export const dishIdParamSchema = z.object({
  id: objectIdSchema
}).strict();

export const dishSlugParamSchema = z.object({
  idOrSlug: z.string().max(100)
}).strict();
