#!/usr/bin/env ts-node

// Cricket Academy Manager - Demo Data Seed Script
// Run with: npx ts-node seed/seed.ts
// Or: npm run seed (if configured in package.json)

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as crypto from 'crypto';
import {
  ACADEMY,
  OWNER,
  COACHES,
  BATCHES,
  PLAYERS,
  OPPONENTS,
  SESSION_TITLES,
  DRILL_NAMES,
  randomDate,
  randomInt,
  randomDecimal,
  weightedRandom,
  generateTeamScore,
  generateBattingPerformance,
  generateBowlingPerformance,
  generateFieldingPerformance,
} from './demo-data';

// Load environment variables
dotenv.config({ path: '.env' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL (or SUPABASE_URL)');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n💡 Tip: Add these to your .env file or environment.');
  process.exit(1);
}

// Use service role key for seeding (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface SeedResult {
  academyId: string;
  ownerId: string;
  coachIds: string[];
  batchIds: string[];
  playerIds: string[];
  sessionIds: string[];
  matchIds: string[];
}

// Helper: Sleep for async operations
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Generate UUID (compatible with Postgres gen_random_uuid)
function uuid(): string {
  return crypto.randomUUID();
}

// Helper: Hash password (simple SHA256 for demo - use proper hashing in production)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seedAcademy(): Promise<{ academyId: string; ownerId: string }> {
  console.log('🏏 Creating academy...');

  // Create academy
  const { data: academy, error: academyError } = await supabase
    .from('academies')
    .insert({
      name: ACADEMY.name,
      city: ACADEMY.city,
      state: ACADEMY.state,
      country: ACADEMY.country,
      join_code: 'DEMO' + randomInt(1000, 9999),
    })
    .select()
    .single();

  if (academyError || !academy) {
    throw new Error(`Failed to create academy: ${academyError?.message}`);
  }

  console.log(`✅ Academy created: ${academy.name} (${academy.id})`);
  return { academyId: academy.id, ownerId: '' };
}

async function seedUsers(academyId: string): Promise<{ ownerId: string; coachIds: string[] }> {
  console.log('\n👥 Creating users...');

  const ownerId = uuid();
  const coachIds: string[] = [];

  // Create owner profile
  const { error: ownerProfileError } = await supabase
    .from('profiles')
    .insert({
      id: ownerId,
      email: OWNER.email,
      full_name: OWNER.fullName,
      phone: OWNER.phone,
      password_hash: hashPassword(OWNER.password),
    });

  if (ownerProfileError) {
    throw new Error(`Failed to create owner profile: ${ownerProfileError.message}`);
  }

  // Create owner membership
  const { error: ownerMemberError } = await supabase
    .from('academy_members')
    .insert({
      academy_id: academyId,
      user_id: ownerId,
      role: 'academy_owner',
      status: 'active',
    });

  if (ownerMemberError) {
    throw new Error(`Failed to create owner membership: ${ownerMemberError.message}`);
  }

  console.log(`✅ Owner created: ${OWNER.email}`);

  // Create coaches
  for (const coach of COACHES) {
    const coachId = uuid();
    const { error: coachProfileError } = await supabase
      .from('profiles')
      .insert({
        id: coachId,
        email: coach.email,
        full_name: coach.fullName,
        phone: coach.phone,
        password_hash: hashPassword(coach.password),
      });

    if (coachProfileError) {
      console.warn(`⚠️  Failed to create coach ${coach.email}: ${coachProfileError.message}`);
      continue;
    }

    const { error: coachMemberError } = await supabase
      .from('academy_members')
      .insert({
        academy_id: academyId,
        user_id: coachId,
        role: 'coach',
        status: 'active',
      });

    if (coachMemberError) {
      console.warn(`⚠️  Failed to create coach membership: ${coachMemberError.message}`);
      continue;
    }

    coachIds.push(coachId);
    console.log(`✅ Coach created: ${coach.email}`);
  }

  return { ownerId, coachIds };
}

async function seedBatches(academyId: string, coachIds: string[]): Promise<string[]> {
  console.log('\n📦 Creating batches...');

  const batchIds: string[] = [];

  for (let i = 0; i < BATCHES.length; i++) {
    const batch = BATCHES[i];
    const coachId = coachIds[i % coachIds.length];

    const { data: batchData, error: batchError } = await supabase
      .from('batches')
      .insert({
        academy_id: academyId,
        name: batch.name,
        age_group: batch.ageGroup,
        coach_id: coachId,
        training_days: batch.trainingDays,
        training_time: batch.trainingTime,
        status: 'active',
      })
      .select()
      .single();

    if (batchError || !batchData) {
      console.warn(`⚠️  Failed to create batch ${batch.name}: ${batchError?.message}`);
      continue;
    }

    batchIds.push(batchData.id);
    console.log(`✅ Batch created: ${batch.name} (${batchData.id})`);
  }

  return batchIds;
}

async function seedPlayers(academyId: string, batchIds: string[]): Promise<string[]> {
  console.log('\n🏃 Creating players...');

  const playerIds: string[] = [];

  for (const player of PLAYERS) {
    const playerId = uuid();
    const batchId = batchIds[player.batchIndex];

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: playerId,
        email: `player${player.jerseyNumber}@demo.com`,
        full_name: player.fullName,
        phone: '+91987654' + String(randomInt(1000, 9999)),
        password_hash: hashPassword('Demo@123456'),
      });

    if (profileError) {
      console.warn(`⚠️  Failed to create profile for ${player.fullName}: ${profileError.message}`);
      continue;
    }

    // Create academy member
    const { error: memberError } = await supabase
      .from('academy_members')
      .insert({
        academy_id: academyId,
        user_id: playerId,
        role: 'player',
        status: 'active',
        joined_at: randomDate(365).toISOString().split('T')[0],
      });

    if (memberError) {
      console.warn(`⚠️  Failed to create member for ${player.fullName}: ${memberError.message}`);
      continue;
    }

    // Add to batch
    if (batchId) {
      const { error: batchMemberError } = await supabase
        .from('batch_members')
        .insert({
          batch_id: batchId,
          player_id: playerId,
        });

      if (batchMemberError) {
        console.warn(`⚠️  Failed to add ${player.fullName} to batch: ${batchMemberError.message}`);
      }
    }

    playerIds.push(playerId);
    console.log(`✅ Player created: ${player.fullName} (player${player.jerseyNumber}@demo.com)`);
  }

  return playerIds;
}

async function seedSessions(academyId: string, batchIds: string[], coachIds: string[]): Promise<string[]> {
  console.log('\n📅 Creating training sessions...');

  const sessionIds: string[] = [];

  for (let i = 0; i < 40; i++) {
    const sessionDate = randomDate(60);
    const batchId = batchIds[randomInt(0, batchIds.length - 1)];
    const coachId = coachIds[randomInt(0, coachIds.length - 1)];

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        academy_id: academyId,
        title: SESSION_TITLES[randomInt(0, SESSION_TITLES.length - 1)],
        session_date: sessionDate.toISOString().split('T')[0],
        start_at: `0${randomInt(6, 9)}:00`,
        end_at: `0${randomInt(6, 9)}:30`,
        batch_id: batchId,
        coach_id: coachId,
        status: 'completed',
        ground: 'Main Ground',
      })
      .select()
      .single();

    if (sessionError || !session) {
      console.warn(`⚠️  Failed to create session: ${sessionError?.message}`);
      continue;
    }

    sessionIds.push(session.id);
  }

  console.log(`✅ Created ${sessionIds.length} training sessions`);
  return sessionIds;
}

async function seedAttendance(academyId: string, sessionIds: string[], playerIds: string[]): Promise<void> {
  console.log('\n✅ Creating attendance records...');

  let attendanceCount = 0;

  for (const sessionId of sessionIds) {
    for (const playerId of playerIds) {
      const status = Math.random() > 0.2 ? 'present' : 'absent';

      const { error } = await supabase
        .from('attendance')
        .insert({
          academy_id: academyId,
          session_id: sessionId,
          player_id: playerId,
          status,
          marked_by: null,
        });

      if (!error) {
        attendanceCount++;
      }
    }
  }

  console.log(`✅ Created ${attendanceCount} attendance records`);
}

async function seedDrills(academyId: string, playerIds: string[]): Promise<void> {
  console.log('\n🎯 Creating drill assignments...');

  let drillCount = 0;

  for (const playerId of playerIds) {
    const numDrills = randomInt(2, 5);

    for (let i = 0; i < numDrills; i++) {
      const drill = DRILL_NAMES[randomInt(0, DRILL_NAMES.length - 1)];
      const status = Math.random() > 0.4 ? 'completed' : 'pending';

      const { error } = await supabase
        .from('drill_assignments')
        .insert({
          academy_id: academyId,
          player_id: playerId,
          drill_name: drill.name,
          drill_category: drill.category,
          status,
          assigned_at: randomDate(30).toISOString(),
          due_date: randomDate(15).toISOString().split('T')[0],
        });

      if (!error) {
        drillCount++;
      }
    }
  }

  console.log(`✅ Created ${drillCount} drill assignments`);
}

async function seedMatches(academyId: string, playerIds: string[], coachIds: string[]): Promise<string[]> {
  console.log('\n🏆 Creating matches...');

  const matchIds: string[] = [];

  for (let i = 0; i < 25; i++) {
    const matchDate = randomDate(90);
    const isT20 = Math.random() > 0.5;
    const overs = isT20 ? 20 : 50;
    const teamScore = generateTeamScore(overs, isT20);

    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert({
        academy_id: academyId,
        match_name: `Match ${i + 1} vs ${OPPONENTS[i % OPPONENTS.length]}`,
        match_date: matchDate.toISOString().split('T')[0],
        venue: 'Main Cricket Ground',
        opponent_name: OPPONENTS[i % OPPONENTS.length],
        tournament: Math.random() > 0.5 ? 'League 2024' : null,
        match_type: weightedRandom([
          { value: 'practice', weight: 30 },
          { value: 'friendly', weight: 50 },
          { value: 'league', weight: 15 },
          { value: 'tournament', weight: 5 },
        ]),
        format: isT20 ? 't20' : 'odi',
        overs,
        team_score: `${teamScore.runs}/${teamScore.wickets}`,
        wickets_lost: teamScore.wickets,
        overs_played: teamScore.overs,
        result: weightedRandom([
          { value: 'won', weight: 60 },
          { value: 'lost', weight: 35 },
          { value: 'tie', weight: 5 },
        ]),
        winning_margin: `by ${randomInt(5, 50)} runs`,
        status: 'completed',
        created_by: coachIds[0],
      })
      .select()
      .single();

    if (matchError || !match) {
      console.warn(`⚠️  Failed to create match ${i + 1}: ${matchError?.message}`);
      continue;
    }

    // Create lineup (11 players)
    const shuffledPlayers = [...playerIds].sort(() => Math.random() - 0.5);
    const playingXI = shuffledPlayers.slice(0, 11);

    for (let j = 0; j < playingXI.length; j++) {
      const playerId = playingXI[j];
      const isBatter = PLAYERS.find(p => p.jerseyNumber === j + 1)?.primaryRole !== 'bowler';
      const isBowler = PLAYERS.find(p => p.jerseyNumber === j + 1)?.primaryRole === 'bowler';

      const { error: lineupError } = await supabase
        .from('match_lineups')
        .insert({
          match_id: match.id,
          academy_member_id: playerId,
          batting_order: j + 1,
          is_captain: j === 0,
          is_vice_captain: j === 1,
          is_wicketkeeper: j === 2,
        });

      if (lineupError) {
        console.warn(`⚠️  Failed to create lineup: ${lineupError.message}`);
        continue;
      }

      // Create batting stats
      const batting = generateBattingPerformance(isBatter || Math.random() > 0.5);
      if (batting) {
        await supabase.from('match_batting').insert({
          match_id: match.id,
          academy_member_id: playerId,
          runs: batting.runs,
          balls: batting.balls,
          fours: batting.fours,
          sixes: batting.sixes,
          is_out: batting.isOut,
          dismissal_type: batting.dismissalType,
          batting_order: j + 1,
        });
      }

      // Create bowling stats
      const bowling = generateBowlingPerformance(isBowler || Math.random() > 0.5);
      if (bowling) {
        await supabase.from('match_bowling').insert({
          match_id: match.id,
          academy_member_id: playerId,
          overs: bowling.overs,
          maidens: bowling.maidens,
          runs_conceded: bowling.runsConceded,
          wickets: bowling.wickets,
          wides: bowling.wides,
          no_balls: bowling.noBalls,
        });
      }

      // Create fielding stats
      const fielding = generateFieldingPerformance();
      await supabase.from('match_fielding').insert({
        match_id: match.id,
        academy_member_id: playerId,
        catches: fielding.catches,
        run_outs: fielding.runOuts,
        stumpings: fielding.stumpings,
      });

      // Create coach notes (50% chance)
      if (Math.random() > 0.5) {
        await supabase.from('match_coach_notes').insert({
          match_id: match.id,
          academy_member_id: playerId,
          coach_id: coachIds[randomInt(0, coachIds.length - 1)],
          notes: 'Good performance. Keep practicing!',
        });
      }
    }

    // Create match awards
    const pomId = playingXI[randomInt(0, 10)];
    const bestBatterId = playingXI[randomInt(0, 10)];
    const bestBowlerId = playingXI[randomInt(0, 10)];
    const bestFielderId = playingXI[randomInt(0, 10)];

    await supabase.from('match_awards').insert({
      match_id: match.id,
      player_of_match_id: pomId,
      best_batter_id: bestBatterId,
      best_bowler_id: bestBowlerId,
      best_fielder_id: bestFielderId,
    });

    matchIds.push(match.id);
  }

  console.log(`✅ Created ${matchIds.length} matches with full scorecards`);
  return matchIds;
}

async function seedStatistics(academyId: string, playerIds: string[]): Promise<void> {
  console.log('\n📊 Refreshing player statistics...');

  // The save_match_result RPC should have already created statistics
  // But let's ensure all players have stats by calling refresh_player_statistics
  for (const playerId of playerIds) {
    await supabase.rpc('refresh_player_statistics', {
      p_academy: academyId,
      p_player: playerId,
    });
  }

  console.log(`✅ Statistics refreshed for ${playerIds.length} players`);
}

async function seedAcademyRecords(academyId: string): Promise<void> {
  console.log('\n🏆 Creating academy records...');

  await supabase.rpc('refresh_academy_records', {
    p_academy: academyId,
  });

  console.log('✅ Academy records created');
}

async function main() {
  console.log('🚀 Starting demo data seed...\n');

  try {
    const { academyId } = await seedAcademy();
    const { ownerId, coachIds } = await seedUsers(academyId);
    const batchIds = await seedBatches(academyId, coachIds);
    const playerIds = await seedPlayers(academyId, batchIds);
    const sessionIds = await seedSessions(academyId, batchIds, coachIds);
    await seedAttendance(academyId, sessionIds, playerIds);
    await seedDrills(academyId, playerIds);
    const matchIds = await seedMatches(academyId, playerIds, coachIds);
    await seedStatistics(academyId, playerIds);
    await seedAcademyRecords(academyId);

    console.log('\n✨ Demo data seeded successfully!\n');
    console.log('📋 Summary:');
    console.log(`   Academy: ${ACADEMY.name}`);
    console.log(`   Owner: ${OWNER.email}`);
    console.log(`   Coaches: ${COACHES.map(c => c.email).join(', ')}`);
    console.log(`   Players: ${PLAYERS.length} (player1@demo.com - player20@demo.com)`);
    console.log(`   Batches: ${BATCHES.map(b => b.name).join(', ')}`);
    console.log(`   Sessions: ${sessionIds.length}`);
    console.log(`   Matches: ${matchIds.length}`);
    console.log('\n🔑 Demo Credentials (all use password: Demo@123456):');
    console.log(`   Owner:  ${OWNER.email}`);
    COACHES.forEach(coach => {
      console.log(`   Coach:  ${coach.email}`);
    });
    console.log(`   Players: player1@demo.com through player20@demo.com`);
    console.log('\n🌐 Access the app at: http://localhost:5173');
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
}

main();