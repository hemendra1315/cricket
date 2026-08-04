import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

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
import type { UUID } from '@/types';
import type { CreateTrainingSessionInput } from '../api/sessionsTypes';
import { useBatches } from '@/features/batches';
import { useCreateTrainingSession, useTrainingSessions } from '../hooks/useSessions';
import { formatDate, formatTime } from '@/lib/utils/date';

type FormValues = Omit<CreateTrainingSessionInput, 'academyId'>;

const DEFAULT_FORM_VALUES: FormValues = {
  batchId: '',
  title: '',
  focusArea: null,
  sessionDate: '',
  startAt: '',
  endAt: '',
  coachId: '',
  status: 'scheduled',
  notes: null,
};

export default function TrainingSessionsPage() {
  const { academyId } = useActiveAcademy();
  const canManage = useCan('sessions:manage');
  const sessionsQuery = useTrainingSessions(academyId);
  const batchesQuery = useBatches(academyId);
  const membersQuery = useAcademyMembers(academyId, { status: 'active' });
  const createSession = useCreateTrainingSession(academyId as UUID);
  const pushToast = useUiStore((state) => state.pushToast);
  const [showForm, setShowForm] = useState(false);

  const coaches = useMemo(
    () => membersQuery.data?.filter((member) => member.role === 'coach') ?? [],
    [membersQuery.data],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({ defaultValues: DEFAULT_FORM_VALUES });

  const handleCreate = handleSubmit(async (values) => {
    if (!academyId) return;
    await createSession.mutateAsync({
      academyId,
      batchId: values.batchId,
      title: values.title,
      focusArea: values.focusArea,
      sessionDate: values.sessionDate,
      startAt: values.startAt,
      endAt: values.endAt,
      coachId: values.coachId,
      status: values.status,
      notes: values.notes,
    });
    pushToast({ title: 'Session created', variant: 'success' });
    reset(DEFAULT_FORM_VALUES);
    setShowForm(false);
  });

  if (!academyId) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-fg text-xl font-semibold">Training sessions</h1>
          <p className="text-fg-muted">Schedule and manage sessions for your batches.</p>
        </div>
        {canManage ? (
          <Button onClick={() => setShowForm((open) => !open)}>
            {showForm ? 'Cancel' : 'New session'}
          </Button>
        ) : null}
      </div>

      {showForm && canManage ? (
        <Card>
          <form onSubmit={handleCreate} noValidate>
            <CardHeader
              title="Create session"
              description="Schedule a training session for a batch."
            />
            <CardBody className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-fg block text-sm font-medium">Batch</label>
                  <Select
                    {...register('batchId', { required: 'Batch is required' })}
                    hasError={Boolean(errors.batchId)}
                  >
                    <option value="">Select batch</option>
                    {batchesQuery.data?.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name}
                      </option>
                    ))}
                  </Select>
                  {errors.batchId ? (
                    <p className="text-danger text-xs">{errors.batchId.message}</p>
                  ) : null}
                </div>

                <div>
                  <label className="text-fg block text-sm font-medium">Coach</label>
                  <Select
                    {...register('coachId', { required: 'Coach is required' })}
                    hasError={Boolean(errors.coachId)}
                  >
                    <option value="">Select coach</option>
                    {coaches.map((coach) => (
                      <option key={coach.id} value={coach.id}>
                        {coach.fullName ?? coach.email}
                      </option>
                    ))}
                  </Select>
                  {errors.coachId ? (
                    <p className="text-danger text-xs">{errors.coachId.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-fg block text-sm font-medium">Title</label>
                  <Input
                    {...register('title', { required: 'Title is required' })}
                    hasError={Boolean(errors.title)}
                  />
                  {errors.title ? (
                    <p className="text-danger text-xs">{errors.title.message}</p>
                  ) : null}
                </div>
                <div>
                  <label className="text-fg block text-sm font-medium">Focus area</label>
                  <Input {...register('focusArea')} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-fg block text-sm font-medium">Session date</label>
                  <Input
                    {...register('sessionDate', { required: 'Session date is required' })}
                    type="date"
                    hasError={Boolean(errors.sessionDate)}
                  />
                  {errors.sessionDate ? (
                    <p className="text-danger text-xs">{errors.sessionDate.message}</p>
                  ) : null}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-fg block text-sm font-medium">Start time</label>
                    <Input
                      {...register('startAt', { required: 'Start time is required' })}
                      type="datetime-local"
                      hasError={Boolean(errors.startAt)}
                    />
                    {errors.startAt ? (
                      <p className="text-danger text-xs">{errors.startAt.message}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="text-fg block text-sm font-medium">End time</label>
                    <Input
                      {...register('endAt', { required: 'End time is required' })}
                      type="datetime-local"
                      hasError={Boolean(errors.endAt)}
                    />
                    {errors.endAt ? (
                      <p className="text-danger text-xs">{errors.endAt.message}</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-fg block text-sm font-medium">Status</label>
                  <Select {...register('status')}>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-fg block text-sm font-medium">Notes</label>
                <Textarea {...register('notes')} rows={4} />
              </div>
            </CardBody>
            <CardFooter>
              <Button type="submit" isLoading={createSession.isPending} disabled={!isDirty}>
                Create session
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="All sessions" description="Upcoming and recently completed sessions." />
        <CardBody>
          {sessionsQuery.isPending ? (
            <p className="text-fg-muted">Loading sessions…</p>
          ) : sessionsQuery.isError ? (
            <ErrorState error={sessionsQuery.error} onRetry={() => void sessionsQuery.refetch()} />
          ) : sessionsQuery.data?.length === 0 ? (
            <EmptyState
              title="No sessions scheduled"
              description="Create a session to get started."
            />
          ) : (
            <div className="space-y-3">
              {sessionsQuery.data.map((session) => (
                <Link
                  key={session.id}
                  to={`/sessions/${session.id}`}
                  className="border-border-subtle hover:border-primary/40 block rounded-2xl border p-4 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-fg text-lg font-semibold">{session.title}</p>
                      <p className="text-fg-muted text-sm">{session.batch.name}</p>
                    </div>
                    <span className="text-fg-muted text-sm">{session.status}</span>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div>
                      <p className="text-fg-muted text-xs tracking-wide uppercase">Date</p>
                      <p className="text-fg text-sm">{formatDate(session.sessionDate)}</p>
                    </div>
                    <div>
                      <p className="text-fg-muted text-xs tracking-wide uppercase">Time</p>
                      <p className="text-fg text-sm">
                        {formatTime(session.startAt)} – {formatTime(session.endAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-fg-muted text-xs tracking-wide uppercase">Coach</p>
                      <p className="text-fg text-sm">
                        {session.coach.fullName ?? session.coach.email}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
