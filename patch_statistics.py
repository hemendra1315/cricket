with open('src/features/players/pages/PlayerProfilePage.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

import re

# Update StatisticsTab signature
c = re.sub(
    r"function StatisticsTab\(\{\n  stats,\n  chartData,\n\}: \{\n  stats: PlayerStatistics \| null;\n  chartData: PlayerChartData \| null;\n\}\) \{",
    """function StatisticsTab({
  stats,
  chartData,
  view = 'all',
}: {
  stats: PlayerStatistics | null;
  chartData: PlayerChartData | null;
  view?: 'batting' | 'bowling' | 'all';
}) {""",
    c
)

# Replace the internal render inside StatisticsTab to check view
stat_inner = """  return (
    <div className="space-y-6">
      {/* BATTING */}
      <div className="space-y-4">
        <h3 className="text-fg text-lg font-bold">Batting</h3>"""

new_stat_inner = """  return (
    <div className="space-y-6">
      {/* BATTING */}
      {(view === 'all' || view === 'batting') && (
      <div className="space-y-4">
        <h3 className="text-fg text-lg font-bold">Batting</h3>"""
c = c.replace(stat_inner, new_stat_inner)

c = c.replace(
    """      {/* BOWLING */}
      <div className="space-y-4">
        <h3 className="text-fg text-lg font-bold">Bowling</h3>""",
    """      </div>
      )}
      {/* BOWLING */}
      {(view === 'all' || view === 'bowling') && (
      <div className="space-y-4">
        <h3 className="text-fg text-lg font-bold">Bowling</h3>"""
)

c = c.replace(
    """        </div>
      </div>
    </div>
  );
}

function MatchHistoryTab""",
    """        </div>
      </div>
      )}
    </div>
  );
}

function MatchHistoryTab"""
)

with open('src/features/players/pages/PlayerProfilePage.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
