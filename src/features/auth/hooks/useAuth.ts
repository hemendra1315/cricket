import { useCallback } from 'react';

import { queryClient } from '@/lib/query/queryClient';
import { useAcademyStore, useAuthStore } from '@/stores';

import { signInWithGoogle, signOut } from '../api/authApi';

/** Read-only view of auth state plus the two actions the UI needs. */
export function useAuth() {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const memberships = useAuthStore((state) => state.memberships);
  const reset = useAuthStore((state) => state.reset);
  const setActiveAcademy = useAcademyStore((state) => state.setActiveAcademy);

  const logout = useCallback(async () => {
    await signOut();
    reset();
    setActiveAcademy(null);
    queryClient.clear();
  }, [reset, setActiveAcademy]);

  return {
    status,
    user,
    session,
    memberships,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    login: signInWithGoogle,
    logout,
  };
}
