import { useMemo } from 'react';

import { useAcademyStore, useAuthStore } from '@/stores';
import type { AppRole } from '@/types/enums';

import { hasCapability, type Capability } from './permissions';

/** Roles the current user holds in the active academy (plus super admin). */
export function useActiveRoles(): AppRole[] {
  const memberships = useAuthStore((state) => state.memberships);
  const user = useAuthStore((state) => state.user);
  const activeAcademyId = useAcademyStore((state) => state.activeAcademyId);

  return useMemo(() => {
    const roles = memberships
      .filter((m) => m.academyId === activeAcademyId && m.status === 'active')
      .map((m) => m.role);
    if (user?.app_metadata?.is_super_admin === true) roles.push('super_admin');
    return roles;
  }, [memberships, activeAcademyId, user]);
}

/** UI-level permission check. Server-side RLS remains the authority. */
export function useCan(capability: Capability): boolean {
  const roles = useActiveRoles();
  return useMemo(() => hasCapability(roles, capability), [roles, capability]);
}
