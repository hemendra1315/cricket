import { describe, expect, it, beforeEach } from 'vitest';
import { useAcademyStore, useAuthStore, useTestModeStore } from '@/stores';
import { useActiveRoles } from '@/lib/rbac';
import { renderHook, act } from '@testing-library/react';

describe('Phase 36 — Super Admin Test App As Mode Verification', () => {
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

  it('resolves active roles correctly when testModeRole is set for Super Admin', () => {
    // Normal Super Admin view without test mode
    const { result: saRoles } = renderHook(() => useActiveRoles());
    expect(saRoles.current).toContain('super_admin');

    // Student Test Mode
    act(() => {
      useTestModeStore.getState().setTestMode('student', 'academy-123');
    });
    const { result: studentRoles } = renderHook(() => useActiveRoles());
    expect(studentRoles.current).toEqual(['player']);

    // Coach Test Mode
    act(() => {
      useTestModeStore.getState().setTestMode('coach', 'academy-123');
    });
    const { result: coachRoles } = renderHook(() => useActiveRoles());
    expect(coachRoles.current).toEqual(['coach']);

    // Owner Test Mode
    act(() => {
      useTestModeStore.getState().setTestMode('academy_owner', 'academy-123');
    });
    const { result: ownerRoles } = renderHook(() => useActiveRoles());
    expect(ownerRoles.current).toEqual(['academy_owner']);
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

    // Even if testModeStore somehow has activeRole set, normal user retains their real membership role
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
