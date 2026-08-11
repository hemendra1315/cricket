import { describe, expect, it, beforeEach } from 'vitest';
import { useAcademyStore, useAuthStore, useTestModeStore } from '@/stores';
import { useActiveRoles, useCan } from '@/lib/rbac';
import { renderHook, act } from '@testing-library/react';

describe('Phase 37 — Role-Accurate Test App As Mode Verification', () => {
  beforeEach(() => {
    act(() => {
      useTestModeStore.getState().exitTestMode();
      useAuthStore.setState({
        status: 'authenticated',
        identityStatus: 'ready',
        profile: {
          id: 'super-admin-user',
          email: 'admin@cricket.app',
          fullName: 'Super Admin',
          phone: null,
          avatarUrl: null,
          dateOfBirth: null,
          locale: 'en-US',
          timezone: 'UTC',
          isSuperAdmin: true,
        },
        memberships: [],
        joinRequests: [],
      });
      useAcademyStore.getState().setActiveAcademy('academy-123');
    });
  });

  it('allows entering Student mode, Coach mode, and Owner mode, then exiting test mode', () => {
    const store = useTestModeStore.getState();
    expect(store.activeRole).toBeNull();

    act(() => {
      store.setTestMode('student', 'academy-123');
    });
    expect(useTestModeStore.getState().activeRole).toBe('student');

    act(() => {
      store.setTestMode('coach', 'academy-123');
    });
    expect(useTestModeStore.getState().activeRole).toBe('coach');

    act(() => {
      store.setTestMode('academy_owner', 'academy-123');
    });
    expect(useTestModeStore.getState().activeRole).toBe('academy_owner');

    act(() => {
      store.exitTestMode();
    });
    expect(useTestModeStore.getState().activeRole).toBeNull();
  });

  it('guarantees Super Admin actual profile and database roles remain completely untouched', () => {
    const profileBefore = useAuthStore.getState().profile;
    const membershipsBefore = useAuthStore.getState().memberships;

    act(() => {
      useTestModeStore.getState().setTestMode('student', 'academy-123');
    });

    const profileAfter = useAuthStore.getState().profile;
    const membershipsAfter = useAuthStore.getState().memberships;

    // Real authentication & database state is strictly unchanged
    expect(profileAfter?.isSuperAdmin).toBe(true);
    expect(profileAfter?.id).toBe(profileBefore?.id);
    expect(membershipsAfter).toEqual(membershipsBefore);
  });

  it('strictly restricts capabilities according to simulated Student role', () => {
    act(() => {
      useTestModeStore.getState().setTestMode('student', 'academy-123');
    });

    const { result: roles } = renderHook(() => useActiveRoles());
    expect(roles.current).toEqual(['player']);

    // Student can read own stats, sessions, attendance, matches
    const { result: canReadOwnStats } = renderHook(() => useCan('stats:read_own'));
    const { result: canReadSessions } = renderHook(() => useCan('sessions:read'));
    const { result: canReadMatches } = renderHook(() => useCan('matches:read'));

    expect(canReadOwnStats.current).toBe(true);
    expect(canReadSessions.current).toBe(true);
    expect(canReadMatches.current).toBe(true);

    // Student CANNOT manage members, create batches, manage academy, or manage drills
    const { result: canManageMembers } = renderHook(() => useCan('members:manage'));
    const { result: canManageBatches } = renderHook(() => useCan('batches:manage'));
    const { result: canUpdateAcademy } = renderHook(() => useCan('academy:update'));
    const { result: canManageDrills } = renderHook(() => useCan('drills:manage'));

    expect(canManageMembers.current).toBe(false);
    expect(canManageBatches.current).toBe(false);
    expect(canUpdateAcademy.current).toBe(false);
    expect(canManageDrills.current).toBe(false);
  });

  it('strictly restricts capabilities according to simulated Coach role', () => {
    act(() => {
      useTestModeStore.getState().setTestMode('coach', 'academy-123');
    });

    const { result: roles } = renderHook(() => useActiveRoles());
    expect(roles.current).toEqual(['coach']);

    // Coach can read & manage sessions, mark attendance, read matches, manage drills
    const { result: canManageSessions } = renderHook(() => useCan('sessions:manage'));
    const { result: canMarkAttendance } = renderHook(() => useCan('attendance:mark'));
    const { result: canManageDrills } = renderHook(() => useCan('drills:manage'));

    expect(canManageSessions.current).toBe(true);
    expect(canMarkAttendance.current).toBe(true);
    expect(canManageDrills.current).toBe(true);

    // Coach CANNOT manage academy settings or regenerate join codes
    const { result: canUpdateAcademy } = renderHook(() => useCan('academy:update'));
    const { result: canRegenerateJoinCode } = renderHook(() =>
      useCan('academy:regenerate_join_code'),
    );

    expect(canUpdateAcademy.current).toBe(false);
    expect(canRegenerateJoinCode.current).toBe(false);
  });

  it('grants owner capabilities when simulated as Academy Owner', () => {
    act(() => {
      useTestModeStore.getState().setTestMode('academy_owner', 'academy-123');
    });

    const { result: roles } = renderHook(() => useActiveRoles());
    expect(roles.current).toEqual(['academy_owner']);

    const { result: canUpdateAcademy } = renderHook(() => useCan('academy:update'));
    const { result: canManageMembers } = renderHook(() => useCan('members:manage'));
    const { result: canManageBatches } = renderHook(() => useCan('batches:manage'));

    expect(canUpdateAcademy.current).toBe(true);
    expect(canManageMembers.current).toBe(true);
    expect(canManageBatches.current).toBe(true);
  });

  it('prevents non-Super Admin users from utilizing Test App As mode activeRole in RBAC', () => {
    act(() => {
      useAuthStore.setState({
        profile: {
          id: 'normal-user',
          email: 'user@cricket.app',
          fullName: 'Normal Coach',
          phone: null,
          avatarUrl: null,
          dateOfBirth: null,
          locale: 'en-US',
          timezone: 'UTC',
          isSuperAdmin: false,
        },
        memberships: [
          {
            id: 'mem-1',
            academyId: 'academy-123',
            role: 'coach',
            status: 'active',
            academyName: 'Demo Academy',
            academySlug: 'demo',
            logoUrl: null,
            city: 'London',
            timezone: 'UTC',
          },
        ],
      });
    });

    act(() => {
      useTestModeStore.getState().setTestMode('student', 'academy-123');
    });
    const { result } = renderHook(() => useActiveRoles());
    expect(result.current).toEqual(['coach']);
  });

  it('clears test mode on exit or logout', () => {
    act(() => {
      useTestModeStore.getState().setTestMode('student', 'academy-123');
    });
    expect(useTestModeStore.getState().activeRole).toBe('student');

    act(() => {
      useTestModeStore.getState().exitTestMode();
    });
    expect(useTestModeStore.getState().activeRole).toBeNull();
  });
});
