import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { HomeRedirect, RequireAcademy, RequireAuth, RequireRole } from './guards';
import { AppShell, AuthLayout, OnboardingLayout, PrintLayout } from './layouts';

/** Route-level code splitting keeps the initial bundle small. */
const SignInPage = lazy(() => import('@/features/auth/pages/SignInPage'));
const AuthCallbackPage = lazy(() => import('@/features/auth/pages/AuthCallbackPage'));
const ProfilePage = lazy(() => import('@/features/auth/pages/ProfilePage'));
const OnboardingStartPage = lazy(() => import('@/features/onboarding/pages/OnboardingStartPage'));
const CreateAcademyPage = lazy(() => import('@/features/onboarding/pages/CreateAcademyPage'));
const JoinAcademyPage = lazy(() => import('@/features/onboarding/pages/JoinAcademyPage'));
const PendingApprovalPage = lazy(() => import('@/features/onboarding/pages/PendingApprovalPage'));
const SelectAcademyPage = lazy(() => import('@/features/onboarding/pages/SelectAcademyPage'));
const MembersPage = lazy(() => import('@/features/members/pages/MembersPage'));
const PlayersPage = lazy(() => import('@/features/players/pages/PlayersPage'));
const PlayerProfilePage = lazy(() => import('@/features/players/pages/PlayerProfilePage'));
const CoachesPage = lazy(() => import('@/features/coaches/pages/CoachesPage'));
const CoachProfilePage = lazy(() => import('@/features/coaches/pages/CoachProfilePage'));
const OwnerDashboardPage = lazy(() => import('@/features/dashboard/pages/OwnerDashboardPage'));
const CoachDashboardPage = lazy(() => import('@/features/dashboard/pages/CoachDashboardPage'));
const PlayerDashboardPage = lazy(() => import('@/features/dashboard/pages/PlayerDashboardPage'));
const PlatformDashboardPage = lazy(() => import('@/features/admin/pages/PlatformDashboardPage'));
const ForbiddenPage = lazy(() => import('@/pages/ForbiddenPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

/**
 * Route tree. Guards compose as layout routes:
 * RequireAuth → RequireAcademy → RequireRole → page.
 *
 * Onboarding routes sit inside RequireAuth but outside RequireAcademy, since
 * that is exactly where users without a membership need to go.
 */
export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/sign-in', element: <SignInPage /> },
      { path: '/auth/callback', element: <AuthCallbackPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      { index: true, element: <HomeRedirect /> },
      {
        element: <OnboardingLayout />,
        children: [
          { path: '/onboarding', element: <OnboardingStartPage /> },
          { path: '/onboarding/create-academy', element: <CreateAcademyPage /> },
          { path: '/onboarding/join-academy', element: <JoinAcademyPage /> },
          { path: '/onboarding/pending', element: <PendingApprovalPage /> },
          { path: '/onboarding/select-academy', element: <SelectAcademyPage /> },
        ],
      },
      {
        element: <AppShell />,
        children: [
          { path: '/forbidden', element: <ForbiddenPage /> },
          { path: '/profile', element: <ProfilePage /> },
          {
            // Platform administration is not academy-scoped.
            element: <RequireRole allow={['super_admin']} />,
            children: [{ path: '/admin', element: <PlatformDashboardPage /> }],
          },
          {
            element: <RequireAcademy />,
            children: [
              {
                element: <RequireRole allow={['academy_owner', 'super_admin']} />,
                children: [{ path: '/dashboard', element: <OwnerDashboardPage /> }],
              },
              {
                element: <RequireRole allow={['coach', 'academy_owner', 'super_admin']} />,
                children: [{ path: '/coach', element: <CoachDashboardPage /> }],
              },
              {
                element: (
                  <RequireRole allow={['player', 'coach', 'academy_owner', 'super_admin']} />
                ),
                children: [{ path: '/me', element: <PlayerDashboardPage /> }],
              },
              {
                element: <RequireRole allow={['coach', 'academy_owner', 'super_admin']} />,
                children: [
                  { path: '/members', element: <MembersPage /> },
                  { path: '/players', element: <PlayersPage /> },
                ],
              },
              {
                // Every member may read the coaching staff, and `/players/me`
                // and `/coaches/me` resolve to the viewer's own profile.
                element: (
                  <RequireRole allow={['player', 'coach', 'academy_owner', 'super_admin']} />
                ),
                children: [
                  { path: '/players/:playerId', element: <PlayerProfilePage /> },
                  { path: '/coaches', element: <CoachesPage /> },
                  { path: '/coaches/:coachId', element: <CoachProfilePage /> },
                ],
              },
            ],
          },
        ],
      },
      {
        element: <PrintLayout />,
        children: [{ path: '/print/placeholder', element: <div>Report preview</div> }],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
