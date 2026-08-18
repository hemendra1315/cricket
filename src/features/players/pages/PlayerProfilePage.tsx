import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import { Card, CardBody, CardHeader, Badge, Button } from '@/components/ui';
import { MobilePageHeader } from '@/components/mobile';
import { EmptyState } from '@/components/feedback';
import { useActiveAcademy } from '@/features/academies';
import { isUUID } from '@/lib/validators';
import {
  usePlayerProfile,
  usePlayerStatistics,
  usePlayerMatches,
  usePlayerAwards,
  usePlayerMilestones,
  usePlayerCoachNotes,
  usePlayerAttendanceSummary,
  usePlayerDrillSummary,
  usePlayerCareerHighlights,
  usePlayerChartData,
  usePlayerUpcomingSessions,
} from '../hooks/usePlayers';
import type {
  PlayerAttendanceSummary,
  PlayerAward,
  PlayerCareerHighlight,
  PlayerChartData,
  PlayerCoachNote,
  PlayerDrillSummary,
  PlayerMatch,
  PlayerMilestone,
  PlayerStatistics,
} from '../api/playersTypes';
import { SimpleBarChart } from '@/components/charts/SimpleBarChart';
import { CricketCard } from '../components/CricketCard';
import { FamilyTab } from '../components/FamilyTab';

type TabId = 'overview' | 'attendance' | 'training' | 'matches' | 'batting' | 'bowling' | 'awards' | 'parent';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'training', label: 'Training' },
  { id: 'matches', label: 'Matches' },
  { id: 'batting', label: 'Batting' },
  { id: 'bowling', label: 'Bowling' },
  { id: 'awards', label: 'Awards' },
  { id: 'parent', label: 'Parent' },
];

export default function PlayerProfilePage() {
  const { memberId } = useParams<{ memberId: string }>();
  const { academyId, membership } = useActiveAcademy();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const profileQuery = usePlayerProfile(academyId, memberId ?? null);
  const statsQuery = usePlayerStatistics(academyId, memberId ?? null);
  const matchesQuery = usePlayerMatches(academyId, memberId ?? null);
  const awardsQuery = usePlayerAwards(academyId, memberId ?? null);
  const milestonesQuery = usePlayerMilestones(academyId, memberId ?? null);
  const notesQuery = usePlayerCoachNotes(academyId, memberId ?? null);
  const attendanceQuery = usePlayerAttendanceSummary(academyId, memberId ?? null);
  const drillsQuery = usePlayerDrillSummary(academyId, memberId ?? null);
  const highlightsQuery = usePlayerCareerHighlights(academyId, memberId ?? null);
  const chartDataQuery = usePlayerChartData(academyId, memberId ?? null);
  const sessionsQuery = usePlayerUpcomingSessions(memberId ?? null, academyId);

  if (!memberId || !academyId) {
    return (
      <div className="space-y-4">
        <MobilePageHeader title="Player profile" />
        <EmptyState
          title="No player selected"
          description="Select a player from the members list to view their full profile."
        />
      </div>
    );
  }

  if (!isUUID(memberId) || !isUUID(academyId)) {
    return (
      <div className="space-y-4">
        <MobilePageHeader title="Player profile" />
        <EmptyState
          title="Invalid player link"
          description="The player link you followed is not valid. Please return to the members list."
        />
      </div>
    );
  }

  const isLoading =
      profileQuery.isPending ||
      (activeTab === 'batting' && statsQuery.isPending) ||
      (activeTab === 'bowling' && statsQuery.isPending) ||
      (activeTab === 'matches' && matchesQuery.isPending) ||
      (activeTab === 'awards' && (awardsQuery.isPending || highlightsQuery.isPending)) ||
      (activeTab === 'training' && (drillsQuery.isPending || notesQuery.isPending)) ||
      (activeTab === 'attendance' && attendanceQuery.isPending);

  const renderTabContent = () => {
    if (isLoading) {
      return <p className="text-fg-muted">Loading…</p>;
    }

    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            stats={statsQuery.data ?? null}
            matches={matchesQuery.data ?? []}
            sessions={sessionsQuery.data ?? []}
            notes={notesQuery.data ?? []}
          />
        );
      case 'attendance':
        return <AttendanceTab summary={attendanceQuery.data ?? null} />;
      case 'training':
        return (
          <div className="space-y-6">
            <DrillsTab summary={drillsQuery.data ?? null} />
            <CoachNotesTab notes={notesQuery.data ?? []} />
          </div>
        );
      case 'matches':
        return <MatchHistoryTab matches={matchesQuery.data ?? []} />;
      case 'batting':
        return <StatisticsTab stats={statsQuery.data ?? null} chartData={chartDataQuery.data ?? null} view="batting" />;
      case 'bowling':
        return <StatisticsTab stats={statsQuery.data ?? null} chartData={chartDataQuery.data ?? null} view="bowling" />;
      case 'awards':
        return (
          <div className="space-y-6">
            <HighlightsTab highlights={highlightsQuery.data ?? []} milestones={milestonesQuery.data ?? []} />
            <AwardsTab awards={awardsQuery.data ?? []} />
          </div>
        );
      case 'parent':
        return <FamilyTab academyId={academyId!} playerUserId={profileQuery.data?.userId} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 pb-24 md:pb-6">
      {/* Mobile Page Header */}
      {profileQuery.data && (
        <div className="md:hidden">
          <MobilePageHeader
            title={profileQuery.data.fullName ?? 'Player Profile'}
            subtitle={
              profileQuery.data.batchName
                ? `Batch: ${profileQuery.data.batchName}`
                : profileQuery.data.email
            }
            showBack
          />
        </div>
      )}

      <div className="hidden items-center gap-3 md:flex">
        {membership?.role === 'parent' ? (
          <Link to="/parent/dashboard" className="text-fg-muted hover:text-fg text-sm">
            ← Back to dashboard
          </Link>
        ) : (
          <Link to="/members" className="text-fg-muted hover:text-fg text-sm">
            ← Back to roster
          </Link>
        )}
      </div>

      {profileQuery.isPending ? (
        <p className="text-fg-muted">Loading profile…</p>
      ) : profileQuery.isError || !profileQuery.data ? (
        <Card className="p-6 text-center">
          <CardBody className="space-y-3">
            <h3 className="text-fg text-lg font-bold">Student profile unavailable</h3>
            <p className="text-fg-muted text-sm">
              We could not locate the requested player record for this academy.
            </p>
            <div className="pt-2">
              {membership?.role === 'parent' ? (
                <Link to="/parent/dashboard">
                  <Button variant="primary">View Dashboard</Button>
                </Link>
              ) : (
                <Link to="/members">
                  <Button variant="primary">View Roster</Button>
                </Link>
              )}
            </div>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="mb-6">
            <CricketCard profile={profileQuery.data} stats={statsQuery.data ?? null} />
          </div>

          {/* Contained Horizontal Scrolling Tab Bar */}
          <div className="border-border-subtle bg-surface max-w-full overflow-x-auto rounded-xl border p-1 shadow-2xs">
            <div className="flex min-w-max gap-1">
              {TABS.filter((tab) => {
                if (membership?.role === 'parent') {
                  return !['notes', 'training', 'parent'].includes(tab.id);
                }
                return true;
              }).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-h-[44px] shrink-0 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-fg shadow-2xs'
                      : 'text-fg-muted hover:text-fg hover:bg-surface-muted'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {renderTabContent()}
        </>
      )}
    </div>
  );
}

function OverviewTab({
  stats,
  matches,
  sessions,
  notes,
}: {
  stats: PlayerStatistics | null;
  matches: PlayerMatch[];
  sessions: Array<{
    id: string;
    title: string;
    sessionDate: string;
    startAt: string;
    endAt: string;
    ground: string | null;
    coachName: string | null;
  }>;
  notes: PlayerCoachNote[];
}) {
  const recentMatches = matches?.slice(0, 5) ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Career Summary" description="Key performance indicators" />
        <CardBody>
          {!stats ? (
            <p className="text-fg-muted">No statistics available yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-fg-muted text-xs uppercase">Matches</p>
                <p className="text-fg text-base font-medium">{stats.matchesPlayed}</p>
              </div>
              <div>
                <p className="text-fg-muted text-xs uppercase">Runs</p>
                <p className="text-fg text-base font-medium">{stats.battingRuns}</p>
              </div>
              <div>
                <p className="text-fg-muted text-xs uppercase">Wickets</p>
                <p className="text-fg text-base font-medium">{stats.bowlingWickets}</p>
              </div>
              <div>
                <p className="text-fg-muted text-xs uppercase">Catches</p>
                <p className="text-fg text-base font-medium">{stats.fieldingCatches}</p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Recent Form" description="Last 5 matches" />
        <CardBody>
          {recentMatches.length === 0 ? (
            <p className="text-fg-muted">No matches played yet.</p>
          ) : (
            <div className="space-y-3">
              {recentMatches.map((match) => (
                <Link
                  key={match.id}
                  to={`/matches/${match.id}`}
                  className="border-border-subtle hover:bg-surface-muted flex flex-wrap items-center justify-between rounded-xl border p-3"
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
                    {match.awards.playerOfMatch && <Badge tone="success">POM</Badge>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Upcoming Session" description="Next scheduled training" />
        <CardBody>
          {sessions?.length === 0 ? (
            <p className="text-fg-muted">No upcoming sessions.</p>
          ) : (
            <div className="space-y-3">
              {sessions?.slice(0, 1).map((session) => (
                <div key={session.id} className="rounded-xl border p-3">
                  <p className="text-fg font-medium">{session.title}</p>
                  <p className="text-fg-muted text-sm">
                    {new Date(session.sessionDate).toLocaleDateString()} • {session.startAt} -{' '}
                    {session.endAt}
                  </p>
                  {session.ground && (
                    <p className="text-fg-muted text-sm">Ground: {session.ground}</p>
                  )}
                  {session.coachName && (
                    <p className="text-fg-muted text-sm">Coach: {session.coachName}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Latest Coach Feedback" description="Most recent note" />
        <CardBody>
          {notes?.length === 0 ? (
            <p className="text-fg-muted">No coach notes yet.</p>
          ) : (
            <div className="space-y-3">
              {notes?.slice(0, 1).map((note) => (
                <div key={note.id} className="rounded-xl border p-3">
                  <p className="text-fg-muted text-sm">
                    {note.matchName} • {note.coachName}
                  </p>
                  <p className="text-fg mt-1">{note.notes}</p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function StatisticsTab({
  stats,
  chartData,
  view = 'all',
}: {
  stats: PlayerStatistics | null;
  chartData: PlayerChartData | null;
  view?: 'batting' | 'bowling' | 'all';
}) {
  if (!stats) {
    return <p className="text-fg-muted">No statistics available.</p>;
  }

  const dismissals = stats.battingInnings - stats.battingNotOuts;
  const battingAverage =
    stats.battingInnings > 0
      ? dismissals > 0
        ? (stats.battingRuns / dismissals).toFixed(2)
        : stats.battingRuns.toFixed(2)
      : '0.00';
  const strikeRate =
    stats.ballsFacedSum > 0 ? ((stats.battingRuns / stats.ballsFacedSum) * 100).toFixed(2) : '0.00';
  const bowlingAverage =
    stats.bowlingWickets > 0
      ? (stats.bowlingRunsConceded / stats.bowlingWickets).toFixed(2)
      : '0.00';
  const economy =
    stats.bowlingOvers > 0 ? (stats.bowlingRunsConceded / stats.bowlingOvers).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      {(view === 'all' || view === 'batting') && (
        <div className="space-y-4">
          <h3 className="text-fg text-lg font-bold">Batting</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="border-border-subtle bg-surface shadow-2xs">
              <CardBody className="p-4">
                <p className="text-fg-muted text-[11px] font-bold tracking-wider uppercase">Innings</p>
                <p className="text-fg mt-1 text-2xl font-extrabold">{stats.battingInnings}</p>
              </CardBody>
            </Card>
            <Card className="border-border-subtle bg-surface shadow-2xs">
              <CardBody className="p-4">
                <p className="text-fg-muted text-[11px] font-bold tracking-wider uppercase">Runs</p>
                <p className="mt-1 text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                  {stats.battingRuns}
                </p>
              </CardBody>
            </Card>
            <Card className="border-border-subtle bg-surface shadow-2xs">
              <CardBody className="p-4">
                <p className="text-fg-muted text-[11px] font-bold tracking-wider uppercase">Average</p>
                <p className="text-fg mt-1 text-2xl font-extrabold">{battingAverage}</p>
              </CardBody>
            </Card>
            <Card className="border-border-subtle bg-surface shadow-2xs">
              <CardBody className="p-4">
                <p className="text-fg-muted text-[11px] font-bold tracking-wider uppercase">High Score</p>
                <p className="text-fg mt-1 text-2xl font-extrabold">
                  {stats.highestScore}
                  {stats.highestScoreNotOut ? '*' : ''}
                </p>
              </CardBody>
            </Card>
          </div>
          {chartData?.batting && chartData.batting.length > 0 && (
            <Card className="border-border-subtle bg-surface shadow-2xs">
              <CardBody>
                <h4 className="text-fg mb-4 text-sm font-bold">Recent Form (Runs)</h4>
                <div className="h-48">
                  <SimpleBarChart
                    data={chartData.batting}
                    dataKey="runs"
                    labelKey="matchDate"
                    color="hsl(var(--primary))"
                  />
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {(view === 'all' || view === 'bowling') && (
        <div className="space-y-4">
          <h3 className="text-fg text-lg font-bold">Bowling</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="border-border-subtle bg-surface shadow-2xs">
              <CardBody className="p-4">
                <p className="text-fg-muted text-[11px] font-bold tracking-wider uppercase">Innings</p>
                <p className="text-fg mt-1 text-2xl font-extrabold">{stats.bowlingInnings}</p>
              </CardBody>
            </Card>
            <Card className="border-border-subtle bg-surface shadow-2xs">
              <CardBody className="p-4">
                <p className="text-fg-muted text-[11px] font-bold tracking-wider uppercase">Wickets</p>
                <p className="text-fg mt-1 text-2xl font-extrabold">{stats.bowlingWickets}</p>
              </CardBody>
            </Card>
            <Card className="border-border-subtle bg-surface shadow-2xs">
              <CardBody className="p-4">
                <p className="text-fg-muted text-[11px] font-bold tracking-wider uppercase">Economy</p>
                <p className="text-fg mt-1 text-2xl font-extrabold">{economy}</p>
              </CardBody>
            </Card>
            <Card className="border-border-subtle bg-surface shadow-2xs">
              <CardBody className="p-4">
                <p className="text-fg-muted text-[11px] font-bold tracking-wider uppercase">Best</p>
                <p className="text-fg mt-1 text-2xl font-extrabold">
                  {stats.bestBowlingWickets}/{stats.bestBowlingRuns}
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function MatchHistoryTab({ matches }: { matches: PlayerMatch[] }) {
  return (
    <Card>
      <CardHeader title="Match History" description="All recorded matches" />
      <CardBody>
        {matches?.length === 0 ? (
          <p className="text-fg-muted">No matches recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {matches?.map((match) => (
              <Link
                key={match.id}
                to={`/matches/${match.id}`}
                className="border-border-subtle hover:bg-surface-muted flex flex-wrap items-center justify-between rounded-xl border p-3"
              >
                <div>
                  <p className="text-fg font-medium">{match.matchName}</p>
                  <p className="text-fg-muted text-sm">
                    {new Date(match.matchDate).toLocaleDateString()} • {match.opponentName}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-surface-muted rounded-full px-2 py-1 text-xs">
                    {match.matchType}
                  </span>
                  <span className="bg-surface-muted rounded-full px-2 py-1 text-xs">
                    {match.format.toUpperCase()}
                  </span>
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
                  {match.battingOrder !== undefined && match.battingOrder !== null && (
                    <span className="bg-surface-muted rounded-full px-2 py-1 text-xs font-medium">
                      Pos: {match.battingOrder === 0 ? 'Opening' : match.battingOrder}
                    </span>
                  )}
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function AwardsTab({ awards }: { awards: PlayerAward[] }) {
  const counts = useMemo(() => {
    const countsMap: Record<string, number> = {};
    awards?.forEach((a) => {
      countsMap[a.awardType] = (countsMap[a.awardType] || 0) + 1;
    });
    return countsMap;
  }, [awards]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Award Counts" />
        <CardBody>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Object.entries(counts).map(([award, count]) => (
              <div key={award}>
                <p className="text-fg-muted text-xs uppercase">{award}</p>
                <p className="text-fg text-lg font-semibold">{count}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="All Awards" />
        <CardBody>
          {awards?.length === 0 ? (
            <p className="text-fg-muted">No awards yet.</p>
          ) : (
            <div className="space-y-3">
              {awards?.map((award) => (
                <Link
                  key={award.id}
                  to={`/matches/${award.matchId}`}
                  className="border-border-subtle hover:bg-surface-muted flex items-center justify-between rounded-xl border p-3"
                >
                  <div>
                    <p className="text-fg font-medium">{award.awardType}</p>
                    <p className="text-fg-muted text-sm">{award.matchName}</p>
                  </div>
                  <p className="text-fg-muted text-sm">
                    {new Date(award.matchDate).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function HighlightsTab({
  highlights,
  milestones,
}: {
  highlights: PlayerCareerHighlight[];
  milestones: PlayerMilestone[];
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Career Highlights" />
        <CardBody>
          {highlights?.length === 0 ? (
            <p className="text-fg-muted">No highlights yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {highlights?.map((highlight) => (
                <div key={highlight.type} className="rounded-xl border p-3">
                  <p className="text-fg-muted text-xs uppercase">{highlight.label}</p>
                  <p className="text-fg text-lg font-semibold">{highlight.value}</p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Milestones" description="Achieved career milestones" />
        <CardBody>
          {milestones?.length === 0 ? (
            <p className="text-fg-muted">No milestones achieved yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {milestones?.map((milestone) => (
                <Badge key={milestone.id} tone="brand">
                  {milestone.milestoneType.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function CoachNotesTab({ notes }: { notes: PlayerCoachNote[] }) {
  return (
    <Card>
      <CardHeader title="Coach Notes" description="Feedback from coaches" />
      <CardBody>
        {notes?.length === 0 ? (
          <p className="text-fg-muted">No coach notes yet.</p>
        ) : (
          <div className="space-y-4">
            {notes?.map((note) => (
              <div key={note.id} className="border-border-subtle rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-fg font-medium">{note.matchName}</p>
                  <p className="text-fg-muted text-sm">
                    {new Date(note.matchDate).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-fg-muted text-sm">Coach: {note.coachName}</p>
                <p className="text-fg mt-2">{note.notes}</p>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function AttendanceTab({ summary }: { summary: PlayerAttendanceSummary | null }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Attendance Summary" />
        <CardBody>
          {!summary ? (
            <p className="text-fg-muted">No attendance data yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-4">
              <StatItem label="Total Sessions" value={summary.totalSessions.toString()} />
              <StatItem label="Attended" value={summary.attended.toString()} />
              <StatItem label="Absent" value={summary.absent.toString()} />
              <StatItem label="Percentage" value={`${summary.attendancePercentage}%`} />
            </div>
          )}
        </CardBody>
      </Card>

      {Boolean(summary?.monthlyData && summary.monthlyData.length > 0) && summary && (
        <Card>
          <CardHeader title="Monthly Attendance" />
          <CardBody>
            <SimpleBarChart
              data={summary.monthlyData.map((m) => ({
                label: m.month,
                value: Math.round((m.attended / m.total) * 100),
              }))}
              height={200}
            />
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function DrillsTab({ summary }: { summary: PlayerDrillSummary | null }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Drill Summary" />
        <CardBody>
          {!summary ? (
            <p className="text-fg-muted">No drill assignments yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-4">
              <StatItem label="Assigned" value={summary.assigned.toString()} />
              <StatItem label="Completed" value={summary.completed.toString()} />
              <StatItem label="Pending" value={summary.pending.toString()} />
              <StatItem label="Completion" value={`${summary.completionPercentage}%`} />
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Recent Assignments" />
        <CardBody>
          {summary?.recentAssignments?.length === 0 ? (
            <p className="text-fg-muted">No assignments yet.</p>
          ) : (
            <div className="space-y-3">
              {summary?.recentAssignments?.map((assignment) => (
                <div
                  key={assignment.id}
                  className="border-border-subtle flex items-center justify-between rounded-xl border p-3"
                >
                  <div>
                    <p className="text-fg font-medium">{assignment.drillName}</p>
                    <p className="text-fg-muted text-sm">{assignment.category}</p>
                  </div>
                  <Badge tone={assignment.status === 'completed' ? 'success' : 'warning'}>
                    {assignment.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-fg-muted text-xs tracking-wide uppercase">{label}</p>
      <p className="text-fg text-base font-medium">{value}</p>
    </div>
  );
}
