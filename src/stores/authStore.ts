import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import type { Membership } from '@/types';

/**
 * Auth *state container only* — no business logic. The AuthProvider pushes
 * Supabase session changes in; Phase 1 will populate `memberships` from the DB.
 */
type AuthState = {
  status: 'loading' | 'authenticated' | 'unauthenticated';
  session: Session | null;
  user: User | null;
  memberships: Membership[];
  setSession: (session: Session | null) => void;
  setMemberships: (memberships: Membership[]) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  session: null,
  user: null,
  memberships: [],
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      status: session ? 'authenticated' : 'unauthenticated',
    }),
  setMemberships: (memberships) => set({ memberships }),
  reset: () => set({ status: 'unauthenticated', session: null, user: null, memberships: [] }),
}));
