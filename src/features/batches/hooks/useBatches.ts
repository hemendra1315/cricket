import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { queryKeys } from '@/lib/query/keys';
import type { Batch, BatchCoach, BatchPlayer, UUID, Venue } from '@/types';

import {
  addPlayersToBatch,
  assignCoachToBatch,
  createBatch,
  deleteBatch,
  fetchBatch,
  fetchBatchCoaches,
  fetchBatchPlayers,
  fetchBatches,
  fetchVenues,
  removeCoachFromBatch,
  removePlayerFromBatch,
  updateBatch,
  type BatchInput,
} from '../api/batchesApi';

/**
 * Every batch mutation can change roster counts on the list as well as the
 * detail page, so all of them drop the academy's batch subtree.
 */
function useInvalidateBatches(academyId: UUID | null) {
  const queryClient = useQueryClient();
  return useCallback(
    () =>
      queryClient.invalidateQueries({ queryKey: ['academies', academyId ?? 'none', 'batches'] }),
    [queryClient, academyId],
  );
}

export function useBatches(academyId: UUID | null, activeOnly = true) {
  return useQuery<Batch[]>({
    queryKey: queryKeys.batches.list(academyId ?? 'none', activeOnly),
    enabled: Boolean(academyId),
    queryFn: () => fetchBatches(academyId as UUID, activeOnly),
  });
}

export function useBatch(academyId: UUID | null, batchId: UUID | undefined) {
  return useQuery<Batch>({
    queryKey: queryKeys.batches.detail(academyId ?? 'none', batchId ?? 'none'),
    enabled: Boolean(academyId && batchId),
    queryFn: () => fetchBatch(academyId as UUID, batchId as UUID),
  });
}

export function useBatchCoaches(academyId: UUID | null, batchId: UUID | undefined) {
  return useQuery<BatchCoach[]>({
    queryKey: queryKeys.batches.coaches(academyId ?? 'none', batchId ?? 'none'),
    enabled: Boolean(batchId),
    queryFn: () => fetchBatchCoaches(batchId as UUID),
  });
}

export function useBatchPlayers(academyId: UUID | null, batchId: UUID | undefined) {
  return useQuery<BatchPlayer[]>({
    queryKey: queryKeys.batches.players(academyId ?? 'none', batchId ?? 'none'),
    enabled: Boolean(batchId),
    queryFn: () => fetchBatchPlayers(batchId as UUID),
  });
}

export function useVenues(academyId: UUID | null) {
  return useQuery<Venue[]>({
    queryKey: queryKeys.venues(academyId ?? 'none'),
    enabled: Boolean(academyId),
    queryFn: () => fetchVenues(academyId as UUID),
  });
}

export function useCreateBatch(academyId: UUID) {
  const invalidate = useInvalidateBatches(academyId);

  return useMutation({
    mutationFn: (input: BatchInput) => createBatch(academyId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateBatch(academyId: UUID | null) {
  const invalidate = useInvalidateBatches(academyId);

  return useMutation({
    mutationFn: ({
      batchId,
      input,
    }: {
      batchId: UUID;
      input: Partial<BatchInput> & { isActive?: boolean };
    }) => updateBatch(batchId, input),
    onSuccess: invalidate,
  });
}

export function useDeleteBatch(academyId: UUID | null) {
  const invalidate = useInvalidateBatches(academyId);

  return useMutation({
    mutationFn: (batchId: UUID) => deleteBatch(batchId),
    onSuccess: invalidate,
  });
}

export function useBatchRosterMutations(academyId: UUID | null) {
  const queryClient = useQueryClient();
  const invalidate = useCallback(async () => {
    // Batch membership decides which players a coach may read, so the players
    // subtree is dropped alongside the batches one.
    await queryClient.invalidateQueries({
      queryKey: ['academies', academyId ?? 'none', 'batches'],
    });
    await queryClient.invalidateQueries({
      queryKey: ['academies', academyId ?? 'none', 'players'],
    });
  }, [queryClient, academyId]);

  const addPlayers = useMutation({
    mutationFn: ({ batchId, playerIds }: { batchId: UUID; playerIds: UUID[] }) =>
      addPlayersToBatch(batchId, playerIds),
    onSuccess: invalidate,
  });

  const removePlayer = useMutation({
    mutationFn: ({ batchId, playerId }: { batchId: UUID; playerId: UUID }) =>
      removePlayerFromBatch(batchId, playerId),
    onSuccess: invalidate,
  });

  const assignCoach = useMutation({
    mutationFn: ({
      batchId,
      coachId,
      isPrimary,
    }: {
      batchId: UUID;
      coachId: UUID;
      isPrimary?: boolean;
    }) => assignCoachToBatch(batchId, coachId, isPrimary ?? false),
    onSuccess: invalidate,
  });

  const removeCoach = useMutation({
    mutationFn: ({ batchId, coachId }: { batchId: UUID; coachId: UUID }) =>
      removeCoachFromBatch(batchId, coachId),
    onSuccess: invalidate,
  });

  return { addPlayers, removePlayer, assignCoach, removeCoach };
}
