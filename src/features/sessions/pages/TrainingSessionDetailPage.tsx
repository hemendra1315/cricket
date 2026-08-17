import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { useBatches } from '@/features/batches';
import { useCan } from '@/lib/rbac';
import { useUiStore } from '@/stores';
import { isUUID } from '@/lib/validators';
import type { TrainingSession } from '../api/sessionsTypes';
import {
  useDeleteTrainingSession,
  useTrainingSession,
  useUpdateTrainingSession,
} from '../hooks/useSessions';
import { formatDate, formatDateTime } from '@/lib/utils/date';

type SessionFormValues = {
  batchId: string;
  title: string;
  focusArea: string;
  sessionDate: string;
  startAt: string;
  endAt: string;
  coachId: string;
  notes: string;
};

export default function TrainingSessionDetailPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { academyId } = useActiveAcademy();
  const sessionQuery = useTrainingSession(sessionId ?? null, academyId);
  const deleteSession = useDeleteTrainingSession(academyId as string);
  const updateSession = useUpdateTrainingSession(academyId as string);
  const canManage = useCan('sessions:manage');
  const pushToast = useUiStore((state) => state.pushToast);
  const [showEditForm, setShowEditForm] = useState(false);

  const session = sessionQuery.data;

  const handleDelete = async () => {
    if (!sessionId) return;
    try {
      await deleteSession.mutateAsync({ sessionId });
      pushToast({ title: 'Session deleted', variant: 'success' });
      navigate('/sessions');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete session';
      pushToast({ title: 'Failed to delete session', description: msg, variant: 'error' });
    }
  };

  const handleStatusChange = async (status: 'completed' | 'cancelled') => {
    if (!sessionId || !session) return;
    try {
      await updateSession.mutateAsync({
        sessionId,
        input: {
          batchId: session.batchId,
          title: session.title,
          focusArea: session.focusArea,
          sessionDate: session.sessionDate,
          startAt: session.startAt,
          endAt: session.endAt,
          coachId: session.coachId,
          status,
          notes: session.notes,
        },
      });
      pushToast({
        title: status === 'completed' ? 'Session marked completed' : 'Session cancelled',
        variant: 'success',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update session status';
      pushToast({ title: 'Failed to update session status', description: msg, variant: 'error' });
    }
  };

  if (!academyId || !sessionId || !isUUID(sessionId)) {
    return (
      <EmptyState
        title={!sessionId || !academyId ? 'No session selected' : 'Invalid session link'}
        description={
          !sessionId || !academyId
            ? 'Select a session from the sessions list to view its details.'
            : 'The session link you followed is not valid. Please return to the sessions list.'
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-fg text-xl font-semibold">Session details</h1>
          <p className="text-fg-muted">Review the session and make updates.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canManage ? (
            <Button variant="secondary" size="sm" onClick={() => setShowEditForm((open) => !open)}>
              {showEditForm ? 'Cancel edit' : 'Edit session'}
            </Button>
          ) : null}
          <Button variant="secondary" size="sm" onClick={() => void navigate('/sessions')}>
            Back to sessions
          </Button>
        </div>
      </div>

      {sessionQuery.isPending ? (
        <p className="text-fg-muted">Loading session…</p>
      ) : sessionQuery.isError ? (
        <ErrorState error={sessionQuery.error} onRetry={() => void sessionQuery.refetch()} />
      ) : !session ? (
        <EmptyState
          title="Session not found"
          description="This session does not exist or you do not have access."
        />
      ) : (
        <>
          <Card>
            <CardHeader title={session.title} description={session.batch.name} />
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-fg-muted text-xs tracking-wide uppercase">Date</p>
                <p className="text-fg text-base font-medium">{formatDate(session.sessionDate)}</p>
              </div>
              <div>
                <p className="text-fg-muted text-xs tracking-wide uppercase">Time</p>
                <p className="text-fg text-base font-medium">
                  {formatDateTime(session.startAt)} – {formatDateTime(session.endAt)}
                </p>
              </div>
              <div>
                <p className="text-fg-muted text-xs tracking-wide uppercase">Coach</p>
                <p className="text-fg text-base font-medium">
                  {session.coach.fullName ?? session.coach.email}
                </p>
              </div>
              <div>
                <p className="text-fg-muted text-xs tracking-wide uppercase">Status</p>
                <p className="text-fg text-base font-medium">{session.status}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-fg-muted text-xs tracking-wide uppercase">Focus area</p>
                <p className="text-fg text-base font-medium">
                  {session.focusArea ?? 'Not specified'}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-fg-muted text-xs tracking-wide uppercase">Notes</p>
                <p className="text-fg text-base font-medium">
                  {session.notes ?? 'No notes added.'}
                </p>
              </div>
            </CardBody>
            {canManage ? (
              <CardBody className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void navigate(`/sessions/${session.id}/attendance`)}
                  >
                    Manage attendance
                  </Button>
                  {session.status === 'scheduled' ? (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={updateSession.isPending}
                        onClick={() => void handleStatusChange('completed')}
                      >
                        Mark completed
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        isLoading={updateSession.isPending}
                        onClick={() => void handleStatusChange('cancelled')}
                      >
                        Cancel session
                      </Button>
                    </>
                  ) : null}
                </div>
                <Button
                  variant="danger"
                  onClick={() => void handleDelete()}
                  isLoading={deleteSession.isPending}
                >
                  Delete session
                </Button>
              </CardBody>
            ) : null}
          </Card>

          {showEditForm && canManage ? (
            <SessionEditForm
              session={session}
              updateSession={updateSession}
              onSuccess={() => {
                setShowEditForm(false);
                pushToast({ title: 'Session updated', variant: 'success' });
              }}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

function SessionEditForm({
  session,
  updateSession,
  onSuccess,
}: {
  session: TrainingSession;
  updateSession: ReturnType<typeof useUpdateTrainingSession>;
  onSuccess: () => void;
}) {
  const { academyId } = useActiveAcademy();
  const batchesQuery = useBatches(academyId);
  const membersQuery = useAcademyMembers(academyId, { status: 'active' });

  const coaches = membersQuery.data?.filter((member) => member.role === 'coach') ?? [];

  const pushToast = useUiStore((state) => state.pushToast);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SessionFormValues>({
    defaultValues: {
      batchId: session.batchId,
      title: session.title,
      focusArea: session.focusArea ?? '',
      sessionDate: session.sessionDate,
      startAt: session.startAt,
      endAt: session.endAt,
      coachId: session.coachId,
      notes: session.notes ?? '',
    },
  });

  const handleSubmitEdit = handleSubmit(async (values) => {
    try {
      await updateSession.mutateAsync({
        sessionId: session.id,
        input: {
          batchId: values.batchId,
          title: values.title,
          focusArea: values.focusArea || null,
          sessionDate: values.sessionDate,
          startAt: values.startAt,
          endAt: values.endAt,
          coachId: values.coachId,
          status: session.status,
          notes: values.notes || null,
        },
      });
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update session';
      pushToast({ title: 'Update Failed', description: msg, variant: 'error' });
    }
  });

  return (
    <Card>
      <form onSubmit={handleSubmitEdit} noValidate>
        <CardHeader title="Edit session" description="Update the session details." />
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
              {errors.title ? <p className="text-danger text-xs">{errors.title.message}</p> : null}
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

          <div>
            <label className="text-fg block text-sm font-medium">Notes</label>
            <Textarea {...register('notes')} rows={4} />
          </div>
        </CardBody>
        <CardFooter>
          <Button type="submit" isLoading={updateSession.isPending} disabled={!isDirty}>
            Save changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
