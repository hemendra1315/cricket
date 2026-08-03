/**
 * Central query-key factory. Every key is academy-scoped so switching academies
 * never serves another tenant's cached data.
 */
export const queryKeys = {
  session: ['session'] as const,
  profile: (userId: string) => ['profile', userId] as const,
  memberships: (userId: string) => ['memberships', userId] as const,

  academy: {
    all: ['academies'] as const,
    detail: (academyId: string) => ['academies', academyId] as const,
    dashboard: (academyId: string) => ['academies', academyId, 'dashboard'] as const,
  },

  // Reserved for later phases; kept here so key shapes stay consistent.
  players: (academyId: string) => ['academies', academyId, 'players'] as const,
  coaches: (academyId: string) => ['academies', academyId, 'coaches'] as const,
  batches: (academyId: string) => ['academies', academyId, 'batches'] as const,
  sessions: (academyId: string) => ['academies', academyId, 'sessions'] as const,
  attendance: (academyId: string, sessionId: string) =>
    ['academies', academyId, 'sessions', sessionId, 'attendance'] as const,
  notifications: (userId: string) => ['notifications', userId] as const,
} as const;
