import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query/keys';
import type { AcademyMember, UUID } from '@/types';
import type { AppRole, JoinableRole, MemberStatus } from '@/types/enums';

import { fetchAcademyMembers, updateMemberRole, updateMemberStatus } from '../api/membersApi';

type Filters = { role?: AppRole; status?: MemberStatus };

export function useAcademyMembers(academyId: UUID | null, filters: Filters = {}) {
  return useQuery<AcademyMember[]>({
    queryKey: queryKeys.academy.members(academyId ?? 'none', {
      role: filters.role,
      status: filters.status,
    }),
    enabled: Boolean(academyId),
    queryFn: () => fetchAcademyMembers(academyId as UUID, filters),
  });
}

/** Owner-only writes; RLS rejects the request for anyone else. */
export function useUpdateMember(academyId: UUID) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['academies', academyId, 'members'] });

  const changeRole = useMutation({
    mutationFn: ({ membershipId, role }: { membershipId: UUID; role: JoinableRole }) =>
      updateMemberRole(membershipId, role),
    onSuccess: invalidate,
  });

  const changeStatus = useMutation({
    mutationFn: ({
      membershipId,
      status,
    }: {
      membershipId: UUID;
      status: Extract<MemberStatus, 'active' | 'suspended' | 'left'>;
    }) => updateMemberStatus(membershipId, status),
    onSuccess: invalidate,
  });

  return { changeRole, changeStatus };
}
