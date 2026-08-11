import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3, Trash2, UserPlus, Users } from 'lucide-react';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Modal,
  Select,
  Textarea,
} from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/feedback';
import { useActiveAcademy } from '@/features/academies';
import { useAcademyMembers } from '@/features/members';
import { useCan } from '@/lib/rbac';
import { useUiStore } from '@/stores';
import type { Batch } from '../api/batchesTypes';
import { AddBatchPlayersModal } from '../components/AddBatchPlayersModal';
import {
  useBatchAvailablePlayers,
  useBatchMemberships,
  useBatchPlayers,
  useBatches,
  useUpdateBatch,
} from '../hooks/useBatches';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type BatchFormValues = {
  name: string;
  ageGroup: string;
  description: string;
  trainingDays: string;
  trainingTime: string;
  coachId: string;
};

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
  const updateBatch = useUpdateBatch(academyId as string);
  const pushToast = useUiStore((state) => state.pushToast);

  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddPlayersModal, setShowAddPlayersModal] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<{ id: string; name: string } | null>(null);

  const batch = batchesQuery.data?.find((item) => item.id === batchId);
  const coach = membersQuery.data?.find((member) => member.id === batch?.coachId);

  const unassignedPlayers = useMemo(() => {
    if (!availablePlayersQuery.data || !batchPlayersQuery.data) return [];
    const assignedIds = new Set(batchPlayersQuery.data.map((player) => player.academyMemberId));
    return availablePlayersQuery.data.filter((member) => !assignedIds.has(member.id));
  }, [availablePlayersQuery.data, batchPlayersQuery.data]);

  const handleAddPlayersBulk = async (memberIds: string[]) => {
    let successCount = 0;
    for (const id of memberIds) {
      try {
        await addPlayer.mutateAsync({ academyMemberId: id });
        successCount++;
      } catch {
        // ignore individual duplicate error
      }
    }
    pushToast({
      title: `${successCount} player${successCount === 1 ? '' : 's'} assigned to batch`,
      variant: 'success',
    });
    void batchPlayersQuery.refetch();
  };

  const handleConfirmRemovePlayer = async () => {
    if (!playerToRemove) return;
    await removePlayer.mutateAsync({ batchMemberId: playerToRemove.id });
    pushToast({ title: `${playerToRemove.name} removed from batch`, variant: 'success' });
    setPlayerToRemove(null);
    void batchPlayersQuery.refetch();
  };

  if (!academyId || !batchId) return null;

  return (
    <div className="space-y-4 pb-12 sm:pb-6">
      {/* Mobile-first Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void navigate('/batches')}
            aria-label="Back to batches"
            className="min-h-[44px] min-w-[44px] shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-fg text-xl font-bold sm:text-2xl">
              {batch?.name ?? 'Batch detail'}
            </h1>
            <p className="text-fg-muted text-xs sm:text-sm">Batch schedule & player roster</p>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          {canManage ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowEditForm((open) => !open)}
              className="h-11 min-h-[44px] flex-1 sm:flex-initial"
            >
              <Edit3 className="mr-1.5 h-4 w-4" />
              {showEditForm ? 'Cancel edit' : 'Edit batch'}
            </Button>
          ) : null}
        </div>
      </div>

      {!batch ? (
        <EmptyState
          title="Batch not found"
          description="This batch does not exist or you do not have access."
        />
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader title="Batch Overview" description="Schedule and assigned coach" />
            <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="bg-surface-elevated/40 border-border-subtle rounded-xl border p-3.5">
                <p className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
                  Age Group
                </p>
                <p className="text-fg mt-1 text-base font-bold">{batch.ageGroup}</p>
              </div>
              <div className="bg-surface-elevated/40 border-border-subtle rounded-xl border p-3.5">
                <p className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
                  Training Schedule
                </p>
                <p className="text-fg mt-1 text-base font-bold">
                  {batch.trainingDays || 'No days specified'} ·{' '}
                  {batch.trainingTime || 'No time set'}
                </p>
              </div>
              <div className="bg-surface-elevated/40 border-border-subtle rounded-xl border p-3.5">
                <p className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
                  Head Coach
                </p>
                <p className="text-fg mt-1 text-base font-bold">
                  {coach?.fullName ?? batch.coach.fullName ?? batch.coach.email}
                </p>
              </div>
              <div className="bg-surface-elevated/40 border-border-subtle rounded-xl border p-3.5">
                <p className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
                  Description
                </p>
                <p className="text-fg mt-1 text-sm font-medium">
                  {batch.description ?? 'No description provided.'}
                </p>
              </div>
            </CardBody>
          </Card>

          {showEditForm && canManage ? (
            <BatchEditForm
              batch={batch}
              coaches={membersQuery.data?.filter((member) => member.role === 'coach') ?? []}
              updateBatch={updateBatch}
              onSuccess={() => {
                setShowEditForm(false);
                pushToast({ title: 'Batch updated', variant: 'success' });
              }}
            />
          ) : null}

          {/* Assigned Players List Section */}
          <Card>
            <CardHeader
              title={
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="text-primary h-5 w-5" />
                    <span>Assigned Players ({batchPlayersQuery.data?.length ?? 0})</span>
                  </div>
                  {canManage ? (
                    <Button
                      size="sm"
                      onClick={() => setShowAddPlayersModal(true)}
                      className="min-h-[44px] px-3 font-semibold"
                    >
                      <UserPlus className="mr-1.5 h-4 w-4" />
                      Add Players
                    </Button>
                  ) : null}
                </div>
              }
              description="Active players enrolled in this training batch"
            />
            <CardBody>
              {batchPlayersQuery.isPending ? (
                <p className="text-fg-muted py-4 text-center">Loading assigned players…</p>
              ) : batchPlayersQuery.isError ? (
                <ErrorState
                  error={batchPlayersQuery.error}
                  onRetry={() => void batchPlayersQuery.refetch()}
                />
              ) : batchPlayersQuery.data?.length === 0 ? (
                <div className="border-border-subtle flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                  <Users className="text-fg-muted mb-2 h-10 w-10 opacity-40" />
                  <p className="text-fg text-base font-semibold">No players assigned yet</p>
                  <p className="text-fg-muted mt-1 text-xs sm:text-sm">
                    Tap the button below to select active players for this batch.
                  </p>
                  {canManage ? (
                    <Button
                      onClick={() => setShowAddPlayersModal(true)}
                      className="mt-4 min-h-[48px] w-full max-w-xs font-semibold"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Players to Batch
                    </Button>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {batchPlayersQuery.data.map((player) => {
                    const name = player.fullName ?? player.email;
                    return (
                      <div
                        key={player.id}
                        className="border-border-subtle bg-surface flex min-h-[56px] items-center justify-between gap-3 rounded-xl border p-3.5"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-fg truncate text-sm font-semibold">{name}</p>
                            <p className="text-fg-muted truncate text-xs">{player.email}</p>
                          </div>
                        </div>

                        {canManage ? (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setPlayerToRemove({ id: player.id, name })}
                            aria-label={`Remove ${name}`}
                            className="min-h-[44px] min-w-[44px] shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="ml-1.5 hidden sm:inline">Remove</span>
                          </Button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Searchable Multi-Select Add Players Modal */}
      {canManage && batch ? (
        <AddBatchPlayersModal
          open={showAddPlayersModal}
          onClose={() => setShowAddPlayersModal(false)}
          batchName={batch.name}
          availablePlayers={unassignedPlayers}
          onAddPlayers={handleAddPlayersBulk}
          isLoading={addPlayer.isPending}
        />
      ) : null}

      {/* Confirmation Modal for Removing Player */}
      <Modal
        open={Boolean(playerToRemove)}
        onClose={() => setPlayerToRemove(null)}
        title="Remove Player from Batch"
        footer={
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setPlayerToRemove(null)}
              className="h-12 min-h-[48px] w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={removePlayer.isPending}
              onClick={() => void handleConfirmRemovePlayer()}
              className="h-12 min-h-[48px] w-full sm:w-auto"
            >
              Remove Player
            </Button>
          </div>
        }
      >
        <p className="text-fg text-sm">
          Are you sure you want to remove{' '}
          <strong className="text-fg font-bold">{playerToRemove?.name}</strong> from{' '}
          <strong className="text-fg font-bold">{batch?.name}</strong>?
        </p>
      </Modal>
    </div>
  );
}

function BatchEditForm({
  batch,
  coaches,
  updateBatch,
  onSuccess,
}: {
  batch: Batch;
  coaches: Array<{ id: string; fullName: string | null; email: string }>;
  updateBatch: ReturnType<typeof useUpdateBatch>;
  onSuccess: () => void;
}) {
  const initialDays = (batch.trainingDays ?? '')
    .split(',')
    .map((day: string) => day.trim())
    .filter((day: string) => DAYS.includes(day));

  const parseTime = (time: string): Date | null => {
    const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match || !match[3]) return null;
    const hours = (Number(match[1]) % 12) + (match[3].toUpperCase() === 'PM' ? 12 : 0);
    const minutes = Number(match[2]);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const [startTimeText = '', endTimeText = ''] = (batch.trainingTime ?? '')
    .split('-')
    .map((part: string) => part.trim());

  const [selectedDays, setSelectedDays] = useState<string[]>(initialDays);
  const [startTime, setStartTime] = useState<Date | null>(parseTime(startTimeText));
  const [endTime, setEndTime] = useState<Date | null>(parseTime(endTimeText));

  const formatTimeStr = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const { register, handleSubmit, setValue } = useForm<BatchFormValues>({
    defaultValues: {
      name: batch.name,
      ageGroup: batch.ageGroup,
      description: batch.description ?? '',
      trainingDays: batch.trainingDays ?? '',
      trainingTime: batch.trainingTime ?? '',
      coachId: batch.coachId ?? '',
    },
  });

  const toggleDay = (day: string) => {
    const updated = selectedDays.includes(day)
      ? selectedDays.filter((item) => item !== day)
      : [...selectedDays, day];
    setSelectedDays(updated);
    setValue('trainingDays', updated.join(', '), { shouldDirty: true });
  };

  const handleStartTimeChange = (date: Date | null) => {
    setStartTime(date);
    const newTimeStr = `${formatTimeStr(date)} - ${formatTimeStr(endTime)}`;
    setValue('trainingTime', newTimeStr, { shouldDirty: true });
  };

  const handleEndTimeChange = (date: Date | null) => {
    setEndTime(date);
    const newTimeStr = `${formatTimeStr(startTime)} - ${formatTimeStr(date)}`;
    setValue('trainingTime', newTimeStr, { shouldDirty: true });
  };

  const handleSubmitEdit = handleSubmit(async (value) => {
    const formattedDays = selectedDays.join(', ');
    const formattedTime =
      startTime && endTime ? `${formatTimeStr(startTime)} - ${formatTimeStr(endTime)}` : '';
    await updateBatch.mutateAsync({
      batchId: batch.id,
      input: {
        name: value.name,
        ageGroup: value.ageGroup,
        description: value.description || null,
        trainingDays: formattedDays || null,
        trainingTime: formattedTime || null,
        coachId: value.coachId || null,
      },
    });
    onSuccess();
  });

  return (
    <Card>
      <form onSubmit={handleSubmitEdit} noValidate>
        <CardHeader title="Edit Batch" description="Update details for this training batch." />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-fg block text-sm font-medium">Batch name</label>
              <Input
                className="h-12 min-h-[44px]"
                {...register('name', {
                  required: 'Batch name is required',
                })}
              />
            </div>
            <div>
              <label className="text-fg block text-sm font-medium">Age group</label>
              <Input
                className="h-12 min-h-[44px]"
                {...register('ageGroup', {
                  required: 'Age group is required',
                })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-fg block text-sm font-medium">
              Training days <span className="text-fg-muted text-xs font-normal">(Optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <Button
                  key={day}
                  type="button"
                  size="sm"
                  variant={selectedDays.includes(day) ? 'primary' : 'secondary'}
                  onClick={() => toggleDay(day)}
                  className="h-11 min-h-[44px] min-w-[44px] px-3 font-semibold"
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-fg block text-sm font-medium">
              Training time <span className="text-fg-muted text-xs font-normal">(Optional)</span>
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <DatePicker
                selected={startTime}
                onChange={handleStartTimeChange}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={30}
                dateFormat="h:mm aa"
                placeholderText="Start Time"
                className="bg-surface border-border-subtle text-fg h-12 min-h-[44px] w-full rounded-lg border px-3 py-2"
              />
              <DatePicker
                selected={endTime}
                onChange={handleEndTimeChange}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={30}
                dateFormat="h:mm aa"
                placeholderText="End Time"
                className="bg-surface border-border-subtle text-fg h-12 min-h-[44px] w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="text-fg block text-sm font-medium">
              Assigned coach <span className="text-fg-muted text-xs font-normal">(Optional)</span>
            </label>
            <Select className="h-12 min-h-[44px]" {...register('coachId')}>
              <option value="">Select coach (Optional)</option>
              {coaches.map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.fullName ?? coach.email}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-fg block text-sm font-medium">
              Description <span className="text-fg-muted text-xs font-normal">(Optional)</span>
            </label>
            <Textarea className="min-h-[80px]" {...register('description')} />
          </div>
        </CardBody>
        <CardFooter className="flex-col gap-2 sm:flex-row">
          <Button
            type="submit"
            isLoading={updateBatch.isPending}
            className="h-12 min-h-[48px] w-full font-semibold sm:w-auto"
          >
            Save changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
