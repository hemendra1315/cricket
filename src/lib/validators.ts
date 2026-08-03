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

export const createAcademyFormSchema = z.object({
  name: z.string().trim().min(2, 'Academy name must be at least 2 characters.').max(120),
  city: z.string().trim().max(80).optional().or(z.literal('')),
  timezone: z.string().min(1),
  feeMode: z.enum(['player_pays', 'academy_pays']),
});

export type CreateAcademyFormValues = z.infer<typeof createAcademyFormSchema>;

export const joinAcademyFormSchema = z.object({
  code: joinCodeSchema,
  message: z.string().trim().max(280).optional().or(z.literal('')),
});

export type JoinAcademyFormValues = z.infer<typeof joinAcademyFormSchema>;

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(''));

// Stays a string end to end: coercion would turn a blank input into 0, and the
// resolver needs the form's input and output types to match.
const optionalInteger = (min: number, max: number) =>
  z
    .string()
    .trim()
    .refine(
      (value) =>
        value === '' || (/^\d+$/.test(value) && Number(value) >= min && Number(value) <= max),
      `Enter a whole number between ${min} and ${max}.`,
    );

/**
 * Player profile form. Fields an academy controls (player code, skill level,
 * medical notes) are rendered only for staff; the RPC a player uses to edit
 * their own row ignores them regardless.
 */
export const playerProfileFormSchema = z.object({
  dateOfBirth: isoDateSchema.optional().or(z.literal('')),
  battingStyle: z.enum(['right_hand', 'left_hand']).optional().or(z.literal('')),
  bowlingStyle: optionalText(60),
  playerRole: z
    .enum(['batsman', 'bowler', 'all_rounder', 'wicketkeeper'])
    .optional()
    .or(z.literal('')),
  jerseyNumber: optionalInteger(0, 999),
  guardianName: optionalText(80),
  guardianPhone: indianPhoneSchema.optional().or(z.literal('')),
  guardianEmail: emailSchema.optional().or(z.literal('')),
  emergencyContact: optionalText(120),
  playerCode: optionalText(32),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'elite']),
  medicalNotes: optionalText(2000),
});

export type PlayerProfileFormValues = z.infer<typeof playerProfileFormSchema>;

/**
 * Batch form. The fee is entered in rupees and stored in paise, so it stays a
 * string here and is converted once, next to the other numeric fields.
 */
export const batchFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Give the batch a name.').max(80),
    description: optionalText(1000),
    ageGroup: optionalText(20),
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'elite']).or(z.literal('')),
    venueId: z.string(),
    capacity: optionalInteger(1, 500),
    monthlyFeeRupees: optionalInteger(0, 1_000_000),
    startDate: isoDateSchema.or(z.literal('')),
    endDate: isoDateSchema.or(z.literal('')),
  })
  .refine((values) => !values.startDate || !values.endDate || values.endDate >= values.startDate, {
    path: ['endDate'],
    message: 'The end date cannot be before the start date.',
  });

export type BatchFormValues = z.infer<typeof batchFormSchema>;

export const coachProfileFormSchema = z.object({
  bio: optionalText(2000),
  experienceYears: optionalInteger(0, 70),
  specialization: z.array(z.string()),
});

export type CoachProfileFormValues = z.infer<typeof coachProfileFormSchema>;
