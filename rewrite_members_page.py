with open('src/features/members/pages/MembersPage.tsx', 'w', encoding='utf-8') as f:
    f.write('''import { useMemo, useState } from 'react';
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

export default function MembersPage() {
  const { academyId } = useActiveAcademy();
  const [roleFilter, setRoleFilter] = useState<'all' | JoinableRole | 'academy_owner'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MemberStatus>('all');
  const [batchFilter, setBatchFilter] = useState<'all' | UUID>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const canManage = useCan('members:manage');
  const canApproveRequests = useCan('players:approve');

  const requestsQuery = usePendingJoinRequests(academyId);
  const batchesQuery = useBatches(academyId);

  // Fetch ALL members, let client side do the filtering for instantaneous UX
  const query = useAcademyMembers(academyId, {});
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
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      const matchesBatch = batchFilter === 'all' || member.batches?.some(b => b.id === batchFilter);

      return matchesSearch && matchesStatus && matchesRole && matchesBatch;
    });
  }, [members, searchQuery, statusFilter, roleFilter, batchFilter]);

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
        { onSuccess: () => pushToast({ title: 'Request approved', variant: 'success' }) },
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

  if (!academyId) return null;

  const hasRequests = (requestsQuery.data?.length ?? 0) > 0;

  return (
    <div className="space-y-5 pb-24 md:pb-8 min-w-0">
      <div className="md:hidden">
        <MobilePageHeader
          title="Players"
          count={${filteredMembers.length} found}
          subtitle="Manage academy players, batches, and profiles."
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

      <div className="hidden items-center justify-between gap-4 md:flex">
        <div className="min-w-0">
          <h1 className="text-fg text-2xl font-bold tracking-tight">Players</h1>
          <p className="text-fg-muted mt-1 text-sm font-medium">
            Manage academy players, batches, attendance and profiles.
          </p>
        </div>
        {canManage && (
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="min-h-[44px] px-4 font-semibold shadow-2xs shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Player
          </Button>
        )}
      </div>

      {hasRequests && canApproveRequests && (
        <Card className="border-warning-subtle bg-warning/5 shadow-2xs">
          <CardHeader
            title={
              <div className="flex items-center gap-2">
                <UserCheck className="text-warning h-5 w-5" />
                <span className="text-warning font-semibold">Pending Join Requests</span>
              </div>
            }
          />
          <CardBody className="p-0">
            <div className="divide-border-subtle divide-y">
              {requestsQuery.data?.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={req.fullName ?? req.email} src={req.avatarUrl} size="sm" />
                    <div>
                      <p className="text-fg text-sm font-bold">{req.fullName ?? req.email}</p>
                      <p className="text-fg-muted text-xs">
                        Requested to join as {ROLE_LABELS[req.requestedRole]}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => rejectRequest.mutate({ requestId: req.id })}
                    >
                      Reject
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleApproveClick(req)}>
                      Review & Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {approvingRequest && (
        <Modal
          open={!!approvingRequest}
          onClose={() => setApprovingRequest(null)}
          title="Approve Join Request"
        >
          <div className="space-y-4 p-1">
            <p className="text-fg-muted text-sm">
              Assign <strong>{approvingRequest.fullName ?? approvingRequest.email}</strong> to batches? (Optional)
            </p>
            <div className="space-y-2">
              {batchesQuery.data?.map((batch) => (
                <label
                  key={batch.id}
                  className="border-border-subtle hover:border-primary/50 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
                >
                  <input
                    type="checkbox"
                    className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
                    checked={selectedBatchIds.includes(batch.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBatchIds((prev) => [...prev, batch.id]);
                      } else {
                        setSelectedBatchIds((prev) => prev.filter((id) => id !== batch.id));
                      }
                    }}
                  />
                  <div>
                    <p className="text-fg text-sm font-bold">{batch.name}</p>
                    <p className="text-fg-muted text-xs">{batch.ageGroup}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setApprovingRequest(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmApprovalWithBatches}
                isLoading={approveRequest.isPending}
              >
                Approve & Assign
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* SEARCH & FILTERS */}
      <div className="bg-surface border-border-subtle flex flex-col gap-3 rounded-2xl border p-3 shadow-2xs sm:flex-row sm:items-center min-w-0">
        <div className="relative flex-1 min-w-0">
          <Search className="text-fg-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search players..."
            className="border-border-subtle bg-surface-muted placeholder:text-fg-muted/60 focus:border-primary focus:ring-primary/20 h-10 w-full rounded-xl border py-2 pl-9 pr-4 text-sm outline-none transition-all focus:ring-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-fg-muted hover:text-fg absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar shrink-0">
          <Select
            className="h-10 min-w-[120px] rounded-xl text-sm border-border-subtle"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as MemberStatus | 'all')}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="left">Inactive</option>
          </Select>
          
          <Select
            className="h-10 min-w-[140px] rounded-xl text-sm border-border-subtle"
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value as UUID | 'all')}
          >
            <option value="all">All Batches</option>
            {batchesQuery.data?.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>

          <Select
            className="h-10 min-w-[110px] rounded-xl text-sm border-border-subtle"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as JoinableRole | 'academy_owner' | 'all')}
          >
            <option value="all">All Roles</option>
            <option value="player">Players</option>
            <option value="coach">Coaches</option>
            <option value="academy_owner">Owners</option>
          </Select>
        </div>
      </div>

      <Card className="border-border-subtle bg-surface shadow-2xs min-w-0">
        {query.isPending ? (
          <CardBody className="p-6">
            <div className="space-y-4">
              <SkeletonText className="h-12 w-full rounded-xl" />
              <SkeletonText className="h-12 w-full rounded-xl" />
              <SkeletonText className="h-12 w-full rounded-xl" />
            </div>
          </CardBody>
        ) : query.isError ? (
          <CardBody className="p-6">
            <ErrorState error={query.error} onRetry={() => void query.refetch()} />
          </CardBody>
        ) : (
          <CardBody className="p-0 min-w-0">
            {filteredMembers.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-fg-muted font-medium">No players found matching your filters.</p>
              </div>
            ) : (
              <MemberTable members={filteredMembers} academyId={academyId} canManage={canManage} />
            )}
          </CardBody>
        )}
      </Card>

      {/* ADD PLAYER MODAL */}
      {isAddModalOpen && (
        <Modal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Player"
        >
          <div className="space-y-4 p-1">
            <p className="text-fg-muted text-sm">
              Share this Join Code with your players. When they sign up or enter this code in the app,
              they will be automatically assigned to this academy.
            </p>
            <JoinCodeCard academyId={academyId} />
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
  const { user } = useAuth();
  const { changeRole, changeStatus, removeMember } = useUpdateMember(academyId);
  const pushToast = useUiStore((state) => state.pushToast);

  return (
    <>
      <div className="md:hidden divide-border-subtle flex flex-col divide-y min-w-0">
        {members.map((member) => {
          return (
            <Link
              key={member.id}
              to={/members/}
              className="flex items-center justify-between p-4 hover:bg-surface-muted transition-colors min-w-0"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar
                  name={member.fullName ?? member.email}
                  src={member.avatarUrl}
                  size="md"
                  className="shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-fg truncate text-sm font-bold">
                    {member.fullName ?? member.email}
                  </p>
                  <div className="text-fg-muted mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <Badge tone={STATUS_TONES[member.status]} className="text-[10px] px-1.5 py-0">
                      {member.status}
                    </Badge>
                    {member.batches && member.batches.length > 0 && (
                      <span className="truncate max-w-[120px] font-medium text-primary">
                        {member.batches[0].name}
                        {member.batches.length > 1 &&  +}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="text-fg-muted/50 h-5 w-5 shrink-0 ml-2" />
            </Link>
          );
        })}
      </div>

      <div className="hidden md:block min-w-0 overflow-x-auto">
        <Table>
          <THead>
            <TR>
              <TH>Player</TH>
              <TH>Batch</TH>
              <TH>Role</TH>
              <TH>Status</TH>
              <TH></TH>
            </TR>
          </THead>
          <TBody>
            {members.map((member) => {
              const isSelf = member.userId === user?.id;
              return (
                <TR key={member.id} className="hover:bg-surface-muted transition-colors group">
                  <TD className="min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.fullName ?? member.email} src={member.avatarUrl} size="sm" />
                      <div className="min-w-0">
                        <Link
                          to={/members/}
                          className="text-fg hover:text-primary truncate text-sm font-bold hover:underline"
                        >
                          {member.fullName ?? member.email}
                        </Link>
                        <p className="text-fg-muted truncate text-xs">{member.email}</p>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    {member.batches && member.batches.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {member.batches.map(b => (
                          <span key={b.id} className="text-xs font-semibold text-primary">{b.name}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-fg-muted text-xs">—</span>
                    )}
                  </TD>
                  <TD>
                    {canManage && member.role !== 'academy_owner' ? (
                      <Select
                        aria-label={Role for }
                        className="h-8 w-32 text-xs py-1"
                        value={member.role}
                        disabled={changeRole.isPending}
                        onChange={(event) =>
                          changeRole.mutate(
                            { membershipId: member.id, role: event.target.value as JoinableRole },
                            { onSuccess: () => pushToast({ title: 'Role updated', variant: 'success' }) }
                          )
                        }
                      >
                        {JOINABLE_ROLES.map((role) => (
                          <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                        ))}
                      </Select>
                    ) : (
                      <span className="text-xs font-semibold">{ROLE_LABELS[member.role]}</span>
                    )}
                  </TD>
                  <TD>
                    <Badge tone={STATUS_TONES[member.status]}>{member.status}</Badge>
                  </TD>
                  <TD className="text-right">
                    <Link
                      to={/members/}
                      className="text-primary hover:bg-primary/10 inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-bold transition-colors opacity-0 group-hover:opacity-100"
                    >
                      View Profile <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </div>
    </>
  );
}
''')
