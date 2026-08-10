import { useMemo } from 'react';

import { useAcademyStore, useAuthStore } from '@/stores';
import type { AppRole } from '@/types/enums';

import { hasCapability, type Capability } from './permissions';

/**
 * Roles the current user holds in the active academy. Only `active` memberships
 * count — a pending join request grants nothing. Super admin comes from the
 * profile flag (`profiles.is_super_admin`), which RLS also reads.
 */
export function useActiveRoles(): AppRole[] {
  const memberships = useAuthStore((state) => state.memberships);
  const isSuperAdmin = useAuthStore((state) => state.profile?.isSuperAdmin === true);
  const activeAcademyId = useAcademyStore((state) => state.activeAcademyId);

  return useMemo(() => {
    const activeMemberships = memberships.filter((m) => m.status === 'active');
    const targetAcademyId = activeAcademyId ?? activeMemberships[0]?.academyId;
    const roles = activeMemberships
      .filter((m) => m.academyId === targetAcademyId)
      .map((m) => m.role);
    if (isSuperAdmin) roles.push('super_admin');
    return roles;
  }, [memberships, activeAcademyId, isSuperAdmin]);
}

/** UI-level permission check. Server-side RLS remains the authority. */
export function useCan(capability: Capability): boolean {
  const roles = useActiveRoles();
  return useMemo(() => hasCapability(roles, capability), [roles, capability]);
}
