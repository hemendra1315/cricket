import { z } from 'zod';

/** Reusable Zod primitives so validation rules stay consistent across forms. */
export const uuidSchema = z.string().uuid();

export const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address.');

export const indianPhoneSchema = z
  .string()
  .trim()
  .regex(/^(\+91)?[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number.');

/** Crockford base32 alphabet (no I, L, O, U) — matches the join code generator. */
export const joinCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[0-9ABCDEFGHJKMNPQRSTVWXYZ]{6,8}$/, 'Join codes are 6–8 letters and digits.');

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the YYYY-MM-DD format.');

export const paiseSchema = z.number().int().nonnegative();

export const profileFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name.').max(80),
  phone: indianPhoneSchema.optional().or(z.literal('')),
  dateOfBirth: isoDateSchema.optional().or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
