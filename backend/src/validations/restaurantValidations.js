import { z } from 'zod';
import { objectIdSchema, paginationSchema } from './common.js';

export const restaurantSearchQuerySchema = z.object({
  search: z.string().max(100).optional(),
  budget: z.enum(["Budget", "Mid-range", "Luxury"]).optional(),
  location: z.string().max(100).optional(),
  foodType: z.enum(["Vegetarian", "Non-Vegetarian", "Both"]).optional() // Assumes Dish foodTypes
}).merge(paginationSchema).strip(); // Strip ignores unknown query parameters

export const restaurantCreateSchema = z.object({
  name: z.string().min(2).max(100).transform(val => val.trim()),
  location: z.string().min(2).max(200).transform(val => val.trim()),
  city: z.string().min(2).max(50).transform(val => val.trim()),
  rating: z.number().min(0).max(5).optional(),
  priceLevel: z.enum(["Budget", "Mid-range", "Luxury"]),
  tags: z.array(z.string().max(50)).optional(),
  linkedDishes: z.array(objectIdSchema).optional(),
  image: z.string().url().max(500),
  description: z.string().min(10).max(3000).transform(val => val.trim()),
  phoneNumber: z.string().max(20).optional(),
  openingHours: z.string().max(100).optional(),
  website: z.string().url().max(200).optional().or(z.literal('')),
  authentic: z.boolean().optional(),
  overpriced: z.boolean().optional(),
  touristTrapWarning: z.boolean().optional(),
  touristTrapReason: z.string().max(500).optional(),
  googleMapsQuery: z.string().max(200),
  authenticityScore: z.number().min(1).max(5).optional(),
  touristFriendlinessScore: z.number().min(1).max(5).optional(),
  luxuryScore: z.number().min(1).max(5).optional(),
  slug: z.string().max(100).optional()
}).strict();

export const restaurantUpdateSchema = restaurantCreateSchema.partial().strict();

export const restaurantIdParamSchema = z.object({
  id: objectIdSchema
}).strict();

export const restaurantSlugParamSchema = z.object({
  idOrSlug: z.string().max(100) // Could be objectId or slug
}).strict();
