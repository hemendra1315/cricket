import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { EmptyState, ErrorState } from '@/components/feedback';
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
} from '@/components/ui';
import { useActiveAcademy } from '@/features/academies';
import { useCoaches } from '@/features/coaches';
import { usePlayers } from '@/features/players';
import { errorMessage } from '@/lib/api';
import { useCan } from '@/lib/rbac';
import { formatDate } from '@/lib/utils/date';
import { useUiStore } from '@/stores';
import type { Batch, UUID } from '@/types';
import { SKILL_LEVEL_LABELS } from '@/types/enums';

import { BatchForm } from '../components/BatchForm';
import {
  useBatch,
  useBatchCoaches,
  useBatchPlayers,
  useBatchRosterMutations,
  useDeleteBatch,
  useUpdateBatch,
  useVenues,
} from '../hooks/useBatches';
import { toBatchInput } from '../utils/toBatchInput';

/** One batch: its settings, assigned coaches and its player roster. */
export default function BatchDetailPage() {
  const { batchId } = useParams<{ batchId: string }>();
  const { academyId } = useActiveAcademy();
  const query = useBatch(academyId, batchId);

  if (query.isPending) return <SkeletonText lines={6} />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  return <BatchDetail batch={query.data} academyId={academyId ?? ''} />;
}

function BatchDetail({ batch, academyId }: { batch: Batch; academyId: string }) {
  const canManage = useCan('batches:manage');

  return (
    <div className="space-y-4">
      <BatchHeader batch={batch} academyId={academyId} canManage={canManage} />
      <BatchCoachesCard batch={batch} academyId={academyId} canManage={canManage} />
      <BatchPlayersCard batch={batch} academyId={academyId} canManage={canManage} />
    </div>
  );
}

function BatchHeader({
  batch,
  academyId,
  canManage,
}: {
  batch: Batch;
  academyId: string;
  canManage: boolean;
}) {
  const navigate = useNavigate();
  const venues = useVenues(canManage ? academyId : null);
  const updateBatch = useUpdateBatch(academyId);
  const deleteBatch = useDeleteBatch(academyId);
  const pushToast = useUiStore((state) => state.pushToast);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const facts = [
    batch.ageGroup,
    batch.skillLevel ? SKILL_LEVEL_LABELS[batch.skillLevel] : null,
    batch.venueName,
    batch.monthlyFeePaise === null ? null : `₹${batch.monthlyFeePaise / 100}/month`,
    batch.startDate ? `from ${formatDate(batch.startDate)}` : null,
  ].filter((fact): fact is string => Boolean(fact));

  return (
    <>
      <Card>
        <CardBody className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-fg text-lg font-semibold">{batch.name}</h1>
            <Badge tone={batch.isActive ? 'success' : 'neutral'}>
              {batch.isActive ? 'active' : 'inactive'}
            </Badge>
            <span className="text-fg-muted text-sm">
              {batch.capacity === null
                ? `${batch.playerCount} players`
                : `${batch.playerCount} / ${batch.capacity} players`}
            </span>
            {canManage ? (
              <div className="ml-auto flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  isLoading={updateBatch.isPending}
                  onClick={() =>
                    updateBatch.mutate({ batchId: batch.id, input: { isActive: !batch.isActive } })
                  }
                >
                  {batch.isActive ? 'Deactivate' : 'Reactivate'}
                </Button>
                <Button variant="danger" size="sm" onClick={() => setIsConfirmingDelete(true)}>
                  Delete
                </Button>
              </div>
            ) : null}
          </div>

          {facts.length > 0 ? <p className="text-fg-muted text-sm">{facts.join(' · ')}</p> : null}
          {batch.description ? <p className="text-fg text-sm">{batch.description}</p> : null}
        </CardBody>
      </Card>

      {isEditing ? (
        <Modal open title={`Edit ${batch.name}`} size="lg" onClose={() => setIsEditing(false)}>
          <BatchForm
            batch={batch}
            venues={venues.data ?? []}
            isSaving={updateBatch.isPending}
            error={updateBatch.error}
            submitLabel="Save changes"
            onSubmit={async (values) => {
              await updateBatch.mutateAsync({ batchId: batch.id, input: toBatchInput(values) });
              pushToast({ title: 'Batch updated', variant: 'success' });
              setIsEditing(false);
            }}
          />
        </Modal>
      ) : null}

      {isConfirmingDelete ? (
        <Modal
          open
          size="sm"
          title={`Delete ${batch.name}?`}
          onClose={() => setIsConfirmingDelete(false)}
        >
          <CardBody className="space-y-2">
            <p className="text-fg text-sm">
              Its {batch.playerCount} player(s) are released from the batch. Past records are kept,
              but the batch stops appearing in listings.
            </p>
            {deleteBatch.isError ? (
              <p role="alert" className="text-danger text-sm">
                {errorMessage(deleteBatch.error)}
              </p>
            ) : null}
          </CardBody>
          <div className="flex justify-end gap-2 p-4 pt-0">
            <Button variant="ghost" size="sm" onClick={() => setIsConfirmingDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteBatch.isPending}
              onClick={async () => {
                await deleteBatch.mutateAsync(batch.id);
                pushToast({ title: `${batch.name} deleted`, variant: 'success' });
                navigate('/batches');
              }}
            >
              Delete batch
            </Button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

function BatchCoachesCard({
  batch,
  academyId,
  canManage,
}: {
  batch: Batch;
  academyId: string;
  canManage: boolean;
}) {
  const assigned = useBatchCoaches(academyId, batch.id);
  const coaches = useCoaches(canManage ? academyId : null);
  const { assignCoach, removeCoach } = useBatchRosterMutations(academyId);
  const [selected, setSelected] = useState('');

  const assignable = useMemo(
    () =>
      (coaches.data ?? []).filter(
        (coach) => coach.isActive && !(assigned.data ?? []).some((row) => row.coachId === coach.id),
      ),
    [coaches.data, assigned.data],
  );

  return (
    <Card>
      <CardHeader
        title="Coaches"
        description="The first coach assigned is marked primary; a batch has at most one."
        action={
          canManage ? (
            <div className="flex items-center gap-2">
              <Select
                aria-label="Coach to assign"
                className="h-8 w-48"
                value={selected}
                disabled={assignable.length === 0}
                onChange={(event) => setSelected(event.target.value)}
              >
                <option value="">
                  {assignable.length === 0 ? 'No coaches available' : 'Choose a coach'}
                </option>
                {assignable.map((coach) => (
                  <option key={coach.id} value={coach.id}>
                    {coach.fullName ?? coach.email}
                  </option>
                ))}
              </Select>
              <Button
                size="sm"
                disabled={selected === ''}
                isLoading={assignCoach.isPending}
                onClick={() => {
                  assignCoach.mutate({
                    batchId: batch.id,
                    coachId: selected as UUID,
                    isPrimary: (assigned.data ?? []).length === 0,
                  });
                  setSelected('');
                }}
              >
                Assign
              </Button>
            </div>
          ) : null
        }
      />
      <CardBody className="space-y-2">
        {assigned.isPending ? (
          <SkeletonText lines={2} />
        ) : assigned.isError ? (
          <ErrorState error={assigned.error} onRetry={() => void assigned.refetch()} />
        ) : assigned.data.length === 0 ? (
          <EmptyState title="No coaches assigned" description="Assign a coach to this batch." />
        ) : (
          assigned.data.map((coach) => (
            <div
              key={coach.coachId}
              className="border-border-subtle flex items-center gap-3 rounded-lg border p-3"
            >
              <Avatar
                name={coach.fullName ?? coach.email ?? 'Coach'}
                src={coach.avatarUrl}
                size="sm"
              />
              <div className="min-w-0">
                <p className="text-fg truncate text-sm font-medium">
                  {coach.fullName ?? coach.email}
                </p>
                <p className="text-fg-muted truncate text-xs">{coach.email}</p>
              </div>
              {coach.isPrimary ? <Badge tone="success">primary</Badge> : null}
              {canManage ? (
                <div className="ml-auto flex items-center gap-2">
                  {coach.isPrimary ? null : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        assignCoach.mutate({
                          batchId: batch.id,
                          coachId: coach.coachId,
                          isPrimary: true,
                        })
                      }
                    >
                      Make primary
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      removeCoach.mutate({ batchId: batch.id, coachId: coach.coachId })
                    }
                  >
                    Remove
                  </Button>
                </div>
              ) : null}
            </div>
          ))
        )}

        {assignCoach.isError || removeCoach.isError ? (
          <p role="alert" className="text-danger text-sm">
            {errorMessage(assignCoach.error ?? removeCoach.error)}
          </p>
        ) : null}
      </CardBody>
    </Card>
  );
}

function BatchPlayersCard({
  batch,
  academyId,
  canManage,
}: {
  batch: Batch;
  academyId: string;
  canManage: boolean;
}) {
  const roster = useBatchPlayers(academyId, batch.id);
  const players = usePlayers(canManage ? academyId : null, { activeOnly: true });
  const { addPlayers, removePlayer } = useBatchRosterMutations(academyId);
  const pushToast = useUiStore((state) => state.pushToast);
  const [selected, setSelected] = useState('');

  const assignable = useMemo(
    () =>
      (players.data ?? []).filter(
        (player) => !(roster.data ?? []).some((row) => row.playerId === player.id),
      ),
    [players.data, roster.data],
  );

  const isFull = batch.capacity !== null && batch.playerCount >= batch.capacity;

  return (
    <Card>
      <CardHeader
        title="Players"
        description={
          isFull ? 'This batch is at capacity.' : 'Players may belong to more than one batch.'
        }
        action={
          canManage ? (
            <div className="flex items-center gap-2">
              <Select
                aria-label="Player to add"
                className="h-8 w-48"
                value={selected}
                disabled={assignable.length === 0}
                onChange={(event) => setSelected(event.target.value)}
              >
                <option value="">
                  {assignable.length === 0 ? 'No players available' : 'Choose a player'}
                </option>
                {assignable.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.fullName ?? player.email ?? player.playerCode ?? 'Unnamed player'}
                  </option>
                ))}
              </Select>
              <Button
                size="sm"
                disabled={selected === ''}
                isLoading={addPlayers.isPending}
                onClick={async () => {
                  const added = await addPlayers.mutateAsync({
                    batchId: batch.id,
                    playerIds: [selected as UUID],
                  });
                  setSelected('');
                  pushToast({
                    title:
                      added > 0 ? 'Player added to the batch' : 'That player was already in it',
                    variant: added > 0 ? 'success' : 'info',
                  });
                }}
              >
                Add
              </Button>
            </div>
          ) : null
        }
      />
      <CardBody className="space-y-2">
        {roster.isPending ? (
          <SkeletonText lines={3} />
        ) : roster.isError ? (
          <ErrorState error={roster.error} onRetry={() => void roster.refetch()} />
        ) : roster.data.length === 0 ? (
          <EmptyState title="No players yet" description="Add players to build the roster." />
        ) : (
          roster.data.map((player) => (
            <div
              key={player.id}
              className="border-border-subtle flex items-center gap-3 rounded-lg border p-3"
            >
              <Avatar
                name={player.fullName ?? player.email ?? 'Player'}
                src={player.avatarUrl}
                size="sm"
              />
              <div className="min-w-0">
                <p className="text-fg truncate text-sm font-medium">
                  {player.fullName ?? 'Unnamed player'}
                </p>
                <p className="text-fg-muted truncate text-xs">
                  {SKILL_LEVEL_LABELS[player.skillLevel]}
                  {player.playerCode ? ` · ${player.playerCode}` : ''} · since{' '}
                  {formatDate(player.joinedAt)}
                </p>
              </div>
              {canManage ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() =>
                    removePlayer.mutate({ batchId: batch.id, playerId: player.playerId })
                  }
                >
                  Remove
                </Button>
              ) : null}
            </div>
          ))
        )}

        {addPlayers.isError || removePlayer.isError ? (
          <p role="alert" className="text-danger text-sm">
            {errorMessage(addPlayers.error ?? removePlayer.error)}
          </p>
        ) : null}
      </CardBody>
    </Card>
  );
}
