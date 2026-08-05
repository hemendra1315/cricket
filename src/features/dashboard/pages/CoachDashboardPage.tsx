import { Link } from 'react-router-dom';
import { useMemo } from 'react';

import { EmptyState, ErrorState } from '@/components/feedback';
import { buttonStyles, Card, CardBody, CardHeader } from '@/components/ui';
import { useActiveAcademy } from '@/features/academies';
import { useBatches } from '@/features/batches';
import { useTrainingSessions } from '@/features/sessions';
import { isToday, isTodayOrUpcoming } from '@/lib/utils/date';
import { SessionRow } from '../components/SessionRow';

const UPCOMING_LIMIT = 6;

/** Coach home: the batches you're coaching and the sessions you're running. */
export default function CoachDashboardPage() {
  const { academyId, membership } = useActiveAcademy();
  const coachId = membership?.id ?? null;
  const batchesQuery = useBatches(academyId);
  const sessionsQuery = useTrainingSessions(academyId);

  const assignedBatches = useMemo(
    () => batchesQuery.data?.filter((batch) => batch.coachId === coachId) ?? [],
    [batchesQuery.data, coachId],
  );

  const upcomingSessions = useMemo(
    () =>
      (sessionsQuery.data ?? [])
        .filter(
          (session) =>
            session.coachId === coachId &&
            isTodayOrUpcoming(session.sessionDate) &&
            session.status !== 'cancelled',
        )
        .sort((a, b) => a.startAt.localeCompare(b.startAt))
        .slice(0, UPCOMING_LIMIT),
    [sessionsQuery.data, coachId],
  );

  const todaySession = useMemo(
    () =>
      (sessionsQuery.data ?? [])
        .filter(
          (session) =>
            session.coachId === coachId &&
            isToday(session.sessionDate) &&
            session.status !== 'cancelled',
        )
        .sort((a, b) => a.startAt.localeCompare(b.startAt))[0] ?? null,
    [sessionsQuery.data, coachId],
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-fg text-xl font-semibold">Coach dashboard</h1>
        <p className="text-fg-muted text-sm">{membership?.academyName ?? 'Academy'}</p>
      </div>

      <Card>
        <CardHeader title="Quick links" description="Actions that need your attention." />
        <CardBody className="flex flex-wrap gap-3">
          <Link to="/batches" className={buttonStyles('secondary', 'sm')}>
            My batches
          </Link>
          {todaySession ? (
            <Link
              to={`/sessions/${todaySession.id}/attendance`}
              className={buttonStyles('primary', 'sm')}
            >
              Mark attendance: {todaySession.title}
            </Link>
          ) : (
            <Link to="/sessions" className={buttonStyles('primary', 'sm')}>
              Mark attendance
            </Link>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Assigned batches"
          description="Training groups you are coaching."
          action={
            <Link to="/batches" className={buttonStyles('ghost', 'sm')}>
              See all
            </Link>
          }
        />
        <CardBody>
          {batchesQuery.isPending ? (
            <p className="text-fg-muted">Loading batches…</p>
          ) : batchesQuery.isError ? (
            <ErrorState error={batchesQuery.error} onRetry={() => void batchesQuery.refetch()} />
          ) : assignedBatches.length === 0 ? (
            <EmptyState
              title="No batches assigned"
              description="You are not coaching any batches yet."
            />
          ) : (
            <div className="space-y-3">
              {assignedBatches.map((batch) => (
                <Link
                  key={batch.id}
                  to={`/batches/${batch.id}`}
                  className="border-border-subtle hover:border-primary/40 block rounded-2xl border p-4 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-fg text-lg font-semibold">{batch.name}</p>
                      <p className="text-fg-muted text-sm">{batch.ageGroup}</p>
                    </div>
                    <span className="text-fg-muted text-sm">{batch.playerCount} players</span>
                  </div>
                  <p className="text-fg-muted mt-1 text-sm">
                    {batch.trainingDays} · {batch.trainingTime}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Upcoming sessions"
          description="Sessions you are coaching today or later."
          action={
            <Link to="/sessions" className={buttonStyles('ghost', 'sm')}>
              See all
            </Link>
          }
        />
        <CardBody>
          {sessionsQuery.isPending ? (
            <p className="text-fg-muted">Loading sessions…</p>
          ) : sessionsQuery.isError ? (
            <ErrorState error={sessionsQuery.error} onRetry={() => void sessionsQuery.refetch()} />
          ) : upcomingSessions.length === 0 ? (
            <EmptyState title="No upcoming sessions" description="Nothing scheduled yet." />
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <SessionRow key={session.id} session={session} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
