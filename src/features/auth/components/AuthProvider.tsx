import { useEffect, type ReactNode } from 'react';

import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores';

/**
 * Bridges Supabase auth events into the auth store. It only manages the
 * session; memberships are loaded in Phase 1.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setSession(data.session);
      })
      .catch((error: unknown) => {
        logger.error('session_bootstrap_failed', { error: String(error) });
        if (active) setSession(null);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      logger.debug('auth_state_change', { event });
      setSession(session);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [setSession]);

  return <>{children}</>;
}
