import { unwrap } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';
import type { Profile, UUID } from '@/types';

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  locale: string;
  timezone: string;
  is_super_admin: boolean;
};

const PROFILE_COLUMNS =
  'id, full_name, email, phone, avatar_url, date_of_birth, locale, timezone, is_super_admin';

export function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    dateOfBirth: row.date_of_birth,
    locale: row.locale,
    timezone: row.timezone,
    isSuperAdmin: row.is_super_admin,
  };
}

/**
 * Reads the signed-in user's profile. The row is created by the
 * `handle_new_user` trigger on sign-up, but a first-load race (or a user created
 * before the trigger existed) is repaired here rather than failing the app.
 */
export async function fetchMyProfile(userId: UUID): Promise<Profile | null> {
  const row = await unwrap<ProfileRow | null>(
    supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', userId).maybeSingle(),
  );
  return row ? toProfile(row) : null;
}

export async function ensureMyProfile(
  userId: UUID,
  fallback: { email: string; fullName?: string | null; avatarUrl?: string | null },
): Promise<Profile> {
  const existing = await fetchMyProfile(userId);
  if (existing) return existing;

  const row = await unwrap<ProfileRow>(
    supabase
      .from('profiles')
      .insert({
        id: userId,
        email: fallback.email,
        full_name: fallback.fullName ?? null,
        avatar_url: fallback.avatarUrl ?? null,
      })
      .select(PROFILE_COLUMNS)
      .single(),
  );
  return toProfile(row);
}

export type UpdateProfileInput = {
  fullName?: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  timezone?: string;
  locale?: string;
};

export async function updateMyProfile(userId: UUID, input: UpdateProfileInput): Promise<Profile> {
  const row = await unwrap<ProfileRow>(
    supabase
      .from('profiles')
      .update({
        ...(input.fullName === undefined ? null : { full_name: input.fullName }),
        ...(input.phone === undefined ? null : { phone: input.phone || null }),
        ...(input.dateOfBirth === undefined ? null : { date_of_birth: input.dateOfBirth || null }),
        ...(input.timezone === undefined ? null : { timezone: input.timezone }),
        ...(input.locale === undefined ? null : { locale: input.locale }),
      })
      .eq('id', userId)
      .select(PROFILE_COLUMNS)
      .single(),
  );
  return toProfile(row);
}
