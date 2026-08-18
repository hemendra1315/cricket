with open('src/features/members/api/membersApi.ts', 'r', encoding='utf-8') as f:
    c = f.read()

import re

# 1. Update MemberRow
c = re.sub(
    r'(phone: string \| null;\n  } \| null;\n)',
    r'\1  batch_members?: { batches: { id: string; name: string } | null }[] | null;\n',
    c
)

# 2. Update MEMBER_COLUMNS
c = c.replace(
    "'id, academy_id, user_id, role, status, joined_at, profiles!academy_members_user_id_fkey!inner(full_name, email, avatar_url, phone)'",
    "'id, academy_id, user_id, role, status, joined_at, profiles!academy_members_user_id_fkey!inner(full_name, email, avatar_url, phone), batch_members(batches(id, name))'"
)

# 3. Update toMember mapping
c = re.sub(
    r'(phone: row\.profiles\?\.phone \?\? null,\n)',
    r'\1    batches: row.batch_members\n      ? row.batch_members.map(bm => bm.batches).filter((b): b is { id: string; name: string } => b !== null)\n      : [],\n',
    c
)

with open('src/features/members/api/membersApi.ts', 'w', encoding='utf-8') as f:
    f.write(c)
