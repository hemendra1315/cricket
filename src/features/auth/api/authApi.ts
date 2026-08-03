import { env } from '@/lib/env';
import { toApiError } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';

/**
 * Auth transport only — no business rules. Membership/approval logic arrives in
 * Phase 1 and Phase 2 respectively.
 */
export async function signInWithGoogle(redirectTo = `${env.appUrl}/auth/callback`): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, queryParams: { prompt: 'select_account' } },
  });
  if (error) throw toApiError(error);
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw toApiError(error);
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw toApiError(error);
  return data.session;
}
