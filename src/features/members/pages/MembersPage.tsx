import { useMemo, useState } from 'react';

import { ErrorState } from '@/components/feedback';
import {
  MobilePageHeader,
  MobileSearch,
  MobileFilterChips,
  MobileEmptyState,
} from '@/components/mobile';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'left'>('all');
  const canManage = useCan('members:manage');
  const canApproveRequests = useCan('players:approve');
  const requestsQuery = usePendingJoinRequests(academyId);

  const query = useAcademyMembers(academyId, {
    status: 'active',
    ...(roleFilter === 'all' ? {} : { role: roleFilter }),
  });

  const filteredMembers = useMemo(() => {
    if (!query.data) return [];
    return query.data.filter((member) => {
      const name = (member.fullName || '').toLowerCase();
      const email = (member.email || '').toLowerCase();
      const matchesSearch =
        !searchQuery ||
        name.includes(searchQuery.toLowerCase()) ||
        email.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [query.data, searchQuery, statusFilter]);

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
    <div className="space-y-4 pb-24 md:pb-6">
      {/* Mobile Page Header */}
      <div className="md:hidden">
        <MobilePageHeader
          title="Players & Members"
          count={query.data?.length}
          subtitle="Academy roster & staff"
        />
        <div className="mb-3 space-y-3 px-4">
          <MobileSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search players by name or email…"
          />
          <MobileFilterChips
            options={[
              { id: 'all', label: 'All', count: query.data?.length },
              { id: 'active', label: 'Active' },
              { id: 'left', label: 'Inactive' },
            ]}
            activeId={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
      </div>

      <h1 className="text-fg hidden text-xl font-semibold md:block">Players</h1>

      {academyId ? <JoinCodeCard academyId={academyId} /> : null}

      {canApproveRequests && requestsQuery.data && requestsQuery.data.length > 0 ? (
        <Card>
          <CardHeader
            title="Pending Join Requests"
            description="Players requesting to join your academy."
          />
          <CardBody>
            <div className="space-y-3">
              {requestsQuery.data.map((request) => (
                <div
                  key={request.id}
                  className="bg-surface-muted/50 border-border-subtle flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5"
                >
                  <div>
                    <p className="text-fg text-sm font-semibold">
                      {request.fullName ?? request.email}
                    </p>
                    <p className="text-fg-muted text-xs">
                      {request.email} • {ROLE_LABELS[request.requestedRole]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
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
                      variant="secondary"
                      className="text-danger hover:bg-danger/10"
                      isLoading={rejectRequest.isPending}
                      onClick={() => handleReject(request.id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader
          title="Roster"
          description="Everyone who belongs to this academy."
          className="hidden md:block"
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
        <CardBody className="p-4">
          {query.isPending ? (
            <SkeletonText lines={4} />
          ) : query.isError ? (
            <ErrorState error={query.error} onRetry={() => void query.refetch()} />
          ) : filteredMembers.length === 0 ? (
            <MobileEmptyState
              title="No players found"
              description={
                searchQuery
                  ? 'No members match your search query.'
                  : 'Share your join code so players can request access.'
              }
            />
          ) : (
            <MemberTable
              members={filteredMembers}
              academyId={academyId ?? ''}
              canManage={canManage}
            />
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
    <>
      {/* MOBILE CARD LIST (< md) */}
      <div className="space-y-3 md:hidden">
        {members.map((member) => {
          const isSelf = member.userId === user?.id;
          return (
            <div
              key={member.id}
              className="border-border-subtle bg-surface space-y-3 rounded-xl border p-4 shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <Avatar name={member.fullName ?? member.email} src={member.avatarUrl} size="md" />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/members/${member.id}`}
                    className="text-fg block truncate text-sm font-semibold hover:underline"
                  >
                    {member.fullName ?? member.email}
                  </Link>
                  <p className="text-fg-muted truncate text-xs">{member.email}</p>
                </div>
                <Badge tone={STATUS_TONES[member.status]}>{member.status}</Badge>
              </div>

              <div className="border-border-subtle text-fg-muted flex items-center justify-between border-t pt-2 text-xs">
                <span>
                  Role: <strong className="text-fg font-medium">{ROLE_LABELS[member.role]}</strong>
                </span>
                <span>Joined: {member.joinedAt ? formatDate(member.joinedAt) : '—'}</span>
              </div>

              {canManage && member.role !== 'academy_owner' && !isSelf ? (
                <div className="border-border-subtle flex flex-col gap-2.5 border-t pt-3">
                  <div className="w-full">
                    <Select
                      aria-label={`Role for ${member.email}`}
                      className="h-11 min-h-[44px] w-full text-sm"
                      value={member.role}
                      disabled={changeRole.isPending}
                      onChange={(event) =>
                        changeRole.mutate(
                          {
                            membershipId: member.id,
                            role: event.target.value as JoinableRole,
                          },
                          {
                            onSuccess: () =>
                              pushToast({ title: 'Role updated', variant: 'success' }),
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
                  </div>

                  <div className="flex w-full items-center gap-2">
                    {member.status === 'suspended' ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        isLoading={changeStatus.isPending}
                        onClick={() =>
                          changeStatus.mutate({ membershipId: member.id, status: 'active' })
                        }
                        className="h-11 min-h-[44px] flex-1 text-sm font-semibold"
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
                        className="h-11 min-h-[44px] flex-1 text-sm font-semibold"
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
                      className="h-11 min-h-[44px] flex-1 text-sm font-semibold"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* DESKTOP TABLE (>= md) */}
      <div className="hidden md:block">
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
                      <Avatar
                        name={member.fullName ?? member.email}
                        src={member.avatarUrl}
                        size="sm"
                      />
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
                              onSuccess: () =>
                                pushToast({ title: 'Role updated', variant: 'success' }),
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
                                changeStatus.mutate({
                                  membershipId: member.id,
                                  status: 'suspended',
                                })
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
      </div>
    </>
  );
}
