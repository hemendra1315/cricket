import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Select,
  Textarea,
} from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/feedback';
import { useActiveAcademy } from '@/features/academies';
import { useAcademyMembers } from '@/features/members';
import { useCan } from '@/lib/rbac';
import { useUiStore } from '@/stores';
import type { Batch } from '../api/batchesTypes';
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
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [showEditForm, setShowEditForm] = useState(false);

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
        <div className="flex flex-wrap items-center gap-2">
          {canManage ? (
            <Button variant="secondary" size="sm" onClick={() => setShowEditForm((open) => !open)}>
              {showEditForm ? 'Cancel edit' : 'Edit batch'}
            </Button>
          ) : null}
          <Button variant="secondary" size="sm" onClick={() => void navigate('/batches')}>
            Back to batches
          </Button>
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
  const initialDays = batch.trainingDays
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

  const [startTimeText = '', endTimeText = ''] = batch.trainingTime
    .split('-')
    .map((part: string) => part.trim());

  const [selectedDays, setSelectedDays] = useState<string[]>(initialDays);
  const [startTime, setStartTime] = useState<Date | null>(parseTime(startTimeText));
  const [endTime, setEndTime] = useState<Date | null>(parseTime(endTimeText));

  const formatTimeStr = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isDirty },
  } = useForm<BatchFormValues>({
    defaultValues: {
      name: batch.name,
      ageGroup: batch.ageGroup,
      description: batch.description ?? '',
      trainingDays: batch.trainingDays,
      trainingTime: batch.trainingTime,
      coachId: batch.coachId,
    },
  });

  const toggleDay = (day: string) => {
    const updated = selectedDays.includes(day)
      ? selectedDays.filter((item) => item !== day)
      : [...prevDays(day)];
    setSelectedDays(updated);
    setValue('trainingDays', updated.join(', '), { shouldDirty: true });
  };

  const prevDays = (day: string) =>
    selectedDays.includes(day)
      ? selectedDays.filter((item) => item !== day)
      : [...selectedDays, day];

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
    await updateBatch.mutateAsync({
      batchId: batch.id,
      input: {
        name: value.name,
        ageGroup: value.ageGroup,
        description: value.description || null,
        trainingDays: selectedDays.join(', '),
        trainingTime: `${formatTimeStr(startTime)} - ${formatTimeStr(endTime)}`,
        coachId: value.coachId,
      },
    });
    onSuccess();
  });

  return (
    <Card>
      <form onSubmit={handleSubmitEdit} noValidate>
        <CardHeader title="Edit batch" description="Update the batch details." />
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-fg block text-sm font-medium">Batch name</label>
              <Input
                {...register('name', {
                  required: 'Batch name is required',
                })}
              />
            </div>
            <div>
              <label className="text-fg block text-sm font-medium">Age group</label>
              <Input
                {...register('ageGroup', {
                  required: 'Age group is required',
                })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-fg block text-sm font-medium">Training days</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <Button
                    key={day}
                    type="button"
                    variant={selectedDays.includes(day) ? 'primary' : 'secondary'}
                    onClick={() => toggleDay(day)}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-fg block text-sm font-medium">Training time</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <DatePicker
                  selected={startTime}
                  onChange={handleStartTimeChange}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  dateFormat="h:mm aa"
                  placeholderText="Start Time"
                  className="w-full rounded-lg border px-3 py-2"
                />
                <DatePicker
                  selected={endTime}
                  onChange={handleEndTimeChange}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  dateFormat="h:mm aa"
                  placeholderText="End Time"
                  className="w-full rounded-lg border px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-fg block text-sm font-medium">Assigned coach</label>
            <Select
              {...register('coachId', {
                required: 'Coach is required',
              })}
            >
              <option value="">Select coach</option>
              {coaches.map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.fullName ?? coach.email}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-fg block text-sm font-medium">Description</label>
            <Textarea {...register('description')} />
          </div>
        </CardBody>
        <CardFooter>
          <Button type="submit" isLoading={updateBatch.isPending} disabled={!isDirty}>
            Save changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
