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
const PlayerProfilePage = lazy(() => import('@/features/players/pages/PlayerProfilePage'));
const BatchesPage = lazy(() => import('@/features/batches/pages/BatchesPage'));
const BatchDetailPage = lazy(() => import('@/features/batches/pages/BatchDetailPage'));
const MatchesPage = lazy(() => import('@/features/matches/pages/MatchesPage'));
const AddMatchPage = lazy(() => import('@/features/matches/pages/AddMatchPage'));
const MatchDetailPage = lazy(() => import('@/features/matches/pages/MatchDetailPage'));
const MorePage = lazy(() => import('@/pages/MorePage').then((m) => ({ default: m.MorePage })));
const TrainingSessionsPage = lazy(() => import('@/features/sessions/pages/TrainingSessionsPage'));
const TrainingSessionDetailPage = lazy(
  () => import('@/features/sessions/pages/TrainingSessionDetailPage'),
);
const AttendanceSessionPage = lazy(
  () => import('@/features/attendance/pages/AttendanceSessionPage'),
);
const AttendanceOverviewPage = lazy(
  () => import('@/features/attendance/pages/AttendanceOverviewPage'),
);
const PlayerAttendancePage = lazy(() => import('@/features/attendance/pages/PlayerAttendancePage'));
const BatchAttendancePage = lazy(() => import('@/features/attendance/pages/BatchAttendancePage'));
const OwnerDashboardPage = lazy(() => import('@/features/dashboard/pages/OwnerDashboardPage'));
const CoachDashboardPage = lazy(() => import('@/features/dashboard/pages/CoachDashboardPage'));
const PlayerDashboardPage = lazy(() => import('@/features/dashboard/pages/PlayerDashboardPage'));
const PlatformDashboardPage = lazy(() => import('@/features/admin/pages/PlatformDashboardPage'));
const DrillsPage = lazy(() => import('@/features/drills/pages/DrillsPage'));
const DrillDetailPage = lazy(() => import('@/features/drills/pages/DrillDetailPage'));
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
                children: [
                  { path: '/dashboard', element: <OwnerDashboardPage /> },
                  { path: '/owner', element: <OwnerDashboardPage /> },
                ],
              },
              {
                element: <RequireRole allow={['coach', 'academy_owner', 'super_admin']} />,
                children: [{ path: '/coach', element: <CoachDashboardPage /> }],
              },
              {
                element: <RequireRole allow={['player', 'super_admin']} />,
                children: [
                  { path: '/me', element: <PlayerDashboardPage /> },
                  { path: '/player', element: <PlayerDashboardPage /> },
                ],
              },
              {
                element: (
                  <RequireRole allow={['player', 'coach', 'academy_owner', 'super_admin']} />
                ),
                children: [
                  { path: '/more', element: <MorePage /> },
                  { path: '/drills', element: <DrillsPage /> },
                  { path: '/drills/:drillId', element: <DrillDetailPage /> },
                  { path: '/matches', element: <MatchesPage /> },
                  { path: '/matches/:matchId', element: <MatchDetailPage /> },
                ],
              },
              {
                element: <RequireRole allow={['coach', 'academy_owner', 'super_admin']} />,
                children: [
                  { path: '/members', element: <MembersPage /> },
                  { path: '/members/:memberId', element: <PlayerProfilePage /> },
                  { path: '/members/:memberId/attendance', element: <PlayerAttendancePage /> },
                  { path: '/batches', element: <BatchesPage /> },
                  { path: '/batches/:batchId', element: <BatchDetailPage /> },
                  { path: '/batches/:batchId/attendance', element: <BatchAttendancePage /> },
                  { path: '/attendance', element: <AttendanceOverviewPage /> },
                  { path: '/matches/new', element: <AddMatchPage /> },
                  { path: '/sessions', element: <TrainingSessionsPage /> },
                  { path: '/sessions/:sessionId', element: <TrainingSessionDetailPage /> },
                  { path: '/sessions/:sessionId/attendance', element: <AttendanceSessionPage /> },
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
