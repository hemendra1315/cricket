with open('src/types/domain.ts', 'r', encoding='utf-8') as f:
    c = f.read()

import re
c = re.sub(
    r'(export type AcademyMember = \{[^}]*?phone: string \| null;\n)',
    r'\1  batches?: { id: UUID; name: string }[];\n',
    c
)

with open('src/types/domain.ts', 'w', encoding='utf-8') as f:
    f.write(c)
