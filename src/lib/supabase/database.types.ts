/**
 * Supabase types.
 *
 * Hand-maintained to match supabase/migrations (Phase 1 scope). Regenerate with
 * `npm run db:types` once a hosted project exists — the shape below mirrors what
 * the generator produces so switching over is a drop-in replacement.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AppRoleEnum = 'super_admin' | 'academy_owner' | 'coach' | 'player';
export type MemberStatusEnum = 'pending' | 'active' | 'suspended' | 'rejected' | 'left';
export type JoinStatusEnum = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type FeeModeEnum = 'academy_pays' | 'player_pays';

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
  locale: string;
  timezone: string;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
};

type AcademyRow = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  timezone: string;
  currency: string;
  fee_mode: FeeModeEnum;
  default_monthly_fee_paise: number;
  grace_period_days: number;
  settings: Json;
  owner_user_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type AcademyMemberRow = {
  id: string;
  academy_id: string;
  user_id: string;
  role: AppRoleEnum;
  status: MemberStatusEnum;
  invited_by: string | null;
  joined_at: string | null;
  left_at: string | null;
  created_at: string;
  updated_at: string;
};

type JoinRequestRow = {
  id: string;
  academy_id: string;
  user_id: string;
  join_code_id: string | null;
  requested_role: AppRoleEnum;
  status: JoinStatusEnum;
  message: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
};

type JoinCodeRow = {
  id: string;
  academy_id: string;
  code: string;
  role: AppRoleEnum;
  is_active: boolean;
  expires_at: string | null;
  max_uses: number | null;
  use_count: number;
  created_by: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { id: string; email: string };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      academies: {
        Row: AcademyRow;
        Insert: Partial<AcademyRow> & { name: string; slug: string; owner_user_id: string };
        Update: Partial<AcademyRow>;
        Relationships: [];
      };
      academy_members: {
        Row: AcademyMemberRow;
        Insert: Partial<AcademyMemberRow> & {
          academy_id: string;
          user_id: string;
          role: AppRoleEnum;
        };
        Update: Partial<AcademyMemberRow>;
        // Needed for embedded selects (`profiles!inner(...)`) to typecheck.
        Relationships: [
          {
            foreignKeyName: 'academy_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'academy_members_academy_id_fkey';
            columns: ['academy_id'];
            isOneToOne: false;
            referencedRelation: 'academies';
            referencedColumns: ['id'];
          },
        ];
      };
      academy_join_codes: {
        Row: JoinCodeRow;
        Insert: Partial<JoinCodeRow> & { academy_id: string; code: string };
        Update: Partial<JoinCodeRow>;
        Relationships: [];
      };
      join_requests: {
        Row: JoinRequestRow;
        Insert: Partial<JoinRequestRow> & { academy_id: string; user_id: string };
        Update: Partial<JoinRequestRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_academy: {
        Args: {
          p_name: string;
          p_city?: string | null;
          p_timezone?: string;
          p_fee_mode?: FeeModeEnum;
        };
        Returns: AcademyRow;
      };
      regenerate_join_code: {
        Args: {
          p_academy: string;
          p_role?: AppRoleEnum;
          p_expires_at?: string | null;
          p_max_uses?: number | null;
        };
        Returns: string;
      };
      request_join_by_code: {
        Args: { p_code: string; p_message?: string | null };
        Returns: JoinRequestRow;
      };
      academy_active_join_code: {
        Args: { p_academy: string; p_role?: AppRoleEnum };
        Returns: string | null;
      };
      my_memberships: {
        Args: Record<string, never>;
        Returns: {
          membership_id: string;
          academy_id: string;
          academy_name: string;
          academy_slug: string;
          logo_url: string | null;
          city: string | null;
          timezone: string;
          role: AppRoleEnum;
          status: MemberStatusEnum;
        }[];
      };
      my_join_requests: {
        Args: Record<string, never>;
        Returns: {
          request_id: string;
          academy_id: string;
          academy_name: string;
          requested_role: AppRoleEnum;
          status: JoinStatusEnum;
          created_at: string;
        }[];
      };
    };
    Enums: {
      app_role: AppRoleEnum;
      member_status: MemberStatusEnum;
      join_status: JoinStatusEnum;
      fee_mode: FeeModeEnum;
    };
    CompositeTypes: Record<string, never>;
  };
};
