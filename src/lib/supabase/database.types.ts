export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      academies: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          currency: string
          default_monthly_fee_paise: number
          deleted_at: string | null
          fee_mode: Database["public"]["Enums"]["fee_mode"]
          grace_period_days: number
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          owner_user_id: string
          settings: Json
          slug: string
          state: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          default_monthly_fee_paise?: number
          deleted_at?: string | null
          fee_mode?: Database["public"]["Enums"]["fee_mode"]
          grace_period_days?: number
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          owner_user_id: string
          settings?: Json
          slug: string
          state?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          default_monthly_fee_paise?: number
          deleted_at?: string | null
          fee_mode?: Database["public"]["Enums"]["fee_mode"]
          grace_period_days?: number
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          owner_user_id?: string
          settings?: Json
          slug?: string
          state?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academies_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_join_codes: {
        Row: {
          academy_id: string
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          role: Database["public"]["Enums"]["app_role"]
          use_count: number
        }
        Insert: {
          academy_id: string
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          role?: Database["public"]["Enums"]["app_role"]
          use_count?: number
        }
        Update: {
          academy_id?: string
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          role?: Database["public"]["Enums"]["app_role"]
          use_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "academy_join_codes_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_join_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_members: {
        Row: {
          academy_id: string
          created_at: string
          id: string
          invited_by: string | null
          joined_at: string | null
          left_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          academy_id: string
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          left_at?: string | null
          role: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          academy_id?: string
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          left_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_members_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_coaches: {
        Row: {
          academy_id: string
          assigned_at: string
          batch_id: string
          coach_id: string
          is_primary: boolean
        }
        Insert: {
          academy_id: string
          assigned_at?: string
          batch_id: string
          coach_id: string
          is_primary?: boolean
        }
        Update: {
          academy_id?: string
          assigned_at?: string
          batch_id?: string
          coach_id?: string
          is_primary?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "batch_coaches_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_coaches_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_coaches_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_players: {
        Row: {
          academy_id: string
          batch_id: string
          id: string
          is_active: boolean | null
          joined_at: string
          left_at: string | null
          player_id: string
        }
        Insert: {
          academy_id: string
          batch_id: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          left_at?: string | null
          player_id: string
        }
        Update: {
          academy_id?: string
          batch_id?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          left_at?: string | null
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_players_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_players_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          academy_id: string
          age_group: string | null
          capacity: number | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          monthly_fee_paise: number | null
          name: string
          skill_level: Database["public"]["Enums"]["skill_level"] | null
          start_date: string | null
          updated_at: string
          venue_id: string | null
        }
        Insert: {
          academy_id: string
          age_group?: string | null
          capacity?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          monthly_fee_paise?: number | null
          name: string
          skill_level?: Database["public"]["Enums"]["skill_level"] | null
          start_date?: string | null
          updated_at?: string
          venue_id?: string | null
        }
        Update: {
          academy_id?: string
          age_group?: string | null
          capacity?: number | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          monthly_fee_paise?: number | null
          name?: string
          skill_level?: Database["public"]["Enums"]["skill_level"] | null
          start_date?: string | null
          updated_at?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batches_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          academy_id: string
          availability: Json
          bio: string | null
          certifications: Json
          created_at: string
          deleted_at: string | null
          experience_years: number | null
          id: string
          is_active: boolean
          specialization: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          academy_id: string
          availability?: Json
          bio?: string | null
          certifications?: Json
          created_at?: string
          deleted_at?: string | null
          experience_years?: number | null
          id?: string
          is_active?: boolean
          specialization?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          academy_id?: string
          availability?: Json
          bio?: string | null
          certifications?: Json
          created_at?: string
          deleted_at?: string | null
          experience_years?: number | null
          id?: string
          is_active?: boolean
          specialization?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaches_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      join_requests: {
        Row: {
          academy_id: string
          created_at: string
          id: string
          join_code_id: string | null
          message: string | null
          rejection_reason: string | null
          requested_role: Database["public"]["Enums"]["app_role"]
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["join_status"]
          user_id: string
        }
        Insert: {
          academy_id: string
          created_at?: string
          id?: string
          join_code_id?: string | null
          message?: string | null
          rejection_reason?: string | null
          requested_role?: Database["public"]["Enums"]["app_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["join_status"]
          user_id: string
        }
        Update: {
          academy_id?: string
          created_at?: string
          id?: string
          join_code_id?: string | null
          message?: string | null
          rejection_reason?: string | null
          requested_role?: Database["public"]["Enums"]["app_role"]
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["join_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "join_requests_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "join_requests_join_code_id_fkey"
            columns: ["join_code_id"]
            isOneToOne: false
            referencedRelation: "academy_join_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "join_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "join_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          academy_id: string
          batting_style: string | null
          bowling_style: string | null
          created_at: string
          date_of_birth: string | null
          deleted_at: string | null
          emergency_contact: string | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          is_active: boolean
          jersey_number: number | null
          joined_on: string
          medical_notes: string | null
          player_code: string | null
          player_role: string | null
          skill_level: Database["public"]["Enums"]["skill_level"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          academy_id: string
          batting_style?: string | null
          bowling_style?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          emergency_contact?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          is_active?: boolean
          jersey_number?: number | null
          joined_on?: string
          medical_notes?: string | null
          player_code?: string | null
          player_role?: string | null
          skill_level?: Database["public"]["Enums"]["skill_level"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          academy_id?: string
          batting_style?: string | null
          bowling_style?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          emergency_contact?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          is_active?: boolean
          jersey_number?: number | null
          joined_on?: string
          medical_notes?: string | null
          player_code?: string | null
          player_role?: string | null
          skill_level?: Database["public"]["Enums"]["skill_level"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          full_name: string | null
          gender: string | null
          id: string
          is_super_admin: boolean
          locale: string
          phone: string | null
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          full_name?: string | null
          gender?: string | null
          id: string
          is_super_admin?: boolean
          locale?: string
          phone?: string | null
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string | null
          gender?: string | null
          id?: string
          is_super_admin?: boolean
          locale?: string
          phone?: string | null
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          academy_id: string
          address: string | null
          created_at: string
          id: string
          name: string
          nets_count: number | null
        }
        Insert: {
          academy_id: string
          address?: string | null
          created_at?: string
          id?: string
          name: string
          nets_count?: number | null
        }
        Update: {
          academy_id?: string
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          nets_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "venues_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      academy_active_join_code: {
        Args: {
          p_academy: string
          p_role?: Database["public"]["Enums"]["app_role"]
        }
        Returns: string
      }
      academy_join_requests: {
        Args: {
          p_academy: string
          p_status?: Database["public"]["Enums"]["join_status"]
        }
        Returns: {
          avatar_url: string
          created_at: string
          email: string
          full_name: string
          message: string
          request_id: string
          requested_role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["join_status"]
          user_id: string
        }[]
      }
      add_players_to_batch: {
        Args: { p_batch: string; p_players: string[] }
        Returns: number
      }
      approve_join_request: {
        Args: { p_request: string }
        Returns: {
          academy_id: string
          created_at: string
          id: string
          invited_by: string | null
          joined_at: string | null
          left_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "academy_members"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      assign_coach_to_batch: {
        Args: { p_batch: string; p_coach: string; p_is_primary?: boolean }
        Returns: undefined
      }
      assign_player_to_batches: {
        Args: { p_batches: string[]; p_player: string }
        Returns: number
      }
      coaches_batch: { Args: { p_batch: string }; Returns: boolean }
      create_academy: {
        Args: {
          p_city?: string
          p_fee_mode?: Database["public"]["Enums"]["fee_mode"]
          p_name: string
          p_timezone?: string
        }
        Returns: {
          address: string | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          currency: string
          default_monthly_fee_paise: number
          deleted_at: string | null
          fee_mode: Database["public"]["Enums"]["fee_mode"]
          grace_period_days: number
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          owner_user_id: string
          settings: Json
          slug: string
          state: string | null
          timezone: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "academies"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      delete_batch: { Args: { p_batch: string }; Returns: undefined }
      ensure_person_row: {
        Args: {
          p_academy: string
          p_role: Database["public"]["Enums"]["app_role"]
          p_user: string
        }
        Returns: undefined
      }
      generate_join_code: { Args: { p_length?: number }; Returns: string }
      has_role: {
        Args: {
          p_academy: string
          p_roles: Database["public"]["Enums"]["app_role"][]
        }
        Returns: boolean
      }
      is_member: { Args: { p_academy: string }; Returns: boolean }
      is_owner: { Args: { p_academy: string }; Returns: boolean }
      is_staff: { Args: { p_academy: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      my_join_requests: {
        Args: never
        Returns: {
          academy_id: string
          academy_name: string
          created_at: string
          request_id: string
          requested_role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["join_status"]
        }[]
      }
      my_memberships: {
        Args: never
        Returns: {
          academy_id: string
          academy_name: string
          academy_slug: string
          city: string
          logo_url: string
          membership_id: string
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["member_status"]
          timezone: string
        }[]
      }
      regenerate_join_code: {
        Args: {
          p_academy: string
          p_expires_at?: string
          p_max_uses?: number
          p_role?: Database["public"]["Enums"]["app_role"]
        }
        Returns: string
      }
      reject_join_request: {
        Args: { p_reason?: string; p_request: string }
        Returns: {
          academy_id: string
          created_at: string
          id: string
          join_code_id: string | null
          message: string | null
          rejection_reason: string | null
          requested_role: Database["public"]["Enums"]["app_role"]
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["join_status"]
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "join_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      remove_coach_from_batch: {
        Args: { p_batch: string; p_coach: string }
        Returns: undefined
      }
      remove_player_from_batch: {
        Args: { p_batch: string; p_player: string }
        Returns: undefined
      }
      request_join_by_code: {
        Args: { p_code: string; p_message?: string }
        Returns: {
          academy_id: string
          created_at: string
          id: string
          join_code_id: string | null
          message: string | null
          rejection_reason: string | null
          requested_role: Database["public"]["Enums"]["app_role"]
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["join_status"]
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "join_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_member_role: {
        Args: {
          p_member: string
          p_role: Database["public"]["Enums"]["app_role"]
        }
        Returns: {
          academy_id: string
          created_at: string
          id: string
          invited_by: string | null
          joined_at: string | null
          left_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "academy_members"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      shares_batch_with_player: { Args: { p_player: string }; Returns: boolean }
      slugify: { Args: { p_value: string }; Returns: string }
      update_my_player_profile: {
        Args: {
          p_academy: string
          p_batting_style?: string
          p_bowling_style?: string
          p_date_of_birth?: string
          p_emergency_contact?: string
          p_guardian_email?: string
          p_guardian_name?: string
          p_guardian_phone?: string
          p_jersey_number?: number
          p_player_role?: string
        }
        Returns: {
          academy_id: string
          batting_style: string | null
          bowling_style: string | null
          created_at: string
          date_of_birth: string | null
          deleted_at: string | null
          emergency_contact: string | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          is_active: boolean
          jersey_number: number | null
          joined_on: string
          medical_notes: string | null
          player_code: string | null
          player_role: string | null
          skill_level: Database["public"]["Enums"]["skill_level"]
          updated_at: string
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "players"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "super_admin" | "academy_owner" | "coach" | "player"
      fee_mode: "academy_pays" | "player_pays"
      join_status: "pending" | "approved" | "rejected" | "cancelled"
      member_status: "pending" | "active" | "suspended" | "rejected" | "left"
      skill_level: "beginner" | "intermediate" | "advanced" | "elite"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          deleted_at: string | null
          format: string
          id: string
          name: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          format?: string
          id?: string
          name?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      buckets_vectors: {
        Row: {
          created_at: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          metadata: Json | null
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          metadata?: Json | null
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_indexes: {
        Row: {
          bucket_id: string
          created_at: string
          data_type: string
          dimension: number
          distance_metric: string
          id: string
          metadata_configuration: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          data_type: string
          dimension: number
          distance_metric: string
          id?: string
          metadata_configuration?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          data_type?: string
          dimension?: number
          distance_metric?: string
          id?: string
          metadata_configuration?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_indexes_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets_vectors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allow_any_operation: {
        Args: { expected_operations: string[] }
        Returns: boolean
      }
      allow_only_operation: {
        Args: { expected_operation: string }
        Returns: boolean
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      extension: { Args: { name: string }; Returns: string }
      filename: { Args: { name: string }; Returns: string }
      foldername: { Args: { name: string }; Returns: string[] }
      get_common_prefix: {
        Args: { p_delimiter: string; p_key: string; p_prefix: string }
        Returns: string
      }
      get_size_by_bucket: {
        Args: never
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          _bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: { Args: never; Returns: string }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_by_timestamp: {
        Args: {
          p_bucket_id: string
          p_level: number
          p_limit: number
          p_prefix: string
          p_sort_column: string
          p_sort_column_after: string
          p_sort_order: string
          p_start_after: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          sort_column?: string
          sort_column_after?: string
          sort_order?: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS" | "VECTOR"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["super_admin", "academy_owner", "coach", "player"],
      fee_mode: ["academy_pays", "player_pays"],
      join_status: ["pending", "approved", "rejected", "cancelled"],
      member_status: ["pending", "active", "suspended", "rejected", "left"],
      skill_level: ["beginner", "intermediate", "advanced", "elite"],
    },
  },
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS", "VECTOR"],
    },
  },
} as const
