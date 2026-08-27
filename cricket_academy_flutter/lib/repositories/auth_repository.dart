import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/user_profile.dart';
import '../models/academy_member.dart';
import '../models/app_exception.dart';

class AuthRepository {
  final SupabaseClient? _client;

  AuthRepository(this._client);

  Future<UserProfile?> getProfile(String userId) async {
    try {
      final response = await _client!
          .from('profiles')
          .select()
          .eq('id', userId)
          .maybeSingle();

      if (response == null) return null;
      return UserProfile.fromJson(response);
    } on PostgrestException catch (e) {
      throw DatabaseException(e.message, code: e.code, details: e.details);
    } catch (e) {
      throw AppException(e.toString());
    }
  }

  Future<List<AcademyMember>> getMemberships(String userId) async {
    try {
      final response = await _client!
          .from('academy_members')
          .select('*, academies(*)')
          .eq('user_id', userId);

      final List<dynamic> data = response as List<dynamic>;
      return data.map((item) => AcademyMember.fromJson(item as Map<String, dynamic>)).toList();
    } on PostgrestException catch (e) {
      throw DatabaseException(e.message, code: e.code, details: e.details);
    } catch (e) {
      throw AppException(e.toString());
    }
  }
}
