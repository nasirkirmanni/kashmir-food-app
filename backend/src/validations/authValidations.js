import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const passwordMessage = "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.";

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters").transform(val => val.trim()),
  email: z.string().email("Invalid email format").max(100, "Email cannot exceed 100 characters").transform(val => val.trim().toLowerCase()),
  phoneNumber: z.string().min(8, "Phone number too short").max(20, "Phone number too long").transform(val => val.replace(/\s+/g, '')),
  password: z.string().regex(passwordRegex, passwordMessage)
}).strict();

export const loginSchema = z.object({
  email: z.string().email("Invalid email format").max(100).transform(val => val.trim().toLowerCase()),
  password: z.string().min(1, "Password is required")
}).strict();

export const verifySchema = z.object({
  email: z.string().email().transform(val => val.trim().toLowerCase()),
  otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "OTP must contain only numbers")
}).strict();

export const forgotPasswordSchema = z.object({
  email: z.string().email().transform(val => val.trim().toLowerCase()),
  method: z.enum(["email", "phone"])
}).strict();

export const verifyResetOtpSchema = z.object({
  email: z.string().email().transform(val => val.trim().toLowerCase()),
  otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "OTP must contain only numbers")
}).strict();

export const resetPasswordSchema = z.object({
  email: z.string().email().transform(val => val.trim().toLowerCase()),
  otp: z.string().length(6),
  newPassword: z.string().regex(passwordRegex, passwordMessage)
}).strict();
