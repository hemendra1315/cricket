with open('src/features/players/pages/PlayerProfilePage.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace("import { SimpleBarChart, SimpleLineChart }", "import { SimpleBarChart }")

with open('src/features/players/pages/PlayerProfilePage.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
