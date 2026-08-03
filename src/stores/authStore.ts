import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import type { JoinRequest, Membership, Profile } from '@/types';

/**
 * Auth *state container only* — no fetching happens here. AuthProvider pushes
 * Supabase session changes in and useIdentity pushes the profile, memberships
 * and pending join requests in once they are loaded.
 *
 * `identityStatus` is separate from `status` because a signed-in user whose
 * memberships are still loading must not be routed as "has no academy".
 */
type AuthState = {
  status: 'loading' | 'authenticated' | 'unauthenticated';
  identityStatus: 'idle' | 'loading' | 'ready' | 'error';
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  memberships: Membership[];
  joinRequests: JoinRequest[];
  setSession: (session: Session | null) => void;
  setIdentityStatus: (identityStatus: AuthState['identityStatus']) => void;
  setProfile: (profile: Profile | null) => void;
  setMemberships: (memberships: Membership[]) => void;
  setJoinRequests: (joinRequests: JoinRequest[]) => void;
  reset: () => void;
};

const signedOutState = {
  status: 'unauthenticated',
  identityStatus: 'idle',
  session: null,
  user: null,
  profile: null,
  memberships: [],
  joinRequests: [],
} satisfies Partial<AuthState>;

export const useAuthStore = create<AuthState>((set) => ({
  ...signedOutState,
  status: 'loading',
  setSession: (session) =>
    set((state) => ({
      session,
      user: session?.user ?? null,
      status: session ? 'authenticated' : 'unauthenticated',
      // Dropping the session invalidates everything derived from it.
      ...(session
        ? null
        : { identityStatus: 'idle', profile: null, memberships: [], joinRequests: [] }),
      ...(session && session.user.id !== state.user?.id
        ? { identityStatus: 'loading', profile: null, memberships: [], joinRequests: [] }
        : null),
    })),
  setIdentityStatus: (identityStatus) => set({ identityStatus }),
  setProfile: (profile) => set({ profile }),
  setMemberships: (memberships) => set({ memberships }),
  setJoinRequests: (joinRequests) => set({ joinRequests }),
  reset: () => set(signedOutState),
}));

/** Active (approved) memberships only — pending ones grant no access. */
export function selectActiveMemberships(state: AuthState): Membership[] {
  return state.memberships.filter((membership) => membership.status === 'active');
}
