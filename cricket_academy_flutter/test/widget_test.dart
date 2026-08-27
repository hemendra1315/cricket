import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:cricket_academy_flutter/features/players/presentation/player_screens.dart';
import 'package:cricket_academy_flutter/core/widgets/can.dart';
import 'package:cricket_academy_flutter/core/rbac/capabilities.dart';
import 'package:cricket_academy_flutter/providers/auth_provider.dart';
import 'package:cricket_academy_flutter/models/user_profile.dart';
import 'package:cricket_academy_flutter/repositories/auth_repository.dart';

void main() {
  testWidgets('CricketCardWidget renders player information correctly', (WidgetTester tester) async {
    // Build the widget
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: CricketCardWidget(
            name: 'Hemu Patel',
            role: 'All Rounder',
            battingStyle: 'Right Hand Bat',
            bowlingStyle: 'Right Arm Off Break',
          ),
        ),
      ),
    );

    // Verify UI components render
    expect(find.text('Hemu Patel'), findsOneWidget);
    expect(find.text('All Rounder'), findsOneWidget);
    expect(find.text('Right Hand Bat'), findsOneWidget);
    expect(find.text('Right Arm Off Break'), findsOneWidget);
  });

  testWidgets('Can widget shows child when user has capability', (WidgetTester tester) async {
    // Mock LocalAuthState where the user is a super admin
    final mockAuthState = LocalAuthState(
      profile: UserProfile(id: 'mock-user-id', isSuperAdmin: true),
      memberships: const [],
    );

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          authControllerProvider.overrideWith((ref) {
            return _MockAuthController(mockAuthState);
          }),
        ],
        child: const MaterialApp(
          home: Scaffold(
            body: Can(
              doVal: Capability.playersManage,
              fallback: Text('Unauthorized Component'),
              child: Text('Authorized Component'),
            ),
          ),
        ),
      ),
    );

    // Should show the authorized component
    expect(find.text('Authorized Component'), findsOneWidget);
    expect(find.text('Unauthorized Component'), findsNothing);
  });
}

// Simple Mock Auth Repository
class _FakeAuthRepository extends AuthRepository {
  _FakeAuthRepository() : super(null);
}

// Simple Mock Auth Controller for testing overrides
class _MockAuthController extends AuthController {
  _MockAuthController(LocalAuthState state) : super(null, _FakeAuthRepository(), state);
}
