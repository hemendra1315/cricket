import 'package:flutter/material.dart';

class CoachFeedbackScreen extends StatelessWidget {
  const CoachFeedbackScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Write Coach Feedback')),
      body: const Center(
        child: Text('Ratings (1-5) on Technique, Fitness, Discipline, Game Sense + Private notes placeholder'),
      ),
    );
  }
}

class PlayerFeedbackScreen extends StatelessWidget {
  const PlayerFeedbackScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Player Feedback History')),
      body: const Center(
        child: Text('Feedback history list & visible rating charts placeholder'),
      ),
    );
  }
}
