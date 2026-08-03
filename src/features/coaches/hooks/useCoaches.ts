import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { queryKeys } from '@/lib/query/keys';
import { useAuthStore } from '@/stores';
import type { Coach, UUID } from '@/types';

import { fetchCoach, fetchCoaches, updateCoach, type UpdateCoachInput } from '../api/coachesApi';

export function useCoaches(academyId: UUID | null) {
  return useQuery<Coach[]>({
    queryKey: queryKeys.coaches.list(academyId ?? 'none'),
    enabled: Boolean(academyId),
    queryFn: () => fetchCoaches(academyId as UUID),
  });
}

export function useCoach(academyId: UUID | null, coachId: UUID | undefined) {
  return useQuery<Coach>({
    queryKey: queryKeys.coaches.detail(academyId ?? 'none', coachId ?? 'none'),
    enabled: Boolean(academyId && coachId),
    queryFn: () => fetchCoach(academyId as UUID, coachId as UUID),
  });
}

/** Derived from the list so a coach's own profile costs no extra request. */
export function useMyCoach(academyId: UUID | null) {
  const userId = useAuthStore((state) => state.user?.id);
  const query = useCoaches(academyId);

  const coach = useMemo(
    () => query.data?.find((row) => row.userId === userId) ?? null,
    [query.data, userId],
  );

  return { ...query, coach };
}

export function useUpdateCoach(academyId: UUID | null) {
  const queryClient = useQueryClient();
  const invalidate = useCallback(
    () =>
      queryClient.invalidateQueries({ queryKey: ['academies', academyId ?? 'none', 'coaches'] }),
    [queryClient, academyId],
  );

  return useMutation({
    mutationFn: ({ coachId, input }: { coachId: UUID; input: UpdateCoachInput }) =>
      updateCoach(coachId, input),
    onSuccess: invalidate,
  });
}
