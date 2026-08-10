import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import 'react-datepicker/dist/react-datepicker.css';
import { Link } from 'react-router-dom';

import { TimeRangePicker } from '@/components/form';
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
import { ErrorState } from '@/components/feedback';
import { MobilePageHeader, MobileFilterChips, MobileEmptyState } from '@/components/mobile';
import { useActiveAcademy } from '@/features/academies';
import { useAcademyMembers } from '@/features/members';
import { useCan } from '@/lib/rbac';
import { useUiStore } from '@/stores';
import type { CreateBatchInput } from '../api/batchesTypes';
import { useBatches, useCreateBatch, useDeleteBatch } from '../hooks/useBatches';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type BatchFormValues = Omit<CreateBatchInput, 'academyId'>;

const DEFAULT_BATCH_FORM: BatchFormValues = {
  name: '',
  ageGroup: '',
  description: '',
  trainingDays: '',
  trainingTime: '',
  coachId: '',
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
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const coaches = useMemo(
    () => membersQuery.data?.filter((member) => member.role === 'coach') ?? [],
    [membersQuery.data],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<BatchFormValues>({ defaultValues: DEFAULT_BATCH_FORM });

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day],
    );
  };

  const handleCreate = handleSubmit(
    async (value) => {
      if (!startTime || !endTime) {
        pushToast({
          title: 'Select training time',
          variant: 'error',
        });
        return;
      }

      try {
        await createBatch.mutateAsync({
          academyId: academyId as string,
          name: value.name,
          ageGroup: value.ageGroup,
          description: value.description || null,
          trainingDays: selectedDays.join(', '),
          trainingTime: `${startTime.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })} - ${endTime.toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}`,
          coachId: value.coachId,
        });

        pushToast({
          title: 'Batch created',
          variant: 'success',
        });

        reset(DEFAULT_BATCH_FORM);
        setStartTime(null);
        setEndTime(null);
        setSelectedDays([]);
        setShowForm(false);
      } catch (error) {
        console.error('Create batch failed:', error);

        pushToast({
          title: 'Failed to create batch',
          variant: 'error',
        });
      }
    },
    (errors) => {
      console.error('Form errors:', errors);

      pushToast({
        title: 'Please fill required fields',
        variant: 'error',
      });
    },
  );

  const handleDelete = async (batchId: string) => {
    await deleteBatch.mutateAsync({ batchId });
    pushToast({ title: 'Batch deleted', variant: 'success' });
  };

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>(
    'all',
  );

  const filteredBatches = useMemo(() => {
    if (!batchesQuery.data) return [];
    if (selectedFilter === 'all') return batchesQuery.data;
    return batchesQuery.data.filter((b) => {
      const time = (b.trainingTime || '').toLowerCase();
      if (selectedFilter === 'morning')
        return (
          time.includes('am') ||
          time.includes('06:') ||
          time.includes('07:') ||
          time.includes('08:') ||
          time.includes('09:')
        );
      if (selectedFilter === 'afternoon')
        return (
          time.includes('12:') ||
          time.includes('13:') ||
          time.includes('14:') ||
          time.includes('15:') ||
          time.includes('16:')
        );
      if (selectedFilter === 'evening')
        return (
          time.includes('17:') ||
          time.includes('18:') ||
          time.includes('19:') ||
          time.includes('20:') ||
          time.includes('pm')
        );
      return true;
    });
  }, [batchesQuery.data, selectedFilter]);

  if (!academyId) return null;

  return (
    <div className="space-y-4 pb-24 md:pb-6">
      {/* Mobile Page Header */}
      <div className="md:hidden">
        <MobilePageHeader
          title="Batches"
          count={batchesQuery.data?.length}
          subtitle="Training groups & squads"
          primaryAction={
            canManage
              ? {
                  label: showForm ? 'Hide' : 'New',
                  onClick: () => setShowForm((prev) => !prev),
                }
              : undefined
          }
        />
        <div className="mb-3 px-4">
          <MobileFilterChips
            options={[
              { id: 'all', label: 'All', count: batchesQuery.data?.length },
              { id: 'morning', label: 'Morning' },
              { id: 'afternoon', label: 'Afternoon' },
              { id: 'evening', label: 'Evening' },
            ]}
            activeId={selectedFilter}
            onChange={setSelectedFilter}
          />
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden flex-wrap items-center justify-between gap-3 md:flex">
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
                    {...register('name', { required: 'Batch name is required' })}
                    hasError={Boolean(errors.name)}
                  />
                  {errors.name ? (
                    <p className="text-danger text-xs">{errors.name.message}</p>
                  ) : null}
                </div>
                <div>
                  <label className="text-fg block text-sm font-medium">Age group</label>
                  <Input
                    {...register('ageGroup', { required: 'Age group is required' })}
                    hasError={Boolean(errors.ageGroup)}
                  />
                  {errors.ageGroup ? (
                    <p className="text-danger text-xs">{errors.ageGroup.message}</p>
                  ) : null}
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
                        size="sm"
                        onClick={() => toggleDay(day)}
                      >
                        {day}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-fg block text-sm font-medium">Assign coach</label>
                  <Select {...register('coachId', { required: 'Coach is required' })}>
                    <option value="">Select coach</option>
                    {coaches.map((coach) => (
                      <option key={coach.id} value={coach.id}>
                        {coach.fullName ?? coach.email}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <TimeRangePicker
                  label="Training time"
                  startTime={startTime}
                  endTime={endTime}
                  onStartTimeChange={setStartTime}
                  onEndTimeChange={setEndTime}
                />
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
        <CardHeader
          title="All batches"
          description="See every training group in this academy."
          className="hidden md:block"
        />
        <CardBody className="p-4">
          {batchesQuery.isPending ? (
            <p className="text-fg-muted">Loading batches…</p>
          ) : batchesQuery.isError ? (
            <ErrorState error={batchesQuery.error} onRetry={() => void batchesQuery.refetch()} />
          ) : filteredBatches.length === 0 ? (
            <MobileEmptyState
              title="No batches"
              description="Create your first batch to start organizing training."
              action={
                canManage ? { label: 'Create Batch', onClick: () => setShowForm(true) } : undefined
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="border-border-subtle bg-surface rounded-2xl border p-4 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <Link
                        to={`/batches/${batch.id}`}
                        className="text-fg text-base font-semibold hover:underline"
                      >
                        {batch.name}
                      </Link>
                      <p className="text-fg-muted mt-0.5 text-xs">{batch.ageGroup}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="bg-surface-muted text-fg-muted rounded-full px-2.5 py-0.5 text-xs font-medium">
                        {batch.playerCount ?? 0} players
                      </span>
                      <span className="bg-surface-muted text-fg-muted rounded-full px-2.5 py-0.5 text-xs font-medium">
                        {batch.coach.fullName ?? batch.coach.email}
                      </span>
                    </div>
                  </div>
                  {batch.trainingDays && (
                    <p className="text-fg-muted mt-2 text-xs font-medium">
                      {batch.trainingDays} • {batch.trainingTime}
                    </p>
                  )}
                  {canManage ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        isLoading={deleteBatch.isPending}
                        onClick={() => void handleDelete(batch.id)}
                        className="text-danger hover:bg-danger/10"
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
