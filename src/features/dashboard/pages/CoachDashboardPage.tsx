import { Link } from 'react-router-dom';

import { Card, CardBody, CardHeader, Badge } from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/feedback';
import { formatDate } from '@/lib/utils/date';
import { buttonStyles } from '@/components/ui/buttonStyles';
import { useActiveAcademy } from '@/features/academies';
import { useCoachDashboardAnalytics } from '../hooks/useDashboardAnalytics';
import { SuperAdminAcademyActions } from '@/features/admin';
import { DashboardQuickActions } from '../components/DashboardQuickActions';
import { ActivityFeed } from '../components/ActivityFeed';
import type { ActivityItem } from '../components/ActivityFeed';

export default function CoachDashboardPage() {
  const { academyId, membership } = useActiveAcademy();
  const coachId = membership?.id ?? null;
  const analyticsQuery = useCoachDashboardAnalytics(academyId, coachId);

  const analytics = analyticsQuery.data;

  if (analyticsQuery.isPending) {
    return <p className="text-fg-muted">Loading dashboard…</p>;
  }

  if (analyticsQuery.isError || !analytics) {
    return (
      <ErrorState error={analyticsQuery.error} onRetry={() => void analyticsQuery.refetch()} />
    );
  }

  const activities: ActivityItem[] = [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-fg text-2xl font-bold tracking-tight md:text-3xl">Coach Dashboard</h1>
        <p className="text-fg-muted mt-1 text-xs font-medium md:text-sm">
          {membership?.academyName ?? 'Academy'}
        </p>
      </div>

      <SuperAdminAcademyActions />
      <DashboardQuickActions />

      {analytics.todaySession && (
        <Card>
          <CardHeader title="Today's Session" description="Session scheduled for today" />
          <CardBody>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-fg text-lg font-semibold">{analytics.todaySession.title}</p>
                <p className="text-fg-muted text-sm">
                  {analytics.todaySession.startAt} - {analytics.todaySession.endAt}
                </p>
                {analytics.todaySession.batchName && (
                  <p className="text-fg-muted text-sm">Batch: {analytics.todaySession.batchName}</p>
                )}
              </div>
              <Link
                to={`/sessions/${analytics.todaySession.id}/attendance`}
                className={buttonStyles('primary', 'sm')}
              >
                Mark Attendance
              </Link>
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title="Team Performance" description="Last 5 matches summary" />
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <p className="text-fg-muted text-xs uppercase">Matches</p>
              <p className="text-fg text-2xl font-semibold">
                {analytics.recentMatches?.length ?? 0}
              </p>
            </div>
            <div>
              <p className="text-fg-muted text-xs uppercase">Wins</p>
              <p className="text-success text-2xl font-semibold">{analytics.wins}</p>
            </div>
            <div>
              <p className="text-fg-muted text-xs uppercase">Losses</p>
              <p className="text-danger text-2xl font-semibold">{analytics.losses}</p>
            </div>
            <div>
              <p className="text-fg-muted text-xs uppercase">Win Rate</p>
              <p className="text-fg text-2xl font-semibold">
                {analytics.recentMatches?.length > 0
                  ? Math.round((analytics.wins / analytics.recentMatches.length) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {analytics.playersNeedingAttention?.length > 0 && (
        <Card>
          <CardHeader
            title="Players Needing Attention"
            description="Low attendance, pending drills, or no recent feedback"
          />
          <CardBody>
            <div className="space-y-3">
              {analytics.playersNeedingAttention.map((player) => (
                <Link
                  key={player.id}
                  to={`/members/${player.id}`}
                  className="border-border-subtle hover:border-primary/40 flex flex-wrap items-center justify-between rounded-xl border p-3 transition"
                >
                  <div>
                    <p className="text-fg font-medium">{player.name}</p>
                    <p className="text-fg-muted text-sm">Attendance: {player.attendanceRate}%</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {player.issues.map((issue: string, idx: number) => (
                      <Badge key={idx} tone="warning">
                        {issue}
                      </Badge>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader
          title="Assigned Batches"
          description="Training groups you are coaching"
          action={
            <Link to="/batches" className={buttonStyles('ghost', 'sm')}>
              See all
            </Link>
          }
        />
        <CardBody>
          {analytics.assignedBatches?.length === 0 ? (
            <EmptyState
              title="No batches assigned"
              description="You are not coaching any batches yet."
            />
          ) : (
            <div className="space-y-3">
              {analytics.assignedBatches.map((batch) => (
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
          title="Recent Matches"
          action={
            <Link to="/matches" className={buttonStyles('ghost', 'sm')}>
              See all
            </Link>
          }
        />
        <CardBody>
          {analytics.recentMatches?.length === 0 ? (
            <p className="text-fg-muted">No matches yet.</p>
          ) : (
            <div className="space-y-3">
              {analytics.recentMatches.map((match) => (
                <Link
                  key={match.id}
                  to={`/matches/${match.id}`}
                  className="border-border-subtle hover:border-primary/40 flex flex-wrap items-center justify-between rounded-xl border p-3 transition"
                >
                  <div>
                    <p className="text-fg font-medium">{match.matchName}</p>
                    <p className="text-fg-muted text-sm">
                      {formatDate(match.matchDate)}
                      {match.opponentName ? ` · vs ${match.opponentName}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {match.teamScore && (
                      <span className="bg-surface-muted rounded-full px-2 py-1 text-xs">
                        {match.teamScore}
                      </span>
                    )}
                    {match.result && (
                      <Badge
                        tone={
                          match.result === 'won'
                            ? 'success'
                            : match.result === 'lost'
                              ? 'danger'
                              : 'warning'
                        }
                      >
                        {match.result}
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <ActivityFeed title="Recent Activity" activities={activities} />
    </div>
  );
}
