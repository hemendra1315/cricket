import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '@/features/auth';
import { useAcademyStore } from '@/stores';

/**
 * Ensures an active tenant is selected before rendering academy-scoped routes.
 * Membership loading and the academy chooser land in Phase 1.
 */
export function RequireAcademy() {
  const { memberships } = useAuth();
  const activeAcademyId = useAcademyStore((state) => state.activeAcademyId);

  if (memberships.length === 0) return <Navigate to="/onboarding" replace />;
  if (!activeAcademyId) return <Navigate to="/onboarding/select-academy" replace />;

  return <Outlet />;
}
