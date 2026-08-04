import { useNavigate, useParams } from 'react-router-dom';

import { Button, Card, CardBody, CardHeader } from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/feedback';
import { useActiveAcademy } from '@/features/academies';
import { useCan } from '@/lib/rbac';
import { useDeleteTrainingSession, useTrainingSession } from '../hooks/useSessions';
import { formatDate, formatDateTime } from '@/lib/utils/date';

export default function TrainingSessionDetailPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { academyId } = useActiveAcademy();
  const sessionQuery = useTrainingSession(sessionId ?? null, academyId);
  const deleteSession = useDeleteTrainingSession(academyId as string);
  const canManage = useCan('sessions:manage');

  const session = sessionQuery.data;

  const handleDelete = async () => {
    if (!sessionId) return;
    await deleteSession.mutateAsync({ sessionId });
    navigate('/sessions');
  };

  if (!academyId || !sessionId) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-fg text-xl font-semibold">Session details</h1>
          <p className="text-fg-muted">Review the session and make updates.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => void navigate('/sessions')}>
          Back to sessions
        </Button>
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
              <p className="text-fg text-base font-medium">{session.notes ?? 'No notes added.'}</p>
            </div>
          </CardBody>
          {canManage ? (
            <CardBody className="flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void navigate(`/sessions/${session.id}/attendance`)}
              >
                Manage attendance
              </Button>
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
      )}
    </div>
  );
}
