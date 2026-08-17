import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus, Search, UserCheck, X } from 'lucide-react';

import { ErrorState } from '@/components/feedback';
import { MobileEmptyState, MobileFilterChips, MobilePageHeader } from '@/components/mobile';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Modal,
  Select,
  SkeletonText,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '@/components/ui';
import { JoinCodeCard, useActiveAcademy } from '@/features/academies';
import { useAuth } from '@/features/auth';
import { useBatches } from '@/features/batches';
import { useCan } from '@/lib/rbac';
import { formatDate } from '@/lib/utils/date';
import { useUiStore } from '@/stores';
import type { AcademyMember, PendingJoinRequest, UUID } from '@/types';
import { JOINABLE_ROLES, ROLE_LABELS, type JoinableRole, type MemberStatus } from '@/types/enums';

import { useAcademyMembers, usePendingJoinRequests, useUpdateMember } from '../hooks/useMembers';

const STATUS_TONES: Record<MemberStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  active: 'success',
  pending: 'warning',
  suspended: 'danger',
  rejected: 'danger',
  left: 'neutral',
};

/**
 * Phase 50 — Academy Roster / Players Management Page.
 * Polished, high-density, mobile-first design system with 1-tap Add Player Modal & search filtering.
 */
export default function MembersPage() {
  const { academyId } = useActiveAcademy();
  const [roleFilter, setRoleFilter] = useState<'all' | JoinableRole | 'academy_owner'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'left'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const canManage = useCan('members:manage');
  const canApproveRequests = useCan('players:approve');

  const requestsQuery = usePendingJoinRequests(academyId);
  const batchesQuery = useBatches(academyId);

  const query = useAcademyMembers(academyId, {
    status: 'active',
    ...(roleFilter === 'all' ? {} : { role: roleFilter }),
  });

  const members = useMemo(() => query.data ?? [], [query.data]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const name = (member.fullName || '').toLowerCase();
      const email = (member.email || '').toLowerCase();
      const idStr = (member.id || '').toLowerCase();
      const matchesSearch =
        !searchQuery ||
        name.includes(searchQuery.toLowerCase()) ||
        email.includes(searchQuery.toLowerCase()) ||
        idStr.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [members, searchQuery, statusFilter]);

  const activePlayerCount = useMemo(
    () => members.filter((m) => m.role === 'player' && m.status === 'active').length,
    [members],
  );

  const coachStaffCount = useMemo(
    () => members.filter((m) => m.role === 'coach').length,
    [members],
  );

  const [approvingRequest, setApprovingRequest] = useState<PendingJoinRequest | null>(null);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);

  const { approveRequest, rejectRequest } = useUpdateMember(academyId as string);
  const pushToast = useUiStore((state) => state.pushToast);

  const handleApproveClick = (request: PendingJoinRequest) => {
    const batches = batchesQuery.data ?? [];
    if (batches.length > 0) {
      setApprovingRequest(request);
      setSelectedBatchIds([]);
    } else {
      approveRequest.mutate(
        { requestId: request.id, batchIds: null },
        {
          onSuccess: () => pushToast({ title: 'Request approved', variant: 'success' }),
        },
      );
    }
  };

  const handleConfirmApprovalWithBatches = () => {
    if (!approvingRequest) return;
    approveRequest.mutate(
      {
        requestId: approvingRequest.id,
        batchIds: selectedBatchIds.length > 0 ? (selectedBatchIds as UUID[]) : null,
      },
      {
        onSuccess: () => {
          pushToast({ title: 'Request approved & batches assigned', variant: 'success' });
          setApprovingRequest(null);
          setSelectedBatchIds([]);
        },
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
    <div className="space-y-5 pb-24 md:pb-8">
      {/* MOBILE PAGE HEADER (< md) */}
      <div className="md:hidden">
        <MobilePageHeader
          title="Players"
          count={`${members.length} Players`}
          subtitle="Manage and view academy players"
          primaryAction={
            canManage
              ? {
                  label: 'Add Player',
                  icon: <Plus className="h-4 w-4" />,
                  onClick: () => setIsAddModalOpen(true),
                }
              : undefined
          }
        />
      </div>

      {/* DESKTOP PAGE HEADER (>= md) */}
      <div className="hidden items-center justify-between gap-4 md:flex">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-fg text-2xl font-bold tracking-tight">Players</h1>
            <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
              {members.length} Players
            </span>
          </div>
          <p className="text-fg-muted mt-1 text-sm font-medium">
            Manage and view academy players, coaches & staff
          </p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="min-h-[44px] px-4 font-semibold shadow-2xs"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Player
          </Button>
        )}
      </div>

      {/* COMPACT ACADEMY SUMMARY STATS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="bg-surface border-border-subtle rounded-2xl border p-4 shadow-2xs">
          <p className="text-fg-muted text-[11px] font-bold tracking-wider uppercase">
            Total Members
          </p>
          <p className="text-fg mt-1 text-2xl font-extrabold">{members.length}</p>
        </div>
        <div className="bg-surface border-border-subtle rounded-2xl border p-4 shadow-2xs">
          <p className="text-fg-muted text-[11px] font-bold tracking-wider uppercase">
            Active Players
          </p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {activePlayerCount}
          </p>
        </div>
        <div className="bg-surface border-border-subtle rounded-2xl border p-4 shadow-2xs">
          <p className="text-fg-muted text-[11px] font-bold tracking-wider uppercase">
            Coaches & Staff
          </p>
          <p className="text-primary mt-1 text-2xl font-extrabold">{coachStaffCount}</p>
        </div>
        <div className="bg-surface border-border-subtle rounded-2xl border p-4 shadow-2xs">
          <p className="text-fg-muted text-[11px] font-bold tracking-wider uppercase">Batches</p>
          <p className="text-fg mt-1 text-2xl font-extrabold">{batchesQuery.data?.length ?? 0}</p>
        </div>
      </div>

      {/* PENDING APPROVALS ALERT CARD */}
      {canApproveRequests && requestsQuery.data && requestsQuery.data.length > 0 ? (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader
            title="Pending Join Requests"
            description="Players requesting to join your academy."
            action={
              <Badge tone="warning" className="px-2.5 py-0.5 text-xs font-semibold">
                {requestsQuery.data.length} Pending
              </Badge>
            }
          />
          <CardBody>
            <div className="space-y-3">
              {requestsQuery.data.map((request) => (
                <div
                  key={request.id}
                  className="bg-surface border-border-subtle flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={request.fullName ?? request.email} size="sm" />
                    <div>
                      <p className="text-fg text-sm font-semibold">
                        {request.fullName ?? request.email ?? 'Applicant'}
                      </p>
                      <p className="text-fg-muted text-xs">
                        {request.email ? `${request.email} • ` : ''}
                        {ROLE_LABELS[request.requestedRole]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      isLoading={approveRequest.isPending}
                      onClick={() => handleApproveClick(request)}
                    >
                      <UserCheck className="mr-1.5 h-3.5 w-3.5" /> Approve
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

      {/* SEARCH AND FILTERS CONTAINER */}
      <Card>
        <CardBody className="space-y-4 p-4">
          {/* SEARCH & ROLE FILTER BAR */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="text-fg-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search players by name, phone, or email…"
                className="bg-surface-muted border-border-subtle text-fg placeholder:text-fg-muted focus:ring-primary/50 h-11 w-full rounded-xl border pr-9 pl-9 text-sm focus:ring-2 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-fg-muted hover:text-fg absolute top-1/2 right-3 -translate-y-1/2 p-1"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Select
                aria-label="Filter by role"
                value={roleFilter}
                className="h-11 min-h-[44px] w-full text-sm sm:w-44"
                onChange={(event) =>
                  setRoleFilter(event.target.value as 'all' | JoinableRole | 'academy_owner')
                }
              >
                <option value="all">All Roles</option>
                <option value="academy_owner">{ROLE_LABELS.academy_owner}</option>
                {JOINABLE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* STATUS FILTER CHIPS */}
          <div className="pt-1">
            <MobileFilterChips
              options={[
                { id: 'all', label: 'All Status', count: members.length },
                { id: 'active', label: 'Active' },
                { id: 'inactive', label: 'Inactive' },
              ]}
              activeId={statusFilter}
              onChange={setStatusFilter}
            />
          </div>

          {/* MAIN PLAYER ROSTER DATA */}
          {query.isPending ? (
            <div className="space-y-3 py-4">
              <SkeletonText lines={4} />
            </div>
          ) : query.isError ? (
            <ErrorState error={query.error} onRetry={() => void query.refetch()} />
          ) : filteredMembers.length === 0 ? (
            <div className="py-8">
              {searchQuery ? (
                <div className="flex flex-col items-center justify-center text-center">
                  <p className="text-fg text-base font-semibold">No players found</p>
                  <p className="text-fg-muted mt-1 text-sm">
                    No members match &quot;{searchQuery}&quot;. Try another search term.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                </div>
              ) : (
                <MobileEmptyState
                  title="No players yet"
                  description="Add your first player to start managing your academy."
                  action={
                    canManage
                      ? {
                          label: 'Add Player',
                          onClick: () => setIsAddModalOpen(true),
                        }
                      : undefined
                  }
                />
              )}
            </div>
          ) : (
            <MemberTable members={filteredMembers} academyId={academyId} canManage={canManage} />
          )}
        </CardBody>
      </Card>

      {/* APPROVE JOIN REQUEST & ASSIGN BATCHES MODAL */}
      {approvingRequest && (
        <Modal
          open={Boolean(approvingRequest)}
          onClose={() => {
            setApprovingRequest(null);
            setSelectedBatchIds([]);
          }}
          title="Approve Join Request"
        >
          <div className="space-y-4 p-1">
            <div className="bg-surface-muted border-border-subtle rounded-xl border p-3">
              <p className="text-fg text-sm font-semibold">
                {approvingRequest.fullName ?? approvingRequest.email}
              </p>
              <p className="text-fg-muted text-xs">
                {approvingRequest.email} • Role:{' '}
                {ROLE_LABELS[approvingRequest.requestedRole as JoinableRole] ??
                  approvingRequest.requestedRole}
              </p>
            </div>

            <div>
              <label className="text-fg-muted mb-2 block text-xs font-semibold uppercase">
                Assign to Batches (Optional)
              </label>
              {batchesQuery.data && batchesQuery.data.length > 0 ? (
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {batchesQuery.data.map((batch) => {
                    const isChecked = selectedBatchIds.includes(batch.id);
                    return (
                      <label
                        key={batch.id}
                        className="bg-surface border-border-subtle hover:bg-surface-muted flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBatchIds((prev) => [...prev, batch.id]);
                              } else {
                                setSelectedBatchIds((prev) => prev.filter((id) => id !== batch.id));
                              }
                            }}
                            className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
                          />
                          <span className="text-fg font-medium">{batch.name}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-fg-muted text-xs">No batches available in this academy.</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setApprovingRequest(null);
                  setSelectedBatchIds([]);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={approveRequest.isPending}
                onClick={handleConfirmApprovalWithBatches}
              >
                <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                {selectedBatchIds.length > 0
                  ? `Approve & Assign (${selectedBatchIds.length})`
                  : 'Approve without Batches'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD PLAYER / JOIN CODE MODAL */}
      {isAddModalOpen && (
        <Modal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Player to Academy"
        >
          <div className="space-y-4 p-1">
            <p className="text-fg-muted text-sm">
              Share the Join Code below with your players. When they sign up or enter this code,
              they will be added to your academy.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-fg-muted mb-1.5 block text-xs font-semibold uppercase">
                  Player Join Code
                </label>
                <JoinCodeCard academyId={academyId} role="player" />
              </div>

              <div>
                <label className="text-fg-muted mb-1.5 block text-xs font-semibold uppercase">
                  Coach Join Code
                </label>
                <JoinCodeCard academyId={academyId} role="coach" />
              </div>
            </div>

            <div className="bg-surface-muted border-border-subtle text-fg-muted space-y-1 rounded-xl border p-3.5 text-xs">
              <p className="text-fg font-semibold">How it works:</p>
              <p>1. Copy and share the code above with your player or coach.</p>
              <p>2. Have them download CricOS and enter the code during registration.</p>
              <p>3. Their join request will appear automatically for your approval.</p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
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
      {/* MOBILE STACKED PLAYER CARDS (< md) */}
      <div className="space-y-3 md:hidden">
        {members.map((member) => {
          const isSelf = member.userId === user?.id;
          return (
            <div
              key={member.id}
              className="border-border-subtle bg-surface hover:border-primary/40 space-y-3.5 rounded-2xl border p-4 shadow-2xs transition"
            >
              <div className="flex items-center justify-between gap-3">
                <Link
                  to={`/members/${member.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3 active:opacity-80"
                >
                  <Avatar name={member.fullName ?? member.email} src={member.avatarUrl} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="text-fg hover:text-primary truncate text-sm font-bold">
                      {member.fullName ?? member.email}
                    </p>
                    <p className="text-fg-muted truncate text-xs font-medium">{member.email}</p>
                  </div>
                </Link>

                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone={STATUS_TONES[member.status]}>{member.status}</Badge>
                  <Link
                    to={`/members/${member.id}`}
                    aria-label={`View profile for ${member.fullName ?? member.email}`}
                    className="text-fg-muted hover:bg-surface-muted flex h-10 min-h-[44px] w-10 min-w-[44px] items-center justify-center rounded-full transition"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              <div className="border-border-subtle text-fg-muted flex items-center justify-between border-t pt-2.5 text-xs">
                <span>
                  Role:{' '}
                  <strong className="text-fg font-semibold">{ROLE_LABELS[member.role]}</strong>
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
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={member.fullName ?? member.email}
                        src={member.avatarUrl}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/members/${member.id}`}
                          className="text-fg hover:text-primary truncate text-sm font-semibold hover:underline"
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
                        className="h-9 w-36 text-xs"
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
                      <span className="text-xs font-semibold">{ROLE_LABELS[member.role]}</span>
                    )}
                  </TD>
                  <TD>
                    <Badge tone={STATUS_TONES[member.status]}>{member.status}</Badge>
                  </TD>
                  <TD className="text-fg-muted text-xs">
                    {member.joinedAt ? formatDate(member.joinedAt) : '—'}
                  </TD>
                  {canManage ? (
                    <TD>
                      {member.role === 'academy_owner' || isSelf ? null : (
                        <div className="flex items-center gap-2">
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
