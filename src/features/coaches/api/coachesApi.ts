import { unwrap } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';
import type { Coach, UUID } from '@/types';

type CoachRow = {
  id: string;
  academy_id: string;
  user_id: string;
  specialization: string[] | null;
  bio: string | null;
  experience_years: number | null;
  is_active: boolean;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    phone: string | null;
  } | null;
};

const COACH_COLUMNS = `id, academy_id, user_id, specialization, bio, experience_years,
  is_active, created_at, profiles!inner(full_name, email, avatar_url, phone)`;

function toCoach(row: CoachRow): Coach {
  return {
    id: row.id,
    academyId: row.academy_id,
    userId: row.user_id,
    specialization: row.specialization ?? [],
    bio: row.bio,
    experienceYears: row.experience_years,
    isActive: row.is_active,
    createdAt: row.created_at,
    fullName: row.profiles?.full_name ?? null,
    email: row.profiles?.email ?? null,
    avatarUrl: row.profiles?.avatar_url ?? null,
    phone: row.profiles?.phone ?? null,
  };
}

/** Every member of the academy may read the coaching staff (RLS: `is_member`). */
export async function fetchCoaches(academyId: UUID): Promise<Coach[]> {
  const rows = await unwrap<CoachRow[]>(
    supabase
      .from('coaches')
      .select(COACH_COLUMNS)
      .eq('academy_id', academyId)
      .order('created_at', { ascending: true }),
  );
  return rows.map(toCoach);
}

export async function fetchCoach(academyId: UUID, coachId: UUID): Promise<Coach> {
  const row = await unwrap<CoachRow>(
    supabase
      .from('coaches')
      .select(COACH_COLUMNS)
      .eq('academy_id', academyId)
      .eq('id', coachId)
      .single(),
  );
  return toCoach(row);
}

export type UpdateCoachInput = {
  bio?: string | null;
  experienceYears?: number | null;
  specialization?: string[];
  isActive?: boolean;
};

/**
 * Owners edit any coach; a coach edits their own row. Both paths are the same
 * statement — the `coaches_update` policy decides which rows are visible.
 */
export async function updateCoach(coachId: UUID, input: UpdateCoachInput): Promise<Coach> {
  const row = await unwrap<CoachRow>(
    supabase
      .from('coaches')
      .update({
        bio: input.bio,
        experience_years: input.experienceYears,
        ...(input.specialization === undefined ? {} : { specialization: input.specialization }),
        ...(input.isActive === undefined ? {} : { is_active: input.isActive }),
      })
      .eq('id', coachId)
      .select(COACH_COLUMNS)
      .single(),
  );
  return toCoach(row);
}
