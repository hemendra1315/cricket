/**
 * Central query-key factory. Every key is academy-scoped so switching academies
 * never serves another tenant's cached data.
 */
export const queryKeys = {
  session: ['session'] as const,
  profile: (userId: string) => ['profile', userId] as const,
  memberships: (userId: string) => ['memberships', userId] as const,
  /** Profile + memberships + join requests: everything routing depends on. */
  identity: (userId: string) => ['identity', userId] as const,
  joinRequests: (userId: string) => ['join-requests', userId] as const,

  academy: {
    all: ['academies'] as const,
    detail: (academyId: string) => ['academies', academyId] as const,
    dashboard: (academyId: string) => ['academies', academyId, 'dashboard'] as const,
    joinCode: (academyId: string, role: string) =>
      ['academies', academyId, 'join-code', role] as const,
    members: (academyId: string, filters?: Record<string, string | undefined>) =>
      ['academies', academyId, 'members', filters ?? {}] as const,
    joinRequests: (academyId: string, status: string) =>
      ['academies', academyId, 'join-requests', status] as const,
  },

  players: {
    list: (academyId: string, filters?: Record<string, string | undefined>) =>
      ['academies', academyId, 'players', filters ?? {}] as const,
    detail: (academyId: string, playerId: string) =>
      ['academies', academyId, 'players', playerId] as const,
    me: (academyId: string) => ['academies', academyId, 'players', 'me'] as const,
  },

  coaches: {
    list: (academyId: string) => ['academies', academyId, 'coaches', {}] as const,
    detail: (academyId: string, coachId: string) =>
      ['academies', academyId, 'coaches', coachId] as const,
    me: (academyId: string) => ['academies', academyId, 'coaches', 'me'] as const,
  },

  // Reserved for later phases; kept here so key shapes stay consistent.
  batches: (academyId: string) => ['academies', academyId, 'batches'] as const,
  sessions: (academyId: string) => ['academies', academyId, 'sessions'] as const,
  attendance: (academyId: string, sessionId: string) =>
    ['academies', academyId, 'sessions', sessionId, 'attendance'] as const,
  notifications: (userId: string) => ['notifications', userId] as const,
} as const;
