import { describe, expect, it } from 'vitest';

import {
  batchFormSchema,
  coachProfileFormSchema,
  createAcademyFormSchema,
  joinAcademyFormSchema,
  joinCodeSchema,
  playerProfileFormSchema,
} from './validators';

describe('joinCodeSchema', () => {
  it('normalises casing and surrounding whitespace', () => {
    expect(joinCodeSchema.parse('  abc123 ')).toBe('ABC123');
  });

  it('rejects letters excluded from the Crockford alphabet', () => {
    for (const code of ['MUM001', 'ILO123', 'AOB123']) {
      expect(joinCodeSchema.safeParse(code).success).toBe(false);
    }
  });

  it('rejects codes outside the 6–8 character range', () => {
    expect(joinCodeSchema.safeParse('ABC12').success).toBe(false);
    expect(joinCodeSchema.safeParse('ABC123456').success).toBe(false);
  });
});

describe('joinAcademyFormSchema', () => {
  it('accepts a code without a message', () => {
    expect(joinAcademyFormSchema.parse({ code: 'chE001', message: '' }).code).toBe('CHE001');
  });
});

describe('createAcademyFormSchema', () => {
  it('requires a usable name and a known fee mode', () => {
    expect(
      createAcademyFormSchema.safeParse({
        name: 'A',
        timezone: 'Asia/Kolkata',
        feeMode: 'player_pays',
      }).success,
    ).toBe(false);

    expect(
      createAcademyFormSchema.safeParse({
        name: 'Chennai Academy',
        timezone: 'Asia/Kolkata',
        feeMode: 'someone_else_pays',
      }).success,
    ).toBe(false);

    expect(
      createAcademyFormSchema.parse({
        name: '  Chennai Academy ',
        city: 'Chennai',
        timezone: 'Asia/Kolkata',
        feeMode: 'academy_pays',
      }).name,
    ).toBe('Chennai Academy');
  });
});

const player = {
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

describe('playerProfileFormSchema', () => {
  it('accepts an untouched profile', () => {
    expect(playerProfileFormSchema.safeParse(player).success).toBe(true);
  });

  it('rejects a jersey number that is not a whole number in range', () => {
    expect(playerProfileFormSchema.safeParse({ ...player, jerseyNumber: '1000' }).success).toBe(
      false,
    );
    expect(playerProfileFormSchema.safeParse({ ...player, jerseyNumber: '7.5' }).success).toBe(
      false,
    );
    expect(playerProfileFormSchema.safeParse({ ...player, jerseyNumber: '12' }).success).toBe(true);
  });

  it('validates guardian contact details when provided', () => {
    expect(playerProfileFormSchema.safeParse({ ...player, guardianPhone: '12345' }).success).toBe(
      false,
    );
    expect(
      playerProfileFormSchema.safeParse({ ...player, guardianPhone: '9876543210' }).success,
    ).toBe(true);
    expect(playerProfileFormSchema.safeParse({ ...player, guardianEmail: 'nope' }).success).toBe(
      false,
    );
  });
});

describe('coachProfileFormSchema', () => {
  it('accepts an empty experience field but not a negative one', () => {
    const base = { bio: '', experienceYears: '', specialization: [] };

    expect(coachProfileFormSchema.safeParse(base).success).toBe(true);
    expect(coachProfileFormSchema.safeParse({ ...base, experienceYears: '-2' }).success).toBe(
      false,
    );
    expect(coachProfileFormSchema.safeParse({ ...base, experienceYears: '12' }).success).toBe(true);
  });
});

describe('batchFormSchema', () => {
  const batch = {
    name: 'Morning U16',
    description: '',
    ageGroup: 'U16',
    skillLevel: '',
    venueId: '',
    capacity: '',
    monthlyFeeRupees: '',
    startDate: '',
    endDate: '',
  };

  it('requires a usable name', () => {
    expect(batchFormSchema.safeParse({ ...batch, name: 'A' }).success).toBe(false);
    expect(batchFormSchema.safeParse(batch).success).toBe(true);
  });

  it('rejects an end date before the start date', () => {
    expect(
      batchFormSchema.safeParse({ ...batch, startDate: '2026-03-01', endDate: '2026-02-01' })
        .success,
    ).toBe(false);
    expect(
      batchFormSchema.safeParse({ ...batch, startDate: '2026-03-01', endDate: '2026-03-01' })
        .success,
    ).toBe(true);
  });

  it('rejects a capacity of zero', () => {
    expect(batchFormSchema.safeParse({ ...batch, capacity: '0' }).success).toBe(false);
    expect(batchFormSchema.safeParse({ ...batch, capacity: '20' }).success).toBe(true);
  });
});
