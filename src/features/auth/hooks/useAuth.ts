import { useCallback } from 'react';

import { queryClient } from '@/lib/query/queryClient';
import { useAcademyStore, useAuthStore } from '@/stores';

import { signInWithGoogle, signOut } from '../api/authApi';

/** Read-only view of auth state plus the two actions the UI needs. */
export function useAuth() {
  const status = useAuthStore((state) => state.status);
  const identityStatus = useAuthStore((state) => state.identityStatus);
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const memberships = useAuthStore((state) => state.memberships);
  const joinRequests = useAuthStore((state) => state.joinRequests);
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
    identityStatus,
    user,
    session,
    profile,
    memberships,
    joinRequests,
    displayName: profile?.fullName ?? profile?.email ?? user?.email ?? '',
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    /** Signed in *and* profile/memberships resolved — routing waits for this. */
    isIdentityReady: status === 'authenticated' && identityStatus === 'ready',
    login: signInWithGoogle,
    logout,
  };
}
