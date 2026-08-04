/* eslint-disable @typescript-eslint/no-explicit-any */
import { unwrap } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';
import type { UUID } from '@/types';
import type {
  CreateDrillAssignmentInput,
  CreateDrillInput,
  Drill,
  DrillAssignment,
  UpdateDrillAssignmentInput,
  UpdateDrillInput,
} from './drillsTypes';

const DRILL_COLUMNS = `
  id,
  academy_id,
  name,
  category,
  description,
  duration_minutes,
  difficulty,
  created_by,
  created_at,
  updated_at
`;

const ASSIGNMENT_COLUMNS = `
  id,
  academy_id,
  drill_id,
  player_id,
  batch_id,
  status,
  assigned_by,
  assigned_date,
  due_date,
  created_by,
  updated_at,
  drill:drills(id, name, category, description, duration_minutes, difficulty),
  batch:batches(id, name),
  player:academy_members(id, user_id, profiles!academy_members_user_id_fkey!inner(full_name, email, avatar_url))
`;

function toDrill(row: any): Drill {
  return {
    id: row.id,
    academyId: row.academy_id,
    name: row.name,
    category: row.category,
    description: row.description,
    durationMinutes: row.duration_minutes,
    difficulty: row.difficulty,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDrillAssignment(row: any): DrillAssignment {
  return {
    id: row.id,
    academyId: row.academy_id,
    drillId: row.drill_id,
    drill: {
      id: row.drill?.id,
      name: row.drill?.name ?? '',
      category: row.drill?.category,
      description: row.drill?.description ?? null,
      durationMinutes: row.drill?.duration_minutes ?? null,
      difficulty: row.drill?.difficulty,
    },
    playerId: row.player_id,
    playerName: row.player?.profiles?.full_name ?? row.player?.profiles?.email ?? null,
    batchId: row.batch_id,
    batchName: row.batch?.name ?? null,
    status: row.status,
    assignedBy: row.assigned_by,
    assignedAt: row.assigned_date,
    dueDate: row.due_date,
    createdBy: row.created_by,
    updatedAt: row.updated_at,
  };
}

export async function fetchAcademyDrills(academyId: UUID): Promise<Drill[]> {
  const rows = await unwrap<any[]>(
    (supabase as any)
      .from('drills')
      .select(DRILL_COLUMNS)
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false }),
  );
  return rows.map(toDrill);
}

export async function createDrill(input: CreateDrillInput): Promise<Drill> {
  const row = await unwrap<any>(
    (supabase as any)
      .from('drills')
      .insert({
        academy_id: input.academyId,
        name: input.name,
        category: input.category,
        description: input.description,
        duration_minutes: input.durationMinutes,
        difficulty: input.difficulty,
        created_by: null,
      })
      .select(DRILL_COLUMNS)
      .single(),
  );
  return toDrill(row);
}

export async function updateDrill(drillId: UUID, input: UpdateDrillInput): Promise<Drill> {
  const row = await unwrap<any>(
    (supabase as any)
      .from('drills')
      .update({
        name: input.name,
        category: input.category,
        description: input.description,
        duration_minutes: input.durationMinutes,
        difficulty: input.difficulty,
      })
      .eq('id', drillId)
      .select(DRILL_COLUMNS)
      .single(),
  );
  return toDrill(row);
}

export async function deleteDrill(drillId: UUID): Promise<void> {
  await unwrap((supabase as any).from('drills').delete().eq('id', drillId).select('id').single());
}

export async function fetchDrillAssignments(academyId: UUID): Promise<DrillAssignment[]> {
  const rows = await unwrap<any[]>(
    (supabase as any)
      .from('drill_assignments')
      .select(ASSIGNMENT_COLUMNS)
      .eq('academy_id', academyId)
      .order('assigned_date', { ascending: false }),
  );
  return rows.map(toDrillAssignment);
}

export async function fetchPlayerDrillAssignments(
  playerId: UUID,
  academyId: UUID,
): Promise<DrillAssignment[]> {
  const rows = await unwrap<any[]>(
    (supabase as any)
      .from('drill_assignments')
      .select(ASSIGNMENT_COLUMNS)
      .eq('academy_id', academyId)
      .eq('player_id', playerId)
      .order('assigned_date', { ascending: false }),
  );
  return rows.map(toDrillAssignment);
}

export async function assignDrill(input: CreateDrillAssignmentInput): Promise<DrillAssignment> {
  const row = await unwrap<any>(
    (supabase as any)
      .from('drill_assignments')
      .insert({
        academy_id: input.academyId,
        drill_id: input.drillId,
        player_id: input.playerId,
        batch_id: input.batchId,
        due_date: input.dueDate,
        status: input.status ?? 'assigned',
        assigned_by: null,
        assigned_date: new Date().toISOString(),
      })
      .select(ASSIGNMENT_COLUMNS)
      .single(),
  );
  return toDrillAssignment(row);
}

export async function updateDrillAssignment(
  assignmentId: UUID,
  input: UpdateDrillAssignmentInput,
): Promise<DrillAssignment> {
  const row = await unwrap<any>(
    (supabase as any)
      .from('drill_assignments')
      .update({
        status: input.status,
        due_date: input.dueDate,
      })
      .eq('id', assignmentId)
      .select(ASSIGNMENT_COLUMNS)
      .single(),
  );
  return toDrillAssignment(row);
}

export async function deleteDrillAssignment(assignmentId: UUID): Promise<void> {
  await unwrap(
    (supabase as any)
      .from('drill_assignments')
      .delete()
      .eq('id', assignmentId)
      .select('id')
      .single(),
  );
}
