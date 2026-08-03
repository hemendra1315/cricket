import { Menu, WifiOff } from 'lucide-react';
import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { LoadingScreen } from '@/components/feedback';
import { Avatar, Button, ThemeToggle } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { useOnlineStatus } from '@/hooks';
import { cn } from '@/lib/utils/cn';
import { useUiStore } from '@/stores';

/** Navigation is capability-free in Phase 0; feature links arrive with each phase. */
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Owner dashboard' },
  { to: '/coach', label: 'Coach dashboard' },
  { to: '/me', label: 'My dashboard' },
];

/** Authenticated application chrome: sidebar, top bar and routed content. */
export function AppShell() {
  const { user, logout } = useAuth();
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const online = useOnlineStatus();

  return (
    <div className="bg-bg min-h-screen">
      <header className="border-border-subtle bg-surface sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle navigation">
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-fg font-semibold">Cricket Academy Manager</span>

        <div className="ml-auto flex items-center gap-3">
          {!online ? (
            <span className="text-warning flex items-center gap-1 text-xs" role="status">
              <WifiOff className="h-4 w-4" aria-hidden /> Offline
            </span>
          ) : null}
          <ThemeToggle />
          <Avatar name={user?.user_metadata?.full_name ?? user?.email} size="sm" />
          <Button variant="secondary" size="sm" onClick={() => void logout()}>
            Sign out
          </Button>
        </div>
      </header>

      <div className="flex">
        <aside
          className={cn(
            'border-border-subtle bg-surface w-56 shrink-0 border-r p-3 md:block',
            sidebarOpen ? 'block' : 'hidden',
          )}
        >
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'block rounded-lg px-3 py-2 text-sm',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-fg-muted hover:bg-surface-muted',
                  )
                }
              >
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
