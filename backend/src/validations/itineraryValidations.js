import { z } from "zod";

// Traveler composition — coerced so form string values ("2") are accepted.
const travelers = z
  .object({
    adults: z.coerce.number().int().min(0).max(30).optional(),
    children: z.coerce.number().int().min(0).max(30).optional(),
    seniors: z.coerce.number().int().min(0).max(30).optional(),
  })
  .optional();

// Preferences payload for POST /generate and POST /claim. All fields optional;
// the engine applies sensible defaults. Unknown keys are stripped by Zod.
export const generateItinerarySchema = z.object({
  lengthDays: z.coerce.number().int().min(1).max(21).optional(),
  startDate: z.string().max(40).optional(),
  endDate: z.string().max(40).optional(),
  flexibleDates: z.coerce.boolean().optional(),
  season: z.enum(["spring", "summer", "autumn", "winter"]).optional(),
  pace: z.enum(["relaxed", "balanced", "packed"]).optional(),
  travelers,
  style: z.array(z.string().max(40)).max(12).optional(),
  interests: z.array(z.string().max(40)).max(20).optional(),
  accommodation: z.array(z.string().max(40)).max(10).optional(),
  transport: z.string().max(40).optional(),
  food: z.array(z.string().max(40)).max(10).optional(),
  budgetTier: z.string().max(20).optional(),
  arrivalCity: z.string().max(60).optional(),
  departureCity: z.string().max(60).optional(),
  originCity: z.string().max(60).optional(),
});

// Booking a generated itinerary with a chosen operator (Phase 2). Collects PII,
// so `consent` must be explicitly true.
export const bookItinerarySchema = z.object({
  agencyId: z.string().min(1).max(64),
  traveler: z.object({
    name: z.string().min(1).max(120),
    email: z.string().email().max(160),
    phone: z.string().min(5).max(30),
    whatsapp: z.string().max(30).optional(),
    country: z.string().max(60).optional(),
    state: z.string().max(60).optional(),
    city: z.string().max(60).optional(),
    arrivalDate: z.string().max(40).optional(),
    groupSize: z
      .object({
        adults: z.coerce.number().int().min(0).max(30).optional(),
        children: z.coerce.number().int().min(0).max(30).optional(),
        seniors: z.coerce.number().int().min(0).max(30).optional(),
      })
      .optional(),
    specialRequests: z.string().max(1000).optional(),
  }),
  consent: z.literal(true), // explicit consent to share contact details with the operator
});
