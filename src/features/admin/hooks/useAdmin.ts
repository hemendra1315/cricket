import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UUID } from '@/types';
import {
  fetchPlatformAnalytics,
  fetchPlatformAcademies,
  fetchPlatformUsers,
  fetchPlatformAcademyDetails,
  createPlatformAcademy,
  deletePlatformAcademy,
  type CreatePlatformAcademyPayload,
} from '../api/adminApi';

export function usePlatformAnalytics() {
  return useQuery({
    queryKey: ['admin-platform-analytics'],
    queryFn: fetchPlatformAnalytics,
  });
}

export function usePlatformAcademies() {
  return useQuery({
    queryKey: ['admin-platform-academies'],
    queryFn: fetchPlatformAcademies,
  });
}

export function usePlatformUsers() {
  return useQuery({
    queryKey: ['admin-platform-users'],
    queryFn: fetchPlatformUsers,
  });
}

export function usePlatformAcademyDetails(academyId: UUID | null) {
  return useQuery({
    queryKey: ['admin-platform-academy-details', academyId],
    queryFn: () =>
      academyId
        ? fetchPlatformAcademyDetails(academyId)
        : Promise.reject(new Error('No academy ID')),
    enabled: Boolean(academyId),
  });
}

export function useCreatePlatformAcademy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePlatformAcademyPayload) => createPlatformAcademy(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-platform-academies'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-platform-analytics'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-platform-users'] });
      void queryClient.invalidateQueries({ queryKey: ['academies-mine'] });
    },
  });
}

export function useDeletePlatformAcademy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (academyId: UUID) => deletePlatformAcademy(academyId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-platform-academies'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-platform-analytics'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-platform-users'] });
      void queryClient.invalidateQueries({ queryKey: ['academies-mine'] });
    },
  });
}
