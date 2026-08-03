import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { queryKeys } from '@/lib/query/keys';
import { useAuthStore } from '@/stores';
import type { Player, UUID } from '@/types';

import {
  fetchMyPlayer,
  fetchPlayer,
  fetchPlayers,
  updateMyPlayerProfile,
  updatePlayer,
  type PlayerFilters,
  type UpdatePlayerInput,
} from '../api/playersApi';

export function usePlayers(academyId: UUID | null, filters: PlayerFilters = {}) {
  return useQuery<Player[]>({
    queryKey: queryKeys.players.list(academyId ?? 'none', {
      skillLevel: filters.skillLevel,
      activeOnly: filters.activeOnly ? 'true' : undefined,
      search: filters.search || undefined,
    }),
    enabled: Boolean(academyId),
    queryFn: () => fetchPlayers(academyId as UUID, filters),
  });
}

export function usePlayer(academyId: UUID | null, playerId: UUID | undefined) {
  return useQuery<Player>({
    queryKey: queryKeys.players.detail(academyId ?? 'none', playerId ?? 'none'),
    enabled: Boolean(academyId && playerId),
    queryFn: () => fetchPlayer(academyId as UUID, playerId as UUID),
  });
}

/** The signed-in user's own player row in the active academy. */
export function useMyPlayer(academyId: UUID | null) {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery<Player | null>({
    queryKey: queryKeys.players.me(academyId ?? 'none'),
    enabled: Boolean(academyId && userId),
    queryFn: () => fetchMyPlayer(academyId as UUID, userId as UUID),
  });
}

function useInvalidatePlayers(academyId: UUID | null) {
  const queryClient = useQueryClient();
  return useCallback(
    () =>
      queryClient.invalidateQueries({ queryKey: ['academies', academyId ?? 'none', 'players'] }),
    [queryClient, academyId],
  );
}

/** Staff edit of any player in the academy. */
export function useUpdatePlayer(academyId: UUID | null) {
  const invalidate = useInvalidatePlayers(academyId);

  return useMutation({
    mutationFn: ({ playerId, input }: { playerId: UUID; input: UpdatePlayerInput }) =>
      updatePlayer(playerId, input),
    onSuccess: invalidate,
  });
}

/** A player editing their own row; the database restricts the writable fields. */
export function useUpdateMyPlayerProfile(academyId: UUID) {
  const invalidate = useInvalidatePlayers(academyId);

  return useMutation({
    mutationFn: (input: Parameters<typeof updateMyPlayerProfile>[1]) =>
      updateMyPlayerProfile(academyId, input),
    onSuccess: invalidate,
  });
}
