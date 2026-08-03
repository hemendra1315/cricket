/**
 * Generated Supabase types.
 *
 * This file is a PLACEHOLDER for Phase 0 — the real one is produced by
 * `npm run db:types` once the Phase 1 migrations exist. Do not hand-edit.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: 'super_admin' | 'academy_owner' | 'coach' | 'player';
      member_status: 'pending' | 'active' | 'suspended' | 'rejected' | 'left';
    };
    CompositeTypes: Record<string, never>;
  };
};
