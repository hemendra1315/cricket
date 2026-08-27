import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import 'route_names.dart';

// Screens
import '../features/auth/presentation/auth_screens.dart';
import '../features/dashboard/presentation/dashboard_screens.dart';
import '../features/batches/presentation/batch_screens.dart';
import '../features/attendance/presentation/attendance_screens.dart';
import '../features/matches/presentation/match_screens.dart';
import '../features/players/presentation/player_screens.dart';
import '../features/parent_portal/presentation/parent_screens.dart';
import '../features/feedback/presentation/feedback_screens.dart';
import '../features/billing/presentation/billing_screens.dart';
import '../features/reports/presentation/reports_screen.dart';
import '../features/notifications/presentation/notification_screens.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authControllerProvider);

  return GoRouter(
    initialLocation: '/signin',
    redirect: (context, state) {
      final isAuthenticated = authState.isAuthenticated;
      final path = state.uri.path;

      // 1. Auth Guard
      if (!isAuthenticated) {
        if (path == '/signin' || path == '/phoneotp') return null;
        return '/signin';
      }

      // 2. Profile Onboarding Guard
      final hasProfile = authState.hasProfile;
      if (!hasProfile) {
        if (path == '/onboarding/profile') return null;
        return '/onboarding/profile';
      }

      // 3. Super Admin Route Bypasses
      final isSuperAdmin = authState.profile?.isSuperAdmin == true;

      // 4. Academy Scope Guard
      final memberships = authState.memberships;
      final activeAcademyId = authState.activeAcademyId;

      if (memberships.isEmpty && !isSuperAdmin) {
        if (path == '/onboarding' || path == '/onboarding/join-academy' || path == '/onboarding/pending') {
          return null;
        }
        return '/onboarding';
      }

      if (activeAcademyId == null && !isSuperAdmin) {
        if (path == '/onboarding/select-academy') return null;
        return '/onboarding/select-academy';
      }

      // 5. Root Redirect
      if (path == '/' || path == '/signin') {
        if (isSuperAdmin) return '/admin';
        final role = authState.activeRole;
        if (role == 'academy_owner') return '/owner';
        if (role == 'coach') return '/coach';
        if (role == 'player') return '/player';
        if (role == 'parent') return '/parent';
        return '/onboarding/select-academy';
      }

      // 6. Role Authorization check
      if (path.startsWith('/admin') && !isSuperAdmin) {
        return '/';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/signin',
        name: RouteNames.signIn,
        builder: (context, state) => const SignInScreen(),
      ),
      GoRoute(
        path: '/phoneotp',
        name: RouteNames.phoneOtp,
        builder: (context, state) => const PhoneOtpScreen(),
      ),
      GoRoute(
        path: '/onboarding/profile',
        name: RouteNames.profileOnboarding,
        builder: (context, state) => const ProfileOnboardingScreen(),
      ),
      GoRoute(
        path: '/onboarding',
        name: RouteNames.onboardingStart,
        builder: (context, state) => const Scaffold(body: Center(child: Text('Onboarding Start'))),
      ),
      GoRoute(
        path: '/onboarding/join-academy',
        name: RouteNames.joinAcademy,
        builder: (context, state) => const Scaffold(body: Center(child: Text('Join Academy'))),
      ),
      GoRoute(
        path: '/onboarding/pending',
        name: RouteNames.pendingApproval,
        builder: (context, state) => const Scaffold(body: Center(child: Text('Pending Approval'))),
      ),
      GoRoute(
        path: '/onboarding/select-academy',
        name: RouteNames.selectAcademy,
        builder: (context, state) => const SelectAcademyScreen(),
      ),

      // Dashboards
      GoRoute(
        path: '/admin',
        name: RouteNames.adminDashboard,
        builder: (context, state) => const AdminDashboardScreen(),
      ),
      GoRoute(
        path: '/owner',
        name: RouteNames.ownerDashboard,
        builder: (context, state) => const OwnerDashboardScreen(),
      ),
      GoRoute(
        path: '/coach',
        name: RouteNames.coachDashboard,
        builder: (context, state) => const CoachDashboardScreen(),
      ),
      GoRoute(
        path: '/player',
        name: RouteNames.playerDashboard,
        builder: (context, state) => const PlayerDashboardScreen(),
      ),
      GoRoute(
        path: '/parent',
        name: RouteNames.parentDashboard,
        builder: (context, state) => const ParentDashboardScreen(),
      ),

      // Features
      GoRoute(
        path: '/batches',
        name: RouteNames.batches,
        builder: (context, state) => const BatchesListScreen(),
        routes: [
          GoRoute(
            path: ':id',
            name: RouteNames.batchDetail,
            builder: (context, state) => BatchDetailScreen(batchId: state.pathParameters['id'] ?? ''),
          ),
        ],
      ),
      GoRoute(
        path: '/sessions/:id/attendance',
        name: RouteNames.markAttendance,
        builder: (context, state) => SessionAttendanceScreen(sessionId: state.pathParameters['id'] ?? ''),
      ),
      GoRoute(
        path: '/matches',
        name: RouteNames.matches,
        builder: (context, state) => const MatchesListScreen(),
        routes: [
          GoRoute(
            path: 'wizard',
            name: RouteNames.manualMatchWizard,
            builder: (context, state) => const ManualMatchWizardScreen(),
          ),
          GoRoute(
            path: 'import',
            name: RouteNames.cricheroesImport,
            builder: (context, state) => const CricHeroesImportScreen(),
          ),
          GoRoute(
            path: ':id',
            name: RouteNames.matchDetail,
            builder: (context, state) => MatchDetailScreen(matchId: state.pathParameters['id'] ?? ''),
          ),
        ],
      ),
      GoRoute(
        path: '/players/:id',
        name: RouteNames.profile,
        builder: (context, state) => PlayerProfileScreen(playerMemberId: state.pathParameters['id'] ?? ''),
      ),
      GoRoute(
        path: '/parent/link',
        name: RouteNames.parentLinkPlayer,
        builder: (context, state) => const ParentLinkPlayerScreen(),
      ),
      GoRoute(
        path: '/billing',
        name: RouteNames.billing,
        builder: (context, state) => const BillingScreen(),
      ),
      GoRoute(
        path: '/feedback',
        name: RouteNames.feedback,
        builder: (context, state) => const PlayerFeedbackScreen(),
      ),
      GoRoute(
        path: '/reports',
        name: RouteNames.reports,
        builder: (context, state) => const ReportsScreen(),
      ),
      GoRoute(
        path: '/notifications',
        name: RouteNames.notifications,
        builder: (context, state) => const NotificationsScreen(),
      ),
    ],
  );
});
