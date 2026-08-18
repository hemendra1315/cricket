const fs = require('fs');

let c = fs.readFileSync('src/app/layouts/AppShell.tsx', 'utf8');
c = c.replace(
  'superAdminOnly?: boolean;',
  'superAdminOnly?: boolean;\n  group?: string;'
);

c = c.replace(/superAdminOnly: true,/g, "superAdminOnly: true, group: 'Platform',");
c = c.replace(/requiresCapability: 'academy:update',/g, (match, offset, str) => {
  if (str.substring(offset - 50, offset).includes('/dashboard')) return "requiresCapability: 'academy:update', group: 'Home',";
  return "requiresCapability: 'academy:update', group: 'Academy',";
});
c = c.replace(/requiresCapability: 'sessions:manage',/g, "requiresCapability: 'sessions:manage', group: 'Home',");
c = c.replace(/parentOnly: true,/g, "parentOnly: true, group: 'Home',");
c = c.replace(/requiresCapability: 'stats:read_own',/g, "requiresCapability: 'stats:read_own', group: 'Home',");
c = c.replace(/requiresCapability: 'members:manage',/g, "requiresCapability: 'members:manage', group: 'People',");
c = c.replace(/requiresCapability: 'batches:read',/g, "requiresCapability: 'batches:read', group: 'Training',");
c = c.replace(/requiresCapability: 'sessions:read',/g, "requiresCapability: 'sessions:read', group: 'Training',");
c = c.replace(/requiresCapability: 'matches:read',/g, "requiresCapability: 'matches:read', group: 'Matches',");

c = c.replace(
  /{\s*to: '\/stats',[\s\S]*?requiresCapability: null,\s*}/,
  `{
    to: '/stats',
    label: 'Stats & Performance',
    icon: <BarChart2 className="h-4 w-4" aria-hidden />,
    requiresCapability: null,
    group: 'Matches',
  }`
);

c = c.replace(
  /{\s*to: '\/profile',[\s\S]*?requiresCapability: null,\s*}/,
  `{
    to: '/profile',
    label: 'My Profile',
    icon: <User className="h-4 w-4" aria-hidden />,
    requiresCapability: null,
    group: 'Academy',
  }`
);

c = c.replace(
  /<nav className="space-y-1">[\s\S]*?{allowedNavItems.map\(\(item\) => \([\s\S]*?<\/nav>/,
  `<nav className="space-y-6">
              {['Home', 'People', 'Training', 'Matches', 'Academy', 'Platform'].map(group => {
                const groupItems = allowedNavItems.filter(i => i.group === group);
                if (groupItems.length === 0) return null;
                return (
                  <div key={group} className="space-y-1">
                    <p className="px-3 mb-2 text-xs font-bold tracking-wider text-fg-muted uppercase">{group}</p>
                    {groupItems.map(item => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                            isActive
                              ? 'bg-primary text-primary-inverse'
                              : 'text-fg-muted hover:bg-surface-muted hover:text-fg',
                          )
                        }
                      >
                        {item.icon}
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                );
              })}
            </nav>`
);

fs.writeFileSync('src/app/layouts/AppShell.tsx', c, 'utf8');
