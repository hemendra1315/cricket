import 'package:flutter/material.dart';

class ReportsScreen extends StatelessWidget {
  const ReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reports Center')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Select report template: Attendance Register, Player Progress Card, Batch Performance'),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  // Call report-generate Edge Function and display status progress
                },
                child: const Text('Generate Report (Edge Function)'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
