import 'package:flutter/material.dart';

class PlayersRosterScreen extends StatelessWidget {
  const PlayersRosterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Academy Players')),
      body: const Center(
        child: Text('Academy Roster players list placeholder'),
      ),
    );
  }
}

class PlayerProfileScreen extends StatelessWidget {
  final String playerMemberId;
  const PlayerProfileScreen({super.key, required this.playerMemberId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Player Profile')),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const CricketCardWidget(
                name: 'Hemu Patel',
                role: 'All Rounder',
                battingStyle: 'Right Hand Bat',
                bowlingStyle: 'Right Arm Off Break',
              ),
              const SizedBox(height: 20),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Career Statistics', style: Theme.of(context).textTheme.titleLarge),
                      const Divider(),
                      const Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          Column(children: [Text('Matches'), Text('12', style: TextStyle(fontWeight: FontWeight.bold))]),
                          Column(children: [Text('Runs'), Text('342', style: TextStyle(fontWeight: FontWeight.bold))]),
                          Column(children: [Text('Batting Avg'), Text('31.09', style: TextStyle(fontWeight: FontWeight.bold))]),
                          Column(children: [Text('Wickets'), Text('15', style: TextStyle(fontWeight: FontWeight.bold))]),
                          Column(children: [Text('Bowling Econ'), Text('5.80', style: TextStyle(fontWeight: FontWeight.bold))]),
                        ],
                      )
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Center(
                    child: Text('fl_chart: Career Runs & Wickets form trends visualization'),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class CricketCardWidget extends StatelessWidget {
  final String name;
  final String role;
  final String battingStyle;
  final String bowlingStyle;

  const CricketCardWidget({
    super.key,
    required this.name,
    required this.role,
    required this.battingStyle,
    required this.bowlingStyle,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.green.shade900,
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(name, style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 5),
            Text(role, style: TextStyle(color: Colors.green.shade200, fontSize: 16)),
            const Divider(color: Colors.white24),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('BATTING STYLE', style: TextStyle(color: Colors.white54, fontSize: 10)),
                    Text(battingStyle, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('BOWLING STYLE', style: TextStyle(color: Colors.white54, fontSize: 10)),
                    Text(bowlingStyle, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
            )
          ],
        ),
      ),
    );
  }
}
