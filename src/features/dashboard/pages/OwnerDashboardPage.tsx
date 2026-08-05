import { Link } from 'react-router-dom';
import { useMemo } from 'react';

import { EmptyState, ErrorState } from '@/components/feedback';
import { buttonStyles, Card, CardBody, CardHeader } from '@/components/ui';
import { JoinCodeCard, useActiveAcademy } from '@/features/academies';
import { useAcademyMembers, usePendingJoinRequests } from '@/features/members';
import { useTrainingSessions } from '@/features/sessions';
import { isTodayOrUpcoming } from '@/lib/utils/date';
import { ROLE_LABELS } from '@/types/enums';
import type { TrainingSession } from '@/features/sessions/api/sessionsTypes';
import { SessionRow } from '../components/SessionRow';

const UPCOMING_LIMIT = 6;

/** Owner home: roster stats, pending requests and upcoming sessions. */
export default function OwnerDashboardPage() {
  const { academyId, membership } = useActiveAcademy();
  const members = useAcademyMembers(academyId);
  const pendingRequests = usePendingJoinRequests(academyId);
  const sessionsQuery = useTrainingSessions(academyId);

  const counts = useMemo(() => {
    const data = members.data ?? [];
    return {
      coaches: data.filter((member) => member.role === 'coach').length,
      players: data.filter((member) => member.role === 'player').length,
      pending: pendingRequests.data?.length ?? 0,
    };
  }, [members.data, pendingRequests.data]);

  const upcomingSessions = useMemo(
    () =>
      (sessionsQuery.data ?? [])
        .filter(
          (session) => isTodayOrUpcoming(session.sessionDate) && session.status !== 'cancelled',
        )
        .sort((a, b) => a.startAt.localeCompare(b.startAt))
        .slice(0, UPCOMING_LIMIT),
    [sessionsQuery.data],
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-fg text-xl font-semibold">{membership?.academyName ?? 'Academy'}</h1>
        <p className="text-fg-muted text-sm">
          {membership ? ROLE_LABELS[membership.role] : ''}
          {membership?.city ? ` · ${membership.city}` : ''}
        </p>
      </div>

      {academyId ? <JoinCodeCard academyId={academyId} /> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader title="Coaches" />
          <CardBody className="text-fg text-3xl font-semibold">{counts.coaches}</CardBody>
        </Card>
        <Card>
          <CardHeader title="Players" />
          <CardBody className="text-fg text-3xl font-semibold">{counts.players}</CardBody>
        </Card>
        <Card>
          <CardHeader title="Pending requests" />
          <CardBody className="text-fg text-3xl font-semibold">{counts.pending}</CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Quick links" description="Jump to the tools you use most." />
        <CardBody className="flex flex-wrap gap-3">
          <Link to="/batches" className={buttonStyles('secondary', 'sm')}>
            Manage batches
          </Link>
          <Link to="/sessions" className={buttonStyles('secondary', 'sm')}>
            Manage sessions
          </Link>
          <Link to="/members" className={buttonStyles('secondary', 'sm')}>
            Manage members
          </Link>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Upcoming sessions"
          description="Today's and upcoming training sessions."
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
          ) : sessionsQuery.data?.length === 0 ? (
            <EmptyState
              title="No sessions scheduled"
              description="Schedule a session to get started."
            />
          ) : upcomingSessions.length === 0 ? (
            <EmptyState
              title="No upcoming sessions"
              description="Sessions scheduled for today or later appear here."
            />
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((session: TrainingSession) => (
                <SessionRow key={session.id} session={session} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
