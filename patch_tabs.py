with open('src/features/players/pages/PlayerProfilePage.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

import re

# Update TabId type
c = re.sub(
    r"type TabId =.*?;",
    "type TabId = 'overview' | 'attendance' | 'training' | 'matches' | 'batting' | 'bowling' | 'awards' | 'parent';",
    c,
    flags=re.DOTALL
)

# Update TABS array
c = re.sub(
    r"const TABS: \{ id: TabId; label: string \}\[\] = \[.*?\];",
    """const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'training', label: 'Training' },
  { id: 'matches', label: 'Matches' },
  { id: 'batting', label: 'Batting' },
  { id: 'bowling', label: 'Bowling' },
  { id: 'awards', label: 'Awards' },
  { id: 'parent', label: 'Parent' },
];""",
    c,
    flags=re.DOTALL
)

# Update activeTab initialization if needed
c = c.replace("useState<TabId>('overview');", "useState<TabId>('overview');")

# Update renderTabContent cases
switch_block_old = """    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            stats={statsQuery.data ?? null}
            matches={matchesQuery.data ?? []}
            sessions={sessionsQuery.data ?? []}
            notes={notesQuery.data ?? []}
          />
        );
      case 'statistics':
        return (
          <StatisticsTab stats={statsQuery.data ?? null} chartData={chartDataQuery.data ?? null} />
        );
      case 'matches':
        return <MatchHistoryTab matches={matchesQuery.data ?? []} />;
      case 'awards':
        return <AwardsTab awards={awardsQuery.data ?? []} />;
      case 'highlights':
        return (
          <HighlightsTab
            highlights={highlightsQuery.data ?? []}
            milestones={milestonesQuery.data ?? []}
          />
        );
      case 'notes':
        return <CoachNotesTab notes={notesQuery.data ?? []} />;
      case 'attendance':
        return <AttendanceTab summary={attendanceQuery.data ?? null} />;
      case 'drills':
        return <DrillsTab summary={drillsQuery.data ?? null} />;
      case 'family':
        return <FamilyTab academyId={academyId!} playerUserId={profileQuery.data?.userId} />;
      default:
        return null;
    }"""

switch_block_new = """    switch (activeTab) {
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
    }"""

c = c.replace(switch_block_old, switch_block_new)

with open('src/features/players/pages/PlayerProfilePage.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
