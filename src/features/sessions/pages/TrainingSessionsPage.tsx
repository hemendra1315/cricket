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
import type { UUID } from '@/types';
import type { CreateTrainingSessionInput } from '../api/sessionsTypes';
import { useBatches } from '@/features/batches';
import { useCreateTrainingSession, useTrainingSessions } from '../hooks/useSessions';
import { formatDate, formatTime, isTimeRangeValid } from '@/lib/utils/date';

type FormValues = Omit<CreateTrainingSessionInput, 'academyId' | 'startAt' | 'endAt'>;

const DEFAULT_FORM_VALUES: FormValues = {
  batchId: '',
  title: '',
  focusArea: null,
  sessionDate: '',
  coachId: '',
  status: 'scheduled',
  notes: null,
};

function toIsoTimestamp(sessionDate: string, time: Date): string {
  const date = new Date(`${sessionDate}T00:00:00`);
  date.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return date.toISOString();
}

export default function TrainingSessionsPage() {
  const { academyId } = useActiveAcademy();
  const canManage = useCan('sessions:manage');
  const sessionsQuery = useTrainingSessions(academyId);
  const batchesQuery = useBatches(academyId);
  const membersQuery = useAcademyMembers(academyId, { status: 'active' });
  const createSession = useCreateTrainingSession(academyId as UUID);
  const pushToast = useUiStore((state) => state.pushToast);
  const [showForm, setShowForm] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

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

    if (!startTime || !endTime) {
      pushToast({
        title: 'Select training time',
        variant: 'error',
      });
      return;
    }

    if (!isTimeRangeValid(startTime, endTime)) {
      pushToast({
        title: 'End time must be after start time.',
        variant: 'error',
      });
      return;
    }

    try {
      await createSession.mutateAsync({
        academyId,
        batchId: values.batchId,
        title: values.title,
        focusArea: values.focusArea,
        sessionDate: values.sessionDate,
        startAt: toIsoTimestamp(values.sessionDate, startTime),
        endAt: toIsoTimestamp(values.sessionDate, endTime),
        coachId: values.coachId,
        status: values.status,
        notes: values.notes,
      });
      pushToast({ title: 'Session created', variant: 'success' });
      reset(DEFAULT_FORM_VALUES);
      setStartTime(null);
      setEndTime(null);
      setShowForm(false);
    } catch (error) {
      console.error('Create session failed:', error);
      pushToast({ title: 'Failed to create session', variant: 'error' });
    }
  });

  const [sessionFilter, setSessionFilter] = useState<'today' | 'upcoming' | 'completed' | 'all'>(
    'all',
  );

  const filteredSessions = useMemo(() => {
    if (!sessionsQuery.data) return [];
    const todayStr = new Date().toISOString().split('T')[0];
    if (sessionFilter === 'today') {
      return sessionsQuery.data.filter((s) => s.sessionDate === todayStr);
    }
    if (sessionFilter === 'upcoming') {
      return sessionsQuery.data.filter((s) => s.status === 'scheduled');
    }
    if (sessionFilter === 'completed') {
      return sessionsQuery.data.filter((s) => s.status === 'completed');
    }
    return sessionsQuery.data;
  }, [sessionsQuery.data, sessionFilter]);

  if (!academyId) return null;

  return (
    <div className="space-y-4 pb-24 md:pb-6">
      {/* Mobile Header */}
      <div className="md:hidden">
        <MobilePageHeader
          title="Sessions"
          count={sessionsQuery.data?.length}
          subtitle="Training schedules & attendance"
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
              { id: 'all', label: 'All', count: sessionsQuery.data?.length },
              { id: 'today', label: 'Today' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Completed' },
            ]}
            activeId={sessionFilter}
            onChange={setSessionFilter}
          />
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden flex-wrap items-center justify-between gap-3 md:flex">
        <div>
          <h1 className="text-fg text-xl font-semibold">Sessions</h1>
          <p className="text-fg-muted">Schedule and log academy training sessions.</p>
        </div>
        {canManage ? (
          <Button onClick={() => setShowForm((open) => !open)}>
            {showForm ? 'Hide form' : 'New session'}
          </Button>
        ) : null}
      </div>

      {showForm && canManage ? (
        <Card>
          <form onSubmit={handleCreate} noValidate>
            <CardHeader
              title="Create session"
              description="Schedule a practice or training session for a batch."
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
                        {batch.name} ({batch.ageGroup})
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
                <TimeRangePicker
                  label="Session time"
                  startTime={startTime}
                  endTime={endTime}
                  onStartTimeChange={setStartTime}
                  onEndTimeChange={setEndTime}
                />
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
        <CardHeader
          title="All sessions"
          description="Upcoming and recently completed sessions."
          className="hidden md:block"
        />
        <CardBody className="p-4">
          {sessionsQuery.isPending ? (
            <p className="text-fg-muted">Loading sessions…</p>
          ) : sessionsQuery.isError ? (
            <ErrorState error={sessionsQuery.error} onRetry={() => void sessionsQuery.refetch()} />
          ) : filteredSessions.length === 0 ? (
            <MobileEmptyState
              title="No sessions"
              description="No training sessions match your selected filter."
              action={
                canManage
                  ? { label: 'Create Session', onClick: () => setShowForm(true) }
                  : undefined
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="border-border-subtle bg-surface rounded-2xl border p-4 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        to={`/sessions/${session.id}`}
                        className="text-fg text-base font-semibold hover:underline"
                      >
                        {session.title}
                      </Link>
                      <p className="text-fg-muted mt-0.5 text-xs">
                        {formatDate(session.sessionDate)} • {formatTime(session.startAt)} -{' '}
                        {formatTime(session.endAt)}
                      </p>
                      {session.batch?.name && (
                        <p className="text-primary mt-1 text-xs font-medium">
                          Batch: {session.batch.name}
                        </p>
                      )}
                    </div>
                    {canManage ? (
                      <Link
                        to={`/sessions/${session.id}/attendance`}
                        className="bg-primary/10 text-primary hover:bg-primary/20 shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition"
                      >
                        Attendance
                      </Link>
                    ) : (
                      <Link
                        to={`/sessions/${session.id}`}
                        className="bg-surface-elevated text-fg-muted hover:text-fg shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition"
                      >
                        View Session
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
