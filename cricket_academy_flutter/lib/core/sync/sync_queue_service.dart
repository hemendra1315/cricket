import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../supabase/supabase_client.dart';

final syncQueueServiceProvider = Provider<SyncQueueService>((ref) {
  final supabase = ref.watch(supabaseClientProvider);
  return SyncQueueService(supabase);
});

class SyncQueueService {
  final SupabaseClient _supabase;
  late final Box _queueBox;
  final _connectivity = Connectivity();
  StreamSubscription? _connectivitySubscription;
  final ValueNotifier<int> queuedCountNotifier = ValueNotifier<int>(0);

  SyncQueueService(this._supabase) {
    _init();
  }

  Future<void> _init() async {
    _queueBox = await Hive.openBox('offline_attendance_queue');
    queuedCountNotifier.value = _queueBox.length;

    // Listen to network status updates
    _connectivitySubscription = _connectivity.onConnectivityChanged.listen((result) {
      if (result.any((r) => r != ConnectivityResult.none)) {
        processQueue();
      }
    });

    // Run a manual check on start
    final initialStatus = await _connectivity.checkConnectivity();
    if (initialStatus.any((r) => r != ConnectivityResult.none)) {
      processQueue();
    }
  }

  Future<void> queueAttendance({
    required String sessionId,
    required String playerId,
    required String status,
    required String markedBy,
  }) async {
    final key = '${sessionId}_$playerId';
    final payload = {
      'session_id': sessionId,
      'player_id': playerId,
      'status': status,
      'marked_by': markedBy,
      'timestamp': DateTime.now().toIso8601String(),
    };

    // Save locally
    await _queueBox.put(key, payload);
    queuedCountNotifier.value = _queueBox.length;

    // Try to sync immediately
    final network = await _connectivity.checkConnectivity();
    if (network.any((r) => r != ConnectivityResult.none)) {
      await processQueue();
    }
  }

  Future<void> processQueue() async {
    if (_queueBox.isEmpty) return;

    final keys = List.from(_queueBox.keys);
    for (var key in keys) {
      final payload = _queueBox.get(key);
      if (payload == null) continue;

      try {
        // Call Supabase Rest API directly or RPC
        await _supabase.from('attendance').upsert({
          'session_id': payload['session_id'],
          'player_id': payload['player_id'],
          'status': payload['status'],
          'marked_by': payload['marked_by'],
          'updated_at': DateTime.now().toIso8601String(),
        });

        // Remove from local cache on success
        await _queueBox.delete(key);
        queuedCountNotifier.value = _queueBox.length;
      } catch (e) {
        // Fail silently to retry later on next status update or user trigger
        debugPrint('Sync failed for $key: $e');
      }
    }
  }

  void dispose() {
    _connectivitySubscription?.cancel();
    queuedCountNotifier.dispose();
  }
}
