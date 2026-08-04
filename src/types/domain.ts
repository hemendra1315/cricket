import type { AppRole, FeeMode, JoinStatus, MemberStatus } from './enums';

/**
 * Camel-cased domain types. Row → domain mapping lives in the feature api
 * modules so snake_case never leaks into components.
 */
export type UUID = string;

export type Profile = {
  id: UUID;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  locale: string;
  timezone: string;
  isSuperAdmin: boolean;
};

export type Membership = {
  id: UUID;
  academyId: UUID;
  academyName: string;
  academySlug: string;
  logoUrl: string | null;
  city: string | null;
  timezone: string;
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

export type Academy = AcademySummary & {
  state: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  feeMode: FeeMode;
  defaultMonthlyFeePaise: number;
  gracePeriodDays: number;
  ownerUserId: UUID;
  isActive: boolean;
  createdAt: string;
};

export type JoinRequest = {
  id: UUID;
  academyId: UUID;
  academyName: string;
  requestedRole: AppRole;
  status: JoinStatus;
  createdAt: string;
};

export type PendingJoinRequest = {
  id: UUID;
  academyId: UUID;
  userId: UUID;
  requestedRole: AppRole;
  status: JoinStatus;
  message: string | null;
  createdAt: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
};

/** A roster row: the membership joined to the member's profile. */
export type AcademyMember = {
  id: UUID;
  academyId: UUID;
  userId: UUID;
  role: AppRole;
  status: MemberStatus;
  joinedAt: string | null;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  phone: string | null;
};

/** Uniform shape returned by Edge Functions on failure. */
export type ApiErrorResponse = {
  error: { code: string; message: string; details?: unknown };
};
