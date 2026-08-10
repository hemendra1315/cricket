import {
  CalendarDays,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  ShieldCheck,
  Trophy,
  User,
  Users,
  WifiOff,
} from 'lucide-react';
import { Suspense, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { LoadingScreen } from '@/components/feedback';
import { Avatar, Button, Modal, ThemeToggle } from '@/components/ui';
import { AcademySwitcher, useActiveAcademy } from '@/features/academies';
import { useAuth } from '@/features/auth';
import { InstallAppButton } from '@/features/pwa/components/InstallAppButton';
import { useOnlineStatus } from '@/hooks';
import { hasCapability, useActiveRoles, type Capability } from '@/lib/rbac';
import { useAcademyStore } from '@/stores';
import { cn } from '@/lib/utils/cn';
import { ROLE_HOME } from '@/types/enums';

interface NavItemDef {
  to: string;
  label: string;
  icon: ReactNode;
  requiresCapability: Capability | null;
  superAdminOnly?: boolean;
}

const SIDEBAR_ITEMS: NavItemDef[] = [
  {
    to: '/admin',
    label: 'Super Admin',
    icon: <ShieldCheck className="h-4 w-4" aria-hidden />,
    requiresCapability: null,
    superAdminOnly: true,
  },
  {
    to: '/owner',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-4 w-4" aria-hidden />,
    requiresCapability: 'academy:update',
  },
  {
    to: '/coach',
    label: 'Coach View',
    icon: <LayoutDashboard className="h-4 w-4" aria-hidden />,
    requiresCapability: 'sessions:manage',
  },
  {
    to: '/player',
    label: 'My Cricket',
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
    to: '/matches',
    label: 'Matches',
    icon: <Trophy className="h-4 w-4" aria-hidden />,
    requiresCapability: 'matches:read',
  },
  {
    to: '/profile',
    label: 'My Profile',
    icon: <User className="h-4 w-4" aria-hidden />,
    requiresCapability: null,
  },
];

/** Authenticated application chrome: sidebar (desktop), bottom nav (mobile), top bar & routed content. */
export function AppShell() {
  const { profile, logout } = useAuth();
  const roles = useActiveRoles();
  const online = useOnlineStatus();
  const location = useLocation();
  const navigate = useNavigate();
  const { membership } = useActiveAcademy();
  const activeAcademyId = useAcademyStore((state) => state.activeAcademyId);

  const isSuperAdmin = profile?.isSuperAdmin === true;
  const displayName = profile?.fullName ?? profile?.email ?? 'User';

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const isSuperAdminMode =
    isSuperAdmin && Boolean(activeAcademyId) && location.pathname !== '/admin';

  // Compute primary home route based on user role
  const homePath = roles.includes('academy_owner')
    ? ROLE_HOME.academy_owner
    : roles.includes('coach')
      ? ROLE_HOME.coach
      : ROLE_HOME.player;

  // Filter allowed items for the user
  const allowedNavItems = SIDEBAR_ITEMS.filter((item) => {
    if (item.superAdminOnly) return isSuperAdmin;
    return item.requiresCapability === null || hasCapability(roles, item.requiresCapability);
  });

  // Mobile Bottom Nav primary tabs
  const mobilePrimaryTabs = [
    { to: homePath, label: 'Home', icon: <Home className="h-5 w-5" /> },
    { to: '/members', label: 'Players', icon: <Users className="h-5 w-5" /> },
    { to: '/sessions', label: 'Sessions', icon: <CalendarDays className="h-5 w-5" /> },
    { to: '/matches', label: 'Matches', icon: <Trophy className="h-5 w-5" /> },
  ];

  return (
    <div className="bg-bg min-h-screen">
      {/* HEADER: Compact & Responsive */}
      <header className="border-border-subtle bg-surface/95 sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <AcademySwitcher />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {!online ? (
            <span
              className="text-warning flex items-center gap-1 text-xs font-medium"
              role="status"
            >
              <WifiOff className="h-4 w-4" aria-hidden /> Offline
            </span>
          ) : null}
          <ThemeToggle />
          <NavLink to="/profile" aria-label="View Profile">
            <Avatar name={displayName} src={profile?.avatarUrl} size="sm" />
          </NavLink>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void logout()}
            className="hidden min-h-[40px] px-3 text-xs sm:inline-flex"
          >
            Sign out
          </Button>
        </div>
      </header>

      {/* SUPER ADMIN MODE BANNER */}
      {isSuperAdminMode ? (
        <div className="relative z-30 flex items-center justify-between border-b border-amber-500/30 bg-amber-500/15 px-4 py-2 text-xs font-medium text-amber-700 md:text-sm dark:text-amber-300">
          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="truncate">
              <strong className="font-bold">SUPER ADMIN MODE</strong> — Viewing:{' '}
              <span className="font-semibold">{membership?.academyName || 'Academy'}</span>
            </span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="h-8 shrink-0 border-amber-500/40 bg-amber-500/20 px-2.5 text-xs font-medium text-amber-700 hover:bg-amber-500/30 dark:text-amber-200"
            onClick={() => navigate('/admin')}
          >
            Back to Platform Admin
          </Button>
        </div>
      ) : null}

      <div className="flex">
        {/* DESKTOP SIDEBAR (>= 768px / md) */}
        <aside className="border-border-subtle bg-surface hidden md:block md:w-56 md:shrink-0 md:border-r md:p-3">
          <nav className="space-y-1">
            {allowedNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
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

        {/* MAIN CONTENT AREA */}
        <main className="min-w-0 flex-1 p-4 pb-24 md:p-6 md:pb-6">
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      {/* MOBILE FIXED BOTTOM NAVIGATION (< 768px / md) */}
      <nav
        className="border-border-subtle bg-surface/95 fixed right-0 bottom-0 left-0 z-40 flex h-16 items-center justify-around border-t backdrop-blur-md md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label="Mobile Navigation"
      >
        {mobilePrimaryTabs.map((tab) => {
          const isActive = location.pathname.startsWith(tab.to);
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={cn(
                'flex min-h-[48px] min-w-[56px] flex-col items-center justify-center rounded-lg px-2 py-1 text-[11px] font-medium transition-colors',
                isActive ? 'text-primary font-semibold' : 'text-fg-muted hover:text-fg',
              )}
            >
              <div className="mb-0.5">{tab.icon}</div>
              <span>{tab.label}</span>
            </NavLink>
          );
        })}

        {/* MORE MENU TAB BUTTON */}
        <button
          type="button"
          onClick={() => setIsMoreMenuOpen(true)}
          className={cn(
            'flex min-h-[48px] min-w-[56px] flex-col items-center justify-center rounded-lg px-2 py-1 text-[11px] font-medium transition-colors',
            isMoreMenuOpen ? 'text-primary font-semibold' : 'text-fg-muted hover:text-fg',
          )}
          aria-label="More navigation items"
        >
          <MoreHorizontal className="mb-0.5 h-5 w-5" />
          <span>More</span>
        </button>
      </nav>

      {/* MORE MENU SHEET MODAL (< 768px / md) */}
      <Modal
        open={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        title="More & Account"
        size="sm"
      >
        <div className="space-y-5 py-2">
          {/* Academy Group */}
          <div className="space-y-1">
            <p className="text-fg-muted mb-1 px-2 text-xs font-bold tracking-wider uppercase">
              Academy
            </p>
            <NavLink
              to="/batches"
              onClick={() => setIsMoreMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[48px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-fg-muted hover:bg-surface-muted hover:text-fg',
                )
              }
            >
              <Menu className="h-5 w-5" />
              <span>Batches</span>
            </NavLink>
            <NavLink
              to="/sessions"
              onClick={() => setIsMoreMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[48px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-fg-muted hover:bg-surface-muted hover:text-fg',
                )
              }
            >
              <CalendarDays className="h-5 w-5" />
              <span>Sessions</span>
            </NavLink>
          </div>

          {/* Management Group */}
          <div className="border-border-subtle space-y-1 border-t pt-3">
            <p className="text-fg-muted mb-1 px-2 text-xs font-bold tracking-wider uppercase">
              Management
            </p>
            <NavLink
              to="/members"
              onClick={() => setIsMoreMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[48px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-fg-muted hover:bg-surface-muted hover:text-fg',
                )
              }
            >
              <Users className="h-5 w-5" />
              <span>Members & Roster</span>
            </NavLink>
            <NavLink
              to="/matches"
              onClick={() => setIsMoreMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[48px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-fg-muted hover:bg-surface-muted hover:text-fg',
                )
              }
            >
              <Trophy className="h-5 w-5" />
              <span>Matches</span>
            </NavLink>
          </div>

          {/* Account Group */}
          <div className="border-border-subtle space-y-1 border-t pt-3">
            <p className="text-fg-muted mb-1 px-2 text-xs font-bold tracking-wider uppercase">
              Account
            </p>
            <NavLink
              to="/profile"
              onClick={() => setIsMoreMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[48px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-fg-muted hover:bg-surface-muted hover:text-fg',
                )
              }
            >
              <User className="h-5 w-5" />
              <span>My Profile</span>
            </NavLink>
            <div className="px-2 pt-1">
              <InstallAppButton />
            </div>
            <Button
              variant="secondary"
              className="min-h-[48px] w-full justify-start gap-3 text-red-500 hover:text-red-600"
              onClick={() => {
                setIsMoreMenuOpen(false);
                void logout();
              }}
            >
              <LogOut className="h-5 w-5" /> Sign out
            </Button>
          </div>

          {/* Platform / Super Admin Group */}
          {isSuperAdmin ? (
            <div className="border-border-subtle space-y-1 border-t pt-3">
              <p className="mb-1 px-2 text-xs font-bold tracking-wider text-amber-500 uppercase">
                Platform
              </p>
              <NavLink
                to="/admin"
                onClick={() => setIsMoreMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-[48px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                    isActive
                      ? 'bg-amber-500/10 font-semibold text-amber-500'
                      : 'text-amber-500/80 hover:bg-amber-500/10 hover:text-amber-500',
                  )
                }
              >
                <ShieldCheck className="h-5 w-5" />
                <span>Super Admin Panel</span>
              </NavLink>
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
