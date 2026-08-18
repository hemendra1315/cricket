with open('src/features/players/pages/PlayerProfilePage.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    "!['notes', 'drills', 'family'].includes(tab.id)",
    "!['notes', 'training', 'parent'].includes(tab.id)"
)

with open('src/features/players/pages/PlayerProfilePage.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
