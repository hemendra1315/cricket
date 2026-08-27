import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/supabase/supabase_client.dart';
import '../models/user_profile.dart';
import '../models/academy_member.dart';
import '../models/app_exception.dart';
import '../repositories/auth_repository.dart';

class LocalAuthState {
  final User? user;
  final UserProfile? profile;
  final List<AcademyMember> memberships;
  final String? activeAcademyId;
  final String? activeRole;
  final bool isLoading;
  final String? error;

  LocalAuthState({
    this.user,
    this.profile,
    this.memberships = const [],
    this.activeAcademyId,
    this.activeRole,
    this.isLoading = false,
    this.error,
  });

  bool get isAuthenticated => user != null;
  bool get hasProfile => profile != null && profile?.fullName != null;
  bool get hasAcademy => activeAcademyId != null;

  LocalAuthState copyWith({
    User? Function()? user,
    UserProfile? Function()? profile,
    List<AcademyMember>? memberships,
    String? Function()? activeAcademyId,
    String? Function()? activeRole,
    bool? isLoading,
    String? Function()? error,
  }) {
    return LocalAuthState(
      user: user != null ? user() : this.user,
      profile: profile != null ? profile() : this.profile,
      memberships: memberships ?? this.memberships,
      activeAcademyId: activeAcademyId != null ? activeAcademyId() : this.activeAcademyId,
      activeRole: activeRole != null ? activeRole() : this.activeRole,
      isLoading: isLoading ?? this.isLoading,
      error: error != null ? error() : this.error,
    );
  }
}

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final client = ref.watch(supabaseClientProvider);
  return AuthRepository(client);
});

final authControllerProvider = StateNotifierProvider<AuthController, LocalAuthState>((ref) {
  final client = ref.watch(supabaseClientProvider);
  final repository = ref.watch(authRepositoryProvider);
  return AuthController(client, repository);
});

class AuthController extends StateNotifier<LocalAuthState> {
  final SupabaseClient? _client;
  final AuthRepository _repository;

  AuthController(
    this._client,
    this._repository, [
    LocalAuthState? initialState,
  ]) : super(initialState ?? LocalAuthState(isLoading: true)) {
    if (_client != null) {
      _init();
    }
  }

  void _init() {
    _client!.auth.onAuthStateChange.listen((data) async {
      final session = data.session;
      if (session != null) {
        state = state.copyWith(user: () => session.user, isLoading: false);
        await refreshUserData();
      } else {
        state = LocalAuthState();
      }
    });
  }

  Future<void> refreshUserData() async {
    if (state.user == null) return;
    state = state.copyWith(isLoading: true, error: () => null);

    try {
      final userId = state.user!.id;

      // 1. Fetch Profile
      final profile = await _repository.getProfile(userId);

      // 2. Fetch memberships
      final memberships = await _repository.getMemberships(userId);

      // Determine active academy
      String? activeAcademyId;
      String? activeRole;
      if (memberships.isNotEmpty) {
        final active = memberships.firstWhere(
          (m) => m.status == 'active',
          orElse: () => memberships.first,
        );
        activeAcademyId = active.academyId;
        activeRole = active.role;
      }

      state = state.copyWith(
        profile: () => profile,
        memberships: memberships,
        activeAcademyId: () => activeAcademyId,
        activeRole: () => activeRole,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: () => e.toString());
    }
  }

  Future<void> signInWithGoogle() async {
    state = state.copyWith(isLoading: true, error: () => null);
    try {
      await _client!.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: 'com.hemu.cricketacademy://login-callback',
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: () => e.toString());
    }
  }

  Future<void> sendOtp(String phone) async {
    state = state.copyWith(isLoading: true, error: () => null);
    try {
      await _client!.auth.signInWithOtp(phone: phone);
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: () => e.toString());
    }
  }

  Future<void> verifyOtp(String phone, String token) async {
    state = state.copyWith(isLoading: true, error: () => null);
    try {
      await _client!.auth.verifyOTP(
        phone: phone,
        token: token,
        type: OtpType.sms,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: () => e.toString());
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true);
    if (_client != null) {
      await _client.auth.signOut();
    }
    state = LocalAuthState();
  }

  void selectAcademy(String academyId) {
    final membership = state.memberships.firstWhere(
      (m) => m.academyId == academyId,
      orElse: () => throw AppException('Membership not found'),
    );
    state = state.copyWith(
      activeAcademyId: () => academyId,
      activeRole: () => membership.role,
    );
  }
}
