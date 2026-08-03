import { describe, expect, it } from 'vitest';

import type { PlayerProfileFormValues } from '@/lib/validators';

import { toPlayerInput } from './toPlayerInput';

const base: PlayerProfileFormValues = {
  dateOfBirth: '',
  battingStyle: '',
  bowlingStyle: '',
  playerRole: '',
  jerseyNumber: '',
  guardianName: '',
  guardianPhone: '',
  guardianEmail: '',
  emergencyContact: '',
  playerCode: '',
  skillLevel: 'beginner',
  medicalNotes: '',
};

describe('toPlayerInput', () => {
  it('sends null for cleared fields rather than empty strings', () => {
    const input = toPlayerInput(base);

    expect(input.dateOfBirth).toBeNull();
    expect(input.battingStyle).toBeNull();
    expect(input.playerRole).toBeNull();
    expect(input.guardianEmail).toBeNull();
    expect(input.playerCode).toBeNull();
  });

  it('keeps a blank jersey number null instead of turning it into zero', () => {
    expect(toPlayerInput(base).jerseyNumber).toBeNull();
    expect(toPlayerInput({ ...base, jerseyNumber: '0' }).jerseyNumber).toBe(0);
    expect(toPlayerInput({ ...base, jerseyNumber: '7' }).jerseyNumber).toBe(7);
  });

  it('trims text and preserves the selected values', () => {
    const input = toPlayerInput({
      ...base,
      guardianName: '  Asha  ',
      battingStyle: 'left_hand',
      playerRole: 'all_rounder',
      skillLevel: 'advanced',
    });

    expect(input.guardianName).toBe('Asha');
    expect(input.battingStyle).toBe('left_hand');
    expect(input.playerRole).toBe('all_rounder');
    expect(input.skillLevel).toBe('advanced');
  });
});
