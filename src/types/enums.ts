/** Mirrors the Postgres enums defined in docs/DB-SCHEMA.sql. */
export const APP_ROLES = ['super_admin', 'academy_owner', 'coach', 'player'] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const MEMBER_STATUSES = ['pending', 'active', 'suspended', 'rejected', 'left'] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export const JOIN_STATUSES = ['pending', 'approved', 'rejected', 'cancelled'] as const;
export type JoinStatus = (typeof JOIN_STATUSES)[number];

export const FEE_MODES = ['academy_pays', 'player_pays'] as const;
export type FeeMode = (typeof FEE_MODES)[number];

export const FEE_MODE_LABELS: Record<FeeMode, string> = {
  academy_pays: 'Academy pays the platform fee',
  player_pays: 'Players pay their own monthly fee',
};

/** Roles a join code may grant; owners are created with the academy itself. */
export const JOINABLE_ROLES = ['player', 'coach'] as const;
export type JoinableRole = (typeof JOINABLE_ROLES)[number];

export const THEMES = ['light', 'dark', 'system'] as const;
export type Theme = (typeof THEMES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  academy_owner: 'Academy Owner',
  coach: 'Coach',
  player: 'Player',
};

/** Landing route per role, used by the post-login redirect. */
export const ROLE_HOME: Record<AppRole, string> = {
  super_admin: '/admin',
  academy_owner: '/dashboard',
  coach: '/coach',
  player: '/me',
};
