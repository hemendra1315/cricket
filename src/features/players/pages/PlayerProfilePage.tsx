import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import { Card, CardBody, CardHeader, Badge } from '@/components/ui';
import { ErrorState } from '@/components/feedback';
import { useActiveAcademy } from '@/features/academies';
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
import { SimpleBarChart, SimpleLineChart } from '@/components/charts/SimpleBarChart';

type TabId = 'overview' | 'statistics' | 'matches' | 'awards' | 'highlights' | 'notes' | 'attendance' | 'drills';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'statistics', label: 'Statistics' },
  { id: 'matches', label: 'Match History' },
  { id: 'awards', label: 'Awards' },
  { id: 'highlights', label: 'Career Highlights' },
  { id: 'notes', label: 'Coach Notes' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'drills', label: 'Drills' },
];

export default function PlayerProfilePage() {
  const { memberId } = useParams<{ memberId: string }>();
  const { academyId } = useActiveAcademy();
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

  if (!memberId || !academyId) return null;

  const isLoading =
    profileQuery.isPending ||
    (activeTab === 'statistics' && statsQuery.isPending) ||
    (activeTab === 'matches' && matchesQuery.isPending) ||
    (activeTab === 'awards' && awardsQuery.isPending) ||
    (activeTab === 'highlights' && highlightsQuery.isPending) ||
    (activeTab === 'notes' && notesQuery.isPending) ||
    (activeTab === 'attendance' && attendanceQuery.isPending) ||
    (activeTab === 'drills' && drillsQuery.isPending);

  const battingAverage = statsQuery.data && statsQuery.data.battingInnings > 0
    ? (statsQuery.data.battingRuns / statsQuery.data.battingInnings).toFixed(2)
    : '0.00';

  const strikeRate = statsQuery.data && statsQuery.data.battingInnings > 0
    ? ((statsQuery.data.battingRuns / statsQuery.data.battingInnings) * 100).toFixed(2)
    : '0.00';

  const economy = statsQuery.data && statsQuery.data.bowlingOvers > 0
    ? (statsQuery.data.bowlingRunsConceded / statsQuery.data.bowlingOvers).toFixed(2)
    : '0.00';

  const renderTabContent = () => {
    if (isLoading) {
      return <p className="text-fg-muted">Loading…</p>;
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewTab stats={statsQuery.data} matches={matchesQuery.data ?? []} sessions={sessionsQuery.data ?? []} notes={notesQuery.data ?? []} />;
      case 'statistics':
        return <StatisticsTab stats={statsQuery.data} chartData={chartDataQuery.data} />;
      case 'matches':
        return <MatchHistoryTab matches={matchesQuery.data ?? []} />;
      case 'awards':
        return <AwardsTab awards={awardsQuery.data ?? []} />;
      case 'highlights':
        return <HighlightsTab highlights={highlightsQuery.data ?? []} milestones={milestonesQuery.data ?? []} />;
      case 'notes':
        return <CoachNotesTab notes={notesQuery.data ?? []} />;
      case 'attendance':
        return <AttendanceTab summary={attendanceQuery.data} />;
      case 'drills':
        return <DrillsTab summary={drillsQuery.data} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/members" className="text-fg-muted hover:text-fg text-sm">
          ← Back to roster
        </Link>
      </div>

      {profileQuery.isPending ? (
        <p className="text-fg-muted">Loading profile…</p>
      ) : profileQuery.isError || !profileQuery.data ? (
        <ErrorState error={profileQuery.error} onRetry={() => void profileQuery.refetch()} />
      ) : (
        <>
          <Card>
            <CardBody>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
                  {profileQuery.data.avatarUrl ? (
                    <img src={profileQuery.data.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <span className="text-fg text-xl font-semibold">
                      {profileQuery.data.fullName?.[0] ?? '?'}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-fg text-2xl font-semibold">{profileQuery.data.fullName ?? 'Unknown'}</h1>
                  <p className="text-fg-muted text-sm">{profileQuery.data.email}</p>
                  {profileQuery.data.batchName && (
                    <p className="text-fg-muted text-sm">Batch: {profileQuery.data.batchName}</p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          {statsQuery.data && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatCard label="Matches" value={statsQuery.data.matchesPlayed.toString()} />
              <StatCard label="Runs" value={statsQuery.data.battingRuns.toString()} />
              <StatCard label="Wickets" value={statsQuery.data.bowlingWickets.toString()} />
              <StatCard label="Batting Avg" value={battingAverage} />
              <StatCard label="Strike Rate" value={strikeRate} />
              <StatCard label="Economy" value={economy} />
            </div>
          )}

          <div className="border-border-subtle flex flex-wrap gap-1 rounded-lg border p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-surface-muted text-fg'
                    : 'text-fg-muted hover:text-fg'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {renderTabContent()}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardBody className="py-3">
        <p className="text-fg-muted text-xs uppercase tracking-wide">{label}</p>
        <p className="text-fg text-lg font-semibold">{value}</p>
      </CardBody>
    </Card>
  );
}

function OverviewTab({
  stats,
  matches,
  sessions,
  notes,
}: {
  stats: any;
  matches: any[];
  sessions: any[];
  notes: any[];
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
                  className="border-border-subtle flex flex-wrap items-center justify-between rounded-xl border p-3 hover:bg-surface-muted"
                >
                  <div>
                    <p className="text-fg font-medium">{match.matchName}</p>
                    <p className="text-fg-muted text-sm">
                      {new Date(match.matchDate).toLocaleDateString()} • {match.opponentName}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {match.batting && (
                      <span className="rounded-full bg-surface-muted px-2 py-1 text-xs">
                        {match.batting.runs} ({match.batting.balls})
                      </span>
                    )}
                    {match.bowling && (
                      <span className="rounded-full bg-surface-muted px-2 py-1 text-xs">
                        {match.bowling.wickets}/{match.bowling.runsConceded}
                      </span>
                    )}
                    {match.awards.playerOfMatch && (
                      <Badge tone="success">POM</Badge>
                    )}
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
              {sessions?.slice(0, 1).map((session: any) => (
                <div key={session.id} className="rounded-xl border p-3">
                  <p className="text-fg font-medium">{session.title}</p>
                  <p className="text-fg-muted text-sm">
                    {new Date(session.sessionDate).toLocaleDateString()} • {session.startAt} - {session.endAt}
                  </p>
                  {session.ground && <p className="text-fg-muted text-sm">Ground: {session.ground}</p>}
                  {session.coachName && <p className="text-fg-muted text-sm">Coach: {session.coachName}</p>}
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

function StatisticsTab({ stats, chartData }: { stats: any; chartData: any }) {
  if (!stats) {
    return <p className="text-fg-muted">No statistics available.</p>;
  }

  const battingAverage = stats.battingInnings > 0 ? (stats.battingRuns / stats.battingInnings).toFixed(2) : '0.00';
  const strikeRate = stats.ballsFacedSum > 0 ? ((stats.battingRuns / stats.ballsFacedSum) * 100).toFixed(2) : '0.00';
  const bowlingAverage = stats.bowlingWickets > 0 ? (stats.bowlingRunsConceded / stats.bowlingWickets).toFixed(2) : '0.00';
  const economy = stats.bowlingOvers > 0 ? (stats.bowlingRunsConceded / stats.bowlingOvers).toFixed(2) : '0.00';

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Batting" />
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatItem label="Innings" value={stats.battingInnings.toString()} />
            <StatItem label="Runs" value={stats.battingRuns.toString()} />
            <StatItem label="Highest" value={stats.battingHighestScore?.toString() ?? '-'} />
            <StatItem label="Average" value={battingAverage} />
            <StatItem label="Strike Rate" value={strikeRate} />
            <StatItem label="Fifties" value={stats.battingFifties.toString()} />
            <StatItem label="Centuries" value={stats.battingCenturies.toString()} />
            <StatItem label="Fours" value={stats.battingFours.toString()} />
            <StatItem label="Sixes" value={stats.battingSixes.toString()} />
          </div>
          {chartData?.runsByMatch?.length > 0 && (
            <div className="mt-6">
              <h4 className="text-fg-muted mb-2 text-sm font-medium">Runs by Match</h4>
              <SimpleBarChart
                data={chartData.runsByMatch.map((m: any) => ({ label: m.matchName, value: m.runs }))}
                height={200}
              />
            </div>
          )}
          {chartData?.strikeRateTrend?.length > 0 && (
            <div className="mt-6">
              <h4 className="text-fg-muted mb-2 text-sm font-medium">Strike Rate Trend</h4>
              <SimpleLineChart
                data={chartData.strikeRateTrend.map((m: any) => ({ label: m.matchName, value: m.strikeRate }))}
                height={200}
              />
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Bowling" />
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
            <StatItem label="Overs" value={stats.bowlingOvers.toString()} />
            <StatItem label="Maidens" value={stats.bowlingMaidens.toString()} />
            <StatItem label="Runs" value={stats.bowlingRunsConceded.toString()} />
            <StatItem label="Wickets" value={stats.bowlingWickets.toString()} />
            <StatItem label="Average" value={bowlingAverage} />
            <StatItem label="Economy" value={economy} />
            <StatItem label="Best" value={stats.bowlingBestBowling ?? '-'} />
          </div>
          {chartData?.wicketsByMatch?.length > 0 && (
            <div className="mt-6">
              <h4 className="text-fg-muted mb-2 text-sm font-medium">Wickets by Match</h4>
              <SimpleBarChart
                data={chartData.wicketsByMatch.map((m: any) => ({ label: m.matchName, value: m.wickets }))}
                height={200}
              />
            </div>
          )}
          {chartData?.economyTrend?.length > 0 && (
            <div className="mt-6">
              <h4 className="text-fg-muted mb-2 text-sm font-medium">Economy Trend</h4>
              <SimpleLineChart
                data={chartData.economyTrend.map((m: any) => ({ label: m.matchName, value: m.economy }))}
                height={200}
              />
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Fielding" />
        <CardBody>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatItem label="Catches" value={stats.fieldingCatches.toString()} />
            <StatItem label="Run Outs" value={stats.fieldingRunOuts.toString()} />
            <StatItem label="Stumpings" value={stats.fieldingStumpings.toString()} />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function MatchHistoryTab({ matches }: { matches: any[] }) {
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
                className="border-border-subtle flex flex-wrap items-center justify-between rounded-xl border p-3 hover:bg-surface-muted"
              >
                <div>
                  <p className="text-fg font-medium">{match.matchName}</p>
                  <p className="text-fg-muted text-sm">
                    {new Date(match.matchDate).toLocaleDateString()} • {match.opponentName}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-surface-muted px-2 py-1 text-xs">{match.matchType}</span>
                  <span className="rounded-full bg-surface-muted px-2 py-1 text-xs">{match.format.toUpperCase()}</span>
                  {match.result && (
                    <Badge tone={match.result === 'won' ? 'success' : match.result === 'lost' ? 'danger' : 'warning'}>
                      {match.result}
                    </Badge>
                  )}
                  {match.batting && (
                    <span className="rounded-full bg-surface-muted px-2 py-1 text-xs">
                      {match.batting.runs} ({match.batting.balls})
                    </span>
                  )}
                  {match.bowling && (
                    <span className="rounded-full bg-surface-muted px-2 py-1 text-xs">
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

function AwardsTab({ awards }: { awards: any[] }) {
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
                  className="border-border-subtle flex items-center justify-between rounded-xl border p-3 hover:bg-surface-muted"
                >
                  <div>
                    <p className="text-fg font-medium">{award.awardType}</p>
                    <p className="text-fg-muted text-sm">{award.matchName}</p>
                  </div>
                  <p className="text-fg-muted text-sm">{new Date(award.matchDate).toLocaleDateString()}</p>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function HighlightsTab({ highlights, milestones }: { highlights: any[]; milestones: any[] }) {
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

function CoachNotesTab({ notes }: { notes: any[] }) {
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
                  <p className="text-fg-muted text-sm">{new Date(note.matchDate).toLocaleDateString()}</p>
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

function AttendanceTab({ summary }: { summary: any }) {
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

      {summary?.monthlyData?.length > 0 && (
        <Card>
          <CardHeader title="Monthly Attendance" />
          <CardBody>
            <SimpleBarChart
              data={summary.monthlyData.map((m: any) => ({
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

function DrillsTab({ summary }: { summary: any }) {
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
              {summary?.recentAssignments?.map((assignment: any) => (
                <div key={assignment.id} className="border-border-subtle flex items-center justify-between rounded-xl border p-3">
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
      <p className="text-fg-muted text-xs uppercase tracking-wide">{label}</p>
      <p className="text-fg text-base font-medium">{value}</p>
    </div>
  );
}