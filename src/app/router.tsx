import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppShell, AuthLayout, OnboardingLayout, PrintLayout } from './layouts';
import { RequireAuth, RequireRole } from './guards';

/** Route-level code splitting keeps the initial bundle small. */
const SignInPage = lazy(() => import('@/features/auth/pages/SignInPage'));
const AuthCallbackPage = lazy(() => import('@/features/auth/pages/AuthCallbackPage'));
const OnboardingStartPage = lazy(() => import('@/features/onboarding/pages/OnboardingStartPage'));
const OwnerDashboardPage = lazy(() => import('@/features/dashboard/pages/OwnerDashboardPage'));
const CoachDashboardPage = lazy(() => import('@/features/dashboard/pages/CoachDashboardPage'));
const PlayerDashboardPage = lazy(() => import('@/features/dashboard/pages/PlayerDashboardPage'));
const PlatformDashboardPage = lazy(() => import('@/features/admin/pages/PlatformDashboardPage'));
const ForbiddenPage = lazy(() => import('@/pages/ForbiddenPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

/**
 * Route tree. Guards are composed as layout routes:
 * RequireAuth → (RequireAcademy in later phases) → RequireRole → page.
 *
 * RequireAcademy is intentionally not applied yet: memberships are only loaded
 * from the database in Phase 1, so applying it now would trap every user on the
 * onboarding screen.
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
      {
        element: <OnboardingLayout />,
        children: [
          { path: '/onboarding', element: <OnboardingStartPage /> },
          { path: '/onboarding/select-academy', element: <OnboardingStartPage /> },
        ],
      },
      {
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: '/forbidden', element: <ForbiddenPage /> },
          {
            element: <RequireRole allow={['academy_owner', 'super_admin']} />,
            children: [{ path: '/dashboard', element: <OwnerDashboardPage /> }],
          },
          {
            element: <RequireRole allow={['coach', 'academy_owner', 'super_admin']} />,
            children: [{ path: '/coach', element: <CoachDashboardPage /> }],
          },
          {
            element: <RequireRole allow={['player', 'academy_owner', 'coach', 'super_admin']} />,
            children: [{ path: '/me', element: <PlayerDashboardPage /> }],
          },
          {
            element: <RequireRole allow={['super_admin']} />,
            children: [{ path: '/admin', element: <PlatformDashboardPage /> }],
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
