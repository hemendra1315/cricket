import { useQuery } from '@tanstack/react-query';
import type { UUID } from '@/types';
import {
  fetchPlatformAnalytics,
  fetchPlatformAcademies,
  fetchPlatformUsers,
  fetchPlatformAcademyDetails,
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
