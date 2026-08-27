import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AttendanceOverviewScreen extends StatelessWidget {
  const AttendanceOverviewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Attendance Overview')),
      body: const Center(
        child: Text('Attendance Overview stats & streak alerts placeholder'),
      ),
    );
  }
}

class SessionAttendanceScreen extends ConsumerStatefulWidget {
  final String sessionId;
  const SessionAttendanceScreen({super.key, required this.sessionId});

  @override
  ConsumerState<SessionAttendanceScreen> createState() => _SessionAttendanceScreenState();
}

class _SessionAttendanceScreenState extends ConsumerState<SessionAttendanceScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Session: ${widget.sessionId}'),
        actions: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            margin: const EdgeInsets.only(right: 16),
            decoration: BoxDecoration(
              color: Colors.green.shade800,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.cloud_done, size: 16, color: Colors.white),
                SizedBox(width: 4),
                Text('Online & Synced', style: TextStyle(color: Colors.white, fontSize: 12)),
              ],
            ),
          )
        ],
      ),
      body: const Center(
        child: Text('Offline-capable session marking roster list placeholder'),
      ),
    );
  }
}
