with open('src/features/members/pages/MembersPage.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    "member.batches && member.batches.length > 0 && (",
    "(member.batches?.length ?? 0) > 0 && member.batches && ("
)
c = c.replace("member.batches?.[0].name", "member.batches[0].name")

with open('src/features/members/pages/MembersPage.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
