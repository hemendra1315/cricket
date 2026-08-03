import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env } from '@/lib/env';

import type { Database } from './database.types';

export type AppSupabaseClient = SupabaseClient<Database>;

/**
 * Single browser Supabase client. Sessions persist in localStorage and are
 * auto-refreshed; the OAuth redirect is detected on app boot.
 */
export const supabase: AppSupabaseClient = createClient<Database>(
  env.supabaseUrl,
  env.supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storageKey: 'cam.auth',
    },
    global: {
      headers: { 'x-application-name': 'cricket-academy-manager' },
    },
  },
);
