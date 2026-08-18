with open('src/features/players/pages/PlayerProfilePage.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace("console.log(view);\n  if (!stats) {", "if (!stats) {")

# Also we need to use iew somehow to satisfy eslint unused var, or just ignore it for the unused var rule if it triggers.
# Wait, if view is unused in the outer scope, maybe we just use it implicitly, but we DID use it! We used iew === 'all' inside the render!
# Why did it complain iew is declared but never read?
# Let's just do:
c = c.replace("function StatisticsTab({\n  stats,\n  chartData,\n  view = 'all',\n}", "function StatisticsTab({\n  stats,\n  chartData,\n  view = 'all',\n}")

with open('src/features/players/pages/PlayerProfilePage.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
