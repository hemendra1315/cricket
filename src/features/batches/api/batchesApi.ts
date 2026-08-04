/* eslint-disable @typescript-eslint/no-explicit-any */
import { unwrap } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';
import type { AcademyMember, UUID } from '@/types';
import type { Batch, BatchPlayer, CreateBatchInput, UpdateBatchInput } from './batchesTypes';

const BATCH_COLUMNS = `id, academy_id, name, age_group, description, training_days, training_time, coach_id, created_at, updated_at, coach:academy_members!inner(id, role, status, profiles!academy_members_user_id_fkey!inner(full_name, email, avatar_url))`;

function toBatch(row: any): Batch {
  return {
    id: row.id,
    academyId: row.academy_id,
    name: row.name,
    ageGroup: row.age_group,
    description: row.description,
    trainingDays: row.training_days,
    trainingTime: row.training_time,
    coachId: row.coach_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    coach: {
      id: row.coach.id,
      fullName: row.coach.profiles?.full_name ?? null,
      email: row.coach.profiles?.email ?? '',
      avatarUrl: row.coach.profiles?.avatar_url ?? null,
    },
    playerCount: row.player_count ?? 0,
  };
}

function toBatchPlayer(row: any): BatchPlayer {
  return {
    id: row.id,
    batchId: row.batch_id,
    academyMemberId: row.academy_member_id,
    joinedAt: row.joined_at,
    fullName: row.academy_members?.profiles?.full_name ?? null,
    email: row.academy_members?.profiles?.email ?? '',
    avatarUrl: row.academy_members?.profiles?.avatar_url ?? null,
    role: row.academy_members?.role,
    status: row.academy_members?.status,
  };
}

export async function fetchAcademyBatches(academyId: UUID): Promise<Batch[]> {
  const rows = await unwrap<any[]>(
    (supabase as any)
      .from('batches')
      .select(`${BATCH_COLUMNS}, player_count:batch_members!left(count)`)
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false }),
  );

  return rows.map((row) => toBatch(row));
}

export async function fetchBatchPlayers(batchId: UUID): Promise<BatchPlayer[]> {
  const rows = await unwrap<any[]>(
    (supabase as any)
      .from('batch_members')
      .select(
        'id, batch_id, academy_member_id, joined_at, academy_members!batch_members_academy_member_id_fkey( id, role, status, profiles!academy_members_user_id_fkey!inner(full_name, email, avatar_url) )',
      )
      .eq('batch_id', batchId)
      .order('joined_at', { ascending: true }),
  );

  return rows.map(toBatchPlayer);
}

export async function createBatch(input: CreateBatchInput): Promise<Batch> {
  const row = await unwrap<any>(
    (supabase as any)
      .from('batches')
      .insert({
        academy_id: input.academyId,
        name: input.name,
        age_group: input.ageGroup,
        description: input.description,
        training_days: input.trainingDays,
        training_time: input.trainingTime,
        coach_id: input.coachId,
      })
      .select(BATCH_COLUMNS)
      .single(),
  );
  return toBatch(row);
}

export async function updateBatch(batchId: UUID, input: UpdateBatchInput): Promise<Batch> {
  const row = await unwrap<any>(
    (supabase as any)
      .from('batches')
      .update({
        name: input.name,
        age_group: input.ageGroup,
        description: input.description,
        training_days: input.trainingDays,
        training_time: input.trainingTime,
        coach_id: input.coachId,
      })
      .eq('id', batchId)
      .select(BATCH_COLUMNS)
      .single(),
  );
  return toBatch(row);
}

export async function deleteBatch(batchId: UUID): Promise<void> {
  await unwrap((supabase as any).from('batches').delete().eq('id', batchId));
}

export async function fetchBatchAvailablePlayers(academyId: UUID): Promise<AcademyMember[]> {
  const rows = await unwrap<any[]>(
    supabase
      .from('academy_members')
      .select(
        'id, academy_id, user_id, role, status, joined_at, profiles!academy_members_user_id_fkey!inner(full_name, email, avatar_url)',
      )
      .eq('academy_id', academyId)
      .eq('status', 'active')
      .order('profiles.full_name', { ascending: true }),
  );
  return rows.map((row) => ({
    id: row.id,
    academyId: row.academy_id,
    userId: row.user_id,
    role: row.role,
    status: row.status,
    joinedAt: row.joined_at,
    fullName: row.profiles?.full_name ?? null,
    email: row.profiles?.email ?? '',
    avatarUrl: row.profiles?.avatar_url ?? null,
    phone: null,
  }));
}

export async function addPlayerToBatch(batchId: UUID, academyMemberId: UUID): Promise<void> {
  await unwrap(
    (supabase as any)
      .from('batch_members')
      .insert({ batch_id: batchId, academy_member_id: academyMemberId })
      .select('id')
      .single(),
  );
}

export async function removePlayerFromBatch(batchMemberId: UUID): Promise<void> {
  await unwrap((supabase as any).from('batch_members').delete().eq('id', batchMemberId));
}
