import { describe, expect, it } from 'vitest';

import type { BatchFormValues } from '@/lib/validators';
import type { Batch } from '@/types';

import { toBatchFormValues, toBatchInput } from './toBatchInput';

const values: BatchFormValues = {
  name: '  Morning U16 ',
  description: '',
  ageGroup: 'U16',
  skillLevel: '',
  venueId: '',
  capacity: '',
  monthlyFeeRupees: '',
  startDate: '',
  endDate: '',
};

const batch: Batch = {
  id: 'b1',
  academyId: 'a1',
  name: 'Morning U16',
  description: null,
  ageGroup: 'U16',
  skillLevel: 'intermediate',
  venueId: 'v1',
  venueName: 'Main ground',
  capacity: 20,
  monthlyFeePaise: 25_000,
  startDate: '2026-01-05',
  endDate: null,
  isActive: true,
  playerCount: 3,
  coachCount: 1,
};

describe('toBatchInput', () => {
  it('trims the name and nulls out the fields left blank', () => {
    const input = toBatchInput(values);

    expect(input.name).toBe('Morning U16');
    expect(input.skillLevel).toBeNull();
    expect(input.venueId).toBeNull();
    expect(input.capacity).toBeNull();
    expect(input.monthlyFeePaise).toBeNull();
    expect(input.startDate).toBeNull();
  });

  it('converts the fee from rupees to paise', () => {
    expect(toBatchInput({ ...values, monthlyFeeRupees: '250' }).monthlyFeePaise).toBe(25_000);
    expect(toBatchInput({ ...values, monthlyFeeRupees: '0' }).monthlyFeePaise).toBe(0);
  });

  it('round-trips an existing batch through the form', () => {
    const input = toBatchInput(toBatchFormValues(batch));

    expect(input).toMatchObject({
      name: batch.name,
      ageGroup: batch.ageGroup,
      skillLevel: batch.skillLevel,
      venueId: batch.venueId,
      capacity: batch.capacity,
      monthlyFeePaise: batch.monthlyFeePaise,
      startDate: batch.startDate,
      endDate: null,
    });
  });
});
