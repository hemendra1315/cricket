import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/supabase/supabase_client.dart';
import 'auth_provider.dart';
import '../repositories/dashboard_repository.dart';

final dashboardRepositoryProvider = Provider<DashboardRepository>((ref) {
  final client = ref.watch(supabaseClientProvider);
  return DashboardRepository(client);
});

final activeMemberIdProvider = Provider<String?>((ref) {
  final authState = ref.watch(authControllerProvider);
  final activeAcademyId = authState.activeAcademyId;
  final userId = authState.user?.id;
  if (activeAcademyId == null || userId == null) return null;
  final membershipIndex = authState.memberships.indexWhere((m) => m.academyId == activeAcademyId);
  if (membershipIndex == -1) return null;
  return authState.memberships[membershipIndex].id;
});

// ==========================================
// OWNER DASHBOARD PROVIDERS
// ==========================================

final ownerActivePlayersProvider = FutureProvider.family<int, String>((ref, academyId) async {
  return ref.read(dashboardRepositoryProvider).getActivePlayersCount(academyId);
});

final ownerActiveCoachesProvider = FutureProvider.family<int, String>((ref, academyId) async {
  return ref.read(dashboardRepositoryProvider).getActiveCoachesCount(academyId);
});

final ownerUpcomingSessionsProvider = FutureProvider.family<List<Map<String, dynamic>>, String>((ref, academyId) async {
  return ref.read(dashboardRepositoryProvider).getUpcomingSessions(academyId);
});

final ownerAttendanceRateProvider = FutureProvider.family<double, String>((ref, academyId) async {
  return ref.read(dashboardRepositoryProvider).getAcademyAttendanceRate(academyId);
});

final ownerRecentMatchesProvider = FutureProvider.family<List<Map<String, dynamic>>, String>((ref, academyId) async {
  return ref.read(dashboardRepositoryProvider).getRecentMatches(academyId);
});

// ==========================================
// COACH DASHBOARD PROVIDERS
// ==========================================

final coachSessionsTodayProvider = FutureProvider.family<List<Map<String, dynamic>>, String>((ref, coachMemberId) async {
  final academyId = ref.watch(authControllerProvider).activeAcademyId ?? '';
  return ref.read(dashboardRepositoryProvider).getCoachSessionsToday(academyId, coachMemberId);
});

final coachBatchesProvider = FutureProvider.family<List<Map<String, dynamic>>, String>((ref, coachMemberId) async {
  final academyId = ref.watch(authControllerProvider).activeAcademyId ?? '';
  return ref.read(dashboardRepositoryProvider).getCoachBatches(academyId, coachMemberId);
});

final coachAttendanceRateProvider = FutureProvider.family<double, String>((ref, coachMemberId) async {
  final academyId = ref.watch(authControllerProvider).activeAcademyId ?? '';
  return ref.read(dashboardRepositoryProvider).getCoachAttendanceRate(academyId, coachMemberId);
});

final coachRecentMatchesProvider = FutureProvider.family<List<Map<String, dynamic>>, String>((ref, coachMemberId) async {
  final academyId = ref.watch(authControllerProvider).activeAcademyId ?? '';
  return ref.read(dashboardRepositoryProvider).getCoachRecentMatches(academyId, coachMemberId);
});

// ==========================================
// PLAYER DASHBOARD PROVIDERS
// ==========================================

final playerStatsProvider = FutureProvider.family<Map<String, dynamic>?, String>((ref, playerMemberId) async {
  final academyId = ref.watch(authControllerProvider).activeAcademyId ?? '';
  return ref.read(dashboardRepositoryProvider).getPlayerStats(academyId, playerMemberId);
});

final playerAttendanceRateProvider = FutureProvider.family<double, String>((ref, playerMemberId) async {
  final academyId = ref.watch(authControllerProvider).activeAcademyId ?? '';
  return ref.read(dashboardRepositoryProvider).getPlayerAttendanceRate(academyId, playerMemberId);
});

final playerRecentMatchesProvider = FutureProvider.family<List<Map<String, dynamic>>, String>((ref, playerMemberId) async {
  final academyId = ref.watch(authControllerProvider).activeAcademyId ?? '';
  return ref.read(dashboardRepositoryProvider).getPlayerRecentMatches(academyId, playerMemberId);
});

final playerAwardsProvider = FutureProvider.family<List<Map<String, dynamic>>, String>((ref, playerMemberId) async {
  final academyId = ref.watch(authControllerProvider).activeAcademyId ?? '';
  return ref.read(dashboardRepositoryProvider).getPlayerAwards(academyId, playerMemberId);
});

// ==========================================
// PARENT DASHBOARD PROVIDERS
// ==========================================

final parentLinkedChildrenProvider = FutureProvider.family<List<Map<String, dynamic>>, String>((ref, parentUserId) async {
  final academyId = ref.watch(authControllerProvider).activeAcademyId ?? '';
  return ref.read(dashboardRepositoryProvider).getParentLinkedChildren(academyId, parentUserId);
});
