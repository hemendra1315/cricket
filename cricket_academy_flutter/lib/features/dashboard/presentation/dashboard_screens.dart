import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:cricket_academy_flutter/providers/auth_provider.dart';
import 'package:cricket_academy_flutter/providers/dashboard_provider.dart';
import 'package:cricket_academy_flutter/routing/route_names.dart';

class AdminDashboardScreen extends ConsumerWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Super Admin Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authControllerProvider.notifier).logout(),
          )
        ],
      ),
      body: const Center(
        child: Text('Super Admin Metrics & Impersonation panel placeholder'),
      ),
    );
  }
}

class OwnerDashboardScreen extends ConsumerWidget {
  const OwnerDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);
    final academyId = authState.activeAcademyId ?? '';

    final playersCount = ref.watch(ownerActivePlayersProvider(academyId));
    final coachesCount = ref.watch(ownerActiveCoachesProvider(academyId));
    final attendanceRate = ref.watch(ownerAttendanceRateProvider(academyId));
    final upcomingSessions = ref.watch(ownerUpcomingSessionsProvider(academyId));
    final recentMatches = ref.watch(ownerRecentMatchesProvider(academyId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Academy Owner Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authControllerProvider.notifier).logout(),
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Overview Metrics', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 3,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              children: [
                _buildMetricCard(context, 'Total Players', playersCount),
                _buildMetricCard(context, 'Total Coaches', coachesCount),
                _buildMetricCard(
                  context,
                  'Attendance %',
                  attendanceRate.when(
                    data: (val) => AsyncValue.data('${val.toStringAsFixed(1)}%'),
                    loading: () => const AsyncValue.loading(),
                    error: (e, s) => AsyncValue.error(e, s),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Text('Upcoming Training Sessions', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            upcomingSessions.when(
              data: (sessions) => sessions.isEmpty
                  ? const Center(child: Text('No upcoming sessions scheduled.'))
                  : ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: sessions.length,
                      itemBuilder: (context, index) {
                        final session = sessions[index];
                        final batchName = session['batches']?['name'] ?? 'General';
                        return ListTile(
                          leading: const Icon(Icons.calendar_today),
                          title: Text(session['title'] ?? 'Session'),
                          subtitle: Text('Batch: $batchName | Date: ${session['session_date']}'),
                        );
                      },
                    ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error loading sessions: $e')),
            ),
            const SizedBox(height: 24),
            Text('Recent Match Results', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            recentMatches.when(
              data: (matches) => matches.isEmpty
                  ? const Center(child: Text('No recent matches played.'))
                  : ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: matches.length,
                      itemBuilder: (context, index) {
                        final match = matches[index];
                        return ListTile(
                          leading: const Icon(Icons.sports_cricket),
                          title: Text(match['match_name'] ?? 'Match'),
                          subtitle: Text('Result: ${match['result'] ?? 'Pending'}'),
                          onTap: () => context.goNamed(RouteNames.matchDetail, pathParameters: {'id': match['id']}),
                        );
                      },
                    ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error loading matches: $e')),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricCard(BuildContext context, String title, AsyncValue<dynamic> value) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(title, style: Theme.of(context).textTheme.bodySmall, textAlign: TextAlign.center),
            const SizedBox(height: 8),
            value.when(
              data: (val) => Text(val.toString(), style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
              loading: () => const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
              error: (err, _) => const Icon(Icons.error, color: Colors.red),
            ),
          ],
        ),
      ),
    );
  }
}

class CoachDashboardScreen extends ConsumerWidget {
  const CoachDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final coachMemberId = ref.watch(activeMemberIdProvider) ?? '';

    final sessionsToday = ref.watch(coachSessionsTodayProvider(coachMemberId));
    final assignedBatches = ref.watch(coachBatchesProvider(coachMemberId));
    final attendanceRate = ref.watch(coachAttendanceRateProvider(coachMemberId));
    final recentMatches = ref.watch(coachRecentMatchesProvider(coachMemberId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Coach Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authControllerProvider.notifier).logout(),
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Quick Statistics', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          const Text('Assigned Batches'),
                          const SizedBox(height: 8),
                          assignedBatches.when(
                            data: (batches) => Text('${batches.length}', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                            loading: () => const CircularProgressIndicator(),
                            error: (e, _) => const Icon(Icons.error),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          const Text('Coach Attendance %'),
                          const SizedBox(height: 8),
                          attendanceRate.when(
                            data: (val) => Text('${val.toStringAsFixed(1)}%', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
                            loading: () => const CircularProgressIndicator(),
                            error: (e, _) => const Icon(Icons.error),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Text("Today's Sessions", style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            sessionsToday.when(
              data: (sessions) => sessions.isEmpty
                  ? const Center(child: Text('No sessions scheduled for today.'))
                  : ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: sessions.length,
                      itemBuilder: (context, index) {
                        final session = sessions[index];
                        final batchName = session['batches']?['name'] ?? 'General';
                        return ListTile(
                          leading: const Icon(Icons.timer),
                          title: Text(session['title'] ?? 'Session'),
                          subtitle: Text('Batch: $batchName | Time: ${session['start_at']}'),
                          trailing: ElevatedButton(
                            onPressed: () => context.goNamed(RouteNames.markAttendance, pathParameters: {'id': session['id']}),
                            child: const Text('Roster'),
                          ),
                        );
                      },
                    ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error loading today\'s sessions: $e')),
            ),
            const SizedBox(height: 24),
            Text('Recent Match Activity', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            recentMatches.when(
              data: (matches) => matches.isEmpty
                  ? const Center(child: Text('No match records found for your batches.'))
                  : ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: matches.length,
                      itemBuilder: (context, index) {
                        final match = matches[index];
                        return ListTile(
                          leading: const Icon(Icons.sports_cricket),
                          title: Text(match['match_name'] ?? 'Match'),
                          subtitle: Text('Result: ${match['result'] ?? 'Pending'}'),
                          onTap: () => context.goNamed(RouteNames.matchDetail, pathParameters: {'id': match['id']}),
                        );
                      },
                    ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error loading matches: $e')),
            ),
          ],
        ),
      ),
    );
  }
}

class PlayerDashboardScreen extends ConsumerWidget {
  const PlayerDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final playerMemberId = ref.watch(activeMemberIdProvider) ?? '';

    final stats = ref.watch(playerStatsProvider(playerMemberId));
    final attendanceRate = ref.watch(playerAttendanceRateProvider(playerMemberId));
    final recentMatches = ref.watch(playerRecentMatchesProvider(playerMemberId));
    final awards = ref.watch(playerAwardsProvider(playerMemberId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Player Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authControllerProvider.notifier).logout(),
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Career Summary', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            stats.when(
              data: (stat) => stat == null
                  ? const Center(child: Text('No statistics recorded yet.'))
                  : GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      children: [
                        _buildStatTile(context, 'Matches Played', '${stat['matches_played'] ?? 0}'),
                        _buildStatTile(context, 'Runs Scored', '${stat['batting_runs'] ?? 0}'),
                        _buildStatTile(context, 'Wickets Taken', '${stat['bowling_wickets'] ?? 0}'),
                        _buildStatTile(context, 'Catches', '${stat['fielding_catches'] ?? 0}'),
                      ],
                    ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error loading stats: $e')),
            ),
            const SizedBox(height: 24),
            Text('Attendance summary', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total Training Attendance Rate:'),
                    attendanceRate.when(
                      data: (val) => Text('${val.toStringAsFixed(1)}%', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                      loading: () => const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
                      error: (e, _) => const Icon(Icons.error),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text('Recent Matches', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            recentMatches.when(
              data: (matches) => matches.isEmpty
                  ? const Center(child: Text('No recent matches played.'))
                  : ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: matches.length,
                      itemBuilder: (context, index) {
                        final match = matches[index];
                        return ListTile(
                          leading: const Icon(Icons.sports_cricket),
                          title: Text(match['match_name'] ?? 'Match'),
                          subtitle: Text('Result: ${match['result'] ?? 'Pending'}'),
                          onTap: () => context.goNamed(RouteNames.matchDetail, pathParameters: {'id': match['id']}),
                        );
                      },
                    ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error loading matches: $e')),
            ),
            const SizedBox(height: 24),
            Text('Milestones & Awards', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 12),
            awards.when(
              data: (awardList) => awardList.isEmpty
                  ? const Center(child: Text('No awards received yet.'))
                  : ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: awardList.length,
                      itemBuilder: (context, index) {
                        final award = awardList[index];
                        final matchName = award['matches']?['match_name'] ?? 'Match';
                        return ListTile(
                          leading: const Icon(Icons.emoji_events, color: Colors.amber),
                          title: Text('Award in $matchName'),
                          subtitle: const Text('Outstanding Performance'),
                        );
                      },
                    ),
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Text('Error loading awards: $e')),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatTile(BuildContext context, String title, String value) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(title, style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 8),
            Text(value, style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}

class ParentDashboardScreen extends ConsumerStatefulWidget {
  const ParentDashboardScreen({super.key});

  @override
  ConsumerState<ParentDashboardScreen> createState() => _ParentDashboardScreenState();
}

class _ParentDashboardScreenState extends ConsumerState<ParentDashboardScreen> {
  String? _selectedPlayerMemberId;

  @override
  Widget build(BuildContext context) {
    final parentUserId = ref.watch(authControllerProvider).user?.id ?? '';
    final childrenValue = ref.watch(parentLinkedChildrenProvider(parentUserId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Parent Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_link),
            onPressed: () => context.goNamed(RouteNames.parentLinkPlayer),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authControllerProvider.notifier).logout(),
          )
        ],
      ),
      body: childrenValue.when(
        data: (children) {
          if (children.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('No linked children found.'),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () => context.goNamed(RouteNames.parentLinkPlayer),
                    icon: const Icon(Icons.link),
                    label: const Text('Link Child Profile'),
                  ),
                ],
              ),
            );
          }

          // Select first child by default if not set
          if (_selectedPlayerMemberId == null && children.isNotEmpty) {
            _selectedPlayerMemberId = children.first['player_member_id'];
          }

          final currentChild = children.firstWhere(
            (c) => c['player_member_id'] == _selectedPlayerMemberId,
            orElse: () => children.first,
          );

          final childMemberId = currentChild['player_member_id'] as String;

          final stats = ref.watch(playerStatsProvider(childMemberId));
          final attendance = ref.watch(playerAttendanceRateProvider(childMemberId));
          final matches = ref.watch(playerRecentMatchesProvider(childMemberId));

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Dropdown to switch children
                Row(
                  children: [
                    const Text('Child: ', style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(width: 8),
                    DropdownButton<String>(
                      value: _selectedPlayerMemberId,
                      items: children.map((c) {
                        return DropdownMenuItem<String>(
                          value: c['player_member_id'],
                          child: Text(c['full_name'] ?? 'Child'),
                        );
                      }).toList(),
                      onChanged: (val) {
                        setState(() {
                          _selectedPlayerMemberId = val;
                        });
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Text('${currentChild['full_name']}\'s Attendance', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 10),
                Card(
                  child: ListTile(
                    title: const Text('Attendance Rate'),
                    trailing: attendance.when(
                      data: (rate) => Text('${rate.toStringAsFixed(1)}%', style: const TextStyle(fontWeight: FontWeight.bold)),
                      loading: () => const CircularProgressIndicator(),
                      error: (e, _) => const Icon(Icons.error),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Text('${currentChild['full_name']}\'s Career Statistics', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 12),
                stats.when(
                  data: (stat) => stat == null
                      ? const Center(child: Text('No stats recorded.'))
                      : GridView.count(
                          crossAxisCount: 2,
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                          children: [
                            _buildStatCard('Matches', '${stat['matches_played'] ?? 0}'),
                            _buildStatCard('Runs', '${stat['batting_runs'] ?? 0}'),
                            _buildStatCard('Wickets', '${stat['bowling_wickets'] ?? 0}'),
                            _buildStatCard('Catches', '${stat['fielding_catches'] ?? 0}'),
                          ],
                        ),
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (e, _) => Center(child: Text('Error: $e')),
                ),
                const SizedBox(height: 24),
                Text('Recent Matches Played', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 12),
                matches.when(
                  data: (matchList) => matchList.isEmpty
                      ? const Center(child: Text('No recent matches played.'))
                      : ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: matchList.length,
                          itemBuilder: (context, index) {
                            final match = matchList[index];
                            return ListTile(
                              leading: const Icon(Icons.sports_cricket),
                              title: Text(match['match_name'] ?? 'Match'),
                              subtitle: Text('Result: ${match['result'] ?? 'Pending'}'),
                              onTap: () => context.goNamed(RouteNames.matchDetail, pathParameters: {'id': match['id']}),
                            );
                          },
                        ),
                  loading: () => const Center(child: CircularProgressIndicator()),
                  error: (e, _) => Center(child: Text('Error: $e')),
                ),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error loading parent dashboard: $e')),
      ),
    );
  }

  Widget _buildStatCard(String title, String val) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
            const SizedBox(height: 8),
            Text(val, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
