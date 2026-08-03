import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { queryKeys } from '@/lib/query/keys';
import type { PendingJoinRequest, UUID } from '@/types';
import type { JoinStatus } from '@/types/enums';

import { approveJoinRequest, fetchJoinRequests, rejectJoinRequest } from '../api/joinRequestsApi';

export function useJoinRequests(academyId: UUID | null, status: JoinStatus = 'pending') {
  return useQuery<PendingJoinRequest[]>({
    queryKey: queryKeys.academy.joinRequests(academyId ?? 'none', status),
    enabled: Boolean(academyId),
    queryFn: () => fetchJoinRequests(academyId as UUID, status),
  });
}

/**
 * Approving changes the roster, the approval queue and the player/coach lists at
 * once, so all three academy-scoped caches are dropped.
 */
export function useReviewJoinRequest(academyId: UUID | null) {
  const queryClient = useQueryClient();
  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['academies', academyId ?? 'none'] }),
    [queryClient, academyId],
  );

  const approve = useMutation({
    mutationFn: (requestId: UUID) => approveJoinRequest(requestId),
    onSuccess: invalidate,
  });

  const reject = useMutation({
    mutationFn: ({ requestId, reason }: { requestId: UUID; reason?: string }) =>
      rejectJoinRequest(requestId, reason),
    onSuccess: invalidate,
  });

  return { approve, reject };
}
