import { rpc } from '@/lib/api';
import type { PendingJoinRequest, UUID } from '@/types';
import type { AppRole, JoinStatus } from '@/types/enums';

type JoinRequestQueueRow = {
  request_id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  requested_role: AppRole;
  status: JoinStatus;
  message: string | null;
  created_at: string;
};

function toRequest(row: JoinRequestQueueRow): PendingJoinRequest {
  return {
    id: row.request_id,
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    avatarUrl: row.avatar_url,
    requestedRole: row.requested_role,
    status: row.status,
    message: row.message,
    createdAt: row.created_at,
  };
}

/** Owner's approval queue for one academy. */
export async function fetchJoinRequests(
  academyId: UUID,
  status: JoinStatus = 'pending',
): Promise<PendingJoinRequest[]> {
  const rows = await rpc<JoinRequestQueueRow[]>('academy_join_requests', {
    p_academy: academyId,
    p_status: status,
  });
  return (rows ?? []).map(toRequest);
}

/**
 * Approving creates the membership and the matching player/coach row in one
 * transaction, so an approved player is immediately on the roster.
 */
export async function approveJoinRequest(requestId: UUID): Promise<void> {
  await rpc<unknown>('approve_join_request', { p_request: requestId });
}

export async function rejectJoinRequest(requestId: UUID, reason?: string): Promise<void> {
  await rpc<unknown>('reject_join_request', {
    p_request: requestId,
    p_reason: reason ?? null,
  });
}
