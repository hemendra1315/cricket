import 'package:flutter/material.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notifications')),
      body: const Center(
        child: Text('Notifications Bell Alerts placeholder'),
      ),
    );
  }
}

class AnnouncementsScreen extends StatelessWidget {
  const AnnouncementsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Announcements')),
      body: const Center(
        child: Text('Academy announcements feed placeholder'),
      ),
    );
  }
}

class CreateAnnouncementScreen extends StatelessWidget {
  const CreateAnnouncementScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New Announcement')),
      body: const Center(
        child: Text('Form: Title, Body, Audience selectors (coaches_only, all_parents, batch) placeholder'),
      ),
    );
  }
}
