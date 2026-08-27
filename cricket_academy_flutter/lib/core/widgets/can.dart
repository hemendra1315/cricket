import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cricket_academy_flutter/providers/auth_provider.dart';
import '../rbac/capabilities.dart';

class Can extends ConsumerWidget {
  final Capability doVal;
  final Widget child;
  final Widget fallback;

  const Can({
    super.key,
    required this.doVal,
    required this.child,
    this.fallback = const SizedBox.shrink(),
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);
    final isSuperAdmin = authState.profile?.isSuperAdmin == true;
    final List<String> activeRoles = [];

    if (isSuperAdmin) {
      activeRoles.add('super_admin');
    }

    final activeAcademyId = authState.activeAcademyId;
    final activeMemberships = authState.memberships.where((m) => m.status == 'active');

    for (var m in activeMemberships) {
      if (m.academyId == activeAcademyId) {
        activeRoles.add(m.role);
      }
    }

    final hasPerm = Rbac.hasCapability(activeRoles, doVal);
    return hasPerm ? child : fallback;
  }
}
