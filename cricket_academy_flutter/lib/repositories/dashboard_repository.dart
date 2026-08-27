import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/app_exception.dart';

class DashboardRepository {
  final SupabaseClient _client;

  DashboardRepository(this._client);

  // ==========================================
  // OWNER DASHBOARD METRICS
  // ==========================================

  Future<int> getActivePlayersCount(String academyId) async {
    try {
      final response = await _client
          .from('academy_members')
          .select('id')
          .eq('academy_id', academyId)
          .eq('role', 'player')
          .eq('status', 'active');
      return (response as List).length;
    } on PostgrestException catch (e) {
      throw DatabaseException(e.message, code: e.code, details: e.details);
    } catch (e) {
      throw AppException(e.toString());
    }
  }

  Future<int> getActiveCoachesCount(String academyId) async {
    try {
      final response = await _client
          .from('academy_members')
          .select('id')
          .eq('academy_id', academyId)
          .eq('role', 'coach')
          .eq('status', 'active');
      return (response as List).length;
    } on PostgrestException catch (e) {
      throw DatabaseException(e.message, code: e.code, details: e.details);
    } catch (e) {
      throw AppException(e.toString());
    }
  }

  Future<List<Map<String, dynamic>>> getUpcomingSessions(String academyId) async {
    try {
      final todayStr = DateTime.now().toIso8601String().substring(0, 10);
      final response = await _client
          .from('training_sessions')
          .select('*, batches(name)')
          .eq('academy_id', academyId)
          .gte('session_date', todayStr)
          .order('session_date', ascending: true)
          .order('start_at', ascending: true)
          .limit(5);
      return List<Map<String, dynamic>>.from(response);
    } on PostgrestException catch (e) {
      throw DatabaseException(e.message, code: e.code, details: e.details);
    } catch (e) {
      throw AppException(e.toString());
    }
  }

  Future<double> getAcademyAttendanceRate(String academyId) async {
    try {
      final response = await _client
          .from('attendance')
          .select('status')
          .eq('academy_id', academyId);
      final data = response as List<dynamic>;
      if (data.isEmpty) return 100.0;
      final presentCount = data.where((r) => r['status'] == 'present').length;
      return (presentCount / data.length) * 100.0;
    } on PostgrestException catch (e) {
      throw DatabaseException(e.message, code: e.code, details: e.details);
    } catch (e) {
      throw AppException(e.toString());
    }
  }

  Future<List<Map<String, dynamic>>> getRecentMatches(String academyId) async {
    try {
      final response = await _client
          .from('matches')
          .select('*, batches(name)')
          .eq('academy_id', academyId)
          .order('match_date', ascending: false)
          .limit(5);
      return List<Map<String, dynamic>>.from(response);
    } on PostgrestException catch (e) {
      throw DatabaseException(e.message, code: e.code, details: e.details);
    } catch (e) {
      throw AppException(e.toString());
    }
  }

  // ==========================================
  // COACH DASHBOARD METRICS
  // ==========================================

  Future<List<Map<String, dynamic>>> getCoachSessionsToday(String academyId, String coachMemberId) async {
    try {
      final todayStr = DateTime.now().toIso8601String().substring(0, 10);
      final response = await _client
          .from('training_sessions')
          .select('*, batches(name)')
          .eq('academy_id', academyId)
          .eq('coach_id', coachMemberId)
          .eq('session_date', todayStr)
          .order('start_at', ascending: true);
      return List<Map<String, dynamic>>.from(response);
    } on PostgrestException catch (e) {
      throw DatabaseException(e.message, code: e.code, details: e.details);
    } catch (e) {
      throw AppException(e.toString());
    }
  }

  Future<List<Map<String, dynamic>>> getCoachBatches(String academyId, String coachMemberId) async {
    try {
      final response = await _client
          .from('batches')
          .select('*')
          .eq('academy_id', academyId)
          .eq('coach_id', coachMemberId);
      return List<Map<String, dynamic>>.from(response);
    } on PostgrestException catch (e) {
      throw DatabaseException(e.message, code: e.code, details: e.details);
    } catch (e) {
      throw AppException(e.toString());
    }
  }

  Future<double> getCoachAttendanceRate(String academyId, String coachMemberId) async {
    try {
      final response = await _client
          .from('attendance')
          .select('status, training_sessions!inner(coach_id)')
          .eq('academy_id', academyId)
          .eq('training_sessions.coach_id', coachMemberId);
      final data = response as List<dynamic>;
      if (data.isEmpty) return 100.0;
      final presentCount = data.where((r) => r['status'] == 'present').length;
      return (presentCount / data.length) * 100.0;
    } on PostgrestException catch (e) {
      throw DatabaseException(e.message, code: e.code, details: e.details);
    } catch (e) {
      throw AppException(e.toString());
    }
  }

  Future<List<Map<String, dynamic>>> getCoachRecentMatches(String academyId, String coachMemberId) async {
    try {
      final batches = await getCoachBatches(academyId, coachMemberId);
      final batchIds = batches.map((b) => b['id']?.toString()).whereType<String>().toList();
      if (batchIds.isEmpty) return [];

      final response = await _client
          .from('matches')
          .select('*, batches(name)')
          .eq('academy_id', academyId)
          .inFilter('batch_id', batchIds)
          .order('match_date', ascending: false)
          .limit(5);
      return List<Map<String, dynamic>>.from(response);
    } on PostgrestException catch (e) {
      throw DatabaseException(e.message, code: e.code, details: e.details);
    } catch (e) {
      throw AppException(e.toString());
    }
  }

  // ==========================================
  // PLAYER DASHBOARD METRICS
  // ==========================================

  Future<Map<String, dynamic>?> getPlayerStats(String academyId, String playerMemberId) async {
    try {
      final response = await _client
          .from('player_statistics')
          .select('*')
          .eq('academy_id', academyId)
          .eq('player_id', playerMemberId)
          .maybeSingle();
      return response;
    } on PostgrestException catch (e) {
      throw DatabaseException(e.message, code: e.code, details: e.details);
    } catch (e) {
      throw AppException(e.toString());
    }
  }

  Future<double> getPlayerAttendanceRate(String academyId, String playerMemberId) async {
    try {
      final response = await _client
          .from('attendance')
          .select('status')
          .eq('academy_id', academyId)
          .eq('player_id', playerMemberId);
      final data = response as List<dynamic>;
      if (data.isEmpty) return 100.0;
      final presentCount = data.where((r) => r['status'] == 'present').length;
      return (presentCount / data.length) * 100.0;
    } on PostgrestException catch (e) {
      throw DatabaseException(e.message, code: e.code, details: e.details);
    } catch (e) {
      throw AppException(e.toString());
    }
  }

  Future<List<Map<String, dynamic>>> getPlayerRecentMatches(String academyId, String playerMemberId) async {
    try {
      final response = await _client
          .from('matches')
          .select('*, match_lineups!inner(academy_member_id), batches(name)')
          .eq('academy_id', academyId)
          .eq('match_lineups.academy_member_id', playerMemberId)
          .order('match_date', ascending: false)
          .limit(5);
      return List<Map<String, dynamic>>.from(response);
    } on PostgrestException catch (e) {
      throw DatabaseException(e.message, code: e.code, details: e.details);
    } catch (e) {
      throw AppException(e.toString());
    }
  }

  Future<List<Map<String, dynamic>>> getPlayerAwards(String academyId, String playerMemberId) async {
    try {
      final response = await _client
          .from('match_awards')
          .select('*, matches!inner(academy_id, match_name, match_date)')
          .eq('matches.academy_id', academyId)
          .or('player_of_match_id.eq.$playerMemberId,best_batter_id.eq.$playerMemberId,best_bowler_id.eq.$playerMemberId,best_fielder_id.eq.$playerMemberId')
          .limit(5);
      return List<Map<String, dynamic>>.from(response);
    } on PostgrestException catch (e) {
      throw DatabaseException(e.message, code: e.code, details: e.details);
    } catch (e) {
      throw AppException(e.toString());
    }
  }

  // ==========================================
  // PARENT DASHBOARD LOOKUPS
  // ==========================================

  Future<List<Map<String, dynamic>>> getParentLinkedChildren(String academyId, String parentUserId) async {
    try {
      final response = await _client
          .from('parent_player_links')
          .select('player_user_id, relationship_type, profiles!parent_player_links_player_user_id_fkey(full_name, avatar_url)')
          .eq('parent_user_id', parentUserId)
          .eq('academy_id', academyId)
          .eq('status', 'active');

      final List<dynamic> links = response as List<dynamic>;
      final List<Map<String, dynamic>> children = [];

      for (var link in links) {
        final playerUserId = link['player_user_id'];
        final profile = link['profiles'] as Map<String, dynamic>?;

        final memberResponse = await _client
            .from('academy_members')
            .select('id')
            .eq('user_id', playerUserId)
            .eq('academy_id', academyId)
            .eq('role', 'player')
            .maybeSingle();

        if (memberResponse != null) {
          children.add({
            'relationship_type': link['relationship_type'],
            'player_user_id': playerUserId,
            'player_member_id': memberResponse['id'],
            'full_name': profile?['full_name'],
            'avatar_url': profile?['avatar_url'],
          });
        }
      }
      return children;
    } on PostgrestException catch (e) {
      throw DatabaseException(e.message, code: e.code, details: e.details);
    } catch (e) {
      throw AppException(e.toString());
    }
  }
}
