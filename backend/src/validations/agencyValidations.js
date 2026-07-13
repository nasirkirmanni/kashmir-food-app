import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const passwordMessage = "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.";

// For FormData, everything is a string initially.
export const agencyRegistrationSchema = z.object({
  email: z.string().email().max(100).transform(val => val.trim().toLowerCase()),
  password: z.string().regex(passwordRegex, passwordMessage),
  phoneNumber: z.string().min(8).max(20).transform(val => val.replace(/\s+/g, '')),
  agencyName: z.string().min(2).max(100).transform(val => val.trim()),
  ownerName: z.string().min(2).max(50).transform(val => val.trim()),
  contactNumber: z.string().min(8).max(20).transform(val => val.replace(/\s+/g, '')),
  whatsapp: z.string().optional().transform(val => val ? val.replace(/\s+/g, '') : undefined),
  city: z.string().min(2).max(50).transform(val => val.trim()),
  yearsInBusiness: z.coerce.number().min(0).max(200),
  facebookUsername: z.string().max(100).optional().transform(val => val?.trim()),
  instagramUsername: z.string().max(100).optional().transform(val => val?.trim()),
  description: z.string().max(3000).optional().transform(val => val?.trim())
}).strict();

export const agencyUpdateSchema = z.object({
  agencyName: z.string().min(2).max(100).optional().transform(val => val?.trim()),
  ownerName: z.string().min(2).max(50).optional().transform(val => val?.trim()),
  contactNumber: z.string().min(8).max(20).optional().transform(val => val?.replace(/\s+/g, '')),
  address: z.string().max(200).optional().transform(val => val?.trim()),
  description: z.string().max(3000).optional().transform(val => val?.trim()),
  instagramLink: z.string().url().max(200).optional().or(z.literal('')),
  facebookLink: z.string().url().max(200).optional().or(z.literal('')),
}).strict();

export const agencyStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  notes: z.string().max(1000).optional().transform(val => val?.trim())
}).strict();
