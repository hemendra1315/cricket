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

export const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'elite'] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number];

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  elite: 'Elite',
};

export const BATTING_STYLES = ['right_hand', 'left_hand'] as const;
export type BattingStyle = (typeof BATTING_STYLES)[number];

export const BATTING_STYLE_LABELS: Record<BattingStyle, string> = {
  right_hand: 'Right hand',
  left_hand: 'Left hand',
};

export const PLAYER_ROLES = ['batsman', 'bowler', 'all_rounder', 'wicketkeeper'] as const;
export type PlayerRole = (typeof PLAYER_ROLES)[number];

export const PLAYER_ROLE_LABELS: Record<PlayerRole, string> = {
  batsman: 'Batsman',
  bowler: 'Bowler',
  all_rounder: 'All-rounder',
  wicketkeeper: 'Wicketkeeper',
};

/** Coaching specialisations stored as a text[] on `coaches`. */
export const COACH_SPECIALIZATIONS = [
  'batting',
  'bowling',
  'fielding',
  'wicketkeeping',
  'fitness',
] as const;
export type CoachSpecialization = (typeof COACH_SPECIALIZATIONS)[number];

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
