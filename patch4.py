with open('src/features/members/pages/MembersPage.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    "import { useAuth } from '@/features/auth';",
    ""
)

c = c.replace(
    "(member.batches?.length ?? 0) > 0 && member.batches && (",
    "member.batches && member.batches.length > 0 && ("
)

with open('src/features/members/pages/MembersPage.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
