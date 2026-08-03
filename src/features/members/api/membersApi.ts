import { unwrap } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';
import type { AcademyMember, UUID } from '@/types';
import type { AppRole, JoinableRole, MemberStatus } from '@/types/enums';

type MemberRow = {
  id: string;
  academy_id: string;
  user_id: string;
  role: AppRole;
  status: MemberStatus;
  joined_at: string | null;
  profiles: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    phone: string | null;
  } | null;
};

const MEMBER_COLUMNS =
  'id, academy_id, user_id, role, status, joined_at, profiles!inner(full_name, email, avatar_url, phone)';

function toMember(row: MemberRow): AcademyMember {
  return {
    id: row.id,
    academyId: row.academy_id,
    userId: row.user_id,
    role: row.role,
    status: row.status,
    joinedAt: row.joined_at,
    fullName: row.profiles?.full_name ?? null,
    email: row.profiles?.email ?? '',
    avatarUrl: row.profiles?.avatar_url ?? null,
    phone: row.profiles?.phone ?? null,
  };
}

/**
 * Academy roster. RLS restricts this to staff of `academyId`, so a filter on
 * academy_id is a query optimisation, not the isolation boundary.
 */
export async function fetchAcademyMembers(
  academyId: UUID,
  filters: { role?: AppRole; status?: MemberStatus } = {},
): Promise<AcademyMember[]> {
  let query = supabase.from('academy_members').select(MEMBER_COLUMNS).eq('academy_id', academyId);
  if (filters.role) query = query.eq('role', filters.role);
  if (filters.status) query = query.eq('status', filters.status);

  const rows = await unwrap<MemberRow[]>(query.order('created_at', { ascending: true }));
  return rows.map(toMember);
}

export async function updateMemberRole(membershipId: UUID, role: JoinableRole): Promise<void> {
  await unwrap(
    supabase.from('academy_members').update({ role }).eq('id', membershipId).select('id').single(),
  );
}

export async function updateMemberStatus(
  membershipId: UUID,
  status: Extract<MemberStatus, 'active' | 'suspended' | 'left'>,
): Promise<void> {
  await unwrap(
    supabase
      .from('academy_members')
      .update({
        status,
        ...(status === 'left' ? { left_at: new Date().toISOString() } : { left_at: null }),
      })
      .eq('id', membershipId)
      .select('id')
      .single(),
  );
}
