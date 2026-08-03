import { Navigate, Outlet } from 'react-router-dom';

import { useActiveRoles } from '@/lib/rbac';
import type { AppRole } from '@/types/enums';

/**
 * Role-based route gate. Server-side RLS is still the authority; this only
 * prevents users from landing on screens they cannot use.
 */
export function RequireRole({ allow }: { allow: readonly AppRole[] }) {
  const roles = useActiveRoles();
  const permitted = roles.some((role) => allow.includes(role));

  if (!permitted) return <Navigate to="/forbidden" replace />;

  return <Outlet />;
}
