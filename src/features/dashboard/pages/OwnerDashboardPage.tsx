import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Layers,
  CalendarCheck,
  CalendarDays,
  Trophy,
  ArrowRight,
} from 'lucide-react';

import { Card, CardBody } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { formatDate } from '@/lib/utils/date';
import { useActiveAcademy } from '@/features/academies';
import { useOwnerDashboardAnalytics } from '../hooks/useDashboardAnalytics';
import { KpiCard } from '../components/KpiCard';
import { PerformanceLeadersCard } from '../components/PerformanceLeadersCard';
import { ActivityFeed } from '../components/ActivityFeed';
import { JoinCodeCard } from '@/features/academies';
import { SuperAdminAcademyActions } from '@/features/admin';
import { DashboardQuickActions } from '../components/DashboardQuickActions';
import type { ActivityItem } from '../components/ActivityFeed';

export default function OwnerDashboardPage() {
  const { academyId, membership } = useActiveAcademy();
  const analyticsQuery = useOwnerDashboardAnalytics(academyId);

  const analytics = analyticsQuery.data;

  if (analyticsQuery.isPending) {
    return <p className="text-fg-muted py-8 text-center text-sm">Loading dashboard…</p>;
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

  const nextSession = analytics.upcomingSessions?.[0] ?? null;
  const latestMatch = analytics.recentMatches?.[0] ?? null;

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* 1. Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-fg text-xl font-bold tracking-tight md:text-2xl">
            {membership?.academyName ?? 'Academy Dashboard'}
          </h1>
          <p className="text-fg-muted text-xs font-medium">
            {membership?.city ? `${membership.city} • ` : ''}Academy Operations & Performance
          </p>
        </div>
      </div>

      <SuperAdminAcademyActions />

      {/* 2. Compact Primary Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        <KpiCard
          title="Players"
          value={analytics.totalPlayers}
          icon={<Users className="text-primary h-4 w-4" />}
        />
        <KpiCard
          title="Coaches"
          value={analytics.totalCoaches}
          icon={<UserCheck className="text-info h-4 w-4" />}
        />
        <KpiCard
          title="Batches"
          value={analytics.totalBatches}
          icon={<Layers className="text-warning h-4 w-4" />}
        />
        <KpiCard
          title="Attendance"
          value={`${analytics.attendancePercentage}%`}
          icon={<CalendarCheck className="text-success h-4 w-4" />}
        />
      </div>

      {/* 3. Small Compact Player Join Code Card */}
      {academyId ? <JoinCodeCard academyId={academyId} /> : null}

      {/* 4. Collapsed Quick Actions Button */}
      <DashboardQuickActions />

      {/* 5. Compact Performance Leaders Section (Runs | Wickets | Fielding) */}
      <PerformanceLeadersCard
        topBatters={
          analytics.topBatters?.map((b) => ({
            id: b.id,
            name: b.name,
            runs: Number(b.runs || 0),
          })) ?? []
        }
        topBowlers={
          analytics.topBowlers?.map((b) => ({
            id: b.id,
            name: b.name,
            wickets: Number(b.wickets || 0),
          })) ?? []
        }
        topFielders={
          analytics.topFielders?.map((f) => ({
            id: f.id,
            name: f.name,
            catches: Number(f.catches || 0),
          })) ?? []
        }
      />

      {/* 6. Small Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Attendance Summary Card */}
        <Card className="hover:border-border p-3.5 transition-all">
          <CardBody className="p-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-fg-muted flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                  <CalendarCheck className="text-success h-3.5 w-3.5" />
                  <span>Attendance</span>
                </div>
                <p className="text-fg mt-1 text-lg font-bold">
                  {analytics.attendancePercentage}%{' '}
                  <span className="text-fg-muted text-xs font-normal">this week</span>
                </p>
              </div>
              <Link
                to="/attendance"
                className="text-primary mt-0.5 flex shrink-0 items-center gap-1 text-xs font-bold hover:underline"
              >
                <span>View</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Next Session Summary Card */}
        <Card className="hover:border-border p-3.5 transition-all">
          <CardBody className="p-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-fg-muted flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                  <CalendarDays className="text-info h-3.5 w-3.5" />
                  <span>Next Session</span>
                </div>
                <p className="text-fg mt-1 truncate text-sm font-bold">
                  {nextSession ? nextSession.title : 'No upcoming session'}
                </p>
                <p className="text-fg-muted truncate text-xs">
                  {nextSession
                    ? `${formatDate(nextSession.sessionDate)} • ${nextSession.startAt || ''}`
                    : 'Schedule new session'}
                </p>
              </div>
              <Link
                to="/sessions"
                className="text-primary mt-0.5 flex shrink-0 items-center gap-1 text-xs font-bold hover:underline"
              >
                <span>View</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardBody>
        </Card>

        {/* Latest Match Summary Card */}
        <Card className="hover:border-border p-3.5 transition-all">
          <CardBody className="p-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-fg-muted flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                  <Trophy className="h-3.5 w-3.5 text-amber-500" />
                  <span>Latest Match</span>
                </div>
                <p className="text-fg mt-1 truncate text-sm font-bold">
                  {latestMatch
                    ? `${latestMatch.matchName}${latestMatch.opponentName ? ` vs ${latestMatch.opponentName}` : ''}`
                    : 'No matches yet'}
                </p>
                <p className="text-fg-muted truncate text-xs">
                  {latestMatch
                    ? latestMatch.result
                      ? `Result: ${latestMatch.result}`
                      : latestMatch.teamScore || 'Completed'
                    : 'Add match scorecard'}
                </p>
              </div>
              <Link
                to="/matches"
                className="text-primary mt-0.5 flex shrink-0 items-center gap-1 text-xs font-bold hover:underline"
              >
                <span>View</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 7. Recent Activity Feed */}
      <ActivityFeed title="Recent Activity" activities={activities} />
    </div>
  );
}
