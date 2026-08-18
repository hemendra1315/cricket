import re
with open('src/features/players/pages/PlayerProfilePage.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# We will just suppress the unused warning for view if we don't fix it. But wait, I want it to actually work.
# Let's find StatisticsTab and replace it.

start_idx = c.find('function StatisticsTab({')
end_idx = c.find('function MatchHistoryTab({', start_idx)

if start_idx != -1 and end_idx != -1:
    old_tab = c[start_idx:end_idx]
    new_tab = '''function StatisticsTab({
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

'''
    c = c[:start_idx] + new_tab + c[end_idx:]
    with open('src/features/players/pages/PlayerProfilePage.tsx', 'w', encoding='utf-8') as f:
        f.write(c)
