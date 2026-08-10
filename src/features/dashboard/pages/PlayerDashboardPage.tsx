import { Link } from 'react-router-dom';

import { Card, CardBody, CardHeader, Badge } from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/feedback';
import { useActiveAcademy } from '@/features/academies';
import { usePlayerDashboardAnalytics } from '../hooks/useDashboardAnalytics';
import { SimpleBarChart, SimpleLineChart } from '@/components/charts/SimpleBarChart';
import { SessionRow } from '../components/SessionRow';

export default function PlayerDashboardPage() {
  const { academyId, membership } = useActiveAcademy();
  const playerId = membership?.id ?? null;
  const isPlayer = membership?.role === 'player';

  const analyticsQuery = usePlayerDashboardAnalytics(academyId, isPlayer ? playerId : null);

  const analytics = analyticsQuery.data;

  if (!isPlayer) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-fg text-xl font-semibold">My dashboard</h1>
          <p className="text-fg-muted text-sm">{membership?.academyName ?? 'Academy'}</p>
        </div>
        <EmptyState
          title="Player Dashboard Reserved for Players"
          description="You are currently signed in as an Academy Owner or Coach. Switch to a registered player account to access player statistics and personal training performance."
        />
      </div>
    );
  }

  if (analyticsQuery.isPending) {
    return <p className="text-fg-muted">Loading dashboard…</p>;
  }

  if (analyticsQuery.isError || !analytics) {
    return (
      <ErrorState error={analyticsQuery.error} onRetry={() => void analyticsQuery.refetch()} />
    );
  }

  const stats = analytics.stats;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-fg text-xl font-semibold">My dashboard</h1>
        <p className="text-fg-muted text-sm">{membership?.academyName ?? 'Academy'}</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-7">
          <Card>
            <CardBody className="min-w-0 py-3">
              <p className="text-fg-muted text-xs tracking-wide uppercase">Matches</p>
              <p className="text-fg truncate text-lg font-semibold">{stats.matchesPlayed}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="min-w-0 py-3">
              <p className="text-fg-muted text-xs tracking-wide uppercase">Runs</p>
              <p className="text-fg truncate text-lg font-semibold">{stats.battingRuns}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="min-w-0 py-3">
              <p className="text-fg-muted text-xs tracking-wide uppercase">Wickets</p>
              <p className="text-fg truncate text-lg font-semibold">{stats.bowlingWickets}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="min-w-0 py-3">
              <p className="text-fg-muted text-xs tracking-wide uppercase">Batting Avg</p>
              <p className="text-fg truncate text-lg font-semibold">{stats.battingAverage}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="min-w-0 py-3">
              <p className="text-fg-muted text-xs tracking-wide uppercase">Strike Rate</p>
              <p className="text-fg truncate text-lg font-semibold">{stats.strikeRate}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="min-w-0 py-3">
              <p className="text-fg-muted text-xs tracking-wide uppercase">Economy</p>
              <p className="text-fg truncate text-lg font-semibold">{stats.economy}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="min-w-0 py-3">
              <p className="text-fg-muted text-xs tracking-wide uppercase">Attendance %</p>
              <p className="text-fg truncate text-lg font-semibold">
                {stats?.attendancePercentage ?? 0}%
              </p>
            </CardBody>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader title="Upcoming Training" description="Your next scheduled sessions" />
        <CardBody>
          {analytics.upcomingSessions?.length === 0 ? (
            <p className="text-fg-muted">No upcoming sessions.</p>
          ) : (
            <div className="space-y-3">
              {analytics.upcomingSessions.map((session) => (
                <SessionRow key={session.id} session={session} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Recent Form" description="Last 5 matches" />
        <CardBody>
          {analytics.recentMatches?.length === 0 ? (
            <p className="text-fg-muted">No matches played yet.</p>
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
                      {new Date(match.matchDate).toLocaleDateString()} • {match.opponentName}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {match.batting && (
                      <span className="bg-surface-muted rounded-full px-2 py-1 text-xs">
                        {match.batting.runs} ({match.batting.balls})
                      </span>
                    )}
                    {match.bowling && (
                      <span className="bg-surface-muted rounded-full px-2 py-1 text-xs">
                        {match.bowling.wickets}/{match.bowling.runsConceded}
                      </span>
                    )}
                    {match.awards?.playerOfMatch && <Badge tone="success">POM</Badge>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Assigned Drills" description="Pending and completed" />
          <CardBody>
            {analytics.pendingAssignments?.length === 0 &&
            analytics.completedAssignments?.length === 0 ? (
              <p className="text-fg-muted">No drills assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {analytics.pendingAssignments?.length > 0 && (
                  <div>
                    <p className="text-fg-muted mb-2 text-sm font-medium">Pending</p>
                    {analytics.pendingAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="border-border-subtle rounded-xl border p-3"
                      >
                        <p className="text-fg font-medium">{assignment.drill.name}</p>
                        <p className="text-fg-muted text-sm">{assignment.drill.category}</p>
                        {assignment.dueDate && (
                          <p className="text-fg-muted text-xs">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {analytics.completedAssignments?.length > 0 && (
                  <div>
                    <p className="text-fg-muted mb-2 text-sm font-medium">Completed</p>
                    {analytics.completedAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="border-border-subtle rounded-xl border p-3"
                      >
                        <p className="text-fg font-medium">{assignment.drill.name}</p>
                        <p className="text-fg-muted text-sm">{assignment.drill.category}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Awards" description="Recent achievements" />
          <CardBody>
            {analytics.recentAwards?.length === 0 ? (
              <p className="text-fg-muted">No awards yet.</p>
            ) : (
              <div className="space-y-3">
                {analytics.recentAwards.map((award) => (
                  <Link
                    key={award.id}
                    to={`/matches/${award.matchId}`}
                    className="border-border-subtle hover:border-primary/40 flex items-center justify-between rounded-xl border p-3 transition"
                  >
                    <div>
                      <p className="text-fg font-medium">{award.matchName}</p>
                      <p className="text-fg-muted text-sm">
                        {award.matchDate ? new Date(award.matchDate).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <Badge tone="success">Award</Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {analytics.careerHighlights?.length > 0 && (
        <Card>
          <CardHeader title="Career Highlights" />
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {analytics.careerHighlights.map((highlight, index: number) => (
                <Badge key={index} tone="brand">
                  {highlight.label}
                </Badge>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {analytics.runsTrend?.length > 0 && (
        <Card>
          <CardHeader title="Performance Trends" />
          <CardBody>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <h4 className="text-fg-muted mb-2 text-sm font-medium">Runs Trend</h4>
                <SimpleBarChart
                  data={analytics.runsTrend.map((m) => ({
                    label: m.matchDate ? new Date(m.matchDate).toLocaleDateString() : '',
                    value: m.runs,
                  }))}
                  height={200}
                />
              </div>
              <div>
                <h4 className="text-fg-muted mb-2 text-sm font-medium">Attendance Trend</h4>
                <SimpleLineChart
                  data={[
                    { label: 'Jan', value: 85 },
                    { label: 'Feb', value: 78 },
                    { label: 'Mar', value: 92 },
                    { label: 'Apr', value: 88 },
                    { label: 'May', value: 95 },
                  ]}
                  height={200}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
