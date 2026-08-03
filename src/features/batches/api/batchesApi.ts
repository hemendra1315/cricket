import { rpc, unwrap } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';
import type { Batch, BatchCoach, BatchPlayer, UUID, Venue } from '@/types';
import type { SkillLevel } from '@/types/enums';

type BatchRow = {
  id: string;
  academy_id: string;
  name: string;
  description: string | null;
  age_group: string | null;
  skill_level: SkillLevel | null;
  venue_id: string | null;
  capacity: number | null;
  monthly_fee_paise: number | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  venues: { name: string } | null;
  // Aggregate embeds; `batch_players` is filtered to the active roster below.
  batch_players: { count: number }[];
  batch_coaches: { count: number }[];
};

// Counting through an embed keeps the list to one request; the `left_at` filter
// is applied to the embedded table so a released player is not counted.
const BATCH_LIST_COLUMNS = `id, academy_id, name, description, age_group, skill_level, venue_id,
  capacity, monthly_fee_paise, start_date, end_date, is_active,
  venues(name),
  batch_players(count),
  batch_coaches(count)`;

function count(embed: { count: number }[]): number {
  return embed[0]?.count ?? 0;
}

function toBatch(row: BatchRow): Batch {
  return {
    id: row.id,
    academyId: row.academy_id,
    name: row.name,
    description: row.description,
    ageGroup: row.age_group,
    skillLevel: row.skill_level,
    venueId: row.venue_id,
    venueName: row.venues?.name ?? null,
    capacity: row.capacity,
    monthlyFeePaise: row.monthly_fee_paise,
    startDate: row.start_date,
    endDate: row.end_date,
    isActive: row.is_active,
    playerCount: count(row.batch_players),
    coachCount: count(row.batch_coaches),
  };
}

export async function fetchBatches(academyId: UUID, activeOnly = true): Promise<Batch[]> {
  let query = supabase
    .from('batches')
    .select(BATCH_LIST_COLUMNS)
    .eq('academy_id', academyId)
    .is('deleted_at', null)
    .is('batch_players.left_at', null)
    .order('name', { ascending: true });

  if (activeOnly) query = query.eq('is_active', true);

  const rows = await unwrap<BatchRow[]>(query);
  return rows.map(toBatch);
}

export async function fetchBatch(academyId: UUID, batchId: UUID): Promise<Batch> {
  const row = await unwrap<BatchRow>(
    supabase
      .from('batches')
      .select(BATCH_LIST_COLUMNS)
      .eq('academy_id', academyId)
      .eq('id', batchId)
      .is('deleted_at', null)
      .is('batch_players.left_at', null)
      .single(),
  );
  return toBatch(row);
}

export type BatchInput = {
  name: string;
  description: string | null;
  ageGroup: string | null;
  skillLevel: SkillLevel | null;
  venueId: UUID | null;
  capacity: number | null;
  monthlyFeePaise: number | null;
  startDate: string | null;
  endDate: string | null;
};

export async function createBatch(academyId: UUID, input: BatchInput): Promise<UUID> {
  const row = await unwrap<{ id: string }>(
    supabase
      .from('batches')
      .insert({
        academy_id: academyId,
        name: input.name,
        description: input.description,
        age_group: input.ageGroup,
        skill_level: input.skillLevel,
        venue_id: input.venueId,
        capacity: input.capacity,
        monthly_fee_paise: input.monthlyFeePaise,
        start_date: input.startDate,
        end_date: input.endDate,
      })
      .select('id')
      .single(),
  );
  return row.id;
}

export async function updateBatch(
  batchId: UUID,
  input: Partial<BatchInput> & { isActive?: boolean },
): Promise<void> {
  await unwrap(
    supabase
      .from('batches')
      .update({
        ...(input.name === undefined ? {} : { name: input.name }),
        ...(input.description === undefined ? {} : { description: input.description }),
        ...(input.ageGroup === undefined ? {} : { age_group: input.ageGroup }),
        ...(input.skillLevel === undefined ? {} : { skill_level: input.skillLevel }),
        ...(input.venueId === undefined ? {} : { venue_id: input.venueId }),
        ...(input.capacity === undefined ? {} : { capacity: input.capacity }),
        ...(input.monthlyFeePaise === undefined
          ? {}
          : { monthly_fee_paise: input.monthlyFeePaise }),
        ...(input.startDate === undefined ? {} : { start_date: input.startDate }),
        ...(input.endDate === undefined ? {} : { end_date: input.endDate }),
        ...(input.isActive === undefined ? {} : { is_active: input.isActive }),
      })
      .eq('id', batchId)
      .select('id')
      .single(),
  );
}

/** Soft delete: the RPC also releases the roster, so history survives. */
export async function deleteBatch(batchId: UUID): Promise<void> {
  await rpc<unknown>('delete_batch', { p_batch: batchId });
}

// ------------------------------------------------------------------ rosters --

type BatchCoachRow = {
  batch_id: string;
  coach_id: string;
  is_primary: boolean;
  coaches: {
    profiles: { full_name: string | null; email: string; avatar_url: string | null } | null;
  } | null;
};

export async function fetchBatchCoaches(batchId: UUID): Promise<BatchCoach[]> {
  const rows = await unwrap<BatchCoachRow[]>(
    supabase
      .from('batch_coaches')
      .select('batch_id, coach_id, is_primary, coaches(profiles(full_name, email, avatar_url))')
      .eq('batch_id', batchId)
      .order('is_primary', { ascending: false }),
  );

  return rows.map((row) => ({
    batchId: row.batch_id,
    coachId: row.coach_id,
    isPrimary: row.is_primary,
    fullName: row.coaches?.profiles?.full_name ?? null,
    email: row.coaches?.profiles?.email ?? null,
    avatarUrl: row.coaches?.profiles?.avatar_url ?? null,
  }));
}

type BatchPlayerRow = {
  id: string;
  batch_id: string;
  player_id: string;
  joined_at: string;
  players: {
    player_code: string | null;
    skill_level: SkillLevel;
    profiles: { full_name: string | null; email: string; avatar_url: string | null } | null;
  } | null;
};

export async function fetchBatchPlayers(batchId: UUID): Promise<BatchPlayer[]> {
  const rows = await unwrap<BatchPlayerRow[]>(
    supabase
      .from('batch_players')
      .select(
        `id, batch_id, player_id, joined_at,
         players(player_code, skill_level, profiles(full_name, email, avatar_url))`,
      )
      .eq('batch_id', batchId)
      .is('left_at', null)
      .order('joined_at', { ascending: true }),
  );

  return rows.map((row) => ({
    id: row.id,
    batchId: row.batch_id,
    playerId: row.player_id,
    joinedAt: row.joined_at,
    playerCode: row.players?.player_code ?? null,
    skillLevel: row.players?.skill_level ?? 'beginner',
    fullName: row.players?.profiles?.full_name ?? null,
    email: row.players?.profiles?.email ?? null,
    avatarUrl: row.players?.profiles?.avatar_url ?? null,
  }));
}

/** Returns how many players were actually added (duplicates are skipped). */
export async function addPlayersToBatch(batchId: UUID, playerIds: UUID[]): Promise<number> {
  return (await rpc<number>('add_players_to_batch', {
    p_batch: batchId,
    p_players: playerIds,
  })) as number;
}

export async function removePlayerFromBatch(batchId: UUID, playerId: UUID): Promise<void> {
  await rpc<unknown>('remove_player_from_batch', { p_batch: batchId, p_player: playerId });
}

export async function assignCoachToBatch(
  batchId: UUID,
  coachId: UUID,
  isPrimary = false,
): Promise<void> {
  await rpc<unknown>('assign_coach_to_batch', {
    p_batch: batchId,
    p_coach: coachId,
    p_is_primary: isPrimary,
  });
}

export async function removeCoachFromBatch(batchId: UUID, coachId: UUID): Promise<void> {
  await rpc<unknown>('remove_coach_from_batch', { p_batch: batchId, p_coach: coachId });
}

// ------------------------------------------------------------------- venues --

export async function fetchVenues(academyId: UUID): Promise<Venue[]> {
  const rows = await unwrap<
    {
      id: string;
      academy_id: string;
      name: string;
      address: string | null;
      nets_count: number | null;
    }[]
  >(
    supabase
      .from('venues')
      .select('id, academy_id, name, address, nets_count')
      .eq('academy_id', academyId)
      .order('name', { ascending: true }),
  );

  return rows.map((row) => ({
    id: row.id,
    academyId: row.academy_id,
    name: row.name,
    address: row.address,
    netsCount: row.nets_count,
  }));
}
