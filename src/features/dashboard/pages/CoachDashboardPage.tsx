import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, Users, ChevronRight, ArrowRight, Clock, MapPin, Layers } from 'lucide-react';

import { Card, CardBody, CardHeader, Button, Badge } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { formatDate } from '@/lib/utils/date';
import { useActiveAcademy } from '@/features/academies';
import { useCoachDashboardAnalytics } from '../hooks/useDashboardAnalytics';
import { SuperAdminAcademyActions } from '@/features/admin';
import { DashboardQuickActions } from '../components/DashboardQuickActions';
import { ActivityFeed } from '../components/ActivityFeed';
import type { ActivityItem } from '../components/ActivityFeed';

export default function CoachDashboardPage() {
  const navigate = useNavigate();
  const { academyId, membership } = useActiveAcademy();
  const coachId = membership?.id ?? null;
  const analyticsQuery = useCoachDashboardAnalytics(academyId, coachId);

  const analytics = analyticsQuery.data;

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const nextSession = useMemo(() => {
    if (!analytics?.todaySession) return null;
    return {
      id: analytics.todaySession.id,
      title: analytics.todaySession.title,
      date: 'Today',
      time: `${analytics.todaySession.start_at || ''} - ${analytics.todaySession.end_at || ''}`,
      batchName: analytics.todaySession.batches?.name || 'Academy Squad',
      isToday: true,
    };
  }, [analytics]);

  const topBatches = useMemo(() => {
    return analytics?.assignedBatches?.slice(0, 3) ?? [];
  }, [analytics]);

  if (analyticsQuery.isPending) {
    return <p className="text-fg-muted py-8 text-center text-sm">Loading dashboard…</p>;
  }

  if (analyticsQuery.isError || !analytics) {
    return (
      <ErrorState error={analyticsQuery.error} onRetry={() => void analyticsQuery.refetch()} />
    );
  }

  const activities: ActivityItem[] =
    analytics.recentMatches?.slice(0, 3).map((m) => ({
      id: m.id,
      type: 'match_completed',
      message: `Match record: ${m.matchName}${m.opponentName ? ` vs ${m.opponentName}` : ''}`,
      timestamp: formatDate(m.matchDate),
      href: `/matches/${m.id}`,
    })) ?? [];

  const totalAssignedPlayers =
    analytics.assignedBatches?.reduce((acc, b) => acc + (b.playerCount || 0), 0) ?? 0;

  return (
    <div className="space-y-4 pb-20 md:pb-6">
      {/* 1. Compact Header */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-fg text-xl font-bold tracking-tight md:text-2xl">
          {getTimeOfDayGreeting()}, Coach
        </h1>
        <p className="text-fg-muted text-xs font-medium">
          {membership?.academyName ?? 'Academy'} • Daily Training & Squad Overview
        </p>
      </div>

      <SuperAdminAcademyActions />

      {/* 2. Today's Overview (2-column compact grid) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <div className="border-border-subtle bg-surface flex items-center justify-between rounded-2xl border p-3.5 shadow-2xs">
          <div className="min-w-0">
            <span className="text-fg-muted truncate text-xs font-semibold tracking-wider uppercase">
              Today&apos;s Sessions
            </span>
            <p className="text-fg mt-1 text-xl font-bold tracking-tight">
              {analytics.todaySession ? '1 Scheduled' : '0 Scheduled'}
            </p>
            <p className="text-fg-muted mt-0.5 truncate text-[11px] font-medium">
              {analytics.todaySession ? analytics.todaySession.title : 'Rest or practice'}
            </p>
          </div>
          <div className="bg-info/10 text-info flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
            <CalendarDays className="h-5 w-5" />
          </div>
        </div>

        <div className="border-border-subtle bg-surface flex items-center justify-between rounded-2xl border p-3.5 shadow-2xs">
          <div className="min-w-0">
            <span className="text-fg-muted truncate text-xs font-semibold tracking-wider uppercase">
              Coached Players
            </span>
            <p className="text-fg mt-1 text-xl font-bold tracking-tight">{totalAssignedPlayers}</p>
            <p className="text-fg-muted mt-0.5 truncate text-[11px] font-medium">
              {analytics.assignedBatches?.length ?? 0} Assigned Batches
            </p>
          </div>
          <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 3. Next Session Card */}
      <Card className="border-border-subtle bg-surface shadow-2xs">
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Clock className="text-info h-4 w-4" />
              <span>Next Training Session</span>
            </div>
          }
          action={
            nextSession?.isToday ? (
              <Badge tone="success" className="text-[10px] uppercase">
                Today
              </Badge>
            ) : null
          }
        />
        <CardBody className="p-3.5 pt-0">
          {nextSession ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <p className="text-fg truncate text-base font-bold">{nextSession.title}</p>
                <div className="text-fg-muted flex flex-wrap items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="text-fg-muted/80 h-3.5 w-3.5" />
                    {nextSession.date} • {nextSession.time}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="text-fg-muted/80 h-3.5 w-3.5" />
                    {nextSession.batchName}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => navigate(`/sessions/${nextSession.id}/attendance`)}
                className="h-10 min-h-[40px] shrink-0 px-3.5 text-xs font-bold"
              >
                <span>View Session</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-fg-muted text-xs font-medium">No upcoming sessions scheduled.</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/sessions')}
                className="text-primary mt-2 text-xs"
              >
                Schedule Session →
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* 4. Quick Actions Button */}
      <DashboardQuickActions />

      {/* 5. My Batches (Compact List Rows) */}
      <Card className="border-border-subtle bg-surface shadow-2xs">
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Layers className="text-warning h-4 w-4" />
              <span>My Batches</span>
            </div>
          }
          action={
            <Link
              to="/batches"
              className="text-primary flex items-center gap-1 text-xs font-bold hover:underline"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        <CardBody className="p-3 pt-0">
          {topBatches.length === 0 ? (
            <p className="text-fg-muted py-6 text-center text-xs">No batches assigned yet.</p>
          ) : (
            <div className="space-y-2">
              {topBatches.map((batch) => (
                <Link
                  key={batch.id}
                  to={`/batches/${batch.id}`}
                  className="border-border-subtle hover:border-primary/50 bg-surface flex min-h-[52px] items-center justify-between gap-3 rounded-xl border p-3 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-fg truncate text-sm font-bold">{batch.name}</p>
                      <Badge tone="brand" className="shrink-0 px-1.5 py-0.5 text-[10px]">
                        {batch.ageGroup}
                      </Badge>
                    </div>
                    <p className="text-fg-muted mt-0.5 truncate text-xs">
                      {batch.trainingDays || 'Flexible schedule'} • {batch.trainingTime || 'TBD'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-fg-muted text-xs font-semibold">
                      {batch.playerCount} players
                    </span>
                    <ChevronRight className="text-fg-muted/60 h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* 6. Recent Activity (Latest 2-3 items) */}
      <ActivityFeed title="Recent Activity" activities={activities} />
    </div>
  );
}
