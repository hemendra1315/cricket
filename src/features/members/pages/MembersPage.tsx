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
import { Link } from 'react-router-dom';
import type { AcademyMember } from '@/types';
import { JOINABLE_ROLES, ROLE_LABELS, type JoinableRole, type MemberStatus } from '@/types/enums';

import { useAcademyMembers, usePendingJoinRequests, useUpdateMember } from '../hooks/useMembers';

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
  const canManage = useCan('members:manage');
  const canApproveRequests = useCan('players:approve');
  const requestsQuery = usePendingJoinRequests(academyId);

  const query = useAcademyMembers(academyId, {
    status: 'active',
    ...(roleFilter === 'all' ? {} : { role: roleFilter }),
  });

  const { approveRequest, rejectRequest } = useUpdateMember(academyId as string);

  const pushToast = useUiStore((state) => state.pushToast);

  const handleApprove = (requestId: string) => {
    approveRequest.mutate(
      { requestId },
      {
        onSuccess: () => pushToast({ title: 'Request approved', variant: 'success' }),
      },
    );
  };

  const handleReject = (requestId: string) => {
    rejectRequest.mutate(
      { requestId },
      {
        onSuccess: () => pushToast({ title: 'Request rejected', variant: 'success' }),
      },
    );
  };

  if (!academyId) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-fg text-xl font-semibold">Players</h1>

      {canManage && academyId ? <JoinCodeCard academyId={academyId} /> : null}

      {canApproveRequests ? (
        <Card>
          <CardHeader
            title="Pending join requests"
            description="Review every request before granting academy access."
          />
          <CardBody>
            {requestsQuery.isPending ? (
              <SkeletonText lines={4} />
            ) : requestsQuery.isError ? (
              <ErrorState
                error={requestsQuery.error}
                onRetry={() => void requestsQuery.refetch()}
              />
            ) : requestsQuery.data.length === 0 ? (
              <EmptyState
                title="No pending requests"
                description="Players have not requested to join yet."
              />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Player</TH>
                    <TH>Requested role</TH>
                    <TH>Message</TH>
                    <TH>Requested</TH>
                    <TH>Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {requestsQuery.data.map((request) => (
                    <TR key={request.id}>
                      <TD>
                        <div className="flex items-center gap-2">
                          <Avatar
                            name={request.fullName ?? request.email}
                            src={request.avatarUrl}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="text-fg truncate text-sm font-medium">
                              {request.fullName ?? 'Unknown player'}
                            </p>
                            <p className="text-fg-muted truncate text-xs">{request.email}</p>
                          </div>
                        </div>
                      </TD>
                      <TD>{ROLE_LABELS[request.requestedRole]}</TD>
                      <TD className="text-fg-muted max-w-xs truncate text-sm">
                        {request.message || '—'}
                      </TD>
                      <TD className="text-fg-muted text-sm">{formatDate(request.createdAt)}</TD>
                      <TD className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          isLoading={approveRequest.isPending}
                          onClick={() => handleApprove(request.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          isLoading={rejectRequest.isPending}
                          onClick={() => handleReject(request.id)}
                        >
                          Reject
                        </Button>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader
          title="Roster"
          description="Everyone who belongs to this academy."
          action={
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
          }
        />
        <CardBody>
          {query.isPending ? (
            <SkeletonText lines={4} />
          ) : query.isError ? (
            <ErrorState error={query.error} onRetry={() => void query.refetch()} />
          ) : query.data.length === 0 ? (
            <EmptyState
              title="No players yet"
              description="Share your join code so players can request access."
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
  const { changeRole, changeStatus, removeMember } = useUpdateMember(academyId);
  const { user } = useAuth();
  const pushToast = useUiStore((state) => state.pushToast);

  return (
    <Table>
      <THead>
        <TR>
          <TH>Player</TH>
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
                    <Link
                      to={`/members/${member.id}`}
                      className="text-fg truncate text-sm font-medium hover:underline"
                    >
                      {member.fullName ?? member.email}
                    </Link>
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
                  {member.role === 'academy_owner' || isSelf ? null : (
                    <div className="flex flex-wrap gap-2">
                      {member.status === 'suspended' ? (
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
                      <Button
                        variant="danger"
                        size="sm"
                        isLoading={removeMember.isPending}
                        onClick={() =>
                          removeMember.mutate(
                            { membershipId: member.id },
                            {
                              onSuccess: () =>
                                pushToast({ title: 'Player removed', variant: 'success' }),
                            },
                          )
                        }
                      >
                        Remove
                      </Button>
                    </div>
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
