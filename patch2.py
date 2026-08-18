with open('src/features/members/pages/MembersPage.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    "<SkeletonText className=\"h-12 w-full rounded-xl\" />",
    "<SkeletonText lines={2} />"
)

c = c.replace(
    "member.batches && member.batches.length > 0",
    "member.batches && member.batches.length > 0"
)

c = c.replace(
    "member.batches[0]",
    "member.batches?.[0]"
)

c = c.replace("const { user } = useAuth();", "")

with open('src/features/members/pages/MembersPage.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
