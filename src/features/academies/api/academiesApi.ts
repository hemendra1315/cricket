import { rpc, unwrap } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';
import type { Academy, JoinRequest, Membership, UUID } from '@/types';
import type { FeeMode, JoinableRole } from '@/types/enums';

type MembershipRow = {
  membership_id: string;
  academy_id: string;
  academy_name: string;
  academy_slug: string;
  logo_url: string | null;
  city: string | null;
  timezone: string;
  role: Membership['role'];
  status: Membership['status'];
};

type JoinRequestRow = {
  request_id: string;
  academy_id: string;
  academy_name: string;
  requested_role: JoinRequest['requestedRole'];
  status: JoinRequest['status'];
  created_at: string;
};

type AcademyRow = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  city: string | null;
  state: string | null;
  timezone: string;
  contact_email: string | null;
  contact_phone: string | null;
  fee_mode: FeeMode;
  default_monthly_fee_paise: number;
  grace_period_days: number;
  owner_user_id: string;
  is_active: boolean;
  created_at: string;
};

const ACADEMY_COLUMNS =
  'id, name, slug, logo_url, city, state, timezone, contact_email, contact_phone, fee_mode, default_monthly_fee_paise, grace_period_days, owner_user_id, is_active, created_at';

function toMembership(row: MembershipRow): Membership {
  return {
    id: row.membership_id,
    academyId: row.academy_id,
    academyName: row.academy_name,
    academySlug: row.academy_slug,
    logoUrl: row.logo_url,
    city: row.city,
    timezone: row.timezone,
    role: row.role,
    status: row.status,
  };
}

function toJoinRequest(row: JoinRequestRow): JoinRequest {
  return {
    id: row.request_id,
    academyId: row.academy_id,
    academyName: row.academy_name,
    requestedRole: row.requested_role,
    status: row.status,
    createdAt: row.created_at,
  };
}

function toAcademy(row: AcademyRow): Academy {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logo_url,
    city: row.city,
    state: row.state,
    timezone: row.timezone,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    feeMode: row.fee_mode,
    defaultMonthlyFeePaise: row.default_monthly_fee_paise,
    gracePeriodDays: row.grace_period_days,
    ownerUserId: row.owner_user_id,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

/** Every academy the user belongs to, active or awaiting approval. */
export async function fetchMyMemberships(): Promise<Membership[]> {
  const rows = await rpc<MembershipRow[]>('my_memberships');
  return rows.map(toMembership);
}

export async function fetchMyJoinRequests(): Promise<JoinRequest[]> {
  const rows = await rpc<JoinRequestRow[]>('my_join_requests');
  return rows.map(toJoinRequest);
}

export async function fetchAcademy(academyId: UUID): Promise<Academy> {
  const row = await unwrap<AcademyRow>(
    supabase.from('academies').select(ACADEMY_COLUMNS).eq('id', academyId).single(),
  );
  return toAcademy(row);
}

export type CreateAcademyInput = {
  name: string;
  city?: string;
  timezone?: string;
  feeMode?: FeeMode;
};

/**
 * Academy, owner membership and first join code are created by one RPC so a
 * failure can never leave an academy without an owner.
 */
export async function createAcademy(input: CreateAcademyInput): Promise<Academy> {
  const row = await rpc<AcademyRow>('create_academy', {
    p_name: input.name,
    p_city: input.city ?? null,
    p_timezone: input.timezone ?? 'Asia/Kolkata',
    p_fee_mode: input.feeMode ?? 'player_pays',
  });
  return toAcademy(row);
}

/** Redeems a join code, creating a pending request for the owner to approve. */
export async function requestJoinByCode(code: string, message?: string): Promise<JoinRequest> {
  const row = await rpc<{
    id: string;
    academy_id: string;
    requested_role: JoinRequest['requestedRole'];
    status: JoinRequest['status'];
    created_at: string;
  }>('request_join_by_code', { p_code: code, p_message: message ?? null });
  return {
    id: row.id,
    academyId: row.academy_id,
    // The RPC returns the request row; the academy name comes from the refetch.
    academyName: '',
    requestedRole: row.requested_role,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function fetchActiveJoinCode(
  academyId: UUID,
  role: JoinableRole = 'player',
): Promise<string | null> {
  return rpc<string | null>('academy_active_join_code', { p_academy: academyId, p_role: role });
}

export async function regenerateJoinCode(
  academyId: UUID,
  role: JoinableRole = 'player',
): Promise<string> {
  return rpc<string>('regenerate_join_code', { p_academy: academyId, p_role: role });
}

export type UpdateAcademyInput = Partial<{
  name: string;
  city: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  timezone: string;
  feeMode: FeeMode;
}>;

export async function updateAcademy(academyId: UUID, input: UpdateAcademyInput): Promise<Academy> {
  const row = await unwrap<AcademyRow>(
    supabase
      .from('academies')
      .update({
        ...(input.name === undefined ? null : { name: input.name }),
        ...(input.city === undefined ? null : { city: input.city }),
        ...(input.contactEmail === undefined ? null : { contact_email: input.contactEmail }),
        ...(input.contactPhone === undefined ? null : { contact_phone: input.contactPhone }),
        ...(input.timezone === undefined ? null : { timezone: input.timezone }),
        ...(input.feeMode === undefined ? null : { fee_mode: input.feeMode }),
      })
      .eq('id', academyId)
      .select(ACADEMY_COLUMNS)
      .single(),
  );
  return toAcademy(row);
}

export type OwnerInvitationDetails = {
  isValid: boolean;
  status: 'pending' | 'accepted' | 'revoked' | 'expired' | 'not_found' | 'invalid';
  academyId?: UUID;
  academyName?: string;
  expiresAt?: string;
  targetRole?: string;
};

export type AcceptOwnerInvitationResult = {
  academyId: UUID;
  academyName: string;
  role: 'academy_owner';
  alreadyAccepted: boolean;
};

export async function getOwnerInvitationDetails(token: string): Promise<OwnerInvitationDetails> {
  const result = await rpc<OwnerInvitationDetails>('get_owner_invitation_details', {
    p_token: token,
  });
  return {
    isValid: Boolean(result.isValid),
    status: result.status,
    academyId: result.academyId,
    academyName: result.academyName,
    expiresAt: result.expiresAt,
    targetRole: result.targetRole,
  };
}

export async function acceptOwnerInvitation(token: string): Promise<AcceptOwnerInvitationResult> {
  return rpc<AcceptOwnerInvitationResult>('accept_owner_invitation', {
    p_token: token,
  });
}
