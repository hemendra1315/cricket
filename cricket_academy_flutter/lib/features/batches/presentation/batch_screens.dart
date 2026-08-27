import 'package:flutter/material.dart';

class BatchesListScreen extends StatelessWidget {
  const BatchesListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Batches')),
      body: const Center(
        child: Text('Batches List placeholder'),
      ),
    );
  }
}

class BatchDetailScreen extends StatelessWidget {
  final String batchId;
  const BatchDetailScreen({super.key, required this.batchId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Batch Detail: $batchId')),
      body: const Center(
        child: Text('Batch Roster & Schedule placeholder'),
      ),
    );
  }
}
