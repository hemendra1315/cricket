import { useState } from 'react';

import { EmptyState, ErrorState } from '@/components/feedback';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Select,
  SkeletonText,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
} from '@/components/ui';
import { JoinCodeCard, useActiveAcademy } from '@/features/academies';
import { useAuth } from '@/features/auth';
import { useCan } from '@/lib/rbac';
import { formatDate } from '@/lib/utils/date';
import { useUiStore } from '@/stores';
import type { AcademyMember } from '@/types';
import {
  JOINABLE_ROLES,
  MEMBER_STATUSES,
  ROLE_LABELS,
  type JoinableRole,
  type MemberStatus,
} from '@/types/enums';

import { JoinRequestsCard } from '../components/JoinRequestsCard';
import { useAcademyMembers, useUpdateMember } from '../hooks/useMembers';

const STATUS_TONES: Record<MemberStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  active: 'success',
  pending: 'warning',
  suspended: 'danger',
  rejected: 'danger',
  left: 'neutral',
};

/** Academy roster: staff can read it, owners can change roles and access. */
export default function MembersPage() {
  const { academyId } = useActiveAcademy();
  const [roleFilter, setRoleFilter] = useState<'all' | JoinableRole | 'academy_owner'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | MemberStatus>('all');
  const canManage = useCan('members:manage');

  const query = useAcademyMembers(academyId, {
    ...(roleFilter === 'all' ? {} : { role: roleFilter }),
    ...(statusFilter === 'all' ? {} : { status: statusFilter }),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-fg text-xl font-semibold">Members</h1>

      {canManage && academyId ? (
        <>
          <JoinRequestsCard academyId={academyId} />
          <JoinCodeCard academyId={academyId} />
        </>
      ) : null}

      <Card>
        <CardHeader
          title="Roster"
          description="Everyone who belongs to this academy."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Select
                aria-label="Filter by role"
                value={roleFilter}
                className="h-8 w-40"
                onChange={(event) =>
                  setRoleFilter(event.target.value as 'all' | JoinableRole | 'academy_owner')
                }
              >
                <option value="all">All roles</option>
                <option value="academy_owner">{ROLE_LABELS.academy_owner}</option>
                {JOINABLE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </Select>
              <Select
                aria-label="Filter by status"
                value={statusFilter}
                className="h-8 w-36"
                onChange={(event) => setStatusFilter(event.target.value as 'all' | MemberStatus)}
              >
                <option value="all">All statuses</option>
                {MEMBER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>
          }
        />
        <CardBody>
          {query.isPending ? (
            <SkeletonText lines={4} />
          ) : query.isError ? (
            <ErrorState error={query.error} onRetry={() => void query.refetch()} />
          ) : query.data.length === 0 ? (
            <EmptyState
              title="No members yet"
              description="Share your join code so coaches and players can request access."
            />
          ) : (
            <MemberTable members={query.data} academyId={academyId ?? ''} canManage={canManage} />
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function MemberTable({
  members,
  academyId,
  canManage,
}: {
  members: AcademyMember[];
  academyId: string;
  canManage: boolean;
}) {
  const { changeRole, changeStatus } = useUpdateMember(academyId);
  const { user } = useAuth();
  const pushToast = useUiStore((state) => state.pushToast);

  return (
    <Table>
      <THead>
        <TR>
          <TH>Member</TH>
          <TH>Role</TH>
          <TH>Status</TH>
          <TH>Joined</TH>
          {canManage ? <TH>Actions</TH> : null}
        </TR>
      </THead>
      <TBody>
        {members.map((member) => {
          const isSelf = member.userId === user?.id;
          return (
            <TR key={member.id}>
              <TD>
                <div className="flex items-center gap-2">
                  <Avatar name={member.fullName ?? member.email} src={member.avatarUrl} size="sm" />
                  <div className="min-w-0">
                    <p className="text-fg truncate text-sm font-medium">
                      {member.fullName ?? '—'}
                      {isSelf ? ' (you)' : ''}
                    </p>
                    <p className="text-fg-muted truncate text-xs">{member.email}</p>
                  </div>
                </div>
              </TD>
              <TD>
                {canManage && member.role !== 'academy_owner' ? (
                  <Select
                    aria-label={`Role for ${member.email}`}
                    className="h-8 w-32"
                    value={member.role}
                    disabled={changeRole.isPending}
                    onChange={(event) =>
                      changeRole.mutate(
                        {
                          membershipId: member.id,
                          role: event.target.value as JoinableRole,
                        },
                        {
                          onSuccess: () => pushToast({ title: 'Role updated', variant: 'success' }),
                        },
                      )
                    }
                  >
                    {JOINABLE_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </Select>
                ) : (
                  ROLE_LABELS[member.role]
                )}
              </TD>
              <TD>
                <Badge tone={STATUS_TONES[member.status]}>{member.status}</Badge>
              </TD>
              <TD className="text-fg-muted text-sm">
                {member.joinedAt ? formatDate(member.joinedAt) : '—'}
              </TD>
              {canManage ? (
                <TD>
                  {member.role === 'academy_owner' || isSelf ? null : member.status ===
                    'suspended' ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      isLoading={changeStatus.isPending}
                      onClick={() =>
                        changeStatus.mutate({ membershipId: member.id, status: 'active' })
                      }
                    >
                      Reactivate
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      isLoading={changeStatus.isPending}
                      onClick={() =>
                        changeStatus.mutate({ membershipId: member.id, status: 'suspended' })
                      }
                    >
                      Suspend
                    </Button>
                  )}
                </TD>
              ) : null}
            </TR>
          );
        })}
      </TBody>
    </Table>
  );
}
