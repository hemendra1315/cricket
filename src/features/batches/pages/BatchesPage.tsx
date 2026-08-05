import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

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
import type { CreateBatchInput } from '../api/batchesTypes';
import { useBatches, useCreateBatch, useDeleteBatch } from '../hooks/useBatches';
import { Link } from 'react-router-dom';

type BatchFormValues = Omit<CreateBatchInput, 'academyId'>;

const DEFAULT_BATCH_FORM: BatchFormValues = {
  name: '',
  ageGroup: '',
  description: '',
  trainingDays: '',
  trainingTime: '',
  coachId: '',
  startTime: '',
  endTime: '',
};

export default function BatchesPage() {
  const { academyId } = useActiveAcademy();
  const canManage = useCan('batches:manage');

  const batchesQuery = useBatches(academyId);
  const membersQuery = useAcademyMembers(academyId, { status: 'active' });

  const createBatch = useCreateBatch(academyId as string);
  const deleteBatch = useDeleteBatch(academyId as string);

  const pushToast = useUiStore((state) => state.pushToast);

  const [showForm, setShowForm] = useState(false);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day],
    );
  };

  const coaches = useMemo(
    () => membersQuery.data?.filter((member) => member.role === 'coach') ?? [],
    [membersQuery.data],
  );

  const {
    register,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<BatchFormValues>({
    defaultValues: DEFAULT_BATCH_FORM,
  });

  const handleCreate = handleSubmit(async (value) => {
    await createBatch.mutateAsync({
      academyId: academyId as string,
      name: value.name,
      ageGroup: value.ageGroup,
      description: value.description || null,
      trainingDays: selectedDays.join(', '),
      trainingTime: `${value.startTime} - ${value.endTime}`,
      coachId: value.coachId,
      startTime: value.startTime,
      endTime: value.endTime,
    });

    pushToast({
      title: 'Batch created',
      variant: 'success',
    });

    reset(DEFAULT_BATCH_FORM);
    setSelectedDays([]);
    setShowForm(false);
  });

  const handleDelete = async (batchId: string) => {
    await deleteBatch.mutateAsync({ batchId });

    pushToast({
      title: 'Batch deleted',
      variant: 'success',
    });
  };

  if (!academyId) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-fg text-xl font-semibold">Batches</h1>

          <p className="text-fg-muted">Create and manage your academy training groups.</p>
        </div>

        {canManage ? (
          <Button onClick={() => setShowForm((open) => !open)}>
            {showForm ? 'Hide form' : 'New batch'}
          </Button>
        ) : null}
      </div>

      {showForm && canManage ? (
        <Card>
          <form onSubmit={handleCreate} noValidate>
            <CardHeader title="Create batch" description="Set up a training group with a coach." />

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
                    {days.map((day) => (
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
                    <Select {...register('startTime')}>
                      <option value="">Start time</option>

                      {Array.from({ length: 24 }).map((_, hour) =>
                        ['00', '30'].map((minute) => {
                          const h = hour % 12 || 12;
                          const ampm = hour < 12 ? 'AM' : 'PM';
                          const value = `${h}:${minute} ${ampm}`;

                          return (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          );
                        }),
                      )}
                    </Select>

                    <Select {...register('endTime')}>
                      <option value="">End time</option>

                      {Array.from({ length: 24 }).map((_, hour) =>
                        ['00', '30'].map((minute) => {
                          const h = hour % 12 || 12;
                          const ampm = hour < 12 ? 'AM' : 'PM';
                          const value = `${h}:${minute} ${ampm}`;

                          return (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          );
                        }),
                      )}
                    </Select>
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
              <Button type="submit" isLoading={createBatch.isPending} disabled={!isDirty}>
                Create batch
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="All batches" description="See every training group in this academy." />

        <CardBody>
          {batchesQuery.isPending ? (
            <p className="text-fg-muted">Loading batches…</p>
          ) : batchesQuery.isError ? (
            <ErrorState error={batchesQuery.error} onRetry={() => void batchesQuery.refetch()} />
          ) : batchesQuery.data?.length === 0 ? (
            <EmptyState
              title="No batches yet"
              description="Create a batch to start assigning players and coaches."
            />
          ) : (
            <div className="space-y-3">
              {batchesQuery.data.map((batch) => (
                <div key={batch.id} className="border-border-subtle rounded-2xl border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Link
                        to={`/batches/${batch.id}`}
                        className="text-fg text-lg font-semibold hover:underline"
                      >
                        {batch.name}
                      </Link>

                      <p className="text-fg-muted text-sm">{batch.ageGroup}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-surface-muted text-fg-muted rounded-full px-3 py-1 text-xs font-medium">
                        {batch.playerCount} players
                      </span>

                      <span className="bg-surface-muted text-fg-muted rounded-full px-3 py-1 text-xs font-medium">
                        Coach: {batch.coach.fullName ?? batch.coach.email}
                      </span>

                      <span className="bg-surface-muted text-fg-muted rounded-full px-3 py-1 text-xs font-medium">
                        {batch.trainingDays} • {batch.trainingTime}
                      </span>
                    </div>
                  </div>

                  {canManage ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="danger"
                        size="sm"
                        isLoading={deleteBatch.isPending}
                        onClick={() => void handleDelete(batch.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
