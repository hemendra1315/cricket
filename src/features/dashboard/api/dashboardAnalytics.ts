/* eslint-disable @typescript-eslint/no-explicit-any */
import { unwrap } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';
import type { UUID } from '@/types';

// ============================================================
// OWNER DASHBOARD ANALYTICS
// ============================================================

export async function fetchOwnerDashboardAnalytics(academyId: UUID) {
  const [
    playersResult,
    coachesResult,
    batchesResult,
    matchesResult,
    attendanceResult,
    sessionsResult,
    recentMatchesResult,
    upcomingSessionsResult,
    activityResult,
    topBattersResult,
    topBowlersResult,
    topFieldersResult,
    academyRecordsResult,
  ] = await Promise.all([
    // Total active players
    unwrap<any[]>(
      (supabase as any)
        .from('academy_members')
        .select('id')
        .eq('academy_id', academyId)
        .eq('role', 'player')
        .eq('status', 'active'),
    ),
    // Total active coaches
    unwrap<any[]>(
      (supabase as any)
        .from('academy_members')
        .select('id')
        .eq('academy_id', academyId)
        .eq('role', 'coach')
        .eq('status', 'active'),
    ),
    // Total batches (no status column on batches table)
    unwrap<any[]>((supabase as any).from('batches').select('id').eq('academy_id', academyId)),
    // Total matches
    unwrap<any[]>((supabase as any).from('matches').select('id').eq('academy_id', academyId)),
    // Attendance records (join through training_sessions for session_date)
    unwrap<any[]>(
      (supabase as any)
        .from('attendance')
        .select('status, session:training_sessions(session_date)')
        .eq('academy_id', academyId),
    ),
    // Sessions this week
    unwrap<any[]>(
      (supabase as any)
        .from('training_sessions')
        .select('id')
        .eq('academy_id', academyId)
        .gte(
          'session_date',
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        ),
    ),
    // Recent matches
    unwrap<any[]>(
      (supabase as any)
        .from('matches')
        .select('id, match_name, match_date, opponent_name, result, team_score, wickets_lost')
        .eq('academy_id', academyId)
        .order('match_date', { ascending: false })
        .limit(5),
    ),
    // Upcoming sessions
    unwrap<any[]>(
      (supabase as any)
        .from('training_sessions')
        .select(
          'id, title, session_date, start_at, end_at, batch_id, coach_id, batches!inner(name), academy_members!training_sessions_coach_id_fkey!inner(id, profiles!academy_members_user_id_fkey!inner(full_name))',
        )
        .eq('academy_id', academyId)
        .eq('status', 'scheduled')
        .gte('session_date', new Date().toISOString().split('T')[0])
        .order('session_date', { ascending: true })
        .limit(5),
    ),
    // Recent activity
    unwrap<any[]>(
      (supabase as any)
        .from('activity_log')
        .select('id, activity_type, description, created_at')
        .eq('academy_id', academyId)
        .order('created_at', { ascending: false })
        .limit(10),
    ),
    // Top batters
    unwrap<any[]>(
      (supabase as any)
        .from('player_statistics')
        .select(
          'player_id, batting_runs, batting_innings, academy_members!player_statistics_player_id_fkey!inner(id, profiles!academy_members_user_id_fkey!inner(full_name))',
        )
        .eq('academy_id', academyId)
        .order('batting_runs', { ascending: false })
        .limit(5),
    ),
    // Top bowlers
    unwrap<any[]>(
      (supabase as any)
        .from('player_statistics')
        .select(
          'player_id, bowling_wickets, bowling_runs_conceded, bowling_overs, academy_members!player_statistics_player_id_fkey!inner(id, profiles!academy_members_user_id_fkey!inner(full_name))',
        )
        .eq('academy_id', academyId)
        .order('bowling_wickets', { ascending: false })
        .limit(5),
    ),
    // Top fielders
    unwrap<any[]>(
      (supabase as any)
        .from('player_statistics')
        .select(
          'player_id, fielding_catches, fielding_run_outs, academy_members!player_statistics_player_id_fkey!inner(id, profiles!academy_members_user_id_fkey!inner(full_name))',
        )
        .eq('academy_id', academyId)
        .order('fielding_catches', { ascending: false })
        .limit(5),
    ),
    // Academy records
    unwrap<any[]>(
      (supabase as any)
        .from('academy_records')
        .select('*')
        .eq('academy_id', academyId)
        .order('achieved_at', { ascending: false })
        .limit(10),
    ),
  ]);

  const totalPlayers = playersResult.length;
  const totalCoaches = coachesResult.length;
  const totalBatches = batchesResult.length;
  const totalMatches = matchesResult.length;

  const totalAttendance = attendanceResult.length;
  const attendedAttendance = attendanceResult.filter((a: any) => a.status === 'present').length;
  const attendancePercentage =
    totalAttendance > 0 ? Math.round((attendedAttendance / totalAttendance) * 100) : 0;

  const sessionsThisWeek = sessionsResult.length;

  const recentMatches = (recentMatchesResult ?? []).map((match: any) => ({
    id: match.id,
    matchName: match.match_name,
    matchDate: match.match_date,
    opponentName: match.opponent_name,
    result: match.result,
    teamScore: match.team_score,
    wicketsLost: match.wickets_lost,
  }));

  const upcomingSessions = (upcomingSessionsResult ?? []).map((session: any) => ({
    id: session.id,
    title: session.title,
    sessionDate: session.session_date,
    startAt: session.start_at,
    endAt: session.end_at,
    batchName: session.batches?.name ?? null,
    coach: {
      fullName: session.academy_members?.profiles?.full_name ?? null,
      email: '',
      avatarUrl: null,
    },
  }));

  const activities = (activityResult ?? []).map((activity: any) => ({
    id: activity.id,
    type: activity.activity_type as any,
    message: activity.description,
    timestamp: activity.created_at,
  }));

  const topBatters = (topBattersResult ?? []).map((player: any) => ({
    id: player.player_id,
    name: player.academy_members?.profiles?.full_name ?? 'Unknown',
    runs: player.batting_runs,
    average:
      player.batting_innings > 0
        ? (player.batting_runs / player.batting_innings).toFixed(2)
        : '0.00',
    href: `/members/${player.player_id}`,
  }));

  const topBowlers = (topBowlersResult ?? []).map((player: any) => ({
    id: player.player_id,
    name: player.academy_members?.profiles?.full_name ?? 'Unknown',
    wickets: player.bowling_wickets,
    economy:
      player.bowling_overs > 0
        ? (player.bowling_runs_conceded / player.bowling_overs).toFixed(2)
        : '0.00',
    href: `/members/${player.player_id}`,
  }));

  const topFielders = (topFieldersResult ?? []).map((player: any) => ({
    id: player.player_id,
    name: player.academy_members?.profiles?.full_name ?? 'Unknown',
    catches: player.fielding_catches,
    runOuts: player.fielding_run_outs,
    href: `/members/${player.player_id}`,
  }));

  const academyRecords = (academyRecordsResult ?? []).map((record: any) => ({
    id: record.id,
    recordType: record.record_type,
    value: record.value_text ?? record.value_numeric?.toString(),
    achievedAt: record.achieved_at,
    matchId: record.match_id,
    href: record.match_id ? `/matches/${record.match_id}` : '#',
  }));

  return {
    totalPlayers,
    totalCoaches,
    totalBatches,
    totalMatches,
    attendancePercentage,
    sessionsThisWeek,
    recentMatches,
    upcomingSessions,
    activities,
    topBatters,
    topBowlers,
    topFielders,
    academyRecords,
  };
}

// ============================================================
// COACH DASHBOARD ANALYTICS
// ============================================================

export async function fetchCoachDashboardAnalytics(academyId: UUID, coachId: UUID) {
  const [
    todaySessionResult,
    recentMatchesResult,
    assignedBatchesResult,
    playersNeedingAttentionResult,
  ] = await Promise.all([
    // Today's session
    unwrap<any[]>(
      (supabase as any)
        .from('training_sessions')
        .select('id, title, start_at, end_at, batch_id, batches!inner(name)')
        .eq('academy_id', academyId)
        .eq('coach_id', coachId)
        .eq('session_date', new Date().toISOString().split('T')[0])
        .neq('status', 'cancelled')
        .order('start_at', { ascending: true })
        .limit(1),
    ),
    // Last 5 matches
    unwrap<any[]>(
      (supabase as any)
        .from('matches')
        .select('id, match_name, match_date, opponent_name, result, team_score')
        .eq('academy_id', academyId)
        .order('match_date', { ascending: false })
        .limit(5),
    ),
    // Assigned batches. Player counts come from a batch_members aggregate embed
    // (there is no player_count column on batches itself), which keeps the query
    // free of the nonexistent status/player_count columns that caused the old 400.
    unwrap<any[]>(
      (supabase as any)
        .from('batches')
        .select(
          'id, name, age_group, training_days, training_time, player_count:batch_members!left(count)',
        )
        .eq('academy_id', academyId)
        .eq('coach_id', coachId),
    ),
    // Players needing attention
    unwrap<any[]>(
      (supabase as any)
        .from('academy_members')
        .select('id, profiles!academy_members_user_id_fkey!inner(full_name, email)')
        .eq('academy_id', academyId)
        .eq('role', 'player')
        .eq('status', 'active'),
    ),
  ]);

  const todaySession = todaySessionResult[0] ?? null;

  const recentMatches = (recentMatchesResult ?? []).map((match: any) => ({
    id: match.id,
    matchName: match.match_name,
    matchDate: match.match_date,
    opponentName: match.opponent_name,
    result: match.result,
    teamScore: match.team_score,
  }));

  const assignedBatches = (assignedBatchesResult ?? []).map((batch: any) => ({
    id: batch.id,
    name: batch.name,
    ageGroup: batch.age_group,
    playerCount: batch.player_count?.[0]?.count ?? 0,
    trainingDays: batch.training_days,
    trainingTime: batch.training_time,
  }));

  // Calculate team performance
  const wins = recentMatches.filter((m) => m.result === 'won').length;
  const losses = recentMatches.filter((m) => m.result === 'lost').length;

  // Get players needing attention
  const playersNeedingAttention = [];
  for (const player of playersNeedingAttentionResult ?? []) {
    const [attendanceResult, drillsResult, feedbackResult] = await Promise.all([
      unwrap<any[]>(
        (supabase as any)
          .from('attendance')
          .select('status, session:training_sessions(session_date)')
          .eq('academy_id', academyId)
          .eq('player_id', player.id)
          .gte(
            'session.session_date',
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          ),
      ),
      unwrap<any[]>(
        (supabase as any)
          .from('drill_assignments')
          .select('status')
          .eq('academy_id', academyId)
          .eq('player_id', player.id)
          .eq('status', 'assigned'),
      ),
      unwrap<any[]>(
        (supabase as any)
          .from('match_coach_notes')
          .select('id, match:matches!inner(academy_id)')
          .eq('match.academy_id', academyId)
          .eq('academy_member_id', player.id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      ),
    ]);

    const attendanceRate =
      attendanceResult.length > 0
        ? (attendanceResult.filter((a: any) => a.status === 'present').length /
            attendanceResult.length) *
          100
        : 0;

    const issues: string[] = [];
    if (attendanceRate < 70) issues.push('Low attendance');
    if (drillsResult.length > 0) issues.push('Pending drills');
    if (feedbackResult.length === 0) issues.push('No recent feedback');

    if (issues.length > 0) {
      playersNeedingAttention.push({
        id: player.id,
        name: player.profiles?.full_name ?? 'Unknown',
        issues,
        attendanceRate: Math.round(attendanceRate),
      });
    }
  }

  return {
    todaySession,
    recentMatches,
    assignedBatches,
    wins,
    losses,
    playersNeedingAttention,
  };
}

// ============================================================
// PLAYER DASHBOARD ANALYTICS
// ============================================================

export async function fetchPlayerDashboardAnalytics(academyId: UUID, playerId: UUID) {
  const [
    statsResult,
    battingRows,
    bowlingRows,
    awardsRowsForRecent,
    upcomingSessionsResult,
    assignmentsResult,
    awardsResult,
    highlightsResult,
    chartDataResult,
  ] = await Promise.all([
    // Player statistics
    unwrap<any>(
      (supabase as any)
        .from('player_statistics')
        .select('*')
        .eq('academy_id', academyId)
        .eq('player_id', playerId)
        .maybeSingle(),
    ),
    // Recent matches – batting
    unwrap<any[]>(
      (supabase as any)
        .from('match_batting')
        .select(
          `
          match_id,
          runs, balls, fours, sixes, is_out,
          matches!inner(id, match_name, match_date, opponent_name, result)
        `,
        )
        .eq('academy_member_id', playerId)
        .eq('matches.academy_id', academyId)
        .eq('matches.status', 'completed')
        .order('matches.match_date', { ascending: false })
        .limit(5),
    ),
    // Bowling (joined in app)
    unwrap<any[]>(
      (supabase as any)
        .from('match_bowling')
        .select(
          `
          match_id,
          overs, maidens, runs_conceded, wickets, wides, no_balls,
          matches!inner(id, match_name, match_date)
        `,
        )
        .eq('academy_member_id', playerId)
        .eq('matches.academy_id', academyId)
        .eq('matches.status', 'completed')
        .order('matches.match_date', { ascending: false })
        .limit(5),
    ),
    // Awards (joined in app)
    unwrap<any[]>(
      (supabase as any)
        .from('match_awards')
        .select(
          `
          match_id,
          player_of_match_id, best_batter_id, best_bowler_id, best_fielder_id,
          matches!inner(id, match_name, match_date)
        `,
        )
        .eq('matches.academy_id', academyId)
        .eq('matches.status', 'completed')
        .or(
          `player_of_match_id.eq.${playerId},best_batter_id.eq.${playerId},best_bowler_id.eq.${playerId},best_fielder_id.eq.${playerId}`,
        )
        .order('matches.match_date', { ascending: false })
        .limit(5),
    ),
    // Upcoming sessions
    unwrap<any[]>(
      (supabase as any)
        .from('training_sessions')
        .select(
          `
          id, title, session_date, start_at, end_at,
          academy_members!training_sessions_coach_id_fkey!inner(id, profiles!academy_members_user_id_fkey!inner(full_name))
        `,
        )
        .eq('academy_id', academyId)
        .eq('status', 'scheduled')
        .gte('session_date', new Date().toISOString().split('T')[0])
        .order('session_date', { ascending: true })
        .limit(3),
    ),
    // Drill assignments
    unwrap<any[]>(
      (supabase as any)
        .from('drill_assignments')
        .select(
          `
          id, status, assigned_at, due_date,
          drills!inner(name, category)
        `,
        )
        .eq('academy_id', academyId)
        .eq('player_id', playerId)
        .order('assigned_at', { ascending: false })
        .limit(10),
    ),
    // Awards
    unwrap<any[]>(
      (supabase as any)
        .from('match_awards')
        .select(
          `
          id, match_id,
          matches!inner(match_name, match_date)
        `,
        )
        .eq('matches.status', 'completed')
        .or(
          `player_of_match_id.eq.${playerId},best_batter_id.eq.${playerId},best_bowler_id.eq.${playerId},best_fielder_id.eq.${playerId}`,
        )
        .order('matches.match_date', { ascending: false })
        .limit(5),
    ),
    // Career highlights
    unwrap<any[]>(
      (supabase as any)
        .from('player_milestones')
        .select('milestone_type, achieved_at, match_id')
        .eq('academy_id', academyId)
        .eq('player_id', playerId)
        .order('achieved_at', { ascending: false })
        .limit(10),
    ),
    // Chart data
    unwrap<any[]>(
      (supabase as any)
        .from('match_batting')
        .select(
          `
          runs, balls,
          matches!inner(match_date)
        `,
        )
        .eq('academy_member_id', playerId)
        .order('matches.match_date', { ascending: true })
        .limit(10),
    ),
  ]);

  const stats = statsResult
    ? {
        matchesPlayed: statsResult.matches_played,
        battingRuns: statsResult.batting_runs,
        bowlingWickets: statsResult.bowling_wickets,
        battingAverage:
          statsResult.batting_innings > 0
            ? (statsResult.batting_runs / statsResult.batting_innings).toFixed(2)
            : '0.00',
        strikeRate:
          (statsResult.balls_faced_sum ?? 0) > 0
            ? ((statsResult.batting_runs / statsResult.balls_faced_sum) * 100).toFixed(2)
            : '0.00',
        economy:
          statsResult.bowling_overs > 0
            ? (statsResult.bowling_runs_conceded / statsResult.bowling_overs).toFixed(2)
            : '0.00',
        attendancePercentage: 0,
      }
    : null;

  const battingByMatch = new Map<string, any>();
  for (const row of battingRows) {
    const match = row.matches;
    battingByMatch.set(match.id, {
      id: match.id,
      matchName: match.match_name,
      matchDate: match.match_date,
      opponentName: match.opponent_name,
      result: match.result,
      batting: { runs: row.runs, balls: row.balls },
      bowling: null,
      awards: {
        playerOfMatch: false,
        bestBatter: false,
        bestBowler: false,
        bestFielder: false,
      },
    });
  }

  for (const row of bowlingRows) {
    const match = row.matches;
    const existing = battingByMatch.get(match.id) ?? {
      id: match.id,
      matchName: match.match_name,
      matchDate: match.match_date,
      opponentName: match.opponent_name,
      result: match.result,
      batting: null,
      awards: {
        playerOfMatch: false,
        bestBatter: false,
        bestBowler: false,
        bestFielder: false,
      },
    };
    existing.bowling = {
      wickets: row.wickets,
      runsConceded: row.runs_conceded,
    };
    battingByMatch.set(match.id, existing);
  }

  for (const row of awardsRowsForRecent) {
    const match = row.matches;
    const existing = battingByMatch.get(match.id) ?? {
      id: match.id,
      matchName: match.match_name,
      matchDate: match.match_date,
      opponentName: match.opponent_name,
      result: match.result,
      batting: null,
      bowling: null,
      awards: {
        playerOfMatch: false,
        bestBatter: false,
        bestBowler: false,
        bestFielder: false,
      },
    };
    existing.awards = {
      playerOfMatch: row.player_of_match_id === playerId,
      bestBatter: row.best_batter_id === playerId,
      bestBowler: row.best_bowler_id === playerId,
      bestFielder: row.best_fielder_id === playerId,
    };
    battingByMatch.set(match.id, existing);
  }

  const recentMatches = Array.from(battingByMatch.values())
    .sort((a, b) => b.matchDate.localeCompare(a.matchDate))
    .slice(0, 5);

  const upcomingSessions = (upcomingSessionsResult ?? []).map((session: any) => ({
    id: session.id,
    title: session.title,
    sessionDate: session.session_date,
    startAt: session.start_at,
    endAt: session.end_at,
    coach: {
      fullName: session.academy_members?.profiles?.full_name ?? null,
      email: '',
      avatarUrl: null,
    },
  }));

  const pendingAssignments = (assignmentsResult ?? []).filter((a: any) => a.status === 'assigned');
  const completedAssignments = (assignmentsResult ?? []).filter(
    (a: any) => a.status === 'completed',
  );

  const recentAwards = (awardsResult ?? []).map((award: any) => ({
    id: award.id,
    matchId: award.match_id,
    matchName: award.matches?.match_name ?? 'Unknown',
    matchDate: award.matches?.match_date ?? null,
  }));

  const careerHighlights = (highlightsResult ?? []).map((milestone: any) => ({
    type: milestone.milestone_type,
    label: milestone.milestone_type.replace(/_/g, ' '),
    value: null,
    matchId: milestone.match_id,
    matchName: null,
  }));

  // Calculate runs trend
  const runsTrend = (chartDataResult ?? []).map((row: any) => ({
    matchName: '',
    matchDate: row.matches?.match_date ?? '',
    runs: row.runs,
  }));

  return {
    stats,
    recentMatches,
    upcomingSessions,
    pendingAssignments,
    completedAssignments,
    recentAwards,
    careerHighlights,
    runsTrend,
  };
}
