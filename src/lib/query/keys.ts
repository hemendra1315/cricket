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
    member: (academyId: string, memberId: string) =>
      ['academies', academyId, 'members', memberId] as const,
    pendingRequests: (academyId: string) => ['academies', academyId, 'pending-requests'] as const,
    batches: (academyId: string) => ['academies', academyId, 'batches'] as const,
    batch: (academyId: string, batchId: string) =>
      ['academies', academyId, 'batches', batchId] as const,
    batchPlayers: (academyId: string, batchId: string) =>
      ['academies', academyId, 'batches', batchId, 'players'] as const,
    batchAvailablePlayers: (academyId: string) =>
      ['academies', academyId, 'batches', 'available-players'] as const,
    sessions: (academyId: string) => ['academies', academyId, 'sessions'] as const,
    session: (academyId: string, sessionId: string) =>
      ['academies', academyId, 'sessions', sessionId] as const,
    sessionAttendance: (academyId: string, sessionId: string) =>
      ['academies', academyId, 'sessions', sessionId, 'attendance'] as const,
    playerAttendance: (academyId: string, playerId: string) =>
      ['academies', academyId, 'players', playerId, 'attendance'] as const,
    batchAttendance: (academyId: string, batchId: string) =>
      ['academies', academyId, 'batches', batchId, 'attendance'] as const,
    drills: (academyId: string) => ['academies', academyId, 'drills'] as const,
    drill: (academyId: string, drillId: string) =>
      ['academies', academyId, 'drills', drillId] as const,
    drillAssignments: (academyId: string) => ['academies', academyId, 'drill-assignments'] as const,
    playerDrillAssignments: (academyId: string, playerId: string) =>
      ['academies', academyId, 'players', playerId, 'drill-assignments'] as const,
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
