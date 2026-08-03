import type { PlayerProfileFormValues } from '@/lib/validators';
import type { BattingStyle, PlayerRole } from '@/types/enums';

import type { UpdatePlayerInput } from '../api/playersApi';

/**
 * Form values to a database update. Blank inputs become `null` rather than empty
 * strings so cleared fields really clear, and citext/date columns stay valid.
 */
export function toPlayerInput(
  values: PlayerProfileFormValues,
): Required<Omit<UpdatePlayerInput, 'isActive'>> {
  const text = (value: string | undefined): string | null => {
    const trimmed = value?.trim() ?? '';
    return trimmed === '' ? null : trimmed;
  };

  return {
    playerCode: text(values.playerCode),
    dateOfBirth: text(values.dateOfBirth),
    battingStyle: (text(values.battingStyle) as BattingStyle | null) ?? null,
    bowlingStyle: text(values.bowlingStyle),
    playerRole: (text(values.playerRole) as PlayerRole | null) ?? null,
    skillLevel: values.skillLevel,
    jerseyNumber: values.jerseyNumber.trim() === '' ? null : Number(values.jerseyNumber),
    guardianName: text(values.guardianName),
    guardianPhone: text(values.guardianPhone),
    guardianEmail: text(values.guardianEmail),
    emergencyContact: text(values.emergencyContact),
    medicalNotes: text(values.medicalNotes),
  };
}
