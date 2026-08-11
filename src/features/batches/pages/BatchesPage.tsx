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
  Modal,
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
  const [batchToDelete, setBatchToDelete] = useState<{ id: string; name: string } | null>(null);

  const coaches = useMemo(
    () =>
      membersQuery.data?.filter(
        (member) => member.role === 'coach' || member.role === 'academy_owner',
      ) ?? [],
    [membersQuery.data],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BatchFormValues>({ defaultValues: DEFAULT_BATCH_FORM });

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day],
    );
  };

  const handleCreate = handleSubmit(
    async (value) => {
      const formattedTime =
        startTime && endTime
          ? `${startTime.toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })} - ${endTime.toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })}`
          : '';

      const formattedDays = selectedDays.length > 0 ? selectedDays.join(', ') : '';

      try {
        await createBatch.mutateAsync({
          academyId: academyId as string,
          name: value.name,
          ageGroup: value.ageGroup,
          description: value.description || null,
          trainingDays: formattedDays || null,
          trainingTime: formattedTime || null,
          coachId: value.coachId || null,
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
          description: error instanceof Error ? error.message : String(error),
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

  const handleConfirmDelete = async () => {
    if (!batchToDelete) return;
    await deleteBatch.mutateAsync({ batchId: batchToDelete.id });
    pushToast({ title: `${batchToDelete.name} deleted`, variant: 'success' });
    setBatchToDelete(null);
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
                  label: showForm ? 'Cancel' : 'New Batch',
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
          <h1 className="text-fg text-xl font-bold">Batches</h1>
          <p className="text-fg-muted text-sm">Create and manage your academy training groups.</p>
        </div>
        {canManage ? (
          <Button onClick={() => setShowForm((open) => !open)} className="min-h-[44px]">
            {showForm ? 'Cancel' : 'New Batch'}
          </Button>
        ) : null}
      </div>

      {showForm && canManage ? (
        <Card>
          <form onSubmit={handleCreate} noValidate>
            <CardHeader
              title="Create Batch"
              description="Set up a new training group with schedule & coach."
            />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-fg block text-sm font-medium">Batch name</label>
                  <Input
                    className="h-12 min-h-[44px]"
                    {...register('name', { required: 'Batch name is required' })}
                    hasError={Boolean(errors.name)}
                  />
                  {errors.name ? (
                    <p className="text-danger mt-1 text-xs">{errors.name.message}</p>
                  ) : null}
                </div>
                <div>
                  <label className="text-fg block text-sm font-medium">Age group</label>
                  <Input
                    className="h-12 min-h-[44px]"
                    {...register('ageGroup', { required: 'Age group is required' })}
                    hasError={Boolean(errors.ageGroup)}
                  />
                  {errors.ageGroup ? (
                    <p className="text-danger mt-1 text-xs">{errors.ageGroup.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-fg block text-sm font-medium">
                  Training days{' '}
                  <span className="text-fg-muted text-xs font-normal">(Optional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <Button
                      key={day}
                      type="button"
                      variant={selectedDays.includes(day) ? 'primary' : 'secondary'}
                      size="sm"
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
                  Assign coach <span className="text-fg-muted text-xs font-normal">(Optional)</span>
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
                <TimeRangePicker
                  label="Training time (Optional)"
                  startTime={startTime}
                  endTime={endTime}
                  onStartTimeChange={setStartTime}
                  onEndTimeChange={setEndTime}
                />
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
                isLoading={createBatch.isPending}
                className="h-12 min-h-[48px] w-full font-semibold sm:w-auto"
              >
                Create Batch
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : null}

      <Card>
        <CardHeader
          title="All Batches"
          description="See every training group in this academy."
          className="hidden md:block"
        />
        <CardBody className="p-3 sm:p-4">
          {batchesQuery.isPending ? (
            <p className="text-fg-muted py-6 text-center">Loading batches…</p>
          ) : batchesQuery.isError ? (
            <ErrorState error={batchesQuery.error} onRetry={() => void batchesQuery.refetch()} />
          ) : filteredBatches.length === 0 ? (
            <MobileEmptyState
              title="No batches found"
              description="Create your first training batch to organize players."
              action={
                canManage ? { label: 'Create Batch', onClick: () => setShowForm(true) } : undefined
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredBatches.map((batch) => (
                <div
                  key={batch.id}
                  className="border-border-subtle bg-surface hover:border-border rounded-2xl border p-4 shadow-2xs transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/batches/${batch.id}`}
                        className="text-fg block truncate text-base font-bold hover:underline"
                      >
                        {batch.name}
                      </Link>
                      <span className="text-primary bg-primary/10 mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-bold">
                        {batch.ageGroup}
                      </span>
                    </div>

                    <span className="bg-surface-elevated text-fg border-border-subtle shrink-0 rounded-full border px-3 py-1 text-xs font-semibold">
                      {batch.playerCount ?? 0} Players
                    </span>
                  </div>

                  <div className="text-fg-muted mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                    {batch.trainingDays ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-fg font-semibold">Schedule:</span>
                        <span className="truncate">
                          {batch.trainingDays} {batch.trainingTime ? `• ${batch.trainingTime}` : ''}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex items-center gap-1.5">
                      <span className="text-fg font-semibold">Coach:</span>
                      <span className="truncate">{batch.coach.fullName ?? batch.coach.email}</span>
                    </div>
                  </div>

                  <div className="border-border-subtle mt-4 flex items-center justify-between gap-2 border-t pt-3">
                    <Link
                      to={`/batches/${batch.id}`}
                      className="text-primary inline-flex min-h-[44px] items-center text-xs font-bold hover:underline"
                    >
                      View Batch & Roster →
                    </Link>

                    {canManage ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setBatchToDelete({ id: batch.id, name: batch.name })}
                        className="text-danger hover:bg-danger/10 h-10 min-h-[44px] px-3 font-semibold"
                      >
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Delete Batch Confirmation Dialog */}
      <Modal
        open={Boolean(batchToDelete)}
        onClose={() => setBatchToDelete(null)}
        title="Delete Training Batch"
        footer={
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setBatchToDelete(null)}
              className="h-12 min-h-[48px] w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={deleteBatch.isPending}
              onClick={() => void handleConfirmDelete()}
              className="h-12 min-h-[48px] w-full font-semibold sm:w-auto"
            >
              Confirm Delete
            </Button>
          </div>
        }
      >
        <p className="text-fg text-sm">
          Are you sure you want to delete{' '}
          <strong className="text-fg font-bold">{batchToDelete?.name}</strong>? This action will
          unassign all players from this batch.
        </p>
      </Modal>
    </div>
  );
}
