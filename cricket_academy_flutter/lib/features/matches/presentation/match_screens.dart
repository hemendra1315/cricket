import 'package:flutter/material.dart';

class MatchesListScreen extends StatelessWidget {
  const MatchesListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Matches')),
      body: const Center(
        child: Text('Matches list & scoreboard placeholder'),
      ),
    );
  }
}

class MatchDetailScreen extends StatelessWidget {
  final String matchId;
  const MatchDetailScreen({super.key, required this.matchId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Match Details: $matchId')),
      body: const Center(
        child: Text('Batting / Bowling / Fielding Scorecard tabs placeholder'),
      ),
    );
  }
}

class ManualMatchWizardScreen extends StatefulWidget {
  const ManualMatchWizardScreen({super.key});

  @override
  State<ManualMatchWizardScreen> createState() => _ManualMatchWizardScreenState();
}

class _ManualMatchWizardScreenState extends State<ManualMatchWizardScreen> {
  int _currentStep = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('New Match Wizard')),
      body: Stepper(
        currentStep: _currentStep,
        onStepContinue: () {
          if (_currentStep < 3) {
            setState(() => _currentStep++);
          }
        },
        onStepCancel: () {
          if (_currentStep > 0) {
            setState(() => _currentStep--);
          }
        },
        steps: const [
          Step(
            title: Text('Match Info'),
            content: Text('Form: Opponent, Venue, Date, Format (T20, ODI, Test)'),
          ),
          Step(
            title: Text('Roster & XI'),
            content: Text('Select XI, Captain, Vice-Captain, Wicketkeeper'),
          ),
          Step(
            title: Text('Scorecard Spells'),
            content: Text('Enter Innings Batting & Bowling runs, wickets, spells'),
          ),
          Step(
            title: Text('Result & Awards'),
            content: Text('Select Match Result, Margin, Player of the Match'),
          ),
        ],
      ),
    );
  }
}

class CricHeroesImportScreen extends StatelessWidget {
  const CricHeroesImportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('CricHeroes PDF Import')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.picture_as_pdf, size: 64, color: Colors.red),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                // Select scorecard PDF via file_picker and upload to Edge Function
              },
              child: const Text('Select CricHeroes Scorecard PDF'),
            ),
          ],
        ),
      ),
    );
  }
}
