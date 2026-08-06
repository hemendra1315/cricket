/* eslint-disable @typescript-eslint/no-explicit-any */
import { unwrap } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';
import type { UUID } from '@/types';
import type {
  PlayerAward,
  PlayerAttendanceSummary,
  PlayerCareerHighlight,
  PlayerChartData,
  PlayerCoachNote,
  PlayerDrillSummary,
  PlayerMatch,
  PlayerMilestone,
  PlayerProfile,
  PlayerStatistics,
} from './playersTypes';

// ============================================================
// PLAYER PROFILE
// ============================================================

export async function fetchPlayerProfile(academyId: UUID, playerId: UUID): Promise<PlayerProfile> {
  const row = await unwrap<any>(
    (supabase as any)
      .from('academy_members')
      .select(
        `
        id, academy_id, user_id, role, status, joined_at, 
        profiles!academy_members_user_id_fkey!inner(full_name, email, avatar_url, phone),
        batch_members!left(batch_id, batches!inner(id, name))
      `,
      )
      .eq('academy_id', academyId)
      .eq('id', playerId)
      .maybeSingle(),
  );

  if (!row) {
    throw new Error('Player not found');
  }

  return {
    id: row.id,
    academyId: row.academy_id,
    userId: row.user_id,
    fullName: row.profiles?.full_name ?? null,
    email: row.profiles?.email ?? '',
    avatarUrl: row.profiles?.avatar_url ?? null,
    phone: row.profiles?.phone ?? null,
    role: row.role,
    status: row.status,
    joinedAt: row.joined_at,
    battingStyle: null,
    bowlingStyle: null,
    jerseyNumber: null,
    batchId: row.batch_members?.batch_id ?? null,
    batchName: row.batch_members?.batches?.name ?? null,
  };
}

// ============================================================
// PLAYER STATISTICS
// ============================================================

export async function fetchPlayerStatistics(academyId: UUID, playerId: UUID): Promise<PlayerStatistics | null> {
  const row = await unwrap<any>(
    (supabase as any)
      .from('player_statistics')
      .select('*')
      .eq('academy_id', academyId)
      .eq('player_id', playerId)
      .maybeSingle(),
  );

  if (!row) return null;

  return {
    id: row.id,
    academyId: row.academy_id,
    playerId: row.player_id,
    matchesPlayed: row.matches_played,
    battingInnings: row.batting_innings,
    battingRuns: row.batting_runs,
    battingHighestScore: row.batting_highest_score,
    battingNotOuts: row.batting_not_outs,
    battingFifties: row.batting_fifties,
    battingCenturies: row.batting_centuries,
    battingFours: row.batting_fours,
    battingSixes: row.batting_sixes,
    bowlingInnings: row.bowling_innings,
    bowlingOvers: row.bowling_overs,
    bowlingMaidens: row.bowling_maidens,
    bowlingRunsConceded: row.bowling_runs_conceded,
    bowlingWickets: row.bowling_wickets,
    bowlingBestBowling: row.bowling_best_bowling,
    fieldingCatches: row.fielding_catches,
    fieldingRunOuts: row.fielding_run_outs,
    fieldingStumpings: row.fielding_stumpings,
    awardsPlayerOfMatch: row.awards_player_of_match,
    awardsBestBatter: row.awards_best_batter,
    awardsBestBowler: row.awards_best_bowler,
    awardsBestFielder: row.awards_best_fielder,
  };
}

// ============================================================
// PLAYER MATCHES
// ============================================================

export async function fetchPlayerMatches(academyId: UUID, playerId: UUID): Promise<PlayerMatch[]> {
  const rows = await unwrap<any[]>(
    (supabase as any)
      .from('match_lineups')
      .select(
        `
        match_id,
        matches!inner(
          id, match_name, match_date, opponent_name, tournament, match_type, format, result, winning_margin, status
        ),
        match_batting!left(
          runs, balls, fours, sixes, is_out, dismissal_type
        ),
        match_bowling!left(
          overs, maidens, runs_conceded, wickets, wides, no_balls
        ),
        match_fielding!left(
          catches, run_outs, stumpings
        ),
        match_awards!left(
          player_of_match_id, best_batter_id, best_bowler_id, best_fielder_id
        )
      `,
      )
      .eq('academy_members.academy_id', academyId)
      .eq('academy_member_id', playerId)
      .eq('matches.status', 'completed')
      .order('matches.match_date', { ascending: false }),
  );

  return rows.map((row: any) => {
    const match = row.matches;
    const batting = row.match_batting?.[0] ?? null;
    const bowling = row.match_bowling?.[0] ?? null;
    const fielding = row.match_fielding?.[0] ?? null;
    const awards = row.match_awards?.[0] ?? null;

    return {
      id: match.id,
      matchName: match.match_name,
      matchDate: match.match_date,
      opponentName: match.opponent_name,
      tournament: match.tournament,
      matchType: match.match_type,
      format: match.format,
      result: match.result,
      winningMargin: match.winning_margin,
      status: match.status,
      batting: batting
        ? {
            runs: batting.runs,
            balls: batting.balls,
            fours: batting.fours,
            sixes: batting.sixes,
            isOut: batting.is_out,
            dismissalType: batting.dismissal_type,
          }
        : null,
      bowling: bowling
        ? {
            overs: bowling.overs,
            maidens: bowling.maidens,
            runsConceded: bowling.runs_conceded,
            wickets: bowling.wickets,
            wides: bowling.wides,
            noBalls: bowling.no_balls,
          }
        : null,
      fielding: fielding
        ? {
            catches: fielding.catches,
            runOuts: fielding.run_outs,
            stumpings: fielding.stumpings,
          }
        : null,
      awards: {
        playerOfMatch: awards?.player_of_match_id === playerId,
        bestBatter: awards?.best_batter_id === playerId,
        bestBowler: awards?.best_bowler_id === playerId,
        bestFielder: awards?.best_fielder_id === playerId,
      },
    };
  });
}

// ============================================================
// PLAYER AWARDS
// ============================================================

export async function fetchPlayerAwards(academyId: UUID, playerId: UUID): Promise<PlayerAward[]> {
  const rows = await unwrap<any[]>(
    (supabase as any)
      .from('match_awards')
      .select(
        `
        id, match_id,
        matches!inner(match_name, match_date),
        player_of_match_id, best_batter_id, best_bowler_id, best_fielder_id
      `,
      )
      .eq('matches.academy_id', academyId)
      .eq('matches.status', 'completed')
      .or(`player_of_match_id.eq.${playerId},best_batter_id.eq.${playerId},best_bowler_id.eq.${playerId},best_fielder_id.eq.${playerId}`)
      .order('matches.match_date', { ascending: false }),
  );

  return rows.map((row: any) => {
    const match = row.matches;
    let awardType = '';
    if (row.player_of_match_id === playerId) awardType = 'Player of the Match';
    else if (row.best_batter_id === playerId) awardType = 'Best Batter';
    else if (row.best_bowler_id === playerId) awardType = 'Best Bowler';
    else if (row.best_fielder_id === playerId) awardType = 'Best Fielder';

    return {
      id: row.id,
      matchId: row.match_id,
      matchName: match.match_name,
      matchDate: match.match_date,
      awardType,
    };
  });
}

// ============================================================
// PLAYER MILESTONES
// ============================================================

export async function fetchPlayerMilestones(academyId: UUID, playerId: UUID): Promise<PlayerMilestone[]> {
  const rows = await unwrap<any[]>(
    (supabase as any)
      .from('player_milestones')
      .select('id, milestone_type, achieved_at, match_id')
      .eq('academy_id', academyId)
      .eq('player_id', playerId)
      .order('achieved_at', { ascending: false }),
  );

  return rows.map((row: any) => ({
    id: row.id,
    milestoneType: row.milestone_type,
    achievedAt: row.achieved_at,
    matchId: row.match_id,
  }));
}

// ============================================================
// PLAYER COACH NOTES
// ============================================================

export async function fetchPlayerCoachNotes(academyId: UUID, playerId: UUID): Promise<PlayerCoachNote[]> {
  const rows = await unwrap<any[]>(
    (supabase as any)
      .from('match_coach_notes')
      .select(
        `
        id, match_id, notes, created_at, updated_at,
        matches!inner(match_name, match_date),
        coach:coach_id(profiles!academy_members_user_id_fkey!inner(full_name))
      `,
      )
      .eq('matches.academy_id', academyId)
      .eq('academy_member_id', playerId)
      .order('created_at', { ascending: false }),
  );

  return rows.map((row: any) => ({
    id: row.id,
    matchId: row.match_id,
    matchName: row.matches?.match_name ?? null,
    matchDate: row.matches?.match_date ?? null,
    notes: row.notes,
    coachName: row.coach?.profiles?.full_name ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

// ============================================================
// PLAYER ATTENDANCE SUMMARY
// ============================================================

export async function fetchPlayerAttendanceSummary(
  academyId: UUID,
  playerId: UUID,
): Promise<PlayerAttendanceSummary> {
  const { data: records, error } = await (supabase as any)
    .from('attendance')
    .select('status, session:sessions(session_date)')
    .eq('academy_id', academyId)
    .eq('player_id', playerId);

  if (error) throw error;

  const total = records?.length ?? 0;
  const attended = records?.filter((r: any) => r.status === 'present').length ?? 0;
  const absent = total - attended;
  const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

  const monthlyMap = new Map<string, { attended: number; total: number }>();
  for (const record of records ?? []) {
    const date = new Date(record.session?.session_date ?? '');
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const current = monthlyMap.get(key) ?? { attended: 0, total: 0 };
    current.total += 1;
    if (record.status === 'present') current.attended += 1;
    monthlyMap.set(key, current);
  }

  const monthlyData = Array.from(monthlyMap.entries())
    .map(([month, values]) => ({ month, ...values }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);

  return {
    totalSessions: total,
    attended,
    absent,
    attendancePercentage: percentage,
    monthlyData,
  };
}

// ============================================================
// PLAYER DRILL SUMMARY
// ============================================================

export async function fetchPlayerDrillSummary(
  academyId: UUID,
  playerId: UUID,
): Promise<PlayerDrillSummary> {
  const assignments = await unwrap<any[]>(
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
      .order('assigned_at', { ascending: false }),
  );

  const assigned = assignments.length;
  const completed = assignments.filter((a) => a.status === 'completed').length;
  const pending = assigned - completed;
  const completionPercentage = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;

  const recentAssignments = assignments.slice(0, 10).map((a) => ({
    id: a.id,
    drillName: a.drills?.name ?? 'Unknown',
    category: a.drills?.category ?? 'general',
    status: a.status,
    assignedAt: a.assigned_at,
    dueDate: a.due_date,
  }));

  return {
    assigned,
    completed,
    pending,
    completionPercentage,
    recentAssignments,
  };
}

// ============================================================
// PLAYER CAREER HIGHLIGHTS
// ============================================================

export async function fetchPlayerCareerHighlights(
  academyId: UUID,
  playerId: UUID,
): Promise<PlayerCareerHighlight[]> {
  const stats = await fetchPlayerStatistics(academyId, playerId);
  const highlights: PlayerCareerHighlight[] = [];

  if (!stats) return highlights;

  // Highest score
  if (stats.battingHighestScore && stats.battingHighestScore > 0) {
    highlights.push({
      type: 'highest_score',
      label: 'Highest Score',
      value: stats.battingHighestScore.toString(),
      matchId: null,
      matchName: null,
    });
  }

  // Best bowling
  if (stats.bowlingBestBowling) {
    highlights.push({
      type: 'best_bowling',
      label: 'Best Bowling',
      value: stats.bowlingBestBowling,
      matchId: null,
      matchName: null,
    });
  }

  // Most runs
  highlights.push({
    type: 'total_runs',
    label: 'Total Runs',
    value: stats.battingRuns.toString(),
    matchId: null,
    matchName: null,
  });

  // Most wickets
  highlights.push({
    type: 'total_wickets',
    label: 'Total Wickets',
    value: stats.bowlingWickets.toString(),
    matchId: null,
    matchName: null,
  });

  // Most catches
  highlights.push({
    type: 'total_catches',
    label: 'Total Catches',
    value: stats.fieldingCatches.toString(),
    matchId: null,
    matchName: null,
  });

  // Player of the match awards
  if (stats.awardsPlayerOfMatch > 0) {
    highlights.push({
      type: 'player_of_match',
      label: 'Player of the Match',
      value: stats.awardsPlayerOfMatch.toString(),
      matchId: null,
      matchName: null,
    });
  }

  return highlights;
}

// ============================================================
// PLAYER CHART DATA
// ============================================================

export async function fetchPlayerChartData(
  academyId: UUID,
  playerId: UUID,
): Promise<PlayerChartData> {
  const matches = await fetchPlayerMatches(academyId, playerId);

  const runsByMatch = matches
    .filter((m) => m.batting)
    .map((m) => ({
      matchName: m.matchName,
      matchDate: m.matchDate,
      runs: m.batting!.runs,
    }));

  const wicketsByMatch = matches
    .filter((m) => m.bowling)
    .map((m) => ({
      matchName: m.matchName,
      matchDate: m.matchDate,
      wickets: m.bowling!.wickets,
    }));

  const strikeRateTrend = matches
    .filter((m) => m.batting && m.batting.balls > 0)
    .map((m) => ({
      matchName: m.matchName,
      matchDate: m.matchDate,
      strikeRate: parseFloat(((m.batting!.runs / m.batting!.balls) * 100).toFixed(2)),
    }));

  const economyTrend = matches
    .filter((m) => m.bowling && m.bowling.overs > 0)
    .map((m) => ({
      matchName: m.matchName,
      matchDate: m.matchDate,
      economy: parseFloat((m.bowling!.runsConceded / m.bowling!.overs).toFixed(2)),
    }));

  const attendanceSummary = await fetchPlayerAttendanceSummary(academyId, playerId);
  const attendanceTrend = attendanceSummary.monthlyData.map((md: { month: string; attended: number; total: number }) => ({
    month: md.month,
    percentage: Math.round((md.attended / md.total) * 100),
  }));

  return {
    runsByMatch,
    wicketsByMatch,
    strikeRateTrend,
    economyTrend,
    attendanceTrend,
  };
}