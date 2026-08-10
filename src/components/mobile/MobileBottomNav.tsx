import { Home, Users, CalendarDays, Layers, MoreHorizontal } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMemberships } from '@/features/academies';
import { ROLE_HOME } from '@/types/enums';

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { current } = useMemberships();

  const role = current?.role ?? 'player';
  const homePath = ROLE_HOME[role] ?? '/dashboard';

  const items = [
    {
      key: 'home',
      to: homePath,
      label: 'Home',
      icon: Home,
      matchPrefixes: ['/dashboard', '/owner', '/coach', '/player', '/me'],
    },
    { key: 'batches', to: '/batches', label: 'Batches', icon: Layers, matchPrefixes: ['/batches'] },
    { key: 'players', to: '/members', label: 'Players', icon: Users, matchPrefixes: ['/members'] },
    {
      key: 'sessions',
      to: '/sessions',
      label: 'Sessions',
      icon: CalendarDays,
      matchPrefixes: ['/sessions'],
    },
    {
      key: 'more',
      to: '/more',
      label: 'More',
      icon: MoreHorizontal,
      matchPrefixes: ['/more', '/drills', '/matches', '/admin', '/profile'],
    },
  ];

  const isItemActive = (item: (typeof items)[number]) => {
    return item.matchPrefixes.some(
      (prefix) => location.pathname === prefix || location.pathname.startsWith(prefix + '/'),
    );
  };

  return (
    <nav
      className="bg-surface/95 border-border-subtle fixed right-0 bottom-0 left-0 z-40 border-t pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur-md md:hidden"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="grid h-16 grid-cols-5 items-center px-1">
        {items.map((item) => {
          const active = isItemActive(item);
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.to)}
              className={`flex h-full min-h-[48px] w-full flex-col items-center justify-center px-1 py-1 transition active:scale-95 ${
                active ? 'text-primary font-semibold' : 'text-fg-muted hover:text-fg font-normal'
              }`}
            >
              <Icon className={`mb-1 h-5 w-5 ${active ? 'text-primary' : 'text-fg-muted'}`} />
              <span className="text-[10px] leading-none tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
