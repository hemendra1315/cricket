with open('src/types/domain.ts', 'r', encoding='utf-8') as f:
    c = f.read()

target = "    avatarUrl: string | null;\n    phone: string | null;\n  };\n"
repl = "    avatarUrl: string | null;\n    phone: string | null;\n    batches?: { id: UUID; name: string }[];\n  };\n"
c = c.replace(target, repl)

with open('src/types/domain.ts', 'w', encoding='utf-8') as f:
    f.write(c)

with open('src/features/members/pages/MembersPage.tsx', 'r', encoding='utf-8') as f:
    m = f.read()
m = m.replace("MobileEmptyState, MobileFilterChips,", "")
m = m.replace("import { formatDate } from '@/lib/utils/date';", "")
m = m.replace("const { changeRole, changeStatus, removeMember }", "const { changeRole }")
m = m.replace("const isSelf = member.userId === user?.id;", "")
with open('src/features/members/pages/MembersPage.tsx', 'w', encoding='utf-8') as f:
    f.write(m)
