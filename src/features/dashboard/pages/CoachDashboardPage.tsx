import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Layers,
  CalendarDays,
  ArrowRight,
  Clock,
  CheckCircle2,
  Trophy,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';

import { Avatar, Card, CardBody, CardHeader, Button, Badge } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { formatDate } from '@/lib/utils/date';
import { useActiveAcademy } from '@/features/academies';
import { useAuth } from '@/features/auth';
import { useCoachDashboardAnalytics } from '../hooks/useDashboardAnalytics';
import { ActivityFeed } from '../components/ActivityFeed';
import { SuperAdminAcademyActions } from '@/features/admin';
import type { ActivityItem } from '../components/ActivityFeed';

export default function CoachDashboardPage() {
  const navigate = useNavigate();
  const { academyId, membership } = useActiveAcademy();
  const { profile } = useAuth();

  const analyticsQuery = useCoachDashboardAnalytics(academyId, profile?.id ?? null);
  const analytics = analyticsQuery.data;

  if (analyticsQuery.isPending) {
    return <p className="text-fg-muted py-8 text-center text-sm">Loading dashboard...</p>;
  }

  if (analyticsQuery.isError || !analytics) {
    return (
      <ErrorState error={analyticsQuery.error} onRetry={() => void analyticsQuery.refetch()} />
    );
  }

  const todaySessions = analytics.todaySessions ?? [];
  const topBatches = analytics.assignedBatches?.slice(0, 3) ?? [];

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
      {/* 1. Compact Header with Academy Branding */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar
            name={membership?.academyName}
            src={membership?.logoUrl}
            shape="rounded"
            className="h-10 w-10 shrink-0 text-base sm:h-12 sm:w-12 sm:text-lg"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-fg truncate text-xl font-bold tracking-tight md:text-2xl">
              {profile?.fullName ? `Welcome, ${profile.fullName}` : 'Welcome, Coach'}
            </h1>
            <p className="text-fg-muted truncate text-xs font-medium">
              {membership?.academyName ?? 'Academy'} � Daily Training & Squad Overview
            </p>
          </div>
        </div>
      </div>

      <SuperAdminAcademyActions />

      {/* 2. Today's Overview (2-column compact grid) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <div className="border-border-subtle bg-surface flex min-w-0 flex-1 items-center justify-between rounded-2xl border p-3.5 shadow-2xs">
          <div className="min-w-0 flex-1">
            <span className="text-fg-muted truncate text-xs font-semibold tracking-wider uppercase">
              Today's Sessions
            </span>
            <p className="text-fg mt-1 text-xl font-bold tracking-tight">
              {todaySessions.length} Scheduled
            </p>
            <p className="text-fg-muted mt-0.5 truncate text-[11px] font-medium">
              {todaySessions.reduce((acc, s) => acc + (s.playerCount || 0), 0)} players expected
            </p>
          </div>
          <div className="bg-info/10 text-info ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
            <CalendarDays className="h-5 w-5" />
          </div>
        </div>

        <div className="border-border-subtle bg-surface flex min-w-0 flex-1 items-center justify-between rounded-2xl border p-3.5 shadow-2xs">
          <div className="min-w-0 flex-1">
            <span className="text-fg-muted truncate text-xs font-semibold tracking-wider uppercase">
              Coached Players
            </span>
            <p className="text-fg mt-1 text-xl font-bold tracking-tight">{totalAssignedPlayers}</p>
            <p className="text-fg-muted mt-0.5 truncate text-[11px] font-medium">
              {analytics.assignedBatches?.length ?? 0} Assigned Batches
            </p>
          </div>
          <div className="bg-primary/10 text-primary ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 3. Quick Actions */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        <Button
          variant="secondary"
          className="hover:bg-surface-muted h-auto flex-col gap-2 p-3 text-xs font-semibold sm:p-4"
          onClick={() => navigate('/sessions')}
        >
          <div className="bg-success/10 rounded-full p-2">
            <CalendarDays className="text-success h-5 w-5" />
          </div>
          Mark Attendance
        </Button>
        <Button
          variant="secondary"
          className="hover:bg-surface-muted h-auto flex-col gap-2 p-3 text-xs font-semibold sm:p-4"
          onClick={() => navigate('/drills')}
        >
          <div className="bg-info/10 rounded-full p-2">
            <ClipboardList className="text-info h-5 w-5" />
          </div>
          Assign Drills
        </Button>
        <Button
          variant="secondary"
          className="hover:bg-surface-muted h-auto flex-col gap-2 p-3 text-xs font-semibold sm:p-4"
          onClick={() => navigate('/matches/new')}
        >
          <div className="rounded-full bg-amber-500/10 p-2">
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
          Add Match
        </Button>
        <Button
          variant="secondary"
          className="hover:bg-surface-muted h-auto flex-col gap-2 p-3 text-xs font-semibold sm:p-4"
          onClick={() => navigate('/members')}
        >
          <div className="bg-primary/10 rounded-full p-2">
            <Users className="text-primary h-5 w-5" />
          </div>
          View Players
        </Button>
      </div>

      {/* 4. Today's Sessions List */}
      <Card className="border-border-subtle bg-surface min-w-0 shadow-2xs">
        <CardHeader
          title={
            <div className="flex min-w-0 items-center gap-2">
              <Clock className="text-info h-4 w-4 shrink-0" />
              <span className="truncate">Today's Sessions</span>
            </div>
          }
          action={
            <Link
              to="/sessions"
              className="text-primary flex shrink-0 items-center gap-1 text-xs font-bold hover:underline"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        <CardBody className="min-w-0 p-3 pt-0">
          {todaySessions.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-fg-muted text-xs font-medium">No sessions scheduled for today.</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/sessions/new')}
                className="text-primary mt-2 text-xs"
              >
                Schedule Session ?
              </Button>
            </div>
          ) : (
            <div className="min-w-0 space-y-2">
              {todaySessions.map((session) => (
                <div
                  key={session.id}
                  className="border-border-subtle hover:border-primary/50 bg-surface flex min-w-0 flex-col gap-3 rounded-xl border p-3 transition-colors sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="text-fg truncate text-sm font-bold">{session.title}</p>
                      {session.attendanceMarked ? (
                        <Badge tone="success" className="shrink-0 text-[10px] uppercase">
                          Marked
                        </Badge>
                      ) : (
                        <Badge tone="neutral" className="shrink-0 text-[10px] uppercase">
                          Pending
                        </Badge>
                      )}
                    </div>
                    <div className="text-fg-muted flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <span className="flex items-center gap-1 truncate font-medium">
                        <Clock className="text-fg-muted/80 h-3.5 w-3.5 shrink-0" />
                        {session.startAt || 'TBD'} {session.endAt ? `- ${session.endAt}` : ''}
                      </span>
                      {session.batchName && (
                        <span className="flex items-center gap-1 truncate font-medium">
                          <Layers className="text-fg-muted/80 h-3.5 w-3.5 shrink-0" />
                          {session.batchName} ({session.playerCount} players)
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant={session.attendanceMarked ? 'secondary' : 'primary'}
                    onClick={() => navigate(`/sessions/${session.id}/attendance`)}
                    className="h-9 w-full shrink-0 px-3.5 text-xs font-bold sm:w-auto"
                  >
                    {session.attendanceMarked ? (
                      <>
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        View Attendance
                      </>
                    ) : (
                      'Mark Attendance'
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* 5. My Batches (Compact List Rows) */}
      <Card className="border-border-subtle bg-surface min-w-0 shadow-2xs">
        <CardHeader
          title={
            <div className="flex min-w-0 items-center gap-2">
              <Layers className="text-warning h-4 w-4 shrink-0" />
              <span className="truncate">My Batches</span>
            </div>
          }
          action={
            <Link
              to="/batches"
              className="text-primary flex shrink-0 items-center gap-1 text-xs font-bold hover:underline"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        <CardBody className="min-w-0 p-3 pt-0">
          {topBatches.length === 0 ? (
            <p className="text-fg-muted py-6 text-center text-xs">No batches assigned yet.</p>
          ) : (
            <div className="min-w-0 space-y-2">
              {topBatches.map((batch) => (
                <Link
                  key={batch.id}
                  to={`/batches/${batch.id}`}
                  className="border-border-subtle hover:border-primary/50 bg-surface flex min-h-[52px] min-w-0 items-center justify-between gap-3 rounded-xl border p-3 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="text-fg truncate text-sm font-bold">{batch.name}</p>
                      <Badge tone="brand" className="shrink-0 px-1.5 py-0.5 text-[10px]">
                        {batch.ageGroup}
                      </Badge>
                    </div>
                    <p className="text-fg-muted mt-0.5 truncate text-xs">
                      {batch.trainingDays || 'Flexible schedule'} � {batch.trainingTime || 'TBD'}
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
