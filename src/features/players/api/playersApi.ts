import { rpc, unwrap } from '@/lib/api';
import { supabase } from '@/lib/supabase/client';
import type { Player, UUID } from '@/types';
import type { BattingStyle, PlayerRole, SkillLevel } from '@/types/enums';

type PlayerRow = {
  id: string;
  academy_id: string;
  user_id: string | null;
  player_code: string | null;
  date_of_birth: string | null;
  batting_style: string | null;
  bowling_style: string | null;
  player_role: string | null;
  skill_level: SkillLevel;
  jersey_number: number | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;
  emergency_contact: string | null;
  medical_notes: string | null;
  joined_on: string;
  is_active: boolean;
  profiles: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    phone: string | null;
  } | null;
};

// A left embed, not `!inner`: offline-managed players have no linked profile.
const PLAYER_COLUMNS = `id, academy_id, user_id, player_code, date_of_birth, batting_style,
  bowling_style, player_role, skill_level, jersey_number, guardian_name, guardian_phone,
  guardian_email, emergency_contact, medical_notes, joined_on, is_active,
  profiles(full_name, email, avatar_url, phone)`;

function toPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    academyId: row.academy_id,
    userId: row.user_id,
    playerCode: row.player_code,
    dateOfBirth: row.date_of_birth,
    battingStyle: (row.batting_style as BattingStyle | null) ?? null,
    bowlingStyle: row.bowling_style,
    playerRole: (row.player_role as PlayerRole | null) ?? null,
    skillLevel: row.skill_level,
    jerseyNumber: row.jersey_number,
    guardianName: row.guardian_name,
    guardianPhone: row.guardian_phone,
    guardianEmail: row.guardian_email,
    emergencyContact: row.emergency_contact,
    medicalNotes: row.medical_notes,
    joinedOn: row.joined_on,
    isActive: row.is_active,
    fullName: row.profiles?.full_name ?? null,
    email: row.profiles?.email ?? null,
    avatarUrl: row.profiles?.avatar_url ?? null,
    phone: row.profiles?.phone ?? null,
  };
}

export type PlayerFilters = { skillLevel?: SkillLevel; activeOnly?: boolean; search?: string };

/**
 * Academy roster. RLS limits rows to staff of `academyId` (and a player's own
 * row), so the academy filter is an optimisation rather than the isolation.
 */
export async function fetchPlayers(
  academyId: UUID,
  filters: PlayerFilters = {},
): Promise<Player[]> {
  let query = supabase.from('players').select(PLAYER_COLUMNS).eq('academy_id', academyId);
  if (filters.skillLevel) query = query.eq('skill_level', filters.skillLevel);
  if (filters.activeOnly) query = query.eq('is_active', true);

  const rows = await unwrap<PlayerRow[]>(query.order('created_at', { ascending: true }));
  const players = rows.map(toPlayer);
  const search = filters.search?.trim().toLowerCase();
  if (!search) return players;

  // Client-side because the searchable text lives on the embedded profile;
  // a trigram index on a people view can replace this once rosters grow.
  return players.filter((player) =>
    [player.fullName, player.email, player.playerCode]
      .filter(Boolean)
      .some((value) => (value as string).toLowerCase().includes(search)),
  );
}

export async function fetchPlayer(academyId: UUID, playerId: UUID): Promise<Player> {
  const row = await unwrap<PlayerRow>(
    supabase
      .from('players')
      .select(PLAYER_COLUMNS)
      .eq('academy_id', academyId)
      .eq('id', playerId)
      .single(),
  );
  return toPlayer(row);
}

/** The signed-in user's own player row, if they are a player here. */
export async function fetchMyPlayer(academyId: UUID, userId: UUID): Promise<Player | null> {
  const { data, error } = await supabase
    .from('players')
    .select(PLAYER_COLUMNS)
    .eq('academy_id', academyId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? toPlayer(data as unknown as PlayerRow) : null;
}

export type UpdatePlayerInput = {
  playerCode?: string | null;
  dateOfBirth?: string | null;
  battingStyle?: BattingStyle | null;
  bowlingStyle?: string | null;
  playerRole?: PlayerRole | null;
  skillLevel?: SkillLevel;
  jerseyNumber?: number | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  guardianEmail?: string | null;
  emergencyContact?: string | null;
  medicalNotes?: string | null;
  isActive?: boolean;
};

/** Staff edit: the full field set, rejected by RLS for anyone but an owner. */
export async function updatePlayer(playerId: UUID, input: UpdatePlayerInput): Promise<Player> {
  const row = await unwrap<PlayerRow>(
    supabase
      .from('players')
      .update({
        player_code: input.playerCode,
        date_of_birth: input.dateOfBirth,
        batting_style: input.battingStyle,
        bowling_style: input.bowlingStyle,
        player_role: input.playerRole,
        skill_level: input.skillLevel,
        jersey_number: input.jerseyNumber,
        guardian_name: input.guardianName,
        guardian_phone: input.guardianPhone,
        guardian_email: input.guardianEmail,
        emergency_contact: input.emergencyContact,
        medical_notes: input.medicalNotes,
        ...(input.isActive === undefined ? {} : { is_active: input.isActive }),
      })
      .eq('id', playerId)
      .select(PLAYER_COLUMNS)
      .single(),
  );
  return toPlayer(row);
}

/**
 * Self-service edit. Goes through the RPC because the writable column set is
 * narrower than the owner's and is enforced in the database, not here.
 */
export async function updateMyPlayerProfile(
  academyId: UUID,
  input: Omit<UpdatePlayerInput, 'playerCode' | 'skillLevel' | 'medicalNotes' | 'isActive'>,
): Promise<Player> {
  const row = await rpc<PlayerRow>('update_my_player_profile', {
    p_academy: academyId,
    p_date_of_birth: input.dateOfBirth ?? null,
    p_batting_style: input.battingStyle ?? null,
    p_bowling_style: input.bowlingStyle ?? null,
    p_player_role: input.playerRole ?? null,
    p_jersey_number: input.jerseyNumber ?? null,
    p_guardian_name: input.guardianName ?? null,
    p_guardian_phone: input.guardianPhone ?? null,
    p_guardian_email: input.guardianEmail ?? null,
    p_emergency_contact: input.emergencyContact ?? null,
  });
  return toPlayer({ ...row, profiles: null });
}
