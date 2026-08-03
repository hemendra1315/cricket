import type { AppRole, MemberStatus } from './enums';

/**
 * Hand-written domain types for the entities Phase 0 touches. Once Phase 1
 * migrations land these become aliases of the generated `Database` row types.
 */
export type UUID = string;

export type Profile = {
  id: UUID;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  locale: string;
  timezone: string;
  isSuperAdmin: boolean;
};

export type Membership = {
  id: UUID;
  academyId: UUID;
  academyName: string;
  role: AppRole;
  status: MemberStatus;
};

export type AcademySummary = {
  id: UUID;
  name: string;
  slug: string;
  logoUrl: string | null;
  city: string | null;
  timezone: string;
};

/** Uniform shape returned by Edge Functions on failure. */
export type ApiErrorResponse = {
  error: { code: string; message: string; details?: unknown };
};
