import { CalendarDays, LayoutDashboard, Menu, User, Users, WifiOff } from 'lucide-react';
import { Suspense, type ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { LoadingScreen } from '@/components/feedback';
import { Avatar, Button, ThemeToggle } from '@/components/ui';
import { AcademySwitcher } from '@/features/academies';
import { useAuth } from '@/features/auth';
import { useOnlineStatus } from '@/hooks';
import { hasCapability, useActiveRoles, type Capability } from '@/lib/rbac';
import { cn } from '@/lib/utils/cn';
import { ROLE_HOME } from '@/types/enums';
import { useUiStore } from '@/stores';

/**
 * Navigation entries are filtered by capability, so a coach never sees owner-only
 * destinations. `requiresCapability: null` means "visible to any member".
 */
const NAV_ITEMS: {
  to: string;
  label: string;
  icon: ReactNode;
  requiresCapability: Capability | null;
}[] = [
  {
    to: ROLE_HOME.academy_owner,
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-4 w-4" aria-hidden />,
    requiresCapability: 'members:manage',
  },
  {
    to: ROLE_HOME.coach,
    label: 'Coaching',
    icon: <LayoutDashboard className="h-4 w-4" aria-hidden />,
    requiresCapability: 'attendance:mark',
  },
  {
    to: ROLE_HOME.player,
    label: 'My cricket',
    icon: <LayoutDashboard className="h-4 w-4" aria-hidden />,
    requiresCapability: 'stats:read_own',
  },
  {
    to: '/members',
    label: 'Members',
    icon: <Users className="h-4 w-4" aria-hidden />,
    requiresCapability: 'players:read',
  },
  {
    to: '/batches',
    label: 'Batches',
    icon: <Menu className="h-4 w-4" aria-hidden />,
    requiresCapability: 'batches:read',
  },
  {
    to: '/sessions',
    label: 'Sessions',
    icon: <CalendarDays className="h-4 w-4" aria-hidden />,
    requiresCapability: 'sessions:read',
  },
  {
    to: '/profile',
    label: 'My profile',
    icon: <User className="h-4 w-4" aria-hidden />,
    requiresCapability: null,
  },
];

/** Authenticated application chrome: sidebar, top bar and routed content. */
export function AppShell() {
  const { profile, displayName, logout } = useAuth();
  const roles = useActiveRoles();
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const setSidebarOpen = useUiStore((state) => state.setSidebarOpen);
  const online = useOnlineStatus();

  const navItems = NAV_ITEMS.filter(
    (item) => item.requiresCapability === null || hasCapability(roles, item.requiresCapability),
  );

  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="bg-bg min-h-screen">
      <header className="border-border-subtle bg-surface sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle navigation"
          className="min-h-[44px] min-w-[44px]"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <AcademySwitcher />

        <div className="ml-auto flex items-center gap-3">
          {!online ? (
            <span className="text-warning flex items-center gap-1 text-xs" role="status">
              <WifiOff className="h-4 w-4" aria-hidden /> Offline
            </span>
          ) : null}
          <ThemeToggle />
          <Avatar name={displayName} src={profile?.avatarUrl} size="sm" />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void logout()}
            className="min-h-[44px] px-3"
          >
            Sign out
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Mobile backdrop overlay */}
        {sidebarOpen ? (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        ) : null}

        <aside
          className={cn(
            'border-border-subtle bg-surface transition-transform duration-200 ease-in-out md:static md:z-auto md:w-56 md:translate-x-0 md:border-r md:p-3 md:shadow-none',
            'fixed inset-y-0 left-0 z-50 w-64 border-r p-4 shadow-xl',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          )}
        >
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-fg-muted hover:bg-surface-muted',
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 md:p-6">
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
