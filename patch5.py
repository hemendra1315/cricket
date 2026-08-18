with open('src/features/players/pages/PlayerProfilePage.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

import re

c = re.sub(
    r"const isLoading =.*?\(activeTab === 'drills' && drillsQuery.isPending\);",
    """const isLoading =
      profileQuery.isPending ||
      (activeTab === 'batting' && statsQuery.isPending) ||
      (activeTab === 'bowling' && statsQuery.isPending) ||
      (activeTab === 'matches' && matchesQuery.isPending) ||
      (activeTab === 'awards' && (awardsQuery.isPending || highlightsQuery.isPending)) ||
      (activeTab === 'training' && (drillsQuery.isPending || notesQuery.isPending)) ||
      (activeTab === 'attendance' && attendanceQuery.isPending);""",
    c,
    flags=re.DOTALL
)

c = re.sub(
    r"(const strikeRate =.*?;)\s*(const bowlingAverage =)",
    r"\1\n  console.log(view);\n  \2",
    c
)

with open('src/features/players/pages/PlayerProfilePage.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

with open('src/features/members/pages/MembersPage.tsx', 'r', encoding='utf-8') as f:
    m = f.read()

m = m.replace(
    "member.batches && member.batches.length > 0 && (",
    "member.batches && member.batches.length > 0 && member.batches[0] && ("
)
with open('src/features/members/pages/MembersPage.tsx', 'w', encoding='utf-8') as f:
    f.write(m)

