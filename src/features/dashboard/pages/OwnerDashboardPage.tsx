import { Link } from 'react-router-dom';
import { useMemo } from 'react';

import { Card, CardBody, CardHeader, Badge } from '@/components/ui';
import { EmptyState, ErrorState } from '@/components/feedback';
import { formatDate } from '@/lib/utils/date';
import { buttonStyles } from '@/components/ui/buttonStyles';
import { useActiveAcademy } from '@/features/academies';
import { useOwnerDashboardAnalytics } from '../hooks/useDashboardAnalytics';
import { KpiCard } from '../components/KpiCard';
import { LeaderboardCard } from '../components/LeaderboardCard';
import { ActivityFeed } from '../components/ActivityFeed';
import { SessionRow } from '../components/SessionRow';
import { SimpleBarChart } from '@/components/charts/SimpleBarChart';
import { JoinCodeCard } from '@/features/academies';
import type { ActivityItem } from '../components/ActivityFeed';

export default function OwnerDashboardPage() {
  const { academyId, membership } = useActiveAcademy();
  const analyticsQuery = useOwnerDashboardAnalytics(academyId);

  const analytics = analyticsQuery.data;

  const weeklyAttendanceData = useMemo(() => {
    if (!analytics?.activities) return [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData: { day: string; attended: number; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()] as string;
      weekData.push({ day: dayName, attended: 0, total: 0 });
    }
    return weekData;
  }, [analytics]);

  const monthlyAttendanceData = useMemo(() => {
    return analytics?.monthlyAttendance ?? [];
  }, [analytics]);

  if (analyticsQuery.isPending) {
    return <p className="text-fg-muted">Loading dashboard…</p>;
  }

  if (analyticsQuery.isError || !analytics) {
    return (
      <ErrorState error={analyticsQuery.error} onRetry={() => void analyticsQuery.refetch()} />
    );
  }

  const activities: ActivityItem[] =
    analytics.activities?.map((a) => ({
      id: a.id,
      type: a.type,
      message: a.message,
      timestamp: a.timestamp,
    })) ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-fg text-xl font-semibold">{membership?.academyName ?? 'Academy'}</h1>
        <p className="text-fg-muted text-sm">
          {membership ? 'Owner' : ''}
          {membership?.city ? ` · ${membership.city}` : ''}
        </p>
      </div>

      {academyId ? <JoinCodeCard academyId={academyId} /> : null}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard title="Total Players" value={analytics.totalPlayers} />
        <KpiCard title="Active Coaches" value={analytics.totalCoaches} />
        <KpiCard title="Active Batches" value={analytics.totalBatches} />
        <KpiCard title="Total Matches" value={analytics.totalMatches} />
        <KpiCard title="Attendance %" value={`${analytics.attendancePercentage}%`} />
        <KpiCard title="Sessions This Week" value={analytics.sessionsThisWeek} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <LeaderboardCard
          title="Top Run Scorers"
          entries={
            analytics.topBatters?.map((b) => ({
              id: b.id,
              name: b.name,
              value: b.runs,
              secondaryValue: `Avg: ${b.average}`,
              href: b.href,
            })) ?? []
          }
          secondaryLabel="Average"
        />
        <LeaderboardCard
          title="Top Wicket Takers"
          entries={
            analytics.topBowlers?.map((b) => ({
              id: b.id,
              name: b.name,
              value: b.wickets,
              secondaryValue: `Econ: ${b.economy}`,
              href: b.href,
            })) ?? []
          }
          secondaryLabel="Economy"
        />
        <LeaderboardCard
          title="Top Fielders"
          entries={
            analytics.topFielders?.map((f) => ({
              id: f.id,
              name: f.name,
              value: f.catches,
              secondaryValue: `Run outs: ${f.runOuts}`,
              href: f.href,
            })) ?? []
          }
          secondaryLabel="Run Outs"
        />
      </div>

      {analytics.academyRecords?.length > 0 && (
        <Card>
          <CardHeader title="Academy Records" />
          <CardBody>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {analytics.academyRecords.map((record) => (
                <Link
                  key={record.id}
                  to={record.href}
                  className="border-border-subtle hover:border-primary/40 rounded-xl border p-4 transition"
                >
                  <p className="text-fg-muted text-xs uppercase">
                    {record.recordType.replace(/_/g, ' ')}
                  </p>
                  <p className="text-fg text-lg font-semibold">{record.value}</p>
                </Link>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Weekly Attendance" />
          <CardBody>
            {weeklyAttendanceData.some((d) => d.total > 0) ? (
              <SimpleBarChart
                data={weeklyAttendanceData.map((d) => ({
                  label: d.day,
                  value: d.total > 0 ? Math.round((d.attended / d.total) * 100) : 0,
                }))}
                height={200}
              />
            ) : (
              <EmptyState
                title="No attendance data yet"
                description="Attendance records will appear here once training sessions are marked."
              />
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Monthly Attendance" />
          <CardBody>
            {monthlyAttendanceData.some((d) => d.value > 0) ? (
              <SimpleBarChart data={monthlyAttendanceData} height={200} />
            ) : (
              <EmptyState
                title="No attendance data yet"
                description="Attendance records will appear here once training sessions are marked."
              />
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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

        <Card>
          <CardHeader
            title="Upcoming Sessions"
            action={
              <Link to="/sessions" className={buttonStyles('ghost', 'sm')}>
                See all
              </Link>
            }
          />
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
      </div>

      <ActivityFeed title="Recent Activity" activities={activities} />
    </div>
  );
}
