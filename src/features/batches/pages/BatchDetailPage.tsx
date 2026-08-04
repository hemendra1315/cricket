import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, Card, CardBody, CardHeader, Select } from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/feedback';
import { useActiveAcademy } from '@/features/academies';
import { useAcademyMembers } from '@/features/members';
import { useCan } from '@/lib/rbac';
import { useUiStore } from '@/stores';
import {
  useBatchAvailablePlayers,
  useBatchMemberships,
  useBatchPlayers,
  useBatches,
} from '../hooks/useBatches';

export default function BatchDetailPage() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { academyId } = useActiveAcademy();
  const canManage = useCan('batches:manage');
  const batchesQuery = useBatches(academyId);
  const batchPlayersQuery = useBatchPlayers(batchId ?? null, academyId);
  const availablePlayersQuery = useBatchAvailablePlayers(academyId);
  const membersQuery = useAcademyMembers(academyId, { status: 'active' });
  const { addPlayer, removePlayer } = useBatchMemberships(batchId as string, academyId as string);
  const pushToast = useUiStore((state) => state.pushToast);
  const [selectedMember, setSelectedMember] = useState<string>('');

  const batch = batchesQuery.data?.find((item) => item.id === batchId);
  const coach = membersQuery.data?.find((member) => member.id === batch?.coachId);

  const remainingPlayers = useMemo(() => {
    if (!availablePlayersQuery.data || !batchPlayersQuery.data) return [];
    const assignedIds = new Set(batchPlayersQuery.data.map((player) => player.academyMemberId));
    return availablePlayersQuery.data.filter((member) => !assignedIds.has(member.id));
  }, [availablePlayersQuery.data, batchPlayersQuery.data]);

  const handleAdd = async () => {
    if (!selectedMember) return;
    await addPlayer.mutateAsync({ academyMemberId: selectedMember });
    pushToast({ title: 'Player added to batch', variant: 'success' });
    setSelectedMember('');
  };

  const handleRemove = async (membershipId: string) => {
    await removePlayer.mutateAsync({ batchMemberId: membershipId });
    pushToast({ title: 'Player removed from batch', variant: 'success' });
  };

  if (!academyId || !batchId) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-fg text-xl font-semibold">{batch?.name ?? 'Batch detail'}</h1>
          <p className="text-fg-muted">Manage players assigned to this batch.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void navigate('/batches')}>
          Back to batches
        </Button>
      </div>

      {!batch ? (
        <EmptyState
          title="Batch not found"
          description="This batch does not exist or you do not have access."
        />
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader title="Batch details" description="Batch schedule and assigned coach." />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-fg-muted text-xs tracking-wide uppercase">Age group</p>
                <p className="text-fg text-base font-medium">{batch.ageGroup}</p>
              </div>
              <div>
                <p className="text-fg-muted text-xs tracking-wide uppercase">Training schedule</p>
                <p className="text-fg text-base font-medium">
                  {batch.trainingDays} · {batch.trainingTime}
                </p>
              </div>
              <div>
                <p className="text-fg-muted text-xs tracking-wide uppercase">Coach</p>
                <p className="text-fg text-base font-medium">
                  {coach?.fullName ?? batch.coach.fullName ?? batch.coach.email}
                </p>
              </div>
              <div>
                <p className="text-fg-muted text-xs tracking-wide uppercase">Description</p>
                <p className="text-fg text-base font-medium">
                  {batch.description ?? 'No description provided.'}
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Players" description="Players currently assigned to this batch." />
            <CardBody>
              {batchPlayersQuery.isPending ? (
                <p className="text-fg-muted">Loading players…</p>
              ) : batchPlayersQuery.isError ? (
                <ErrorState
                  error={batchPlayersQuery.error}
                  onRetry={() => void batchPlayersQuery.refetch()}
                />
              ) : batchPlayersQuery.data?.length === 0 ? (
                <EmptyState
                  title="No players assigned"
                  description="Add active players to this batch."
                />
              ) : (
                <div className="space-y-3">
                  {batchPlayersQuery.data.map((player) => (
                    <div
                      key={player.id}
                      className="border-border-subtle flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4"
                    >
                      <div>
                        <p className="text-fg text-sm font-medium">
                          {player.fullName ?? player.email}
                        </p>
                        <p className="text-fg-muted text-xs">{player.email}</p>
                      </div>
                      {canManage ? (
                        <Button
                          variant="danger"
                          size="sm"
                          isLoading={removePlayer.isPending}
                          onClick={() => void handleRemove(player.id)}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {canManage ? (
            <Card>
              <CardHeader title="Add player" description="Assign an active player to this batch." />
              <CardBody className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-fg block text-sm font-medium">Available players</label>
                  <Select
                    value={selectedMember}
                    onChange={(event) => setSelectedMember(event.target.value)}
                  >
                    <option value="">Select player</option>
                    {remainingPlayers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.fullName ?? member.email}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="self-end">
                  <Button
                    onClick={() => void handleAdd()}
                    disabled={!selectedMember}
                    isLoading={addPlayer.isPending}
                  >
                    Add to batch
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
